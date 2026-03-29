// ========== ESTUDO BIBLICO APP ==========
let bibleViewingIdx = 0;
let BIBLE = null; // loaded from biblia-completa.json

async function initBible() {
  if (!DATA.bible) DATA.bible = { currentDayIdx: 0, quickNote: '', diary: '' };
  bibleViewingIdx = DATA.bible.currentDayIdx || 0;
  // will clamp after BIBLE loads

  // Load full bible data
  if (!BIBLE) {
    try {
      const r = await fetch('js/biblia-completa.json');
      BIBLE = await r.json();
    } catch (e) {
      console.error('Erro ao carregar biblia:', e);
      return;
    }
  }
  if (bibleViewingIdx >= BIBLE.plan.length) bibleViewingIdx = BIBLE.plan.length - 1;
  renderBibleHoje();
}

function switchBibleTab(tab, btn) {
  ['hoje', 'plano', 'notas'].forEach(function(t) {
    document.getElementById('bible-' + t).style.display = t === tab ? '' : 'none';
  });
  btn.parentElement.querySelectorAll('.tab').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  if (tab === 'hoje') renderBibleHoje();
  if (tab === 'plano') renderBiblePlan();
  if (tab === 'notas') renderBibleNotas();
}

function renderBibleHoje() {
  if (!BIBLE) return;
  const idx = bibleViewingIdx;
  const plan = BIBLE.plan;
  if (!plan || !plan[idx]) return;
  const entry = plan[idx];

  const currentIdx = DATA.bible.currentDayIdx || 0;
  const isDone = idx < currentIdx;
  const isCurrent = idx === currentIdx;

  // Verse card - show first verse of first chapter of the day
  const firstCh = entry.chapters[0];
  const book = BIBLE.books[firstCh.bookIdx];
  const verses = book.chapters[firstCh.chapter - 1];
  var firstVerse = verses && verses[0] ? verses[0][1] : '';

  document.getElementById('bibleVerseRef').textContent = book.name + ' ' + firstCh.chapter + ':1';
  document.getElementById('bibleVerseText').textContent = firstVerse;
  document.getElementById('bibleTheme').textContent = 'Dia ' + entry.day + ' \u2014 ' + entry.label;

  // Info
  document.getElementById('bibleBook').textContent = entry.label;
  document.getElementById('bibleCh').textContent = entry.chapters.length + ' capitulos';
  document.getElementById('bibleThemeInfo').textContent = entry.label;
  document.getElementById('bibleDayInfo').textContent = 'Dia ' + entry.day + ' de ' + BIBLE.plan.length + '';

  // Reader - show all chapters for this day
  var readerHtml = '';
  entry.chapters.forEach(function(ch) {
    var bk = BIBLE.books[ch.bookIdx];
    var chVerses = bk.chapters[ch.chapter - 1];
    readerHtml += '<div style="margin-top:16px;margin-bottom:8px;font-size:13px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.05em">' + bk.name + ' ' + ch.chapter + '</div>';
    if (chVerses) {
      chVerses.forEach(function(v) {
        readerHtml += '<div class="bible-verse"><span class="bible-verse-num">' + v[0] + '</span>' + v[1] + '</div>';
      });
    }
  });
  document.getElementById('bibleReaderContent').innerHTML = readerHtml;
  document.getElementById('bibleReaderContent').classList.remove('open');
  document.getElementById('bibleReaderArrow').textContent = '\u25B6';

  // Reflection - not available for full bible plan, show reading summary
  document.getElementById('bibleRefl').textContent = 'Leitura do dia: ' + entry.label + ' (' + entry.chapters.length + ' capitulos)';
  document.getElementById('bibleQuest').textContent = '\uD83D\uDCAD O que Deus falou com voce hoje atraves dessa leitura?';

  // Quick note
  var noteKey = 'note_day_' + entry.day;
  var savedNote = (DATA.bible[noteKey]) || '';
  document.getElementById('bibleQuickNote').value = savedNote;

  // Complete button
  var btn = document.getElementById('bibleCompleteBtn');
  if (isDone) {
    btn.textContent = '\u2714 Dia ' + entry.day + ' concluido';
    btn.className = 'bible-complete-btn completed';
    btn.onclick = null;
  } else if (isCurrent) {
    btn.textContent = 'Concluir leitura do dia ' + entry.day;
    btn.className = 'bible-complete-btn';
    btn.onclick = completeBibleDay;
  } else {
    btn.textContent = '\uD83D\uDD12 Dia bloqueado';
    btn.className = 'bible-complete-btn completed';
    btn.onclick = null;
  }
}

