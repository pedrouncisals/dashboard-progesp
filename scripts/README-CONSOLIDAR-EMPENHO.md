# 📋 Script de Consolidação de Empenho

Este script consolida automaticamente todos os arquivos `dados_mes_*.json` em um único arquivo `dados_por_mes.json` para uso no dashboard.

## 🚀 Como Usar

### Opção 1: Via NPM (Recomendado)
```bash
npm run consolidar-empenho
```

### Opção 2: Via Node.js Direto
```bash
node scripts/consolidar-empenho.js
```

### Opção 3: Via Batch (Windows)
```bash
scripts\consolidar-empenho.bat
```

## 📝 Processo

1. O script procura todos os arquivos `dados_mes_*.json` na pasta `converted/empenho/`
2. Consolida todos em um único arquivo `dados_por_mes.json`
3. Ordena os meses automaticamente (mes_01, mes_02, ..., mes_12)
4. Exibe estatísticas do processo

## ➕ Adicionar Novo Mês

Para adicionar o **mês 11** (ou qualquer outro mês):

1. **Coloque o arquivo JSON** na pasta `converted/empenho/` com o nome:
   - `dados_mes_11.json` (para novembro)
   - `dados_mes_12.json` (para dezembro)
   - etc.

2. **Execute o script de consolidação:**
   ```bash
   npm run consolidar-empenho
   ```

3. **Pronto!** O dashboard automaticamente incluirá o novo mês.

## 📊 Formato Esperado do Arquivo

O arquivo `dados_mes_XX.json` pode estar em dois formatos:

### Formato 1: Array direto
```json
[
  {
    "matricula": "933",
    "nome": "ABIMAEL LINS PEIXOTO FILHO",
    "cargo": "ARTÍFICE",
    "salario": "1518.00",
    "situacao": "ATIVO",
    "carga_horaria": "120",
    "cpf": "889.367.244-87",
    "admissao": "09/12/2024",
    "lotacao": "SVO",
    "area": "MEIO",
    "vinculo": "SEM VÍNCULO",
    "mes_referencia": 11,
    "arquivo_origem": "MES 11.PDF"
  }
]
```

### Formato 2: Objeto com chave mes_XX
```json
{
  "mes_11": [
    {
      "matricula": "933",
      "nome": "ABIMAEL LINS PEIXOTO FILHO",
      ...
    }
  ]
}
```

## ✅ Exemplo de Saída

```
🔄 Iniciando consolidação de empenhos...

📁 Encontrados 11 arquivos:
   - dados_mes_01.json
   - dados_mes_02.json
   ...
   - dados_mes_11.json

✅ dados_mes_01.json → mes_01: 593 registros
✅ dados_mes_02.json → mes_02: 577 registros
...
✅ dados_mes_11.json → mes_11: 600 registros

✅ Consolidação concluída!
📊 Total de meses: 11
📊 Total de registros: 6.507
📄 Arquivo salvo em: converted/empenho/dados_por_mes.json

🎉 Pronto! O dashboard agora incluirá todos os meses consolidados.
```

## ⚠️ Observações

- O script **não sobrescreve** o arquivo `dados_por_mes.json` se houver erro
- Arquivos com formato inválido são ignorados com aviso
- Os meses são ordenados automaticamente (01, 02, ..., 12)
- O script é **idempotente** - pode ser executado múltiplas vezes sem problemas

