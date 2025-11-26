/**
 * SERVIÇO DE FOLHA DE PAGAMENTO
 * Funções para carregamento e manipulação de dados
 */

import { mapearLotacao, obterLotacoesOriginais, obterSublotacoes } from '../utils/lotacao-mapping.js';

/**
 * Lista todos os arquivos JSON disponíveis dinamicamente
 * Descobre automaticamente todos os arquivos na pasta converted/
 * Funciona tanto em ambiente com servidor (Express) quanto em ambiente estático (Netlify)
 * @returns {Promise<Array<string>>} Array com nomes dos arquivos
 */
export async function listarArquivosJSON() {
  try {
    // Tentar primeiro usar o arquivo de índice estático (para Netlify/ambiente estático)
    try {
      const response = await fetch('/converted/files.json');
      if (response.ok) {
        const arquivos = await response.json();
        console.log(`📁 ${arquivos.length} arquivos JSON encontrados (arquivo de índice)`);
        
        if (arquivos.length === 0) {
          console.warn('⚠️ Nenhum arquivo JSON encontrado. Verifique se a pasta converted/ contém arquivos.');
        }
        
        return arquivos;
      }
    } catch (staticError) {
      console.log('📝 Arquivo de índice não encontrado, tentando API do servidor...');
    }
    
    // Fallback: tentar API do servidor (para desenvolvimento local)
    const response = await fetch('/api/converted/list');
    if (!response.ok) {
      throw new Error(`Erro ao listar arquivos: ${response.statusText}`);
    }
    const arquivos = await response.json();
    console.log(`📁 ${arquivos.length} arquivos JSON encontrados (API do servidor)`);
    
    if (arquivos.length === 0) {
      console.warn('⚠️ Nenhum arquivo JSON encontrado. Verifique se a pasta converted/ contém arquivos.');
    }
    
    return arquivos;
  } catch (error) {
    console.error('❌ Erro ao listar arquivos JSON:', error);
    // Fallback: retornar array vazio se ambos os métodos falharem
    // Isso permite que o sistema continue funcionando mesmo se a API não estiver disponível
    return [];
  }
}

/**
 * Carrega um arquivo JSON específico
 * @param {string} arquivo - Nome do arquivo
 * @returns {Promise<Object>} Dados do arquivo
 */
