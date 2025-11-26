/**
 * RELATÓRIO DE ATIVOS VS AFASTADOS
 * Análise da situação dos funcionários
 */

import { formatarMoeda } from '../utils/formatters.js';
import { agregarPorSituacao } from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';

export function renderRelatorioAtivosAfastados(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  const agregado = agregarPorSituacao(dados);
  const ativos = agregado['ATIVO'] || { count: 0, liquido: 0, motivosAfastamento: [] };
  const afastados = agregado['AFASTADO'] || { count: 0, liquido: 0, motivosAfastamento: [] };
  const total = ativos.count + afastados.count;
  const percAfastados = total > 0 ? ((afastados.count / total) * 100).toFixed(1) : 0;
  
  // Contar motivos de afastamento
  const motivosCount = {};
  afastados.motivosAfastamento.forEach(item => {
    const motivo = item.motivo || 'NÃO INFORMADO';
    motivosCount[motivo] = (motivosCount[motivo] || 0) + 1;
  });
  
  const motivosOrdenados = Object.entries(motivosCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-person-check-fill text-cyan me-2"></i>
            Relatório: Ativos vs Afastados
          </h4>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioAtivosAfastadosPDF()">
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
            <i class="bi bi-person-check-fill"></i>
          </div>
          <div class="metric-value">${ativos.count}</div>
          <div class="metric-label">Funcionários Ativos</div>
          <div class="metric-trend">
            <span class="text-muted small">${((ativos.count / total) * 100).toFixed(1)}% do total</span>
          </div>
        </div>
      </div>
      
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon text-danger">
            <i class="bi bi-person-x-fill"></i>
          </div>
          <div class="metric-value">${afastados.count}</div>
          <div class="metric-label">Funcionários Afastados</div>
          <div class="metric-trend">
            <span class="text-muted small">${percAfastados}% do total</span>
          </div>
        </div>
      </div>
      
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon text-success">
            <i class="bi bi-cash"></i>
          </div>
          <div class="metric-value">${formatarMoeda(ativos.liquido)}</div>
          <div class="metric-label">Folha de Ativos</div>
        </div>
      </div>
      
      <div class="col-md-3">
        <div class="metric-card">
          <div class="metric-icon text-danger">
            <i class="bi bi-cash"></i>
          </div>
          <div class="metric-value">${formatarMoeda(afastados.liquido)}</div>
          <div class="metric-label">Folha de Afastados</div>
        </div>
      </div>
    </div>
    
    ${afastados.count > 0 ? `
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card chart-card">
            <div class="card-header chart-header">
              <h6 class="mb-0">Principais Motivos de Afastamento</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-custom table-sm">
                  <thead>
                    <tr>
                      <th>Motivo</th>
                      <th class="text-end">Quantidade</th>
                      <th class="text-end">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${motivosOrdenados.map(([motivo, count]) => `
                      <tr>
                        <td style="color: var(--color-text-primary) !important;">${motivo || 'N/A'}</td>
                        <td class="text-end" style="color: var(--color-text-primary) !important;">${count || 0}</td>
                        <td class="text-end" style="color: var(--color-text-primary) !important;">${afastados.count > 0 ? ((count / afastados.count) * 100).toFixed(1) : 0}%</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card chart-card">
            <div class="card-header chart-header">
              <h6 class="mb-0">Resumo Comparativo</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-custom">
                  <thead>
                    <tr>
                      <th>Situação</th>
                      <th class="text-end">Funcionários</th>
                      <th class="text-end">Total Líquido</th>
                      <th class="text-end">Média</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="color: var(--color-text-primary) !important;">
                        <span class="badge badge-success">ATIVO</span>
                      </td>
                      <td class="text-end" style="color: var(--color-text-primary) !important;">${ativos.count || 0}</td>
                      <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(ativos.liquido || 0)}</td>
                      <td class="text-end" style="color: var(--color-text-primary) !important;">${ativos.count > 0 ? formatarMoeda(ativos.liquido / ativos.count) : formatarMoeda(0)}</td>
                    </tr>
                    <tr>
                      <td style="color: var(--color-text-primary) !important;">
                        <span class="badge badge-danger">AFASTADO</span>
                      </td>
                      <td class="text-end" style="color: var(--color-text-primary) !important;">${afastados.count || 0}</td>
                      <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(afastados.liquido || 0)}</td>
                      <td class="text-end" style="color: var(--color-text-primary) !important;">${afastados.count > 0 ? formatarMoeda(afastados.liquido / afastados.count) : formatarMoeda(0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    ` : ''}
  `;
  
  container.innerHTML = html;
  
  // Expor função de exportação globalmente
  window.exportarRelatorioAtivosAfastadosPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório: Ativos vs Afastados', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      
      let y = 45;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Resumo Comparativo', 15, y);
      y += 8;
      
      const tableData = [
        ['ATIVO', (ativos.count || 0).toString(), formatarMoeda(ativos.liquido || 0), formatarMoeda(ativos.count > 0 ? ativos.liquido / ativos.count : 0)],
        ['AFASTADO', (afastados.count || 0).toString(), formatarMoeda(afastados.liquido || 0), formatarMoeda(afastados.count > 0 ? afastados.liquido / afastados.count : 0)]
      ];
      
      doc.autoTable({
        startY: y,
        head: [['Situação', 'Funcionários', 'Total Líquido', 'Média']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [0, 102, 255], textColor: [255, 255, 255], fontStyle: 'bold' }
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
      
      doc.save(`Relatorio_Ativos_Afastados_${new Date().getTime()}.pdf`);
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
  
  // Expor função de exportação globalmente
  window.exportarRelatorioAtivosAfastadosPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório: Ativos vs Afastados', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      
      let y = 45;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Resumo Comparativo', 15, y);
      y += 8;
      
      const tableData = [
        ['ATIVO', (ativos.count || 0).toString(), formatarMoeda(ativos.liquido || 0), formatarMoeda(ativos.count > 0 ? ativos.liquido / ativos.count : 0)],
        ['AFASTADO', (afastados.count || 0).toString(), formatarMoeda(afastados.liquido || 0), formatarMoeda(afastados.count > 0 ? afastados.liquido / afastados.count : 0)]
      ];
      
      doc.autoTable({
        startY: y,
        head: [['Situação', 'Funcionários', 'Total Líquido', 'Média']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [0, 102, 255], textColor: [255, 255, 255], fontStyle: 'bold' }
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
      
      doc.save(`Relatorio_Ativos_Afastados_${new Date().getTime()}.pdf`);
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

