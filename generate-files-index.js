/**
 * Script para gerar o arquivo files.json com a lista de todos os arquivos JSON
 * na pasta converted/. Deve ser executado sempre que novos arquivos forem adicionados.
 */

const fs = require('fs');
const path = require('path');

const convertedDir = path.join(__dirname, 'converted');
const outputFile = path.join(convertedDir, 'files.json');

try {
  // Verificar se diretório existe
  if (!fs.existsSync(convertedDir)) {
    console.error('❌ Diretório converted/ não encontrado');
    process.exit(1);
  }

  // Ler todos os arquivos JSON (exceto files.json e dashboard_data_summary.json)
  const files = fs.readdirSync(convertedDir)
    .filter(file => file.endsWith('.json'))
    .filter(file => file !== 'files.json' && file !== 'dashboard_data_summary.json')
    .filter(file => file.match(/^\d{4}-\d{2}_/)) // Formato: YYYY-MM_*.json
    .sort(); // Ordenar alfabeticamente (já ordena por data)

  // Salvar no arquivo files.json
  fs.writeFileSync(outputFile, JSON.stringify(files, null, 2), 'utf8');

  console.log(`✅ Arquivo files.json gerado com sucesso!`);
  console.log(`📁 ${files.length} arquivos JSON encontrados:`);
  files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
} catch (error) {
  console.error('❌ Erro ao gerar arquivo files.json:', error);
  process.exit(1);
}