export async function carregarFolha(arquivo) {
  try {
    const response = await fetch(`/converted/${arquivo}`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar arquivo: ${response.statusText}`);
    }
    const data = await response.json();
    
    // NÃO REMOVER DUPLICATAS - Pessoas podem ter múltiplos vínculos (mesmo CPF, vínculos diferentes)
    // O JSON é a fonte da verdade, carregar tudo exatamente como está
    if (data.registros && data.registros.length > 0) {
      console.log(`📄 Arquivo ${arquivo}: ${data.registros.length} registros carregados`);
      
      // Log de informações
      const situacoes = {};
      data.registros.forEach(reg => {
        const situacao = reg.situacao || 'NÃO INFORMADO';
        situacoes[situacao] = (situacoes[situacao] || 0) + 1;
      });
      
      console.log(`   Situações encontradas:`, situacoes);
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao carregar folha:', error);
    throw error;
  }
}

/**
 * Carrega um arquivo específico por competência
 * @param {string} competencia - Formato YYYY-MM
 * @returns {Promise<Object>} Dados do arquivo
 */
export async function carregarFolhaPorCompetencia(competencia) {
  const arquivos = await listarArquivosJSON();
  const arquivo = arquivos.find(a => a.startsWith(competencia));
  
  if (!arquivo) {
    throw new Error(`Arquivo não encontrado para competência ${competencia}`);
  }
  
  return await carregarFolha(arquivo);
}

/**
 * Carrega e combina todos os arquivos JSON disponíveis
 * @returns {Promise<Array>} Array único com todos os registros
 */
export async function carregarTodasFolhas() {
  try {
    const arquivos = await listarArquivosJSON();
    const todasFolhas = [];
    let totalRegistrosJSON = 0;
    
    // CARREGAR TODOS OS REGISTROS SEM FILTRAR NADA
    // O JSON é a fonte da verdade - não devemos perder nenhum registro
    for (const arquivo of arquivos) {
      const data = await carregarFolha(arquivo);
      
      if (!data.registros || !Array.isArray(data.registros)) {
        console.warn(`⚠️ Arquivo ${arquivo} não tem registros ou formato inválido`);
        continue;
      }
      
      const registrosNoArquivo = data.registros.length;
      totalRegistrosJSON += registrosNoArquivo;
      
      // Adicionar competencia a cada registro
      // IMPORTANTE: NÃO FILTRAR NADA - ADICIONAR TODOS OS REGISTROS
      data.registros.forEach((reg, idx) => {
        // Garantir que o registro tenha competência
        if (!reg.competencia) {
          reg.competencia = data.competencia;
        }
        
        // ADICIONAR TODOS OS REGISTROS - SEM FILTROS
        todasFolhas.push(reg);
      });
      
      console.log(`   ✅ ${arquivo}: ${registrosNoArquivo} registros adicionados`);
    }
    
    console.log(`📊 TOTAL: ${totalRegistrosJSON} registros no JSON → ${todasFolhas.length} registros carregados`);
    
    // Verificar se perdemos algum registro
    if (totalRegistrosJSON !== todasFolhas.length) {
      console.error(`❌ ERRO: Perdemos ${totalRegistrosJSON - todasFolhas.length} registros!`);
    }
    
    return todasFolhas;
  } catch (error) {
    console.error('Erro ao carregar todas as folhas:', error);
    throw error;
  }
}

/**
 * Carrega o arquivo de resumo pré-processado
 * @returns {Promise<Object>} Dados agregados
 */
export async function carregarResumo() {
  try {
    const response = await fetch('/converted/dashboard_data_summary.json');
    if (!response.ok) {
      throw new Error(`Erro ao carregar resumo: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar resumo:', error);
    throw error;
  }
}

/**
 * Aplica filtros aos dados
 * @param {Array} dados - Array de registros
 * @param {Object} filtros - Objeto com filtros
 * @returns {Array} Dados filtrados
 */
export function filtrarFolha(dados, filtros) {
  let resultado = [...dados];
  
  // Filtro por ano
  if (filtros.ano && filtros.ano.trim() !== '') {
    resultado = resultado.filter(r => {
      if (!r.competencia) return false;
      const anoRegistro = r.competencia.split('-')[0];
      return anoRegistro === filtros.ano.trim();
    });
  }
  
  // Filtro por competência
  if (filtros.competencia) {
    resultado = resultado.filter(r => r.competencia === filtros.competencia);
  }
  
  // Filtro por lotação - usar mapeamento reverso para encontrar todas as lotações normalizadas que mapeiam para a lotação correta
  // Se for uma lotação principal, incluir também todas as suas sublotações
  if (filtros.lotacao) {
    const sublots = obterSublotacoes(filtros.lotacao);
    
    // Criar conjunto de todas as lotações corretas que devem ser incluídas
    const lotacoesCorretasParaIncluir = new Set([filtros.lotacao]);
    
    // Se for uma lotação principal, adicionar todas as suas sublotações
    if (sublots.length > 0) {
      sublots.forEach(sublot => {
        lotacoesCorretasParaIncluir.add(sublot);
      });
    }
    
    // Agora, para cada lotação correta, obter todas as lotações normalizadas originais que mapeiam para ela
    const lotacoesOriginaisParaIncluir = new Set();
    lotacoesCorretasParaIncluir.forEach(lotacaoCorreta => {
      const originais = obterLotacoesOriginais(lotacaoCorreta);
      originais.forEach(orig => lotacoesOriginaisParaIncluir.add(orig));
    });
    
    resultado = resultado.filter(r => {
      const lotacaoMapeada = mapearLotacao(r.lotacao_normalizada, r.lotacao_original);
      // Verificar se a lotação mapeada está no conjunto de lotações corretas OU se a lotação original está no conjunto de originais
      return lotacoesCorretasParaIncluir.has(lotacaoMapeada) || lotacoesOriginaisParaIncluir.has(r.lotacao_normalizada);
    });
  }
  
  // Filtro por função
  if (filtros.funcao) {
    resultado = resultado.filter(r => r.funcao === filtros.funcao);
  }
  
  // Filtro por vínculo
  if (filtros.vinculo) {
    resultado = resultado.filter(r => r.vinculo === filtros.vinculo);
  }
  
  // Filtro por nível
  if (filtros.nivel) {
    resultado = resultado.filter(r => r.nivel === filtros.nivel);
  }
  
  // Filtro por situação - normalizar para maiúsculas para garantir match
  if (filtros.situacao) {
    const situacaoFiltro = filtros.situacao.trim().toUpperCase();
    resultado = resultado.filter(r => {
      const situacaoRegistro = (r.situacao && r.situacao.trim() !== '') 
        ? r.situacao.trim().toUpperCase() 
        : 'NÃO INFORMADO';
      return situacaoRegistro === situacaoFiltro;
    });
  }
  
  // Filtro por motivo de afastamento
  if (filtros.motivoAfastamento && filtros.motivoAfastamento.trim() !== '') {
    const motivoFiltro = filtros.motivoAfastamento.trim();
    resultado = resultado.filter(r => {
      const motivoRegistro = (r.motivo_afastamento && r.motivo_afastamento.trim() !== '') 
        ? r.motivo_afastamento.trim() 
        : '';
      return motivoRegistro === motivoFiltro;
    });
    console.log(`🔍 Filtro de motivo aplicado: "${motivoFiltro}" - ${resultado.length} registros encontrados`);
  }
  
  // Busca por nome
  if (filtros.buscaNome) {
    const busca = filtros.buscaNome.toLowerCase();
    resultado = resultado.filter(r => 
      r.nome.toLowerCase().includes(busca)
    );
  }
  
  return resultado;
}

/**
 * Agrupa dados por competência (mês/ano)
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com competências como chaves
 */
export function agregarPorCompetencia(dados) {
  return dados.reduce((acc, registro) => {
    // Filtrar registros inválidos
    if (!registro || typeof registro !== 'object') {
      return acc;
    }
    
    // Validar valores numéricos - usar 0 apenas se for NaN/null/undefined, não se for 0 válido
    const liquido = isNaN(Number(registro.liquido)) ? 0 : Number(registro.liquido);
    const vantagem = isNaN(Number(registro.vantagem)) ? 0 : Number(registro.vantagem);
    const desconto = isNaN(Number(registro.desconto)) ? 0 : Number(registro.desconto);
    
    // Ignorar valores extremos
    const MAX_VALOR = 10000000;
    if (liquido > MAX_VALOR || vantagem > MAX_VALOR || desconto > MAX_VALOR) {
      return acc;
    }
    
    const comp = registro.competencia;
    if (!acc[comp]) {
      acc[comp] = {
        competencia: comp,
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0, // Total de registros
        funcionariosUnicos: new Set(), // Funcionários únicos
        funcionarios: []
      };
    }
    
    acc[comp].liquido += liquido;
    acc[comp].vantagem += vantagem;
    acc[comp].desconto += desconto;
    acc[comp].count += 1;
    
    // Contar funcionários únicos por CPF
    if (registro.cpf && registro.cpf.trim() !== '') {
      acc[comp].funcionariosUnicos.add(registro.cpf.trim());
    } else if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
      acc[comp].funcionariosUnicos.add(registro.nome.trim());
    }
    
    if (registro.nome && registro.nome !== '*Totais*') {
      acc[comp].funcionarios.push(registro.nome);
    }
    
    return acc;
  }, {});
}

