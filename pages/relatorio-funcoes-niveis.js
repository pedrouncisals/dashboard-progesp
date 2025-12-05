/**
 * RELATÓRIO DE FUNÇÕES E NÍVEIS
 * Análise por função e nível funcional
 */

import { formatarMoeda, extrairPeriodoDados } from '../utils/formatters.js';
import { agregarPorFuncao, agregarPorFuncaoNivel } from '../services/folha-pagamento.js';
import { showToast } from '../utils/feedback.js';
import { Pagination } from '../utils/pagination.js';

export function renderRelatorioFuncoesNiveis(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  // Agregar por função - TODOS os dados
  const todasFuncoes = Object.values(agregarPorFuncao(dados))
    .map(f => ({
      ...f,
      mediaLiquido: f.liquido / f.count
    }))
    .sort((a, b) => b.count - a.count);
  
  // Top 15 para exibição inicial
  const porFuncao = todasFuncoes.slice(0, 15);
  
  // Agregar por função e nível - TODOS os dados
  const todasFuncoesNiveis = Object.values(agregarPorFuncaoNivel(dados))
    .sort((a, b) => b.count - a.count);
  
  // Top 20 para exibição inicial
  const porFuncaoNivel = todasFuncoesNiveis.slice(0, 20);
  
  const funcaoMaisFuncionarios = todasFuncoes[0];
  const funcaoMaiorMedia = [...todasFuncoes].sort((a, b) => b.mediaLiquido - a.mediaLiquido)[0];
  const totalFuncoes = new Set(dados.map(r => r.funcao)).size;
  
  // Informações de período
  const periodo = extrairPeriodoDados(dados);
  const totalCombinacoes = todasFuncoesNiveis.length;
  const totalFuncionarios = todasFuncoesNiveis.reduce((sum, fn) => sum + fn.count, 0);
  
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
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioFuncoesNiveisPDF('top')">
            <i class="bi bi-file-pdf me-1"></i>
            PDF (Top)
          </button>
          <button class="btn btn-outline-primary btn-sm" onclick="exportarRelatorioFuncoesNiveisPDF('todos')">
            <i class="bi bi-file-pdf me-1"></i>
            PDF (Todos)
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
    
    ${periodo ? `
    <div class="alert alert-info mb-4">
      <i class="bi bi-calendar3 me-2"></i>
      <strong>Período:</strong> ${periodo} | 
      <strong>Total de combinações Função x Nível:</strong> ${totalCombinacoes} | 
      <strong>Total de funcionários:</strong> ${totalFuncionarios.toLocaleString('pt-BR')}
    </div>
    ` : ''}
    
    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <div class="card chart-card">
          <div class="card-header chart-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Top 15 Funções por Quantidade</h6>
            ${todasFuncoes.length > 15 ? `
            <button class="btn btn-sm btn-outline-primary" id="btn-ver-todas-funcoes">
              <i class="bi bi-arrow-down-circle me-1"></i>Ver Todas (${todasFuncoes.length})
            </button>
            ` : ''}
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
          <div class="card-header chart-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Distribuição Função x Nível (Top 20)</h6>
            ${totalCombinacoes > 20 ? `
            <button class="btn btn-sm btn-outline-primary" id="btn-ver-todas-funcoes-niveis">
              <i class="bi bi-arrow-down-circle me-1"></i>Ver Todas (${totalCombinacoes})
            </button>
            ` : ''}
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
                <tbody id="tbody-funcoes-niveis">
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
            <div id="pagination-funcoes-niveis" class="mt-3"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal ou seção expandida para todas as funções -->
    <div id="container-todas-funcoes" style="display: none;" class="mt-4">
      <div class="card chart-card">
        <div class="card-header chart-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Todas as Funções (${todasFuncoes.length})</h6>
          <button class="btn btn-sm btn-outline-secondary" id="btn-fechar-todas-funcoes">
            <i class="bi bi-x-circle me-1"></i>Fechar
          </button>
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
              <tbody id="tbody-todas-funcoes">
              </tbody>
            </table>
          </div>
          <div id="pagination-todas-funcoes" class="mt-3"></div>
        </div>
      </div>
    </div>
    
    <!-- Modal ou seção expandida para todas as combinações função x nível -->
    <div id="container-todas-funcoes-niveis" style="display: none;" class="mt-4">
      <div class="card chart-card">
        <div class="card-header chart-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Todas as Combinações Função x Nível (${totalCombinacoes})</h6>
          <button class="btn btn-sm btn-outline-secondary" id="btn-fechar-todas-funcoes-niveis">
            <i class="bi bi-x-circle me-1"></i>Fechar
          </button>
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
              <tbody id="tbody-todas-funcoes-niveis">
              </tbody>
            </table>
          </div>
          <div id="pagination-todas-funcoes-niveis" class="mt-3"></div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Armazenar dados completos globalmente para uso nas funções
  window._dadosFuncoesNiveis = {
    todasFuncoes,
    todasFuncoesNiveis,
    periodo,
    totalCombinacoes,
    totalFuncionarios
  };
  
  // Configurar paginação e botões
  function configurarInteratividadeFuncoesNiveis() {
    // Botão Ver Todas Funções
    const btnVerTodasFuncoes = document.getElementById('btn-ver-todas-funcoes');
    if (btnVerTodasFuncoes) {
      btnVerTodasFuncoes.addEventListener('click', () => {
        const container = document.getElementById('container-todas-funcoes');
        if (container.style.display === 'none') {
          container.style.display = 'block';
          renderizarTodasFuncoes();
          btnVerTodasFuncoes.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
    
    // Botão Fechar Todas Funções
    const btnFecharTodasFuncoes = document.getElementById('btn-fechar-todas-funcoes');
    if (btnFecharTodasFuncoes) {
      btnFecharTodasFuncoes.addEventListener('click', () => {
        document.getElementById('container-todas-funcoes').style.display = 'none';
      });
    }
    
    // Botão Ver Todas Funções x Níveis
    const btnVerTodasFuncoesNiveis = document.getElementById('btn-ver-todas-funcoes-niveis');
    if (btnVerTodasFuncoesNiveis) {
      btnVerTodasFuncoesNiveis.addEventListener('click', () => {
        const container = document.getElementById('container-todas-funcoes-niveis');
        if (container.style.display === 'none') {
          container.style.display = 'block';
          renderizarTodasFuncoesNiveis();
          btnVerTodasFuncoesNiveis.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
    
    // Botão Fechar Todas Funções x Níveis
    const btnFecharTodasFuncoesNiveis = document.getElementById('btn-fechar-todas-funcoes-niveis');
    if (btnFecharTodasFuncoesNiveis) {
      btnFecharTodasFuncoesNiveis.addEventListener('click', () => {
        document.getElementById('container-todas-funcoes-niveis').style.display = 'none';
      });
    }
  }
  
  function renderizarTodasFuncoes() {
    const tbody = document.getElementById('tbody-todas-funcoes');
    
    if (!tbody || !window._dadosFuncoesNiveis) return;
    
    const pagination = new Pagination('#pagination-todas-funcoes', {
      itemsPerPage: 50,
      onPageChange: (page, pageData) => {
        tbody.innerHTML = pageData.map(f => `
          <tr>
            <td class="fw-semibold" style="color: var(--color-text-primary) !important;">${f.funcao || 'N/A'}</td>
            <td class="text-end" style="color: var(--color-text-primary) !important;">${f.count || 0}</td>
            <td class="text-end" style="color: var(--color-text-primary) !important;">${f.count > 0 ? formatarMoeda(f.mediaLiquido) : formatarMoeda(0)}</td>
          </tr>
        `).join('');
      }
    });
    
    pagination.setData(window._dadosFuncoesNiveis.todasFuncoes);
    // Garantir que a primeira página seja renderizada imediatamente
    pagination.goToPage(1);
  }
  
  function renderizarTodasFuncoesNiveis() {
    const tbody = document.getElementById('tbody-todas-funcoes-niveis');
    
    if (!tbody || !window._dadosFuncoesNiveis) return;
    
    const pagination = new Pagination('#pagination-todas-funcoes-niveis', {
      itemsPerPage: 50,
      onPageChange: (page, pageData) => {
        tbody.innerHTML = pageData.map(fn => `
          <tr>
            <td style="color: var(--color-text-primary) !important;"><small>${fn.funcao || 'N/A'}</small></td>
            <td style="color: var(--color-text-secondary) !important;"><small>${fn.nivel || 'N/A'}</small></td>
            <td class="text-end" style="color: var(--color-text-primary) !important;">${fn.count || 0}</td>
            <td class="text-end" style="color: var(--color-text-primary) !important;">${fn.count > 0 ? formatarMoeda(fn.liquido / fn.count) : formatarMoeda(0)}</td>
          </tr>
        `).join('');
      }
    });
    
    pagination.setData(window._dadosFuncoesNiveis.todasFuncoesNiveis);
    // Garantir que a primeira página seja renderizada imediatamente
    pagination.goToPage(1);
  }
  
  // Chamar a função de configuração
  configurarInteratividadeFuncoesNiveis();
  
  // Expor função de exportação globalmente
  window.exportarRelatorioFuncoesNiveisPDF = (tipo = 'top') => {
    try {
      const dados = window._dadosFuncoesNiveis;
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
      doc.text('Relatório de Funções e Níveis', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 28);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 34);
      
      let y = 40;
      
      if (dados.periodo) {
        doc.text(`Período: ${dados.periodo}`, 15, y);
        y += 6;
      }
      
      // Tabela de Funções
      const funcoesParaExportar = tipo === 'todos' ? dados.todasFuncoes : dados.todasFuncoes.slice(0, 15);
      
      if (funcoesParaExportar.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Distribuição por Função ${tipo === 'todos' ? `(${dados.todasFuncoes.length} funções)` : '(Top 15)'}`, 15, y);
        y += 8;
        
        const tableDataFuncao = funcoesParaExportar.map(f => [
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
      const funcoesNiveisParaExportar = tipo === 'todos' ? dados.todasFuncoesNiveis : dados.todasFuncoesNiveis.slice(0, 20);
      
      if (funcoesNiveisParaExportar.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Distribuição Função x Nível ${tipo === 'todos' ? `(${dados.totalCombinacoes} combinações)` : '(Top 20)'}`, 15, y);
        y += 8;
        
        const tableDataFuncaoNivel = funcoesNiveisParaExportar.map(fn => [
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
      
      const sufixo = tipo === 'todos' ? '_Completo' : '_Top';
      doc.save(`Relatorio_Funcoes_Niveis${sufixo}_${new Date().getTime()}.pdf`);
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