function toggleBibleReader() {
  var content = document.getElementById('bibleReaderContent');
  var arrow = document.getElementById('bibleReaderArrow');
  if (content.classList.contains('open')) {
    content.classList.remove('open');
    arrow.textContent = '\u25B6';
  } else {
    content.classList.add('open');
    arrow.textContent = '\u25BC';
  }
}

function saveBibleNote() {
  if (!BIBLE) return;
  var idx = bibleViewingIdx;
  var entry = BIBLE.plan[idx];
  if (!entry) return;
  var noteKey = 'note_day_' + entry.day;
  DATA.bible[noteKey] = document.getElementById('bibleQuickNote').value;
  saveData();
  alert('Anotacao salva!');
}

function completeBibleDay() {
  if (!BIBLE) return;
  var currentIdx = DATA.bible.currentDayIdx || 0;
  if (bibleViewingIdx !== currentIdx) return;
  var totalDays = BIBLE.plan.length;
  if (currentIdx >= totalDays - 1) {
    DATA.bible.currentDayIdx = totalDays;
    saveData();
    alert('Parabens! Voce concluiu toda a Biblia em ' + BIBLE.plan.length + ' dias!');
  } else {
    DATA.bible.currentDayIdx = currentIdx + 1;
    bibleViewingIdx = currentIdx + 1;
    saveData();
  }
  renderBibleHoje();
}

function renderBiblePlan() {
  if (!BIBLE) return;
  var plan = BIBLE.plan;
  var currentIdx = DATA.bible.currentDayIdx || 0;
  var completed = Math.min(currentIdx, plan.length);
  var pct = Math.round((completed / plan.length) * 100);

  document.getElementById('biblePlanProgress').textContent = completed + ' de ' + plan.length;
  document.getElementById('biblePlanPct').textContent = pct + '%';
  document.getElementById('biblePlanFill').style.width = pct + '%';

  var html = '';
  plan.forEach(function(entry, idx) {
    var isDone = idx < currentIdx;
    var isCurrent = idx === currentIdx;
    var isLocked = idx > currentIdx;

    var cls = 'plan-item';
    if (isCurrent) cls += ' current';
    if (isLocked) cls += ' locked';

    var dotCls = 'plan-dot';
    if (isDone) dotCls += ' done';
    if (isCurrent) dotCls += ' current';

    var clickHandler = isLocked ? '' : 'onclick="goToBibleDay(' + idx + ')"';

    html += '<div class="' + cls + '" ' + clickHandler + '>';
    html += '<div class="' + dotCls + '">' + (isDone ? '\u2714' : entry.day) + '</div>';
    html += '<div class="plan-info"><div class="plan-book">' + entry.label + '</div>';
    html += '<div class="plan-theme">' + entry.chapters.length + ' capitulos</div></div>';
    html += '</div>';
  });

  document.getElementById('biblePlanList').innerHTML = html;
}

function goToBibleDay(idx) {
  bibleViewingIdx = idx;
  var tabs = document.querySelectorAll('.bible-tabs .tab');
  tabs.forEach(function(b) { b.classList.remove('active'); });
  tabs[0].classList.add('active');
  ['hoje', 'plano', 'notas'].forEach(function(t) {
    document.getElementById('bible-' + t).style.display = t === 'hoje' ? '' : 'none';
  });
  renderBibleHoje();
}

function renderBibleNotas() {
  document.getElementById('bibleDiary').value = DATA.bible.diary || '';
}

function saveBibleDiary() {
  DATA.bible.diary = document.getElementById('bibleDiary').value;
  saveData();
  alert('Diario salvo!');
}
