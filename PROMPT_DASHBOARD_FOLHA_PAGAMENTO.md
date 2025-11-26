# 🎯 Prompt Completo: Dashboard de Relatórios de Folha de Pagamento

## 📋 Contexto e Objetivo

Criar um dashboard completo com **10 relatórios de folha de pagamento** usando **exatamente o mesmo design system e padrões visuais** do projeto SUMOF (Supervisão de Movimentação Funcional - UNCISAL). O dashboard será alimentado por arquivos JSON estruturados localizados na pasta `converted/`.

---

## 📊 Estrutura de Dados (JSON)

### Formato dos Arquivos

Cada arquivo na pasta `converted/` segue o padrão de nomenclatura:
```
YYYY-MM_Nome do Relatório.json
```

**Exemplo:** `2025-04_4 RELATORIO GERENCIAL ABRIL.2025.json`

### Estrutura Completa do JSON

```json
{
  "competencia": "2025-04",
  "registros": [
    {
      "nome": "João Silva",
      "cpf": "12345678901",
      "situacao": "ATIVO",
      "motivo_afastamento": "",
      "vinculo": "ESTATUTARIO CIVIL",
      "matricula": "12345",
      "nivel": "Nível 1",
      "lotacao_original": "HOSPITAL ESCOLA - SETOR DE TI",
      "lotacao_normalizada": "HOSPITAL ESCOLA",
      "funcao": "DESENVOLVEDOR",
      "vantagem": 5000.00,
      "desconto": 800.00,
      "liquido": 4200.00,
      "erros": []
    }
  ]
}
```

### Descrição Detalhada dos Campos

#### 📅 Metadados Temporais
- **`competencia`** (string): Formato `YYYY-MM` (ex: "2025-04")
  - **Uso:** Filtros temporais, agregações mensais, comparações entre períodos
  - **Exemplo:** "2025-04" = Abril de 2025

#### 👤 Dados do Funcionário
- **`nome`** (string): Nome completo do funcionário
- **`cpf`** (string): CPF apenas com dígitos (11 caracteres)
- **`matricula`** (string): Matrícula do servidor
- **`situacao`** (string): Status atual
  - Valores comuns: "ATIVO", "AFASTADO"
- **`motivo_afastamento`** (string): Motivo do afastamento (se aplicável)
- **`vinculo`** (string): Tipo de vínculo normalizado
  - Exemplos: "ESTATUTARIO CIVIL", "CONTR TEMPORARIO – PSS"
- **`nivel`** (string): Nível funcional do servidor
- **`funcao`** (string): Função/cargo do funcionário

#### 🏢 Dados de Lotação
- **`lotacao_original`** (string): Texto completo extraído do CSV original
  - Exemplo: "HOSPITAL ESCOLA - SETOR DE TI - DEPARTAMENTO DE INFORMÁTICA"
- **`lotacao_normalizada`** (string): Versão curta para agrupamento
  - Exemplos: "PORTUGAL RAMALHO", "HELVIO AUTO", "MATERNIDADE", "HOSPITAL ESCOLA"
  - **Uso:** Facilita agregações e filtros por unidade

#### 💰 Dados Financeiros (números decimais)
- **`vantagem`** (number): Total de vantagens/proventos
  - Exemplo: 3241.36
- **`desconto`** (number): Total de descontos
  - Exemplo: 800.00
- **`liquido`** (number): Valor líquido a receber
  - Exemplo: 4200.00
  - **Fórmula:** `liquido = vantagem - desconto`

#### ⚠️ Qualidade de Dados
- **`erros`** (array): Lista de inconsistências detectadas durante a conversão
  - Geralmente vazio `[]`, mas verificar se houver problemas
  - Exemplo: `["Valor monetário inválido na linha 42"]`

---

## 🎨 Design System (Idêntico ao SUMOF)

### Paleta de Cores

```css
/* Cores Principais */
--color-primary: #2563eb;           /* Azul primário */
--color-primary-light: #3b82f6;     /* Azul claro */
--color-primary-dark: #1e40af;      /* Azul escuro */

--color-secondary: #059669;         /* Verde */
--color-secondary-light: #10b981;
--color-secondary-dark: #047857;

--color-accent: #f59e0b;            /* Laranja */
--color-accent-light: #fbbf24;
--color-accent-dark: #d97706;

/* Cores Semânticas */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;
--color-info: #06b6d4;
```

### Variáveis CSS - Light Mode

```css
:root {
  --color-bg-primary: #fafbfc;
  --color-bg-secondary: #f4f5f7;
  --color-bg-tertiary: #eef0f2;
  
  --color-text-primary: #1f2937;
  --color-text-secondary: #4b5563;
  --color-text-tertiary: #6b7280;
  --color-text-inverse: #ffffff;
  
  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;
  --color-border-dark: #d1d5db;
  
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

### Variáveis CSS - Dark Mode

```css
[data-theme="dark"],
.dark-mode {
  --color-bg-primary: #1e293b;
  --color-bg-secondary: #0f172a;
  --color-bg-tertiary: #334155;
  
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #cbd5e1;
  --color-text-tertiary: #94a3b8;
  
  --color-border: #334155;
  --color-border-light: #1e293b;
  --color-border-dark: #475569;
  
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4);
}
```

### Tipografia

```css
--font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

### Componentes Visuais

#### 1. Cards de Métricas (`.metric-card`)

```html
<div class="metric-card">
  <div class="metric-icon text-primary">
    <i class="bi bi-people-fill"></i>
  </div>
  <div class="metric-value" id="total-funcionarios">--</div>
  <div class="metric-label">Total de Funcionários</div>
  <div class="metric-trend">
    <i class="bi bi-arrow-up text-success"></i>
    <span class="text-muted small">Ativos no mês atual</span>
  </div>
</div>
```

