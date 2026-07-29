const DEMO_BOATS = [
  { id: 1, name: 'MAKAI', sail: 'NED 89', system: 'ORC', rating: 1.1881, progress: 78.8, speed: 9.4, mark: 'Perna final', age: 18, elapsed: 5740 },
  { id: 2, name: 'MADMAX', sail: 'POR 8137', system: 'ANC', rating: 1.187, progress: 76.9, speed: 8.8, mark: 'Perna final', age: 28, elapsed: 5820 },
  { id: 3, name: 'PLAYTIME', sail: 'ITA 15446', system: 'ANC', rating: 1.174, progress: 74.7, speed: 9.1, mark: 'Perna final', age: 31, elapsed: 5900 },
  { id: 4, name: 'YEMAYA', sail: 'POR 8556', system: 'ORC', rating: 1.1307, progress: 72.5, speed: 8.6, mark: 'Perna final', age: 24, elapsed: 5960 },
  { id: 5, name: 'ALLABOARD49', sail: 'POR 49', system: 'ANC', rating: 1.117, progress: 69.4, speed: 8.3, mark: 'Após desmarque', age: 42, elapsed: 6050 },
  { id: 6, name: 'MAR MEU', sail: 'POR 2018', system: 'ORC', rating: 1.1167, progress: 67.1, speed: 8.9, mark: 'Após desmarque', age: 20, elapsed: 6110 },
  { id: 7, name: 'FUNBEL', sail: 'POR 4508', system: 'ANC', rating: 1.116, progress: 64.7, speed: 8.1, mark: 'Após desmarque', age: 47, elapsed: 6200 },
  { id: 8, name: 'FAROFINO', sail: 'POR 2000', system: 'ORC', rating: 1.0945, progress: 61.8, speed: 7.8, mark: 'Após desmarque', age: 33, elapsed: 6290 },
  { id: 9, name: 'PEDE MAR', sail: 'GBR 1234 X', system: 'ANC', rating: 1.097, progress: 59.2, speed: 7.6, mark: 'Após desmarque', age: 61, elapsed: 6370 },
  { id: 10, name: 'PAPA LEGUAS II', sail: 'POR 1312', system: 'ORC', rating: 1.058, progress: 56.4, speed: 7.3, mark: 'Próximo do desmarque', age: 37, elapsed: 6440 },
  { id: 11, name: 'BALAYA', sail: 'POR 8108', system: 'ANC', rating: .997, progress: 51.8, speed: 6.8, mark: 'Próximo do desmarque', age: 55, elapsed: 6560 },
  { id: 12, name: 'SENSIA', sail: 'POR 8138', system: 'ANC', rating: .983, progress: 49.5, speed: 6.9, mark: 'Primeira perna', age: 44, elapsed: 6630 },
  { id: 13, name: 'FEITICO', sail: 'POR 406', system: 'ORC', rating: .9973, progress: 47.7, speed: 6.6, mark: 'Primeira perna', age: 29, elapsed: 6710 },
  { id: 14, name: 'MAR ME QUER', sail: '25698', system: 'ANC', rating: .919, progress: 43.4, speed: 6.1, mark: 'Primeira perna', age: 52, elapsed: 6810 }
];

const STAGES = [
  { number: 1, title: 'Etapa 1', subtitle: 'Concluída · percurso oficial', status: 'done' },
  { number: 2, title: 'Etapa 2', subtitle: 'Concluída · percurso oficial', status: 'done' },
  { number: 3, title: 'Etapa 3', subtitle: 'Concluída · percurso oficial', status: 'done' },
  { number: 4, title: 'Etapa 4', subtitle: 'Concluída · percurso oficial', status: 'done' },
  { number: 5, title: 'Cascais → Lisboa', subtitle: 'In-Port · 29 julho', status: 'live' },
  { number: 6, title: 'Etapa 6', subtitle: 'Configurar percurso oficial', status: 'next' },
  { number: 7, title: 'Etapa 7', subtitle: 'Configurar percurso oficial', status: 'next' },
  { number: 8, title: 'Etapa 8', subtitle: 'Configurar percurso oficial', status: 'next' }
];

const state = {
  boats: structuredClone(DEMO_BOATS),
  rankingView: 'water',
  classFilter: 'all'
};

