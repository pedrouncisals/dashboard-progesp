/**
 * RELATÓRIO DE FUNÇÕES E NÍVEIS
 * Análise por função e nível funcional
 */

import { formatarMoeda } from '../utils/formatters.js';
import { agregarPorFuncao, agregarPorFuncaoNivel } from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';

export function renderRelatorioFuncoesNiveis(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  // Agregar por função
  const porFuncao = Object.values(agregarPorFuncao(dados))
    .map(f => ({
      ...f,
      mediaLiquido: f.liquido / f.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
  
  // Agregar por função e nível
  const porFuncaoNivel = Object.values(agregarPorFuncaoNivel(dados))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  
  const funcaoMaisFuncionarios = porFuncao[0];
  const funcaoMaiorMedia = [...porFuncao].sort((a, b) => b.mediaLiquido - a.mediaLiquido)[0];
  const totalFuncoes = new Set(dados.map(r => r.funcao)).size;
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-briefcase-fill text-orange me-2"></i>
            Relatório de Funções e Níveis
          </h4>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioFuncoesNiveisPDF()">
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
            <i class="bi bi-diagram-3"></i>
          </div>
          <div class="metric-value">${totalFuncoes}</div>
          <div class="metric-label">Total de Funções</div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-success">
            <i class="bi bi-people"></i>
          </div>
          <div class="metric-value small">${funcaoMaisFuncionarios.funcao}</div>
          <div class="metric-label">Função Mais Comum</div>
          <div class="metric-trend">
            <span class="text-muted small">${funcaoMaisFuncionarios.count} funcionários</span>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-warning">
            <i class="bi bi-trophy"></i>
          </div>
          <div class="metric-value small">${funcaoMaiorMedia.funcao}</div>
          <div class="metric-label">Maior Média Salarial</div>
          <div class="metric-trend">
            <span class="text-muted small">${formatarMoeda(funcaoMaiorMedia.mediaLiquido)}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <div class="card chart-card">
          <div class="card-header chart-header">
            <h6 class="mb-0">Top 15 Funções por Quantidade</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom table-sm">
                <thead>
                  <tr>
                    <th>Função</th>
                    <th class="text-end">Funcionários</th>
                    <th class="text-end">Média Líquida</th>
                  </tr>
                </thead>
                <tbody>
                  ${porFuncao.map(f => `
                    <tr>
                      <td class="fw-semibold" style="color: var(--color-text-primary) !important;">${f.funcao || 'N/A'}</td>
                      <td class="text-end" style="color: var(--color-text-primary) !important;">${f.count || 0}</td>
                      <td class="text-end" style="color: var(--color-text-primary) !important;">${f.count > 0 ? formatarMoeda(f.mediaLiquido) : formatarMoeda(0)}</td>
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
            <h6 class="mb-0">Distribuição Função x Nível (Top 20)</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom table-sm">
                <thead>
                  <tr>
                    <th>Função</th>
                    <th>Nível</th>
                    <th class="text-end">Qtd</th>
                    <th class="text-end">Média</th>
                  </tr>
                </thead>
                <tbody>
                  ${porFuncaoNivel.map(fn => `
                    <tr>
                      <td style="color: var(--color-text-primary) !important;"><small>${fn.funcao || 'N/A'}</small></td>
                      <td style="color: var(--color-text-secondary) !important;"><small>${fn.nivel || 'N/A'}</small></td>
                      <td class="text-end" style="color: var(--color-text-primary) !important;">${fn.count || 0}</td>
                      <td class="text-end" style="color: var(--color-text-primary) !important;">${fn.count > 0 ? formatarMoeda(fn.liquido / fn.count) : formatarMoeda(0)}</td>
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
  window.exportarRelatorioFuncoesNiveisPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório de Funções e Níveis', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      
      let y = 45;
      
      // Tabela de Funções
      if (porFuncao.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Distribuição por Função', 15, y);
        y += 8;
        
        const tableDataFuncao = porFuncao.map(f => [
          f.funcao || 'N/A',
          (f.count || 0).toString(),
          formatarMoeda(f.count > 0 ? f.mediaLiquido : 0)
        ]);
        
        doc.autoTable({
          startY: y,
          head: [['Função', 'Funcionários', 'Média Líquida']],
          body: tableDataFuncao,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [0, 102, 255], textColor: [255, 255, 255], fontStyle: 'bold' }
        });
        
        y = doc.lastAutoTable.finalY + 15;
      }
      
      // Tabela de Função x Nível
      if (porFuncaoNivel.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Distribuição Função x Nível (Top 20)', 15, y);
        y += 8;
        
        const tableDataFuncaoNivel = porFuncaoNivel.slice(0, 20).map(fn => [
          fn.funcao || 'N/A',
          fn.nivel || 'N/A',
          (fn.count || 0).toString(),
          formatarMoeda(fn.count > 0 ? fn.liquido / fn.count : 0)
        ]);
        
        doc.autoTable({
          startY: y,
          head: [['Função', 'Nível', 'Qtd', 'Média']],
          body: tableDataFuncaoNivel,
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
      
      doc.save(`Relatorio_Funcoes_Niveis_${new Date().getTime()}.pdf`);
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
  window.exportarRelatorioFuncoesNiveisPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório de Funções e Níveis', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      
      let y = 45;
      
      // Tabela de Funções
      if (porFuncao.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Distribuição por Função', 15, y);
        y += 8;
        
        const tableDataFuncao = porFuncao.map(f => [
          f.funcao || 'N/A',
          (f.count || 0).toString(),
          formatarMoeda(f.count > 0 ? f.mediaLiquido : 0)
        ]);
        
        doc.autoTable({
          startY: y,
          head: [['Função', 'Funcionários', 'Média Líquida']],
          body: tableDataFuncao,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [0, 102, 255], textColor: [255, 255, 255], fontStyle: 'bold' }
        });
        
        y = doc.lastAutoTable.finalY + 15;
      }
      
      // Tabela de Função x Nível
      if (porFuncaoNivel.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Distribuição Função x Nível (Top 20)', 15, y);
        y += 8;
        
        const tableDataFuncaoNivel = porFuncaoNivel.slice(0, 20).map(fn => [
          fn.funcao || 'N/A',
          fn.nivel || 'N/A',
          (fn.count || 0).toString(),
          formatarMoeda(fn.count > 0 ? fn.liquido / fn.count : 0)
        ]);
        
        doc.autoTable({
          startY: y,
          head: [['Função', 'Nível', 'Qtd', 'Média']],
          body: tableDataFuncaoNivel,
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
      
      doc.save(`Relatorio_Funcoes_Niveis_${new Date().getTime()}.pdf`);
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

