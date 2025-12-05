/**
 * DASHBOARD SERVIDORES
 * Arquivo principal que coordena toda a aplicação
 * Dados extraídos das folhas de pagamento da UNCISAL
 */

import { initNavbar } from '../components/navbar.js';
import { initFooter } from '../components/footer.js';
import { showLoader, hideLoader, showToast } from '../utils/feedback.js';
import { formatarMoeda, formatarCompetencia, formatarCompetenciaCurta } from '../utils/formatters.js';
import { debounce } from '../utils/debounce.js';
import {
  carregarTodasFolhas,
  filtrarFolha,
  agregarPorCompetencia,
  agregarPorLotacao,
  calcularEstatisticas,
  valoresUnicos,
  topN
} from '../services/folha-pagamento.js';
import { 
  mapearLotacao, 
  obterLotacaoPrincipal, 
  obterSublotacoes,
  SUBLOTACOES 
} from '../utils/lotacao-mapping.js';

// Estado global da aplicação
let dadosCompletos = [];
let dadosFiltrados = [];
let charts = {};
let relatorioAtual = null; // Rastreia qual relatório está aberto
let renderFunctionAtual = null; // Função de renderização do relatório atual
let evolucaoViewMode = 'ultimo'; // Modo de visualização do gráfico de evolução: 'ultimo', '3meses', 'todos'

/**
 * Inicializa a aplicação
 */
async function init() {
  try {
    // Inicializar componentes
    initNavbar();
    initFooter();
    
    // Destacar link ativo na navbar
    const navLinkEmpenhos = document.getElementById('nav-link-empenhos');
    const navLinkServidores = document.getElementById('nav-link-servidores');
    if (navLinkServidores) {
      navLinkServidores.style.opacity = '1';
      navLinkServidores.style.fontWeight = '600';
      navLinkServidores.setAttribute('aria-current', 'page');
    }
    if (navLinkEmpenhos) {
      navLinkEmpenhos.style.opacity = '0.7';
      navLinkEmpenhos.removeAttribute('aria-current');
    }
    
    showLoader('Carregando dados dos servidores...');
    
    // Carregar todos os dados com tratamento de erro melhorado
    try {
      dadosCompletos = await carregarTodasFolhas();
      dadosFiltrados = [...dadosCompletos];
      
      if (!dadosCompletos || dadosCompletos.length === 0) {
        throw new Error('Nenhum dado foi carregado. Verifique se os arquivos JSON estão na pasta converted/');
      }
      
      console.log(`✅ ${dadosCompletos.length} registros carregados`);
      
      // Atualizar status no dashboard
      const statusEl = document.getElementById('status-dados');
      if (statusEl) {
        statusEl.textContent = `${dadosCompletos.length.toLocaleString('pt-BR')} registros`;
        statusEl.setAttribute('title', `${dadosCompletos.length.toLocaleString('pt-BR')} registros carregados com sucesso`);
      }
    } catch (error) {
      hideLoader();
      console.error('Erro ao carregar dados:', error);
      
      // Exibir mensagem de erro amigável
      const errorMessage = error.message || 'Erro desconhecido ao carregar dados';
      showToast(`Erro ao carregar dados: ${errorMessage}`, 'danger', 8000);
      
      // Exibir mensagem no dashboard
      const statusEl = document.getElementById('status-dados');
      if (statusEl) {
        statusEl.textContent = 'Erro ao carregar';
        statusEl.parentElement.classList.remove('badge-success');
        statusEl.parentElement.classList.add('badge-danger');
      }
      
      // Mostrar mensagem de erro no container principal
      const dashboardMain = document.getElementById('dashboard-main');
      if (dashboardMain) {
        dashboardMain.innerHTML = `
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>Erro ao Carregar Dados
            </h4>
            <p>${errorMessage}</p>
            <hr>
            <p class="mb-0">
              <strong>Soluções possíveis:</strong>
              <ul class="mt-2 mb-0">
                <li>Verifique se os arquivos JSON estão na pasta <code>converted/</code></li>
                <li>Verifique se o servidor está rodando corretamente</li>
                <li>Abra o console do navegador (F12) para mais detalhes</li>
                <li>Recarregue a página (F5)</li>
              </ul>
            </p>
            <button class="btn btn-primary mt-3" onclick="location.reload()">
              <i class="bi bi-arrow-clockwise me-2"></i>Recarregar Página
            </button>
          </div>
        `;
      }
      
      return; // Parar execução se não houver dados
    }
    
    // Calcular período dos dados
    const competencias = valoresUnicos(dadosCompletos, 'competencia')
      .filter(c => c && c.trim() !== '')
      .sort();
    
    let periodoTexto = 'Carregando...';
    if (competencias.length > 0) {
      const primeira = competencias[0];
      const ultima = competencias[competencias.length - 1];
      const mesPrimeira = primeira.split('-')[1];
      const anoPrimeira = primeira.split('-')[0];
      const mesUltima = ultima.split('-')[1];
      const anoUltima = ultima.split('-')[0];
      
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mesNomePrimeira = meses[parseInt(mesPrimeira) - 1] || mesPrimeira;
      const mesNomeUltima = meses[parseInt(mesUltima) - 1] || mesUltima;
      
      if (primeira === ultima) {
        periodoTexto = `${mesNomePrimeira}/${anoPrimeira.substring(2)}`;
      } else {
        periodoTexto = `${mesNomePrimeira}/${anoPrimeira.substring(2)} - ${mesNomeUltima}/${anoUltima.substring(2)}`;
      }
    }
    
    // Atualizar período no navbar
    const navbarPeriodoEl = document.getElementById('navbar-periodo');
    if (navbarPeriodoEl) {
      navbarPeriodoEl.innerHTML = `
        <i class="bi bi-calendar-range"></i>
        <span>${periodoTexto}</span>
      `;
    }
    
    // Calcular total de servidores únicos
    const servidoresUnicos = new Set();
    dadosCompletos.forEach(r => {
      if (r.cpf && r.cpf.trim() !== '') {
        servidoresUnicos.add(r.cpf.trim());
      } else if (r.nome && r.nome.trim() !== '' && r.nome !== '*Totais*') {
        servidoresUnicos.add(r.nome.trim());
      }
    });
    
    // Atualizar servidores no navbar
    const navbarServidoresEl = document.getElementById('navbar-servidores');
    if (navbarServidoresEl) {
      navbarServidoresEl.innerHTML = `
        <i class="bi bi-people-fill"></i>
        <span>${servidoresUnicos.size.toLocaleString('pt-BR')} servidores</span>
      `;
    }
    
    // Inicializar interface
    preencherFiltros();
    atualizarDashboard();
    configurarEventos();
    
    hideLoader();
    showToast('Dados carregados com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao inicializar:', error);
    hideLoader();
    showToast('Erro ao carregar dados. Verifique o console.', 'danger', 5000);
  }
}

/**
 * Preenche os selects de filtros com valores únicos
 */
