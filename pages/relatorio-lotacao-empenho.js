/**
 * RELATÓRIO POR LOTAÇÃO - EMPENHO
 * Visão consolidada por unidade/lotação de empenho
 */

import { formatarMoeda, formatarNumero, extrairPeriodoDados } from '../utils/formatters.js';
import { agregarPorLotacao } from '../services/empenho.js';
import { showToast } from '../utils/feedback.js';

export function renderRelatorioLotacaoEmpenho(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  if (!dados || dados.length === 0) {
    container.innerHTML = '<div class="alert alert-info">Nenhum dado disponível para este relatório.</div>';
    return;
  }
  
  const agregado = Object.values(agregarPorLotacao(dados))
    .sort((a, b) => b.liquido - a.liquido);
  
  if (agregado.length === 0) {
    container.innerHTML = '<div class="alert alert-info">Nenhuma lotação encontrada nos dados.</div>';
    return;
  }
  
  const totalLotacoes = agregado.length;
  const lotacaoMaiorFolha = agregado[0] || { lotacao: 'N/A', liquido: 0 };
  const lotacaoMaisFuncionarios = [...agregado].sort((a, b) => b.count - a.count)[0] || { lotacao: 'N/A', count: 0 };
  
  const periodo = extrairPeriodoDados(dados);
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-building text-info me-2"></i>
            Relatório por Lotação - Empenho
            ${periodo ? `<span class="badge bg-info-subtle text-info ms-2" style="font-size: 0.875rem; font-weight: 500;">
              <i class="bi bi-calendar3 me-1"></i>${periodo}
            </span>` : ''}
          </h4>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioLotacaoEmpenhoPDF()">
            <i class="bi bi-file-pdf me-1"></i>
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
    
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-primary">
            <i class="bi bi-buildings"></i>
          </div>
          <div class="metric-value">${totalLotacoes}</div>
          <div class="metric-label">Total de Lotações</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-success">
            <i class="bi bi-trophy"></i>
          </div>
          <div class="metric-value small">${lotacaoMaiorFolha.lotacao}</div>
          <div class="metric-label">Maior Folha</div>
          <div class="metric-trend">
            <span class="text-muted small">${formatarMoeda(lotacaoMaiorFolha.liquido)}</span>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-warning">
            <i class="bi bi-people"></i>
          </div>
          <div class="metric-value small">${lotacaoMaisFuncionarios.lotacao}</div>
          <div class="metric-label">Mais Empenhos</div>
          <div class="metric-trend">
            <span class="text-muted small">${lotacaoMaisFuncionarios.count} empenhos</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card chart-card">
      <div class="card-header chart-header">
        <h6 class="mb-0">Todas as Lotações - Detalhamento</h6>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Lotação</th>
                <th class="text-end">Empenhos</th>
                <th class="text-end">Funcionários Únicos</th>
                <th class="text-end">Total Líquido</th>
                <th class="text-end">Média por Empenho</th>
              </tr>
            </thead>
            <tbody>
              ${agregado.map(lot => `
                <tr>
                  <td style="color: var(--color-text-primary) !important;">${lot.lotacao}</td>
                  <td class="text-end" style="color: var(--color-text-primary) !important;">${formatarNumero(lot.count)}</td>
                  <td class="text-end" style="color: var(--color-text-primary) !important;">${formatarNumero(lot.funcionariosUnicos.size)}</td>
                  <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(lot.liquido)}</td>
                  <td class="text-end" style="color: var(--color-text-secondary) !important;">${formatarMoeda(lot.liquido / lot.count)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  window.exportarRelatorioLotacaoEmpenhoPDF = async () => {
    try {
      const { exportRelatorioPDF } = await import('../utils/pdf.js');
      const colunas = [
        { header: 'Lotação', accessor: r => r.lotacao },
        { header: 'Empenhos', accessor: r => r.count },
        { header: 'Funcionários Únicos', accessor: r => r.funcionariosUnicos.size },
        { header: 'Total Líquido', accessor: r => formatarMoeda(r.liquido) },
        { header: 'Média', accessor: r => formatarMoeda(r.liquido / r.count) }
      ];
      
      exportRelatorioPDF('Relatório por Lotação - Empenho', agregado, colunas, {});
      showToast('PDF exportado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      showToast('Erro ao exportar PDF', 'danger');
    }
  };
}

