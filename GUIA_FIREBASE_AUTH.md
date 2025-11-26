# 🔥 Guia: Autenticação com Firebase

## 📋 Visão Geral

Firebase Authentication é uma solução completa de autenticação gerenciada pelo Google. Para este projeto, ele protegeria os dados sensíveis (CPFs, salários) exigindo login antes de acessar o dashboard.

---

## 🎯 Como Funciona no Seu Projeto

### Fluxo de Autenticação

```
1. Usuário acessa o site
   ↓
2. Firebase verifica se está autenticado
   ↓
3. Se NÃO autenticado → Mostra tela de login
   ↓
4. Usuário faz login (email/senha, Google, etc.)
   ↓
5. Firebase retorna token de autenticação
   ↓
6. Token é armazenado no navegador
   ↓
7. Todas as requisições de dados incluem o token
   ↓
8. Backend valida token antes de retornar dados
```

---

## 🏗️ Arquitetura com Firebase

### Opção 1: Firebase + Cloud Functions (Recomendado)

```
Frontend (Netlify)
  ↓
Firebase Auth (Login/Token)
  ↓
Cloud Functions (Backend API)
  ↓
Firebase Storage ou Firestore (Dados JSON)
```

**Vantagens:**
- ✅ Tudo gerenciado pelo Firebase
- ✅ Escalável automaticamente
- ✅ Sem servidor próprio para manter
- ✅ Integração nativa

**Desvantagens:**
- ❌ Custo (pode ser gratuito até certo limite)
- ❌ Dependência do Firebase
- ❌ Curva de aprendizado

---

### Opção 2: Firebase Auth + Netlify Functions

```
Frontend (Netlify)
  ↓
Firebase Auth (Login/Token)
  ↓
Netlify Functions (Backend API)
  ↓
Arquivos JSON (Netlify ou Firebase Storage)
```

**Vantagens:**
- ✅ Mantém tudo no Netlify
- ✅ Firebase apenas para auth
- ✅ Mais controle sobre backend

**Desvantagens:**
- ❌ Mais complexo de configurar
- ❌ Duas plataformas (Netlify + Firebase)

---

## 🚀 Implementação Passo a Passo

### Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome: "Dashboard Servidores UNCISAL"
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

### Passo 2: Configurar Authentication

1. No Firebase Console, vá em **Authentication**
2. Clique em **Começar**
3. Habilite **Email/Password** (método de login)
4. Opcional: Habilite **Google** (login com Google)

### Passo 3: Instalar Firebase SDK

```bash
npm install firebase
```

### Passo 4: Configurar Firebase no Projeto

**Arquivo novo:** `config/firebase.js`

```javascript
// config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// ⚠️ IMPORTANTE: Essas chaves são públicas e seguras para expor no frontend
// A segurança real vem das regras do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "dashboard-servidores-uncisal.firebaseapp.com",
  projectId: "dashboard-servidores-uncisal",
  storageBucket: "dashboard-servidores-uncisal.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Authentication
export const auth = getAuth(app);

export default app;
```

**⚠️ Onde obter essas chaves:**
1. Firebase Console → Configurações do projeto (ícone de engrenagem)
2. Role até "Seus apps"
3. Clique em `</>` (Web)
4. Copie as configurações

---

### Passo 5: Criar Componente de Login

**Arquivo novo:** `components/login.js`

