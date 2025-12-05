/**
 * RELATÓRIO DE TOP SALÁRIOS
 * Ranking dos maiores salários líquidos
 */

import { formatarMoeda, formatarCPF, formatarCompetencia } from '../utils/formatters.js';
import { topN, calcularEstatisticas } from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';

export function renderRelatorioTopSalarios(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  const stats = calcularEstatisticas(dados);
  const top10 = topN(dados, 'liquido', 10);
  const top20 = topN(dados, 'liquido', 20);
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-trophy-fill text-pink me-2"></i>
            Relatório de Top Salários
          </h4>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioTopSalariosPDF()">
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
                <th>Função</th>
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
                      <span class="badge ${idx < 3 ? 'bg-warning' : 'bg-secondary'}">
                        ${idx + 1}º
                      </span>
                    </td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${competencia}</small></td>
                    <td class="fw-semibold" style="color: var(--color-text-primary) !important;">${nome}</td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${formatarCPF(r.cpf || '')}</small></td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${r.lotacao_normalizada || 'N/A'}</small></td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${r.funcao || '-'}</small></td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${r.vinculo || '-'}</small></td>
                    <td class="text-end fw-bold" style="color: var(--color-success) !important;">${formatarMoeda(Number(r.liquido) || 0)}</td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="8" class="text-center" style="color: var(--color-text-primary) !important;">Nenhum registro encontrado</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div class="card chart-card">
      <div class="card-header chart-header">
        <h6 class="mb-0">Top 11 ao 20</h6>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-custom table-sm">
            <thead>
              <tr>
                <th class="text-center">#</th>
                <th>Mês</th>
                <th>Nome</th>
                <th>Lotação</th>
                <th class="text-end">Salário Líquido</th>
              </tr>
            </thead>
            <tbody>
              ${top20.length > 10 ? top20.slice(10).map((r, idx) => {
                const nome = r.nome && r.nome !== '*Totais*' ? r.nome : 'N/A';
                const competencia = r.competencia ? formatarCompetencia(r.competencia) : '-';
                return `
                  <tr>
                    <td class="text-center" style="color: var(--color-text-primary) !important;">${idx + 11}º</td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${competencia}</small></td>
                    <td style="color: var(--color-text-primary) !important;">${nome}</td>
                    <td style="color: var(--color-text-secondary) !important;"><small>${r.lotacao_normalizada || 'N/A'}</small></td>
                    <td class="text-end fw-semibold" style="color: var(--color-text-primary) !important;">${formatarMoeda(Number(r.liquido) || 0)}</td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="5" class="text-center" style="color: var(--color-text-primary) !important;">Nenhum registro encontrado</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Expor função de exportação globalmente
  window.exportarRelatorioTopSalariosPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório de Top Salários', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      
      if (top10.length > 0) {
        const tableData = top10.map((r, idx) => {
          const nome = r.nome && r.nome !== '*Totais*' ? r.nome : 'N/A';
          return [
            `${idx + 1}º`,
            nome,
            formatarCPF(r.cpf || ''),
            (r.lotacao_normalizada || 'N/A'),
            (r.funcao || '-'),
            (r.vinculo || '-'),
            formatarMoeda(Number(r.liquido) || 0)
          ];
        });
        
        doc.autoTable({
          startY: 45,
          head: [['#', 'Nome', 'CPF', 'Lotação', 'Função', 'Vínculo', 'Salário Líquido']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [0, 102, 255], textColor: [255, 255, 255], fontStyle: 'bold' }
        });
      }
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
      
      doc.save(`Relatorio_Top_Salarios_${new Date().getTime()}.pdf`);
      if (typeof showToast === 'function') {
        showToast('PDF exportado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      if (typeof showToast === 'function') {
        showToast('Erro ao exportar PDF. Verifique o console.', 'danger');
      }
    }
  };
}