function preencherFiltros() {
  // Anos - extrair anos únicos das competências
  const anos = valoresUnicos(dadosCompletos, 'competencia')
    .map(comp => comp ? comp.split('-')[0] : null)
    .filter(ano => ano && ano.trim() !== '')
    .filter((ano, index, self) => self.indexOf(ano) === index)
    .sort()
    .reverse(); // Mais recente primeiro
  
  const selectAno = document.getElementById('filtro-ano');
  anos.forEach(ano => {
    const option = document.createElement('option');
    option.value = ano;
    option.textContent = ano;
    selectAno.appendChild(option);
  });
  
  // Competências
  const competencias = valoresUnicos(dadosCompletos, 'competencia').sort().reverse();
  const selectCompetencia = document.getElementById('filtro-competencia');
  competencias.forEach(comp => {
    const option = document.createElement('option');
    option.value = comp;
    option.textContent = formatarCompetencia(comp);
    selectCompetencia.appendChild(option);
  });
  
  // Lotações - mapear para nomes corretos e agrupar sublotações
  const lotacoesBrutas = valoresUnicos(dadosCompletos, 'lotacao_normalizada');
  const lotacoesMapeadas = new Map(); // Map para evitar duplicatas e manter ordem
  
  // Primeiro, mapear todas as lotações (usando dados completos para obter lotação original quando necessário)
  lotacoesBrutas.forEach(lot => {
    // Encontrar um registro com essa lotação para obter a lotação original
    const registroExemplo = dadosCompletos.find(r => r.lotacao_normalizada === lot);
    const lotacaoOriginal = registroExemplo ? registroExemplo.lotacao_original : null;
    const mapeada = mapearLotacao(lot, lotacaoOriginal);
    if (mapeada) {
      lotacoesMapeadas.set(mapeada, true);
    }
  });
  
  // Adicionar lotações principais que têm sublotações (mesmo que não apareçam diretamente nos dados)
  Object.keys(SUBLOTACOES).forEach(principal => {
    lotacoesMapeadas.set(principal, true);
  });
  
  // Ordenar lotações
  const lotacoesOrdenadas = Array.from(lotacoesMapeadas.keys()).sort();
  
  const selectLotacao = document.getElementById('filtro-lotacao');
  
  // Agrupar por lotação principal e suas sublotações
  const lotacoesAgrupadas = new Map();
  const lotacoesPrincipais = new Set();
  
  lotacoesOrdenadas.forEach(lot => {
    const principal = obterLotacaoPrincipal(lot);
    if (principal) {
      // É uma sublotação
      if (!lotacoesAgrupadas.has(principal)) {
        lotacoesAgrupadas.set(principal, []);
        lotacoesPrincipais.add(principal);
      }
      lotacoesAgrupadas.get(principal).push(lot);
    } else {
      // É uma lotação principal (não tem pai)
      lotacoesPrincipais.add(lot);
    }
  });
  
  // Criar optgroups para lotações principais com sublotações
  const lotacoesPrincipaisOrdenadas = Array.from(lotacoesPrincipais).sort();
  
  lotacoesPrincipaisOrdenadas.forEach(principal => {
    const sublots = lotacoesAgrupadas.get(principal);
    
    if (sublots && sublots.length > 0) {
      // Criar optgroup para lotação principal com sublotações
      const optgroup = document.createElement('optgroup');
      optgroup.label = `${principal} (Principal)`;
      
      // Adicionar a lotação principal como primeira opção
      const optionPrincipal = document.createElement('option');
      optionPrincipal.value = principal;
      optionPrincipal.textContent = `${principal} (Todas as sublotações)`;
      optgroup.appendChild(optionPrincipal);
      
      // Adicionar sublotações
      sublots.sort().forEach(sublot => {
        const option = document.createElement('option');
        option.value = sublot;
        option.textContent = `  └─ ${sublot}`;
        optgroup.appendChild(option);
      });
      
      selectLotacao.appendChild(optgroup);
    } else {
      // Verificar se esta lotação tem sublotações definidas mas não aparecem nos dados
      const sublotsDefinidas = obterSublotacoes(principal);
      if (sublotsDefinidas && sublotsDefinidas.length > 0) {
        // Criar optgroup mesmo que as sublotações não apareçam nos dados
        const optgroup = document.createElement('optgroup');
        optgroup.label = `${principal} (Principal)`;
        
        const optionPrincipal = document.createElement('option');
        optionPrincipal.value = principal;
        optionPrincipal.textContent = `${principal} (Todas as sublotações)`;
        optgroup.appendChild(optionPrincipal);
        
        sublotsDefinidas.sort().forEach(sublot => {
          const option = document.createElement('option');
          option.value = sublot;
          option.textContent = `  └─ ${sublot}`;
          optgroup.appendChild(option);
        });
        
        selectLotacao.appendChild(optgroup);
      } else {
        // Lotação sem sublotações - adicionar diretamente
        const option = document.createElement('option');
        option.value = principal;
        option.textContent = principal;
        selectLotacao.appendChild(option);
      }
    }
  });
  
  // Funções
  const funcoes = valoresUnicos(dadosCompletos, 'funcao');
  const selectFuncao = document.getElementById('filtro-funcao');
  funcoes.forEach(func => {
    const option = document.createElement('option');
    option.value = func;
    option.textContent = func;
    selectFuncao.appendChild(option);
  });
  
  // Vínculos
  const vinculos = valoresUnicos(dadosCompletos, 'vinculo');
  const selectVinculo = document.getElementById('filtro-vinculo');
  vinculos.forEach(vin => {
    const option = document.createElement('option');
    option.value = vin;
    option.textContent = vin;
    selectVinculo.appendChild(option);
  });
  
  // Níveis
  const niveis = valoresUnicos(dadosCompletos, 'nivel');
  const selectNivel = document.getElementById('filtro-nivel');
  niveis.forEach(niv => {
    const option = document.createElement('option');
    option.value = niv;
    option.textContent = niv;
    selectNivel.appendChild(option);
  });
  
  // Situações - IMPORTANTE: Preencher dinamicamente com TODAS as situações encontradas
  const situacoesBrutas = valoresUnicos(dadosCompletos, 'situacao');
  
  console.log('🔍 Situações brutas encontradas:', situacoesBrutas);
  
  // Filtrar e normalizar situações
  const situacoes = situacoesBrutas
    .filter(sit => sit != null && sit !== undefined && String(sit).trim() !== '') // Filtrar vazios, null, undefined
    .map(sit => String(sit).trim().toUpperCase()) // Normalizar para maiúsculas
    .filter((sit, index, self) => self.indexOf(sit) === index); // Remover duplicatas
  
  console.log('🔍 Situações normalizadas:', situacoes);
  
  const selectSituacao = document.getElementById('filtro-situacao');
  
  if (!selectSituacao) {
    console.error('❌ Elemento filtro-situacao não encontrado!');
    return;
  }
  
  // Limpar opções existentes (exceto "Todas as situações")
  while (selectSituacao.children.length > 1) {
    selectSituacao.removeChild(selectSituacao.lastChild);
  }
  
  // Ordenar situações (ATIVO primeiro, depois alfabético)
  const situacoesOrdenadas = [...situacoes].sort((a, b) => {
    if (a === 'ATIVO') return -1;
    if (b === 'ATIVO') return 1;
    return a.localeCompare(b);
  });
  
  situacoesOrdenadas.forEach(sit => {
    const option = document.createElement('option');
    option.value = sit;
    // Formatar o texto para exibição (capitalizar primeira letra de cada palavra)
    option.textContent = sit.split(' ').map(palavra => 
      palavra.charAt(0) + palavra.slice(1).toLowerCase()
    ).join(' ');
    selectSituacao.appendChild(option);
  });
  
  console.log(`✅ Filtro de situação preenchido com ${situacoesOrdenadas.length} opções:`, situacoesOrdenadas);
  
  // Motivos de Afastamento - IMPORTANTE: Preencher dinamicamente com TODOS os motivos encontrados
  const motivosBrutos = valoresUnicos(dadosCompletos, 'motivo_afastamento');
  
  console.log('🔍 Motivos brutos encontrados:', motivosBrutos);
  
  // Filtrar e normalizar motivos
  const motivos = motivosBrutos
    .filter(mot => mot != null && mot !== undefined && String(mot).trim() !== '') // Filtrar vazios
    .map(mot => String(mot).trim()) // Manter original (pode ter maiúsculas/minúsculas importantes)
    .filter((mot, index, self) => self.indexOf(mot) === index); // Remover duplicatas
  
  console.log('🔍 Motivos normalizados:', motivos);
  
  const selectMotivo = document.getElementById('filtro-motivo-afastamento');
  
  if (!selectMotivo) {
    console.error('❌ Elemento filtro-motivo-afastamento não encontrado!');
    return;
  }
  
  // Limpar opções existentes (exceto "Todos")
  while (selectMotivo.children.length > 1) {
    selectMotivo.removeChild(selectMotivo.lastChild);
  }
  
  // Ordenar motivos alfabeticamente
  const motivosOrdenados = [...motivos].sort((a, b) => a.localeCompare(b));
  
  motivosOrdenados.forEach(mot => {
    const option = document.createElement('option');
    option.value = mot;
    option.textContent = mot;
    selectMotivo.appendChild(option);
  });
  
  console.log(`✅ Filtro de motivo de afastamento preenchido com ${motivosOrdenados.length} opções:`, motivosOrdenados);
}

