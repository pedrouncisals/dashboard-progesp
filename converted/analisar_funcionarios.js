// Script para analisar funcionários únicos por CPF vs Matrícula
// Salve como analisar_funcionarios.js e execute: node analisar_funcionarios.js

const fs = require('fs');
const path = require('path');

const arquivo = path.join(__dirname, '2025-10_10 RELATORIO GERENCIAL OUTUBRO.2025.json');

console.log('📊 Analisando arquivo:', arquivo);
console.log('⏳ Carregando dados...\n');

const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
const registros = dados.registros || [];

console.log(`Total de registros no arquivo: ${registros.length}`);

// Conjuntos para contagem única
const cpfsUnicos = new Set();
const matriculasUnicas = new Set();
const nomesUnicos = new Set();

// Mapeamentos para análise de diferenças
const cpfParaMatriculas = new Map(); // CPF -> Set de matrículas
const matriculaParaCpfs = new Map(); // Matrícula -> Set de CPFs
const cpfParaNomes = new Map(); // CPF -> Set de nomes
const matriculaParaNomes = new Map(); // Matrícula -> Set de nomes

// Contadores auxiliares
let registrosComCpf = 0;
let registrosComMatricula = 0;
let registrosSemCpf = 0;
let registrosSemMatricula = 0;
let registrosTotais = 0;

// Processar cada registro
registros.forEach((reg, index) => {
  // Ignorar registro de totais
  if (reg.nome === '*Totais*') {
    registrosTotais++;
    return;
  }

  const cpf = reg.cpf ? reg.cpf.trim() : '';
  const matricula = reg.matricula ? reg.matricula.trim() : '';
  const nome = reg.nome ? reg.nome.trim() : '';

  // Contar registros com/sem CPF e matrícula
  if (cpf) {
    registrosComCpf++;
    cpfsUnicos.add(cpf);
    
    // Mapear CPF -> matrícula
    if (!cpfParaMatriculas.has(cpf)) {
      cpfParaMatriculas.set(cpf, new Set());
    }
    if (matricula) {
      cpfParaMatriculas.get(cpf).add(matricula);
    }
    
    // Mapear CPF -> nome
    if (!cpfParaNomes.has(cpf)) {
      cpfParaNomes.set(cpf, new Set());
    }
    if (nome) {
      cpfParaNomes.get(cpf).add(nome);
    }
  } else {
    registrosSemCpf++;
  }

  if (matricula) {
    registrosComMatricula++;
    matriculasUnicas.add(matricula);
    
    // Mapear matrícula -> CPF
    if (!matriculaParaCpfs.has(matricula)) {
      matriculaParaCpfs.set(matricula, new Set());
    }
    if (cpf) {
      matriculaParaCpfs.get(matricula).add(cpf);
    }
    
    // Mapear matrícula -> nome
    if (!matriculaParaNomes.has(matricula)) {
      matriculaParaNomes.set(matricula, new Set());
    }
    if (nome) {
      matriculaParaNomes.get(matricula).add(nome);
    }
  } else {
    registrosSemMatricula++;
  }

  if (nome && nome !== '*Totais*') {
    nomesUnicos.add(nome);
  }
});

// Análise de diferenças
const cpfsComMultiplasMatriculas = [];
const matriculasComMultiplosCpfs = [];
const cpfsComMultiplosNomes = [];
const matriculasComMultiplosNomes = [];

cpfParaMatriculas.forEach((matriculas, cpf) => {
  if (matriculas.size > 1) {
    cpfsComMultiplasMatriculas.push({
      cpf,
      matriculas: Array.from(matriculas),
      nomes: Array.from(cpfParaNomes.get(cpf) || [])
    });
  }
});

matriculaParaCpfs.forEach((cpfs, matricula) => {
  if (cpfs.size > 1) {
    matriculasComMultiplosCpfs.push({
      matricula,
      cpfs: Array.from(cpfs),
      nomes: Array.from(matriculaParaNomes.get(matricula) || [])
    });
  }
});

cpfParaNomes.forEach((nomes, cpf) => {
  if (nomes.size > 1) {
    cpfsComMultiplosNomes.push({
      cpf,
      nomes: Array.from(nomes),
      matriculas: Array.from(cpfParaMatriculas.get(cpf) || [])
    });
  }
});