/**
 * Agrupa dados por ano
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com anos como chaves (ex: "2025", "2026")
 */
export function agregarPorAno(dados) {
  return dados.reduce((acc, registro) => {
    // Filtrar registros inválidos
    if (!registro || typeof registro !== 'object') {
      return acc;
    }
    
    // Extrair ano da competência (formato: "YYYY-MM")
    let ano = 'NÃO INFORMADO';
    if (registro.competencia) {
      const partes = registro.competencia.split('-');
      ano = partes[0] || 'NÃO INFORMADO';
    }
    
    // Validar valores numéricos - usar 0 apenas se for NaN/null/undefined
    const liquido = isNaN(Number(registro.liquido)) ? 0 : Number(registro.liquido);
    const vantagem = isNaN(Number(registro.vantagem)) ? 0 : Number(registro.vantagem);
    const desconto = isNaN(Number(registro.desconto)) ? 0 : Number(registro.desconto);
    
    // Ignorar valores extremos
    const MAX_VALOR = 10000000;
    if (liquido > MAX_VALOR || vantagem > MAX_VALOR || desconto > MAX_VALOR) {
      return acc;
    }
    
    if (!acc[ano]) {
      acc[ano] = {
        ano: ano,
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0, // Total de registros
        funcionariosUnicos: new Set(), // Funcionários únicos por CPF
        competencias: new Set(), // Competências únicas neste ano
        funcionarios: []
      };
    }
    
    acc[ano].liquido += liquido;
    acc[ano].vantagem += vantagem;
    acc[ano].desconto += desconto;
    acc[ano].count += 1;
    
    // Adicionar competência ao conjunto
    if (registro.competencia) {
      acc[ano].competencias.add(registro.competencia);
    }
    
    // Contar funcionários únicos por CPF
    if (registro.cpf && registro.cpf.trim() !== '') {
      acc[ano].funcionariosUnicos.add(registro.cpf.trim());
    } else if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
      acc[ano].funcionariosUnicos.add(registro.nome.trim());
    }
    
    if (registro.nome && registro.nome !== '*Totais*') {
      acc[ano].funcionarios.push(registro.nome);
    }
    
    return acc;
  }, {});
}