**Estilo:**
- Fundo: `var(--color-bg-primary)`
- Borda: `1px solid var(--color-border-light)`
- Border-radius: `var(--radius-lg)`
- Sombra: `var(--shadow-sm)`
- Hover: Borda muda para `var(--color-primary-light)`
- Transição suave: `250ms cubic-bezier(0.4, 0, 0.2, 1)`

#### 2. Cards de Ação/Relatório (`.action-card`)

```html
<a href="#relatorio-vencimentos" class="action-card text-decoration-none">
  <div class="action-icon action-blue">
    <i class="bi bi-calendar-check-fill"></i>
  </div>
  <div class="action-text">
    <strong>Relatório de Vencimentos</strong>
    <span>Lista completa de vencimentos do mês</span>
  </div>
  <div class="action-arrow">
    <i class="bi bi-arrow-right"></i>
  </div>
</a>
```

**Estilo:**
- Fundo: `var(--color-bg-primary)`
- Borda: `2px solid var(--color-border-light)`
- Hover: Borda muda para `var(--color-primary-light)`
- Ícone com gradiente baseado na classe (action-blue, action-green, action-purple)

#### 3. Cards de Gráfico (`.chart-card`)

```html
<div class="card h-100 chart-card">
  <div class="card-header chart-header">
    <h5 class="card-title mb-0">
      <i class="bi bi-pie-chart-fill me-2"></i>Distribuição por Lotação
    </h5>
    <p class="text-muted small mb-0 mt-1">Funcionários por unidade</p>
  </div>
  <div class="card-body chart-container-compact">
    <canvas id="chart-lotacao"></canvas>
  </div>
</div>
```

#### 4. Tabelas

- Striped rows com cores alternadas
- Headers com ordenação (`.sortable`)
- Badges coloridos para status
- Paginação customizada (10 itens por página)
- Responsiva com scroll horizontal em mobile

---

## 📐 Estrutura do Dashboard

### Layout Principal

