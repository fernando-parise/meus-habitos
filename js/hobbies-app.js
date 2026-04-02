// ========== HOBBIES APP - TIRO HIGH PERFORMANCE ==========

// ========== DATE PICKER COMPONENT ==========
var _dpActive = null;
var _dpCallback = null;
var _dpMonth = null;

function dpOpen(inputId) {
  var val = document.getElementById(inputId).value || dk(new Date());
  var parts = val.split('-');
  _dpMonth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
  _dpActive = inputId;
  dpRender(val);
}

function dpRender(selected) {
  var old = document.getElementById('dp-overlay');
  if (old) old.remove();

  var today = dk(new Date());
  var m = _dpMonth;
  var mNames = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var dNames = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];

  var overlay = document.createElement('div');
  overlay.id = 'dp-overlay';
  overlay.onclick = function(e) { if (e.target === overlay) dpClose(); };

  var box = document.createElement('div');
  box.className = 'dp-box';

  // Header
  var h = '<div class="dp-header">';
  h += '<button class="dp-nav" onclick="dpPrevMonth()">&lt;</button>';
  h += '<span class="dp-title">' + mNames[m.getMonth()] + ' ' + m.getFullYear() + '</span>';
  h += '<button class="dp-nav" onclick="dpNextMonth()">&gt;</button>';
  h += '</div>';

  // Day names
  h += '<div class="dp-days">';
  dNames.forEach(function(d) { h += '<div class="dp-dn">' + d + '</div>'; });
  h += '</div>';

  // Grid
  h += '<div class="dp-grid">';
  var fd = new Date(m.getFullYear(), m.getMonth(), 1);
  var ld = new Date(m.getFullYear(), m.getMonth() + 1, 0);
  for (var i = 0; i < fd.getDay(); i++) h += '<div class="dp-cell"></div>';
  for (var d = 1; d <= ld.getDate(); d++) {
    var iso = m.getFullYear() + '-' + String(m.getMonth() + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    var cls = 'dp-cell dp-day';
    if (iso === selected) cls += ' dp-sel';
    if (iso === today) cls += ' dp-today';
    h += '<div class="' + cls + '" onclick="dpSelect(\'' + iso + '\')">' + d + '</div>';
  }
  h += '</div>';

  // Today button
  h += '<div class="dp-footer">';
  h += '<button class="dp-today-btn" onclick="dpSelect(\'' + today + '\')">Hoje</button>';
  h += '</div>';

  box.innerHTML = h;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function dpSelect(iso) {
  if (_dpActive) {
    document.getElementById(_dpActive).value = iso;
    var display = document.getElementById(_dpActive + '-display');
    if (display) display.textContent = dpFormatBR(iso);
  }
  dpClose();
}

function dpClose() {
  var el = document.getElementById('dp-overlay');
  if (el) el.remove();
  _dpActive = null;
}

function dpPrevMonth() {
  _dpMonth = new Date(_dpMonth.getFullYear(), _dpMonth.getMonth() - 1, 1);
  var val = _dpActive ? document.getElementById(_dpActive).value : '';
  dpRender(val);
}

function dpNextMonth() {
  _dpMonth = new Date(_dpMonth.getFullYear(), _dpMonth.getMonth() + 1, 1);
  var val = _dpActive ? document.getElementById(_dpActive).value : '';
  dpRender(val);
}

function dpFormatBR(iso) {
  if (!iso) return '';
  var p = iso.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

function dpInput(id, value) {
  var display = dpFormatBR(value || dk(new Date()));
  var val = value || dk(new Date());
  return '<input type="hidden" id="' + id + '" value="' + val + '">' +
    '<div id="' + id + '-display" class="dp-input" onclick="dpOpen(\'' + id + '\')">' + display + '</div>';
}

var TIRO_TIPOS_HAB = {
  treino: { label: 'Treino', color: 'var(--green)' },
  curso: { label: 'Curso', color: 'var(--blue)' },
  camp_interno: { label: 'Camp. Interno', color: 'var(--amber)' },
  camp_nacional: { label: 'Camp. Nacional', color: 'var(--gold)' }
};

var TIRO_ARMAS_DEFAULT = [
  { id: 1, nome: 'Pistola 9mm', tipo: 'curta', calibre: '9mm', minha: true }
];

function initHobbies() {
  if (!DATA.hobbies) DATA.hobbies = {};
  if (!DATA.hobbies.tirohp) {
    DATA.hobbies.tirohp = {
      config: { cotaAnual: 500, calibre: '9mm' },
      armas: JSON.parse(JSON.stringify(TIRO_ARMAS_DEFAULT)),
      compras: [],
      habitualidades: []
    };
  }
  var t = DATA.hobbies.tirohp;
  if (!t.config) t.config = { cotaAnual: 500, calibre: '9mm' };
  if (!t.armas) t.armas = JSON.parse(JSON.stringify(TIRO_ARMAS_DEFAULT));
  if (!t.compras) t.compras = [];
  if (!t.habitualidades) t.habitualidades = [];
}

// ========== HOBBY NAVIGATION ==========
function switchHobby(hobby) {
  document.querySelectorAll('.hobby-panel').forEach(function(el) { el.style.display = 'none'; });
  var el = document.getElementById('hobby-' + hobby);
  if (el) el.style.display = '';
  document.querySelectorAll('.hobby-menu-btn').forEach(function(b) { b.classList.remove('active'); });
  event.target.classList.add('active');
  if (hobby === 'tirohp') renderTiroHabitualidade();
}

function switchTiroTab(tab, btn) {
  ['painel', 'municao', 'habitualidade', 'armas', 'relatorio'].forEach(function(t) {
    document.getElementById('tiro-' + t).style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('#hobby-tirohp .tab').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  if (tab === 'painel') renderTiroPainel();
  if (tab === 'municao') renderTiroMunicao();
  if (tab === 'habitualidade') renderTiroHabitualidade();
  if (tab === 'armas') renderTiroArmas();
  if (tab === 'relatorio') renderTiroRelatorio();
}

// ========== CALCULOS ==========
function tiroCalcCota() {
  var t = DATA.hobbies.tirohp;
  var ano = new Date().getFullYear();
  var compradas = 0;
  t.compras.forEach(function(c) {
    if (c.data && c.data.substring(0, 4) === String(ano)) compradas += c.qtd;
  });
  return { cotaAnual: t.config.cotaAnual, compradas: compradas, restante: t.config.cotaAnual - compradas };
}

function tiroCalcEstoque() {
  var t = DATA.hobbies.tirohp;
  var treino = 0, defesa = 0, gastas = 0;
  t.compras.forEach(function(c) {
    if (c.tipo === 'treino') treino += c.qtd;
    else if (c.tipo === 'defesa') defesa += c.qtd;
  });
  t.habitualidades.forEach(function(h) { if (!h.semDesconto) gastas += (h.munMinhas || 0); });
  treino = Math.max(0, treino - gastas);
  return { treino: treino, defesa: defesa, total: treino + defesa };
}

function tiroNextId(arr) {
  return arr.reduce(function(m, item) { return Math.max(m, item.id || 0); }, 0) + 1;
}

// ========== PAINEL ==========
function renderTiroPainel() {
  var cota = tiroCalcCota();
  var est = tiroCalcEstoque();
  var t = DATA.hobbies.tirohp;
  var pct = cota.cotaAnual > 0 ? Math.min(100, Math.round(cota.compradas / cota.cotaAnual * 100)) : 0;

  var html = '';
  // Cota anual
  html += '<div class="section"><div class="stitle">Cota Anual ' + new Date().getFullYear() + '</div>';
  html += '<div class="card" style="padding:16px;">';
  html += '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">';
  html += '<span style="font-size:13px;color:var(--text2);">Compradas: <b style="color:var(--text)">' + cota.compradas + '</b></span>';
  html += '<span style="font-size:13px;color:var(--text2);">Restante: <b style="color:' + (cota.restante > 100 ? 'var(--green)' : cota.restante > 0 ? 'var(--amber)' : 'var(--red)') + '">' + cota.restante + '</b></span>';
  html += '</div>';
  html += '<div style="background:var(--bg3);border-radius:6px;height:10px;overflow:hidden;">';
  html += '<div style="background:var(--green);height:100%;width:' + pct + '%;border-radius:6px;transition:width .3s;"></div>';
  html += '</div>';
  html += '<div style="text-align:center;font-size:11px;color:var(--text3);margin-top:6px;">' + pct + '% da cota de ' + cota.cotaAnual + '</div>';
  html += '</div></div>';

  // Estoque
  html += '<div class="section"><div class="stitle">Estoque</div>';
  html += '<div style="display:flex;gap:8px;">';
  html += '<div class="card" style="flex:1;padding:16px;text-align:center;">';
  html += '<div style="font-size:24px;font-weight:700;color:var(--green);">' + est.treino + '</div>';
  html += '<div style="font-size:12px;color:var(--text3);">Treino</div></div>';
  html += '<div class="card" style="flex:1;padding:16px;text-align:center;">';
  html += '<div style="font-size:24px;font-weight:700;color:var(--amber);">' + est.defesa + '</div>';
  html += '<div style="font-size:12px;color:var(--text3);">Defesa</div></div>';
  html += '<div class="card" style="flex:1;padding:16px;text-align:center;">';
  html += '<div style="font-size:24px;font-weight:700;color:var(--text);">' + est.total + '</div>';
  html += '<div style="font-size:12px;color:var(--text3);">Total</div></div>';
  html += '</div></div>';

  // Ultimas habitualidades
  html += '<div class="section"><div class="stitle">Ultimas atividades</div>';
  if (t.habitualidades.length === 0) {
    html += '<div class="card" style="padding:20px;text-align:center;color:var(--text3);font-size:13px;">Nenhuma atividade registrada</div>';
  } else {
    html += '<div class="card">';
    var recentes = t.habitualidades.slice().sort(function(a, b) { return b.data.localeCompare(a.data); }).slice(0, 5);
    recentes.forEach(function(h) {
      var info = TIRO_TIPOS_HAB[h.tipo] || { label: h.tipo, color: 'var(--text2)' };
      var mun = [];
      if (h.munMinhas > 0) mun.push(h.munMinhas + ' minhas');
      if (h.munClube > 0) mun.push(h.munClube + ' clube');
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:0.5px solid var(--border);">';
      html += '<div style="font-size:12px;color:var(--text3);min-width:70px;">' + formatDateBR(h.data) + '</div>';
      html += '<span style="font-size:11px;padding:2px 8px;border-radius:4px;background:' + info.color + '22;color:' + info.color + ';font-weight:600;">' + info.label + '</span>';
      if (mun.length > 0) html += '<span style="font-size:12px;color:var(--text2);">' + mun.join(' + ') + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  document.getElementById('tiro-painel-content').innerHTML = html;
}

function formatDateBR(d) {
  if (!d) return '';
  var p = d.split('-');
  return p[2] + '/' + p[1];
}

// ========== MUNICAO ==========
function renderTiroMunicao() {
  var t = DATA.hobbies.tirohp;
  var est = tiroCalcEstoque();

  var html = '';
  // Estoque resumo
  html += '<div style="display:flex;gap:8px;margin-bottom:16px;">';
  html += '<div class="card" style="flex:1;padding:12px;text-align:center;"><span style="font-size:18px;font-weight:700;color:var(--green);">' + est.treino + '</span><div style="font-size:11px;color:var(--text3);">Treino</div></div>';
  html += '<div class="card" style="flex:1;padding:12px;text-align:center;"><span style="font-size:18px;font-weight:700;color:var(--amber);">' + est.defesa + '</span><div style="font-size:11px;color:var(--text3);">Defesa</div></div>';
  html += '</div>';

  // Form nova compra
  html += '<div class="section"><div class="stitle">Nova compra</div>';
  html += '<div class="card" style="padding:14px;">';
  html += '<div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Data</label>';
  html += dpInput('tiro-mun-data', dk(new Date())) + '</div>';
  html += '<div style="display:flex;gap:8px;margin-bottom:10px;">';
  html += '<div style="flex:1;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Quantidade</label>';
  html += '<input type="number" id="tiro-mun-qtd" min="1" placeholder="50" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;"></div>';
  html += '<div style="flex:1;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Tipo</label>';
  html += '<select id="tiro-mun-tipo" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;">';
  html += '<option value="treino">Treino</option><option value="defesa">Defesa</option></select></div>';
  html += '</div>';
  html += '<div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Obs (opcional)</label>';
  html += '<input type="text" id="tiro-mun-obs" placeholder="" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;"></div>';
  html += '<button onclick="tiroAddCompra()" style="width:100%;padding:10px;border-radius:8px;border:none;background:var(--green);color:#fff;font-size:13px;font-weight:600;cursor:pointer;">Adicionar compra</button>';
  html += '</div></div>';

  // Historico
  html += '<div class="section"><div class="stitle">Historico de compras</div>';
  if (t.compras.length === 0) {
    html += '<div class="card" style="padding:20px;text-align:center;color:var(--text3);font-size:13px;">Nenhuma compra registrada</div>';
  } else {
    html += '<div class="card">';
    t.compras.slice().sort(function(a, b) { return b.data.localeCompare(a.data); }).forEach(function(c) {
      var cor = c.tipo === 'treino' ? 'var(--green)' : 'var(--amber)';
      html += '<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:0.5px solid var(--border);">';
      html += '<div style="font-size:12px;color:var(--text3);min-width:50px;">' + formatDateBR(c.data) + '</div>';
      html += '<span style="font-size:15px;font-weight:600;color:' + cor + ';">' + c.qtd + '</span>';
      html += '<span style="font-size:11px;padding:2px 6px;border-radius:4px;background:' + cor + '22;color:' + cor + ';">' + c.tipo + '</span>';
      if (c.obs) html += '<span style="font-size:12px;color:var(--text3);flex:1;">' + c.obs + '</span>';
      html += '<button onclick="tiroDeleteCompra(' + c.id + ')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:4px;">x</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  document.getElementById('tiro-municao-content').innerHTML = html;
}

function tiroAddCompra() {
  var dataVal = document.getElementById('tiro-mun-data').value;
  var qtd = parseInt(document.getElementById('tiro-mun-qtd').value);
  var tipo = document.getElementById('tiro-mun-tipo').value;
  var obs = document.getElementById('tiro-mun-obs').value.trim();
  if (!dataVal) { alert('Informe a data.'); return; }
  if (!qtd || qtd <= 0) { alert('Informe a quantidade.'); return; }
  var t = DATA.hobbies.tirohp;
  t.compras.push({
    id: tiroNextId(t.compras),
    data: dataVal,
    qtd: qtd,
    tipo: tipo,
    obs: obs
  });
  saveData();
  renderTiroMunicao();
}

function tiroDeleteCompra(id) {
  if (!confirm('Remover esta compra?')) return;
  var t = DATA.hobbies.tirohp;
  t.compras = t.compras.filter(function(c) { return c.id !== id; });
  saveData();
  renderTiroMunicao();
}

// ========== HABITUALIDADE ==========
function renderTiroHabitualidade() {
  var t = DATA.hobbies.tirohp;

  var html = '';

  // Import box
  html += '<div class="section">';
  html += '<div class="card" style="padding:16px;border-color:var(--purple-dim);border-width:1px;">';
  html += '<div style="font-size:13px;font-weight:600;color:var(--purple);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px;">Importar habitualidade do Claude</div>';
  html += '<div style="font-size:12px;color:var(--text3);margin-bottom:12px;">Cole aqui o codigo que o Claude vai te dar. Aceita varias linhas de uma vez!<br>Formato: TIRO:data|tipo|munMinhas|munClube|armaIds|obs</div>';
  html += '<textarea id="tiro-import-input" rows="3" placeholder="Cole um ou mais codigos TIRO: aqui..." style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:13px;font-family:monospace;resize:vertical;margin-bottom:10px;"></textarea>';
  html += '<button onclick="tiroParseImport()" style="width:100%;padding:12px;border-radius:8px;border:none;background:var(--purple);color:#fff;font-size:14px;font-weight:600;cursor:pointer;">Importar e verificar</button>';
  html += '</div></div>';

  // Form
  html += '<div class="section"><div class="stitle">Registrar ida ao clube</div>';
  html += '<div class="card" style="padding:14px;">';
  // Data
  html += '<div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Data</label>';
  html += dpInput('tiro-hab-data', dk(new Date())) + '</div>';
  // Tipo
  html += '<div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Tipo</label>';
  html += '<select id="tiro-hab-tipo" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;">';
  html += '<option value="treino">Treino</option><option value="curso">Curso</option>';
  html += '<option value="camp_interno">Campeonato Interno</option><option value="camp_nacional">Campeonato Nacional</option>';
  html += '</select></div>';
  // Municao
  html += '<div style="display:flex;gap:8px;margin-bottom:10px;">';
  html += '<div style="flex:1;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Mun. minhas</label>';
  html += '<input type="number" id="tiro-hab-minhas" min="0" value="0" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;"></div>';
  html += '<div style="flex:1;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Mun. clube</label>';
  html += '<input type="number" id="tiro-hab-clube" min="0" value="0" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;"></div>';
  html += '</div>';
  // Armas
  html += '<div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Armas usadas</label>';
  html += '<div id="tiro-hab-armas-list" style="display:flex;flex-wrap:wrap;gap:6px;">';
  (t.armas || []).forEach(function(a) {
    var label = a.nome + (a.minha ? '' : ' (clube)');
    html += '<label style="display:flex;align-items:center;gap:5px;padding:6px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);cursor:pointer;font-size:13px;color:var(--text2);">';
    html += '<input type="checkbox" class="tiro-hab-arma-cb" value="' + a.id + '" style="accent-color:var(--green);"> ' + label + '</label>';
  });
  html += '</div>';
  html += '<div style="margin-top:6px;"><a href="javascript:void(0)" onclick="switchTiroTab(\'armas\',document.querySelector(\'#hobby-tirohp .tab:last-child\'))" style="font-size:11px;color:var(--purple);">+ Gerenciar armas</a></div>';
  html += '</div>';
  // Obs
  html += '<div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Obs (opcional)</label>';
  html += '<input type="text" id="tiro-hab-obs" placeholder="" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;"></div>';
  // Nao descontar
  html += '<div style="margin-bottom:12px;"><label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--amber);cursor:pointer;">';
  html += '<input type="checkbox" id="tiro-hab-semdesc" style="accent-color:var(--amber);"> Nao descontar do estoque (registro retroativo)</label></div>';
  html += '<button onclick="tiroAddHabitualidade()" style="width:100%;padding:10px;border-radius:8px;border:none;background:var(--green);color:#fff;font-size:13px;font-weight:600;cursor:pointer;">Registrar</button>';
  html += '</div></div>';

  // Historico
  html += '<div class="section"><div class="stitle">Historico</div>';
  if (t.habitualidades.length === 0) {
    html += '<div class="card" style="padding:20px;text-align:center;color:var(--text3);font-size:13px;">Nenhuma atividade registrada</div>';
  } else {
    html += '<div class="card">';
    t.habitualidades.slice().sort(function(a, b) { return b.data.localeCompare(a.data); }).forEach(function(h) {
      var info = TIRO_TIPOS_HAB[h.tipo] || { label: h.tipo, color: 'var(--text2)' };
      var detalhes = [];
      if (h.munMinhas > 0) detalhes.push(h.munMinhas + ' mun. minhas');
      if (h.munClube > 0) detalhes.push(h.munClube + ' mun. clube');
      if (h.armas && h.armas.length > 0) {
        var nomes = h.armas.map(function(aid) { return tiroGetArmaName(aid); }).join(', ');
        detalhes.push(nomes);
      }
      if (h.armasClube) detalhes.push(h.armasClube); // backward compat
      html += '<div style="padding:12px 14px;border-bottom:0.5px solid var(--border);">';
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">';
      html += '<div style="font-size:12px;color:var(--text3);min-width:50px;">' + formatDateBR(h.data) + '</div>';
      html += '<span style="font-size:11px;padding:2px 8px;border-radius:4px;background:' + info.color + '22;color:' + info.color + ';font-weight:600;">' + info.label + '</span>';
      html += '<button onclick="tiroDeleteHabitualidade(' + h.id + ')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:4px;margin-left:auto;">x</button>';
      html += '</div>';
      if (detalhes.length > 0) html += '<div style="font-size:12px;color:var(--text2);padding-left:62px;">' + detalhes.join(' &middot; ') + '</div>';
      if (h.obs) html += '<div style="font-size:12px;color:var(--text3);padding-left:62px;font-style:italic;">' + h.obs + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  document.getElementById('tiro-habitualidade-content').innerHTML = html;
}

function tiroAddHabitualidade() {
  var dataVal = document.getElementById('tiro-hab-data').value;
  var tipo = document.getElementById('tiro-hab-tipo').value;
  var munMinhas = parseInt(document.getElementById('tiro-hab-minhas').value) || 0;
  var munClube = parseInt(document.getElementById('tiro-hab-clube').value) || 0;
  var obs = document.getElementById('tiro-hab-obs').value.trim();
  var semDesc = document.getElementById('tiro-hab-semdesc').checked;
  // Armas selecionadas
  var armaIds = [];
  document.querySelectorAll('.tiro-hab-arma-cb:checked').forEach(function(cb) {
    armaIds.push(parseInt(cb.value));
  });
  if (!dataVal) { alert('Informe a data.'); return; }
  var t = DATA.hobbies.tirohp;
  var entry = {
    id: tiroNextId(t.habitualidades),
    data: dataVal,
    tipo: tipo,
    munMinhas: munMinhas,
    munClube: munClube,
    armas: armaIds,
    obs: obs
  };
  if (semDesc) entry.semDesconto = true;
  t.habitualidades.push(entry);
  saveData();
  renderTiroHabitualidade();
}

function tiroDeleteHabitualidade(id) {
  if (!confirm('Remover esta atividade?')) return;
  var t = DATA.hobbies.tirohp;
  t.habitualidades = t.habitualidades.filter(function(h) { return h.id !== id; });
  saveData();
  renderTiroHabitualidade();
}

// ========== RELATORIO ==========
function tiroRelDefaults() {
  var hoje = new Date();
  var umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
  return { de: dk(umAnoAtras), ate: dk(hoje) };
}

function renderTiroRelatorio() {
  var t = DATA.hobbies.tirohp;
  var defs = tiroRelDefaults();
  var deEl = document.getElementById('tiro-rel-de');
  var ateEl = document.getElementById('tiro-rel-ate');
  var de = deEl ? deEl.value : defs.de;
  var ate = ateEl ? ateEl.value : defs.ate;

  var habs = t.habitualidades.slice().filter(function(h) {
    return h.data >= de && h.data <= ate;
  }).sort(function(a, b) { return b.data.localeCompare(a.data); });

  var html = '';

  // Filtro periodo
  html += '<div class="section"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
  html += '<label style="font-size:12px;color:var(--text3);">De</label>';
  html += dpInput('tiro-rel-de', de);
  html += '<label style="font-size:12px;color:var(--text3);">Ate</label>';
  html += dpInput('tiro-rel-ate', ate);
  html += '<button onclick="renderTiroRelatorio()" style="padding:8px 16px;border-radius:8px;border:none;background:var(--green);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">Filtrar</button>';
  html += '</div></div>';

  // Contadores por tipo
  var contadores = { treino: 0, curso: 0, camp_interno: 0, camp_nacional: 0 };
  var totalMunMinhas = 0, totalMunClube = 0;
  habs.forEach(function(h) {
    if (contadores[h.tipo] !== undefined) contadores[h.tipo]++;
    totalMunMinhas += (h.munMinhas || 0);
    totalMunClube += (h.munClube || 0);
  });

  var html = '';

  // Resumo - cards de contagem
  html += '<div class="section"><div class="stitle">Resumo</div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">';
  var tipos = [
    { key: 'treino', label: 'Treinos', color: 'var(--green)' },
    { key: 'curso', label: 'Cursos', color: 'var(--blue)' },
    { key: 'camp_interno', label: 'Camp. Internos', color: 'var(--amber)' },
    { key: 'camp_nacional', label: 'Camp. Nacionais', color: 'var(--gold)' }
  ];
  tipos.forEach(function(tp) {
    html += '<div class="card" style="flex:1;min-width:70px;padding:12px;text-align:center;">';
    html += '<div style="font-size:22px;font-weight:700;color:' + tp.color + ';">' + contadores[tp.key] + '</div>';
    html += '<div style="font-size:11px;color:var(--text3);">' + tp.label + '</div></div>';
  });
  html += '</div>';
  // Total geral + municao
  html += '<div style="display:flex;gap:8px;">';
  html += '<div class="card" style="flex:1;padding:12px;text-align:center;">';
  html += '<div style="font-size:22px;font-weight:700;color:var(--text);">' + habs.length + '</div>';
  html += '<div style="font-size:11px;color:var(--text3);">Total idas</div></div>';
  html += '<div class="card" style="flex:1;padding:12px;text-align:center;">';
  html += '<div style="font-size:22px;font-weight:700;color:var(--purple);">' + totalMunMinhas + '</div>';
  html += '<div style="font-size:11px;color:var(--text3);">Mun. minhas</div></div>';
  html += '<div class="card" style="flex:1;padding:12px;text-align:center;">';
  html += '<div style="font-size:22px;font-weight:700;color:var(--orange);">' + totalMunClube + '</div>';
  html += '<div style="font-size:11px;color:var(--text3);">Mun. clube</div></div>';
  html += '</div></div>';

  // Por calibre
  var porCalibre = {};
  habs.forEach(function(h) {
    if (h.armas && h.armas.length > 0) {
      h.armas.forEach(function(aid) {
        var arma = (t.armas || []).find(function(a) { return a.id === aid; });
        var cal = arma ? arma.calibre : 'Desconhecido';
        if (!porCalibre[cal]) porCalibre[cal] = { idas: 0, munMinhas: 0, munClube: 0 };
        porCalibre[cal].idas++;
        // Distribui municao proporcional entre armas (simplificado: divide igual)
      });
    }
    // Atribui municao ao calibre principal se so uma arma
    if (h.armas && h.armas.length === 1) {
      var arma = (t.armas || []).find(function(a) { return a.id === h.armas[0]; });
      var cal = arma ? arma.calibre : 'Desconhecido';
      if (!porCalibre[cal]) porCalibre[cal] = { idas: 0, munMinhas: 0, munClube: 0 };
      porCalibre[cal].munMinhas += (h.munMinhas || 0);
      porCalibre[cal].munClube += (h.munClube || 0);
    } else if (!h.armas || h.armas.length === 0) {
      var cal = t.config.calibre || '9mm';
      if (!porCalibre[cal]) porCalibre[cal] = { idas: 0, munMinhas: 0, munClube: 0 };
      porCalibre[cal].idas++;
      porCalibre[cal].munMinhas += (h.munMinhas || 0);
      porCalibre[cal].munClube += (h.munClube || 0);
    }
  });
  var calKeys = Object.keys(porCalibre);
  if (calKeys.length > 0) {
    html += '<div class="section"><div class="stitle">Por calibre</div>';
    html += '<div class="card">';
    calKeys.forEach(function(cal) {
      var c = porCalibre[cal];
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:0.5px solid var(--border);">';
      html += '<div style="font-size:15px;font-weight:600;color:var(--text);min-width:60px;">' + cal + '</div>';
      html += '<div style="flex:1;display:flex;gap:16px;font-size:12px;color:var(--text2);">';
      html += '<span>' + c.idas + ' idas</span>';
      if (c.munMinhas > 0) html += '<span style="color:var(--purple);">' + c.munMinhas + ' mun. minhas</span>';
      if (c.munClube > 0) html += '<span style="color:var(--orange);">' + c.munClube + ' mun. clube</span>';
      html += '</div></div>';
    });
    html += '</div></div>';
  }

  // Lista completa
  html += '<div class="section"><div class="stitle">Todas as habitualidades <span style="color:var(--text3);font-weight:400;">' + habs.length + '</span></div>';
  if (habs.length === 0) {
    html += '<div class="card" style="padding:20px;text-align:center;color:var(--text3);font-size:13px;">Nenhuma atividade registrada</div>';
  } else {
    html += '<div class="card">';
    habs.forEach(function(h) {
      var info = TIRO_TIPOS_HAB[h.tipo] || { label: h.tipo, color: 'var(--text2)' };
      var detalhes = [];
      if (h.munMinhas > 0) detalhes.push(h.munMinhas + ' mun. minhas');
      if (h.munClube > 0) detalhes.push(h.munClube + ' mun. clube');
      if (h.armas && h.armas.length > 0) {
        detalhes.push(h.armas.map(function(aid) { return tiroGetArmaName(aid); }).join(', '));
      }
      if (h.armasClube) detalhes.push(h.armasClube);
      html += '<div style="padding:12px 14px;border-bottom:0.5px solid var(--border);">';
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:' + (detalhes.length > 0 || h.obs ? '4px' : '0') + ';">';
      html += '<div style="font-size:12px;color:var(--text3);min-width:50px;">' + formatDateBR(h.data) + '</div>';
      html += '<span style="font-size:11px;padding:2px 8px;border-radius:4px;background:' + info.color + '22;color:' + info.color + ';font-weight:600;">' + info.label + '</span>';
      if (h.semDesconto) html += '<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:var(--amber)22;color:var(--amber);">retroativo</span>';
      html += '</div>';
      if (detalhes.length > 0) html += '<div style="font-size:12px;color:var(--text2);padding-left:62px;">' + detalhes.join(' &middot; ') + '</div>';
      if (h.obs) html += '<div style="font-size:12px;color:var(--text3);padding-left:62px;font-style:italic;">' + h.obs + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  document.getElementById('tiro-relatorio-content').innerHTML = html;
}

// ========== ARMAS ==========
function tiroGetArmaName(id) {
  var t = DATA.hobbies.tirohp;
  var a = (t.armas || []).find(function(x) { return x.id === id; });
  return a ? a.nome + (a.minha ? '' : ' (clube)') : 'Arma #' + id;
}

function renderTiroArmas() {
  var t = DATA.hobbies.tirohp;
  var html = '';

  // Form nova arma
  html += '<div class="section"><div class="stitle">Cadastrar arma</div>';
  html += '<div class="card" style="padding:14px;">';
  html += '<div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Nome</label>';
  html += '<input type="text" id="tiro-arma-nome" placeholder="ex: Pistola Glock G19" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;"></div>';
  html += '<div style="display:flex;gap:8px;margin-bottom:10px;">';
  html += '<div style="flex:1;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Tipo</label>';
  html += '<select id="tiro-arma-tipo" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;">';
  html += '<option value="curta">Curta</option><option value="longa">Longa</option><option value="shotgun">Shotgun</option></select></div>';
  html += '<div style="flex:1;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Calibre</label>';
  html += '<input type="text" id="tiro-arma-calibre" placeholder="9mm" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;"></div>';
  html += '</div>';
  html += '<div style="margin-bottom:10px;"><label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text2);cursor:pointer;">';
  html += '<input type="checkbox" id="tiro-arma-minha" checked style="accent-color:var(--green);"> Arma minha</label></div>';
  html += '<button onclick="tiroAddArma()" style="width:100%;padding:10px;border-radius:8px;border:none;background:var(--green);color:#fff;font-size:13px;font-weight:600;cursor:pointer;">Cadastrar</button>';
  html += '</div></div>';

  // Lista
  html += '<div class="section"><div class="stitle">Armas cadastradas <span style="color:var(--text3);font-weight:400;">' + (t.armas || []).length + '</span></div>';
  if (!t.armas || t.armas.length === 0) {
    html += '<div class="card" style="padding:20px;text-align:center;color:var(--text3);font-size:13px;">Nenhuma arma cadastrada</div>';
  } else {
    html += '<div class="card">';
    t.armas.forEach(function(a) {
      html += '<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:0.5px solid var(--border);">';
      html += '<div style="flex:1;">';
      html += '<div style="font-size:14px;font-weight:500;color:var(--text);">' + a.nome + '</div>';
      html += '<div style="font-size:12px;color:var(--text3);">' + a.tipo + ' &middot; ' + a.calibre + ' &middot; ' + (a.minha ? '<span style="color:var(--green);">minha</span>' : '<span style="color:var(--amber);">clube</span>') + '</div>';
      html += '</div>';
      html += '<button onclick="tiroDeleteArma(' + a.id + ')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:4px;">x</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  document.getElementById('tiro-armas-content').innerHTML = html;
}

function tiroAddArma() {
  var nome = document.getElementById('tiro-arma-nome').value.trim();
  var tipo = document.getElementById('tiro-arma-tipo').value;
  var calibre = document.getElementById('tiro-arma-calibre').value.trim();
  var minha = document.getElementById('tiro-arma-minha').checked;
  if (!nome) { alert('Informe o nome da arma.'); return; }
  if (!calibre) { alert('Informe o calibre.'); return; }
  var t = DATA.hobbies.tirohp;
  t.armas.push({
    id: tiroNextId(t.armas),
    nome: nome,
    tipo: tipo,
    calibre: calibre,
    minha: minha
  });
  saveData();
  renderTiroArmas();
}

function tiroDeleteArma(id) {
  if (!confirm('Remover esta arma?')) return;
  var t = DATA.hobbies.tirohp;
  t.armas = t.armas.filter(function(a) { return a.id !== id; });
  saveData();
  renderTiroArmas();
}

// ========== IMPORTACAO ==========
// Formato: TIRO:data|tipo|munMinhas|munClube|armaIds|obs|semDesconto
// Exemplo: TIRO:2026-03-28|treino|50|0|1,2|Treino de sacada|0
// armaIds: ids separados por virgula (ou vazio)
// semDesconto: 1 = retroativo (nao desconta), 0 ou vazio = normal
function tiroParseOneLine(line) {
  if (!line.startsWith('TIRO:')) return null;
  var parts = line.slice(5).split('|');
  if (parts.length < 2) return null;
  var data = parts[0] || dk(new Date());
  var tipo = parts[1] || 'treino';
  var tiposValidos = ['treino', 'curso', 'camp_interno', 'camp_nacional'];
  if (tiposValidos.indexOf(tipo) === -1) return null;
  var munMinhas = parseInt(parts[2]) || 0;
  var munClube = parseInt(parts[3]) || 0;
  var armaIds = parts[4] ? parts[4].split(',').map(function(x) { return parseInt(x.trim()); }).filter(function(x) { return !isNaN(x); }) : [];
  var obs = parts[5] || '';
  var semDesc = parts[6] === '1';
  var tipoLabels = { treino: 'Treino', curso: 'Curso', camp_interno: 'Camp. Interno', camp_nacional: 'Camp. Nacional' };
  return { data: data, tipo: tipo, tipoLabel: tipoLabels[tipo] || tipo, munMinhas: munMinhas, munClube: munClube, armaIds: armaIds, obs: obs, semDesc: semDesc };
}
var pendingTiroMulti = null;
function tiroParseImport() {
  var raw = document.getElementById('tiro-import-input').value.trim();
  if (!raw) { alert('Cole o codigo TIRO: primeiro.'); return; }
  var lines = raw.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });

  if (lines.length === 1) {
    // Single line: populate form for review (original behavior)
    if (!raw.startsWith('TIRO:')) { alert('Formato invalido. Deve comecar com TIRO:'); return; }
    var p = tiroParseOneLine(raw);
    if (!p) { alert('Codigo incompleto ou tipo invalido.'); return; }

    var dataInput = document.getElementById('tiro-hab-data');
    var dataDisplay = document.getElementById('tiro-hab-data-display');
    if (dataInput) dataInput.value = p.data;
    if (dataDisplay) dataDisplay.textContent = dpFormatBR(p.data);
    var tipoSel = document.getElementById('tiro-hab-tipo');
    if (tipoSel) tipoSel.value = p.tipo;
    var minhasInput = document.getElementById('tiro-hab-minhas');
    var clubeInput = document.getElementById('tiro-hab-clube');
    if (minhasInput) minhasInput.value = p.munMinhas;
    if (clubeInput) clubeInput.value = p.munClube;
    document.querySelectorAll('.tiro-hab-arma-cb').forEach(function(cb) {
      cb.checked = p.armaIds.indexOf(parseInt(cb.value)) !== -1;
    });
    var obsInput = document.getElementById('tiro-hab-obs');
    if (obsInput) obsInput.value = p.obs;
    var semDescCb = document.getElementById('tiro-hab-semdesc');
    if (semDescCb) semDescCb.checked = p.semDesc;
    document.getElementById('tiro-import-input').value = '';
    var formCard = dataInput ? dataInput.closest('.section') : null;
    if (formCard) {
      formCard.style.transition = 'box-shadow .3s';
      formCard.style.boxShadow = '0 0 0 2px var(--purple)';
      setTimeout(function() { formCard.style.boxShadow = ''; }, 1500);
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  // Multi-line: show summary modal
  var parsed = []; var errors = [];
  lines.forEach(function(line, i) {
    var p = tiroParseOneLine(line);
    if (p) parsed.push(p); else errors.push('Linha ' + (i + 1) + ': ' + line);
  });
  if (parsed.length === 0) { alert('Nenhuma linha TIRO valida encontrada.'); return; }
  pendingTiroMulti = parsed;

  var t = DATA.hobbies.tirohp;
  var armaMap = {};
  (t.armas || []).forEach(function(a) { armaMap[a.id] = a.nome; });

  document.getElementById('tiroMultiSub').textContent = parsed.length + ' atividades encontradas' + (errors.length ? ' (' + errors.length + ' ignoradas)' : '');
  var html = ''; var totalMinhas = 0; var totalClube = 0;
  parsed.forEach(function(p) {
    totalMinhas += p.munMinhas; totalClube += p.munClube;
    var armasStr = p.armaIds.map(function(id) { return armaMap[id] || 'Arma #' + id; }).join(', ') || '-';
    html += '<div class="multi-item" style="border-left:3px solid var(--purple);">';
    html += '<div class="multi-item-hdr"><span class="multi-item-meal" style="color:var(--purple);">' + p.tipoLabel + '</span><span style="font-size:11px;color:var(--text3);">' + dpFormatBR(p.data) + '</span></div>';
    if (p.obs) html += '<div class="multi-item-desc">' + p.obs + '</div>';
    html += '<div class="multi-item-macros"><span style="color:var(--orange);">Minhas: ' + p.munMinhas + '</span><span style="color:var(--blue);">Clube: ' + p.munClube + '</span><span style="color:var(--text3);">' + armasStr + '</span></div>';
    html += '</div>';
  });
  if (errors.length) errors.forEach(function(e) { html += '<div class="multi-err">' + e + '</div>'; });
  document.getElementById('tiroMultiList').innerHTML = html;
  document.getElementById('tiroMultiTotal').innerHTML = '<span style="color:var(--orange);">Total minhas: ' + totalMinhas + '</span><span style="color:var(--blue);">Total clube: ' + totalClube + '</span>';
  document.getElementById('tiroMultiOv').classList.add('show');
}
function closeTiroMultiModal() { document.getElementById('tiroMultiOv').classList.remove('show'); pendingTiroMulti = null; }
function confirmTiroMultiImport() {
  if (!pendingTiroMulti || !pendingTiroMulti.length) return;
  var t = DATA.hobbies.tirohp;
  pendingTiroMulti.forEach(function(p) {
    var entry = {
      id: tiroNextId(t.habitualidades),
      data: p.data, tipo: p.tipo, munMinhas: p.munMinhas, munClube: p.munClube, armas: p.armaIds, obs: p.obs
    };
    if (p.semDesc) entry.semDesconto = true;
    t.habitualidades.push(entry);
  });
  saveData();
  document.getElementById('tiro-import-input').value = '';
  closeTiroMultiModal();
  renderTiroHabitualidade();
}

// ========== CONFIG ==========
function tiroSaveCota() {
  var val = parseInt(document.getElementById('tiro-cota-input').value);
  if (!val || val <= 0) return;
  DATA.hobbies.tirohp.config.cotaAnual = val;
  saveData();
  renderTiroPainel();
}