/**
 * Agrupa dados por lotação normalizada
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com lotações como chaves
 */
export function agregarPorLotacao(dados) {
  return dados.reduce((acc, registro) => {
    // Filtrar registros inválidos ou com valores extremos
    if (!registro || typeof registro !== 'object') {
      return acc;
    }
    
    // Validar valores numéricos antes de agregar - usar 0 apenas se for NaN/null/undefined
    const liquido = isNaN(Number(registro.liquido)) ? 0 : Number(registro.liquido);
    const vantagem = isNaN(Number(registro.vantagem)) ? 0 : Number(registro.vantagem);
    const desconto = isNaN(Number(registro.desconto)) ? 0 : Number(registro.desconto);
    
    // Ignorar valores extremamente altos que podem ser erros de dados
    const MAX_VALOR = 10000000; // 10 milhões como limite razoável
    if (liquido > MAX_VALOR || vantagem > MAX_VALOR || desconto > MAX_VALOR) {
      console.warn('Valor extremo detectado e ignorado na agregação por lotação:', {
        nome: registro.nome,
        lotacao: registro.lotacao_normalizada || registro.lotacao,
        liquido,
        vantagem,
        desconto
      });
      return acc;
    }
    
    const lotacaoNormalizada = registro.lotacao_normalizada || registro.lotacao || 'SEM LOTAÇÃO';
    const lotacaoOriginal = registro.lotacao_original || registro.lotacao_original || null;
    const lotacao = mapearLotacao(lotacaoNormalizada, lotacaoOriginal);
    
    // Ignorar se o mapeamento retornar null (ex: SEM LOTAÇÃO)
    if (!lotacao) {
      return acc;
    }
    
    if (!acc[lotacao]) {
      acc[lotacao] = {
        lotacao: lotacao,
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0,
        funcionariosUnicos: new Set(), // Funcionários únicos por CPF
        funcionarios: []
      };
    }
    
    acc[lotacao].liquido += liquido;
    acc[lotacao].vantagem += vantagem;
    acc[lotacao].desconto += desconto;
    acc[lotacao].count += 1;
    
    // Contar funcionários únicos por CPF
    if (registro.cpf && registro.cpf.trim() !== '') {
      acc[lotacao].funcionariosUnicos.add(registro.cpf.trim());
    } else if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
      acc[lotacao].funcionariosUnicos.add(registro.nome.trim());
    }
    
    if (registro.nome && registro.nome !== '*Totais*') {
      acc[lotacao].funcionarios.push(registro.nome);
    }
    
    return acc;
  }, {});
}

/**
 * Agrupa dados por tipo de vínculo
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com vínculos como chaves
 */