```javascript
// components/login.js
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import { showToast } from '../utils/feedback.js';

let currentUser = null;

/**
 * Verifica se usuário está autenticado
 */
export function verificarAutenticacao() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      resolve(user);
    });
  });
}

/**
 * Faz login com email e senha
 */
export async function fazerLogin(email, senha) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    currentUser = userCredential.user;
    showToast('Login realizado com sucesso!', 'success');
    return userCredential.user;
  } catch (error) {
    console.error('Erro no login:', error);
    let mensagem = 'Erro ao fazer login';
    
    switch (error.code) {
      case 'auth/user-not-found':
        mensagem = 'Usuário não encontrado';
        break;
      case 'auth/wrong-password':
        mensagem = 'Senha incorreta';
        break;
      case 'auth/invalid-email':
        mensagem = 'Email inválido';
        break;
      default:
        mensagem = error.message;
    }
    
    showToast(mensagem, 'danger');
    throw error;
  }
}

/**
 * Faz logout
 */
export async function fazerLogout() {
  try {
    await signOut(auth);
    currentUser = null;
    showToast('Logout realizado com sucesso', 'info');
    window.location.href = '/';
  } catch (error) {
    console.error('Erro no logout:', error);
    showToast('Erro ao fazer logout', 'danger');
  }
}

/**
 * Obtém token de autenticação atual
 */
export async function obterToken() {
  if (!currentUser) {
    return null;
  }
  
  try {
    return await currentUser.getIdToken();
  } catch (error) {
    console.error('Erro ao obter token:', error);
    return null;
  }
}

/**
 * Obtém usuário atual
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Renderiza tela de login
 */
export function renderLoginScreen() {
  return `
    <div class="login-container" style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg-primary);
      padding: 2rem;
    ">
      <div class="login-card" style="
        max-width: 400px;
        width: 100%;
        padding: 2.5rem;
        background: var(--color-bg-elevated);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xl);
      ">
        <div class="text-center mb-4">
          <img src="/assets/icons/brasao_uncisal.png" alt="UNCISAL" style="
            max-width: 120px;
            margin-bottom: 1.5rem;
          ">
          <h2 class="fw-bold mb-2" style="color: var(--color-text-primary);">
            Dashboard Servidores
          </h2>
          <p class="text-muted" style="color: var(--color-text-secondary);">
            Faça login para acessar
          </p>
        </div>
        
        <form id="login-form">
          <div class="mb-3">
            <label for="login-email" class="form-label" style="color: var(--color-text-primary);">
              Email
            </label>
            <input 
              type="email" 
              class="form-control" 
              id="login-email" 
              required
              placeholder="seu.email@uncisal.edu.br"
              style="
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                color: var(--color-text-primary);
              "
            >
          </div>
          
          <div class="mb-4">
            <label for="login-senha" class="form-label" style="color: var(--color-text-primary);">
              Senha
            </label>
            <input 
              type="password" 
              class="form-control" 
              id="login-senha" 
              required
              placeholder="••••••••"
              style="
                background: var(--color-bg-secondary);
                border: 1px solid var(--color-border);
                color: var(--color-text-primary);
              "
            >
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-100"
            style="
              padding: 0.75rem;
              font-weight: 600;
              border-radius: var(--radius-md);
            "
          >
            <i class="bi bi-box-arrow-in-right me-2"></i>
            Entrar
          </button>
        </form>
        
        <div class="mt-4 text-center">
          <small class="text-muted" style="color: var(--color-text-tertiary);">
            Acesso restrito a funcionários autorizados
          </small>
        </div>
      </div>
    </div>
  `;
}

/**
 * Configura eventos do formulário de login
 */
export function configurarLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    
    try {
      await fazerLogin(email, senha);
      // Redirecionar será feito automaticamente pelo onAuthStateChanged
    } catch (error) {
      // Erro já foi tratado em fazerLogin
    }
  });
}
```

---

### Passo 6: Atualizar Dashboard para Verificar Autenticação

**Arquivo:** `pages/dashboard-folha.js`

**Adicionar no início:**
```javascript
import { verificarAutenticacao, renderLoginScreen, configurarLogin } from '../components/login.js';
import { obterToken } from '../components/login.js';
```

**Modificar função `init()`:**
```javascript
async function init() {
  try {
    // Verificar autenticação primeiro
    const user = await verificarAutenticacao();
    
    if (!user) {
      // Usuário não autenticado - mostrar tela de login
      document.body.innerHTML = renderLoginScreen();
      configurarLogin();
      return; // Parar execução aqui
    }
    
    // Usuário autenticado - continuar normalmente
    console.log('✅ Usuário autenticado:', user.email);
    
    // Inicializar componentes
    initNavbar();
    initFooter();
    
    // ... resto do código existente
  } catch (error) {
    console.error('Erro na inicialização:', error);
  }
}
```