```
┌─────────────────────────────────────────────────────────┐
│  Header: "Folha de Pagamento - UNCISAL"                 │
│  + Botões: Exportar PDF, Exportar CSV                  │
├─────────────────────────────────────────────────────────┤
│  Grid de Métricas (4 cards em linha)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Total    │ │ Folha    │ │ Vantagens│ │ Descontos│  │
│  │ Funcion. │ │ Mês Atual│ │          │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────┤
│  Filtros (Card com fundo suave)                         │
│  [Competência ▼] [Lotação ▼] [Vínculo ▼] [Situação ▼] │
│  [🔍 Buscar por nome...]                                │
├─────────────────────────────────────────────────────────┤
│  Grid de Cards de Relatórios (10 cards, 2 colunas)      │
│  ┌──────────────┐ ┌──────────────┐                      │
│  │ 📅 Vencimentos│ │ 💰 Descontos │                      │
│  └──────────────┘ └──────────────┘                      │
│  ┌──────────────┐ ┌──────────────┐                      │
│  │ 📈 Vantagens  │ │ 🏢 Lotação   │                      │
│  └──────────────┘ └──────────────┘                      │
│  ... (6 cards restantes)                                │
├─────────────────────────────────────────────────────────┤
│  Gráficos e Visualizações (2 colunas)                   │
│  ┌──────────────────────┐ ┌──────────────────────┐    │
│  │ Distribuição Lotação  │ │ Evolução Mensal      │    │
│  │ (Doughnut Chart)      │ │ (Line Chart)         │    │
│  └──────────────────────┘ └──────────────────────┘    │
│  ┌──────────────────────┐                              │
│  │ Top 10 Maiores Salários│                             │
│  │ (Bar Chart Horizontal) │                              │
│  └──────────────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Os 10 Relatórios Detalhados

### 1. 📅 Relatório de Vencimentos

**Descrição:** Lista completa de funcionários com seus vencimentos (valores líquidos) do mês.

**Dados Utilizados:**
- Soma de `liquido` por `competencia`
- Agrupamento por funcionário

**Filtros Disponíveis:**
- Competência (mês/ano)
- Lotação (`lotacao_normalizada`)
- Vínculo (`vinculo`)
- Situação (`situacao`)

**Visualização:**
- Tabela com colunas: Nome, CPF, Matrícula, Lotação, Vínculo, Vantagem, Desconto, Líquido
- Badges coloridos por situação (ATIVO = verde, AFASTADO = vermelho)
- Ordenação por qualquer coluna
- Paginação (10 itens por página)

**Exportação:**
- PDF: Layout profissional com header SUMOF/UNCISAL
- CSV: Separado por vírgulas, encoding UTF-8

**Gráfico Opcional:**
- Gráfico de barras mostrando distribuição de valores líquidos por faixa

---

### 2. 💰 Relatório de Descontos

**Descrição:** Análise detalhada de todos os descontos aplicados na folha.

**Dados Utilizados:**
- Agregação de `desconto` por funcionário
- Agregação por `lotacao_normalizada`
- Agregação por `vinculo`

**Filtros Disponíveis:**
- Competência
- Lotação
- Vínculo

**Visualização:**
- Gráfico de pizza mostrando proporção de descontos por lotação
- Tabela detalhada: Nome, Lotação, Vínculo, Total de Descontos, % sobre Vantagem
- Top 10 funcionários com maiores descontos

**Exportação:**
- PDF/CSV

**Métricas:**
- Total de descontos
- Média de descontos por funcionário
- % médio de desconto sobre vantagem

---

### 3. 📈 Relatório de Vantagens

**Descrição:** Análise de todas as vantagens/proventos pagos.

**Dados Utilizados:**
- Agregação de `vantagem` por funcionário
- Agregação por `lotacao_normalizada`
- Agregação por `vinculo`

**Filtros Disponíveis:**
- Competência
- Lotação
- Vínculo

**Visualização:**
- Gráfico de barras mostrando vantagens por lotação
- Tabela: Nome, Lotação, Vínculo, Vantagem, Desconto, Líquido
- Top 10 funcionários com maiores vantagens

**Exportação:**
- PDF/CSV

**Métricas:**
- Total de vantagens
- Média de vantagens por funcionário
- Maior e menor vantagem

---

### 4. 🏢 Relatório por Lotação

**Descrição:** Visão consolidada por unidade/lotação.

**Dados Utilizados:**
- Agregação por `lotacao_normalizada`
- Soma de `liquido`, `vantagem`, `desconto`
- Contagem de funcionários

**Filtros Disponíveis:**
- Competência

**Visualização:**
- Gráfico doughnut mostrando distribuição de funcionários por lotação
- Gráfico de barras mostrando valores totais (líquido) por lotação
- Tabela: Lotação, Qtd Funcionários, Total Vantagem, Total Desconto, Total Líquido, Média Líquida

**Exportação:**
- PDF/CSV

**Métricas:**
- Total de lotações
- Lotação com maior folha
- Lotação com mais funcionários

---

### 5. 📋 Relatório por Vínculo

**Descrição:** Comparação entre diferentes tipos de vínculo (Estatutário vs Temporário).

**Dados Utilizados:**
- Agregação por `vinculo`
- Soma de `liquido`, `vantagem`, `desconto`
- Contagem de funcionários

**Filtros Disponíveis:**
- Competência
- Lotação

**Visualização:**
- Gráfico de barras comparando vínculos
- Gráfico doughnut mostrando proporção
- Tabela: Vínculo, Qtd Funcionários, Total Líquido, Média Líquida

**Exportação:**
- PDF/CSV

**Métricas:**
- Total de estatutários
- Total de temporários
- Comparativo de médias

---

### 6. ✅ Relatório de Funcionários Ativos vs Afastados

**Descrição:** Análise da situação dos funcionários (ativos vs afastados).

**Dados Utilizados:**
- Contagem por `situacao`
- Lista de `motivo_afastamento` para afastados

**Filtros Disponíveis:**
- Competência
- Lotação
- Vínculo

**Visualização:**
- Gráfico doughnut: ATIVO vs AFASTADO
- Tabela de afastados: Nome, Lotação, Motivo do Afastamento, Vínculo
- Gráfico de barras mostrando motivos de afastamento

**Exportação:**
- PDF/CSV

**Métricas:**
- Total de ativos
- Total de afastados
- % de afastados sobre total
- Principais motivos de afastamento

---

### 7. 📊 Relatório de Evolução Mensal

**Descrição:** Comparação da folha de pagamento entre diferentes meses.

**Dados Utilizados:**
- Agregação de `liquido`, `vantagem`, `desconto` por `competencia`
- Comparação mês a mês

**Filtros Disponíveis:**
- Período (mês inicial e final)
- Lotação
- Vínculo

**Visualização:**
- Gráfico de linha temporal mostrando evolução de:
  - Total Líquido
  - Total de Vantagens
  - Total de Descontos
  - Quantidade de Funcionários
- Tabela comparativa: Competência, Qtd Funcionários, Total Vantagem, Total Desconto, Total Líquido, Variação %

**Exportação:**
- PDF/CSV

**Métricas:**
- Variação percentual mês a mês
- Tendência (crescimento/decrescimento)
- Maior e menor folha do período

---

### 8. 🏆 Relatório de Top Salários

**Descrição:** Ranking dos maiores salários líquidos.

**Dados Utilizados:**
- Ordenação por `liquido` (maior para menor)

**Filtros Disponíveis:**
- Competência
- Lotação
- Vínculo

**Visualização:**
- Gráfico de barras horizontal (top 10)
- Tabela completa: Posição, Nome, CPF, Lotação, Função, Nível, Vínculo, Líquido
- Opção de ver top 10, top 20, top 50, ou todos

**Exportação:**
- PDF/CSV

**Métricas:**
- Maior salário líquido
- Menor salário líquido
- Mediana
- Média

---

### 9. 👔 Relatório de Funções e Níveis

**Descrição:** Análise por função e nível funcional.

**Dados Utilizados:**
- Agregação por `funcao`
- Agregação por `nivel`
- Agregação combinada (função + nível)

**Filtros Disponíveis:**
- Competência
- Lotação
- Vínculo

**Visualização:**
- Gráfico de barras agrupado: Função x Nível
- Tabela: Função, Nível, Qtd Funcionários, Média Líquida, Total Líquido
- Gráfico doughnut por função

**Exportação:**
- PDF/CSV

**Métricas:**
- Função com mais funcionários
- Função com maior média salarial
- Distribuição por nível

---

### 10. 📑 Relatório Consolidado Geral

**Descrição:** Visão geral completa com todas as métricas e agregações.

**Dados Utilizados:**
- Todas as agregações possíveis
- Comparativos entre períodos

**Filtros Disponíveis:**
- Competência
- Lotação
- Vínculo
- Situação

**Visualização:**
- Múltiplos gráficos:
  - Doughnut: Distribuição por Lotação
  - Doughnut: Distribuição por Vínculo
  - Bar: Top 5 Lotações por Folha
  - Line: Evolução Mensal (se múltiplas competências)
- Tabela resumo com totais e médias
- Cards de métricas principais

**Exportação:**
- PDF/CSV (completo)

**Métricas Principais:**
- Total de funcionários
- Total de folha (líquido)
- Total de vantagens
- Total de descontos
- Média líquida por funcionário
- Distribuição por lotação
- Distribuição por vínculo
- Distribuição por situação

---

## 🔧 Funcionalidades de Agregação

### Agregações Temporais

```javascript
/**
 * Agrupa dados por competência (mês/ano)
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com competências como chaves
 */
