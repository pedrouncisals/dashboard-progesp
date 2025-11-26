/**
 * RELATÓRIO DE VENCIMENTOS
 * Lista completa de funcionários com seus vencimentos
 */

import { formatarMoeda, formatarCPF } from '../utils/formatters.js';
import { Pagination } from '../utils/pagination.js';
import { exportRelatorioPDF, exportarCSV } from '../utils/pdf.js';

export function renderRelatorioVencimentos(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  const html = `
    <div class="card mb-4">
      <div class="card-header chart-header">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h5 class="card-title mb-0">
              <i class="bi bi-calendar-check-fill me-2"></i>
              Relatório de Vencimentos
            </h5>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-primary" id="exportar-vencimentos-pdf">
              <i class="bi bi-file-pdf me-1"></i>PDF
            </button>
            <button class="btn btn-sm btn-primary" id="exportar-vencimentos-csv">
              <i class="bi bi-file-earmark-spreadsheet me-1"></i>CSV
            </button>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th class="sortable">Nome</th>
                <th>CPF</th>
                <th>Lotação</th>
                <th>Vínculo</th>
                <th class="text-end sortable">Vantagem</th>
                <th class="text-end sortable">Desconto</th>
                <th class="text-end sortable">Líquido</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody id="tbody-vencimentos">
              <!-- Preenchido via JS -->
            </tbody>
          </table>
        </div>
        <div id="pagination-vencimentos"></div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Paginação
  const pagination = new Pagination('#pagination-vencimentos', {
    itemsPerPage: 10,
    onPageChange: (page, pageData) => {
      renderTabelaVencimentos(pageData);
    }
  });
  
  pagination.setData(dados);
  renderTabelaVencimentos(pagination.getCurrentPageData());
  
  // Event listeners
  document.getElementById('exportar-vencimentos-pdf').addEventListener('click', () => {
    exportarVencimentosPDF(dados);
  });
  
  document.getElementById('exportar-vencimentos-csv').addEventListener('click', () => {
    exportarVencimentosCSV(dados);
  });
}

function renderTabelaVencimentos(dados) {
  const tbody = document.getElementById('tbody-vencimentos');
  
  if (dados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum registro encontrado</td></tr>';
    return;
  }
  
  tbody.innerHTML = dados.map(r => {
    const nome = r.nome && r.nome !== '*Totais*' ? r.nome : 'N/A';
    return `
      <tr>
        <td style="color: var(--color-text-primary) !important;">${nome}</td>
        <td style="color: var(--color-text-primary) !important;">${formatarCPF(r.cpf || '')}</td>
        <td style="color: var(--color-text-primary) !important;">${r.lotacao_normalizada || '-'}</td>
        <td style="color: var(--color-text-secondary) !important;"><small>${r.vinculo || '-'}</small></td>
        <td class="text-end" style="color: var(--color-text-primary) !important;">${formatarMoeda(Number(r.vantagem) || 0)}</td>
        <td class="text-end" style="color: var(--color-text-primary) !important;">${formatarMoeda(Number(r.desconto) || 0)}</td>
        <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(Number(r.liquido) || 0)}</td>
        <td>
          <span class="badge ${r.situacao === 'ATIVO' ? 'badge-success' : 'badge-danger'}">
            ${r.situacao || 'N/A'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function exportarVencimentosPDF(dados) {
  const colunas = [
    { header: 'Nome', accessor: r => r.nome },
    { header: 'CPF', accessor: r => formatarCPF(r.cpf) },
    { header: 'Lotação', accessor: r => r.lotacao_normalizada },
    { header: 'Vínculo', accessor: r => r.vinculo },
    { header: 'Vantagem', accessor: r => formatarMoeda(r.vantagem) },
    { header: 'Desconto', accessor: r => formatarMoeda(r.desconto) },
    { header: 'Líquido', accessor: r => formatarMoeda(r.liquido) }
  ];
  
  exportRelatorioPDF('Relatório de Vencimentos', dados, colunas);
}

function exportarVencimentosCSV(dados) {
  const colunas = [
    { header: 'Nome', accessor: r => r.nome },
    { header: 'CPF', accessor: r => r.cpf },
    { header: 'Lotação', accessor: r => r.lotacao_normalizada },
    { header: 'Vínculo', accessor: r => r.vinculo },
    { header: 'Vantagem', accessor: r => r.vantagem },
    { header: 'Desconto', accessor: r => r.desconto },
    { header: 'Líquido', accessor: r => r.liquido }
  ];
  
  exportarCSV('relatorio_vencimentos', dados, colunas);
}

