/**
 * VALIDAÇÕES
 * Funções para validação de dados
 */

/**
 * Verifica se há erros no registro
 * @param {Object} registro - Registro da folha
 * @returns {boolean} true se houver erros
 */
export function temErros(registro) {
  return registro.erros && registro.erros.length > 0;
}

/**
 * Valida um registro e retorna lista de erros
 * @param {Object} registro - Registro a validar
 * @returns {Array<string>} Lista de erros encontrados
 */
export function validarRegistro(registro) {
  const erros = [];
  
  // Validar nome
  if (!registro.nome || registro.nome.trim() === '') {
    erros.push('Nome vazio ou inválido');
  }
  
  // Validar CPF
  if (!registro.cpf || registro.cpf.length !== 11 || !/^\d+$/.test(registro.cpf)) {
    erros.push('CPF inválido');
  }
  
  // Validar valores financeiros
  if (isNaN(registro.liquido) || registro.liquido < 0) {
    erros.push('Valor líquido inválido');
  }
  
  if (isNaN(registro.vantagem) || registro.vantagem < 0) {
    erros.push('Valor de vantagem inválido');
  }
  
  if (isNaN(registro.desconto) || registro.desconto < 0) {
    erros.push('Valor de desconto inválido');
  }
  
  // Validar consistência: liquido = vantagem - desconto (com tolerância)
  const liquidoCalculado = registro.vantagem - registro.desconto;
  const diferenca = Math.abs(registro.liquido - liquidoCalculado);
  if (diferenca > 0.01) { // Tolerância de 1 centavo
    erros.push(`Inconsistência: líquido (${registro.liquido}) ≠ vantagem (${registro.vantagem}) - desconto (${registro.desconto})`);
  }
  
  return erros;
}

/**
 * Valida CPF (algoritmo oficial)
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {boolean} true se válido
 */
export function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }
  
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
}

/**
 * Exibe badge de aviso se houver erros
 * @param {Object} registro - Registro da folha
 * @returns {string} HTML do badge ou string vazia
 */
export function badgeErros(registro) {
  if (!temErros(registro)) {
    return '';
  }
  
  return `
    <span class="badge badge-warning" title="${registro.erros.join(', ')}">
      <i class="bi bi-exclamation-triangle me-1"></i>Erros
    </span>
  `;
}