function agregarPorCompetencia(dados) {
  return dados.reduce((acc, registro) => {
    const comp = registro.competencia;
    if (!acc[comp]) {
      acc[comp] = {
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0,
        funcionarios: []
      };
    }
    acc[comp].liquido += registro.liquido || 0;
    acc[comp].vantagem += registro.vantagem || 0;
    acc[comp].desconto += registro.desconto || 0;
    acc[comp].count += 1;
    acc[comp].funcionarios.push(registro.nome);
    return acc;
  }, {});
}
```

### Agregações por Lotação

```javascript
/**
 * Agrupa dados por lotação normalizada
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com lotações como chaves
 */
function agregarPorLotacao(dados) {
  return dados.reduce((acc, registro) => {
    const lotacao = registro.lotacao_normalizada || 'SEM LOTAÇÃO';
    if (!acc[lotacao]) {
      acc[lotacao] = {
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0,
        funcionarios: []
      };
    }
    acc[lotacao].liquido += registro.liquido || 0;
    acc[lotacao].vantagem += registro.vantagem || 0;
    acc[lotacao].desconto += registro.desconto || 0;
    acc[lotacao].count += 1;
    acc[lotacao].funcionarios.push(registro.nome);
    return acc;
  }, {});
}
```

### Agregações por Vínculo

```javascript
/**
 * Agrupa dados por tipo de vínculo
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com vínculos como chaves
 */
function agregarPorVinculo(dados) {
  return dados.reduce((acc, registro) => {
    const vinculo = registro.vinculo || 'NÃO INFORMADO';
    if (!acc[vinculo]) {
      acc[vinculo] = {
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0,
        funcionarios: []
      };
    }
    acc[vinculo].liquido += registro.liquido || 0;
    acc[vinculo].vantagem += registro.vantagem || 0;
    acc[vinculo].desconto += registro.desconto || 0;
    acc[vinculo].count += 1;
    acc[vinculo].funcionarios.push(registro.nome);
    return acc;
  }, {});
}
```

### Agregações por Situação

```javascript
/**
 * Agrupa dados por situação (ATIVO/AFASTADO)
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com situações como chaves
 */
function agregarPorSituacao(dados) {
  return dados.reduce((acc, registro) => {
    const situacao = registro.situacao || 'NÃO INFORMADO';
    if (!acc[situacao]) {
      acc[situacao] = {
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0,
        funcionarios: [],
        motivosAfastamento: []
      };
    }
    acc[situacao].liquido += registro.liquido || 0;
    acc[situacao].vantagem += registro.vantagem || 0;
    acc[situacao].desconto += registro.desconto || 0;
    acc[situacao].count += 1;
    acc[situacao].funcionarios.push(registro.nome);
    
    if (registro.motivo_afastamento) {
      acc[situacao].motivosAfastamento.push({
        nome: registro.nome,
        motivo: registro.motivo_afastamento
      });
    }
    
    return acc;
  }, {});
}
```

### Agregações Combinadas

```javascript
/**
 * Agrupa por função e nível
 * @param {Array} dados - Array de registros
 * @returns {Object} Objeto com chave "funcao_nivel"
 */
function agregarPorFuncaoNivel(dados) {
  return dados.reduce((acc, registro) => {
    const funcao = registro.funcao || 'NÃO INFORMADO';
    const nivel = registro.nivel || 'NÃO INFORMADO';
    const chave = `${funcao}_${nivel}`;
    
    if (!acc[chave]) {
      acc[chave] = {
        funcao,
        nivel,
        liquido: 0,
        vantagem: 0,
        desconto: 0,
        count: 0,
        funcionarios: []
      };
    }
    
    acc[chave].liquido += registro.liquido || 0;
    acc[chave].vantagem += registro.vantagem || 0;
    acc[chave].desconto += registro.desconto || 0;
    acc[chave].count += 1;
    acc[chave].funcionarios.push(registro.nome);
    
    return acc;
  }, {});
}
```

---

## 📂 Carregamento de Dados

### Estratégia 1: Carregar Arquivo Único

```javascript
/**
 * Carrega um arquivo JSON específico
 * @param {string} arquivo - Nome do arquivo (ex: "2025-04_4 RELATORIO GERENCIAL ABRIL.2025.json")
 * @returns {Promise<Object>} Dados do arquivo
 */
