# 📋 PROMPT: Footer Padronizado com Badge "Estagiário"

## 🎯 Especificação Completa

### Estrutura HTML

```html
<footer class="footer-premium-ultra">
  <div class="footer-container-premium">
    <div class="footer-content-wrapper">
      <!-- Left Section -->
      <div class="footer-left">
        <div class="footer-brand">
          <i class="bi bi-building footer-icon"></i>
          <div class="footer-brand-text">
            <div class="footer-brand-title">[NOME_DA_EMPRESA]</div>
            <div class="footer-brand-subtitle">[SUBTÍTULO_OPCIONAL]</div>
          </div>
        </div>
        <div class="footer-info">
          <span class="footer-badge-small">
            <i class="bi bi-shield-check"></i>
            Sistema Oficial
          </span>
        </div>
      </div>
      
      <!-- Right Section -->
      <div class="footer-right">
        <div class="footer-credits">
          <div class="credits-main">
            <i class="bi bi-code-slash credits-icon"></i>
            <span class="credits-text">
              Desenvolvido por: <strong>Pedro <span class="credits-estagiario-inline">"estagiário"</span> Vasconcelos</strong>
            </span>
          </div>
          <div class="credits-subtitle">
            PROGESP • Analista de Sistemas
            <span class="credits-wink">✨</span>
          </div>
        </div>
        <div class="footer-copyright">
          <i class="bi bi-calendar3"></i>
          <span>© [ANO_ATUAL] [NOME_DA_EMPRESA]</span>
        </div>
      </div>
    </div>
  </div>
</footer>
```

### Componente JavaScript (ES6 Module)

```javascript
/**
 * FOOTER COMPONENT - PADRONIZADO
 * Rodapé premium com badge "estagiário" padronizado
 */

export function renderFooter(empresa = 'UNCISAL', subtitulo = null) {
  const anoAtual = new Date().getFullYear();
  
  return `
    <footer class="footer-premium-ultra">
      <div class="footer-container-premium">
        <div class="footer-content-wrapper">
          <!-- Left Section -->
          <div class="footer-left">
            <div class="footer-brand">
              <i class="bi bi-building footer-icon"></i>
              <div class="footer-brand-text">
                <div class="footer-brand-title">${empresa}</div>
                ${subtitulo ? `<div class="footer-brand-subtitle">${subtitulo}</div>` : ''}
              </div>
            </div>
            <div class="footer-info">
              <span class="footer-badge-small">
                <i class="bi bi-shield-check"></i>
                Sistema Oficial
              </span>
            </div>
          </div>
          
          <!-- Right Section -->
          <div class="footer-right">
            <div class="footer-credits">
              <div class="credits-main">
                <i class="bi bi-code-slash credits-icon"></i>
                <span class="credits-text">
                  Desenvolvido por: <strong>Pedro <span class="credits-estagiario-inline">"estagiário"</span> Vasconcelos</strong>
                </span>
              </div>
              <div class="credits-subtitle">
                PROGESP • Analista de Sistemas
                <span class="credits-wink">✨</span>
              </div>
            </div>
            <div class="footer-copyright">
              <i class="bi bi-calendar3"></i>
              <span>© ${anoAtual} ${empresa}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Inicializa o footer no container especificado
 * @param {string} containerId - ID do elemento container (padrão: 'footer-container')
 */
export function initFooter(containerId = 'footer-container', empresa = 'UNCISAL', subtitulo = null) {
  const footerContainer = document.getElementById(containerId);
  if (footerContainer) {
    footerContainer.innerHTML = renderFooter(empresa, subtitulo);
  }
}
```

### CSS Completo e Padronizado

```css
/* ============================================
   FOOTER - PREMIUM ULTRA (PADRONIZADO)
   ============================================ */

.footer-premium-ultra {
  margin-top: 4rem;
  padding: 2rem 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.footer-premium-ultra::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 102, 255, 0.2) 50%, 
    transparent 100%
  );
}

.footer-container-premium {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

/* Footer Left */
.footer-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.footer-icon {
  font-size: 1.5rem;
  color: #0066FF;
  filter: drop-shadow(0 2px 4px rgba(0, 102, 255, 0.3));
}

.footer-brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.footer-brand-title {
  font-size: 1rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.01em;
}

.footer-brand-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-badge-small {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(0, 208, 132, 0.1);
  border: 1px solid rgba(0, 208, 132, 0.2);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #00D084;
  backdrop-filter: blur(10px);
}

.footer-badge-small i {
  font-size: 0.6875rem;
}

/* Footer Right */
.footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  text-align: right;
}

