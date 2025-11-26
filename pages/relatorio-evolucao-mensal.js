/**
 * RELATÓRIO DE EVOLUÇÃO MENSAL
 * Comparação da folha entre meses
 */

import { formatarMoeda, formatarCompetencia, formatarPercentual } from '../utils/formatters.js';
import { agregarPorCompetencia } from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';

export function renderRelatorioEvolucaoMensal(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  const agregado = agregarPorCompetencia(dados);
  const competencias = Object.keys(agregado).sort();
  
  // Calcular variações
  const dadosTabela = competencias.map((comp, idx) => {
    const atual = agregado[comp];
    const anterior = idx > 0 ? agregado[competencias[idx - 1]] : null;
    
    let variacaoLiquido = null;
    let variacaoCount = null;
    
    if (anterior) {
      variacaoLiquido = ((atual.liquido - anterior.liquido) / anterior.liquido) * 100;
      variacaoCount = ((atual.count - anterior.count) / anterior.count) * 100;
    }
    
    return {
      competencia: comp,
      count: atual.count,
      vantagem: atual.vantagem,
      desconto: atual.desconto,
      liquido: atual.liquido,
      variacaoLiquido,
      variacaoCount
    };
  });
  
  const primeiroMes = dadosTabela[0];
  const ultimoMes = dadosTabela[dadosTabela.length - 1];
  const variacaoTotal = ((ultimoMes.liquido - primeiroMes.liquido) / primeiroMes.liquido) * 100;
  const maiorFolha = [...dadosTabela].sort((a, b) => b.liquido - a.liquido)[0];
  const menorFolha = [...dadosTabela].sort((a, b) => a.liquido - b.liquido)[0];
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-graph-up text-indigo me-2"></i>
            Relatório de Evolução Mensal
          </h4>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioEvolucaoMensalPDF()">
            <i class="bi bi-file-pdf me-1"></i>
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
    
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-${variacaoTotal >= 0 ? 'success' : 'danger'}">
            <i class="bi bi-${variacaoTotal >= 0 ? 'arrow-up' : 'arrow-down'}-circle-fill"></i>
          </div>
          <div class="metric-value">${formatarPercentual(variacaoTotal)}</div>
          <div class="metric-label">Variação no Período</div>
          <div class="metric-trend">
            <span class="text-muted small">${formatarCompetencia(primeiroMes.competencia)} a ${formatarCompetencia(ultimoMes.competencia)}</span>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-success">
            <i class="bi bi-trophy"></i>
          </div>
          <div class="metric-value small">${formatarCompetencia(maiorFolha.competencia)}</div>
          <div class="metric-label">Maior Folha</div>
          <div class="metric-trend">
            <span class="text-muted small">${formatarMoeda(maiorFolha.liquido)}</span>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-warning">
            <i class="bi bi-arrow-down-circle"></i>
          </div>
          <div class="metric-value small">${formatarCompetencia(menorFolha.competencia)}</div>
          <div class="metric-label">Menor Folha</div>
          <div class="metric-trend">
            <span class="text-muted small">${formatarMoeda(menorFolha.liquido)}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card chart-card">
      <div class="card-header chart-header">
        <h6 class="mb-0">Evolução Mês a Mês</h6>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Competência</th>
                <th class="text-end">Funcionários</th>
                <th class="text-end">Variação</th>
                <th class="text-end">Total Vantagem</th>
                <th class="text-end">Total Desconto</th>
                <th class="text-end">Total Líquido</th>
                <th class="text-end">Variação %</th>
              </tr>
            </thead>
            <tbody>
              ${dadosTabela.map(d => `
                <tr>
                  <td class="fw-semibold" style="color: var(--color-text-primary) !important;">${formatarCompetencia(d.competencia || 'N/A')}</td>
                  <td class="text-end" style="color: var(--color-text-primary) !important;">${d.count || 0}</td>
                  <td class="text-end" style="color: var(--color-text-primary) !important;">
                    ${d.variacaoCount !== null ? `
                      <span style="color: ${d.variacaoCount >= 0 ? 'var(--color-success)' : 'var(--color-danger)'} !important;">
                        ${d.variacaoCount >= 0 ? '+' : ''}${d.variacaoCount.toFixed(1)}%
                      </span>
                    ` : '-'}
                  </td>
                  <td class="text-end" style="color: var(--color-success) !important;">${formatarMoeda(d.vantagem || 0)}</td>
                  <td class="text-end" style="color: var(--color-danger) !important;">${formatarMoeda(d.desconto || 0)}</td>
                  <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(d.liquido || 0)}</td>
                  <td class="text-end" style="color: var(--color-text-primary) !important;">
                    ${d.variacaoLiquido !== null ? `
                      <span class="fw-bold" style="color: ${d.variacaoLiquido >= 0 ? 'var(--color-success)' : 'var(--color-danger)'} !important;">
                        ${d.variacaoLiquido >= 0 ? '+' : ''}${d.variacaoLiquido.toFixed(1)}%
                      </span>
                    ` : '-'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Expor função de exportação globalmente
  window.exportarRelatorioEvolucaoMensalPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape para tabela maior
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório de Evolução Mensal', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      
      const tableData = dadosTabela.map(d => [
        formatarCompetencia(d.competencia || 'N/A'),
        (d.count || 0).toString(),
        d.variacaoCount !== null ? `${d.variacaoCount >= 0 ? '+' : ''}${d.variacaoCount.toFixed(1)}%` : '-',
        formatarMoeda(d.vantagem || 0),
        formatarMoeda(d.desconto || 0),
        formatarMoeda(d.liquido || 0),
        d.variacaoLiquido !== null ? `${d.variacaoLiquido >= 0 ? '+' : ''}${d.variacaoLiquido.toFixed(1)}%` : '-'
      ]);
      
      doc.autoTable({
        startY: 45,
        head: [['Competência', 'Funcionários', 'Variação %', 'Vantagem', 'Desconto', 'Total Líquido', 'Variação %']],
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
      
      doc.save(`Relatorio_Evolucao_Mensal_${new Date().getTime()}.pdf`);
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
  window.exportarRelatorioEvolucaoMensalPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape para tabela maior
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório de Evolução Mensal', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      
      const tableData = dadosTabela.map(d => [
        formatarCompetencia(d.competencia || 'N/A'),
        (d.count || 0).toString(),
        d.variacaoCount !== null ? `${d.variacaoCount >= 0 ? '+' : ''}${d.variacaoCount.toFixed(1)}%` : '-',
        formatarMoeda(d.vantagem || 0),
        formatarMoeda(d.desconto || 0),
        formatarMoeda(d.liquido || 0),
        d.variacaoLiquido !== null ? `${d.variacaoLiquido >= 0 ? '+' : ''}${d.variacaoLiquido.toFixed(1)}%` : '-'
      ]);
      
      doc.autoTable({
        startY: 45,
        head: [['Competência', 'Funcionários', 'Variação %', 'Vantagem', 'Desconto', 'Total Líquido', 'Variação %']],
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
      
      doc.save(`Relatorio_Evolucao_Mensal_${new Date().getTime()}.pdf`);
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

