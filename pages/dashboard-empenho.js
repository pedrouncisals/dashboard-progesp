/**
 * DASHBOARD EMPENHO
 * Arquivo principal que coordena o dashboard de empenho
 * Dados extraídos dos arquivos de empenho da UNCISAL
 */

import { initNavbar } from '../components/navbar.js';
import { initFooter } from '../components/footer.js';
import { showLoader, hideLoader, showToast } from '../utils/feedback.js';
import { formatarMoeda, formatarCompetencia, formatarCompetenciaCurta } from '../utils/formatters.js';
import { debounce } from '../utils/debounce.js';
import {
  carregarTodosEmpenhos,
  filtrarEmpenho,
  agregarPorCompetencia,
  agregarPorLotacao,
  calcularEstatisticas,
  valoresUnicos,
  topN
} from '../services/empenho.js';

// Estado global da aplicação
let dadosCompletos = [];
let dadosFiltrados = [];
let charts = {};
let relatorioAtual = null;
let renderFunctionAtual = null;
let evolucaoViewMode = 'ultimo';

/**
 * Inicializa a aplicação
 */
async function init() {
  try {
    // Inicializar componentes
    initNavbar();
    initFooter();
    
    // Atualizar título da navbar
    const navbarTitleEl = document.getElementById('navbar-title');
    if (navbarTitleEl) {
      navbarTitleEl.textContent = 'Dashboard Empenho';
    }
    
    // Destacar link ativo na navbar
    const navLinkEmpenhos = document.getElementById('nav-link-empenhos');
    const navLinkServidores = document.getElementById('nav-link-servidores');
    if (navLinkEmpenhos) {
      navLinkEmpenhos.style.opacity = '1';
      navLinkEmpenhos.style.fontWeight = '600';
    }
    if (navLinkServidores) {
      navLinkServidores.style.opacity = '0.7';
    }
    
    showLoader('Carregando dados de empenho...');
    
    // Carregar todos os dados
    dadosCompletos = await carregarTodosEmpenhos();
    dadosFiltrados = [...dadosCompletos];
    
    console.log(`✅ ${dadosCompletos.length} registros de empenho carregados`);
    
    // Atualizar status no dashboard
    const statusEl = document.getElementById('status-dados');
    if (statusEl) {
      statusEl.textContent = `${dadosCompletos.length.toLocaleString('pt-BR')} registros`;
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
    
    // Calcular total de empenhos únicos
    const empenhosUnicos = new Set();
    dadosCompletos.forEach(r => {
      if (r.cpf && r.cpf.trim() !== '') {
        empenhosUnicos.add(r.cpf.trim());
      } else if (r.nome && r.nome.trim() !== '' && r.nome !== '*Totais*') {
        empenhosUnicos.add(r.nome.trim());
      }
    });
    
    // Atualizar empenhos no navbar
    const navbarServidoresEl = document.getElementById('navbar-servidores');
    if (navbarServidoresEl) {
      navbarServidoresEl.innerHTML = `
        <i class="bi bi-people-fill"></i>
        <span>${empenhosUnicos.size.toLocaleString('pt-BR')} empenhos</span>
      `;
    }
    
    // Inicializar interface
    preencherFiltros();
    atualizarDashboard();
    configurarEventos();
    
    hideLoader();
    showToast('Dados de empenho carregados com sucesso!', 'success');
    
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
  // Anos
  const anos = valoresUnicos(dadosCompletos, 'competencia')
    .map(comp => comp ? comp.split('-')[0] : null)
    .filter(ano => ano && ano.trim() !== '')
    .filter((ano, index, self) => self.indexOf(ano) === index)
    .sort()
    .reverse();
  
  const selectAno = document.getElementById('filtro-ano');
  if (selectAno) {
    anos.forEach(ano => {
      const option = document.createElement('option');
      option.value = ano;
      option.textContent = ano;
      selectAno.appendChild(option);
    });
  }
  
  // Competências
  const competencias = valoresUnicos(dadosCompletos, 'competencia').sort().reverse();
  const selectCompetencia = document.getElementById('filtro-competencia');
  if (selectCompetencia) {
    competencias.forEach(comp => {
      const option = document.createElement('option');
      option.value = comp;
      option.textContent = formatarCompetencia(comp);
      selectCompetencia.appendChild(option);
    });
  }
  
  // Lotações
  const lotacoes = valoresUnicos(dadosCompletos, 'lotacao_normalizada');
  const selectLotacao = document.getElementById('filtro-lotacao');
  if (selectLotacao) {
    lotacoes.forEach(lot => {
      const option = document.createElement('option');
      option.value = lot;
      option.textContent = lot;
      selectLotacao.appendChild(option);
    });
  }
  
  // Funções/Cargos
  const funcoes = valoresUnicos(dadosCompletos, 'funcao');
  const selectFuncao = document.getElementById('filtro-funcao');
  if (selectFuncao) {
    funcoes.forEach(func => {
      const option = document.createElement('option');
      option.value = func;
      option.textContent = func;
      selectFuncao.appendChild(option);
    });
  }
  
  // Vínculos
  const vinculos = valoresUnicos(dadosCompletos, 'vinculo');
  const selectVinculo = document.getElementById('filtro-vinculo');
  if (selectVinculo) {
    vinculos.forEach(vin => {
      const option = document.createElement('option');
      option.value = vin;
      option.textContent = vin;
      selectVinculo.appendChild(option);
    });
  }
  
  // Situações
  const situacoesBrutas = valoresUnicos(dadosCompletos, 'situacao');
  const situacoes = situacoesBrutas
    .filter(sit => sit != null && sit !== undefined && String(sit).trim() !== '')
    .map(sit => String(sit).trim().toUpperCase())
    .filter((sit, index, self) => self.indexOf(sit) === index);
  
  const selectSituacao = document.getElementById('filtro-situacao');
  if (selectSituacao) {
    const situacoesOrdenadas = [...situacoes].sort((a, b) => {
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
  }
  
  // Áreas
  const areas = valoresUnicos(dadosCompletos, 'area');
  const selectArea = document.getElementById('filtro-area');
  if (selectArea) {
    areas.forEach(area => {
      const option = document.createElement('option');
      option.value = area;
      option.textContent = area;
      selectArea.appendChild(option);
    });
  }
}

/**
 * Atualiza os filtros dinamicamente baseado nos filtros já selecionados
 * Quando um filtro é selecionado, os outros mostram apenas opções relevantes
 */
function atualizarFiltrosDinamicos() {
  // Obter valores atuais dos filtros
  const filtroAno = document.getElementById('filtro-ano')?.value || '';
  const filtroCompetencia = document.getElementById('filtro-competencia')?.value || '';
  const filtroLotacao = document.getElementById('filtro-lotacao')?.value || '';
  const filtroFuncao = document.getElementById('filtro-funcao')?.value || '';
  const filtroVinculo = document.getElementById('filtro-vinculo')?.value || '';
  const filtroSituacao = document.getElementById('filtro-situacao')?.value || '';
  const filtroArea = document.getElementById('filtro-area')?.value || '';
  
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
  
  // Filtrar por lotação
  if (filtroLotacao) {
    dadosFiltrados = dadosFiltrados.filter(r => r.lotacao_normalizada === filtroLotacao);
  }
  
  // Filtrar por função
  if (filtroFuncao) {
    dadosFiltrados = dadosFiltrados.filter(r => r.funcao === filtroFuncao);
  }
  
  // Filtrar por vínculo
  if (filtroVinculo) {
    dadosFiltrados = dadosFiltrados.filter(r => r.vinculo === filtroVinculo);
  }
  
  // Filtrar por situação
  if (filtroSituacao) {
    dadosFiltrados = dadosFiltrados.filter(r => {
      const sit = (r.situacao || '').trim().toUpperCase();
      return sit === filtroSituacao;
    });
  }
  
  // Filtrar por área
  if (filtroArea) {
    dadosFiltrados = dadosFiltrados.filter(r => r.area === filtroArea);
  }
  
  // Se lotação foi limpa, restaurar todos os filtros
  if (!filtroLotacao) {
    // Restaurar Funções
    const selectFuncao = document.getElementById('filtro-funcao');
    if (selectFuncao) {
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
    }
    
    // Restaurar Vínculos
    const selectVinculo = document.getElementById('filtro-vinculo');
    if (selectVinculo) {
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
    }
    
    // Restaurar Situações
    const selectSituacao = document.getElementById('filtro-situacao');
    if (selectSituacao) {
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
    
    // Restaurar Áreas
    const selectArea = document.getElementById('filtro-area');
    if (selectArea) {
      const valorAtualArea = selectArea.value;
      const todasAreas = valoresUnicos(dadosCompletos, 'area').filter(a => a && a.trim() !== '');
      
      while (selectArea.children.length > 1) {
        selectArea.removeChild(selectArea.lastChild);
      }
      
      todasAreas.sort().forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        selectArea.appendChild(option);
      });
      
      if (valorAtualArea && todasAreas.includes(valorAtualArea)) {
        selectArea.value = valorAtualArea;
      } else {
        selectArea.value = '';
      }
    }
  }
  
  // Atualizar Funções (se lotação foi selecionada)
  if (filtroLotacao) {
    const selectFuncao = document.getElementById('filtro-funcao');
    if (selectFuncao) {
      const valorAtual = selectFuncao.value;
      const funcoesDisponiveis = valoresUnicos(dadosFiltrados, 'funcao').filter(f => f && f.trim() !== '');
      
      while (selectFuncao.children.length > 1) {
        selectFuncao.removeChild(selectFuncao.lastChild);
      }
      
      funcoesDisponiveis.sort().forEach(func => {
        const option = document.createElement('option');
        option.value = func;
        option.textContent = func;
        selectFuncao.appendChild(option);
      });
      
      if (valorAtual && funcoesDisponiveis.includes(valorAtual)) {
        selectFuncao.value = valorAtual;
      } else {
        selectFuncao.value = '';
      }
    }
  }
  
  // Atualizar Vínculos (se lotação ou função foi selecionada)
  if (filtroLotacao || filtroFuncao) {
    const selectVinculo = document.getElementById('filtro-vinculo');
    if (selectVinculo) {
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
  }
  
  // Atualizar Situações (se qualquer filtro foi selecionado)
  if (filtroLotacao || filtroFuncao || filtroVinculo) {
    const selectSituacao = document.getElementById('filtro-situacao');
    if (selectSituacao) {
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
  }
  
  // Atualizar Áreas (se lotação foi selecionada)
  if (filtroLotacao) {
    const selectArea = document.getElementById('filtro-area');
    if (selectArea) {
      const valorAtual = selectArea.value;
      const areasDisponiveis = valoresUnicos(dadosFiltrados, 'area').filter(a => a && a.trim() !== '');
      
      while (selectArea.children.length > 1) {
        selectArea.removeChild(selectArea.lastChild);
      }
      
      areasDisponiveis.sort().forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        selectArea.appendChild(option);
      });
      
      if (valorAtual && areasDisponiveis.includes(valorAtual)) {
        selectArea.value = valorAtual;
      } else {
        selectArea.value = '';
      }
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
  
  const totalFuncionariosEl = document.getElementById('total-funcionarios');
  const totalVinculosEl = document.getElementById('total-vinculos');
  const totalLiquidoEl = document.getElementById('total-liquido');
  const totalVantagensEl = document.getElementById('total-vantagens');
  const totalDescontosEl = document.getElementById('total-descontos');
  
  if (totalFuncionariosEl) totalFuncionariosEl.textContent = stats.totalFuncionarios.toLocaleString('pt-BR');
  if (totalVinculosEl) totalVinculosEl.textContent = stats.totalVinculos.toLocaleString('pt-BR');
  if (totalLiquidoEl) totalLiquidoEl.textContent = formatarMoeda(stats.totalLiquido);
  if (totalVantagensEl) totalVantagensEl.textContent = formatarMoeda(stats.totalVantagem);
  if (totalDescontosEl) totalDescontosEl.textContent = formatarMoeda(stats.totalDesconto);
}

/**
 * Cria/atualiza todos os gráficos
 */
function criarGraficos() {
  criarGraficoLotacao();
  criarGraficoEvolucao(evolucaoViewMode);
  criarGraficoTopSalarios();
}

/**
 * Cria gráfico de distribuição por lotação (Doughnut)
 */
function criarGraficoLotacao() {
  const ctx = document.getElementById('chart-lotacao');
  if (!ctx) return;
  
  if (charts.lotacao) {
    charts.lotacao.destroy();
  }
  
  const agregado = agregarPorLotacao(dadosFiltrados);
  const dados = Object.values(agregado)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
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
              return `${label}: ${value} empenhos (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Cria gráfico de evolução mensal (Line)
 */
function criarGraficoEvolucao(viewMode = 'ultimo') {
  const ctx = document.getElementById('chart-evolucao');
  if (!ctx) return;
  
  if (charts.evolucao) {
    charts.evolucao.destroy();
  }
  
  const agregado = agregarPorCompetencia(dadosFiltrados);
  let competencias = Object.keys(agregado).sort();
  
  if (viewMode === 'ultimo' && competencias.length > 0) {
    competencias = [competencias[competencias.length - 1]];
  } else if (viewMode === '3meses' && competencias.length > 3) {
    competencias = competencias.slice(-3);
  }
  
  const liquidos = competencias.map(comp => agregado[comp].liquido);
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f1f5f9' : '#1f2937';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  charts.evolucao = new Chart(ctx, {
    type: 'line',
    data: {
      labels: competencias.map(formatarCompetenciaCurta),
      datasets: [{
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
  
  const filtroAno = document.getElementById('filtro-ano');
  const filtroCompetencia = document.getElementById('filtro-competencia');
  const filtroLotacao = document.getElementById('filtro-lotacao');
  const filtroFuncao = document.getElementById('filtro-funcao');
  const filtroVinculo = document.getElementById('filtro-vinculo');
  const filtroSituacao = document.getElementById('filtro-situacao');
  const filtroArea = document.getElementById('filtro-area');
  const filtroBuscaNome = document.getElementById('filtro-busca-nome');
  const btnLimparFiltros = document.getElementById('btn-limpar-filtros');
  
  // Para lotação, função, vínculo e situação, atualizar filtros dinâmicos antes
  if (filtroAno) filtroAno.addEventListener('change', aplicarFiltrosComAtualizacao);
  if (filtroCompetencia) filtroCompetencia.addEventListener('change', aplicarFiltrosComAtualizacao);
  if (filtroLotacao) filtroLotacao.addEventListener('change', aplicarFiltrosComAtualizacao);
  if (filtroFuncao) filtroFuncao.addEventListener('change', aplicarFiltrosComAtualizacao);
  if (filtroVinculo) filtroVinculo.addEventListener('change', aplicarFiltrosComAtualizacao);
  if (filtroSituacao) filtroSituacao.addEventListener('change', aplicarFiltrosComAtualizacao);
  if (filtroArea) filtroArea.addEventListener('change', aplicarFiltros);
  if (filtroBuscaNome) filtroBuscaNome.addEventListener('input', aplicarFiltrosDebounced);
  const filtroMultiplosVinculos = document.getElementById('filtro-multiplos-vinculos');
  if (filtroMultiplosVinculos) {
    filtroMultiplosVinculos.addEventListener('change', aplicarFiltros);
  }
  
  if (btnLimparFiltros) {
    btnLimparFiltros.addEventListener('click', () => {
      if (filtroAno) filtroAno.value = '';
      if (filtroCompetencia) filtroCompetencia.value = '';
      if (filtroLotacao) filtroLotacao.value = '';
      if (filtroFuncao) filtroFuncao.value = '';
      if (filtroVinculo) filtroVinculo.value = '';
      if (filtroSituacao) filtroSituacao.value = '';
      if (filtroArea) filtroArea.value = '';
      if (filtroBuscaNome) filtroBuscaNome.value = '';
      const filtroMultiplosVinculos = document.getElementById('filtro-multiplos-vinculos');
      if (filtroMultiplosVinculos) filtroMultiplosVinculos.checked = false;
      
      // Restaurar todos os filtros ao estado inicial
      preencherFiltros();
      aplicarFiltros();
    });
  }
  
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
        botoes.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const viewMode = this.getAttribute('data-evolucao-view');
        evolucaoViewMode = viewMode;
        criarGraficoEvolucao(viewMode);
      });
    });
  }
  
  // Cards de relatórios
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
    
    let renderFunction;
    
    console.log(`📦 Importando módulo do relatório: ${nomeRelatorio}`);
    switch(nomeRelatorio) {
      case 'vencimentos-empenho':
        ({ renderRelatorioVencimentosEmpenho: renderFunction } = await import('./relatorio-vencimentos-empenho.js'));
        break;
      case 'lotacao-empenho':
        ({ renderRelatorioLotacaoEmpenho: renderFunction } = await import('./relatorio-lotacao-empenho.js'));
        break;
      case 'top-salarios-empenho':
        ({ renderRelatorioTopSalariosEmpenho: renderFunction } = await import('./relatorio-top-salarios-empenho.js'));
        break;
      case 'consolidado-empenho':
        ({ renderRelatorioConsolidadoEmpenho: renderFunction } = await import('./relatorio-consolidado-empenho.js'));
        break;
      default:
        throw new Error('Relatório não encontrado');
    }
    
    relatorioAtual = nomeRelatorio;
    renderFunctionAtual = renderFunction;
    
    const container = document.getElementById('relatorio-detalhado-container');
    if (!container) {
      console.error('❌ Container de relatório não encontrado!');
      throw new Error('Container de relatório não encontrado');
    }
    
    console.log(`✅ Container encontrado, renderizando com ${dadosFiltrados.length} registros`);
    
    renderFunction(dadosFiltrados);
    console.log('✅ Relatório renderizado');
    
    adicionarBotaoVoltar();
    console.log('✅ Botão voltar adicionado');
    
    const dashboardMain = document.getElementById('dashboard-main');
    const relatoriosContainer = document.getElementById('relatorios-container');
    
    if (dashboardMain) {
      dashboardMain.style.display = 'none';
      console.log('✅ Dashboard principal escondido');
    }
    
    if (relatoriosContainer) {
      relatoriosContainer.style.display = 'none';
      console.log('✅ Container de relatórios escondido');
    }
    
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
  
  const nomesRelatorios = {
    'vencimentos-empenho': 'Relatório de Vencimentos - Empenho',
    'lotacao-empenho': 'Relatório por Lotação - Empenho',
    'top-salarios-empenho': 'Top Salários - Empenho',
    'consolidado-empenho': 'Relatório Consolidado - Empenho'
  };
  
  const nomeRelatorio = nomesRelatorios[relatorioAtual] || 'Relatório';
  
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
  
  window.voltarAoDashboard = voltarAoDashboard;
}

/**
 * Função para voltar ao dashboard
 */
function voltarAoDashboard() {
  const container = document.getElementById('relatorio-detalhado-container');
  
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
  
  relatorioAtual = null;
  renderFunctionAtual = null;
  
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
  
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
}

/**
 * Aplica filtros aos dados
 */
function aplicarFiltros() {
  const filtros = {
    ano: document.getElementById('filtro-ano')?.value || '',
    competencia: document.getElementById('filtro-competencia')?.value || '',
    lotacao: document.getElementById('filtro-lotacao')?.value || '',
    funcao: document.getElementById('filtro-funcao')?.value || '',
    vinculo: document.getElementById('filtro-vinculo')?.value || '',
    situacao: document.getElementById('filtro-situacao')?.value || '',
    area: document.getElementById('filtro-area')?.value || '',
    buscaNome: document.getElementById('filtro-busca-nome')?.value.trim() || '',
    multiplosVinculos: document.getElementById('filtro-multiplos-vinculos')?.checked || false
  };
  
  dadosFiltrados = filtrarEmpenho(dadosCompletos, filtros);
  
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
      if (matricula) pessoa.matriculas.add(matricula);
      if (reg.competencia) pessoa.competencias.add(reg.competencia);
    } else if (nome && nome !== 'Sem nome') {
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
      if (matricula) pessoa.matriculas.add(matricula);
      if (reg.competencia) pessoa.competencias.add(reg.competencia);
    }
  });
  
  // Exibir banner com informações
  banner.classList.remove('d-none');
  
  const totalPessoas = pessoasUnicas.size;
  const totalRegistros = dadosFiltrados.length;
  
  let html = `<p class="mb-0">Encontrados <strong>${totalRegistros.toLocaleString('pt-BR')}</strong> registro(s) para <strong>"${buscaNome}"</strong>`;
  
  if (totalPessoas > 0) {
    html += `, referentes a <strong>${totalPessoas.toLocaleString('pt-BR')}</strong> pessoa(s) única(s)`;
    
    // Mostrar informações sobre múltiplos vínculos se houver
    const pessoasComMultiplosVinculos = Array.from(pessoasUnicas.values())
      .filter(p => p.matriculas.size > 1);
    
    if (pessoasComMultiplosVinculos.length > 0) {
      html += ` (${pessoasComMultiplosVinculos.length} com múltiplos vínculos)`;
    }
  }
  
  html += `.</p>`;
  
  conteudo.innerHTML = html;
}

// Expor charts globalmente para o dark mode toggle
window.dashboardCharts = charts;

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

