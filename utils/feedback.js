/**
 * FEEDBACK VISUAL
 * Funções para exibir mensagens, loading, etc.
 */

/**
 * Exibe um toast/notificação
 * @param {string} mensagem - Mensagem a exibir
 * @param {string} tipo - Tipo: 'success', 'danger', 'warning', 'info'
 * @param {number} duracao - Duração em ms (padrão: 3000)
 */
export function showToast(mensagem, tipo = 'info', duracao = 3000) {
  // Criar container se não existir
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  // Criar toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  
  // Ícones por tipo
  const icones = {
    success: 'bi-check-circle-fill',
    danger: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  };
  
  toast.innerHTML = `
    <i class="bi ${icones[tipo]} text-${tipo}"></i>
    <span>${mensagem}</span>
  `;
  
  container.appendChild(toast);
  
  // Remover após duração
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => {
      toast.remove();
      // Remover container se vazio
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, duracao);
}

/**
 * Exibe overlay de loading
 * @param {string} mensagem - Mensagem a exibir (opcional)
 */
export function showLoader(mensagem = 'Carregando...') {
  // Criar overlay se não existir
  let overlay = document.getElementById('loader-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loader-overlay';
    overlay.className = 'loader-overlay';
    overlay.innerHTML = `
      <div class="loader-content">
        <div class="spinner"></div>
        <div id="loader-message">${mensagem}</div>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    document.getElementById('loader-message').textContent = mensagem;
  }
  
  // Forçar reflow para animação funcionar
  overlay.offsetHeight;
  overlay.classList.add('show');
}

/**
 * Oculta overlay de loading
 */
export function hideLoader() {
  const overlay = document.getElementById('loader-overlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
}

/**
 * Exibe mensagem de erro genérica
 * @param {Error} erro - Objeto de erro
 */
export function showError(erro) {
  console.error('Erro:', erro);
  showToast(`Erro: ${erro.message || 'Ocorreu um erro inesperado'}`, 'danger', 5000);
}

/**
 * Exibe confirmação antes de ação
 * @param {string} mensagem - Mensagem de confirmação
 * @returns {Promise<boolean>} True se confirmado
 */
export function confirmar(mensagem) {
  return new Promise((resolve) => {
    // Usar confirm nativo por enquanto
    // TODO: Implementar modal customizado
    const resultado = confirm(mensagem);
    resolve(resultado);
  });
}