async function carregarFolha(arquivo) {
  try {
    const response = await fetch(`/converted/${arquivo}`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar arquivo: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao carregar folha:', error);
    throw error;
  }
}
```

### Estratégia 2: Combinar Múltiplos Arquivos

```javascript
/**
 * Carrega e combina todos os arquivos JSON disponíveis
 * @returns {Promise<Array>} Array único com todos os registros
 */
async function carregarTodasFolhas() {
  try {
    // Listar todos os arquivos JSON em /converted/
    const arquivos = await listarArquivosJSON();
    const todasFolhas = [];
    
    for (const arquivo of arquivos) {
      const data = await carregarFolha(arquivo);
      
      // Adicionar competencia a cada registro para facilitar filtros
      data.registros.forEach(reg => {
        reg.competencia = data.competencia;
        todasFolhas.push(reg);
      });
    }
    
    return todasFolhas;
  } catch (error) {
    console.error('Erro ao carregar todas as folhas:', error);
    throw error;
  }
}
```

### Listar Arquivos Disponíveis

```javascript
/**
 * Lista todos os arquivos JSON na pasta converted/
 * @returns {Promise<Array<string>>} Array com nomes dos arquivos
 */
async function listarArquivosJSON() {
  // Opção 1: Se houver API que lista arquivos
  // const response = await fetch('/api/converted/list');
  // return await response.json();
  
  // Opção 2: Se os arquivos estiverem em um array conhecido
  // return [
  //   '2025-04_4 RELATORIO GERENCIAL ABRIL.2025.json',
  //   '2025-03_3 RELATORIO GERENCIAL MARCO.2025.json',
  //   // ...
  // ];
  
  // Opção 3: Se usar Firebase Storage ou similar
  // return await listarArquivosFirebase();
}
```

### Estrutura de Serviço Completa

```javascript
// services/folha-pagamento.js

/**
 * Lista todos os arquivos JSON disponíveis
 */
export async function listarArquivosJSON() {
  // Implementar conforme a infraestrutura disponível
}

/**
 * Carrega um arquivo específico por competência
 * @param {string} competencia - Formato YYYY-MM
 */
export async function carregarFolhaPorCompetencia(competencia) {
  const arquivos = await listarArquivosJSON();
  const arquivo = arquivos.find(a => a.startsWith(competencia));
  
  if (!arquivo) {
    throw new Error(`Arquivo não encontrado para competência ${competencia}`);
  }
  
  return await carregarFolha(arquivo);
}

/**
 * Carrega todos os registros de todas as folhas
 */
export async function carregarTodasFolhas() {
  // Implementação acima
}

/**
 * Aplica filtros aos dados
 * @param {Array} dados - Array de registros
 * @param {Object} filtros - Objeto com filtros
 */
export function filtrarFolha(dados, filtros) {
  let resultado = [...dados];
  
  // Filtro por competência
  if (filtros.competencia) {
    resultado = resultado.filter(r => r.competencia === filtros.competencia);
  }
  
  // Filtro por lotação
  if (filtros.lotacao) {
    resultado = resultado.filter(r => 
      r.lotacao_normalizada === filtros.lotacao
    );
  }
  
  // Filtro por vínculo
  if (filtros.vinculo) {
    resultado = resultado.filter(r => r.vinculo === filtros.vinculo);
  }
  
  // Filtro por situação
  if (filtros.situacao) {
    resultado = resultado.filter(r => r.situacao === filtros.situacao);
  }
  
  // Busca por nome
  if (filtros.buscaNome) {
    const busca = filtros.buscaNome.toLowerCase();
    resultado = resultado.filter(r => 
      r.nome.toLowerCase().includes(busca)
    );
  }
  
  return resultado;
}

/**
 * Agregações (funções acima)
 */
export { agregarPorCompetencia, agregarPorLotacao, agregarPorVinculo, agregarPorSituacao, agregarPorFuncaoNivel };
```

---

## 🎛️ Filtros do Dashboard

### HTML dos Filtros

```html
<div class="card mb-4">
  <div class="card-header">
    <h6 class="mb-0">
      <i class="bi bi-funnel me-2"></i>Filtros
    </h6>
  </div>
  <div class="card-body">
    <div class="row g-3">
      <!-- Filtro de Competência -->
      <div class="col-md-3 col-sm-6">
        <label class="form-label">Competência</label>
        <select class="form-select" id="filtro-competencia">
          <option value="">Todas as competências</option>
          <!-- Gerar dinamicamente a partir dos arquivos disponíveis -->
        </select>
      </div>
      
      <!-- Filtro de Lotação -->
      <div class="col-md-3 col-sm-6">
        <label class="form-label">Lotação</label>
        <select class="form-select" id="filtro-lotacao">
          <option value="">Todas as lotações</option>
          <!-- Gerar dinamicamente a partir de lotacao_normalizada -->
        </select>
      </div>
      
      <!-- Filtro de Vínculo -->
      <div class="col-md-3 col-sm-6">
        <label class="form-label">Vínculo</label>
        <select class="form-select" id="filtro-vinculo">
          <option value="">Todos os vínculos</option>
          <option value="ESTATUTARIO CIVIL">Estatutário Civil</option>
          <option value="CONTR TEMPORARIO – PSS">Contrato Temporário - PSS</option>
          <!-- Gerar dinamicamente -->
        </select>
      </div>
      
      <!-- Filtro de Situação -->
      <div class="col-md-3 col-sm-6">
        <label class="form-label">Situação</label>
        <select class="form-select" id="filtro-situacao">
          <option value="">Todas as situações</option>
          <option value="ATIVO">Ativo</option>
          <option value="AFASTADO">Afastado</option>
        </select>
      </div>
      
      <!-- Busca por Nome -->
      <div class="col-12">
        <label class="form-label">Buscar por nome</label>
        <input 
          type="text" 
          class="form-control" 
          id="filtro-busca-nome" 
          placeholder="Digite o nome do funcionário..."
        >
      </div>
      
      <!-- Botão Limpar Filtros -->
      <div class="col-12">
        <button type="button" class="btn btn-outline-secondary" id="btn-limpar-filtros">
          <i class="bi bi-x-circle me-2"></i>Limpar Filtros
        </button>
      </div>
    </div>
  </div>
</div>
```

### JavaScript dos Filtros

```javascript
// Preencher selects dinamicamente
async function preencherFiltros(dados) {
  // Competências
  const competencias = [...new Set(dados.map(r => r.competencia))].sort().reverse();
  const selectCompetencia = document.getElementById('filtro-competencia');
  competencias.forEach(comp => {
    const option = document.createElement('option');
    option.value = comp;
    option.textContent = formatarCompetencia(comp);
    selectCompetencia.appendChild(option);
  });
  
  // Lotações
  const lotacoes = [...new Set(dados.map(r => r.lotacao_normalizada).filter(Boolean))].sort();
  const selectLotacao = document.getElementById('filtro-lotacao');
  lotacoes.forEach(lot => {
    const option = document.createElement('option');
    option.value = lot;
    option.textContent = lot;
    selectLotacao.appendChild(option);
  });
  
  // Vínculos
  const vinculos = [...new Set(dados.map(r => r.vinculo).filter(Boolean))].sort();
  const selectVinculo = document.getElementById('filtro-vinculo');
  vinculos.forEach(vin => {
    const option = document.createElement('option');
    option.value = vin;
    option.textContent = vin;
    selectVinculo.appendChild(option);
  });
}

// Aplicar filtros com debounce
const aplicarFiltros = debounce(function() {
  const filtros = {
    competencia: document.getElementById('filtro-competencia').value,
    lotacao: document.getElementById('filtro-lotacao').value,
    vinculo: document.getElementById('filtro-vinculo').value,
    situacao: document.getElementById('filtro-situacao').value,
    buscaNome: document.getElementById('filtro-busca-nome').value.trim()
  };
  
  const dadosFiltrados = filtrarFolha(dadosCompletos, filtros);
  atualizarDashboard(dadosFiltrados);
}, 500);

// Event listeners
document.getElementById('filtro-competencia').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-lotacao').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-vinculo').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-situacao').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-busca-nome').addEventListener('input', aplicarFiltros);

