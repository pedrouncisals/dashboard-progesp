/**
 * FORMATADORES DE DADOS
 * Funções para formatação de valores conforme padrão brasileiro
 */

/**
 * Formata valor como moeda brasileira
 * @param {number} valor - Valor numérico
 * @returns {string} Valor formatado (ex: "R$ 3.241,36")
 */
export function formatarMoeda(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

/**
 * Formata CPF com máscara
 * @param {string} cpf - CPF apenas com dígitos
 * @returns {string} CPF formatado (ex: "123.456.789-01")
 */
export function formatarCPF(cpf) {
  if (!cpf || cpf.length !== 11) {
    return cpf || '';
  }
  
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata competência para exibição
 * @param {string} competencia - Formato YYYY-MM
 * @returns {string} Competência formatada (ex: "Abril/2025")
 */
export function formatarCompetencia(competencia) {
  if (!competencia || !competencia.includes('-')) {
    return competencia || '';
  }
  
  const [ano, mes] = competencia.split('-');
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const mesNome = meses[parseInt(mes) - 1] || mes;
  return `${mesNome}/${ano}`;
}

/**
 * Formata competência de forma curta
 * @param {string} competencia - Formato YYYY-MM
 * @returns {string} Competência formatada (ex: "Abr/25")
 */
export function formatarCompetenciaCurta(competencia) {
  if (!competencia || !competencia.includes('-')) {
    return competencia || '';
  }
  
  const [ano, mes] = competencia.split('-');
  const mesesCurtos = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  
  const mesNome = mesesCurtos[parseInt(mes) - 1] || mes;
  return `${mesNome}/${ano.substring(2)}`;
}

/**
 * Extrai o período (competências) dos dados para exibição
 * @param {Array} dados - Array de registros
 * @returns {string} Período formatado (ex: "Outubro/2025" ou "Janeiro/2025 - Dezembro/2025")
 */
export function extrairPeriodoDados(dados) {
  if (!dados || dados.length === 0) {
    return '';
  }
  
  // Extrair competências únicas
  const competencias = new Set();
  dados.forEach(reg => {
    if (reg.competencia) {
      competencias.add(reg.competencia);
    }
  });
  
  if (competencias.size === 0) {
    return '';
  }
  
  const competenciasOrdenadas = Array.from(competencias).sort();
  
  if (competenciasOrdenadas.length === 1) {
    // Um único mês
    return formatarCompetencia(competenciasOrdenadas[0]);
  } else {
    // Múltiplos meses - mostrar intervalo
    const primeira = formatarCompetencia(competenciasOrdenadas[0]);
    const ultima = formatarCompetencia(competenciasOrdenadas[competenciasOrdenadas.length - 1]);
    return `${primeira} - ${ultima}`;
  }
}

/**
 * Formata valor como percentual
 * @param {number} valor - Valor decimal (ex: 15.5 = 15.5%)
 * @param {number} casas - Número de casas decimais
 * @returns {string} Percentual formatado (ex: "15,50%")
 */
export function formatarPercentual(valor, casas = 2) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return '0,00%';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  }).format(valor / 100);
}

/**
 * Formata número com separadores de milhar
 * @param {number} valor - Valor numérico
 * @returns {string} Número formatado (ex: "1.234")
 */
export function formatarNumero(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return '0';
  }
  
  return new Intl.NumberFormat('pt-BR').format(valor);
}

/**
 * Formata número de forma compacta (ex: 1.2K, 3.5M)
 * @param {number} valor - Valor numérico
 * @returns {string} Número compacto
 */
export function formatarNumeroCompacto(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return '0';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(valor);
}

/**
 * Formata data no padrão brasileiro
 * @param {string|Date} data - Data
 * @returns {string} Data formatada (ex: "24/11/2025")
 */
export function formatarData(data) {
  if (!data) return '';
  
  const d = typeof data === 'string' ? new Date(data) : data;
  
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

/**
 * Formata data e hora no padrão brasileiro
 * @param {string|Date} data - Data
 * @returns {string} Data e hora formatadas (ex: "24/11/2025 16:30")
 */
export function formatarDataHora(data) {
  if (!data) return '';
  
  const d = typeof data === 'string' ? new Date(data) : data;
  
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(d);
}