export function agregarPorVinculo(dados) {
  return dados.reduce((acc, registro) => {
    // Filtrar registros inválidos ou com valores extremos
    if (!registro || typeof registro !== 'object') {
      return acc;
    }
    
    // Validar valores numéricos antes de agregar - usar 0 apenas se for NaN/null/undefined
    const liquido = isNaN(Number(registro.liquido)) ? 0 : Number(registro.liquido);
    const vantagem = isNaN(Number(registro.vantagem)) ? 0 : Number(registro.vantagem);
    const desconto = isNaN(Number(registro.desconto)) ? 0 : Number(registro.desconto);
    
    // Ignorar valores extremamente altos que podem ser erros de dados
    const MAX_VALOR = 10000000; // 10 milhões como limite razoável
    if (liquido > MAX_VALOR || vantagem > MAX_VALOR || desconto > MAX_VALOR) {
      console.warn('Valor extremo detectado e ignorado:', {
        nome: registro.nome,
        vinculo: registro.vinculo,
        liquido,
        vantagem,
        desconto
      });
      return acc;
    }
    
    const vinculo = (registro.vinculo && registro.vinculo.trim() !== '') 
      ? registro.vinculo.trim() 
      : 'NÃO INFORMADO';
    
    if (!acc[vinculo]) {
      acc[vinculo] = {
        vinculo: vinculo,
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0, // Contagem de registros
        funcionariosUnicos: new Set(), // Funcionários únicos por CPF
        funcionarios: []
      };
    }
    
    acc[vinculo].liquido += liquido;
    acc[vinculo].vantagem += vantagem;
    acc[vinculo].desconto += desconto;
    acc[vinculo].count += 1; // Total de registros
    
    // Contar funcionários únicos por CPF
    if (registro.cpf && registro.cpf.trim() !== '') {
      acc[vinculo].funcionariosUnicos.add(registro.cpf.trim());
    } else if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
      acc[vinculo].funcionariosUnicos.add(registro.nome.trim());
    }
    
    if (registro.nome) {
      acc[vinculo].funcionarios.push(registro.nome);
    }
    
    return acc;
  }, {});
}

/**
 * Agrupa dados por situação (ATIVO/AFASTADO)
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com situações como chaves
 */
export function agregarPorSituacao(dados) {
  const resultado = dados.reduce((acc, registro) => {
    // Filtrar registros inválidos ou com valores extremos
    if (!registro || typeof registro !== 'object') {
      return acc;
    }
    
    // Validar valores numéricos antes de agregar - usar 0 apenas se for NaN/null/undefined
    const liquido = isNaN(Number(registro.liquido)) ? 0 : Number(registro.liquido);
    const vantagem = isNaN(Number(registro.vantagem)) ? 0 : Number(registro.vantagem);
    const desconto = isNaN(Number(registro.desconto)) ? 0 : Number(registro.desconto);
    
    // Ignorar valores extremamente altos que podem ser erros de dados
    const MAX_VALOR = 10000000; // 10 milhões como limite razoável
    if (liquido > MAX_VALOR || vantagem > MAX_VALOR || desconto > MAX_VALOR) {
      console.warn('Valor extremo detectado e ignorado na agregação por situação:', {
        nome: registro.nome,
        situacao: registro.situacao,
        liquido,
        vantagem,
        desconto
      });
      return acc;
    }
    
    // Normalizar situação - garantir que não seja vazio e seja maiúsculo
    let situacao = (registro.situacao && registro.situacao.trim() !== '') 
      ? registro.situacao.trim().toUpperCase() 
      : 'NÃO INFORMADO';
    if (!acc[situacao]) {
      acc[situacao] = {
        situacao: situacao,
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0, // Contagem de registros
        funcionariosUnicos: new Set(), // Funcionários únicos por CPF
        funcionarios: [],
        motivosAfastamento: []
      };
    }
    acc[situacao].liquido += liquido;
    acc[situacao].vantagem += vantagem;
    acc[situacao].desconto += desconto;
    acc[situacao].count += 1; // Total de registros
    
    // Contar funcionários únicos por CPF
    if (registro.cpf && registro.cpf.trim() !== '') {
      acc[situacao].funcionariosUnicos.add(registro.cpf.trim());
    } else if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
      acc[situacao].funcionariosUnicos.add(registro.nome.trim());
    }
    
    // Adicionar nome à lista (mesmo que seja duplicado, queremos todos)
    if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
      acc[situacao].funcionarios.push(registro.nome);
    }
    
    // Motivos de afastamento
    if (situacao === 'AFASTADO' && registro.motivo_afastamento) {
      acc[situacao].motivosAfastamento.push({
        nome: registro.nome,
        motivo: registro.motivo_afastamento
      });
    }
    
    return acc;
  }, {});
  
  // Log detalhado para debug
  const totalAtivos = resultado['ATIVO'] ? resultado['ATIVO'].funcionariosUnicos.size : 0;
  const totalRegistrosAtivos = resultado['ATIVO'] ? resultado['ATIVO'].count : 0;
  
  console.log(`📊 Agregação por Situação - DETALHADO:`, {
    totalRegistrosRecebidos: dados.length,
    totalAtivosUnicos: totalAtivos,
    totalRegistrosAtivos: totalRegistrosAtivos,
    situacoesEncontradas: Object.keys(resultado).length,
    detalhes: Object.entries(resultado).map(([sit, dados]) => ({
      situacao: sit,
      registros: dados.count,
      funcionariosUnicos: dados.funcionariosUnicos.size,
      totalLiquido: dados.liquido.toFixed(2)
    }))
  });
  
  return resultado;
}

