/**
 * RELATÓRIO DE DESCONTOS
 * Análise detalhada de descontos aplicados
 */

import { formatarMoeda, formatarPercentual } from '../utils/formatters.js';
import { agregarPorLotacao, topN } from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';

export function renderRelatorioDescontos(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  // Calcular totais com proteção
  if (!dados || dados.length === 0) {
    container.innerHTML = '<div class="alert alert-info">Nenhum dado disponível para este relatório.</div>';
    return;
  }
  
  // Calcular totais com validação adequada
  let totalDescontos = 0;
  let totalVantagens = 0;
  let registrosValidos = 0;
  
  dados.forEach(r => {
    const desconto = Number(r.desconto);
    const vantagem = Number(r.vantagem);
    
    // Somar apenas valores numéricos válidos (não NaN)
    if (!isNaN(desconto)) {
      totalDescontos += desconto;
      registrosValidos++;
    }
    if (!isNaN(vantagem)) {
      totalVantagens += vantagem;
    }
  });
  
  const mediaDescontos = registrosValidos > 0 ? totalDescontos / registrosValidos : 0;
  const percMedio = totalVantagens > 0 ? (totalDescontos / totalVantagens) * 100 : 0;
  
  console.log('📊 Relatório de Descontos - Cálculos:', {
    totalDescontos: totalDescontos.toFixed(2),
    totalVantagens: totalVantagens.toFixed(2),
    registrosValidos,
    mediaDescontos: mediaDescontos.toFixed(2),
    percMedio: percMedio.toFixed(2)
  });
  
  // Top 10 maiores descontos - garantir que são registros individuais
  const top10 = topN(dados, 'desconto', 10);
  
  // Debug: verificar se top10 está correto
  if (top10.length > 0 && (!top10[0].nome || top10[0].nome === '*Totais*')) {
    console.error('Erro: top10 retornando dados agregados em vez de individuais');
    console.log('Primeiro item:', top10[0]);
    console.log('Dados originais (primeiros 3):', dados.slice(0, 3));
  }
  
  // Agregação por lotação
  const porLotacao = Object.values(agregarPorLotacao(dados))
    .sort((a, b) => b.desconto - a.desconto)
    .slice(0, 10);
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-arrow-down-circle-fill text-danger me-2"></i>
            Relatório de Descontos
          </h4>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioDescontosPDF()">
            <i class="bi bi-file-pdf me-1"></i>
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
    
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-danger">
            <i class="bi bi-cash-stack"></i>
          </div>
          <div class="metric-value">${formatarMoeda(totalDescontos)}</div>
          <div class="metric-label">Total de Descontos</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-warning">
            <i class="bi bi-graph-down"></i>
          </div>
          <div class="metric-value">${formatarMoeda(mediaDescontos)}</div>
          <div class="metric-label">Média por Funcionário</div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-info">
            <i class="bi bi-percent"></i>
          </div>
          <div class="metric-value">${formatarPercentual(percMedio)}</div>
          <div class="metric-label">% sobre Vantagens</div>
        </div>
      </div>
    </div>
    
    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <div class="card chart-card">
          <div class="card-header chart-header">
            <h6 class="mb-0">Top 10 Maiores Descontos</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom table-sm">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Lotação</th>
                    <th class="text-end">Desconto</th>
                  </tr>
                </thead>
                <tbody>
                  ${top10.length > 0 ? top10.map(r => {
                    const nome = r.nome && r.nome !== '*Totais*' ? r.nome : 'N/A';
                    const lotacao = r.lotacao_normalizada || r.lotacao || 'N/A';
                    const desconto = Number(r.desconto) || 0;
                    return `
                      <tr>
                        <td>${nome}</td>
                        <td><small>${lotacao}</small></td>
                        <td class="text-end fw-bold">${formatarMoeda(desconto)}</td>
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
            <h6 class="mb-0">Descontos por Lotação (Top 10)</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom table-sm">
                <thead>
                  <tr>
                    <th>Lotação</th>
                    <th class="text-end">Qtd</th>
                    <th class="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${porLotacao.map(l => `
                    <tr>
                      <td>${l.lotacao || 'N/A'}</td>
                      <td class="text-end">${l.count || 0}</td>
                      <td class="text-end fw-bold">${formatarMoeda(l.desconto || 0)}</td>
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
  window.exportarRelatorioDescontosPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório de Descontos', 15, 20);
      
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
      doc.text(`Total de Descontos: ${formatarMoeda(totalDescontos)}`, 15, y);
      y += 6;
      doc.text(`Média por Funcionário: ${formatarMoeda(mediaDescontos)}`, 15, y);
      y += 6;
      doc.text(`% sobre Vantagens: ${formatarPercentual(percMedio)}`, 15, y);
      y += 10;
      
      if (top10.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Top 10 Maiores Descontos', 15, y);
        y += 8;
        
        const tableData = top10.map(r => [
          (r.nome && r.nome !== '*Totais*' ? r.nome : 'N/A'),
          (r.lotacao_normalizada || r.lotacao || 'N/A'),
          formatarMoeda(Number(r.desconto) || 0)
        ]);
        
        doc.autoTable({
          startY: y,
          head: [['Nome', 'Lotação', 'Desconto']],
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
      
      doc.save(`Relatorio_Descontos_${new Date().getTime()}.pdf`);
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

