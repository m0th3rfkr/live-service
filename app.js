// live-service/app.js
// Solo endpoints de APIs de fútbol (no RSS)
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// GET /matches  -> football-data.org
app.get('/matches', async (req, res) => {
  try {
    const token = process.env.FOOTBALL_DATA_TOKEN;
    if (!token) return res.status(400).json({ error: 'Falta FOOTBALL_DATA_TOKEN' });
    const params = new URLSearchParams();
    if (req.query.dateFrom) params.set('dateFrom', String(req.query.dateFrom));
    if (req.query.dateTo) params.set('dateTo', String(req.query.dateTo));
    if (req.query.competition) params.set('competitions', String(req.query.competition)); // e.g., WC
    const url = `https://api.football-data.org/v4/matches${params.toString() ? '?' + params.toString() : ''}`;
    const r = await fetch(url, { headers: { 'X-Auth-Token': token } });
    const json = await r.json();
    res.json({ source: 'football-data.org', url, data: json });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fallo /matches', details: String(err) });
  }
});

// GET /fixtures -> API-FOOTBALL (APISports)
app.get('/fixtures', async (req, res) => {
  try {
    const key = process.env.API_FOOTBALL_KEY;
    if (!key) return res.status(400).json({ error: 'Falta API_FOOTBALL_KEY' });
    const base = 'https://v3.football.api-sports.io/fixtures';
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) qs.set(k, String(v));
    const url = `${base}${qs.toString() ? '?' + qs.toString() : ''}`;
    const r = await fetch(url, { headers: { 'x-apisports-key': key } });
    const json = await r.json();
    res.json({ source: 'api-football (apisports)', url, data: json });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fallo /fixtures', details: String(err) });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true, service: 'live' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`live-service listo en http://localhost:${PORT}`));