/**
 * Agrupa por função e nível
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com chave "funcao_nivel"
 */
export function agregarPorFuncaoNivel(dados) {
  return dados.reduce((acc, registro) => {
    // Filtrar registros inválidos ou com valores extremos
    if (!registro || typeof registro !== 'object') {
      return acc;
    }
    
    // Validar valores numéricos antes de agregar - usar 0 apenas se for NaN/null/undefined
    const liquido = isNaN(Number(registro.liquido)) ? 0 : Number(registro.liquido);
    const vantagem = isNaN(Number(registro.vantagem)) ? 0 : Number(registro.vantagem);
    const desconto = isNaN(Number(registro.desconto)) ? 0 : Number(registro.desconto);
    
    // Ignorar valores extremamente altos que podem ser erros de dados
    const MAX_VALOR = 10000000; // 10 milhões como limite razoável
    if (liquido > MAX_VALOR || vantagem > MAX_VALOR || desconto > MAX_VALOR) {
      console.warn('Valor extremo detectado e ignorado na agregação por função/nível:', {
        nome: registro.nome,
        funcao: registro.funcao,
        nivel: registro.nivel,
        liquido,
        vantagem,
        desconto
      });
      return acc;
    }
    
    const funcao = registro.funcao || 'NÃO INFORMADO';
    const nivel = registro.nivel || 'NÃO INFORMADO';
    const chave = `${funcao}_${nivel}`;
    
    if (!acc[chave]) {
      acc[chave] = {
        funcao,
        nivel,
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0,
        funcionarios: []
      };
    }
    
    acc[chave].liquido += liquido;
    acc[chave].vantagem += vantagem;
    acc[chave].desconto += desconto;
    acc[chave].count += 1;
    
    if (registro.nome && registro.nome !== '*Totais*') {
      acc[chave].funcionarios.push(registro.nome);
    }
    
    return acc;
  }, {});
}

/**
 * Agrupa apenas por função
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com funções como chaves
 */
export function agregarPorFuncao(dados) {
  return dados.reduce((acc, registro) => {
    // Filtrar registros inválidos ou com valores extremos
    if (!registro || typeof registro !== 'object') {
      return acc;
    }
    
    // Validar valores numéricos antes de agregar - usar 0 apenas se for NaN/null/undefined
    const liquido = isNaN(Number(registro.liquido)) ? 0 : Number(registro.liquido);
    const vantagem = isNaN(Number(registro.vantagem)) ? 0 : Number(registro.vantagem);
    const desconto = isNaN(Number(registro.desconto)) ? 0 : Number(registro.desconto);
    
    // Ignorar valores extremamente altos que podem ser erros de dados
    const MAX_VALOR = 10000000; // 10 milhões como limite razoável
    if (liquido > MAX_VALOR || vantagem > MAX_VALOR || desconto > MAX_VALOR) {
      console.warn('Valor extremo detectado e ignorado na agregação por função:', {
        nome: registro.nome,
        funcao: registro.funcao,
        liquido,
        vantagem,
        desconto
      });
      return acc;
    }
    
    const funcao = registro.funcao || 'NÃO INFORMADO';
    
    if (!acc[funcao]) {
      acc[funcao] = {
        funcao,
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0,
        mediaLiquido: 0
      };
    }
    
    acc[funcao].liquido += liquido;
    acc[funcao].vantagem += vantagem;
    acc[funcao].desconto += desconto;
    acc[funcao].count += 1;
    
    return acc;
  }, {});
}

/**
 * Calcula estatísticas gerais dos dados
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com estatísticas
 */
