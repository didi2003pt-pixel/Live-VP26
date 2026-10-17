import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SOURCE_URL = 'https://1drv.ms/x/c/b29a7352ce375c54/IQAVdpxYbazkTKu9A8B_1RULAfOdFQSSfz8JNN92trJyJm0?e=IiO5hF';
const DATA_PATH = 'moura-2026/data.json';
const DEBUG_PATH = 'moura-2026/debug.png';
const EXPECTED_GROUPS = [1,2,3];
const EXPECTED_TEAM_COUNT = 18;

const now = new Date().toISOString();
let browser;
let page;

function parseTSV(text) {
  return String(text ?? '')
    .replace(/\r/g,'')
    .split('\n')
    .map(line => line.split('\t').map(v => v.trim()))
    .filter(row => row.some(Boolean));
}

function raceKey(race, group) {
  return `R${race}G${group}`;
}

function loadPrevious() {
  if (!existsSync(DATA_PATH)) return {};
  try { return JSON.parse(readFileSync(DATA_PATH,'utf8')); }
  catch { return {}; }
}

function completeOrder(values) {
  const nums = values.filter(Boolean).map(v => Number(String(v).replace(/\D/g,'')));
  return nums.length === 6 &&
    nums.every(n => Number.isInteger(n) && n >= 1 && n <= 6) &&
    new Set(nums).size === 6 ? nums : null;
}

function compareStanding(a,b,raceNumbers) {
  if (a.total !== b.total) return a.total - b.total;

  const aBest = raceNumbers.map(r => a.scores[String(r)]).sort((x,y)=>x-y);
  const bBest = raceNumbers.map(r => b.scores[String(r)]).sort((x,y)=>x-y);
  for (let i=0;i<aBest.length;i++) {
    if (aBest[i] !== bBest[i]) return aBest[i] - bBest[i];
  }

  for (let i=raceNumbers.length-1;i>=0;i--) {
    const r=String(raceNumbers[i]);
    if (a.scores[r] !== b.scores[r]) return a.scores[r] - b.scores[r];
  }
  return a.name.localeCompare(b.name,'pt');
}

function equalSportingScore(a,b,raceNumbers) {
  if (a.total !== b.total) return false;
  const aBest = raceNumbers.map(r => a.scores[String(r)]).sort((x,y)=>x-y);
  const bBest = raceNumbers.map(r => b.scores[String(r)]).sort((x,y)=>x-y);
  if (aBest.some((v,i)=>v!==bBest[i])) return false;
  for (let i=raceNumbers.length-1;i>=0;i--) {
    const r=String(raceNumbers[i]);
    if (a.scores[r] !== b.scores[r]) return false;
  }
  return true;
}

function rankRows(rows,raceNumbers) {
  if (!raceNumbers.length) {
    return rows.sort((a,b)=>a.name.localeCompare(b.name,'pt'))
      .map(r=>({...r,position:null,tied:false}));
  }
  rows.sort((a,b)=>compareStanding(a,b,raceNumbers));
  let previous=null, previousRank=null;
  return rows.map((row,index)=>{
    let rank=index+1, tied=false;
    if (previous && equalSportingScore(row,previous,raceNumbers)) {
      rank=previousRank; tied=true;
    }
    previous=row; previousRank=rank;
    return {...row,position:rank,tied};
  }).map((row,index,arr)=>({
    ...row,
    tied: row.tied || (index<arr.length-1 && arr[index+1].position===row.position)
  }));
}

async function copyRange(excel, sheet, cols, rows) {
  await excel.getByRole('tab', { name: new RegExp('Folha de cálculo ' + sheet, 'i') }).click();
  await page.waitForTimeout(750);

  const grid = excel.getByRole('textbox', { name: 'grid' });
  await grid.focus();
  await page.keyboard.press('Control+Home');
  await page.keyboard.press('ArrowRight'); // A1 -> B1
  for (let i=1;i<cols;i++) await page.keyboard.press('Shift+ArrowRight');
  for (let i=1;i<rows;i++) await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Control+c');
  await page.waitForTimeout(650);
  return await excel.evaluate(() => navigator.clipboard.readText());
}