---

### Passo 7: Atualizar Serviço para Incluir Token

**Arquivo:** `services/folha-pagamento.js`

**Adicionar import:**
```javascript
import { obterToken } from '../components/login.js';
```

**Modificar função `carregarFolha()`:**
```javascript
export async function carregarFolha(arquivo) {
  try {
    // Obter token de autenticação
    const token = await obterToken();
    
    if (!token) {
      throw new Error('Não autenticado. Faça login novamente.');
    }
    
    // Incluir token no header da requisição
    const response = await fetch(`/api/dados/${arquivo}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401) {
      // Token inválido ou expirado
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar arquivo: ${response.statusText}`);
    }
    
    const data = await response.json();
    // ... resto do código existente
  } catch (error) {
    console.error('Erro ao carregar folha:', error);
    throw error;
  }
}
```

---

### Passo 8: Criar Backend API (Netlify Functions)

**Arquivo novo:** `netlify/functions/get-dados.js`

```javascript
// netlify/functions/get-dados.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin (apenas no servidor)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

exports.handler = async (event, context) => {
  // Verificar método HTTP
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }
  
  // Obter token do header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Token não fornecido' })
    };
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    // Verificar token com Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Token válido - usuário autenticado
    console.log('✅ Usuário autenticado:', decodedToken.email);
    
    // Obter competência da query string
    const competencia = event.queryStringParameters?.competencia;
    if (!competencia) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Competência não fornecida' })
      };
    }
    
    // Carregar arquivo JSON
    const convertedDir = path.join(__dirname, '../../converted');
    const files = fs.readdirSync(convertedDir)
      .filter(file => file.startsWith(competencia) && file.endsWith('.json'));
    
    if (files.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Arquivo não encontrado' })
      };
    }
    
    const filePath = path.join(convertedDir, files[0]);
    const data = fs.readFileSync(filePath, 'utf8');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache'
      },
      body: data
    };
    
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Token expirado' })
      };
    }
    
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Token inválido' })
    };
  }
};
```

---

### Passo 9: Configurar Firebase Admin (Backend)

1. Firebase Console → Configurações do projeto
2. Aba "Contas de serviço"
3. Clique em "Gerar nova chave privada"
4. Baixe o arquivo JSON
5. **NÃO COMMITAR** este arquivo!
6. Adicionar como variável de ambiente no Netlify:
   - Nome: `FIREBASE_SERVICE_ACCOUNT`
   - Valor: Conteúdo do JSON (como string)

---

### Passo 10: Atualizar package.json

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "firebase": "^10.7.1",
    "firebase-admin": "^12.0.0"
  }
}
```

---

### Passo 11: Criar Usuários no Firebase

**Opção A: Via Console (Manual)**
1. Firebase Console → Authentication → Users
2. Clique em "Adicionar usuário"
3. Digite email e senha
4. Clique em "Adicionar"

**Opção B: Via Código (Admin)**
```javascript
// scripts/criar-usuario.js (executar localmente)
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function criarUsuario(email, senha) {
  try {
    const user = await admin.auth().createUser({
      email: email,
      password: senha,
      emailVerified: false
    });
    console.log('✅ Usuário criado:', user.uid);
  } catch (error) {
    console.error('Erro:', error);
  }
}

