/**
 * SERVIÇO DE EMPENHO
 * Funções para carregamento e manipulação de dados de empenho
 */

/**
 * Carrega o arquivo consolidado de empenho
 * @returns {Promise<Array>} Array com todos os registros de empenho
 */
export async function carregarTodosEmpenhos() {
  try {
    const response = await fetch('/converted/empenho/dados_por_mes.json');
    if (!response.ok) {
      throw new Error(`Erro ao carregar empenhos: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Converter objeto com meses em array único
    const todosRegistros = [];
    Object.keys(data).forEach(mes => {
      if (Array.isArray(data[mes])) {
        data[mes].forEach(reg => {
          // Normalizar estrutura para compatibilidade com o dashboard
          const registroNormalizado = {
            nome: reg.nome || '',
            cpf: reg.cpf || '',
            matricula: reg.matricula || '',
            situacao: reg.situacao || 'ATIVO',
            motivo_afastamento: '',
            vinculo: reg.vinculo || 'EMPENHO',
            nivel: '',
            lotacao_original: reg.lotacao || '',
            lotacao_normalizada: reg.lotacao || '',
            funcao: reg.cargo || '',
            vantagem: parseFloat(reg.salario) || 0,
            desconto: 0,
            liquido: parseFloat(reg.salario) || 0,
            // Campos específicos de empenho
            carga_horaria: reg.carga_horaria || '',
            admissao: reg.admissao || '',
            area: reg.area || '',
            mes_referencia: reg.mes_referencia || null,
            competencia: reg.mes_referencia ? `2025-${String(reg.mes_referencia).padStart(2, '0')}` : null
          };
          todosRegistros.push(registroNormalizado);
        });
      }
    });
    
    console.log(`✅ ${todosRegistros.length} registros de empenho carregados`);
    return todosRegistros;
  } catch (error) {
    console.error('Erro ao carregar empenhos:', error);
    throw error;
  }
}

/**
 * Aplica filtros aos dados de empenho
 * @param {Array} dados - Array de registros
 * @param {Object} filtros - Objeto com filtros
 * @returns {Array} Dados filtrados
 */
export function filtrarEmpenho(dados, filtros) {
  let resultado = [...dados];
  
  // Filtro por ano
  if (filtros.ano && filtros.ano.trim() !== '') {
    resultado = resultado.filter(r => {
      if (!r.competencia) return false;
      const anoRegistro = r.competencia.split('-')[0];
      return anoRegistro === filtros.ano.trim();
    });
  }
  
  // Filtro por competência
  if (filtros.competencia) {
    resultado = resultado.filter(r => r.competencia === filtros.competencia);
  }
  
  // Filtro por lotação
  if (filtros.lotacao) {
    resultado = resultado.filter(r => {
      const lotacao = r.lotacao_normalizada || r.lotacao_original || '';
      return lotacao === filtros.lotacao;
    });
  }
  
  // Filtro por função/cargo
  if (filtros.funcao) {
    resultado = resultado.filter(r => r.funcao === filtros.funcao);
  }
  
  // Filtro por vínculo
  if (filtros.vinculo) {
    resultado = resultado.filter(r => r.vinculo === filtros.vinculo);
  }
  
  // Filtro por situação
  if (filtros.situacao) {
    const situacaoFiltro = filtros.situacao.trim().toUpperCase();
    resultado = resultado.filter(r => {
      const situacaoRegistro = (r.situacao && r.situacao.trim() !== '') 
        ? r.situacao.trim().toUpperCase() 
        : 'NÃO INFORMADO';
      return situacaoRegistro === situacaoFiltro;
    });
  }
  
  // Filtro por área
  if (filtros.area) {
    resultado = resultado.filter(r => r.area === filtros.area);
  }
  
  // Busca por nome
  if (filtros.buscaNome) {
    const busca = filtros.buscaNome.toLowerCase();
    resultado = resultado.filter(r => 
      r.nome.toLowerCase().includes(busca)
    );
  }
  
  // Filtro por múltiplos vínculos - mostrar apenas pessoas com mais de 1 vínculo
  if (filtros.multiplosVinculos) {
    // Agrupar por CPF (ou nome se não tiver CPF) e contar vínculos únicos
    const pessoasPorCpf = new Map();
    
    resultado.forEach(reg => {
      const chave = reg.cpf && reg.cpf.trim() !== '' 
        ? reg.cpf.trim() 
        : (reg.nome && reg.nome.trim() !== '' ? reg.nome.trim() : null);
      
      if (!chave) return;
      
      if (!pessoasPorCpf.has(chave)) {
        pessoasPorCpf.set(chave, {
          nome: reg.nome,
          cpf: reg.cpf,
          vinculos: new Set()
        });
      }
      
      // Adicionar vínculo único (matrícula + vínculo)
      const vinculoUnico = `${reg.matricula || ''}_${reg.vinculo || ''}`;
      pessoasPorCpf.get(chave).vinculos.add(vinculoUnico);
    });
    
    // Filtrar apenas pessoas com mais de 1 vínculo
    const cpfsComMultiplosVinculos = new Set();
    pessoasPorCpf.forEach((info, cpf) => {
      if (info.vinculos.size > 1) {
        cpfsComMultiplosVinculos.add(cpf);
      }
    });
    
    resultado = resultado.filter(r => {
      const chave = r.cpf && r.cpf.trim() !== '' 
        ? r.cpf.trim() 
        : (r.nome && r.nome.trim() !== '' ? r.nome.trim() : null);
      return chave && cpfsComMultiplosVinculos.has(chave);
    });
  }
  
  return resultado;
}

/**
 * Agrupa dados por competência (mês/ano)
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com competências como chaves
 */
export function agregarPorCompetencia(dados) {
  // Função auxiliar para normalizar CPF
  const normalizarCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/[^\d]/g, '').trim();
  };
  
  return dados.reduce((acc, registro) => {
    if (!registro || typeof registro !== 'object') {
      return acc;
    }
    
    const liquido = isNaN(Number(registro.liquido)) ? 0 : Number(registro.liquido);
    const MAX_VALOR = 10000000;
    if (liquido > MAX_VALOR) {
      return acc;
    }
    
    const comp = registro.competencia || 'NÃO INFORMADO';
    if (!acc[comp]) {
      acc[comp] = {
        competencia: comp,
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0,
        funcionariosUnicos: new Set(),
        funcionarios: []
      };
    }
    
    acc[comp].liquido += liquido;
    acc[comp].vantagem += registro.vantagem || 0;
    acc[comp].desconto += registro.desconto || 0;
    acc[comp].count += 1;
    
    if (registro.cpf && registro.cpf.trim() !== '') {
      const cpfNormalizado = normalizarCPF(registro.cpf);
      if (cpfNormalizado && cpfNormalizado.length === 11) {
        acc[comp].funcionariosUnicos.add(cpfNormalizado);
      } else if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
        acc[comp].funcionariosUnicos.add(registro.nome.trim());
      }
    } else if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
      acc[comp].funcionariosUnicos.add(registro.nome.trim());
    }
    
    if (registro.nome && registro.nome !== '*Totais*') {
      acc[comp].funcionarios.push(registro.nome);
    }
    
    return acc;
  }, {});
}

/**
 * Agrupa dados por lotação
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com lotações como chaves
 */
export function agregarPorLotacao(dados) {
  // Função auxiliar para normalizar CPF
  const normalizarCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/[^\d]/g, '').trim();
  };
  
  return dados.reduce((acc, registro) => {
    if (!registro || typeof registro !== 'object') {
      return acc;
    }
    
    const liquido = isNaN(Number(registro.liquido)) ? 0 : Number(registro.liquido);
    const MAX_VALOR = 10000000;
    if (liquido > MAX_VALOR) {
      return acc;
    }
    
    const lotacao = registro.lotacao_normalizada || registro.lotacao_original || 'SEM LOTAÇÃO';
    
    if (!acc[lotacao]) {
      acc[lotacao] = {
        lotacao: lotacao,
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0,
        funcionariosUnicos: new Set(),
        funcionarios: []
      };
    }
    
    acc[lotacao].liquido += liquido;
    acc[lotacao].vantagem += registro.vantagem || 0;
    acc[lotacao].desconto += registro.desconto || 0;
    acc[lotacao].count += 1;
    
    if (registro.cpf && registro.cpf.trim() !== '') {
      const cpfNormalizado = normalizarCPF(registro.cpf);
      if (cpfNormalizado && cpfNormalizado.length === 11) {
        acc[lotacao].funcionariosUnicos.add(cpfNormalizado);
      } else if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
        acc[lotacao].funcionariosUnicos.add(registro.nome.trim());
      }
    } else if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
      acc[lotacao].funcionariosUnicos.add(registro.nome.trim());
    }
    
    if (registro.nome && registro.nome !== '*Totais*') {
      acc[lotacao].funcionarios.push(registro.nome);
    }
    
    return acc;
  }, {});
}

/**
 * Agrupa dados por vínculo
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com vínculos como chaves
 */
export function agregarPorVinculo(dados) {
  // Função auxiliar para normalizar CPF
  const normalizarCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/[^\d]/g, '').trim();
  };
  
  return dados.reduce((acc, registro) => {
    if (!registro || typeof registro !== 'object') {
      return acc;
    }
    
    const liquido = isNaN(Number(registro.liquido)) ? 0 : Number(registro.liquido);
    const MAX_VALOR = 10000000;
    if (liquido > MAX_VALOR) {
      return acc;
    }
    
    const vinculo = (registro.vinculo && registro.vinculo.trim() !== '') 
      ? registro.vinculo.trim() 
      : 'NÃO INFORMADO';
    
    if (!acc[vinculo]) {
      acc[vinculo] = {
        vinculo: vinculo,
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0,
        funcionariosUnicos: new Set(),
        funcionarios: []
      };
    }
    
    acc[vinculo].liquido += liquido;
    acc[vinculo].vantagem += registro.vantagem || 0;
    acc[vinculo].desconto += registro.desconto || 0;
    acc[vinculo].count += 1;
    
    if (registro.cpf && registro.cpf.trim() !== '') {
      const cpfNormalizado = normalizarCPF(registro.cpf);
      if (cpfNormalizado && cpfNormalizado.length === 11) {
        acc[vinculo].funcionariosUnicos.add(cpfNormalizado);
      } else if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
        acc[vinculo].funcionariosUnicos.add(registro.nome.trim());
      }
    } else if (registro.nome && registro.nome.trim() !== '' && registro.nome !== '*Totais*') {
      acc[vinculo].funcionariosUnicos.add(registro.nome.trim());
    }
    
    if (registro.nome) {
      acc[vinculo].funcionarios.push(registro.nome);
    }
    
    return acc;
  }, {});
}

/**
 * Calcula estatísticas gerais dos dados
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com estatísticas
 */
export function calcularEstatisticas(dados) {
  if (!dados || dados.length === 0) {
    return {
      totalFuncionarios: 0,
      totalVinculos: 0,
      totalRegistros: 0,
      totalLiquido: 0,
      totalVantagem: 0,
      totalDesconto: 0,
      mediaLiquido: 0,
      medianaLiquido: 0,
      maiorLiquido: 0,
      menorLiquido: 0
    };
  }
  
  const funcionariosUnicos = new Set();
  const vinculosUnicos = new Set();
  
  // Função auxiliar para normalizar CPF
  const normalizarCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/[^\d]/g, '').trim();
  };
  
  dados.forEach(r => {
    if (r.nome && (r.nome.includes('*Totais*') || r.nome.includes('TOTAL'))) {
      return;
    }
    
    if (r.cpf && r.cpf.trim() !== '') {
      // Normalizar CPF para garantir comparação correta
      const cpfNormalizado = normalizarCPF(r.cpf);
      if (cpfNormalizado && cpfNormalizado.length === 11) {
        funcionariosUnicos.add(cpfNormalizado);
      } else if (r.nome && r.nome.trim() !== '' && r.nome !== '*Totais*') {
        // Fallback: usar nome se CPF inválido
        funcionariosUnicos.add(r.nome.trim());
      }
    } else if (r.nome && r.nome.trim() !== '' && r.nome !== '*Totais*') {
      funcionariosUnicos.add(r.nome.trim());
    }
    
    if (r.matricula && r.matricula.trim() !== '') {
      vinculosUnicos.add(r.matricula.trim());
    }
  });
  
  const totalFuncionarios = funcionariosUnicos.size;
  const totalVinculos = vinculosUnicos.size;
  const totalRegistros = dados.length;
  
  const MAX_VALOR = 10000000;
  const totalLiquido = dados.reduce((sum, r) => {
    const valor = Number(r.liquido) || 0;
    if (valor > MAX_VALOR) {
      return sum;
    }
    return sum + valor;
  }, 0);
  
  const totalVantagem = dados.reduce((sum, r) => {
    const valor = Number(r.vantagem) || 0;
    if (valor > MAX_VALOR) {
      return sum;
    }
    return sum + valor;
  }, 0);
  
  const totalDesconto = dados.reduce((sum, r) => {
    const valor = Number(r.desconto) || 0;
    if (valor > MAX_VALOR) {
      return sum;
    }
    return sum + valor;
  }, 0);
  
  const mediaLiquido = totalRegistros > 0 ? totalLiquido / totalRegistros : 0;
  
  const liquidosValidos = dados
    .map(r => Number(r.liquido) || 0)
    .filter(v => v > 0 && v <= MAX_VALOR);
  
  if (liquidosValidos.length === 0) {
    return {
      totalFuncionarios,
      totalVinculos,
      totalRegistros,
      totalLiquido,
      totalVantagem,
      totalDesconto,
      mediaLiquido,
      medianaLiquido: 0,
      maiorLiquido: 0,
      menorLiquido: 0
    };
  }
  
  const liquidosOrdenados = liquidosValidos.sort((a, b) => a - b);
  const meio = Math.floor(liquidosOrdenados.length / 2);
  const medianaLiquido = liquidosOrdenados.length % 2 === 0
    ? (liquidosOrdenados[meio - 1] + liquidosOrdenados[meio]) / 2
    : liquidosOrdenados[meio];
  
  const maiorLiquido = liquidosOrdenados[liquidosOrdenados.length - 1];
  const menorLiquido = liquidosOrdenados[0];
  
  return {
    totalFuncionarios,
    totalVinculos,
    totalRegistros,
    totalLiquido,
    totalVantagem,
    totalDesconto,
    mediaLiquido,
    medianaLiquido,
    maiorLiquido,
    menorLiquido
  };
}

/**
 * Retorna top N registros por campo
 * @param {Array} dados - Array de registros
 * @param {string} campo - Campo para ordenar
 * @param {number} n - Quantidade de registros
 * @returns {Array} Top N registros
 */
export function topN(dados, campo, n = 10) {
  if (!dados || dados.length === 0) {
    return [];
  }
  
  const registrosIndividuais = dados.filter(r => 
    r && 
    typeof r === 'object' && 
    r.nome && 
    typeof r.nome === 'string' && 
    r.nome.trim() !== '' &&
    r.nome !== '*Totais*' &&
    !isNaN(Number(r[campo]))
  );
  
  return [...registrosIndividuais]
    .sort((a, b) => {
      const valorA = Number(a[campo]) || 0;
      const valorB = Number(b[campo]) || 0;
      return valorB - valorA;
    })
    .slice(0, n)
    .map(r => ({
      nome: r.nome || 'N/A',
      cpf: r.cpf || '',
      lotacao_normalizada: r.lotacao_normalizada || r.lotacao_original || 'N/A',
      vinculo: r.vinculo || '',
      funcao: r.funcao || '',
      situacao: r.situacao || '',
      [campo]: Number(r[campo]) || 0
    }));
}

/**
 * Extrai valores únicos de um campo
 * @param {Array} dados - Array de registros
 * @param {string} campo - Nome do campo
 * @returns {Array} Array com valores únicos ordenados
 */
export function valoresUnicos(dados, campo) {
  const valores = dados.map(r => r[campo]).filter(v => v != null && v !== undefined && v !== '');
  return [...new Set(valores)].sort();
}