matriculaParaNomes.forEach((nomes, matricula) => {
  if (nomes.size > 1) {
    matriculasComMultiplosNomes.push({
      matricula,
      nomes: Array.from(nomes),
      cpfs: Array.from(matriculaParaCpfs.get(matricula) || [])
    });
  }
});

// Resultados
console.log('═══════════════════════════════════════════════════════════');
console.log('📈 RESULTADOS DA ANÁLISE - MÊS 10 (OUTUBRO/2025)');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📋 CONTAGEM DE REGISTROS:');
console.log(`   Total de registros: ${registros.length}`);
console.log(`   Registros de totais ignorados: ${registrosTotais}`);
console.log(`   Registros válidos analisados: ${registros.length - registrosTotais}\n`);

console.log('👥 CONTAGEM DE FUNCIONÁRIOS ÚNICOS:');
console.log(`   Por CPF: ${cpfsUnicos.size}`);
console.log(`   Por Matrícula: ${matriculasUnicas.size}`);
console.log(`   Por Nome: ${nomesUnicos.size}`);
console.log(`   Diferença (CPF - Matrícula): ${cpfsUnicos.size - matriculasUnicas.size}\n`);

console.log('📊 DETALHAMENTO:');
console.log(`   Registros com CPF: ${registrosComCpf}`);
console.log(`   Registros sem CPF: ${registrosSemCpf}`);
console.log(`   Registros com Matrícula: ${registrosComMatricula}`);
console.log(`   Registros sem Matrícula: ${registrosSemMatricula}\n`);

console.log('⚠️  INCONSISTÊNCIAS ENCONTRADAS:');
console.log(`   CPFs com múltiplas matrículas: ${cpfsComMultiplasMatriculas.length}`);
console.log(`   Matrículas com múltiplos CPFs: ${matriculasComMultiplosCpfs.length}`);
console.log(`   CPFs com múltiplos nomes: ${cpfsComMultiplosNomes.length}`);
console.log(`   Matrículas com múltiplos nomes: ${matriculasComMultiplosNomes.length}\n`);

// Mostrar exemplos de inconsistências
if (cpfsComMultiplasMatriculas.length > 0) {
  console.log('🔍 EXEMPLOS - CPFs com múltiplas matrículas:');
  cpfsComMultiplasMatriculas.slice(0, 5).forEach(item => {
    console.log(`   CPF ${item.cpf}: ${item.matriculas.length} matrículas (${item.matriculas.join(', ')})`);
    console.log(`      Nomes: ${item.nomes.join(', ')}`);
  });
  console.log('');
}

if (matriculasComMultiplosCpfs.length > 0) {
  console.log('🔍 EXEMPLOS - Matrículas com múltiplos CPFs:');
  matriculasComMultiplosCpfs.slice(0, 5).forEach(item => {
    console.log(`   Matrícula ${item.matricula}: ${item.cpfs.length} CPFs (${item.cpfs.join(', ')})`);
    console.log(`      Nomes: ${item.nomes.join(', ')}`);
  });
  console.log('');
}

console.log('═══════════════════════════════════════════════════════════');
console.log('💡 CONCLUSÃO:');
if (cpfsUnicos.size === matriculasUnicas.size) {
  console.log('   ✅ O número de funcionários únicos é IGUAL por CPF e Matrícula');
} else if (cpfsUnicos.size > matriculasUnicas.size) {
  console.log(`   ⚠️  Há ${cpfsUnicos.size - matriculasUnicas.size} funcionários a mais contados por CPF`);
  console.log('   Possíveis causas: múltiplas matrículas para o mesmo CPF ou registros sem matrícula');
} else {
  const diferenca = matriculasUnicas.size - cpfsUnicos.size;
  console.log(`   ⚠️  Há ${diferenca} funcionários a mais contados por Matrícula`);
  console.log(`   📌 Explicação: ${cpfsComMultiplasMatriculas.length} CPFs possuem múltiplas matrículas`);
  console.log('   Isso ocorre quando um funcionário tem múltiplos vínculos/cargos simultâneos');
  console.log('   → Contagem por CPF: 1 pessoa = 1 funcionário (mais preciso)');
  console.log('   → Contagem por Matrícula: 1 matrícula = 1 funcionário (pode duplicar)');
}
console.log('\n📌 RECOMENDAÇÃO:');
console.log('   Use CPF para contagem de funcionários únicos (mais preciso)');
console.log('   Matrícula pode ser útil para contar vínculos/cargos ativos');
console.log('═══════════════════════════════════════════════════════════');