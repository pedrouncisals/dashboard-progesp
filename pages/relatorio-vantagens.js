/**
 * RELATÓRIO DE VANTAGENS
 * Análise de vantagens e proventos pagos
 */

import { formatarMoeda, extrairPeriodoDados } from '../utils/formatters.js';
import { agregarPorLotacao, topN, calcularEstatisticas } from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';
import { Pagination } from '../utils/pagination.js';

export function renderRelatorioVantagens(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  if (!dados || dados.length === 0) {
    container.innerHTML = '<div class="alert alert-info">Nenhum dado disponível para este relatório.</div>';
    return;
  }
  
  const stats = calcularEstatisticas(dados);
  
  // Todos as vantagens ordenadas
  const todasVantagens = dados
    .filter(r => r.nome && r.nome !== '*Totais*' && !isNaN(Number(r.vantagem)))
    .sort((a, b) => (Number(b.vantagem) || 0) - (Number(a.vantagem) || 0));
  
  // Top 10 para exibição inicial
  const top10 = todasVantagens.slice(0, 10);
  
  // Agregação por lotação - TODAS
  const todasLotacoes = Object.values(agregarPorLotacao(dados))
    .sort((a, b) => b.vantagem - a.vantagem);
  
  // Top 10 para exibição inicial
  const porLotacao = todasLotacoes.slice(0, 10);
  
  const maiorVantagem = dados.length > 0 ? Math.max(...dados.map(r => Number(r.vantagem) || 0)) : 0;
  const menorVantagem = dados.length > 0 ? Math.min(...dados.map(r => Number(r.vantagem) || 0)) : 0;
  
  // Informações de período
  const periodo = extrairPeriodoDados(dados);
  
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
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioVantagensPDF('top')">
            <i class="bi bi-file-pdf me-1"></i>
            PDF (Top)
          </button>
          <button class="btn btn-outline-primary btn-sm" onclick="exportarRelatorioVantagensPDF('todos')">
            <i class="bi bi-file-pdf me-1"></i>
            PDF (Todos)
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
    
    ${periodo ? `
    <div class="alert alert-info mb-4">
      <i class="bi bi-calendar3 me-2"></i>
      <strong>Período:</strong> ${periodo} | 
      <strong>Total de registros com vantagens:</strong> ${todasVantagens.length.toLocaleString('pt-BR')} | 
      <strong>Total de lotações:</strong> ${todasLotacoes.length.toLocaleString('pt-BR')}
    </div>
    ` : ''}
    
    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <div class="card chart-card">
          <div class="card-header chart-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Top 10 Maiores Vantagens</h6>
            ${todasVantagens.length > 10 ? `
            <button class="btn btn-sm btn-outline-primary" id="btn-ver-todas-vantagens">
              <i class="bi bi-arrow-down-circle me-1"></i>Ver Todas (${todasVantagens.length})
            </button>
            ` : ''}
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
          <div class="card-header chart-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Vantagens por Lotação (Top 10)</h6>
            ${todasLotacoes.length > 10 ? `
            <button class="btn btn-sm btn-outline-primary" id="btn-ver-todas-lotacoes-vantagens">
              <i class="bi bi-arrow-down-circle me-1"></i>Ver Todas (${todasLotacoes.length})
            </button>
            ` : ''}
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
    
    <!-- Seção expandida para todas as vantagens -->
    <div id="container-todas-vantagens" style="display: none;" class="mt-4">
      <div class="card chart-card">
        <div class="card-header chart-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Todas as Vantagens (${todasVantagens.length})</h6>
          <button class="btn btn-sm btn-outline-secondary" id="btn-fechar-todas-vantagens">
            <i class="bi bi-x-circle me-1"></i>Fechar
          </button>
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
              <tbody id="tbody-todas-vantagens">
              </tbody>
            </table>
          </div>
          <div id="pagination-todas-vantagens" class="mt-3"></div>
        </div>
      </div>
    </div>
    
    <!-- Seção expandida para todas as lotações -->
    <div id="container-todas-lotacoes-vantagens" style="display: none;" class="mt-4">
      <div class="card chart-card">
        <div class="card-header chart-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Vantagens por Todas as Lotações (${todasLotacoes.length})</h6>
          <button class="btn btn-sm btn-outline-secondary" id="btn-fechar-todas-lotacoes-vantagens">
            <i class="bi bi-x-circle me-1"></i>Fechar
          </button>
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
              <tbody id="tbody-todas-lotacoes-vantagens">
              </tbody>
            </table>
          </div>
          <div id="pagination-todas-lotacoes-vantagens" class="mt-3"></div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Armazenar dados completos globalmente
  window._dadosVantagens = {
    todasVantagens,
    todasLotacoes,
    periodo,
    stats,
    maiorVantagem,
    menorVantagem
  };
  
  // Configurar interatividade
  function configurarInteratividadeVantagens() {
    // Botão Ver Todas Vantagens
    const btnVerTodasVantagens = document.getElementById('btn-ver-todas-vantagens');
    if (btnVerTodasVantagens) {
      btnVerTodasVantagens.addEventListener('click', () => {
        const container = document.getElementById('container-todas-vantagens');
        if (container.style.display === 'none') {
          container.style.display = 'block';
          renderizarTodasVantagens();
          btnVerTodasVantagens.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
    
    // Botão Fechar Todas Vantagens
    const btnFecharTodasVantagens = document.getElementById('btn-fechar-todas-vantagens');
    if (btnFecharTodasVantagens) {
      btnFecharTodasVantagens.addEventListener('click', () => {
        document.getElementById('container-todas-vantagens').style.display = 'none';
      });
    }
    
    // Botão Ver Todas Lotações
    const btnVerTodasLotacoes = document.getElementById('btn-ver-todas-lotacoes-vantagens');
    if (btnVerTodasLotacoes) {
      btnVerTodasLotacoes.addEventListener('click', () => {
        const container = document.getElementById('container-todas-lotacoes-vantagens');
        if (container.style.display === 'none') {
          container.style.display = 'block';
          renderizarTodasLotacoesVantagens();
          btnVerTodasLotacoes.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
    
    // Botão Fechar Todas Lotações
    const btnFecharTodasLotacoes = document.getElementById('btn-fechar-todas-lotacoes-vantagens');
    if (btnFecharTodasLotacoes) {
      btnFecharTodasLotacoes.addEventListener('click', () => {
        document.getElementById('container-todas-lotacoes-vantagens').style.display = 'none';
      });
    }
  }
  
  function renderizarTodasVantagens() {
    const tbody = document.getElementById('tbody-todas-vantagens');
    if (!tbody || !window._dadosVantagens) return;
    
    const pagination = new Pagination('#pagination-todas-vantagens', {
      itemsPerPage: 50,
      onPageChange: (page, pageData) => {
        tbody.innerHTML = pageData.map(r => {
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
        }).join('');
      }
    });
    
    pagination.setData(window._dadosVantagens.todasVantagens);
    // Garantir que a primeira página seja renderizada imediatamente
    pagination.goToPage(1);
  }
  
  function renderizarTodasLotacoesVantagens() {
    const tbody = document.getElementById('tbody-todas-lotacoes-vantagens');
    if (!tbody || !window._dadosVantagens) return;
    
    const pagination = new Pagination('#pagination-todas-lotacoes-vantagens', {
      itemsPerPage: 50,
      onPageChange: (page, pageData) => {
        tbody.innerHTML = pageData.map(l => `
          <tr>
            <td>${l.lotacao || 'N/A'}</td>
            <td class="text-end">${l.count || 0}</td>
            <td class="text-end fw-bold text-success">${formatarMoeda(l.vantagem || 0)}</td>
            <td class="text-end">${l.count > 0 ? formatarMoeda(l.vantagem / l.count) : formatarMoeda(0)}</td>
          </tr>
        `).join('');
      }
    });
    
    pagination.setData(window._dadosVantagens.todasLotacoes);
    // Garantir que a primeira página seja renderizada imediatamente
    pagination.goToPage(1);
  }
  
  // Expor função de exportação globalmente
  window.exportarRelatorioVantagensPDF = (tipo = 'top') => {
    try {
      const dados = window._dadosVantagens;
      if (!dados) {
        if (typeof showToast === 'function') {
          showToast('Erro: dados não disponíveis', 'danger');
        }
        return;
      }
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Relatório de Vantagens', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      
      let y = 40;
      
      if (dados.periodo) {
        doc.text(`Período: ${dados.periodo}`, 15, y);
        y += 6;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Métricas', 15, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total de Vantagens: ${formatarMoeda(dados.stats.totalVantagem)}`, 15, y);
      y += 6;
      doc.text(`Média por Funcionário: ${formatarMoeda(dados.stats.totalRegistros > 0 ? dados.stats.totalVantagem / dados.stats.totalRegistros : 0)}`, 15, y);
      y += 6;
      doc.text(`Maior Vantagem: ${formatarMoeda(dados.maiorVantagem)}`, 15, y);
      y += 6;
      doc.text(`Menor Vantagem: ${formatarMoeda(dados.menorVantagem)}`, 15, y);
      y += 10;
      
      // Vantagens individuais
      const vantagensParaExportar = tipo === 'todos' ? dados.todasVantagens : dados.todasVantagens.slice(0, 10);
      
      if (vantagensParaExportar.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${tipo === 'todos' ? `Todas as Vantagens (${dados.todasVantagens.length})` : 'Top 10 Maiores Vantagens'}`, 15, y);
        y += 8;
        
        const tableData = vantagensParaExportar.map(r => [
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
        
        y = doc.lastAutoTable.finalY + 15;
      }
      
      // Vantagens por lotação
      const lotacoesParaExportar = tipo === 'todos' ? dados.todasLotacoes : dados.todasLotacoes.slice(0, 10);
      
      if (lotacoesParaExportar.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${tipo === 'todos' ? `Vantagens por Todas as Lotações (${dados.todasLotacoes.length})` : 'Vantagens por Lotação (Top 10)'}`, 15, y);
        y += 8;
        
        const tableDataLotacoes = lotacoesParaExportar.map(l => [
          l.lotacao || 'N/A',
          (l.count || 0).toString(),
          formatarMoeda(l.vantagem || 0),
          l.count > 0 ? formatarMoeda(l.vantagem / l.count) : formatarMoeda(0)
        ]);
        
        doc.autoTable({
          startY: y,
          head: [['Lotação', 'Qtd', 'Total', 'Média']],
          body: tableDataLotacoes,
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
      
      const sufixo = tipo === 'todos' ? '_Completo' : '_Top';
      doc.save(`Relatorio_Vantagens${sufixo}_${new Date().getTime()}.pdf`);
      if (typeof showToast === 'function') {
        showToast(`PDF ${tipo === 'todos' ? 'completo' : 'Top'} exportado com sucesso!`, 'success');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      if (typeof showToast === 'function') {
        showToast('Erro ao exportar PDF. Verifique o console.', 'danger');
      }
    }
  };
}

