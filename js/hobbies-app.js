// ========== HOBBIES APP - TIRO HIGH PERFORMANCE ==========

var TIRO_TIPOS_HAB = {
  treino: { label: 'Treino', color: 'var(--green)' },
  curso: { label: 'Curso', color: 'var(--blue)' },
  camp_interno: { label: 'Camp. Interno', color: 'var(--amber)' },
  camp_nacional: { label: 'Camp. Nacional', color: 'var(--gold)' }
};

function initHobbies() {
  if (!DATA.hobbies) DATA.hobbies = {};
  if (!DATA.hobbies.tirohp) {
    DATA.hobbies.tirohp = {
      config: { cotaAnual: 500, calibre: '9mm' },
      compras: [],
      habitualidades: []
    };
  }
  var t = DATA.hobbies.tirohp;
  if (!t.config) t.config = { cotaAnual: 500, calibre: '9mm' };
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
  if (hobby === 'tirohp') renderTiroPainel();
}

function switchTiroTab(tab, btn) {
  ['painel', 'municao', 'habitualidade'].forEach(function(t) {
    document.getElementById('tiro-' + t).style.display = t === tab ? '' : 'none';
  });
  btn.parentElement.querySelectorAll('.tab').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  if (tab === 'painel') renderTiroPainel();
  if (tab === 'municao') renderTiroMunicao();
  if (tab === 'habitualidade') renderTiroHabitualidade();
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
  t.habitualidades.forEach(function(h) { gastas += (h.munMinhas || 0); });
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
  var qtd = parseInt(document.getElementById('tiro-mun-qtd').value);
  var tipo = document.getElementById('tiro-mun-tipo').value;
  var obs = document.getElementById('tiro-mun-obs').value.trim();
  if (!qtd || qtd <= 0) { alert('Informe a quantidade.'); return; }
  var t = DATA.hobbies.tirohp;
  t.compras.push({
    id: tiroNextId(t.compras),
    data: dk(new Date()),
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
  // Form
  html += '<div class="section"><div class="stitle">Registrar ida ao clube</div>';
  html += '<div class="card" style="padding:14px;">';
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
  // Armas clube
  html += '<div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Armas do clube usadas (opcional)</label>';
  html += '<input type="text" id="tiro-hab-armas" placeholder="ex: 12ga, .357" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;"></div>';
  // Obs
  html += '<div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text3);display:block;margin-bottom:3px;">Obs (opcional)</label>';
  html += '<input type="text" id="tiro-hab-obs" placeholder="" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border2);background:var(--bg);color:var(--text);font-size:14px;"></div>';
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
      if (h.armasClube) detalhes.push('Armas: ' + h.armasClube);
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
  var tipo = document.getElementById('tiro-hab-tipo').value;
  var munMinhas = parseInt(document.getElementById('tiro-hab-minhas').value) || 0;
  var munClube = parseInt(document.getElementById('tiro-hab-clube').value) || 0;
  var armasClube = document.getElementById('tiro-hab-armas').value.trim();
  var obs = document.getElementById('tiro-hab-obs').value.trim();
  if (munMinhas === 0 && munClube === 0) { alert('Informe a quantidade de municao usada.'); return; }
  var t = DATA.hobbies.tirohp;
  t.habitualidades.push({
    id: tiroNextId(t.habitualidades),
    data: dk(new Date()),
    tipo: tipo,
    munMinhas: munMinhas,
    munClube: munClube,
    armasClube: armasClube,
    obs: obs
  });
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

// ========== CONFIG ==========
function tiroSaveCota() {
  var val = parseInt(document.getElementById('tiro-cota-input').value);
  if (!val || val <= 0) return;
  DATA.hobbies.tirohp.config.cotaAnual = val;
  saveData();
  renderTiroPainel();
}
