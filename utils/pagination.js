/**
 * PAGINAÇÃO
 * Sistema de paginação para tabelas
 */

export class Pagination {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    this.itemsPerPage = options.itemsPerPage || 10;
    this.currentPage = 1;
    this.totalItems = 0;
    this.data = [];
    this.onPageChange = options.onPageChange || (() => {});
  }
  
  /**
   * Define os dados e renderiza a paginação
   * @param {Array} data - Array de dados
   */
  setData(data) {
    this.data = data;
    this.totalItems = data.length;
    this.currentPage = 1;
    this.render();
  }
  
  /**
   * Retorna os itens da página atual
   * @returns {Array} Itens da página atual
   */
  getCurrentPageData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.data.slice(start, end);
  }
  
  /**
   * Retorna o número total de páginas
   * @returns {number} Total de páginas
   */
  getTotalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
  /**
   * Vai para uma página específica
   * @param {number} page - Número da página
   */
  goToPage(page) {
    const totalPages = this.getTotalPages();
    
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    
    this.currentPage = page;
    this.render();
    this.onPageChange(this.currentPage, this.getCurrentPageData());
  }
  
  /**
   * Vai para a próxima página
   */
  nextPage() {
    this.goToPage(this.currentPage + 1);
  }
  
  /**
   * Vai para a página anterior
   */
  prevPage() {
    this.goToPage(this.currentPage - 1);
  }
  
  /**
   * Renderiza a paginação
   */
  render() {
    if (!this.container) return;
    
    const totalPages = this.getTotalPages();
    
    if (totalPages <= 1) {
      this.container.innerHTML = '';
      return;
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    
    let html = `
      <div class="pagination-container">
        <div class="pagination-info">
          Exibindo ${start} a ${end} de ${this.totalItems} registros
        </div>
        <ul class="pagination">
    `;
    
    // Botão anterior
    html += `
      <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
        <a href="#" class="page-link" data-page="prev">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
    `;
    
    // Páginas
    const maxButtons = 7;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // Primeira página
    if (startPage > 1) {
      html += `
        <li class="page-item">
          <a href="#" class="page-link" data-page="1">1</a>
        </li>
      `;
      if (startPage > 2) {
        html += `
          <li class="page-item disabled">
            <span class="page-link">...</span>
          </li>
        `;
      }
    }
    
    // Páginas intermediárias
    for (let i = startPage; i <= endPage; i++) {
      html += `
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a href="#" class="page-link" data-page="${i}">${i}</a>
        </li>
      `;
    }
    
    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += `
          <li class="page-item disabled">
            <span class="page-link">...</span>
          </li>
        `;
      }
      html += `
        <li class="page-item">
          <a href="#" class="page-link" data-page="${totalPages}">${totalPages}</a>
        </li>
      `;
    }
    
    // Botão próximo
    html += `
      <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
        <a href="#" class="page-link" data-page="next">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    `;
    
    html += `
        </ul>
      </div>
    `;
    
    this.container.innerHTML = html;
    
    // Event listeners
    this.container.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const page = e.currentTarget.getAttribute('data-page');
        
        if (page === 'prev') {
          this.prevPage();
        } else if (page === 'next') {
          this.nextPage();
        } else if (page && !e.currentTarget.closest('.disabled')) {
          this.goToPage(parseInt(page));
        }
      });
    });
  }
}

