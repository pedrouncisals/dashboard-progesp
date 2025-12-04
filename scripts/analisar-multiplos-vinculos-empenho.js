/**
 * ANALISA PESSOAS COM MÚLTIPLOS VÍNCULOS NO MÊS 10
 */

const fs = require('fs');
const path = require('path');

const ARQUIVO = path.join(__dirname, '..', 'converted', 'empenho', 'dados_mes_10.json');

function analisarMultiplosVinculos() {
  console.log('🔍 Analisando múltiplos vínculos no mês 10...\n');
  
  if (!fs.existsSync(ARQUIVO)) {
    console.error(`❌ Arquivo não encontrado: ${ARQUIVO}`);
    process.exit(1);
  }
  
  const dados = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
  
  // Mapear CPF -> { nome, matriculas: Set }
  const pessoasPorCPF = new Map();
  
  // Função para normalizar CPF (remover pontos e traços)
  const normalizarCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/[^\d]/g, '').trim();
  };
  
  dados.forEach(reg => {
    const cpfBruto = reg.cpf && reg.cpf.trim() !== '' ? reg.cpf.trim() : null;
    if (!cpfBruto) return;
    
    // Normalizar CPF para garantir comparação correta mesmo com formatos diferentes
    const cpf = normalizarCPF(cpfBruto);
    if (!cpf || cpf.length !== 11) return; // CPF inválido
    
    const nome = reg.nome || 'Sem nome';
    const matricula = reg.matricula && reg.matricula.trim() !== '' ? reg.matricula.trim() : null;
    
    if (!pessoasPorCPF.has(cpf)) {
      pessoasPorCPF.set(cpf, {
        nome: nome,
        matriculas: new Set(),
        registros: []
      });
    }
    
    const pessoa = pessoasPorCPF.get(cpf);
    if (matricula) {
      pessoa.matriculas.add(matricula);
    }
    pessoa.registros.push({
      matricula: matricula,
      cargo: reg.cargo,
      lotacao: reg.lotacao,
      salario: reg.salario,
      nomeOriginal: nome // Guardar nome original para mostrar diferenças
    });
  });
  
  // Encontrar pessoas com múltiplas matrículas
  const pessoasComMultiplosVinculos = [];
  
  pessoasPorCPF.forEach((dados, cpf) => {
    if (dados.matriculas.size > 1) {
      pessoasComMultiplosVinculos.push({
        cpf: cpf,
        nome: dados.nome,
        totalMatriculas: dados.matriculas.size,
        matriculas: Array.from(dados.matriculas),
        registros: dados.registros
      });
    }
  });
  
  // Estatísticas
  const totalPessoas = pessoasPorCPF.size;
  const totalMatriculas = new Set();
  dados.forEach(reg => {
    if (reg.matricula && reg.matricula.trim() !== '') {
      totalMatriculas.add(reg.matricula.trim());
    }
  });
  
  console.log('📊 ESTATÍSTICAS DO MÊS 10:');
  console.log(`   Total de Pessoas (por CPF): ${totalPessoas}`);
  console.log(`   Total de Matrículas: ${totalMatriculas.size}`);
  console.log(`   Diferença: ${totalMatriculas.size - totalPessoas} pessoas com múltiplos vínculos\n`);
  
  console.log(`👥 PESSOAS COM MÚLTIPLOS VÍNCULOS (${pessoasComMultiplosVinculos.length}):\n`);
  
  pessoasComMultiplosVinculos
    .sort((a, b) => b.totalMatriculas - a.totalMatriculas)
    .forEach((pessoa, idx) => {
      console.log(`${idx + 1}. ${pessoa.nome}`);
      console.log(`   CPF: ${pessoa.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}`);
      console.log(`   Matrículas: ${pessoa.matriculas.join(', ')} (${pessoa.totalMatriculas} vínculos)`);
      
      // Verificar se há nomes diferentes nos registros (problema de acentuação)
      const nomesUnicos = new Set(pessoa.registros.map(r => r.nomeOriginal));
      if (nomesUnicos.size > 1) {
        console.log(`   ⚠️ ATENÇÃO: Nomes diferentes encontrados nos registros:`);
        Array.from(nomesUnicos).forEach(nome => console.log(`      - "${nome}"`));
      }
      
      console.log(`   Detalhes:`);
      pessoa.registros.forEach(reg => {
        console.log(`      - Matrícula ${reg.matricula || 'N/A'}: ${reg.cargo || 'N/A'} | ${reg.lotacao || 'N/A'} | R$ ${reg.salario || '0.00'}`);
      });
      console.log('');
    });
  
  if (pessoasComMultiplosVinculos.length === 0) {
    console.log('✅ Nenhuma pessoa com múltiplos vínculos encontrada.');
  } else {
    console.log(`\n✅ Total: ${pessoasComMultiplosVinculos.length} pessoa(s) com múltiplos vínculos`);
    console.log(`   Isso explica a diferença de ${totalMatriculas.size - totalPessoas} entre matrículas e pessoas.`);
  }
}

analisarMultiplosVinculos();

