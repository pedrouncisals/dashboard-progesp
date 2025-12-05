/**
 * RELATÓRIO CONSOLIDADO GERAL - EMPENHO
 * Visão geral completa com todas as métricas de empenho
 */

import { formatarMoeda, formatarNumero, formatarCompetencia, extrairPeriodoDados } from '../utils/formatters.js';
import {
  calcularEstatisticas,
  agregarPorLotacao,
  agregarPorVinculo,
  agregarPorCompetencia
} from '../services/empenho.js';
import { showToast } from '../utils/feedback.js';
import { Pagination } from '../utils/pagination.js';

export function renderRelatorioConsolidadoEmpenho(dados) {
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
  
  const porCompetencia = Object.values(agregarPorCompetencia(dados))
    .sort((a, b) => a.competencia.localeCompare(b.competencia));
  
  const totalLotacoes = todasLotacoes.length;
  
  // Extrair período dos dados
  const periodo = extrairPeriodoDados(dados);
  
  const html = `
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 class="fw-bold mb-2">
            <i class="bi bi-file-earmark-bar-graph-fill text-info me-2"></i>
            Relatório Consolidado Geral - Empenho
            ${periodo ? `<span class="badge bg-info-subtle text-info ms-2" style="font-size: 0.875rem; font-weight: 500;">
              <i class="bi bi-calendar3 me-1"></i>${periodo}
            </span>` : ''}
          </h4>
          <p class="text-muted mb-0">Visão completa de todas as métricas e agregações dos empenhos</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="exportarRelatorioConsolidadoEmpenhoPDF('top')">
            <i class="bi bi-file-pdf me-1"></i>
            PDF (Top)
          </button>
          <button class="btn btn-outline-primary btn-sm" onclick="exportarRelatorioConsolidadoEmpenhoPDF('todos')">
            <i class="bi bi-file-pdf me-1"></i>
            PDF (Todos)
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
          <div class="metric-trend">
            <span class="text-muted small">Pessoas únicas (por CPF)</span>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6">
        <div class="metric-card">
          <div class="metric-icon text-info">
            <i class="bi bi-briefcase-fill"></i>
          </div>
          <div class="metric-value">${formatarNumero(stats.totalVinculos || 0)}</div>
          <div class="metric-label">Total de Vínculos</div>
          <div class="metric-trend">
            <span class="text-muted small">Cargos ativos (por matrícula)</span>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6">
        <div class="metric-card">
          <div class="metric-icon text-success">
            <i class="bi bi-currency-dollar"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.totalLiquido)}</div>
          <div class="metric-label">Total Líquido</div>
          <div class="metric-trend">
            <span class="text-muted small">Valor total pago</span>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6">
        <div class="metric-card">
          <div class="metric-icon text-primary">
            <i class="bi bi-graph-up"></i>
          </div>
          <div class="metric-value">${formatarMoeda(stats.mediaLiquido)}</div>
          <div class="metric-label">Média Líquida</div>
          <div class="metric-trend">
            <span class="text-muted small">Por empenho</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Top 5 Lotações -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-semibold mb-0">🏢 Top 5 Lotações por Valor</h6>
          ${totalLotacoes > 5 ? `
          <button class="btn btn-sm btn-outline-primary" id="btn-ver-todas-lotacoes-consolidado-empenho">
            <i class="bi bi-arrow-down-circle me-1"></i>Ver Todas (${totalLotacoes})
          </button>
          ` : ''}
        </div>
        <div class="card chart-card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Lotação</th>
                    <th class="text-end">Empenhos</th>
                    <th class="text-end">Total Líquido</th>
                    <th class="text-end">Média</th>
                  </tr>
                </thead>
                <tbody>
                  ${porLotacao.map(lot => `
                    <tr>
                      <td style="color: var(--color-text-primary) !important;">${lot.lotacao}</td>
                      <td class="text-end" style="color: var(--color-text-primary) !important;">${formatarNumero(lot.count)}</td>
                      <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(lot.liquido)}</td>
                      <td class="text-end" style="color: var(--color-text-secondary) !important;">${formatarMoeda(lot.liquido / lot.count)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Seção expandida para todas as lotações -->
    <div id="container-todas-lotacoes-consolidado-empenho" style="display: none;" class="row mb-4">
      <div class="col-12">
        <div class="card chart-card">
          <div class="card-header chart-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Todas as Lotações (${totalLotacoes})</h6>
            <button class="btn btn-sm btn-outline-secondary" id="btn-fechar-todas-lotacoes-consolidado-empenho">
              <i class="bi bi-x-circle me-1"></i>Fechar
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Lotação</th>
                    <th class="text-end">Empenhos</th>
                    <th class="text-end">Total Líquido</th>
                    <th class="text-end">Média</th>
                  </tr>
                </thead>
                <tbody id="tbody-todas-lotacoes-consolidado-empenho">
                </tbody>
              </table>
            </div>
            <div id="pagination-todas-lotacoes-consolidado-empenho" class="mt-3"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Por Vínculo -->
    <div class="row mb-4">
      <div class="col-12">
        <h6 class="fw-semibold mb-3">👔 Distribuição por Vínculo</h6>
        <div class="card chart-card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Vínculo</th>
                    <th class="text-end">Empenhos</th>
                    <th class="text-end">Total Líquido</th>
                    <th class="text-end">% do Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${porVinculo.map(vin => {
                    const percentual = (vin.liquido / stats.totalLiquido * 100).toFixed(1);
                    return `
                      <tr>
                        <td style="color: var(--color-text-primary) !important;">${vin.vinculo}</td>
                        <td class="text-end" style="color: var(--color-text-primary) !important;">${formatarNumero(vin.count)}</td>
                        <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(vin.liquido)}</td>
                        <td class="text-end" style="color: var(--color-text-secondary) !important;">${percentual}%</td>
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
    
    <!-- Evolução Mensal -->
    <div class="row mb-4">
      <div class="col-12">
        <h6 class="fw-semibold mb-3">📅 Evolução Mensal</h6>
        <div class="card chart-card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Competência</th>
                    <th class="text-end">Empenhos</th>
                    <th class="text-end">Total Líquido</th>
                    <th class="text-end">Média</th>
                  </tr>
                </thead>
                <tbody>
                  ${porCompetencia.map(comp => `
                    <tr>
                      <td style="color: var(--color-text-primary) !important;">${formatarCompetencia(comp.competencia)}</td>
                      <td class="text-end" style="color: var(--color-text-primary) !important;">${formatarNumero(comp.count)}</td>
                      <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(comp.liquido)}</td>
                      <td class="text-end" style="color: var(--color-text-secondary) !important;">${formatarMoeda(comp.liquido / comp.count)}</td>
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
  
  // Armazenar dados completos globalmente
  window._dadosConsolidadoEmpenho = {
    todasLotacoes: todasLotacoes.sort((a, b) => b.liquido - a.liquido),
    periodo,
    stats,
    totalLotacoes,
    dados // Armazenar dados originais para exportação
  };
  
  // Configurar interatividade
  function configurarInteratividadeConsolidadoEmpenho() {
    // Botão Ver Todas Lotações
    const btnVerTodasLotacoes = document.getElementById('btn-ver-todas-lotacoes-consolidado-empenho');
    if (btnVerTodasLotacoes) {
      btnVerTodasLotacoes.addEventListener('click', () => {
        const container = document.getElementById('container-todas-lotacoes-consolidado-empenho');
        if (container.style.display === 'none') {
          container.style.display = 'block';
          renderizarTodasLotacoesConsolidadoEmpenho();
          btnVerTodasLotacoes.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
    
    // Botão Fechar Todas Lotações
    const btnFecharTodasLotacoes = document.getElementById('btn-fechar-todas-lotacoes-consolidado-empenho');
    if (btnFecharTodasLotacoes) {
      btnFecharTodasLotacoes.addEventListener('click', () => {
        document.getElementById('container-todas-lotacoes-consolidado-empenho').style.display = 'none';
      });
    }
  }
  
  function renderizarTodasLotacoesConsolidadoEmpenho() {
    const tbody = document.getElementById('tbody-todas-lotacoes-consolidado-empenho');
    if (!tbody || !window._dadosConsolidadoEmpenho) return;
    
    const pagination = new Pagination('#pagination-todas-lotacoes-consolidado-empenho', {
      itemsPerPage: 50,
      onPageChange: (page, pageData) => {
        tbody.innerHTML = pageData.map(lot => `
          <tr>
            <td style="color: var(--color-text-primary) !important;">${lot.lotacao}</td>
            <td class="text-end" style="color: var(--color-text-primary) !important;">${formatarNumero(lot.count)}</td>
            <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(lot.liquido)}</td>
            <td class="text-end" style="color: var(--color-text-secondary) !important;">${formatarMoeda(lot.liquido / lot.count)}</td>
          </tr>
        `).join('');
      }
    });
    
    pagination.setData(window._dadosConsolidadoEmpenho.todasLotacoes);
    // Garantir que a primeira página seja renderizada imediatamente
    pagination.goToPage(1);
  }
  
  // Chamar a função de configuração
  configurarInteratividadeConsolidadoEmpenho();
  
  // Expor função de exportação globalmente
  window.exportarRelatorioConsolidadoEmpenhoPDF = async (tipo = 'top') => {
    try {
      // O relatório consolidado de empenho exporta todos os dados, não apenas lotações
      // O parâmetro 'tipo' é mantido para consistência, mas não afeta a exportação
      const { exportRelatorioPDF } = await import('../utils/pdf.js');
      const colunas = [
        { header: 'Mês', accessor: r => r.competencia ? formatarCompetencia(r.competencia) : '-' },
        { header: 'Nome', accessor: r => r.nome },
        { header: 'CPF', accessor: r => r.cpf },
        { header: 'Matrícula', accessor: r => r.matricula || '-' },
        { header: 'Lotação', accessor: r => r.lotacao_normalizada || '-' },
        { header: 'Cargo', accessor: r => r.funcao || '-' },
        { header: 'Vínculo', accessor: r => r.vinculo || '-' },
        { header: 'Salário', accessor: r => formatarMoeda(r.liquido) }
      ];
      
      const dadosExportacao = window._dadosConsolidadoEmpenho?.dados || dados;
      const sufixo = tipo === 'todos' ? '_Completo' : '';
      exportRelatorioPDF(`Relatório Consolidado Empenho${sufixo}`, dadosExportacao, colunas, {});
      if (typeof showToast === 'function') {
        showToast('PDF exportado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      if (typeof showToast === 'function') {
        showToast('Erro ao exportar PDF', 'danger');
      }
    }
  };
}

