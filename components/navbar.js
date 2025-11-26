/**
 * NAVBAR COMPONENT
 * Barra de navegação superior - Design Premium Ultra
 */

export function renderNavbar() {
  return `
    <nav class="navbar navbar-expand-lg navbar-premium-ultra">
      <div class="navbar-container-premium">
        <div class="navbar-content-wrapper">
          <!-- Brand Section - Ultra Premium -->
          <a class="navbar-brand-ultra" href="/">
            <div class="brand-icon-wrapper">
              <div class="brand-icon-gradient">
                <img src="/assets/icons/brasao_uncisal.png" alt="UNCISAL" class="brand-icon-img">
              </div>
            </div>
            <div class="brand-text-ultra">
              <div class="brand-title-ultra">Dashboard Servidores</div>
              <div class="brand-subtitle-ultra">UNCISAL • PROGESP Assessoria</div>
            </div>
          </a>
          
          <!-- Mobile Toggle -->
          <button class="navbar-toggler-ultra" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="toggler-line"></span>
            <span class="toggler-line"></span>
            <span class="toggler-line"></span>
          </button>
          
          <!-- Nav Items -->
          <div class="collapse navbar-collapse" id="navbarNav">
            <div class="navbar-nav-ultra">
              <div class="nav-info-group">
                <div class="nav-info-badge" id="navbar-periodo">
                  <i class="bi bi-calendar-range"></i>
                  <span>Carregando...</span>
                </div>
                <div class="nav-info-badge" id="navbar-servidores">
                  <i class="bi bi-people-fill"></i>
                  <span>Carregando...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `;
}

/**
 * Inicializa o navbar
 */
export function initNavbar() {
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = renderNavbar();
  }
}

