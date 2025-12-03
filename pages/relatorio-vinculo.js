/**
 * RELATÓRIO POR VÍNCULO
 * Comparação entre tipos de vínculo
 */

import { formatarMoeda, formatarNumero, extrairPeriodoDados } from '../utils/formatters.js';
import { agregarPorVinculo } from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';

export function renderRelatorioVinculo(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  const agregado = Object.values(agregarPorVinculo(dados))
    .map(v => ({
      ...v,
      funcionariosUnicos: v.funcionariosUnicos ? v.funcionariosUnicos.size : v.count
    }))
    .sort((a, b) => b.funcionariosUnicos - a.funcionariosUnicos);
  
  // Total de funcionários únicos (não registros)
  const totalFuncionarios = agregado.reduce((s, v) => s + v.funcionariosUnicos, 0);
  
  // Extrair período dos dados
  const periodo = extrairPeriodoDados(dados);
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-person-badge text-orange me-2"></i>
            Relatório por Vínculo
            ${periodo ? `<span class="badge bg-primary-subtle text-primary ms-2" style="font-size: 0.875rem; font-weight: 500;">
              <i class="bi bi-calendar3 me-1"></i>${periodo}
            </span>` : ''}
          </h4>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioVinculoPDF()">
            <i class="bi bi-file-pdf me-1"></i>
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
    
    <div class="row g-3 mb-4">
      ${agregado.slice(0, 3).map((v, idx) => {
        const cores = ['primary', 'success', 'warning'];
        const icones = ['bi-person-fill', 'bi-person-check', 'bi-person-plus'];
        return `
          <div class="col-md-4">
            <div class="metric-card">
              <div class="metric-icon text-${cores[idx]}">
                <i class="bi ${icones[idx]}"></i>
              </div>
              <div class="metric-value">${v.funcionariosUnicos}</div>
              <div class="metric-label">${v.vinculo}</div>
              <div class="metric-trend">
                <span class="text-muted small">${formatarMoeda(v.liquido)} total</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    
    <div class="card chart-card">
      <div class="card-header chart-header">
        <h6 class="mb-0">Comparativo por Tipo de Vínculo</h6>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Vínculo</th>
                <th class="text-end">Funcionários</th>
                <th class="text-end">% do Total</th>
                <th class="text-end">Total Líquido</th>
                <th class="text-end">Média Líquida</th>
              </tr>
            </thead>
            <tbody>
              ${agregado.map(v => `
                <tr>
                  <td class="fw-semibold">${v.vinculo || 'N/A'}</td>
                  <td class="text-end">${v.funcionariosUnicos || 0}</td>
                  <td class="text-end">${totalFuncionarios > 0 ? ((v.funcionariosUnicos / totalFuncionarios) * 100).toFixed(1) : 0}%</td>
                  <td class="text-end fw-bold">${formatarMoeda(v.liquido || 0)}</td>
                  <td class="text-end">${v.count > 0 ? formatarMoeda(v.liquido / v.count) : formatarMoeda(0)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="fw-bold">
                <td>TOTAL</td>
                <td class="text-end">${totalFuncionarios || 0}</td>
                <td class="text-end">100%</td>
                <td class="text-end">${formatarMoeda(agregado.reduce((s, v) => s + (v.liquido || 0), 0))}</td>
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
  window.exportarRelatorioVinculoPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const periodoPDF = extrairPeriodoDados(dados);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório por Vínculo', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      if (periodoPDF) {
        doc.text(`Período: ${periodoPDF}`, 15, 34);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 40);
      } else {
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      }
      
      let y = periodoPDF ? 47 : 41;
      
      // Tabela de vínculos
      const tableData = agregado.map(v => [
        v.vinculo || 'N/A',
        formatarNumero(v.funcionariosUnicos || 0),
        totalFuncionarios > 0 ? ((v.funcionariosUnicos / totalFuncionarios) * 100).toFixed(1) + '%' : '0%',
        formatarMoeda(v.liquido || 0),
        v.count > 0 ? formatarMoeda(v.liquido / v.count) : formatarMoeda(0)
      ]);
      
      // Adicionar linha de total
      tableData.push([
        'TOTAL',
        formatarNumero(totalFuncionarios || 0),
        '100%',
        formatarMoeda(agregado.reduce((s, v) => s + (v.liquido || 0), 0)),
        '-'
      ]);
      
      doc.autoTable({
        startY: y,
        head: [['Vínculo', 'Funcionários', '% do Total', 'Total Líquido', 'Média Líquida']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 102, 255], textColor: [255, 255, 255], fontStyle: 'bold' },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
      
      doc.save(`Relatorio_Vinculo_${new Date().getTime()}.pdf`);
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