/**
 * Atualiza os filtros dinamicamente baseado nos filtros já selecionados
 * Quando um filtro é selecionado, os outros mostram apenas opções relevantes
 */
function atualizarFiltrosDinamicos() {
  // Obter valores atuais dos filtros
  const filtroAno = document.getElementById('filtro-ano').value;
  const filtroCompetencia = document.getElementById('filtro-competencia').value;
  const filtroLotacao = document.getElementById('filtro-lotacao').value;
  const filtroFuncao = document.getElementById('filtro-funcao').value;
  const filtroVinculo = document.getElementById('filtro-vinculo').value;
  const filtroNivel = document.getElementById('filtro-nivel').value;
  const filtroSituacao = document.getElementById('filtro-situacao').value;
  
  // Aplicar filtros progressivamente para obter dados filtrados
  let dadosFiltrados = [...dadosCompletos];
  
  // Filtrar por ano e competência primeiro (filtros temporais)
  if (filtroAno) {
    dadosFiltrados = dadosFiltrados.filter(r => {
      const comp = r.competencia || '';
      return comp.startsWith(filtroAno);
    });
  }
  
  if (filtroCompetencia) {
    dadosFiltrados = dadosFiltrados.filter(r => r.competencia === filtroCompetencia);
  }
  
  // Filtrar por lotação - usar a mesma lógica de filtrarFolha para incluir sublotações
  if (filtroLotacao) {
    // IMPORTANTE: Para PROGESP, considerar apenas as sublotações específicas (CGPA, SUMOF, SASBEM, SUDES, SUPLAF)
    let lotacoesCorretasParaIncluir = new Set([filtroLotacao]);
    
    // Se for PROGESP, usar apenas as sublotações definidas
    if (filtroLotacao === 'PROGESP') {
      const sublots = obterSublotacoes('PROGESP'); // ['SUMOF', 'SASBEM', 'CGPA', 'SUPLAF', 'SUDES']
      sublots.forEach(sublot => {
        lotacoesCorretasParaIncluir.add(sublot);
      });
    } else {
      // Para outras lotações, usar a lógica normal
      const sublots = obterSublotacoes(filtroLotacao);
      if (sublots.length > 0) {
        sublots.forEach(sublot => {
          lotacoesCorretasParaIncluir.add(sublot);
        });
      }
    }
    
    dadosFiltrados = dadosFiltrados.filter(r => {
      const lotNormalizada = r.lotacao_normalizada || '';
      const lotOriginal = r.lotacao_original || '';
      const lotMapeada = mapearLotacao(lotNormalizada, lotOriginal);
      
      // Para PROGESP, verificar se a lotação mapeada está nas sublotações corretas
      if (filtroLotacao === 'PROGESP') {
        // Apenas aceitar se for uma das sublotações específicas de PROGESP
        const sublotsProgesp = ['PROGESP', 'SUMOF', 'SASBEM', 'CGPA', 'SUPLAF', 'SUDES'];
        return sublotsProgesp.includes(lotMapeada);
      }
      
      // Para outras lotações, usar a lógica normal
      return lotacoesCorretasParaIncluir.has(lotMapeada) || lotacoesCorretasParaIncluir.has(lotNormalizada);
    });
  }
  
  // Filtrar por função
  if (filtroFuncao) {
    dadosFiltrados = dadosFiltrados.filter(r => r.funcao === filtroFuncao);
  }
  
  // Filtrar por vínculo
  if (filtroVinculo) {
    dadosFiltrados = dadosFiltrados.filter(r => r.vinculo === filtroVinculo);
  }
  
  // Filtrar por nível
  if (filtroNivel) {
    dadosFiltrados = dadosFiltrados.filter(r => r.nivel === filtroNivel);
  }
  
  // Filtrar por situação
  if (filtroSituacao) {
    dadosFiltrados = dadosFiltrados.filter(r => {
      const sit = (r.situacao || '').trim().toUpperCase();
      return sit === filtroSituacao;
    });
  }
  
  // Agora atualizar os filtros baseado nos dados filtrados
  
  // Se lotação foi limpa, restaurar todos os filtros
  if (!filtroLotacao) {
    // Restaurar Funções
    const selectFuncao = document.getElementById('filtro-funcao');
    const valorAtualFuncao = selectFuncao.value;
    const todasFuncoes = valoresUnicos(dadosCompletos, 'funcao').filter(f => f && f.trim() !== '');
    
    while (selectFuncao.children.length > 1) {
      selectFuncao.removeChild(selectFuncao.lastChild);
    }
    
    todasFuncoes.sort().forEach(func => {
      const option = document.createElement('option');
      option.value = func;
      option.textContent = func;
      selectFuncao.appendChild(option);
    });
    
    if (valorAtualFuncao && todasFuncoes.includes(valorAtualFuncao)) {
      selectFuncao.value = valorAtualFuncao;
    } else {
      selectFuncao.value = '';
    }
    
    // Restaurar Vínculos
    const selectVinculo = document.getElementById('filtro-vinculo');
    const valorAtualVinculo = selectVinculo.value;
    const todosVinculos = valoresUnicos(dadosCompletos, 'vinculo').filter(v => v && v.trim() !== '');
    
    while (selectVinculo.children.length > 1) {
      selectVinculo.removeChild(selectVinculo.lastChild);
    }
    
    todosVinculos.sort().forEach(vin => {
      const option = document.createElement('option');
      option.value = vin;
      option.textContent = vin;
      selectVinculo.appendChild(option);
    });
    
    if (valorAtualVinculo && todosVinculos.includes(valorAtualVinculo)) {
      selectVinculo.value = valorAtualVinculo;
    } else {
      selectVinculo.value = '';
    }
    
    // Restaurar Níveis
    const selectNivel = document.getElementById('filtro-nivel');
    const valorAtualNivel = selectNivel.value;
    const todosNiveis = valoresUnicos(dadosCompletos, 'nivel').filter(n => n && n.trim() !== '');
    
    while (selectNivel.children.length > 1) {
      selectNivel.removeChild(selectNivel.lastChild);
    }
    
    todosNiveis.sort().forEach(niv => {
      const option = document.createElement('option');
      option.value = niv;
      option.textContent = niv;
      selectNivel.appendChild(option);
    });
    
    if (valorAtualNivel && todosNiveis.includes(valorAtualNivel)) {
      selectNivel.value = valorAtualNivel;
    } else {
      selectNivel.value = '';
    }
    
    // Restaurar Situações
    const selectSituacao = document.getElementById('filtro-situacao');
    const valorAtualSituacao = selectSituacao.value;
    const situacoesBrutas = valoresUnicos(dadosCompletos, 'situacao');
    const todasSituacoes = situacoesBrutas
      .filter(sit => sit != null && sit !== undefined && String(sit).trim() !== '')
      .map(sit => String(sit).trim().toUpperCase())
      .filter((sit, index, self) => self.indexOf(sit) === index);
    
    while (selectSituacao.children.length > 1) {
      selectSituacao.removeChild(selectSituacao.lastChild);
    }
    
    const situacoesOrdenadas = [...todasSituacoes].sort((a, b) => {
      if (a === 'ATIVO') return -1;
      if (b === 'ATIVO') return 1;
      return a.localeCompare(b);
    });
    
    situacoesOrdenadas.forEach(sit => {
      const option = document.createElement('option');
      option.value = sit;
      option.textContent = sit.split(' ').map(palavra => 
        palavra.charAt(0) + palavra.slice(1).toLowerCase()
      ).join(' ');
      selectSituacao.appendChild(option);
    });
    
    if (valorAtualSituacao && todasSituacoes.includes(valorAtualSituacao)) {
      selectSituacao.value = valorAtualSituacao;
    } else {
      selectSituacao.value = '';
    }
  }
  
  // Atualizar Funções (se lotação foi selecionada)
  if (filtroLotacao) {
    const selectFuncao = document.getElementById('filtro-funcao');
    const valorAtual = selectFuncao.value;
    const funcoesDisponiveis = valoresUnicos(dadosFiltrados, 'funcao').filter(f => f && f.trim() !== '');
    
    // Limpar opções (exceto "Todas")
    while (selectFuncao.children.length > 1) {
      selectFuncao.removeChild(selectFuncao.lastChild);
    }
    
    // Adicionar novas opções
    funcoesDisponiveis.sort().forEach(func => {
      const option = document.createElement('option');
      option.value = func;
      option.textContent = func;
      selectFuncao.appendChild(option);
    });
    
    // Restaurar valor se ainda existir, senão limpar
    if (valorAtual && funcoesDisponiveis.includes(valorAtual)) {
      selectFuncao.value = valorAtual;
    } else {
      selectFuncao.value = '';
    }
  }
  
  // Atualizar Vínculos (se lotação ou função foi selecionada)
  if (filtroLotacao || filtroFuncao) {
    const selectVinculo = document.getElementById('filtro-vinculo');
    const valorAtual = selectVinculo.value;
    const vinculosDisponiveis = valoresUnicos(dadosFiltrados, 'vinculo').filter(v => v && v.trim() !== '');
    
    while (selectVinculo.children.length > 1) {
      selectVinculo.removeChild(selectVinculo.lastChild);
    }
    
    vinculosDisponiveis.sort().forEach(vin => {
      const option = document.createElement('option');
      option.value = vin;
      option.textContent = vin;
      selectVinculo.appendChild(option);
    });
    
    if (valorAtual && vinculosDisponiveis.includes(valorAtual)) {
      selectVinculo.value = valorAtual;
    } else {
      selectVinculo.value = '';
    }
  }
  
  // Atualizar Níveis (se lotação, função ou vínculo foi selecionado)
  if (filtroLotacao || filtroFuncao || filtroVinculo) {
    const selectNivel = document.getElementById('filtro-nivel');
    const valorAtual = selectNivel.value;
    const niveisDisponiveis = valoresUnicos(dadosFiltrados, 'nivel').filter(n => n && n.trim() !== '');
    
    while (selectNivel.children.length > 1) {
      selectNivel.removeChild(selectNivel.lastChild);
    }
    
    niveisDisponiveis.sort().forEach(niv => {
      const option = document.createElement('option');
      option.value = niv;
      option.textContent = niv;
      selectNivel.appendChild(option);
    });
    
    if (valorAtual && niveisDisponiveis.includes(valorAtual)) {
      selectNivel.value = valorAtual;
    } else {
      selectNivel.value = '';
    }
  }
  
  // Atualizar Situações (se qualquer filtro foi selecionado)
  if (filtroLotacao || filtroFuncao || filtroVinculo || filtroNivel) {
    const selectSituacao = document.getElementById('filtro-situacao');
    const valorAtual = selectSituacao.value;
    const situacoesBrutas = valoresUnicos(dadosFiltrados, 'situacao');
    const situacoesDisponiveis = situacoesBrutas
      .filter(sit => sit != null && sit !== undefined && String(sit).trim() !== '')
      .map(sit => String(sit).trim().toUpperCase())
      .filter((sit, index, self) => self.indexOf(sit) === index);
    
    while (selectSituacao.children.length > 1) {
      selectSituacao.removeChild(selectSituacao.lastChild);
    }
    
    const situacoesOrdenadas = [...situacoesDisponiveis].sort((a, b) => {
      if (a === 'ATIVO') return -1;
      if (b === 'ATIVO') return 1;
      return a.localeCompare(b);
    });
    
    situacoesOrdenadas.forEach(sit => {
      const option = document.createElement('option');
      option.value = sit;
      option.textContent = sit.split(' ').map(palavra => 
        palavra.charAt(0) + palavra.slice(1).toLowerCase()
      ).join(' ');
      selectSituacao.appendChild(option);
    });
    
    if (valorAtual && situacoesDisponiveis.includes(valorAtual)) {
      selectSituacao.value = valorAtual;
    } else {
      selectSituacao.value = '';
    }
  }
  
  // Atualizar Motivos de Afastamento (se situação foi selecionada)
  if (filtroSituacao) {
    const selectMotivo = document.getElementById('filtro-motivo-afastamento');
    const valorAtual = selectMotivo.value;
    const motivosDisponiveis = valoresUnicos(dadosFiltrados, 'motivo_afastamento')
      .filter(m => m && m.trim() !== '');
    
    while (selectMotivo.children.length > 1) {
      selectMotivo.removeChild(selectMotivo.lastChild);
    }
    
    motivosDisponiveis.sort().forEach(motivo => {
      const option = document.createElement('option');
      option.value = motivo;
      option.textContent = motivo;
      selectMotivo.appendChild(option);
    });
    
    if (valorAtual && motivosDisponiveis.includes(valorAtual)) {
      selectMotivo.value = valorAtual;
    } else {
      selectMotivo.value = '';
    }
  }
}

