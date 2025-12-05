/**
 * Mapeamento de lotações normalizadas para os nomes corretos
 * Inclui informações sobre sublotações para agrupamento
 */

export const LOTACAO_MAPPING = {
  'PROFA VALERIA': 'ETSAL',
  'PORTUGAL RAMALHO': 'HEPR',
  'CHEFIA GABINETE': 'REITORIA',
  'MATERN ESCOLA SANTA': 'MESM',
  'MOVIMENTACAO FUNCIONA': 'SUMOF',
  '- SAUDE': 'SERVIDORES CEDIDOS - SAUDE',
  'REITORIA': 'REITORIA',
  // PRO-REITORIA não mapeia diretamente para PROGESP - apenas se for especificamente de Gestão de Pessoas (verificado na função mapearLotacao)
  'CHEF GES PESSOAS': 'PROGESP', // CHEF GES PESSOAS MATERN ESC SANTA M
  'CHEFIA DE GESTAO DE PESSOAS': 'PROGESP', // CHEFIA DE GESTAO DE PESSOAS DA ACAD
  'HELVIO AUTO': 'HEHA',
  'CENTRO DE CIENCIAS DA SAUDE': 'CCS',
  'SERVICO VERIFICACAO OBITOS': 'SVO',
  'CENTRO DE CIENCIAS INTEGRADORAS': 'CCI',
  'SUPERVISAO ADMINISTRATIVA': 'PROGAD',
  'AMBULATORIO ESPECIALIDADES': 'AMBESP',
  'CENTRO PATOL MEDICINA': 'CPML',
  'CONTAS PAGAR': 'GEPOF',
  'MATERNIDADE': 'MESM',
  'MATERN ESC SANTA': 'MESM',
  'CENTRO DE TECNOLOGIA': 'CTEC',
  'TECNOLOGIA INFORM': 'SUTIN',
  'SAUDE BEM-EST': 'SASBEM',
  'SUPERVISAO LOGISTICA': 'PROGAD',
  'COORDENADORIA CURSO': 'COORDENADORIA CURSO', // Funcionou até janeiro
  'DESENVOLVIMENTO PE': 'SUDES', // SUPERVISAO DE DESENVOLVIMENTO DE PE = SUDES (Sublotação PROGESP)
  'CENTRO ESPECIALIZADO REABILITACA': 'CER',
  'CENTRO EDUCACAO DISTANCIA': 'CED',
  'RELACOES COMUNITARIAS': 'PROEX',
  'CHEFIA BIBLIOTECA': 'PROEG',
  'ASSESSORIA COMUNICACAO': 'ASCOM',
  'GESTAO ACADEM': 'PROEG',
  'FINANCAS CONTABILID': 'GEPOF',
  'PROCEDIMENTOS LICITAT': 'REITORIA',
  'PESSOAS ACAD': 'CGPA',
  '- EDUCACAO': 'EDUCAÇÃO',
  'GOVERNANCA TRANSPAR': 'AGT',
  'FORCA TRAB': 'SUPLAF',
  'ASSESSORIA CERIMONIAL': 'CERIMONIAL',
  'CONTROLADORIA INTERNA': 'CONTROLADORIA INTERNA',
  'PLANEJAMENTO ORCAME': 'GEPOF',
  'OUVIDORIA': 'OUVIDORIA',
  'ASSIST PSICOPEDAG': 'PROEST',
  'POLITICAS ESTUDANTIS': 'PROEST',
  'CONTROLADORIA ACADEMI': 'CONTROLADORIA ACADEMICA',
  'FIN CONT': 'GEPOF',
  'ASSESSORIA TECNICA': 'REITORIA',
  'LATO SE': 'PROEX',
  'COORDENADORIA JURIDICA': 'COJUR',
  'SUPERVISAO EXTENSAO': 'PROEX',
  'ASSISTENCIA ESTUDANTI': 'PROEST',
  'SEM LOTAÇÃO': null, // Ignorar - é erro
  'SUPERVISAO PESQUISA': 'SUPE'
};

/**
 * Estrutura de sublotações - agrupa lotações que pertencem a uma mesma unidade maior
 * Chave: lotação principal, Valor: array de sublotações
 */
export const SUBLOTACOES = {
  'PROGESP': ['SUMOF', 'SASBEM', 'CGPA', 'SUPLAF', 'SUDES'],
  'REITORIA': ['CONTROLADORIA INTERNA', 'CONTROLADORIA ACADEMICA', 'ASSESSORIA TECNICA', 'PROCEDIMENTOS LICITAT', 'CHEFIA GABINETE']
};

/**
 * Mapeamento reverso: de lotação correta para lotações normalizadas originais
 */