// Limpar filtros
document.getElementById('btn-limpar-filtros').addEventListener('click', () => {
  document.getElementById('filtro-competencia').value = '';
  document.getElementById('filtro-lotacao').value = '';
  document.getElementById('filtro-vinculo').value = '';
  document.getElementById('filtro-situacao').value = '';
  document.getElementById('filtro-busca-nome').value = '';
  aplicarFiltros();
});
```

---

## 💰 Formatação de Valores

### Formatação Monetária

```javascript
/**
 * Formata valor como moeda brasileira
 * @param {number} valor - Valor numérico
 * @returns {string} Valor formatado (ex: "R$ 3.241,36")
 */
function formatarMoeda(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

// Exemplo: formatarMoeda(3241.36) → "R$ 3.241,36"
// Exemplo: formatarMoeda(0) → "R$ 0,00"
```

### Formatação de CPF

```javascript
/**
 * Formata CPF com máscara
 * @param {string} cpf - CPF apenas com dígitos
 * @returns {string} CPF formatado (ex: "123.456.789-01")
 */
function formatarCPF(cpf) {
  if (!cpf || cpf.length !== 11) {
    return cpf || '';
  }
  
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Exemplo: formatarCPF("12345678901") → "123.456.789-01"
```

### Formatação de Competência

```javascript
/**
 * Formata competência para exibição
 * @param {string} competencia - Formato YYYY-MM
 * @returns {string} Competência formatada (ex: "Abril/2025")
 */
function formatarCompetencia(competencia) {
  if (!competencia || !competencia.includes('-')) {
    return competencia || '';
  }
  
  const [ano, mes] = competencia.split('-');
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const mesNome = meses[parseInt(mes) - 1] || mes;
  return `${mesNome}/${ano}`;
}

// Exemplo: formatarCompetencia("2025-04") → "Abril/2025"
```

### Formatação de Percentual

```javascript
/**
 * Formata valor como percentual
 * @param {number} valor - Valor decimal (ex: 0.15 = 15%)
 * @param {number} casas - Número de casas decimais
 * @returns {string} Percentual formatado (ex: "15,00%")
 */
function formatarPercentual(valor, casas = 2) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return '0,00%';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  }).format(valor / 100);
}

// Exemplo: formatarPercentual(15.5) → "15,50%"
```

### Formatação de Número

```javascript
/**
 * Formata número com separadores de milhar
 * @param {number} valor - Valor numérico
 * @returns {string} Número formatado (ex: "1.234")
 */
function formatarNumero(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return '0';
  }
  
  return new Intl.NumberFormat('pt-BR').format(valor);
}

// Exemplo: formatarNumero(1234) → "1.234"
```

---

## ⚠️ Tratamento de Erros

### Verificar Erros nos Registros

```javascript
/**
 * Verifica se há erros no registro
 * @param {Object} registro - Registro da folha
 * @returns {boolean} true se houver erros
 */
function temErros(registro) {
  return registro.erros && registro.erros.length > 0;
}

/**
 * Exibe badge de aviso se houver erros
 * @param {Object} registro - Registro da folha
 * @returns {string} HTML do badge ou string vazia
 */
function badgeErros(registro) {
  if (!temErros(registro)) {
    return '';
  }
  
  return `
    <span class="badge bg-warning" title="${registro.erros.join(', ')}">
      <i class="bi bi-exclamation-triangle me-1"></i>Erros
    </span>
  `;
}
```

### Validação de Dados

```javascript
/**
 * Valida um registro e retorna lista de erros
 * @param {Object} registro - Registro a validar
 * @returns {Array<string>} Lista de erros encontrados
 */
