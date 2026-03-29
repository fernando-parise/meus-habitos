// ========== MAIN - SHARED STATE & INIT ==========
let DATA = { project_start: '', usage_start: '', days: {}, habits: [], bible: {}, loa: {} };
let cur = new Date(); cur.setHours(0, 0, 0, 0);
let calM = new Date(cur.getFullYear(), cur.getMonth(), 1);
let repM = new Date(cur.getFullYear(), cur.getMonth(), 1);
let saveTimer = null;
let saving = false;

// ========== API ==========
async function loadData() {
  try {
    if (GH.isLocal()) {
      var r = await fetch('/api/data');
      DATA = await r.json();
    } else {
      if (!GH.init()) { showSetup(); return; }
      DATA = await GH.load();
    }
  } catch (e) {
    console.error('Erro:', e);
    if (!GH.isLocal()) { showSetup(); return; }
    DATA = { project_start: '', usage_start: '', days: {}, habits: [], bible: {}, loa: {} };
  }
  if (!DATA.project_start) { var t = new Date(); t.setHours(0, 0, 0, 0); DATA.project_start = dk(t); }
  if (!DATA.usage_start) { var t = new Date(); t.setHours(0, 0, 0, 0); DATA.usage_start = dk(t); }
  if (!DATA.habits || DATA.habits.length === 0) { DATA.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS)); saveData(); }
  if (!DATA.bible) DATA.bible = { currentDayIdx: 0, quickNote: '', diary: '' };
  if (!DATA.loa) DATA.loa = { affirmations: [], done: {} };
  if (!DATA.hobbies) DATA.hobbies = {};

  hideSetup();
  checkMigration();
  renderDaily();
  initBible();
  initLoa();
  initHobbies();
}

function saveData() {
  if (saveTimer) clearTimeout(saveTimer);
  var delay = GH.isLocal() ? 300 : 3000;
  saveTimer = setTimeout(async function() {
    if (saving) return;
    saving = true;
    try {
      if (GH.isLocal()) {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(DATA, null, 2)
        });
      } else {
        await GH.save(DATA);
      }
    } catch(e) { console.error('Erro ao salvar:', e); }
    saving = false;
  }, delay);
}

// ========== GITHUB SETUP ==========
function showSetup() {
  document.getElementById('gh-setup').style.display = '';
  document.getElementById('app-wrap').style.display = 'none';
}

function hideSetup() {
  document.getElementById('gh-setup').style.display = 'none';
  document.getElementById('app-wrap').style.display = '';
}

async function ghConnect() {
  var token = document.getElementById('gh-token').value.trim();
  var gistId = document.getElementById('gh-gist').value.trim();
  var status = document.getElementById('gh-status');
  if (!token) { status.textContent = 'Preencha o token'; return; }

  GH.token = token;

  if (!gistId) {
    // Create new private Gist
    status.textContent = 'Criando Gist privado...';
    try {
      var empty = { project_start: '', usage_start: '', days: {}, habits: [], bible: {}, loa: {} };
      gistId = await GH.createGist(token, empty);
      status.textContent = 'Gist criado! ID: ' + gistId;
    } catch(e) { status.textContent = 'Erro ao criar Gist: ' + e.message; return; }
  } else {
    status.textContent = 'Testando conexao...';
    try {
      var ok = await GH.test(token, gistId);
      if (!ok) { status.textContent = 'Falha: verifique token e Gist ID'; return; }
    } catch(e) { status.textContent = 'Erro: ' + e.message; return; }
  }

  GH.gistId = gistId;
  GH.saveConfig();
  status.textContent = '';
  loadData();
}

function ghDisconnect() {
  GH.clearConfig();
  showSetup();
}

// ========== APP NAVIGATION ==========
function switchApp(app, btn) {
  ['habitos', 'biblia', 'loa', 'hobbies'].forEach(function(a) {
    document.getElementById('app-' + a).style.display = a === app ? '' : 'none';
  });
  document.querySelectorAll('.app-nav-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');

  if (app === 'habitos') renderDaily();
  if (app === 'biblia') renderBibleHoje();
  if (app === 'loa') renderLoaHoje();
  if (app === 'hobbies') renderTiroPainel();
}

// ========== INIT ==========
loadData();
