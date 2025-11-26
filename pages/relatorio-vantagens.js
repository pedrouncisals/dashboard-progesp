/**
 * RELATÓRIO DE VANTAGENS
 * Análise de vantagens e proventos pagos
 */

import { formatarMoeda } from '../utils/formatters.js';
import { agregarPorLotacao, topN, calcularEstatisticas } from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';

export function renderRelatorioVantagens(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  if (!dados || dados.length === 0) {
    container.innerHTML = '<div class="alert alert-info">Nenhum dado disponível para este relatório.</div>';
    return;
  }
  
  const stats = calcularEstatisticas(dados);
  const top10 = topN(dados, 'vantagem', 10);
  const porLotacao = Object.values(agregarPorLotacao(dados))
    .sort((a, b) => b.vantagem - a.vantagem)
    .slice(0, 10);
  
  const maiorVantagem = dados.length > 0 ? Math.max(...dados.map(r => Number(r.vantagem) || 0)) : 0;
  const menorVantagem = dados.length > 0 ? Math.min(...dados.map(r => Number(r.vantagem) || 0)) : 0;
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-arrow-up-circle-fill text-success me-2"></i>
            Relatório de Vantagens
          </h4>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioVantagensPDF()">
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
            <i class="bi bi-cash-stack"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.totalVantagem)}</div>
          <div class="metric-label">Total de Vantagens</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon text-primary">
            <i class="bi bi-graph-up"></i>
          </div>
          <div class="metric-value">${stats.totalRegistros > 0 ? formatarMoeda(stats.totalVantagem / stats.totalRegistros) : formatarMoeda(0)}</div>
          <div class="metric-label">Média por Funcionário</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon text-warning">
            <i class="bi bi-arrow-up"></i>
          </div>
          <div class="metric-value">${formatarMoeda(maiorVantagem)}</div>
          <div class="metric-label">Maior Vantagem</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon text-info">
            <i class="bi bi-arrow-down"></i>
          </div>
          <div class="metric-value">${formatarMoeda(menorVantagem)}</div>
          <div class="metric-label">Menor Vantagem</div>
        </div>
      </div>
    </div>
    
    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <div class="card chart-card">
          <div class="card-header chart-header">
            <h6 class="mb-0">Top 10 Maiores Vantagens</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom table-sm">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Lotação</th>
                    <th class="text-end">Vantagem</th>
                  </tr>
                </thead>
                <tbody>
                  ${top10.length > 0 ? top10.map(r => {
                    const nome = r.nome && r.nome !== '*Totais*' ? r.nome : 'N/A';
                    const lotacao = r.lotacao_normalizada || r.lotacao || 'N/A';
                    const vantagem = Number(r.vantagem) || 0;
                    return `
                      <tr>
                        <td>${nome}</td>
                        <td><small>${lotacao}</small></td>
                        <td class="text-end fw-bold text-success">${formatarMoeda(vantagem)}</td>
                      </tr>
                    `;
                  }).join('') : '<tr><td colspan="3" class="text-center">Nenhum registro encontrado</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card chart-card">
          <div class="card-header chart-header">
            <h6 class="mb-0">Vantagens por Lotação (Top 10)</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom table-sm">
                <thead>
                  <tr>
                    <th>Lotação</th>
                    <th class="text-end">Qtd</th>
                    <th class="text-end">Total</th>
                    <th class="text-end">Média</th>
                  </tr>
                </thead>
                <tbody>
                  ${porLotacao.map(l => `
                    <tr>
                      <td>${l.lotacao || 'N/A'}</td>
                      <td class="text-end">${l.count || 0}</td>
                      <td class="text-end fw-bold text-success">${formatarMoeda(l.vantagem || 0)}</td>
                      <td class="text-end">${l.count > 0 ? formatarMoeda(l.vantagem / l.count) : formatarMoeda(0)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Expor função de exportação globalmente
  window.exportarRelatorioVantagensPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório de Vantagens', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      
      let y = 45;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Métricas', 15, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total de Vantagens: ${formatarMoeda(stats.totalVantagem)}`, 15, y);
      y += 6;
      doc.text(`Média por Funcionário: ${formatarMoeda(stats.totalRegistros > 0 ? stats.totalVantagem / stats.totalRegistros : 0)}`, 15, y);
      y += 6;
      doc.text(`Maior Vantagem: ${formatarMoeda(maiorVantagem)}`, 15, y);
      y += 6;
      doc.text(`Menor Vantagem: ${formatarMoeda(menorVantagem)}`, 15, y);
      y += 10;
      
      if (top10.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Top 10 Maiores Vantagens', 15, y);
        y += 8;
        
        const tableData = top10.map(r => [
          (r.nome && r.nome !== '*Totais*' ? r.nome : 'N/A'),
          (r.lotacao_normalizada || r.lotacao || 'N/A'),
          formatarMoeda(Number(r.vantagem) || 0)
        ]);
        
        doc.autoTable({
          startY: y,
          head: [['Nome', 'Lotação', 'Vantagem']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
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
      
      doc.save(`Relatorio_Vantagens_${new Date().getTime()}.pdf`);
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