function validarRegistro(registro) {
  const erros = [];
  
  // Validar nome
  if (!registro.nome || registro.nome.trim() === '') {
    erros.push('Nome vazio ou inválido');
  }
  
  // Validar CPF
  if (!registro.cpf || registro.cpf.length !== 11 || !/^\d+$/.test(registro.cpf)) {
    erros.push('CPF inválido');
  }
  
  // Validar valores financeiros
  if (isNaN(registro.liquido) || registro.liquido < 0) {
    erros.push('Valor líquido inválido');
  }
  
  if (isNaN(registro.vantagem) || registro.vantagem < 0) {
    erros.push('Valor de vantagem inválido');
  }
  
  if (isNaN(registro.desconto) || registro.desconto < 0) {
    erros.push('Valor de desconto inválido');
  }
  
  // Validar consistência: liquido = vantagem - desconto (com tolerância)
  const liquidoCalculado = registro.vantagem - registro.desconto;
  const diferenca = Math.abs(registro.liquido - liquidoCalculado);
  if (diferenca > 0.01) { // Tolerância de 1 centavo
    erros.push(`Inconsistência: líquido (${registro.liquido}) ≠ vantagem (${registro.vantagem}) - desconto (${registro.desconto})`);
  }
  
  return erros;
}
```

### Tratamento de Erros no Carregamento

```javascript
/**
 * Carrega dados com tratamento de erros robusto
 */
async function carregarDadosComValidacao() {
  try {
    showLoader('Carregando dados da folha de pagamento...');
    
    const dados = await carregarTodasFolhas();
    
    // Validar todos os registros
    const registrosComErro = [];
    dados.forEach((registro, index) => {
      const erros = validarRegistro(registro);
      if (erros.length > 0) {
        registrosComErro.push({ index, registro, erros });
      }
    });
    
    // Exibir avisos se houver erros
    if (registrosComErro.length > 0) {
      console.warn(`${registrosComErro.length} registros com erros encontrados:`, registrosComErro);
      showToast(
        `Atenção: ${registrosComErro.length} registro(s) com inconsistências detectadas. Verifique o console.`,
        'warning'
      );
    }
    
    return dados;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showToast('Erro ao carregar dados da folha de pagamento', 'danger');
    throw error;
  } finally {
    hideLoader();
  }
}
```

---

## 📁 Estrutura de Arquivos do Projeto

```
folha-pagamento/
├── index.html                          # HTML principal (mesma estrutura do SUMOF)
├── assets/
│   ├── css/
│   │   └── styles.css                  # Reutilizar CSS do SUMOF (mesmas variáveis)
│   ├── icons/                          # Ícones PWA (se necessário)
│   └── brasao_uncisal.png              # Logo UNCISAL
├── converted/                          # Pasta com arquivos JSON
│   ├── 2025-04_4 RELATORIO GERENCIAL ABRIL.2025.json
│   ├── 2025-03_3 RELATORIO GERENCIAL MARCO.2025.json
│   └── ...                             # Outros arquivos JSON
├── pages/
│   ├── dashboard-folha.js              # Página principal do dashboard
│   ├── relatorio-vencimentos.js       # Relatório 1
│   ├── relatorio-descontos.js         # Relatório 2
│   ├── relatorio-vantagens.js         # Relatório 3
│   ├── relatorio-lotacao.js           # Relatório 4
│   ├── relatorio-vinculo.js           # Relatório 5
│   ├── relatorio-ativos-afastados.js   # Relatório 6
│   ├── relatorio-evolucao-mensal.js   # Relatório 7
│   ├── relatorio-top-salarios.js     # Relatório 8
│   ├── relatorio-funcoes-niveis.js    # Relatório 9
│   └── relatorio-consolidado.js       # Relatório 10
├── services/
│   ├── firebase.js                     # Se necessário para autenticação
│   └── folha-pagamento.js             # Funções de carregamento e agregação
├── utils/
│   ├── pdf.js                          # Reutilizar do SUMOF (exportação PDF)
│   ├── feedback.js                     # Reutilizar do SUMOF (toasts, loader)
│   ├── pagination.js                   # Reutilizar do SUMOF (paginação)
│   ├── formatters.js                   # Funções de formatação (moeda, CPF, etc.)
│   ├── validations.js                  # Validações de dados
│   └── debounce.js                     # Reutilizar do SUMOF
├── components/
│   ├── navbar.js                       # Navbar (mesmo estilo do SUMOF)
│   └── footer.js                      # Footer (mesmo estilo do SUMOF)
├── server.js                           # Servidor Express (se necessário)
├── package.json                        # Dependências
└── README.md                           # Documentação
```

---

## 🎯 Bibliotecas e Dependências

### CDN (no index.html)

```html
<!-- Bootstrap -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/cosmo/bootstrap.min.css">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<!-- Bootstrap Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- jsPDF e AutoTable -->
<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"></script>

<!-- Google Fonts - Inter -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### package.json

