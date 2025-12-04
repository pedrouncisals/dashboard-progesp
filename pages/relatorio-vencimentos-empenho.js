/**
 * RELATÓRIO DE VENCIMENTOS - EMPENHO
 * Lista completa de funcionários com seus vencimentos de empenho
 */

import { formatarMoeda, formatarCPF, normalizarCPF } from '../utils/formatters.js';
import { Pagination } from '../utils/pagination.js';
import { exportRelatorioPDF, exportarCSV } from '../utils/pdf.js';

export function renderRelatorioVencimentosEmpenho(dados) {
  const container = document.getElementById('relatorio-detalhado-container');
  
  const html = `
    <div class="card mb-4">
      <div class="card-header chart-header">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h5 class="card-title mb-0">
              <i class="bi bi-calendar-check-fill me-2"></i>
              Relatório de Vencimentos - Empenho
            </h5>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-primary" id="exportar-vencimentos-empenho-pdf">
              <i class="bi bi-file-pdf me-1"></i>PDF
            </button>
            <button class="btn btn-sm btn-primary" id="exportar-vencimentos-empenho-csv">
              <i class="bi bi-file-earmark-spreadsheet me-1"></i>CSV
            </button>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th class="sortable">Nome</th>
                <th>CPF</th>
                <th>Matrícula</th>
                <th>Lotação</th>
                <th>Cargo</th>
                <th>Vínculo</th>
                <th class="text-end sortable">Salário</th>
                <th>Carga Horária</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody id="tbody-vencimentos-empenho">
              <!-- Preenchido via JS -->
            </tbody>
          </table>
        </div>
        <div id="pagination-vencimentos-empenho"></div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Paginação
  const pagination = new Pagination('#pagination-vencimentos-empenho', {
    itemsPerPage: 10,
    onPageChange: (page, pageData) => {
      renderTabelaVencimentosEmpenho(pageData);
    }
  });
  
  pagination.setData(dados);
  renderTabelaVencimentosEmpenho(pagination.getCurrentPageData());
  
  // Event listeners
  document.getElementById('exportar-vencimentos-empenho-pdf').addEventListener('click', () => {
    exportarVencimentosEmpenhoPDF(dados);
  });
  
  document.getElementById('exportar-vencimentos-empenho-csv').addEventListener('click', () => {
    exportarVencimentosEmpenhoCSV(dados);
  });
}

function renderTabelaVencimentosEmpenho(dados) {
  const tbody = document.getElementById('tbody-vencimentos-empenho');
  
  if (dados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum registro encontrado</td></tr>';
    return;
  }
  
  // Identificar pessoas com múltiplos vínculos
  // IMPORTANTE: Normalizar CPF para garantir comparação correta mesmo com formatos diferentes
  const cpfsComMultiplasMatriculas = new Set();
  const cpfParaMatriculas = new Map();
  
  dados.forEach(r => {
    if (r.cpf && r.cpf.trim() !== '') {
      // Normalizar CPF (remover pontos e traços) para comparação
      const cpfNormalizado = normalizarCPF(r.cpf);
      if (cpfNormalizado && cpfNormalizado.length === 11) {
        if (!cpfParaMatriculas.has(cpfNormalizado)) {
          cpfParaMatriculas.set(cpfNormalizado, new Set());
        }
        if (r.matricula && r.matricula.trim() !== '') {
          cpfParaMatriculas.get(cpfNormalizado).add(r.matricula.trim());
        }
      }
    }
  });
  
  cpfParaMatriculas.forEach((matriculas, cpf) => {
    if (matriculas.size > 1) {
      cpfsComMultiplasMatriculas.add(cpf);
    }
  });
  
  tbody.innerHTML = dados.map(r => {
    const nome = r.nome && r.nome !== '*Totais*' ? r.nome : 'N/A';
    const cpf = r.cpf && r.cpf.trim() !== '' ? r.cpf.trim() : '';
    const cpfNormalizado = normalizarCPF(cpf);
    const matricula = r.matricula && r.matricula.trim() !== '' ? r.matricula.trim() : '-';
    // Usar CPF normalizado para verificar múltiplos vínculos
    const temMultiplosVinculos = cpfNormalizado && cpfsComMultiplasMatriculas.has(cpfNormalizado);
    const cargaHoraria = r.carga_horaria || '-';
    
    return `
      <tr ${temMultiplosVinculos ? 'style="background-color: rgba(13, 202, 240, 0.05) !important;"' : ''}>
        <td style="color: var(--color-text-primary) !important;">
          ${nome}
          ${temMultiplosVinculos ? `<span class="badge bg-info-subtle text-info ms-2" style="font-size: 0.7rem;" title="Esta pessoa possui múltiplos vínculos">
            <i class="bi bi-briefcase-fill"></i>
          </span>` : ''}
        </td>
        <td style="color: var(--color-text-primary) !important;">${formatarCPF(cpf || '')}</td>
        <td style="color: var(--color-text-primary) !important;">
          <strong>${matricula}</strong>
        </td>
        <td style="color: var(--color-text-primary) !important;">${r.lotacao_normalizada || '-'}</td>
        <td style="color: var(--color-text-secondary) !important;"><small>${r.funcao || '-'}</small></td>
        <td style="color: var(--color-text-secondary) !important;"><small>${r.vinculo || '-'}</small></td>
        <td class="text-end fw-bold" style="color: var(--color-text-primary) !important;">${formatarMoeda(Number(r.liquido) || 0)}</td>
        <td style="color: var(--color-text-secondary) !important;">${cargaHoraria}h</td>
        <td>
          <span class="badge ${r.situacao === 'ATIVO' ? 'badge-success' : 'badge-danger'}">
            ${r.situacao || 'N/A'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function exportarVencimentosEmpenhoPDF(dados) {
  const colunas = [
    { header: 'Nome', accessor: r => r.nome },
    { header: 'CPF', accessor: r => formatarCPF(r.cpf) },
    { header: 'Matrícula', accessor: r => r.matricula || '-' },
    { header: 'Lotação', accessor: r => r.lotacao_normalizada || '-' },
    { header: 'Cargo', accessor: r => r.funcao || '-' },
    { header: 'Vínculo', accessor: r => r.vinculo || '-' },
    { header: 'Salário', accessor: r => formatarMoeda(r.liquido) },
    { header: 'Carga Horária', accessor: r => `${r.carga_horaria || '-'}h` },
    { header: 'Situação', accessor: r => r.situacao || '-' }
  ];
  
  exportRelatorioPDF('Relatório de Vencimentos - Empenho', dados, colunas, {});
}

function exportarVencimentosEmpenhoCSV(dados) {
  const colunas = [
    { header: 'Nome', accessor: r => r.nome },
    { header: 'CPF', accessor: r => r.cpf },
    { header: 'Matrícula', accessor: r => r.matricula || '' },
    { header: 'Lotação', accessor: r => r.lotacao_normalizada || '' },
    { header: 'Cargo', accessor: r => r.funcao || '' },
    { header: 'Vínculo', accessor: r => r.vinculo || '' },
    { header: 'Salário', accessor: r => r.liquido },
    { header: 'Carga Horária', accessor: r => r.carga_horaria || '' },
    { header: 'Situação', accessor: r => r.situacao || '' }
  ];
  
  exportarCSV('vencimentos_empenho', dados, colunas);
}

