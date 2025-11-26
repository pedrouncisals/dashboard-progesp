/**
 * EXPORTAÇÃO PDF
 * Funções para exportar relatórios em PDF usando jsPDF
 */

import { formatarMoeda, formatarCPF, formatarCompetencia } from './formatters.js';

/**
 * Exporta relatório em PDF
 * @param {string} titulo - Título do relatório
 * @param {Array} dados - Array de dados
 * @param {Array} colunas - Array de objetos {header, accessor}
 * @param {Object} filtros - Filtros aplicados
 */
export function exportRelatorioPDF(titulo, dados, colunas, filtros = {}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
  
  // Header
  addHeader(doc, titulo);
  
  // Informações de filtros
  let yPos = 35;
  if (Object.keys(filtros).length > 0) {
    yPos = addFiltros(doc, filtros, yPos);
  }
  
  // Tabela
  const tableData = dados.map(registro => 
    colunas.map(col => col.accessor(registro))
  );
  
  const tableHeaders = colunas.map(col => col.header);
  
  doc.autoTable({
    startY: yPos + 5,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    margin: { top: 10, right: 10, bottom: 10, left: 10 }
  });
  
  // Footer
  addFooter(doc);
  
  // Salvar
  const nomeArquivo = `${titulo.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  doc.save(nomeArquivo);
}

/**
 * Adiciona header ao PDF
 * @param {Object} doc - Instância do jsPDF
 * @param {string} titulo - Título do relatório
 */
function addHeader(doc, titulo) {
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(titulo, 15, 15);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('UNCISAL - Universidade Estadual de Ciências da Saúde de Alagoas', 15, 22);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 28);
  
  // Linha divisória
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 31, 282, 31);
  
  doc.setTextColor(0, 0, 0);
}

/**
 * Adiciona filtros aplicados ao PDF
 * @param {Object} doc - Instância do jsPDF
 * @param {Object} filtros - Filtros aplicados
 * @param {number} yPos - Posição Y inicial
 * @returns {number} Nova posição Y
 */
function addFiltros(doc, filtros, yPos) {
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Filtros aplicados:', 15, yPos);
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  
  let y = yPos + 5;
  for (const [key, value] of Object.entries(filtros)) {
    if (value && value !== '' && value !== 'Todas' && value !== 'Todos') {
      doc.text(`${key}: ${value}`, 15, y);
      y += 4;
    }
  }
  
  return y;
}

/**
 * Adiciona footer ao PDF
 * @param {Object} doc - Instância do jsPDF
 */
function addFooter(doc) {
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
}

/**
 * Exporta dados em CSV
 * @param {string} nomeArquivo - Nome do arquivo
 * @param {Array} dados - Array de dados
 * @param {Array} colunas - Array de objetos {header, accessor}
 */
export function exportarCSV(nomeArquivo, dados, colunas) {
  // Header
  const headers = colunas.map(col => col.header);
  let csv = headers.join(';') + '\n';
  
  // Dados
  dados.forEach(registro => {
    const row = colunas.map(col => {
      const valor = col.accessor(registro);
      // Escapar valores que contenham ; ou "
      return typeof valor === 'string' && (valor.includes(';') || valor.includes('"'))
        ? `"${valor.replace(/"/g, '""')}"`
        : valor;
    });
    csv += row.join(';') + '\n';
  });
  
  // BOM para UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  
  // Download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${nomeArquivo}.csv`;
  link.click();
  
  URL.revokeObjectURL(link.href);
}

