/**
 * RELATÓRIO POR LOTAÇÃO
 * Visão consolidada por unidade/lotação
 */

import { formatarMoeda, formatarNumero, extrairPeriodoDados } from '../utils/formatters.js';
import { agregarPorLotacao } from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';

export function renderRelatorioLotacao(dados) {
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
  
  // Extrair período dos dados
  const periodo = extrairPeriodoDados(dados);
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-building text-purple me-2"></i>
            Relatório por Lotação
            ${periodo ? `<span class="badge bg-primary-subtle text-primary ms-2" style="font-size: 0.875rem; font-weight: 500;">
              <i class="bi bi-calendar3 me-1"></i>${periodo}
            </span>` : ''}
          </h4>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioLotacaoPDF()">
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
          <div class="metric-label">Mais Funcionários</div>
          <div class="metric-trend">
            <span class="text-muted small">${lotacaoMaisFuncionarios.count} pessoas</span>
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
                <th class="text-end">Funcionários</th>
                <th class="text-end">Total Vantagem</th>
                <th class="text-end">Total Desconto</th>
                <th class="text-end">Total Líquido</th>
                <th class="text-end">Média Líquida</th>
              </tr>
            </thead>
            <tbody>
              ${agregado.map(l => `
                <tr>
                  <td class="fw-semibold">${l.lotacao || 'N/A'}</td>
                  <td class="text-end">${l.count || 0}</td>
                  <td class="text-end text-success">${formatarMoeda(l.vantagem || 0)}</td>
                  <td class="text-end text-danger">${formatarMoeda(l.desconto || 0)}</td>
                  <td class="text-end fw-bold">${formatarMoeda(l.liquido || 0)}</td>
                  <td class="text-end">${l.count > 0 ? formatarMoeda(l.liquido / l.count) : formatarMoeda(0)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="fw-bold">
                <td>TOTAL</td>
                <td class="text-end">${agregado.reduce((s, l) => s + (l.count || 0), 0)}</td>
                <td class="text-end text-success">${formatarMoeda(agregado.reduce((s, l) => s + (l.vantagem || 0), 0))}</td>
                <td class="text-end text-danger">${formatarMoeda(agregado.reduce((s, l) => s + (l.desconto || 0), 0))}</td>
                <td class="text-end">${formatarMoeda(agregado.reduce((s, l) => s + (l.liquido || 0), 0))}</td>
                <td class="text-end">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Expor função de exportação globalmente
  window.exportarRelatorioLotacaoPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      const periodoPDF = extrairPeriodoDados(dados);
      doc.text('Relatório por Lotação', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      if (periodoPDF) {
        doc.text(`Período: ${periodoPDF}`, 15, 34);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 40);
      } else {
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      }
      
      const tableData = agregado.map(l => [
        l.lotacao || 'N/A',
        (l.count || 0).toString(),
        formatarMoeda(l.vantagem || 0),
        formatarMoeda(l.desconto || 0),
        formatarMoeda(l.liquido || 0),
        formatarMoeda(l.count > 0 ? l.liquido / l.count : 0)
      ]);
      
      tableData.push([
        'TOTAL',
        agregado.reduce((s, l) => s + (l.count || 0), 0).toString(),
        formatarMoeda(agregado.reduce((s, l) => s + (l.vantagem || 0), 0)),
        formatarMoeda(agregado.reduce((s, l) => s + (l.desconto || 0), 0)),
        formatarMoeda(agregado.reduce((s, l) => s + (l.liquido || 0), 0)),
        '-'
      ]);
      
      doc.autoTable({
        startY: 45,
        head: [['Lotação', 'Funcionários', 'Total Vantagem', 'Total Desconto', 'Total Líquido', 'Média Líquida']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 102, 255], textColor: [255, 255, 255], fontStyle: 'bold' }
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
      
      doc.save(`Relatorio_Lotacao_${new Date().getTime()}.pdf`);
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

