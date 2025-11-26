# 📊 Dashboard de Folha de Pagamento - UNCISAL

Dashboard completo e interativo para análise de relatórios de folha de pagamento da UNCISAL (Universidade Estadual de Ciências da Saúde de Alagoas).

## ✨ Características

- 🎨 **Design System SUMOF**: Interface moderna e consistente
- 📱 **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- 🌓 **Dark Mode**: Tema claro e escuro
- 📈 **10 Relatórios Completos**: Análises detalhadas de todos os aspectos da folha
- 📊 **Gráficos Interativos**: Visualizações com Chart.js
- 🔍 **Filtros Avançados**: Por competência, lotação, vínculo e situação
- 📄 **Exportação**: PDF e CSV
- ⚡ **Performance**: Carregamento rápido e interface fluida

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (geralmente vem com Node.js)

## 🚀 Instalação

1. **Clone ou baixe o repositório**

2. **Instale as dependências:**

```bash
npm install
```

3. **Certifique-se de que os dados JSON estão na pasta `converted/`:**
   - Os arquivos devem estar no formato: `YYYY-MM_*.json`
   - Exemplo: `2025-01_1 RELATORIO GERENCIAL JANEIRO.2025.json`

## ▶️ Como Executar

### Modo Desenvolvimento/Produção

```bash
npm start
```

O servidor iniciará em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
folha-pagamento/
├── index.html                  # HTML principal
├── server.js                   # Servidor Express
├── package.json               # Dependências
├── README.md                  # Este arquivo
│
├── assets/
│   └── css/
│       └── styles.css         # Estilos CSS (Design System SUMOF)
│
├── components/
│   ├── navbar.js              # Componente de navegação
│   └── footer.js              # Componente de rodapé
│
├── services/
│   └── folha-pagamento.js     # Serviços de dados
│
├── utils/
│   ├── formatters.js          # Formatação de valores
│   ├── feedback.js            # Toasts e loaders
│   ├── debounce.js            # Debounce de eventos
│   ├── validations.js         # Validações
│   ├── pagination.js          # Sistema de paginação
│   └── pdf.js                 # Exportação PDF/CSV
│
├── pages/
│   ├── dashboard-folha.js              # Dashboard principal
│   ├── relatorio-vencimentos.js        # Relatório 1
│   ├── relatorio-descontos.js          # Relatório 2
│   ├── relatorio-vantagens.js          # Relatório 3
│   ├── relatorio-lotacao.js            # Relatório 4
│   ├── relatorio-vinculo.js            # Relatório 5
│   ├── relatorio-ativos-afastados.js   # Relatório 6
│   ├── relatorio-evolucao-mensal.js    # Relatório 7
│   ├── relatorio-top-salarios.js       # Relatório 8
│   ├── relatorio-funcoes-niveis.js     # Relatório 9
│   └── relatorio-consolidado.js        # Relatório 10
│
├── converted/                  # Dados JSON (gerados)
│   ├── 2025-01_*.json
│   ├── 2025-02_*.json
│   └── ...
│
└── csv/                       # Arquivos CSV originais
    ├── 1 RELATORIO GERENCIAL JANEIRO.2025.csv
    └── ...