function buildData(sheet1Text,sheet2Text,previous) {
  const sheet1 = parseTSV(sheet1Text);
  const sheet2 = parseTSV(sheet2Text);

  const teams = [];
  for (const row of sheet1) {
    const gm = String(row[0]||'').match(/^GRUPO\s+(\d+)$/i);
    const bm = String(row[2]||'').match(/^BARCO\s+(\d+)$/i);
    if (!gm || !bm || !row[1]) continue;
    teams.push({
      group:Number(gm[1]),
      boat:Number(bm[1]),
      name:String(row[1]).trim()
    });
  }

  if (teams.length !== EXPECTED_TEAM_COUNT) {
    throw new Error(`Safety stop: expected ${EXPECTED_TEAM_COUNT} teams, read ${teams.length}.`);
  }

  const uniqueSlots = new Set(teams.map(t=>`${t.group}:${t.boat}`));
  if (uniqueSlots.size !== EXPECTED_TEAM_COUNT) {
    throw new Error('Safety stop: duplicate group/boat allocation in Sheet1.');
  }

  const currentBoatMap = {};
  for (const t of teams) {
    currentBoatMap[String(t.group)] ??= {};
    currentBoatMap[String(t.group)][String(t.boat)] = t.name;
  }

  const sourceRows = [];
  for (const row of sheet2) {
    const m = String(row[0]||'').match(/^R(\d+)\s+G(\d+)$/i);
    if (!m) continue;
    const race=Number(m[1]), group=Number(m[2]);
    const entered=row.slice(1,7).filter(v=>String(v).trim()!=='');
    const order=completeOrder(row.slice(1,7));
    sourceRows.push({
      key:raceKey(race,group),
      race,group,
      entered:entered.length,
      complete:Boolean(order),
      finishOrder:order || entered.map(v=>Number(String(v).replace(/\D/g,''))).filter(Number.isFinite)
    });
  }

  const oldMaps = previous.raceBoatMaps || {};
  const raceBoatMaps = {...oldMaps};
  const races = [];

  for (const row of sourceRows.filter(r=>r.complete)) {
    const key=row.key;
    const map = raceBoatMaps[key] || currentBoatMap[String(row.group)];
    if (!map || Object.keys(map).length < 6) {
      throw new Error(`Safety stop: missing boat map for ${key}.`);
    }
    if (!raceBoatMaps[key]) raceBoatMaps[key] = JSON.parse(JSON.stringify(map));

    const results=row.finishOrder.map((boat,index)=>{
      const team=String(raceBoatMaps[key][String(boat)]||'').trim();
      if (!team) throw new Error(`Safety stop: no team mapped to G${row.group} boat ${boat} for ${key}.`);
      return {position:index+1,boat,team,points:index+1};
    });
    races.push({key,race:row.race,group:row.group,finishOrder:row.finishOrder,results});
  }

  races.sort((a,b)=>a.race-b.race || a.group-b.group);

  const allRaceNumbers=[...new Set(sourceRows.map(r=>r.race))].sort((a,b)=>a-b);
  const teamNames=[...new Set(teams.map(t=>t.name))];

  // An overall round only counts when every group has a complete result AND
  // those group results cover all 18 teams exactly once.
  const commonRaceNumbers=allRaceNumbers.filter(raceNo=>{
    const recs=EXPECTED_GROUPS.map(g=>races.find(r=>r.race===raceNo&&r.group===g));
    if (recs.some(r=>!r)) return false;
    const names=recs.flatMap(r=>r.results.map(x=>x.team));
    return names.length===EXPECTED_TEAM_COUNT && new Set(names).size===EXPECTED_TEAM_COUNT;
  });

  const scoreByTeamRace={};
  for (const race of races) {
    for (const x of race.results) {
      scoreByTeamRace[x.team] ??= {};
      scoreByTeamRace[x.team][String(race.race)] ??= {};
      scoreByTeamRace[x.team][String(race.race)][String(race.group)] = x.points;
    }
  }

  const overallRows=teamNames.map(name=>{
    const scores={};
    for (const raceNo of commonRaceNumbers) {
      const hits=Object.values(scoreByTeamRace[name]?.[String(raceNo)] || {});
      if (hits.length===1) scores[String(raceNo)]=hits[0];
    }
    const total=commonRaceNumbers.length
      ? commonRaceNumbers.reduce((s,r)=>s+Number(scores[String(r)]),0)
      : null;
    const current=teams.find(t=>t.name===name);
    const allScores={};
    for (const [r,groups] of Object.entries(scoreByTeamRace[name]||{})) {
      const vals=Object.values(groups);
      if (vals.length===1) allScores[r]=vals[0];
    }
    return {
      name,
      group:current?.group ?? null,
      boat:current?.boat ?? null,
      scores,
      allScores,
      total
    };
  });

  const overall=rankRows(overallRows,commonRaceNumbers);

  const groups={};
  for (const group of EXPECTED_GROUPS) {
    const groupRaces=races.filter(r=>r.group===group).map(r=>r.race).sort((a,b)=>a-b);
    const names=new Set(teams.filter(t=>t.group===group).map(t=>t.name));
    races.filter(r=>r.group===group).forEach(r=>r.results.forEach(x=>names.add(x.team)));

    const rows=[...names].map(name=>{
      const scores={};
      for (const raceNo of groupRaces) {
        const rec=races.find(r=>r.group===group&&r.race===raceNo);
        const result=rec?.results.find(x=>x.team===name);
        if (result) scores[String(raceNo)]=result.points;
      }
      const total=groupRaces.length
        ? groupRaces.reduce((s,r)=>s+Number(scores[String(r)]),0)
        : null;
      const current=teams.find(t=>t.group===group&&t.name===name);
      return {name,boat:current?.boat??null,scores,total};
    });

    groups[String(group)]={
      completedRaces:groupRaces,
      standings:rankRows(rows,groupRaces)
    };
  }

  const maxRace=Math.max(6,...allRaceNumbers);
  const pending=sourceRows
    .filter(r=>!r.complete && r.entered>0)
    .map(r=>({key:r.key,race:r.race,group:r.group,entered:r.entered}));

  return {
    schema:1,
    event:{
      name:'Circuito Nacional de Vela em Águas Interiores 2026',
      stage:'4.ª Etapa — Moura / Alqueva',
      dates:'17 e 18 de outubro de 2026',
      className:'K420',
      status:'Resultados provisórios'
    },
    source:{
      workbook:'Grupos 1 Moura.xlsx',
      readOnly:true,
      syncedAt:now,
      refreshMinutes:5
    },
    maxRace,
    teams,
    sourceRows,
    races,
    raceBoatMaps,
    commonRaceNumbers,
    overall,
    groups,
    pending
  };
}

