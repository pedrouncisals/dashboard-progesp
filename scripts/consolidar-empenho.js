/**
 * SCRIPT DE CONSOLIDAÇÃO DE EMPENHO
 * Consolida automaticamente todos os arquivos dados_mes_*.json em dados_por_mes.json
 */

const fs = require('fs');
const path = require('path');

const EMPENHO_DIR = path.join(__dirname, '..', 'converted', 'empenho');
const ARQUIVO_CONSOLIDADO = path.join(EMPENHO_DIR, 'dados_por_mes.json');

function consolidarEmpenhos() {
  console.log('🔄 Iniciando consolidação de empenhos...\n');
  
  // Verificar se diretório existe
  if (!fs.existsSync(EMPENHO_DIR)) {
    console.error(`❌ Diretório não encontrado: ${EMPENHO_DIR}`);
    process.exit(1);
  }
  
  // Listar todos os arquivos dados_mes_*.json
  const arquivos = fs.readdirSync(EMPENHO_DIR)
    .filter(arquivo => arquivo.startsWith('dados_mes_') && arquivo.endsWith('.json'))
    .filter(arquivo => arquivo !== 'dados_por_mes.json') // Excluir o consolidado
    .sort(); // Ordenar para garantir ordem correta
  
  if (arquivos.length === 0) {
    console.warn('⚠️ Nenhum arquivo dados_mes_*.json encontrado!');
    process.exit(1);
  }
  
  console.log(`📁 Encontrados ${arquivos.length} arquivos:`);
  arquivos.forEach(arquivo => console.log(`   - ${arquivo}`));
  console.log('');
  
  // Objeto consolidado
  const consolidado = {};
  let totalRegistros = 0;
  
  // Processar cada arquivo
  arquivos.forEach(arquivo => {
    const caminhoArquivo = path.join(EMPENHO_DIR, arquivo);
    
    try {
      const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
      const dados = JSON.parse(conteudo);
      
      // Extrair número do mês do nome do arquivo (ex: dados_mes_11.json -> mes_11)
      const match = arquivo.match(/dados_mes_(\d+)\.json/);
      if (!match) {
        console.warn(`⚠️ Formato de nome inválido: ${arquivo} (esperado: dados_mes_XX.json)`);
        return;
      }
      
      const mesKey = `mes_${match[1].padStart(2, '0')}`;
      
      // Se dados é um array, usar diretamente
      if (Array.isArray(dados)) {
        consolidado[mesKey] = dados;
        totalRegistros += dados.length;
        console.log(`✅ ${arquivo} → ${mesKey}: ${dados.length} registros`);
      } 
      // Se dados é um objeto com a estrutura esperada
      else if (dados[mesKey] && Array.isArray(dados[mesKey])) {
        consolidado[mesKey] = dados[mesKey];
        totalRegistros += dados[mesKey].length;
        console.log(`✅ ${arquivo} → ${mesKey}: ${dados[mesKey].length} registros`);
      }
      // Se dados já está no formato consolidado (objeto com múltiplas chaves mes_XX)
      else if (typeof dados === 'object') {
        Object.keys(dados).forEach(key => {
          if (key.startsWith('mes_') && Array.isArray(dados[key])) {
            consolidado[key] = dados[key];
            totalRegistros += dados[key].length;
            console.log(`✅ ${arquivo} → ${key}: ${dados[key].length} registros`);
          }
        });
      }
      else {
        console.warn(`⚠️ Formato inválido em ${arquivo}: esperado array ou objeto`);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${arquivo}:`, error.message);
    }
  });
  
  // Ordenar chaves (mes_01, mes_02, ..., mes_12)
  const chavesOrdenadas = Object.keys(consolidado).sort((a, b) => {
    const numA = parseInt(a.replace('mes_', ''));
    const numB = parseInt(b.replace('mes_', ''));
    return numA - numB;
  });
  
  const consolidadoOrdenado = {};
  chavesOrdenadas.forEach(chave => {
    consolidadoOrdenado[chave] = consolidado[chave];
  });
  
  // Salvar arquivo consolidado
  try {
    fs.writeFileSync(
      ARQUIVO_CONSOLIDADO,
      JSON.stringify(consolidadoOrdenado, null, 2),
      'utf8'
    );
    
    console.log('\n✅ Consolidação concluída!');
    console.log(`📊 Total de meses: ${chavesOrdenadas.length}`);
    console.log(`📊 Total de registros: ${totalRegistros.toLocaleString('pt-BR')}`);
    console.log(`📄 Arquivo salvo em: ${ARQUIVO_CONSOLIDADO}`);
    console.log('\n🎉 Pronto! O dashboard agora incluirá todos os meses consolidados.');
    
  } catch (error) {
    console.error(`❌ Erro ao salvar arquivo consolidado:`, error.message);
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  consolidarEmpenhos();
}

module.exports = { consolidarEmpenhos };

