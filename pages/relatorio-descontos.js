/**
 * RELATÓRIO DE DESCONTOS
 * Análise detalhada de descontos aplicados
 */

import { formatarMoeda, formatarPercentual, extrairPeriodoDados } from '../utils/formatters.js';
import { agregarPorLotacao, topN } from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';
import { Pagination } from '../utils/pagination.js';

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
  
  // Todos os descontos ordenados (para ver todos)
  const todosDescontos = dados
    .filter(r => r.nome && r.nome !== '*Totais*' && !isNaN(Number(r.desconto)))
    .sort((a, b) => (Number(b.desconto) || 0) - (Number(a.desconto) || 0));
  
  // Top 10 maiores descontos - garantir que são registros individuais
  const top10 = todosDescontos.slice(0, 10);
  
  // Debug: verificar se top10 está correto
  if (top10.length > 0 && (!top10[0].nome || top10[0].nome === '*Totais*')) {
    console.error('Erro: top10 retornando dados agregados em vez de individuais');
    console.log('Primeiro item:', top10[0]);
    console.log('Dados originais (primeiros 3):', dados.slice(0, 3));
  }
  
  // Agregação por lotação - TODOS
  const todasLotacoes = Object.values(agregarPorLotacao(dados))
    .sort((a, b) => b.desconto - a.desconto);
  
  // Top 10 para exibição inicial
  const porLotacao = todasLotacoes.slice(0, 10);
  
  // Informações de período
  const periodo = extrairPeriodoDados(dados);
  
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
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioDescontosPDF('top')">
            <i class="bi bi-file-pdf me-1"></i>
            PDF (Top)
          </button>
          <button class="btn btn-outline-primary btn-sm" onclick="exportarRelatorioDescontosPDF('todos')">
            <i class="bi bi-file-pdf me-1"></i>
            PDF (Todos)
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
    
    ${periodo ? `
    <div class="alert alert-info mb-4">
      <i class="bi bi-calendar3 me-2"></i>
      <strong>Período:</strong> ${periodo} | 
      <strong>Total de registros com descontos:</strong> ${todosDescontos.length.toLocaleString('pt-BR')} | 
      <strong>Total de lotações:</strong> ${todasLotacoes.length.toLocaleString('pt-BR')}
    </div>
    ` : ''}
    
    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <div class="card chart-card">
          <div class="card-header chart-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Top 10 Maiores Descontos</h6>
            ${todosDescontos.length > 10 ? `
            <button class="btn btn-sm btn-outline-primary" id="btn-ver-todos-descontos">
              <i class="bi bi-arrow-down-circle me-1"></i>Ver Todos (${todosDescontos.length})
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
          <div class="card-header chart-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Descontos por Lotação (Top 10)</h6>
            ${todasLotacoes.length > 10 ? `
            <button class="btn btn-sm btn-outline-primary" id="btn-ver-todas-lotacoes-descontos">
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
    
    <!-- Seção expandida para todos os descontos -->
    <div id="container-todos-descontos" style="display: none;" class="mt-4">
      <div class="card chart-card">
        <div class="card-header chart-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Todos os Descontos (${todosDescontos.length})</h6>
          <button class="btn btn-sm btn-outline-secondary" id="btn-fechar-todos-descontos">
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
                  <th class="text-end">Desconto</th>
                </tr>
              </thead>
              <tbody id="tbody-todos-descontos">
              </tbody>
            </table>
          </div>
          <div id="pagination-todos-descontos" class="mt-3"></div>
        </div>
      </div>
    </div>
    
    <!-- Seção expandida para todas as lotações -->
    <div id="container-todas-lotacoes-descontos" style="display: none;" class="mt-4">
      <div class="card chart-card">
        <div class="card-header chart-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Descontos por Todas as Lotações (${todasLotacoes.length})</h6>
          <button class="btn btn-sm btn-outline-secondary" id="btn-fechar-todas-lotacoes-descontos">
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
                </tr>
              </thead>
              <tbody id="tbody-todas-lotacoes-descontos">
              </tbody>
            </table>
          </div>
          <div id="pagination-todas-lotacoes-descontos" class="mt-3"></div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Armazenar dados completos globalmente
  window._dadosDescontos = {
    todosDescontos,
    todasLotacoes,
    periodo,
    totalDescontos,
    mediaDescontos,
    percMedio
  };
  
  // Configurar interatividade
  configurarInteratividadeDescontos();
  
  // Configurar interatividade
  function configurarInteratividadeDescontos() {
    // Botão Ver Todos Descontos
    const btnVerTodosDescontos = document.getElementById('btn-ver-todos-descontos');
    if (btnVerTodosDescontos) {
      btnVerTodosDescontos.addEventListener('click', () => {
        const container = document.getElementById('container-todos-descontos');
        if (container.style.display === 'none') {
          container.style.display = 'block';
          renderizarTodosDescontos();
          btnVerTodosDescontos.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
    
    // Botão Fechar Todos Descontos
    const btnFecharTodosDescontos = document.getElementById('btn-fechar-todos-descontos');
    if (btnFecharTodosDescontos) {
      btnFecharTodosDescontos.addEventListener('click', () => {
        document.getElementById('container-todos-descontos').style.display = 'none';
      });
    }
    
    // Botão Ver Todas Lotações
    const btnVerTodasLotacoes = document.getElementById('btn-ver-todas-lotacoes-descontos');
    if (btnVerTodasLotacoes) {
      btnVerTodasLotacoes.addEventListener('click', () => {
        const container = document.getElementById('container-todas-lotacoes-descontos');
        if (container.style.display === 'none') {
          container.style.display = 'block';
          renderizarTodasLotacoesDescontos();
          btnVerTodasLotacoes.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
    
    // Botão Fechar Todas Lotações
    const btnFecharTodasLotacoes = document.getElementById('btn-fechar-todas-lotacoes-descontos');
    if (btnFecharTodasLotacoes) {
      btnFecharTodasLotacoes.addEventListener('click', () => {
        document.getElementById('container-todas-lotacoes-descontos').style.display = 'none';
      });
    }
  }
  
  function renderizarTodosDescontos() {
    const tbody = document.getElementById('tbody-todos-descontos');
    if (!tbody || !window._dadosDescontos) return;
    
    const pagination = new Pagination('#pagination-todos-descontos', {
      itemsPerPage: 50,
      onPageChange: (page, pageData) => {
        tbody.innerHTML = pageData.map(r => {
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
        }).join('');
      }
    });
    
    pagination.setData(window._dadosDescontos.todosDescontos);
    // Garantir que a primeira página seja renderizada imediatamente
    pagination.goToPage(1);
  }
  
  function renderizarTodasLotacoesDescontos() {
    const tbody = document.getElementById('tbody-todas-lotacoes-descontos');
    if (!tbody || !window._dadosDescontos) return;
    
    const pagination = new Pagination('#pagination-todas-lotacoes-descontos', {
      itemsPerPage: 50,
      onPageChange: (page, pageData) => {
        tbody.innerHTML = pageData.map(l => `
          <tr>
            <td>${l.lotacao || 'N/A'}</td>
            <td class="text-end">${l.count || 0}</td>
            <td class="text-end fw-bold">${formatarMoeda(l.desconto || 0)}</td>
          </tr>
        `).join('');
      }
    });
    
    pagination.setData(window._dadosDescontos.todasLotacoes);
    // Garantir que a primeira página seja renderizada imediatamente
    pagination.goToPage(1);
  }
  
  // Expor função de exportação globalmente
  window.exportarRelatorioDescontosPDF = (tipo = 'top') => {
    try {
      const dados = window._dadosDescontos;
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
      doc.text('Relatório de Descontos', 15, 20);
      
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
      doc.text(`Total de Descontos: ${formatarMoeda(dados.totalDescontos)}`, 15, y);
      y += 6;
      doc.text(`Média por Funcionário: ${formatarMoeda(dados.mediaDescontos)}`, 15, y);
      y += 6;
      doc.text(`% sobre Vantagens: ${formatarPercentual(dados.percMedio)}`, 15, y);
      y += 10;
      
      // Descontos individuais
      const descontosParaExportar = tipo === 'todos' ? dados.todosDescontos : dados.todosDescontos.slice(0, 10);
      
      if (descontosParaExportar.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${tipo === 'todos' ? `Todos os Descontos (${dados.todosDescontos.length})` : 'Top 10 Maiores Descontos'}`, 15, y);
        y += 8;
        
        const tableData = descontosParaExportar.map(r => [
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
        
        y = doc.lastAutoTable.finalY + 15;
      }
      
      // Descontos por lotação
      const lotacoesParaExportar = tipo === 'todos' ? dados.todasLotacoes : dados.todasLotacoes.slice(0, 10);
      
      if (lotacoesParaExportar.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${tipo === 'todos' ? `Descontos por Todas as Lotações (${dados.todasLotacoes.length})` : 'Descontos por Lotação (Top 10)'}`, 15, y);
        y += 8;
        
        const tableDataLotacoes = lotacoesParaExportar.map(l => [
          l.lotacao || 'N/A',
          (l.count || 0).toString(),
          formatarMoeda(l.desconto || 0)
        ]);
        
        doc.autoTable({
          startY: y,
          head: [['Lotação', 'Qtd', 'Total']],
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
      doc.save(`Relatorio_Descontos${sufixo}_${new Date().getTime()}.pdf`);
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