```json
{
  "name": "folha-pagamento-dashboard",
  "version": "1.0.0",
  "description": "Dashboard de Relatórios de Folha de Pagamento - UNCISAL",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🎨 Gráficos com Chart.js

### Exemplo: Gráfico Doughnut (Distribuição por Lotação)

```javascript
function criarGraficoLotacao(dados) {
  const ctx = document.getElementById('chart-lotacao');
  if (!ctx) return;
  
  const agregado = agregarPorLotacao(dados);
  const labels = Object.keys(agregado);
  const valores = Object.values(agregado).map(a => a.count);
  
  // Detectar tema
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f1f5f9' : '#1f2937';
  
  // Paleta de cores
  const colorPalette = [
    '#2563eb', '#059669', '#f59e0b', '#ef4444', '#06b6d4',
    '#7c3aed', '#db2777', '#0891b2', '#ca8a04', '#16a34a'
  ];
  
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: colorPalette.slice(0, labels.length),
        borderWidth: 3,
        borderColor: isDark ? '#1e293b' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false // Usar legenda HTML customizada
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} funcionários (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        duration: 1000
      }
    }
  });
  
  return chart;
}
```

### Exemplo: Gráfico de Linha (Evolução Mensal)

```javascript
function criarGraficoEvolucao(dados) {
  const ctx = document.getElementById('chart-evolucao');
  if (!ctx) return;
  
  const agregado = agregarPorCompetencia(dados);
  const competencias = Object.keys(agregado).sort();
  const liquidos = competencias.map(comp => agregado[comp].liquido);
  const vantagens = competencias.map(comp => agregado[comp].vantagem);
  const descontos = competencias.map(comp => agregado[comp].desconto);
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f1f5f9' : '#1f2937';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: competencias.map(formatarCompetencia),
      datasets: [
        {
          label: 'Líquido',
          data: liquidos,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Vantagens',
          data: vantagens,
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Descontos',
          data: descontos,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: textColor }
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: textColor,
          bodyColor: textColor,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatarMoeda(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: function(value) {
              return formatarMoeda(value);
            }
          },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        }
      }
    }
  });
  
  return chart;
}
```

---

## 🔄 Dark Mode

### Implementação (mesma do SUMOF)

```javascript
// No index.html
(function() {
  const theme = localStorage.getItem('theme') || 'light';
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-mode');
  }
  
  window.toggleTheme = function() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    }
    updateThemeIcon();
    // Atualizar gráficos quando tema mudar
    if (window.charts) {
      window.charts.forEach(chart => chart.update());
    }
  };
  
  function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (icon) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      icon.className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
    }
  }
  
  document.addEventListener('DOMContentLoaded', updateThemeIcon);
})();
```

---

## 📤 Exportação PDF (Reutilizar do SUMOF)

### Exemplo de Uso

```javascript
import { exportRelatorioPDF } from '../utils/pdf.js';

// Exportar relatório de vencimentos
function exportarVencimentosPDF(dados) {
  const colunas = [
    { header: 'Nome', accessor: r => r.nome },
    { header: 'CPF', accessor: r => formatarCPF(r.cpf) },
    { header: 'Lotação', accessor: r => r.lotacao_normalizada },
    { header: 'Vínculo', accessor: r => r.vinculo },
    { header: 'Vantagem', accessor: r => formatarMoeda(r.vantagem) },
    { header: 'Desconto', accessor: r => formatarMoeda(r.desconto) },
    { header: 'Líquido', accessor: r => formatarMoeda(r.liquido) }
  ];
  
  const filtros = {
    Competência: document.getElementById('filtro-competencia').value || 'Todas',
    Lotação: document.getElementById('filtro-lotacao').value || 'Todas',
    Vínculo: document.getElementById('filtro-vinculo').value || 'Todos'
  };
  
  exportRelatorioPDF(
    'Relatório de Vencimentos - Folha de Pagamento',
    dados,
    colunas,
    filtros
  );
}
```

---

## ✅ Checklist de Implementação

### Fase 1: Estrutura Base
- [ ] Criar estrutura de pastas
- [ ] Configurar `index.html` com CDNs
- [ ] Reutilizar `styles.css` do SUMOF
- [ ] Criar `components/navbar.js` e `components/footer.js`
- [ ] Configurar roteamento básico

### Fase 2: Carregamento de Dados
- [ ] Implementar `services/folha-pagamento.js`
- [ ] Criar função `listarArquivosJSON()`
- [ ] Criar função `carregarFolha()`
- [ ] Criar função `carregarTodasFolhas()`
- [ ] Implementar funções de agregação

### Fase 3: Dashboard Principal
- [ ] Criar `pages/dashboard-folha.js`
- [ ] Implementar cards de métricas (4 cards)
- [ ] Implementar grid de cards de relatórios (10 cards)
- [ ] Implementar filtros
- [ ] Implementar gráficos principais

### Fase 4: Relatórios Individuais
- [ ] Relatório de Vencimentos
- [ ] Relatório de Descontos
- [ ] Relatório de Vantagens
- [ ] Relatório por Lotação
- [ ] Relatório por Vínculo
- [ ] Relatório de Ativos vs Afastados
- [ ] Relatório de Evolução Mensal
- [ ] Relatório de Top Salários
- [ ] Relatório de Funções e Níveis
- [ ] Relatório Consolidado

### Fase 5: Funcionalidades
- [ ] Dark mode (toggle)
- [ ] Paginação em tabelas
- [ ] Ordenação de colunas
- [ ] Exportação PDF
- [ ] Exportação CSV
- [ ] Busca e filtros
- [ ] Validação de dados
- [ ] Tratamento de erros

### Fase 6: Polimento
- [ ] Responsividade mobile
- [ ] Acessibilidade (ARIA labels)
- [ ] Performance (lazy loading, debounce)
- [ ] Animações suaves
- [ ] Loading states
- [ ] Mensagens de erro amigáveis

---

## 🎯 Observações Finais

1. **Consistência Visual:** Manter 100% do design system do SUMOF
2. **Reutilização:** Reutilizar funções utilitárias do SUMOF quando possível
3. **Performance:** Implementar lazy loading e debounce nos filtros
4. **Acessibilidade:** Seguir padrões WCAG AA
5. **Responsividade:** Mobile-first approach
6. **Validação:** Validar todos os dados antes de exibir
7. **Erros:** Tratar erros graciosamente com mensagens claras
8. **Documentação:** Comentar código complexo

---

**Este prompt contém todas as informações necessárias para criar um dashboard completo, profissional e consistente com o SUMOF!** 🚀

