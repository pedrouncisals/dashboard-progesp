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
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notificações');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }
  
  // Criar toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  
  // Ícones por tipo
  const icones = {
    success: 'bi-check-circle-fill',
    danger: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  };
  
  // Labels acessíveis
  const labels = {
    success: 'Sucesso',
    danger: 'Erro',
    warning: 'Aviso',
    info: 'Informação'
  };
  
  toast.innerHTML = `
    <i class="bi ${icones[tipo]} text-${tipo}" aria-hidden="true"></i>
    <span>${mensagem}</span>
    <button class="toast-close" aria-label="Fechar notificação" onclick="this.parentElement.remove()">
      <i class="bi bi-x" aria-hidden="true"></i>
    </button>
  `;
  
  // Adicionar título acessível
  toast.setAttribute('title', `${labels[tipo]}: ${mensagem}`);
  
  container.appendChild(toast);
  
  // Animar entrada
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  // Remover após duração
  const timeoutId = setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => {
      toast.remove();
      // Remover container se vazio
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, duracao);
  
  // Permitir fechar manualmente
  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      clearTimeout(timeoutId);
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    });
  }
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
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('aria-busy', 'true');
    overlay.setAttribute('aria-label', mensagem);
    overlay.innerHTML = `
      <div class="loader-content">
        <div class="spinner" aria-hidden="true"></div>
        <div id="loader-message">${mensagem}</div>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    const messageEl = document.getElementById('loader-message');
    if (messageEl) {
      messageEl.textContent = mensagem;
    }
    overlay.setAttribute('aria-label', mensagem);
  }
  
  // Forçar reflow para animação funcionar
  overlay.offsetHeight;
  overlay.classList.add('show');
  overlay.setAttribute('aria-busy', 'true');
}

/**
 * Oculta overlay de loading
 */
export function hideLoader() {
  const overlay = document.getElementById('loader-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-busy', 'false');
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