/**
 * Atualiza todo o dashboard com os dados filtrados
 */
function atualizarDashboard() {
  atualizarMetricas();
  criarGraficos();
}

/**
 * Atualiza os cards de métricas
 */
function atualizarMetricas() {
  const stats = calcularEstatisticas(dadosFiltrados);
  
  document.getElementById('total-funcionarios').textContent = stats.totalFuncionarios.toLocaleString('pt-BR');
  document.getElementById('total-vinculos').textContent = stats.totalVinculos.toLocaleString('pt-BR');
  document.getElementById('total-liquido').textContent = formatarMoeda(stats.totalLiquido);
  document.getElementById('total-vantagens').textContent = formatarMoeda(stats.totalVantagem);
  document.getElementById('total-descontos').textContent = formatarMoeda(stats.totalDesconto);
}

/**
 * Cria/atualiza todos os gráficos
 */
function criarGraficos() {
  criarGraficoLotacao();
  // Usar o modo de visualização atual (ou 'ultimo' por padrão)
  criarGraficoEvolucao(evolucaoViewMode);
  criarGraficoTopSalarios();
}

/**
 * Cria gráfico de distribuição por lotação (Doughnut)
 */
function criarGraficoLotacao() {
  const ctx = document.getElementById('chart-lotacao');
  if (!ctx) return;
  
  // Destruir gráfico anterior se existir
  if (charts.lotacao) {
    charts.lotacao.destroy();
  }
  
  const agregado = agregarPorLotacao(dadosFiltrados);
  const dados = Object.values(agregado)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10
  
  const labels = dados.map(d => d.lotacao);
  const valores = dados.map(d => d.count);
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f1f5f9' : '#1f2937';
  
  const colorPalette = [
    '#0066FF', '#00C896', '#FF6B2C', '#FF4D4F', '#0EA5E9',
    '#8B5CF6', '#EC4899', '#06B6D4', '#FFB224', '#10B981'
  ];
  
  charts.lotacao = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: colorPalette.slice(0, labels.length),
        borderWidth: 3,
        borderColor: isDark ? '#1e293b' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.8,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            font: { size: 12 },
            padding: 12
          }
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} funcionários (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Calcula variação percentual entre dois valores
 * @param {number} atual - Valor atual
 * @param {number} anterior - Valor anterior
 * @returns {Object} Objeto com variação percentual e indicador
 */
function calcularVariacaoPercentual(atual, anterior) {
  if (!anterior || anterior === 0) {
    return { variacao: 0, indicador: 'neutral' };
  }
  
  const variacao = ((atual - anterior) / anterior) * 100;
  const indicador = variacao > 0 ? 'up' : variacao < 0 ? 'down' : 'neutral';
  
  return { variacao, indicador };
}

/**
 * Atualiza badge de variação mensal
 */
function atualizarBadgeVariacao() {
  const agregado = agregarPorCompetencia(dadosFiltrados);
  const competencias = Object.keys(agregado).sort();
  const badge = document.getElementById('variacao-evolucao-mes');
  
  if (!badge) return;
  
  if (competencias.length < 2) {
    badge.innerHTML = '<i class="bi bi-dash"></i> —';
    badge.className = 'badge bg-secondary';
    badge.style.opacity = '0.4';
    badge.style.display = 'none'; // Ocultar quando não há dados suficientes
    return;
  }
  
  // Mostrar badge novamente se estava oculto
  badge.style.display = 'inline-block';
  badge.style.opacity = '1';
  
  const ultimoMes = agregado[competencias[competencias.length - 1]];
  const mesAnterior = agregado[competencias[competencias.length - 2]];
  
  const { variacao, indicador } = calcularVariacaoPercentual(ultimoMes.liquido, mesAnterior.liquido);
  
  const sinal = variacao > 0 ? '+' : '';
  const icon = variacao > 0 ? 'bi-arrow-up' : variacao < 0 ? 'bi-arrow-down' : 'bi-dash';
  const bgClass = variacao > 0 ? 'bg-success' : variacao < 0 ? 'bg-danger' : 'bg-secondary';
  
  badge.innerHTML = `<i class="bi ${icon}"></i> vs anterior: ${sinal}${variacao.toFixed(1)}%`;
  badge.className = `badge ${bgClass}`;
}

/**
 * Cria gráfico de evolução mensal (Line)
 * @param {string} viewMode - Modo de visualização: 'ultimo', '3meses', 'todos'
 */
function criarGraficoEvolucao(viewMode = 'ultimo') {
  const ctx = document.getElementById('chart-evolucao');
  if (!ctx) return;
  
  // Destruir gráfico anterior se existir
  if (charts.evolucao) {
    charts.evolucao.destroy();
  }
  
  const agregado = agregarPorCompetencia(dadosFiltrados);
  let competencias = Object.keys(agregado).sort();
  
  // Filtrar competências baseado no modo de visualização
  if (viewMode === 'ultimo' && competencias.length > 0) {
    competencias = [competencias[competencias.length - 1]];
  } else if (viewMode === '3meses' && competencias.length > 3) {
    competencias = competencias.slice(-3);
  }
  // Se for 'todos', mantém todas as competências
  
  const liquidos = competencias.map(comp => agregado[comp].liquido);
  
  // Atualizar badge de variação
  atualizarBadgeVariacao();
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f1f5f9' : '#1f2937';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  charts.evolucao = new Chart(ctx, {
    type: 'line',
    data: {
      labels: competencias.map(formatarCompetenciaCurta),
      datasets: [        {
          label: 'Total Líquido',
          data: liquidos,
          borderColor: '#0066FF',
          backgroundColor: 'rgba(0, 102, 255, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#0066FF',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDark ? '#334155' : '#e5e7eb',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `Total Líquido: ${formatarMoeda(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: function(value) {
              return formatarMoeda(value);
            }
          },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });
}

/**
 * Cria gráfico de top salários (Bar horizontal)
 */
function criarGraficoTopSalarios() {
  const ctx = document.getElementById('chart-top-salarios');
  if (!ctx) return;
  
  // Destruir gráfico anterior se existir
  if (charts.topSalarios) {
    charts.topSalarios.destroy();
  }
  
  const top10 = topN(dadosFiltrados, 'liquido', 10);
  const labels = top10.map(r => r.nome);
  const valores = top10.map(r => r.liquido);
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f1f5f9' : '#1f2937';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  charts.topSalarios = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Salário Líquido',
        data: valores,
        backgroundColor: 'rgba(0, 102, 255, 0.8)',
        borderColor: '#0066FF',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDark ? '#334155' : '#e5e7eb',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `Líquido: ${formatarMoeda(context.parsed.x)}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: function(value) {
              return formatarMoeda(value);
            }
          },
          grid: { color: gridColor }
        },
        y: {
          ticks: { 
            color: textColor,
            font: { size: 11 }
          },
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Configura event listeners
 */
function configurarEventos() {
  // Filtros - atualizar dinamicamente antes de aplicar
  const aplicarFiltrosComAtualizacao = () => {
    atualizarFiltrosDinamicos();
    aplicarFiltros();
  };
  
  const aplicarFiltrosDebounced = debounce(aplicarFiltrosComAtualizacao, 500);
  
  // Para lotação, função, vínculo e nível, atualizar filtros dinâmicos antes
  document.getElementById('filtro-ano').addEventListener('change', aplicarFiltrosComAtualizacao);
  document.getElementById('filtro-competencia').addEventListener('change', aplicarFiltrosComAtualizacao);
  document.getElementById('filtro-lotacao').addEventListener('change', aplicarFiltrosComAtualizacao);
  document.getElementById('filtro-funcao').addEventListener('change', aplicarFiltrosComAtualizacao);
  document.getElementById('filtro-vinculo').addEventListener('change', aplicarFiltrosComAtualizacao);
  document.getElementById('filtro-nivel').addEventListener('change', aplicarFiltrosComAtualizacao);
  document.getElementById('filtro-situacao').addEventListener('change', aplicarFiltrosComAtualizacao);
  document.getElementById('filtro-motivo-afastamento').addEventListener('change', aplicarFiltros);
  document.getElementById('filtro-busca-nome').addEventListener('input', aplicarFiltrosDebounced);
  const filtroMultiplosVinculos = document.getElementById('filtro-multiplos-vinculos');
  if (filtroMultiplosVinculos) {
    filtroMultiplosVinculos.addEventListener('change', aplicarFiltros);
  }
  
  // Limpar filtros - restaurar todos os filtros ao estado inicial
  document.getElementById('btn-limpar-filtros').addEventListener('click', () => {
    document.getElementById('filtro-ano').value = '';
    document.getElementById('filtro-competencia').value = '';
    document.getElementById('filtro-lotacao').value = '';
    document.getElementById('filtro-funcao').value = '';
    document.getElementById('filtro-vinculo').value = '';
    document.getElementById('filtro-nivel').value = '';
    document.getElementById('filtro-situacao').value = '';
    document.getElementById('filtro-motivo-afastamento').value = '';
    document.getElementById('filtro-busca-nome').value = '';
    const filtroMultiplosVinculos = document.getElementById('filtro-multiplos-vinculos');
    if (filtroMultiplosVinculos) filtroMultiplosVinculos.checked = false;
    
    // Restaurar todos os filtros ao estado inicial
    preencherFiltros();
    aplicarFiltros();
  });
  
  // Botão para limpar apenas a busca por nome (no banner)
  const btnLimparBuscaNome = document.getElementById('btn-limpar-busca-nome');
  if (btnLimparBuscaNome) {
    btnLimparBuscaNome.addEventListener('click', () => {
      document.getElementById('filtro-busca-nome').value = '';
      aplicarFiltros();
    });
  }
  
  // Toggle de visualização do gráfico de evolução
  const toggleEvolucaoView = document.getElementById('toggle-evolucao-view');
  if (toggleEvolucaoView) {
    const botoes = toggleEvolucaoView.querySelectorAll('button[data-evolucao-view]');
    botoes.forEach(btn => {
      btn.addEventListener('click', function() {
        // Remover classe active de todos os botões
        botoes.forEach(b => b.classList.remove('active'));
        // Adicionar classe active ao botão clicado
        this.classList.add('active');
        // Obter o modo de visualização
        const viewMode = this.getAttribute('data-evolucao-view');
        // Armazenar o modo atual
        evolucaoViewMode = viewMode;
        // Atualizar gráfico
        criarGraficoEvolucao(viewMode);
      });
    });
  }
  
  // Botões de exportação (se existirem)
  const btnExportarPDF = document.getElementById('btn-exportar-pdf');
  if (btnExportarPDF) {
    btnExportarPDF.addEventListener('click', async () => {
      try {
        const { exportRelatorioPDF } = await import('../utils/pdf.js');
        const { formatarMoeda, formatarCPF } = await import('../utils/formatters.js');
        
        const colunas = [
          { header: 'Nome', accessor: r => r.nome },
          { header: 'CPF', accessor: r => formatarCPF(r.cpf) },
          { header: 'Lotação', accessor: r => r.lotacao_normalizada || '-' },
          { header: 'Função', accessor: r => r.funcao || '-' },
          { header: 'Vínculo', accessor: r => r.vinculo || '-' },
          { header: 'Vantagem', accessor: r => formatarMoeda(r.vantagem) },
          { header: 'Desconto', accessor: r => formatarMoeda(r.desconto) },
          { header: 'Líquido', accessor: r => formatarMoeda(r.liquido) }
        ];
        
        const filtros = {
          Ano: document.getElementById('filtro-ano').value || 'Todos',
          Competência: document.getElementById('filtro-competencia').value || 'Todas',
          Lotação: document.getElementById('filtro-lotacao').value || 'Todas',
          Função: document.getElementById('filtro-funcao').value || 'Todas',
          Vínculo: document.getElementById('filtro-vinculo').value || 'Todos',
          Situação: document.getElementById('filtro-situacao').value || 'Todas'
        };
        
        exportRelatorioPDF('Dashboard Servidores - UNCISAL', dadosFiltrados, colunas, filtros);
        showToast('PDF exportado com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        showToast('Erro ao exportar PDF', 'danger');
      }
    });
  }
  
  const btnExportarCSV = document.getElementById('btn-exportar-csv');
  if (btnExportarCSV) {
    btnExportarCSV.addEventListener('click', async () => {
      try {
        const { exportarCSV } = await import('../utils/pdf.js');
        
        const colunas = [
          { header: 'Nome', accessor: r => r.nome },
          { header: 'CPF', accessor: r => r.cpf },
          { header: 'Matrícula', accessor: r => r.matricula || '' },
          { header: 'Lotação', accessor: r => r.lotacao_normalizada || '' },
          { header: 'Função', accessor: r => r.funcao || '' },
          { header: 'Vínculo', accessor: r => r.vinculo || '' },
          { header: 'Situação', accessor: r => r.situacao || '' },
          { header: 'Vantagem', accessor: r => r.vantagem },
          { header: 'Desconto', accessor: r => r.desconto },
          { header: 'Líquido', accessor: r => r.liquido }
        ];
        
        exportarCSV('dashboard_servidores', dadosFiltrados, colunas);
        showToast('CSV exportado com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        showToast('Erro ao exportar CSV', 'danger');
      }
    });
  }
  
  // Cards de relatórios - IMPORTANTE: Configurar após garantir que os elementos existem
  const cardsRelatorios = document.querySelectorAll('[data-relatorio]');
  console.log(`📊 Encontrados ${cardsRelatorios.length} cards de relatórios`);
  
  cardsRelatorios.forEach((card, index) => {
    const relatorioNome = card.getAttribute('data-relatorio');
    console.log(`  ${index + 1}. ${relatorioNome}`);
    
    card.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log(`🔍 Clicou no relatório: ${relatorioNome}`);
      
      try {
        await abrirRelatorio(relatorioNome);
      } catch (error) {
        console.error('Erro ao abrir relatório:', error);
        showToast('Erro ao abrir relatório. Verifique o console.', 'danger', 5000);
      }
    });
  });
  
  console.log('✅ Event listeners dos relatórios configurados');
}

/**
 * Abre um relatório específico
 */
async function abrirRelatorio(nomeRelatorio) {
  try {
    console.log(`🚀 Abrindo relatório: ${nomeRelatorio}`);
    showLoader('Carregando relatório...');
    
    // Importar e renderizar o relatório
    let renderFunction;
    
    console.log(`📦 Importando módulo do relatório: ${nomeRelatorio}`);
    switch(nomeRelatorio) {
      case 'vencimentos':
        ({ renderRelatorioVencimentos: renderFunction } = await import('./relatorio-vencimentos.js'));
        break;
      case 'descontos':
        ({ renderRelatorioDescontos: renderFunction } = await import('./relatorio-descontos.js'));
        break;
      case 'vantagens':
        ({ renderRelatorioVantagens: renderFunction } = await import('./relatorio-vantagens.js'));
        break;
      case 'lotacao':
        ({ renderRelatorioLotacao: renderFunction } = await import('./relatorio-lotacao.js'));
        break;
      case 'vinculo':
        ({ renderRelatorioVinculo: renderFunction } = await import('./relatorio-vinculo.js'));
        break;
      case 'ativos-afastados':
        ({ renderRelatorioAtivosAfastados: renderFunction } = await import('./relatorio-ativos-afastados.js'));
        break;
      case 'evolucao-mensal':
        ({ renderRelatorioEvolucaoMensal: renderFunction } = await import('./relatorio-evolucao-mensal.js'));
        break;
      case 'top-salarios':
        ({ renderRelatorioTopSalarios: renderFunction } = await import('./relatorio-top-salarios.js'));
        break;
      case 'funcoes-niveis':
        ({ renderRelatorioFuncoesNiveis: renderFunction } = await import('./relatorio-funcoes-niveis.js'));
        break;
      case 'consolidado':
        ({ renderRelatorioConsolidado: renderFunction } = await import('./relatorio-consolidado.js'));
        break;
      default:
        throw new Error('Relatório não encontrado');
    }
    
    // Armazenar relatório atual para atualização automática
    relatorioAtual = nomeRelatorio;
    renderFunctionAtual = renderFunction;
    
    // Obter container do relatório
    const container = document.getElementById('relatorio-detalhado-container');
    if (!container) {
      console.error('❌ Container de relatório não encontrado!');
      throw new Error('Container de relatório não encontrado');
    }
    
    console.log(`✅ Container encontrado, renderizando com ${dadosFiltrados.length} registros`);
    
    // Renderizar com dados filtrados
    renderFunction(dadosFiltrados);
    console.log('✅ Relatório renderizado');
    
    // Adicionar botão voltar
    adicionarBotaoVoltar();
    console.log('✅ Botão voltar adicionado');
    
    // Esconder dashboard principal e mostrar relatório
    const dashboardMain = document.getElementById('dashboard-main');
    const relatoriosContainer = document.getElementById('relatorios-container');
    
    if (dashboardMain) {
      dashboardMain.style.display = 'none';
      console.log('✅ Dashboard principal escondido');
    } else {
      console.warn('⚠️ Dashboard principal não encontrado');
    }
    
    if (relatoriosContainer) {
      relatoriosContainer.style.display = 'none';
      console.log('✅ Container de relatórios escondido');
    } else {
      console.warn('⚠️ Container de relatórios não encontrado');
    }
    
    // Garantir que o container do relatório está visível com animação
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    container.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    setTimeout(() => {
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 50);
    
    console.log('✅ Container do relatório exibido');
    
    // Scroll suave para o topo do relatório
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('✅ Scroll para o topo executado');
    }, 200);
    
    hideLoader();
    showToast('Relatório carregado com sucesso!', 'success');
    console.log('✅ Relatório carregado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao abrir relatório:', error);
    hideLoader();
    showToast('Erro ao carregar relatório. Verifique o console.', 'danger', 5000);
  }
}

/**
 * Adiciona navegação premium (breadcrumb + botão voltar)
 */
function adicionarBotaoVoltar() {
  const container = document.getElementById('relatorio-detalhado-container');
  if (!container || container.querySelector('.nav-relatorio')) return;
  
  // Nomes dos relatórios para exibição
  const nomesRelatorios = {
    'vencimentos': 'Relatório de Vencimentos',
    'descontos': 'Relatório de Descontos',
    'vantagens': 'Relatório de Vantagens',
    'lotacao': 'Relatório por Lotação',
    'vinculo': 'Relatório por Vínculo',
    'ativos-afastados': 'Ativos vs Afastados',
    'evolucao-mensal': 'Evolução Mensal',
    'top-salarios': 'Top Salários',
    'funcoes-niveis': 'Funções e Níveis',
    'consolidado': 'Relatório Consolidado'
  };
  
  const nomeRelatorio = nomesRelatorios[relatorioAtual] || 'Relatório';
  
  // Criar container de navegação premium
  const navContainer = document.createElement('div');
  navContainer.className = 'nav-relatorio mb-4';
  navContainer.innerHTML = `
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <a href="#" class="breadcrumb-link" onclick="event.preventDefault(); voltarAoDashboard();">
              <i class="bi bi-house-door me-1"></i>
              Dashboard
            </a>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <i class="bi bi-chevron-right mx-2 text-muted"></i>
            ${nomeRelatorio}
          </li>
        </ol>
      </nav>
      <button class="btn btn-outline-primary btn-voltar-dashboard" onclick="voltarAoDashboard()">
        <i class="bi bi-arrow-left me-2"></i>
        Voltar
      </button>
    </div>
  `;
  
  container.insertBefore(navContainer, container.firstChild);
  
  // Expor função globalmente
  window.voltarAoDashboard = voltarAoDashboard;
}

/**
 * Função para voltar ao dashboard
 */
function voltarAoDashboard() {
  const container = document.getElementById('relatorio-detalhado-container');
  
  // Limpar container com animação
  if (container) {
    container.style.opacity = '0';
    container.style.transform = 'translateY(-10px)';
    container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    setTimeout(() => {
      container.innerHTML = '';
      container.style.display = 'none';
      container.style.visibility = 'hidden';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 300);
  }
  
  // Limpar estado
  relatorioAtual = null;
  renderFunctionAtual = null;
  
  // Mostrar dashboard novamente com animação
  const dashboardMain = document.getElementById('dashboard-main');
  const relatoriosContainer = document.getElementById('relatorios-container');
  
  if (dashboardMain) {
    dashboardMain.style.display = 'block';
    dashboardMain.style.opacity = '0';
    dashboardMain.style.transform = 'translateY(10px)';
    dashboardMain.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    setTimeout(() => {
      dashboardMain.style.opacity = '1';
      dashboardMain.style.transform = 'translateY(0)';
    }, 50);
  }
  
  if (relatoriosContainer) {
    relatoriosContainer.style.display = 'block';
    relatoriosContainer.style.opacity = '0';
    relatoriosContainer.style.transform = 'translateY(10px)';
    relatoriosContainer.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    setTimeout(() => {
      relatoriosContainer.style.opacity = '1';
      relatoriosContainer.style.transform = 'translateY(0)';
    }, 100);
  }
  
  // Scroll suave para o topo
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
}

/**
 * Aplica filtros aos dados
 */
function aplicarFiltros() {
  const filtros = {
    ano: document.getElementById('filtro-ano').value,
    competencia: document.getElementById('filtro-competencia').value,
    lotacao: document.getElementById('filtro-lotacao').value,
    funcao: document.getElementById('filtro-funcao').value,
    vinculo: document.getElementById('filtro-vinculo').value,
    nivel: document.getElementById('filtro-nivel').value,
    situacao: document.getElementById('filtro-situacao').value,
    motivoAfastamento: document.getElementById('filtro-motivo-afastamento').value,
    buscaNome: document.getElementById('filtro-busca-nome').value.trim(),
    multiplosVinculos: document.getElementById('filtro-multiplos-vinculos')?.checked || false
  };
  
  dadosFiltrados = filtrarFolha(dadosCompletos, filtros);
  
  console.log(`🔍 Filtros aplicados:`, filtros);
  console.log(`📊 Resultado: ${dadosFiltrados.length} registros`);
  
  // Atualizar banner de busca por nome
  atualizarBannerBuscaNome(filtros.buscaNome, dadosFiltrados);
  
  atualizarDashboard();
  
  // Se houver um relatório aberto, atualizar automaticamente
  if (relatorioAtual && renderFunctionAtual) {
    try {
      renderFunctionAtual(dadosFiltrados);
      showToast('Relatório atualizado com os novos filtros!', 'success', 2000);
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error);
      showToast('Erro ao atualizar relatório. Verifique o console.', 'danger', 3000);
    }
  }
}

/**
 * Atualiza o banner informativo quando há busca por nome
 */
function atualizarBannerBuscaNome(buscaNome, dadosFiltrados) {
  const banner = document.getElementById('banner-busca-nome');
  const conteudo = document.getElementById('banner-busca-conteudo');
  
  if (!banner || !conteudo) return;
  
  // Se não há busca por nome, ocultar banner
  if (!buscaNome || buscaNome.trim() === '') {
    banner.classList.add('d-none');
    return;
  }
  
  // Calcular pessoas únicas encontradas com informações de vínculos
  const pessoasUnicas = new Map(); // CPF -> { nome, registros, matriculas, competencias }
  
  dadosFiltrados.forEach(reg => {
    const cpf = reg.cpf && reg.cpf.trim() !== '' ? reg.cpf.trim() : null;
    const nome = reg.nome && reg.nome.trim() !== '' ? reg.nome.trim() : 'Sem nome';
    const matricula = reg.matricula && reg.matricula.trim() !== '' ? reg.matricula.trim() : null;
    
    if (cpf) {
      if (!pessoasUnicas.has(cpf)) {
        pessoasUnicas.set(cpf, {
          nome: nome,
          registros: 0,
          matriculas: new Set(),
          competencias: new Set()
        });
      }
      const pessoa = pessoasUnicas.get(cpf);
      pessoa.registros++;
      if (matricula) {
        pessoa.matriculas.add(matricula);
      }
      if (reg.competencia) {
        pessoa.competencias.add(reg.competencia);
      }
    } else {
      // Se não tem CPF, usar nome como chave
      const chave = `nome_${nome}`;
      if (!pessoasUnicas.has(chave)) {
        pessoasUnicas.set(chave, {
          nome: nome,
          registros: 0,
          matriculas: new Set(),
          competencias: new Set()
        });
      }
      const pessoa = pessoasUnicas.get(chave);
      pessoa.registros++;
      if (matricula) {
        pessoa.matriculas.add(matricula);
      }
      if (reg.competencia) {
        pessoa.competencias.add(reg.competencia);
      }
    }
  });
  
  const totalPessoas = pessoasUnicas.size;
  const totalRegistros = dadosFiltrados.length;
  
  // Montar conteúdo do banner
  let html = '';
  
  if (totalPessoas === 0) {
    html = `
      <p class="mb-0">
        <i class="bi bi-exclamation-triangle me-2"></i>
        <strong>Nenhuma pessoa encontrada</strong> com o termo "<strong>${buscaNome}</strong>".
      </p>
    `;
    banner.classList.remove('alert-info');
    banner.classList.add('alert-warning');
  } else {
    // Listar até 5 pessoas encontradas
    const pessoasArray = Array.from(pessoasUnicas.values());
    const pessoasParaMostrar = pessoasArray.slice(0, 5);
    const temMais = pessoasArray.length > 5;
    
    html = `
      <p class="mb-2">
        <strong>${totalPessoas}</strong> ${totalPessoas === 1 ? 'pessoa encontrada' : 'pessoas encontradas'} 
        com o termo "<strong>${buscaNome}</strong>".
      </p>
      <p class="mb-2 small">
        <i class="bi bi-info-circle me-1"></i>
        <strong>Os relatórios abaixo mostram dados específicos para ${totalPessoas === 1 ? 'esta pessoa' : 'estas pessoas'}.</strong>
        ${totalRegistros > 1 ? `<br>Total de ${totalRegistros} registro${totalRegistros > 1 ? 's' : ''} encontrado${totalRegistros > 1 ? 's' : ''}.` : ''}
      </p>
    `;
    
    if (pessoasParaMostrar.length > 0) {
      html += `
        <div class="mt-2">
          <strong class="small">Pessoa${pessoasParaMostrar.length > 1 ? 's' : ''} encontrada${pessoasParaMostrar.length > 1 ? 's' : ''}:</strong>
          <ul class="mb-0 mt-1 small" style="list-style: none; padding-left: 0;">
      `;
      
      pessoasParaMostrar.forEach(pessoa => {
        const competenciasTexto = Array.from(pessoa.competencias).sort().join(', ');
        const matriculasArray = Array.from(pessoa.matriculas || new Set());
        const temMultiplosVinculos = matriculasArray.length > 1;
        const matriculasTexto = matriculasArray.length > 0 
          ? `Matrícula${matriculasArray.length > 1 ? 's' : ''}: ${matriculasArray.join(', ')}`
          : '';
        
        html += `
          <li class="mb-1">
            <i class="bi bi-person-fill me-2 text-primary"></i>
            <strong>${pessoa.nome}</strong>
            ${temMultiplosVinculos ? `<span class="badge bg-info-subtle text-info ms-2" style="font-size: 0.75rem;">
              <i class="bi bi-briefcase-fill me-1"></i>${matriculasArray.length} vínculos
            </span>` : ''}
            <span class="text-muted ms-2 d-block small mt-1" style="padding-left: 1.75rem;">
              ${matriculasTexto ? `${matriculasTexto}${competenciasTexto ? ' • ' : ''}` : ''}
              ${competenciasTexto ? competenciasTexto : ''}
              ${pessoa.registros > 1 ? ` • ${pessoa.registros} registro${pessoa.registros > 1 ? 's' : ''}` : ''}
            </span>
          </li>
        `;
      });
      
      if (temMais) {
        html += `
          <li class="text-muted small">
            <i class="bi bi-three-dots me-2"></i>
            e mais ${pessoasArray.length - 5} pessoa${pessoasArray.length - 5 > 1 ? 's' : ''}...
          </li>
        `;
      }
      
      html += `
          </ul>
        </div>
      `;
    }
    
    banner.classList.remove('alert-warning');
    banner.classList.add('alert-info');
  }
  
  conteudo.innerHTML = html;
  banner.classList.remove('d-none');
}

// Expor charts globalmente para o dark mode toggle
window.dashboardCharts = charts;

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

