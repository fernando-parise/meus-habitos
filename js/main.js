// ========== MAIN - SHARED STATE & INIT ==========
let DATA = { project_start: '', usage_start: '', days: {}, habits: [], bible: {}, loa: {} };
let cur = new Date(); cur.setHours(0, 0, 0, 0);
let calM = new Date(cur.getFullYear(), cur.getMonth(), 1);
let repM = new Date(cur.getFullYear(), cur.getMonth(), 1);
let saveTimer = null;

// ========== API ==========
async function loadData() {
  try {
    const r = await fetch('/api/data');
    DATA = await r.json();
  } catch (e) {
    console.error('Erro:', e);
    DATA = { project_start: '', usage_start: '', days: {}, habits: [], bible: {}, loa: {} };
  }
  if (!DATA.project_start) { const t = new Date(); t.setHours(0, 0, 0, 0); DATA.project_start = dk(t); }
  if (!DATA.usage_start) { const t = new Date(); t.setHours(0, 0, 0, 0); DATA.usage_start = dk(t); }
  if (!DATA.habits || DATA.habits.length === 0) { DATA.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS)); saveData(); }
  if (!DATA.bible) DATA.bible = { currentDayIdx: 0, quickNote: '', diary: '' };
  if (!DATA.loa) DATA.loa = { affirmations: [], done: {} };

  checkMigration();
  renderDaily();
  initBible();
  initLoa();
}

function saveData() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(function() {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DATA, null, 2)
    }).catch(function(e) { console.error('Erro ao salvar:', e); });
  }, 300);
}

// ========== APP NAVIGATION ==========
function switchApp(app, btn) {
  ['habitos', 'biblia', 'loa'].forEach(function(a) {
    document.getElementById('app-' + a).style.display = a === app ? '' : 'none';
  });
  document.querySelectorAll('.app-nav-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');

  if (app === 'habitos') renderDaily();
  if (app === 'biblia') renderBibleHoje();
  if (app === 'loa') renderLoaHoje();
}

// ========== INIT ==========
loadData();
