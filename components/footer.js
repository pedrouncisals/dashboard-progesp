/**
 * FOOTER COMPONENT
 * Rodapé da aplicação - Premium com Créditos
 */

export function renderFooter() {
  const anoAtual = new Date().getFullYear();
  
  return `
    <footer class="footer-premium-ultra">
      <div class="footer-container-premium">
        <div class="footer-content-wrapper">
          <!-- Left Section -->
          <div class="footer-left">
            <div class="footer-brand">
              <i class="bi bi-building footer-icon"></i>
              <div class="footer-brand-text">
                <div class="footer-brand-title">UNCISAL</div>
                <div class="footer-brand-subtitle">Universidade Estadual de Ciências da Saúde de Alagoas</div>
              </div>
            </div>
            <div class="footer-info">
              <span class="footer-badge-small">
                <i class="bi bi-shield-check"></i>
                Sistema Oficial
              </span>
            </div>
          </div>
          
          <!-- Right Section -->
          <div class="footer-right">
            <div class="footer-credits">
              <div class="credits-main">
                <i class="bi bi-code-slash credits-icon"></i>
                <span class="credits-text">
                  Desenvolvido por: <strong>Pedro <span class="credits-estagiario-inline">"estagiário"</span> Vasconcelos</strong>
                </span>
              </div>
              <div class="credits-subtitle">
                PROGESP • Analista de Sistemas
                <span class="credits-wink">✨</span>
              </div>
            </div>
            <div class="footer-copyright">
              <i class="bi bi-calendar3"></i>
              <span>© ${anoAtual} UNCISAL</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Inicializa o footer
 */
export function initFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = renderFooter();
  }
}

