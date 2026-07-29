const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 4173);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.resolve(__dirname, '..')));

const boats = [
  { id: 1, name: 'MAKAI', sail: 'NED 89', system: 'ORC', rating: 1.1881, progress: 78.8, speed: 9.4, mark: 'Perna final', age: 18, elapsed: 5740 },
  { id: 2, name: 'MADMAX', sail: 'POR 8137', system: 'ANC', rating: 1.187, progress: 76.9, speed: 8.8, mark: 'Perna final', age: 28, elapsed: 5820 },
  { id: 3, name: 'PLAYTIME', sail: 'ITA 15446', system: 'ANC', rating: 1.174, progress: 74.7, speed: 9.1, mark: 'Perna final', age: 31, elapsed: 5900 },
  { id: 4, name: 'YEMAYA', sail: 'POR 8556', system: 'ORC', rating: 1.1307, progress: 72.5, speed: 8.6, mark: 'Perna final', age: 24, elapsed: 5960 },
  { id: 5, name: 'ALLABOARD49', sail: 'POR 49', system: 'ANC', rating: 1.117, progress: 69.4, speed: 8.3, mark: 'Após desmarque', age: 42, elapsed: 6050 },
  { id: 6, name: 'MAR MEU', sail: 'POR 2018', system: 'ORC', rating: 1.1167, progress: 67.1, speed: 8.9, mark: 'Após desmarque', age: 20, elapsed: 6110 }
];

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mode: process.env.AIS_PROVIDER || 'mock', timestamp: new Date().toISOString() });
});

app.get('/api/live', (_req, res) => {
  const updated = boats.map((boat) => ({
    ...boat,
    progress: Math.min(99.5, boat.progress + Math.random() * .5),
    speed: Math.max(4.5, boat.speed + (Math.random() - .5) * .3),
    age: Math.floor(8 + Math.random() * 40)
  }));
  res.json({
    event: 'Volta a Portugal à Vela 2026',
    stage: 5,
    official: false,
    generatedAt: new Date().toISOString(),
    boats: updated
  });
});

app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Volta a Portugal à Vela Live: http://localhost:${PORT}`);
});
