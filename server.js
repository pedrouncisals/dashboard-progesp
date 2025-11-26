const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos
app.use(express.static(__dirname));
app.use('/converted', express.static(path.join(__dirname, 'converted')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/services', express.static(path.join(__dirname, 'services')));
app.use('/utils', express.static(path.join(__dirname, 'utils')));
app.use('/components', express.static(path.join(__dirname, 'components')));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// NOVO ENDPOINT: Listar arquivos JSON disponíveis dinamicamente
app.get('/api/converted/list', (req, res) => {
  try {
    const convertedDir = path.join(__dirname, 'converted');
    
    // Verificar se diretório existe
    if (!fs.existsSync(convertedDir)) {
      console.warn('⚠️ Diretório converted/ não encontrado');
      return res.json([]);
    }
    
    const files = fs.readdirSync(convertedDir)
      .filter(file => file.endsWith('.json'))
      .filter(file => file.match(/^\d{4}-\d{2}_/)) // Formato: YYYY-MM_*.json
      .sort(); // Ordenar alfabeticamente (já ordena por data)
    
    console.log(`📁 ${files.length} arquivos JSON encontrados em converted/`);
    res.json(files);
  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Erro ao listar arquivos', details: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Dashboard de Folha de Pagamento - UNCISAL`);
});