.footer-credits {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.credits-main {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.credits-main:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.credits-icon {
  font-size: 1rem;
  color: #0066FF;
  filter: drop-shadow(0 1px 2px rgba(0, 102, 255, 0.3));
}

.credits-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.credits-text strong {
  color: #FFFFFF;
  font-weight: 600;
  background: linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline;
}

/* ============================================
   BADGE "ESTAGIÁRIO" - PADRONIZADO
   ============================================
   ESPECIFICAÇÕES OBRIGATÓRIAS:
   - Texto: "estagiário" (com aspas duplas, lowercase)
   - Cor: #FF6B2C (laranja)
   - Estilo: italic, lowercase, font-weight: 600
   - Efeito hover: scale(1.08) + translateY(-1px)
   ============================================ */

/* Garantir que o badge não seja afetado pelo gradiente do strong */
.credits-text strong .credits-estagiario-inline {
  -webkit-background-clip: initial !important;
  -webkit-text-fill-color: #FF6B2C !important;
  background-clip: initial !important;
  background: linear-gradient(135deg, rgba(255, 107, 44, 0.2) 0%, rgba(255, 107, 44, 0.15) 100%) !important;
  color: #FF6B2C !important;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 0.9 !important;
}

.credits-estagiario-inline {
  /* Layout */
  display: inline-block;
  margin: 0 0.25rem;
  padding: 0.125rem 0.375rem;
  position: relative;
  
  /* Visual */
  background: linear-gradient(135deg, 
    rgba(255, 107, 44, 0.2) 0%, 
    rgba(255, 107, 44, 0.15) 100%);
  border: 1px solid rgba(255, 107, 44, 0.4);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(255, 107, 44, 0.15);
  
  /* Tipografia - PADRONIZADO */
  font-size: 0.75rem;
  font-weight: 600;
  font-style: italic;
  text-transform: lowercase;
  letter-spacing: 0.02em;
  color: #FF6B2C;
  
  /* Comportamento */
  opacity: 0.9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.credits-estagiario-inline:hover {
  opacity: 1;
  transform: scale(1.08) translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 107, 44, 0.25);
  border-color: rgba(255, 107, 44, 0.5);
}

.credits-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
  font-style: italic;
  padding-left: 1.625rem;
  position: relative;
}

.credits-subtitle::before {
  content: '💼';
  position: absolute;
  left: 0;
  font-style: normal;
  opacity: 0.6;
}

.credits-wink {
  display: inline-block;
  margin-left: 0.25rem;
  animation: wink-rotate 2s ease-in-out infinite;
  opacity: 0.8;
}

@keyframes wink-rotate {
  0%, 100% {
    transform: rotate(0deg) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: rotate(10deg) scale(1.1);
    opacity: 1;
  }
}

.footer-copyright {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
}

.footer-copyright i {
  font-size: 0.6875rem;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .footer-right {
    align-items: flex-start;
    text-align: left;
    width: 100%;
  }
  
  .footer-credits {
    align-items: flex-start;
  }
  
  .credits-subtitle {
    padding-left: 1.625rem;
  }
  
  .credits-subtitle::before {
    left: 0;
  }
}
```

## 📝 Regras de Padronização do Badge "Estagiário"

### ✅ OBRIGATÓRIO:
1. **Texto exato**: `"estagiário"` (com aspas duplas, sempre lowercase)
2. **Cor**: `#FF6B2C` (laranja)
3. **Estilo**: `italic`, `lowercase`, `font-weight: 600`
4. **Tamanho**: `0.75rem`
5. **Padding**: `0.125rem 0.375rem`
6. **Margin**: `0 0.25rem`
7. **Hover**: `scale(1.08) translateY(-1px)`

### 🎨 Visual:
- Background: Gradiente laranja sutil (rgba(255, 107, 44, 0.2) → 0.15)
- Border: 1px solid rgba(255, 107, 44, 0.4)
- Border-radius: 4px
- Box-shadow: 0 2px 4px rgba(255, 107, 44, 0.15)
- Hover shadow: 0 4px 8px rgba(255, 107, 44, 0.25)

### 📐 Estrutura HTML:
```html
<strong>Pedro <span class="credits-estagiario-inline">"estagiário"</span> Vasconcelos</strong>
```

## 🚀 Como Usar em Outros Projetos

### 1. Copiar arquivos:
- `components/footer.js` (ou adaptar para seu framework)
- CSS do footer (seção completa acima)

### 2. Importar e inicializar:
```javascript
import { initFooter } from './components/footer.js';

// Inicializar com valores padrão
initFooter();

// Ou customizar
initFooter('footer-container', 'Minha Empresa', 'Subtítulo opcional');
```

### 3. HTML base:
```html
<div id="footer-container"></div>
```

### 4. Dependências:
- Bootstrap Icons (`bi bi-building`, `bi bi-code-slash`, etc.)
- Variável CSS `--transition-base` (ou substituir por `0.3s cubic-bezier(0.4, 0, 0.2, 1)`)

## ⚠️ IMPORTANTE:
- **NUNCA** alterar o texto do badge (sempre `"estagiário"`)
- **NUNCA** alterar a cor (#FF6B2C)
- **SEMPRE** manter o estilo italic e lowercase
- **SEMPRE** manter o efeito hover padronizado

---

**Versão:** 1.0  
**Última atualização:** 2025  
**Autor:** Pedro "estagiário" Vasconcelos

