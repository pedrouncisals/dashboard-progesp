# 🛡️ Plano de Ação: Ofuscação e Proteção do Dashboard

## 📋 Objetivo

Implementar técnicas de ofuscação de código e proteção de dados sensíveis antes do deploy no Netlify, garantindo que informações pessoais (CPFs, salários) não sejam facilmente acessíveis.

---

## ⚠️ **AVISO CRÍTICO**

**Ofuscação ≠ Segurança Real**

- ✅ Ofuscação protege o **código fonte** (dificulta engenharia reversa)
- ❌ Ofuscação **NÃO protege dados** expostos em JSONs públicos
- 🔒 Para dados sensíveis: **Backend API + Autenticação** é obrigatório

---

## 🎯 **Fase 1: Preparação e Análise**

### 1.1 Identificar Dados Sensíveis
- [ ] Listar todos os campos sensíveis nos JSONs:
  - CPF
  - Nome completo
  - Salários (vantagem, desconto, líquido)
  - Matrícula
  - Lotação (pode identificar pessoas)

### 1.2 Avaliar Necessidade de Acesso
- [ ] Definir quem precisa acessar os dados:
  - Usuários internos apenas?
  - Acesso público limitado?
  - Requer autenticação?

### 1.3 Decidir Estratégia
- [ ] **Opção A**: Ofuscação básica (código apenas)
- [ ] **Opção B**: Backend API + Autenticação Custom (recomendado)
- [ ] **Opção C**: Firebase Authentication + Netlify Functions (mais fácil)
- [ ] **Opção D**: Híbrido (ofuscação + API parcial)

**📖 Ver também:** `GUIA_FIREBASE_AUTH.md` para detalhes sobre Firebase

---

## 🔧 **Fase 2: Implementação Técnica**

### 2.1 Setup de Build Tools

#### 2.1.1 Instalar Dependências
```bash
npm install --save-dev vite terser vite-plugin-compression
```

**Arquivos a modificar:**
- `package.json` - Adicionar dependências e scripts

#### 2.1.2 Configurar Vite
**Arquivo novo:** `vite.config.js`

**Conteúdo:**
```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      mangle: {
        toplevel: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          'vendor': ['chart.js'],
          'utils': ['./utils/formatters.js', './utils/validations.js']
        },
        chunkFileNames: 'js/[hash].js',
        entryFileNames: 'js/[hash].js',
        assetFileNames: 'assets/[hash].[ext]'
      }
    },
    assetsInlineLimit: 4096
  },
  server: {
    port: 3000
  }
});
```

**Checklist:**
- [ ] Criar `vite.config.js`
- [ ] Testar build local: `npm run build`
- [ ] Verificar se arquivos foram gerados em `dist/`

---

### 2.2 Atualizar Scripts do Package.json

**Arquivo:** `package.json`

**Modificações:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && netlify deploy --prod"
  }
}
```

**Checklist:**
- [ ] Adicionar script `build`
- [ ] Adicionar script `preview`
- [ ] Adicionar script `deploy` (opcional)

---

### 2.3 Criar Script de Ofuscação Avançada (Opcional)

**Arquivo novo:** `scripts/obfuscate.js`

**Conteúdo:**
```javascript
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

async function obfuscateFiles() {
  const distDir = path.join(__dirname, '../dist');
  const jsFiles = getAllJsFiles(distDir);
  
  for (const file of jsFiles) {
    const code = fs.readFileSync(file, 'utf8');
    const result = await minify(code, {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 5
      },
      mangle: {
        toplevel: true,
        properties: {
          regex: /^[a-z]/
        }
      },
      format: {
        comments: false
      }
    });
    
    fs.writeFileSync(file, result.code);
    console.log(`✅ Ofuscado: ${file}`);
  }
}

function getAllJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsFiles(filePath));
    } else if (file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

obfuscateFiles().catch(console.error);
```

**Checklist:**
- [ ] Criar pasta `scripts/`
- [ ] Criar `scripts/obfuscate.js`
- [ ] Testar script: `node scripts/obfuscate.js`

---

### 2.4 Configurar Variáveis de Ambiente

**Arquivo novo:** `.env`

**Conteúdo:**
```
NODE_ENV=production
API_TOKEN=seu-token-super-secreto-aqui
ENCRYPTION_KEY=chave-de-criptografia-opcional
```

**Arquivo:** `.gitignore` (verificar/adicionar)

**Adicionar:**
```
.env
.env.local
.env.production
dist/
node_modules/
converted/*.json
!converted/.gitkeep
```

**Checklist:**
- [ ] Criar `.env` (não commitar!)
- [ ] Atualizar `.gitignore`
- [ ] Criar `.env.example` (template sem valores reais)

---

## 🔒 **Fase 3: Proteção de Dados (CRÍTICO)**

### 3.0 Escolher Método de Autenticação

**Opções disponíveis:**
1. **Backend API Custom** (Fase 3.1) - Mais controle, mais trabalho
2. **Firebase Authentication** (Fase 3.2) - Mais fácil, menos controle
3. **Netlify Identity** (Fase 3.3) - Integrado ao Netlify

**📖 Guia completo do Firebase:** Ver `GUIA_FIREBASE_AUTH.md`

---

### 3.1 Opção A: Backend API com Autenticação Custom (RECOMENDADO)

#### 3.1.1 Atualizar server.js

**Arquivo:** `server.js`

**Adicionar:**
```javascript
// Middleware de autenticação
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const validToken = process.env.API_TOKEN;
  
  if (!validToken) {
    console.error('⚠️ API_TOKEN não configurado!');
    return res.status(500).json({ error: 'Servidor não configurado' });
  }
  
  if (!token || token !== validToken) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  
  next();
}

// Endpoint protegido para dados
app.get('/api/dados/:competencia', requireAuth, (req, res) => {
  try {
    const competencia = req.params.competencia;
    const convertedDir = path.join(__dirname, 'converted');
    const files = fs.readdirSync(convertedDir)
      .filter(file => file.startsWith(competencia) && file.endsWith('.json'));
    
    if (files.length === 0) {
      return res.status(404).json({ error: 'Competência não encontrada' });
    }
    
    const filePath = path.join(convertedDir, files[0]);
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
});

// Endpoint para listar competências disponíveis (protegido)
app.get('/api/competencias', requireAuth, (req, res) => {
  try {
    const convertedDir = path.join(__dirname, 'converted');
    const files = fs.readdirSync(convertedDir)
      .filter(file => file.endsWith('.json') && file.match(/^\d{4}-\d{2}_/))
      .map(file => file.match(/^(\d{4}-\d{2})_/)[1])
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
    
    res.json(files);
  } catch (error) {
    console.error('Erro ao listar competências:', error);
    res.status(500).json({ error: 'Erro ao listar competências' });
  }
});
```

#### 3.1.2 Atualizar services/folha-pagamento.js

**Arquivo:** `services/folha-pagamento.js`

**Modificar função `carregarFolha`:**
```javascript
export async function carregarFolha(arquivo) {
  try {
    // Obter token de autenticação (armazenar em localStorage ou sessionStorage)
    const token = localStorage.getItem('api_token') || sessionStorage.getItem('api_token');
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    
    const competencia = arquivo.match(/^(\d{4}-\d{2})_/)?.[1];
    if (!competencia) {
      throw new Error('Formato de arquivo inválido');
    }
    
    const response = await fetch(`/api/dados/${competencia}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401) {
      throw new Error('Não autorizado. Faça login novamente.');
    }
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar arquivo: ${response.statusText}`);
    }
    
    const data = await response.json();
    // ... resto do código
  } catch (error) {
    console.error('Erro ao carregar folha:', error);
    throw error;
  }
}
```

**Checklist:**
- [ ] Adicionar middleware de autenticação
- [ ] Criar endpoints protegidos
- [ ] Atualizar `carregarFolha` para usar API
- [ ] Implementar sistema de login/token (se necessário)

---

### 3.2 Opção B: Firebase Authentication (MAIS FÁCIL)

**📖 Guia completo:** Ver `GUIA_FIREBASE_AUTH.md`

**Resumo rápido:**
- Criar projeto no Firebase Console
- Habilitar Authentication (Email/Password)
- Instalar `firebase` e `firebase-admin`
- Criar componente de login
- Proteger API com Netlify Functions

**Vantagens:**
- ✅ Zero manutenção
- ✅ Segurança robusta (Google)
- ✅ Plano gratuito até 50k usuários/mês

**Checklist:**
- [ ] Ver guia completo em `GUIA_FIREBASE_AUTH.md`

---

### 3.3 Opção C: Criptografia Básica (NÃO RECOMENDADO PARA PRODUÇÃO)

**Arquivo novo:** `utils/encryption.js`

**Conteúdo:**
```javascript
// ⚠️ ATENÇÃO: Criptografia client-side NÃO é segura!
// Use apenas para dificultar acesso casual, não para segurança real

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-me';

export function encryptData(data) {
  const json = JSON.stringify(data);
  let encrypted = '';
  for (let i = 0; i < json.length; i++) {
    encrypted += String.fromCharCode(
      json.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
    );
  }
  return btoa(encrypted);
}

export function decryptData(encryptedData) {
  try {
    const decoded = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return JSON.parse(decrypted);
  } catch (e) {
    console.error('Erro ao descriptografar:', e);
    return null;
  }
}
```

**Checklist:**
- [ ] Criar `utils/encryption.js`
- [ ] Script Python para criptografar JSONs antes do deploy
- [ ] Atualizar `carregarFolha` para descriptografar

---

## 🌐 **Fase 4: Configuração Netlify**

### 4.1 Criar netlify.toml

**Arquivo novo:** `netlify.toml`

**Conteúdo:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/converted/*.json"
  [headers.values]
    X-Robots-Tag = "noindex, nofollow"
    Cache-Control = "private, no-cache, no-store, must-revalidate"
    X-Frame-Options = "DENY"

[[headers]]
  for = "/api/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, OPTIONS"
    Access-Control-Allow-Headers = "Authorization, Content-Type"

[[redirects]]
  from = "/converted/*"
  to = "/404.html"
  status = 404
  force = true

[context.production.environment]
  NODE_ENV = "production"
```

**Checklist:**
- [ ] Criar `netlify.toml`
- [ ] Configurar headers de segurança
- [ ] Bloquear acesso direto aos JSONs (se não usar API)

---

### 4.2 Configurar Variáveis no Netlify

**No painel do Netlify:**
1. Site settings → Environment variables
2. Adicionar:
   - `API_TOKEN` = (valor secreto)
   - `NODE_ENV` = `production`
   - `ENCRYPTION_KEY` = (se usar criptografia)

**Checklist:**
- [ ] Adicionar variáveis de ambiente no Netlify
- [ ] Testar se variáveis estão acessíveis no build

---

### 4.3 Configurar Build Settings

**No painel do Netlify:**
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18.x ou superior

**Checklist:**
- [ ] Configurar build command
- [ ] Configurar publish directory
- [ ] Verificar Node version

---

## 🧪 **Fase 5: Testes**

### 5.1 Testes Locais

**Checklist:**
- [ ] `npm run build` executa sem erros
- [ ] `npm run preview` mostra o site funcionando
- [ ] Arquivos JS estão minificados/ofuscados
- [ ] Console não mostra código legível
- [ ] Dados carregam corretamente (se usar API, testar autenticação)

### 5.2 Testes de Segurança

**Checklist:**
- [ ] Tentar acessar `/converted/*.json` diretamente (deve bloquear)
- [ ] Tentar acessar `/api/*` sem token (deve retornar 401)
- [ ] Verificar se dados sensíveis não aparecem no código fonte
- [ ] Testar em modo anônimo/incógnito

### 5.3 Testes no Netlify (Deploy Preview)

**Checklist:**
- [ ] Deploy preview funciona
- [ ] Variáveis de ambiente estão disponíveis
- [ ] Headers de segurança estão aplicados
- [ ] Site funciona corretamente em produção

---

## 📝 **Fase 6: Documentação**

### 6.1 Atualizar README.md

**Adicionar seção:**
```markdown
## 🔒 Segurança e Deploy

### Build para Produção
```bash
npm run build
```

### Deploy no Netlify
1. Configure as variáveis de ambiente no painel do Netlify
2. Configure build command: `npm run build`
3. Configure publish directory: `dist`
4. Faça o deploy

### Variáveis de Ambiente Necessárias
- `API_TOKEN`: Token de autenticação para API
- `NODE_ENV`: `production`
```

**Checklist:**
- [ ] Adicionar seção de segurança no README
- [ ] Documentar processo de build
- [ ] Documentar variáveis de ambiente

---

## ✅ **Checklist Final**

### Antes do Deploy
- [ ] Build local funciona sem erros
- [ ] Código está ofuscado/minificado
- [ ] Dados sensíveis protegidos (API ou criptografia)
- [ ] Variáveis de ambiente configuradas
- [ ] `.env` não está no git
- [ ] `netlify.toml` configurado
- [ ] Headers de segurança aplicados
- [ ] Testes passaram

### Após o Deploy
- [ ] Site funciona em produção
- [ ] Autenticação funciona (se aplicável)
- [ ] Dados não são acessíveis diretamente
- [ ] Performance está adequada
- [ ] Console não expõe informações sensíveis

---

## 🚨 **IMPORTANTE: Considerações Legais**

### LGPD (Lei Geral de Proteção de Dados)
- ⚠️ CPFs são dados pessoais sensíveis
- ⚠️ Salários são dados pessoais sensíveis
- ✅ Implementar medidas técnicas adequadas
- ✅ Limitar acesso apenas a pessoas autorizadas
- ✅ Documentar medidas de segurança

### Recomendações
1. **Autenticação obrigatória** para acesso aos dados
2. **Logs de acesso** para auditoria
3. **Termo de uso** informando sobre proteção de dados
4. **Política de privacidade** clara

---

## 📞 **Suporte e Dúvidas**

Se tiver dúvidas durante a implementação:
1. Verificar se todas as dependências foram instaladas
2. Verificar logs do build (`npm run build`)
3. Verificar console do navegador
4. Verificar logs do Netlify

---

## 🎯 **Próximos Passos**

1. **Decidir estratégia** (API ou criptografia básica)
2. **Implementar Fase 2** (Build tools)
3. **Implementar Fase 3** (Proteção de dados)
4. **Configurar Netlify** (Fase 4)
5. **Testar tudo** (Fase 5)
6. **Documentar** (Fase 6)
7. **Deploy!** 🚀

---

**Última atualização:** 2025-01-XX
**Versão:** 1.0.0

