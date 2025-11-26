/**
 * RELATÓRIO CONSOLIDADO GERAL
 * Visão geral completa com todas as métricas
 */

import { formatarMoeda, formatarNumero, formatarCompetencia } from '../utils/formatters.js';
import {
  calcularEstatisticas,
  agregarPorLotacao,
  agregarPorVinculo,
  agregarPorSituacao,
  agregarPorCompetencia
} from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';

export function renderRelatorioConsolidado(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  if (!dados || dados.length === 0) {
    container.innerHTML = '<div class="alert alert-info">Nenhum dado disponível para este relatório.</div>';
    return;
  }
  
  const stats = calcularEstatisticas(dados);
  
  // Agregações
  const todasLotacoes = Object.values(agregarPorLotacao(dados));
  const porLotacao = [...todasLotacoes]
    .sort((a, b) => b.liquido - a.liquido)
    .slice(0, 5);
  
  const porVinculo = Object.values(agregarPorVinculo(dados))
    .sort((a, b) => b.count - a.count);
  
  const porSituacao = agregarPorSituacao(dados);
  
  const porCompetencia = Object.values(agregarPorCompetencia(dados))
    .sort((a, b) => a.competencia.localeCompare(b.competencia));
  
  // Total real de lotações (não apenas top 5)
  const totalLotacoes = todasLotacoes.length;
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-file-earmark-bar-graph-fill text-primary me-2"></i>
            Relatório Consolidado Geral
          </h4>
          <p class="text-muted mb-0">Visão completa de todas as métricas e agregações da folha de pagamento</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioConsolidadoPDF()">
            <i class="bi bi-file-pdf me-1"></i>
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
    
    <!-- Métricas Principais -->
    <div class="row g-3 mb-4">
      <div class="col-12">
        <h6 class="fw-semibold mb-3">📊 Métricas Principais</h6>
      </div>
      
      <div class="col-md-3 col-sm-6">
        <div class="metric-card">
          <div class="metric-icon text-primary">
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="metric-value">${formatarNumero(stats.totalFuncionarios)}</div>
          <div class="metric-label">Total de Funcionários</div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6">
        <div class="metric-card">
          <div class="metric-icon text-success">
            <i class="bi bi-cash-stack"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.totalLiquido)}</div>
          <div class="metric-label">Folha Total (Líquido)</div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6">
        <div class="metric-card">
          <div class="metric-icon text-success">
            <i class="bi bi-arrow-up-circle"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.totalVantagem)}</div>
          <div class="metric-label">Total de Vantagens</div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6">
        <div class="metric-card">
          <div class="metric-icon text-danger">
            <i class="bi bi-arrow-down-circle"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.totalDesconto)}</div>
          <div class="metric-label">Total de Descontos</div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-info">
            <i class="bi bi-graph-up"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.mediaLiquido)}</div>
          <div class="metric-label">Salário Médio</div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-warning">
            <i class="bi bi-trophy"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.maiorLiquido)}</div>
          <div class="metric-label">Maior Salário</div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="metric-card">
          <div class="metric-icon text-secondary">
            <i class="bi bi-diagram-3"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.medianaLiquido)}</div>
          <div class="metric-label">Mediana Salarial</div>
        </div>
      </div>
    </div>
    
    <!-- Distribuições -->
    <div class="row g-3 mb-4">
      <div class="col-12">
        <h6 class="fw-semibold mb-3">📈 Distribuições</h6>
      </div>
      
      <!-- Por Lotação -->
      <div class="col-md-6">
        <div class="card chart-card">
          <div class="card-header chart-header">
            <h6 class="mb-0">Top 5 Lotações por Folha</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom table-sm">
                <thead>
                  <tr>
                    <th>Lotação</th>
                    <th class="text-end">Funcionários</th>
                    <th class="text-end">Total Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  ${porLotacao.map(l => `
                    <tr>
                      <td class="fw-semibold">${l.lotacao || 'N/A'}</td>
                      <td class="text-end">${l.count || 0}</td>
                      <td class="text-end fw-bold">${formatarMoeda(l.liquido || 0)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Por Vínculo -->
      <div class="col-md-6">
        <div class="card chart-card">
          <div class="card-header chart-header">
            <h6 class="mb-0">Distribuição por Vínculo</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom table-sm">
                <thead>
                  <tr>
                    <th>Vínculo</th>
                    <th class="text-end">Funcionários</th>
                    <th class="text-end">%</th>
                  </tr>
                </thead>
                <tbody>
                  ${porVinculo.map(v => {
                    const funcionariosUnicos = v.funcionariosUnicos ? v.funcionariosUnicos.size : v.count;
                    return `
                    <tr>
                      <td>${v.vinculo || 'N/A'}</td>
                      <td class="text-end">${funcionariosUnicos}</td>
                      <td class="text-end">${stats.totalFuncionarios > 0 ? ((funcionariosUnicos / stats.totalFuncionarios) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Por Situação -->
      <div class="col-md-6">
        <div class="card chart-card">
          <div class="card-header chart-header">
            <h6 class="mb-0">Distribuição por Situação</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Situação</th>
                    <th class="text-end">Funcionários</th>
                    <th class="text-end">%</th>
                    <th class="text-end">Total Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.values(porSituacao).map(s => {
                    const funcionariosUnicos = s.funcionariosUnicos ? s.funcionariosUnicos.size : s.count;
                    // O total líquido deve ser a soma de TODOS os registros (não apenas únicos)
                    // pois um funcionário pode aparecer em múltiplos meses
                    const totalLiquido = s.liquido || 0;
                    return `
                    <tr>
                      <td style="color: var(--color-text-primary) !important;">
                        <span class="badge ${s.situacao === 'ATIVO' ? 'badge-success' : 'badge-danger'}">
                          ${s.situacao || 'N/A'}
                        </span>
                      </td>
                      <td class="text-end">${funcionariosUnicos}</td>
                      <td class="text-end">${stats.totalFuncionarios > 0 ? ((funcionariosUnicos / stats.totalFuncionarios) * 100).toFixed(1) : 0}%</td>
                      <td class="text-end fw-bold">${formatarMoeda(totalLiquido)}</td>
                    </tr>
                  `;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr class="fw-bold" style="background: var(--color-bg-secondary) !important;">
                    <td>TOTAL</td>
                    <td class="text-end">${Object.values(porSituacao).reduce((sum, s) => sum + (s.funcionariosUnicos ? s.funcionariosUnicos.size : s.count), 0)}</td>
                    <td class="text-end">100%</td>
                    <td class="text-end">${formatarMoeda(Object.values(porSituacao).reduce((sum, s) => sum + (s.liquido || 0), 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Evolução Temporal -->
      <div class="col-md-6">
        <div class="card chart-card">
          <div class="card-header chart-header">
            <h6 class="mb-0">Evolução por Competência</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom table-sm">
                <thead>
                  <tr>
                    <th>Competência</th>
                    <th class="text-end">Funcionários</th>
                    <th class="text-end">Total Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  ${porCompetencia.map(c => {
                    // Mostrar funcionários únicos (não registros totais)
                    const funcionariosUnicos = c.funcionariosUnicos ? c.funcionariosUnicos.size : c.count || 0;
                    const totalLiquido = c.liquido || 0;
                    return `
                    <tr>
                      <td>${formatarCompetencia(c.competencia || 'N/A')}</td>
                      <td class="text-end">${funcionariosUnicos}</td>
                      <td class="text-end fw-bold">${formatarMoeda(totalLiquido)}</td>
                    </tr>
                  `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Resumo Final -->
    <div class="alert alert-info">
      <h6 class="alert-heading">
        <i class="bi bi-info-circle me-2 text-primary"></i>Resumo Geral
      </h6>
      <p class="mb-0">
        Este relatório consolida os dados de <strong>${formatarNumero(stats.totalFuncionarios)}</strong> funcionários, 
        com uma folha total de <strong>${formatarMoeda(stats.totalLiquido)}</strong> 
        distribuídos em <strong>${totalLotacoes}</strong> lotações e 
        <strong>${porVinculo.length}</strong> tipos de vínculo diferentes.
      </p>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Expor função de exportação globalmente
  window.exportarRelatorioConsolidadoPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Header
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório Consolidado Geral', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      
      // Métricas principais
      let y = 45;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Métricas Principais', 15, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total de Funcionários: ${formatarNumero(stats.totalFuncionarios)}`, 15, y);
      y += 6;
      doc.text(`Folha Total (Líquido): ${formatarMoeda(stats.totalLiquido)}`, 15, y);
      y += 6;
      doc.text(`Total de Vantagens: ${formatarMoeda(stats.totalVantagem)}`, 15, y);
      y += 6;
      doc.text(`Total de Descontos: ${formatarMoeda(stats.totalDesconto)}`, 15, y);
      y += 6;
      doc.text(`Salário Médio: ${formatarMoeda(stats.mediaLiquido)}`, 15, y);
      y += 10;
      
      // Tabela de Vínculos
      if (porVinculo.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Distribuição por Vínculo', 15, y);
        y += 8;
        
        const tableData = porVinculo.map(v => {
          const funcionariosUnicos = v.funcionariosUnicos ? v.funcionariosUnicos.size : v.count;
          return [
            v.vinculo || 'N/A',
            funcionariosUnicos.toString(),
            `${((funcionariosUnicos / stats.totalFuncionarios) * 100).toFixed(1)}%`
          ];
        });
        
        doc.autoTable({
          startY: y,
          head: [['Vínculo', 'Funcionários', '% do Total']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [0, 102, 255], textColor: [255, 255, 255], fontStyle: 'bold' }
        });
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`Relatorio_Consolidado_${new Date().getTime()}.pdf`);
      showToast('PDF exportado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      showToast('Erro ao exportar PDF. Verifique o console.', 'danger');
    }
  };
}

