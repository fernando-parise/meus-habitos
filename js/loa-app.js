// ========== LEI DA ATRACAO APP ==========
let loaAffirmations = [];
let loaDoneToday = new Set();
let loaTodayKey = '';

function getLoaTodayKey() {
  const d = new Date();
  return d.getFullYear() + '_' + d.getMonth() + '_' + d.getDate();
}

function initLoa() {
  if (!DATA.loa) DATA.loa = { affirmations: [], done: {} };
  if (!DATA.loa.affirmations || DATA.loa.affirmations.length === 0) {
    DATA.loa.affirmations = LOA_DEFAULTS.map(function(t, i) { return { id: i + 1, text: t }; });
    saveData();
  }
  loaAffirmations = DATA.loa.affirmations;
  loaTodayKey = getLoaTodayKey();
  const saved = DATA.loa.done[loaTodayKey];
  loaDoneToday = saved ? new Set(saved) : new Set();
  renderLoaHoje();
}

function switchLoaTab(tab, btn) {
  ['hoje', 'adicionar', 'gerenciar'].forEach(function(t) {
    document.getElementById('loa-' + t).style.display = t === tab ? '' : 'none';
  });
  btn.parentElement.querySelectorAll('.tab').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  if (tab === 'hoje') renderLoaHoje();
  if (tab === 'gerenciar') renderLoaManage();
}

function saveLoaState() {
  DATA.loa.affirmations = loaAffirmations;
  DATA.loa.done[loaTodayKey] = Array.from(loaDoneToday);
  saveData();
}

function renderLoaHoje() {
  const total = loaAffirmations.length;
  const done = loaDoneToday.size;
  const pct = total > 0 ? done / total : 0;
  const circumference = 2 * Math.PI * 65; // r=65

  // Ring
  const ring = document.getElementById('loaRingFill');
  ring.setAttribute('stroke-dasharray', circumference);
  ring.setAttribute('stroke-dashoffset', circumference * (1 - pct));
  document.getElementById('loaRingText').textContent = done + '/' + total;

  // Message
  var msgIdx;
  if (pct === 0) msgIdx = 0;
  else if (pct < 0.25) msgIdx = 1;
  else if (pct < 0.5) msgIdx = 2;
  else if (pct < 0.75) msgIdx = 3;
  else if (pct < 1) msgIdx = 4;
  else msgIdx = 5;
  document.getElementById('loaMsg').textContent = LOA_MSGS[msgIdx];

  // Congrats
  const congrats = document.getElementById('loaCongrats');
  if (done === total && total > 0) {
    congrats.classList.add('show');
  } else {
    congrats.classList.remove('show');
  }

  // List
  let html = '';
  loaAffirmations.forEach(function(a) {
    const isRead = loaDoneToday.has(a.id);
    html += '<div class="loa-item' + (isRead ? ' read' : '') + '" onclick="loaToggle(' + a.id + ')">';
    html += '<div class="loa-check' + (isRead ? ' checked' : '') + '"><div class="ck"' + (isRead ? '' : ' style="display:none"') + '></div></div>';
    html += '<span class="loa-text">' + a.text.replace(/\n/g, '<br>') + '</span>';
    html += '</div>';
  });
  document.getElementById('loaList').innerHTML = html;
}

function loaToggle(id) {
  if (loaDoneToday.has(id)) {
    loaDoneToday.delete(id);
  } else {
    loaDoneToday.add(id);
  }
  saveLoaState();
  renderLoaHoje();
}

function loaMarkAll() {
  loaAffirmations.forEach(function(a) { loaDoneToday.add(a.id); });
  saveLoaState();
  renderLoaHoje();
}

function loaResetDay() {
  loaDoneToday.clear();
  saveLoaState();
  renderLoaHoje();
}

function loaAddAffirmation() {
  const ta = document.getElementById('loaNewText');
  const text = ta.value.trim();
  if (!text) { alert('Escreva a afirmacao primeiro.'); return; }
  const maxId = loaAffirmations.reduce(function(m, a) { return Math.max(m, a.id); }, 0);
  loaAffirmations.push({ id: maxId + 1, text: text });
  ta.value = '';
  saveLoaState();
  alert('Afirmacao adicionada!');
}

function loaDeleteAffirmation(id) {
  if (!confirm('Remover esta afirmacao?')) return;
  loaAffirmations = loaAffirmations.filter(function(a) { return a.id !== id; });
  loaDoneToday.delete(id);
  DATA.loa.affirmations = loaAffirmations;
  saveLoaState();
  renderLoaManage();
  renderLoaHoje();
}

function renderLoaManage() {
  document.getElementById('loaCount').textContent = loaAffirmations.length;
  let html = '';
  loaAffirmations.forEach(function(a, i) {
    html += '<div class="loa-manage-item">';
    html += '<span class="loa-manage-num">' + (i + 1) + '.</span>';
    html += '<span class="loa-manage-text">' + a.text.replace(/\n/g, '<br>') + '</span>';
    html += '<button class="loa-manage-del" onclick="loaDeleteAffirmation(' + a.id + ')">x</button>';
    html += '</div>';
  });
  document.getElementById('loaManageList').innerHTML = html;
}
