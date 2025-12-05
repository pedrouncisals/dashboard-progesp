/**
 * RELATÓRIO DE TOP SALÁRIOS - EMPENHO
 * Ranking dos maiores salários líquidos de empenho
 */

import { formatarMoeda, formatarCPF, formatarCompetencia } from '../utils/formatters.js';
import { topN, calcularEstatisticas } from '../services/empenho.js';
import { showToast } from '../utils/feedback.js';

export function renderRelatorioTopSalariosEmpenho(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  const stats = calcularEstatisticas(dados);
  const top10 = topN(dados, 'liquido', 10);
  const top20 = topN(dados, 'liquido', 20);
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-trophy-fill text-info me-2"></i>
            Relatório de Top Salários - Empenho
          </h4>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioTopSalariosEmpenhoPDF()">
            <i class="bi bi-file-pdf me-1"></i>
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
    
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon text-success">
            <i class="bi bi-arrow-up-circle-fill"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.maiorLiquido)}</div>
          <div class="metric-label">Maior Salário</div>
        </div>
      </div>
      
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon text-primary">
            <i class="bi bi-graph-up"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.mediaLiquido)}</div>
          <div class="metric-label">Salário Médio</div>
        </div>
      </div>
      
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon text-info">
            <i class="bi bi-diagram-3"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.medianaLiquido)}</div>
          <div class="metric-label">Mediana</div>
        </div>
      </div>
      
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon text-warning">
            <i class="bi bi-arrow-down-circle-fill"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.menorLiquido)}</div>
          <div class="metric-label">Menor Salário</div>
        </div>
      </div>
    </div>
    
    <div class="card chart-card mb-4">
      <div class="card-header chart-header">
        <h6 class="mb-0">Top 10 Maiores Salários Líquidos</h6>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th class="text-center">#</th>
                <th>Mês</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Lotação</th>
                <th>Cargo</th>
                <th>Vínculo</th>
                <th class="text-end">Salário Líquido</th>
              </tr>
            </thead>
            <tbody>
              ${top10.length > 0 ? top10.map((r, idx) => {
                const nome = r.nome && r.nome !== '*Totais*' ? r.nome : 'N/A';
                const competencia = r.competencia ? formatarCompetencia(r.competencia) : '-';
                return `
                  <tr>
                    <td class="text-center" style="color: var(--color-text-primary) !important;">
                      <span class="badge bg-info">${idx + 1}</span>
                    </td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${competencia}</small></td>
                    <td style="color: var(--color-text-primary) !important;">${nome}</td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${formatarCPF(r.cpf || '')}</small></td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${r.lotacao_normalizada || '-'}</small></td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${r.funcao || '-'}</small></td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${r.vinculo || '-'}</small></td>
                    <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(r.liquido)}</td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="8" class="text-center">Nenhum registro encontrado</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    ${top20.length > 10 ? `
    <div class="card chart-card">
      <div class="card-header chart-header">
        <h6 class="mb-0">Top 11-20 Maiores Salários Líquidos</h6>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th class="text-center">#</th>
                <th>Mês</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Lotação</th>
                <th>Cargo</th>
                <th class="text-end">Salário Líquido</th>
              </tr>
            </thead>
            <tbody>
              ${top20.slice(10).map((r, idx) => {
                const nome = r.nome && r.nome !== '*Totais*' ? r.nome : 'N/A';
                const competencia = r.competencia ? formatarCompetencia(r.competencia) : '-';
                return `
                  <tr>
                    <td class="text-center" style="color: var(--color-text-primary) !important;">
                      <span class="badge bg-secondary">${idx + 11}</span>
                    </td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${competencia}</small></td>
                    <td style="color: var(--color-text-primary) !important;">${nome}</td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${formatarCPF(r.cpf || '')}</small></td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${r.lotacao_normalizada || '-'}</small></td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${r.funcao || '-'}</small></td>
                    <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(r.liquido)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    ` : ''}
  `;
  
  container.innerHTML = html;
  
  window.exportarRelatorioTopSalariosEmpenhoPDF = async () => {
    try {
      const { exportRelatorioPDF } = await import('../utils/pdf.js');
      const colunas = [
        { header: 'Nome', accessor: r => r.nome },
        { header: 'CPF', accessor: r => formatarCPF(r.cpf) },
        { header: 'Lotação', accessor: r => r.lotacao_normalizada || '-' },
        { header: 'Cargo', accessor: r => r.funcao || '-' },
        { header: 'Vínculo', accessor: r => r.vinculo || '-' },
        { header: 'Salário Líquido', accessor: r => formatarMoeda(r.liquido) }
      ];
      
      exportRelatorioPDF('Relatório Top Salários - Empenho', top20, colunas, {});
      showToast('PDF exportado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      showToast('Erro ao exportar PDF', 'danger');
    }
  };
}