criarUsuario('admin@uncisal.edu.br', 'senha-segura-123');
```

---

## 🔒 Segurança

### Regras de Segurança (Firebase Storage/Firestore)

Se usar Firebase Storage para os JSONs:

```javascript
// firebase.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /converted/{fileName} {
      // Apenas usuários autenticados podem ler
      allow read: if request.auth != null;
      // Apenas admins podem escrever
      allow write: if request.auth != null && 
                      request.auth.token.admin == true;
    }
  }
}
```

---

## 📊 Comparação: Firebase vs Outras Opções

| Aspecto | Firebase Auth | Netlify Identity | Auth0 | Custom Backend |
|---------|---------------|------------------|-------|----------------|
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Custo** | Gratis até 50k MAU | Gratis (Netlify) | Pago | Servidor próprio |
| **Manutenção** | Zero | Zero | Zero | Alta |
| **Escalabilidade** | Automática | Automática | Automática | Manual |
| **Integração** | Excelente | Boa | Boa | Total controle |
| **LGPD** | ✅ | ✅ | ✅ | Depende |

**MAU = Monthly Active Users**

---

## 💰 Custos Firebase

### Plano Spark (Gratuito)
- ✅ 50.000 autenticações/mês
- ✅ Email/Password
- ✅ Google Sign-In
- ✅ Sem limite de usuários

### Plano Blaze (Pago)
- 💰 $0.0055 por autenticação após 50k
- ✅ Sem limite
- ✅ Recursos avançados

**Para seu caso:** Plano gratuito é suficiente!

---

## ✅ Checklist de Implementação

### Setup Firebase
- [ ] Criar projeto no Firebase
- [ ] Configurar Authentication (Email/Password)
- [ ] Obter chaves de configuração
- [ ] Criar arquivo `config/firebase.js`

### Frontend
- [ ] Instalar `firebase` npm package
- [ ] Criar componente de login
- [ ] Atualizar `dashboard-folha.js` para verificar auth
- [ ] Atualizar `services/folha-pagamento.js` para incluir token
- [ ] Adicionar botão de logout no navbar

### Backend
- [ ] Criar Netlify Function para API
- [ ] Instalar `firebase-admin`
- [ ] Configurar Firebase Admin
- [ ] Adicionar variável de ambiente no Netlify
- [ ] Testar verificação de token

### Usuários
- [ ] Criar usuários de teste
- [ ] Criar usuários de produção
- [ ] Documentar processo de criação

### Testes
- [ ] Testar login
- [ ] Testar logout
- [ ] Testar acesso sem autenticação (deve bloquear)
- [ ] Testar token expirado
- [ ] Testar requisições com token válido

---

## 🚀 Deploy

### 1. Variáveis de Ambiente no Netlify

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=...
```

### 2. Build Command
```bash
npm run build
```

### 3. Publish Directory
```
dist
```

---

## 🎯 Vantagens do Firebase Auth

1. ✅ **Zero manutenção** - Google gerencia tudo
2. ✅ **Segurança robusta** - Tokens JWT, criptografia, etc.
3. ✅ **Escalável** - Suporta milhões de usuários
4. ✅ **Múltiplos métodos** - Email, Google, Facebook, etc.
5. ✅ **Recuperação de senha** - Automático
6. ✅ **Verificação de email** - Automático
7. ✅ **LGPD compliant** - Google segue regulamentações

---

## ⚠️ Desvantagens

1. ❌ **Dependência externa** - Se Firebase cair, seu site cai
2. ❌ **Custo após limite** - Pode ficar caro com muitos usuários
3. ❌ **Curva de aprendizado** - Precisa entender Firebase
4. ❌ **Vendor lock-in** - Difícil migrar depois

---

## 📝 Próximos Passos

1. **Decidir**: Firebase é a melhor opção para você?
2. **Criar projeto** no Firebase
3. **Implementar** seguindo este guia
4. **Testar** localmente
5. **Deploy** no Netlify

---

## 🤔 Quando Usar Firebase?

✅ **Use Firebase se:**
- Quer solução rápida e pronta
- Não quer manter servidor próprio
- Precisa de múltiplos métodos de login
- Quer escalabilidade automática
- Orçamento permite (ou está no plano gratuito)

❌ **NÃO use Firebase se:**
- Precisa de controle total
- Dados não podem sair do país
- Quer evitar vendor lock-in
- Tem orçamento zero (e vai passar do limite)

---

**Última atualização:** 2025-01-XX
**Versão:** 1.0.0

