require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const MW_API_KEY = process.env.MERRIAM_WEBSTER_API_KEY;

const fetchProxy = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get('/api/synonyms', async (req, res) => {
  const word = (req.query.word || '').trim();

  if (!word) {
    return res.status(400).json({ error: 'Missing required query parameter: word' });
  }

  if (!MW_API_KEY) {
    return res.status(500).json({
      error: 'Server API key is not configured. Set MERRIAM_WEBSTER_API_KEY in .env.'
    });
  }

  const targetUrl = `https://dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(word)}?key=${MW_API_KEY}`;

  try {
    const response = await fetchProxy(targetUrl);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      error: 'Failed to reach Merriam-Webster API.',
      details: error.message
    });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }

  return next();
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

app.listen(PORT, () => {
  console.log(`Synonym proxy server running on http://localhost:${PORT}`);
});