function publish(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data,null,2)+'\n','utf8');
  console.log('Prepared', DATA_PATH);
}

try {
  browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
  const context=await browser.newContext({
    viewport:{width:1600,height:1000},
    locale:'pt-PT',
    permissions:['clipboard-read','clipboard-write'],
    userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36'
  });
  page=await context.newPage();
  page.setDefaultTimeout(25000);
  await page.goto(SOURCE_URL,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(12000);

  const excel=page.frames().find(f=>f.url().includes('excel.officeapps.live.com'));
  if(!excel) throw new Error('Excel frame not found.');

  const sheet1=await copyRange(excel,'Sheet1',3,20); // B1:D20
  const sheet2=await copyRange(excel,'Sheet2',7,19); // B1:H19
  const previous=loadPrevious();
  const data=buildData(sheet1,sheet2,previous);

  console.log('Read teams:',data.teams.length);
  console.log('Complete races:',data.races.map(r=>r.key).join(', ')||'none');
  console.log('Overall counted rounds:',data.commonRaceNumbers.join(', ')||'none');
  console.log('Pending:',data.pending.map(p=>p.key+' '+p.entered+'/6').join(', ')||'none');

  publish(data);
} catch (error) {
  console.error(error);
  try { if(page) await page.screenshot({path:DEBUG_PATH,fullPage:false}); } catch {}
  process.exitCode=1;
} finally {
  try { if(browser) await browser.close(); } catch {}
}