export function calcularEstatisticas(dados) {
  if (!dados || dados.length === 0) {
    return {
      totalFuncionarios: 0,
      totalRegistros: 0,
      totalLiquido: 0,
      totalVantagem: 0,
      totalDesconto: 0,
      mediaLiquido: 0,
      medianaLiquido: 0,
      maiorLiquido: 0,
      menorLiquido: 0
    };
  }
  
  // Contar funcionários únicos por CPF (ou nome+CPF se CPF não disponível)
  const funcionariosUnicos = new Set();
  dados.forEach(r => {
    if (r.cpf && r.cpf.trim() !== '') {
      funcionariosUnicos.add(r.cpf.trim());
    } else if (r.nome && r.nome.trim() !== '' && r.nome !== '*Totais*') {
      // Fallback: usar nome se CPF não disponível
      funcionariosUnicos.add(r.nome.trim());
    }
  });
  
  const totalFuncionarios = funcionariosUnicos.size; // Funcionários únicos
  const totalRegistros = dados.length; // Total de registros (pode ter múltiplos meses)
  
  // Validar e somar valores, ignorando valores extremos
  const MAX_VALOR = 10000000; // 10 milhões como limite
  const totalLiquido = dados.reduce((sum, r) => {
    const valor = Number(r.liquido) || 0;
    if (valor > MAX_VALOR) {
      console.warn('Valor extremo ignorado em calcularEstatisticas (liquido):', r.nome, valor);
      return sum;
    }
    return sum + valor;
  }, 0);
  
  const totalVantagem = dados.reduce((sum, r) => {
    const valor = Number(r.vantagem) || 0;
    if (valor > MAX_VALOR) {
      console.warn('Valor extremo ignorado em calcularEstatisticas (vantagem):', r.nome, valor);
      return sum;
    }
    return sum + valor;
  }, 0);
  
  // Calcular total de desconto com validação detalhada
  let totalDesconto = 0;
  let descontosIgnorados = 0;
  let descontosInvalidos = 0;
  let descontosNegativos = 0;
  
  dados.forEach(r => {
    // IGNORAR registros de totais/agregações que podem distorcer os cálculos
    if (r.nome && (r.nome.includes('*Totais*') || r.nome.includes('TOTAL') || r.nome.includes('TOTAL GERAL'))) {
      console.warn('⚠️ Registro de total ignorado:', r.nome);
      return; // Ignorar registros de total
    }
    
    const descontoOriginal = r.desconto;
    const valor = Number(descontoOriginal);
    
    // Verificar se é NaN ou não é um número válido
    if (isNaN(valor)) {
      descontosInvalidos++;
      if (descontosInvalidos <= 5) {
        console.warn('⚠️ Desconto inválido (NaN):', {
          nome: r.nome,
          descontoOriginal,
          tipo: typeof descontoOriginal
        });
      }
      return; // Ignorar este registro
    }
    
    // Verificar valores negativos (descontos não devem ser negativos normalmente)
    if (valor < 0) {
      descontosNegativos++;
      if (descontosNegativos <= 5) {
        console.warn('⚠️ Desconto negativo encontrado:', {
          nome: r.nome,
          desconto: valor
        });
      }
      // Ainda assim, somar (pode ser um ajuste/correção)
      totalDesconto += valor;
      return;
    }
    
    // Ignorar apenas valores extremamente altos (erros claros)
    if (valor > MAX_VALOR) {
      descontosIgnorados++;
      console.warn('⚠️ Valor extremo ignorado em calcularEstatisticas (desconto):', r.nome, valor);
      return;
    }
    
    // Somar valor válido
    totalDesconto += valor;
  });
  
  if (descontosIgnorados > 0 || descontosInvalidos > 0 || descontosNegativos > 0) {
    console.log('📊 Resumo de descontos:', {
      totalDesconto: totalDesconto.toFixed(2),
      registrosProcessados: dados.length,
      descontosIgnorados,
      descontosInvalidos,
      descontosNegativos
    });
  }
  
  // Log para debug
  console.log('📊 Estatísticas calculadas:', {
    totalFuncionarios,
    totalRegistros,
    totalLiquido: totalLiquido.toFixed(2),
    totalVantagem: totalVantagem.toFixed(2),
    totalDesconto: totalDesconto.toFixed(2)
  });
  const mediaLiquido = totalRegistros > 0 ? totalLiquido / totalRegistros : 0;
  
  // Mediana e maior/menor - filtrar valores extremos e converter para Number
  const liquidosValidos = dados
    .map(r => Number(r.liquido) || 0)
    .filter(v => v > 0 && v <= MAX_VALOR); // Filtrar valores extremos e zeros
  
  if (liquidosValidos.length === 0) {
    return {
      totalFuncionarios,
      totalRegistros,
      totalLiquido,
      totalVantagem,
      totalDesconto,
      mediaLiquido,
      medianaLiquido: 0,
      maiorLiquido: 0,
      menorLiquido: 0
    };
  }
  
  const liquidosOrdenados = liquidosValidos.sort((a, b) => a - b);
  const meio = Math.floor(liquidosOrdenados.length / 2);
  const medianaLiquido = liquidosOrdenados.length % 2 === 0
    ? (liquidosOrdenados[meio - 1] + liquidosOrdenados[meio]) / 2
    : liquidosOrdenados[meio];
  
  const maiorLiquido = liquidosOrdenados[liquidosOrdenados.length - 1]; // Último elemento (maior)
  const menorLiquido = liquidosOrdenados[0]; // Primeiro elemento (menor)
  
  return {
    totalFuncionarios, // Funcionários únicos
    totalRegistros,    // Total de registros (múltiplos meses)
    totalLiquido,
    totalVantagem,
    totalDesconto,
    mediaLiquido,
    medianaLiquido,
    maiorLiquido,
    menorLiquido
  };
}