const fmtTime = (seconds) => {
  const safe = Math.max(0, Math.round(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
};

const correctedSeconds = (boat) => boat.elapsed * boat.rating;
const waterSorted = (boats) => [...boats].sort((a, b) => b.progress - a.progress);
const correctedSorted = (boats) => [...boats].sort((a, b) => correctedSeconds(a) - correctedSeconds(b));

function currentSortedBoats() {
  return state.rankingView === 'water' ? waterSorted(state.boats) : correctedSorted(state.boats);
}

function renderLeaders() {
  const list = document.querySelector('#leaderList');
  const boats = currentSortedBoats().slice(0, 6);
  document.querySelector('#leaderTitle').textContent = state.rankingView === 'water' ? 'Posição na água' : 'Corrigida estimada';

  list.innerHTML = boats.map((boat, index) => `
    <article class="leader-item">
      <div class="leader-item__position">${index + 1}</div>
      <div class="leader-item__name">
        <strong>${boat.name}</strong>
        <span>${boat.sail} · ${boat.system}</span>
      </div>
      <div class="leader-item__metric">
        <strong>${state.rankingView === 'water' ? `${boat.progress.toFixed(1)}%` : fmtTime(correctedSeconds(boat))}</strong>
        <span>${state.rankingView === 'water' ? boat.mark : 'tempo corrigido'}</span>
      </div>
    </article>
  `).join('');
}

function renderRanking() {
  const tbody = document.querySelector('#rankingBody');
  let boats = currentSortedBoats();
  if (state.classFilter !== 'all') boats = boats.filter((boat) => boat.system === state.classFilter);

  tbody.innerHTML = boats.map((boat, index) => `
    <tr>
      <td><span class="rank-number">${index + 1}</span></td>
      <td>
        <div class="boat-cell">
          <div class="boat-avatar ${boat.system}">${boat.system}</div>
          <div><strong>${boat.name}</strong><span>${boat.sail}</span></div>
        </div>
      </td>
      <td><span class="class-badge ${boat.system}">${boat.system}</span></td>
      <td>
        <div class="progress-mini">
          <div class="progress-mini__top"><span>${boat.mark}</span><strong>${boat.progress.toFixed(1)}%</strong></div>
          <div class="progress-mini__bar"><span style="width:${boat.progress}%"></span></div>
        </div>
      </td>
      <td><strong>${boat.speed.toFixed(1)} kn</strong></td>
      <td><span class="mono">${boat.rating.toFixed(4)}</span></td>
      <td><strong class="mono">${fmtTime(correctedSeconds(boat))}</strong></td>
      <td><span class="freshness"><i></i>há ${boat.age}s</span></td>
    </tr>
  `).join('');
}

function mapPoint(progress, lane) {
  const p = Math.min(1, Math.max(0, progress / 100));
  const x = 135 + (636 - 135) * p + Math.sin(p * Math.PI) * 52;
  const y = 393 + (151 - 393) * p - Math.sin(p * Math.PI * 1.15) * 52;
  return { x: x + lane * 5, y: y + lane * 4 };
}

function renderMap() {
  const layer = document.querySelector('#boatLayer');
  const top = waterSorted(state.boats).slice(0, 10);
  layer.innerHTML = top.map((boat, index) => {
    const point = mapPoint(boat.progress, (index % 5) - 2);
    return `
      <g class="boat-marker boat-marker--${boat.system}" transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})">
        <circle r="10"></circle>
        <text x="15" y="4">${boat.name}</text>
      </g>
    `;
  }).join('');
}

function renderStages() {
  const grid = document.querySelector('#stageGrid');
  grid.innerHTML = STAGES.map((stage) => {
    const statusText = stage.status === 'done' ? 'Concluída' : stage.status === 'live' ? 'Em direto' : 'Próxima';
    return `
      <article class="stage-card ${stage.status === 'live' ? 'is-live' : ''}" data-number="${stage.number}">
        <div class="stage-card__top">
          <span class="stage-card__number">Etapa ${stage.number}</span>
          <span class="stage-status stage-status--${stage.status}">${statusText}</span>
        </div>
        <h3>${stage.title}</h3>
        <p>${stage.subtitle}</p>
      </article>
    `;
  }).join('');
}

function updateClock() {
  const now = new Date();
  document.querySelector('#clock').textContent = new Intl.DateTimeFormat('pt-PT', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(now);
}

function updateTimestamp() {
  const now = new Date();
  document.querySelector('#lastUpdate').textContent = new Intl.DateTimeFormat('pt-PT', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(now);
}

function simulatePositions() {
  state.boats = state.boats.map((boat) => ({
    ...boat,
    progress: Math.min(99.3, boat.progress + Math.random() * 1.8),
    speed: Math.max(4.8, boat.speed + (Math.random() - .5) * .8),
    elapsed: boat.elapsed + 30,
    age: Math.floor(8 + Math.random() * 48)
  }));
  updateTimestamp();
  renderAll();
}

function renderAll() {
  renderLeaders();
  renderRanking();
  renderMap();
}

function bindEvents() {
  document.querySelectorAll('.segment').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.segment').forEach((el) => el.classList.remove('is-active'));
      button.classList.add('is-active');
      state.rankingView = button.dataset.view;
      renderAll();
    });
  });

  document.querySelectorAll('.filter-chip').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((el) => el.classList.remove('is-active'));
      button.classList.add('is-active');
      state.classFilter = button.dataset.class;
      renderRanking();
    });
  });

  document.querySelector('#refreshDemo').addEventListener('click', simulatePositions);
  document.querySelector('#simulateUpdate').addEventListener('click', simulatePositions);

  const dialog = document.querySelector('#adminDialog');
  document.querySelector('#openAdmin').addEventListener('click', () => dialog.showModal());
}

async function tryLiveApi() {
  try {
    const response = await fetch('/api/live', { headers: { Accept: 'application/json' } });
    if (!response.ok) return;
    const payload = await response.json();
    if (Array.isArray(payload.boats) && payload.boats.length) {
      state.boats = payload.boats;
      updateTimestamp();
      renderAll();
    }
  } catch {
    // A versão estática funciona sem servidor. O modo API é opcional no protótipo.
  }
}

renderStages();
renderAll();
bindEvents();
updateClock();
updateTimestamp();
setInterval(updateClock, 1000);
setInterval(simulatePositions, 30000);
tryLiveApi();