export const LOTACAO_REVERSE_MAPPING = (() => {
  const reverse = {};
  Object.keys(LOTACAO_MAPPING).forEach(key => {
    const value = LOTACAO_MAPPING[key];
    if (value !== null) {
      if (!reverse[value]) {
        reverse[value] = [];
      }
      reverse[value].push(key);
    }
  });
  return reverse;
})();

/**
 * Converte lotação normalizada para o nome correto
 * @param {string} lotacaoNormalizada - Nome normalizado da lotação
 * @param {string} lotacaoOriginal - Nome original da lotação (opcional, para casos especiais)
 * @returns {string|null} Nome correto da lotação ou null se deve ser ignorado
 */
export function mapearLotacao(lotacaoNormalizada, lotacaoOriginal = null) {
  if (!lotacaoNormalizada) return null;
  
  // Caso especial: PRO-REITORIA só mapeia para PROGESP se for especificamente de Gestão de Pessoas
  if (lotacaoNormalizada === 'PRO-REITORIA' && lotacaoOriginal) {
    const originalUpper = lotacaoOriginal.toUpperCase();
    if (originalUpper.includes('GESTAO DE PESSOAS') || originalUpper.includes('GES PESSOAS')) {
      return 'PROGESP';
    }
    // Se não for de Gestão de Pessoas, retorna null ou outro mapeamento apropriado
    // Por enquanto, mantém como está (sem mapeamento direto no LOTACAO_MAPPING)
  }
  
  // Caso especial: REITORIA que vem de PRO-REITORIA DA GESTAO DE PESSOAS deve mapear para PROGESP
  if (lotacaoNormalizada === 'REITORIA' && lotacaoOriginal) {
    const originalUpper = lotacaoOriginal.toUpperCase();
    if (originalUpper.includes('PRO-REITORIA') && (originalUpper.includes('GESTAO DE PESSOAS') || originalUpper.includes('GES PESSOAS'))) {
      return 'PROGESP';
    }
  }
  
  // Caso especial: PESSOAS ACAD que vem de CHEFIA DE GESTAO DE PESSOAS DA ACAD deve mapear para CGPA (já está correto)
  // Mas se vier de PRO-REITORIA DA GESTAO DE PESSOAS, deve ser PROGESP
  if (lotacaoNormalizada === 'PESSOAS ACAD' && lotacaoOriginal) {
    const originalUpper = lotacaoOriginal.toUpperCase();
    if (originalUpper.includes('PRO-REITORIA') && originalUpper.includes('GESTAO DE PESSOAS')) {
      return 'PROGESP';
    }
  }
  
  // REMOVIDO: MATERN ESC SANTA não deve mapear para PROGESP
  // MATERN ESC SANTA sempre mapeia para MESM (Maternidade Escola Santa Maria) conforme LOTACAO_MAPPING (linha 26)
  // A lotação "CHEF GES PESSOAS MATERN ESC SANTA M" é mapeada como "CHEF GES PESSOAS" -> PROGESP, não como "MATERN ESC SANTA" -> PROGESP
  
  // REMOVIDO: PORTUGAL RAMALHO não deve mapear para PROGESP
  // PORTUGAL RAMALHO mapeia para HEPR conforme LOTACAO_MAPPING (linha 8)
  // Apenas lotações específicas da PROGESP devem ser consideradas: CGPA, SUMOF, SASBEM, SUDES, SUPLAF
  
  // IMPORTANTE: PROFA VALERIA (Escola Técnica) mapeia para ETSAL, NÃO para PROGESP
  
  const mapped = LOTACAO_MAPPING[lotacaoNormalizada];
  if (mapped === null) return null; // Ignorar (ex: SEM LOTAÇÃO)
  return mapped || lotacaoNormalizada; // Retorna o mapeado ou o original se não houver mapeamento
}

/**
 * Obtém todas as lotações normalizadas que mapeiam para uma lotação correta
 * @param {string} lotacaoCorreta - Nome correto da lotação
 * @returns {Array<string>} Array de lotações normalizadas que mapeiam para esta lotação
 */
export function obterLotacoesOriginais(lotacaoCorreta) {
  return LOTACAO_REVERSE_MAPPING[lotacaoCorreta] || [lotacaoCorreta];
}

/**
 * Verifica se uma lotação é uma sublotação
 * @param {string} lotacao - Nome da lotação
 * @returns {string|null} Nome da lotação principal ou null se não for sublotação
 */
export function obterLotacaoPrincipal(lotacao) {
  for (const [principal, sublots] of Object.entries(SUBLOTACOES)) {
    if (sublots.includes(lotacao)) {
      return principal;
    }
  }
  return null;
}

/**
 * Obtém todas as sublotações de uma lotação principal
 * @param {string} lotacaoPrincipal - Nome da lotação principal
 * @returns {Array<string>} Array de sublotações
 */
export function obterSublotacoes(lotacaoPrincipal) {
  return SUBLOTACOES[lotacaoPrincipal] || [];
}