/**
 * Calcula estatísticas anuais agregadas
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com estatísticas por ano
 */
export function calcularEstatisticasAnuais(dados) {
  const porAno = agregarPorAno(dados);
  const estatisticas = {};
  
  Object.keys(porAno).forEach(ano => {
    const dadosAno = porAno[ano];
    estatisticas[ano] = {
      ano: ano,
      totalFuncionarios: dadosAno.funcionariosUnicos.size,
      totalRegistros: dadosAno.count,
      totalLiquido: dadosAno.liquido,
      totalVantagem: dadosAno.vantagem,
      totalDesconto: dadosAno.desconto,
      mediaLiquido: dadosAno.count > 0 ? dadosAno.liquido / dadosAno.count : 0,
      mediaVantagem: dadosAno.count > 0 ? dadosAno.vantagem / dadosAno.count : 0,
      mediaDesconto: dadosAno.count > 0 ? dadosAno.desconto / dadosAno.count : 0,
      mesesComDados: dadosAno.competencias.size,
      competencias: Array.from(dadosAno.competencias).sort()
    };
  });
  
  console.log('📊 Estatísticas anuais calculadas:', Object.keys(estatisticas).length, 'anos');
  
  return estatisticas;
}

/**
 * Retorna top N registros por campo
 * @param {Array} dados - Array de registros
 * @param {string} campo - Campo para ordenar
 * @param {number} n - Quantidade de registros
 * @returns {Array} Top N registros
 */
export function topN(dados, campo, n = 10) {
  if (!dados || dados.length === 0) {
    return [];
  }
  
  // Filtrar apenas registros individuais (não agregados)
  // Garantir que tenha nome (é um registro individual)
  const registrosIndividuais = dados.filter(r => 
    r && 
    typeof r === 'object' && 
    r.nome && 
    typeof r.nome === 'string' && 
    r.nome.trim() !== '' &&
    r.nome !== '*Totais*' &&
    !isNaN(Number(r[campo]))
  );
  
  return [...registrosIndividuais]
    .sort((a, b) => {
      const valorA = Number(a[campo]) || 0;
      const valorB = Number(b[campo]) || 0;
      return valorB - valorA;
    })
    .slice(0, n)
    .map(r => ({
      nome: r.nome || 'N/A',
      cpf: r.cpf || '',
      lotacao_normalizada: r.lotacao_normalizada || r.lotacao || 'N/A',
      vinculo: r.vinculo || '',
      funcao: r.funcao || '',
      situacao: r.situacao || '',
      [campo]: Number(r[campo]) || 0
    }));
}

/**
 * Extrai valores únicos de um campo
 * @param {Array} dados - Array de registros
 * @param {string} campo - Nome do campo
 * @returns {Array} Array com valores únicos ordenados
 */
export function valoresUnicos(dados, campo) {
  // Filtrar valores falsy (null, undefined, '', 0, false) mas manter 0 se for um valor válido
  const valores = dados.map(r => r[campo]).filter(v => v != null && v !== undefined && v !== '');
  return [...new Set(valores)].sort();
}