```

## 📊 Os 10 Relatórios

### 1. 📅 Relatório de Vencimentos
Lista completa de funcionários com seus vencimentos do mês.

**Informações:**
- Nome, CPF, Matrícula
- Lotação e Vínculo
- Vantagens, Descontos e Líquido
- Situação (Ativo/Afastado)

**Recursos:**
- Paginação (10 itens por página)
- Ordenação por colunas
- Exportação PDF/CSV

### 2. 💰 Relatório de Descontos
Análise detalhada de todos os descontos aplicados.

**Métricas:**
- Total de descontos
- Média por funcionário
- % sobre vantagens

**Visualizações:**
- Top 10 maiores descontos
- Descontos por lotação

### 3. 📈 Relatório de Vantagens
Análise de vantagens e proventos pagos.

**Métricas:**
- Total de vantagens
- Média por funcionário
- Maior e menor vantagem

**Visualizações:**
- Top 10 maiores vantagens
- Vantagens por lotação

### 4. 🏢 Relatório por Lotação
Visão consolidada por unidade/lotação.

**Informações:**
- Quantidade de funcionários por lotação
- Total de vantagens, descontos e líquido
- Média líquida por lotação

### 5. 📋 Relatório por Vínculo
Comparação entre tipos de vínculo.

**Análises:**
- Distribuição de funcionários
- Valores totais e médios
- Comparativo entre vínculos

### 6. ✅ Relatório de Ativos vs Afastados
Análise da situação dos funcionários.

**Informações:**
- Total de ativos e afastados
- Principais motivos de afastamento
- Comparativo de folha

### 7. 📊 Relatório de Evolução Mensal
Comparação da folha entre meses.

**Análises:**
- Variação percentual mês a mês
- Tendências (crescimento/decrescimento)
- Maior e menor folha do período

### 8. 🏆 Relatório de Top Salários
Ranking dos maiores salários líquidos.

**Informações:**
- Top 10 maiores salários
- Top 11 ao 20
- Estatísticas (média, mediana)

### 9. 👔 Relatório de Funções e Níveis
Análise por função e nível funcional.

**Informações:**
- Distribuição por função
- Distribuição por nível
- Médias salariais

### 10. 📑 Relatório Consolidado Geral
Visão geral completa com todas as métricas.

**Informações:**
- Todas as métricas principais
- Distribuições (lotação, vínculo, situação)
- Evolução temporal
- Resumo geral

## 🎨 Design System

O dashboard utiliza o mesmo design system do projeto SUMOF, garantindo consistência visual:

- **Paleta de Cores:** Azul primário (#2563eb), Verde secundário (#059669), Laranja accent (#f59e0b)
- **Tipografia:** Inter (Google Fonts)
- **Componentes:** Cards, badges, tabelas, gráficos
- **Responsividade:** Mobile-first approach
- **Acessibilidade:** Seguindo padrões WCAG AA

## 🔧 Funcionalidades

### Filtros
- **Competência:** Selecione o mês/ano
- **Lotação:** Filtre por unidade
- **Vínculo:** Filtre por tipo de vínculo
- **Situação:** Ativos ou Afastados
- **Busca:** Por nome do funcionário

### Visualizações
- **Gráfico Doughnut:** Distribuição por lotação
- **Gráfico de Linha:** Evolução mensal
- **Gráfico de Barras:** Top 10 salários

### Exportação
- **PDF:** Relatórios formatados profissionalmente
- **CSV:** Para análise em Excel/planilhas

### Dark Mode
Alterne entre tema claro e escuro usando o botão no topo da página.

## 📝 Scripts Python Auxiliares

### `payroll_to_json.py`
Converte arquivos CSV de folha de pagamento para JSON normalizado.

**Uso:**
```bash
python payroll_to_json.py
```

**Recursos:**
- Normalização de nomes, CPF, vínculos
- Normalização de lotações
- Parsing de valores monetários
- Detecção automática de competência

### `generate_dashboard_dataset.py`
Gera arquivo de resumo agregado para melhor performance.

**Uso:**
```bash
python generate_dashboard_dataset.py
```

**Gera:**
- `dashboard_data_summary.json` com agregações pré-calculadas

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5:** Estrutura semântica
- **CSS3:** Estilos modernos com variáveis CSS
- **JavaScript (ES6+):** Lógica da aplicação
- **Bootstrap 5:** Framework CSS
- **Bootstrap Icons:** Ícones
- **Chart.js:** Gráficos interativos
- **jsPDF + AutoTable:** Geração de PDF

### Backend
- **Node.js:** Runtime JavaScript
- **Express:** Servidor web

### Python (Scripts auxiliares)
- **json, csv:** Manipulação de dados
- **pathlib:** Manipulação de arquivos
- **re, unicodedata:** Processamento de texto

## 📄 Formato dos Dados JSON

Os arquivos JSON seguem o seguinte formato:

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

## 🔒 Segurança

- ✅ Dados sensíveis não são enviados para servidores externos
- ✅ Processamento local (localhost)
- ✅ Sem armazenamento em banco de dados externo
- ⚠️ **IMPORTANTE:** Use apenas em ambiente interno/seguro

## 🐛 Troubleshooting

### Erro: "Não é possível carregar módulos ES"
**Solução:** Certifique-se de que seu servidor suporta ES Modules. O servidor Express incluído já está configurado corretamente.

### Gráficos não aparecem
**Solução:** Verifique se o Chart.js foi carregado corretamente. Abra o console do navegador (F12) e procure por erros.

### Dados não carregam
**Solução:** 
1. Verifique se os arquivos JSON estão na pasta `converted/`
2. Verifique o console do navegador para erros
3. Certifique-se de que o servidor está rodando

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Entre em contato com a equipe de TI da UNCISAL

## 📜 Licença

Este projeto é de uso interno da UNCISAL.

---

**Desenvolvido para UNCISAL** 🏥
*Universidade Estadual de Ciências da Saúde de Alagoas*

