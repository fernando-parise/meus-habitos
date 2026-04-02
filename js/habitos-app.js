// ========== HABITOS APP ==========
const META=4000;
const MP=['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DP=['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
const BL=[
  {key:'cafe',label:'Cafe da manha',icon:'\u2615',multi:false},
  {key:'lanche_manha',label:'Lanche da manha',icon:'\uD83C\uDF4C',multi:true},
  {key:'almoco',label:'Almoco',icon:'\uD83C\uDF7D\uFE0F',multi:false},
  {key:'lanche_tarde',label:'Lanche da tarde',icon:'\uD83E\uDD5C',multi:true},
  {key:'jantar',label:'Jantar',icon:'\uD83C\uDF19',multi:false},
  {key:'ceia',label:'Ceia / noturno',icon:'\uD83C\uDF1B',multi:true},
];
const KEY_MAP={
  cafe:['cafe','cafe da manha'],lanche_manha:['lanche_manha','lanche da manha','lanche manha'],
  almoco:['almoco'],lanche_tarde:['lanche_tarde','lanche da tarde','lanche tarde'],
  jantar:['jantar'],ceia:['ceia','lanche noturno','lanche da noite','noturno','noite']
};
const SECTIONS=[
  {id:'pessoal',label:'Desenvolvimento pessoal'},
  {id:'saude',label:'Saude & suplementos'},
  {id:'treino',label:'Treinos'},
];
const DEFAULT_HABITS=[
  {id:'biblia',name:'Leitura biblica',icon:'\u271D\uFE0F',section:'pessoal'},
  {id:'leidatracao',name:'Lei da atracao',icon:'\u2728',section:'pessoal'},
  {id:'creatina',name:'Creatina',icon:'\uD83D\uDC8A',section:'saude'},
  {id:'pretreino',name:'Pre-treino',icon:'\u26A1',section:'saude',defaultSkip:'sem_aula'},
  {id:'vitaminas',name:'Vitaminas',icon:'\uD83C\uDF3F',section:'saude'},
  {id:'academia',name:'Academia',icon:'\uD83C\uDFCB\uFE0F',section:'treino'},
  {id:'muaythai',name:'Muay Thai',icon:'\uD83E\uDD4A',section:'treino',defaultSkip:'sem_aula'},
  {id:'tiro',name:'Tiro esportivo',icon:'\uD83C\uDFAF',section:'treino',defaultSkip:'sem_aula'},
  {id:'alongamento',name:'Alongamento',icon:'\uD83E\uDD38',section:'treino'},
  {id:'acucar',name:'Alimentos com acucar',icon:'\uD83C\uDF6C',section:'ruim'},
  {id:'bolacha',name:'Consumiu bolachas',icon:'\uD83C\uDF6A',section:'ruim'},
  {id:'lanche',name:'Consumiu lanches',icon:'\uD83E\uDD6A',section:'ruim'},
];

let pendingImport=null;
let addingSection=null;

// ========== HABITS HELPERS ==========
function getHabits(section){return (DATA.habits||[]).filter(h=>h.section===section);}
function getAllHabits(){return DATA.habits||[];}
function getNormalHabits(){return getAllHabits().filter(h=>h.section!=='ruim');}
function getBadHabits(){return getAllHabits().filter(h=>h.section==='ruim');}
function isHabitActive(h,d){
  const data=DATA.days[dk(d)]||{};
  const skips=data._skips||{};
  if(skips[h.id])return false;
  // backward compat: old array format
  if(Array.isArray(skips)&&skips.includes(h.id))return false;
  return true;
}
function getSkipReason(hid,d){
  const data=DATA.days[dk(d)]||{};
  const skips=data._skips||{};
  if(Array.isArray(skips))return skips.includes(hid)?'nao_fui':null;
  return skips[hid]||null;
}
function skipHabit(id,reason){
  const d=ld(cur);
  // migrate old array to object
  if(Array.isArray(d._skips)){
    const old=d._skips;
    d._skips={};
    old.forEach(s=>d._skips[s]='nao_fui');
  }
  if(!d._skips)d._skips={};
  d._skips[id]=reason;
  if(d[id])d[id]=false;
  sd(cur,d);renderDaily();
}
function unskipHabit(id){
  const d=ld(cur);
  if(Array.isArray(d._skips)){
    const old=d._skips;
    d._skips={};
    old.forEach(s=>d._skips[s]='nao_fui');
  }
  if(d._skips)delete d._skips[id];
  sd(cur,d);renderDaily();
}
function showSkipMenu(id){
  // close any existing skip menu
  document.querySelectorAll('.skip-menu').forEach(e=>e.remove());
  const el=document.getElementById('skip-btn-'+id);
  if(!el)return;
  const menu=document.createElement('div');
  menu.className='skip-menu';
  const rect=el.getBoundingClientRect();
  menu.style.cssText='position:fixed;background:var(--bg2);border:0.5px solid var(--border2);border-radius:8px;padding:4px;z-index:1000;min-width:160px;box-shadow:0 4px 12px rgba(0,0,0,.5);left:'+(rect.left-120)+'px;top:'+(rect.bottom+4)+'px';
  // se nao cabe embaixo, abre pra cima
  if(rect.bottom+80>window.innerHeight)menu.style.top=(rect.top-80)+'px';
  menu.innerHTML='<div style="padding:8px 12px;cursor:pointer;font-size:13px;border-radius:6px;color:var(--text2)" onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'transparent\'" onclick="skipHabit(\''+id+'\',\'sem_aula\');this.parentElement.remove()">Sem aula / folga</div><div style="padding:8px 12px;cursor:pointer;font-size:13px;border-radius:6px;color:var(--red)" onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'transparent\'" onclick="skipHabit(\''+id+'\',\'nao_fui\');this.parentElement.remove()">Nao fui (falta)</div>';
  document.body.appendChild(menu);
  // close on click outside
  setTimeout(()=>{document.addEventListener('click',function handler(e){if(!menu.contains(e.target)&&e.target!==el){menu.remove();document.removeEventListener('click',handler);}});},10);
}
function getDayHabits(section,d){
  const permanent=getHabits(section);
  const data=DATA.days[dk(d)]||{};
  const tempHabits=(data._tempHabits||[]).filter(h=>h.section===section);
  return permanent.concat(tempHabits);
}
function addTempHabit(section){
  addingSection=section;
  const existing=document.getElementById('addform-'+section);
  if(existing){existing.remove();addingSection=null;return;}
  document.querySelectorAll('[id^="addform-"]').forEach(e=>e.remove());
  const container=document.getElementById('card-'+section);
  if(!container)return;
  const row=document.createElement('div');
  row.id='addform-'+section;
  row.className='add-habit-row';
  row.innerHTML='<input class="add-habit-icon" id="addi-'+section+'" placeholder="emoji" maxlength="4"/><input class="add-habit-inp" id="addn-'+section+'" placeholder="Nome..."/><select id="addt-'+section+'" style="padding:8px;border:0.5px solid var(--border2);border-radius:8px;background:var(--bg3);color:var(--text);font-size:13px"><option value="today">So hoje</option><option value="permanent">Permanente</option></select><button class="add-habit-ok" onclick="confirmAddHabitNew(\''+section+'\')">+</button>';
  container.appendChild(row);
  document.getElementById('addn-'+section).focus();
  document.getElementById('addn-'+section).addEventListener('keydown',function(e){if(e.key==='Enter')confirmAddHabitNew(section);});
}
function confirmAddHabitNew(section){
  const nameEl=document.getElementById('addn-'+section);
  const iconEl=document.getElementById('addi-'+section);
  const typeEl=document.getElementById('addt-'+section);
  const name=(nameEl?nameEl.value:'').trim();
  const icon=(iconEl?iconEl.value:'').trim()||'\uD83D\uDCCC';
  const type=typeEl?typeEl.value:'permanent';
  if(!name)return;
  const id=name.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'')+'_'+Date.now();
  if(type==='permanent'){
    const pid=name.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'');
    if(DATA.habits.some(h=>h.id===pid)){alert('Ja existe um habito com esse nome.');return;}
    DATA.habits.push({id:pid,name,icon,section});
    saveData();renderDaily();
  }else{
    const d=ld(cur);
    if(!d._tempHabits)d._tempHabits=[];
    d._tempHabits.push({id,name,icon,section});
    sd(cur,d);renderDaily();
  }
}
function deleteTempHabit(id){
  const d=ld(cur);
  if(d._tempHabits)d._tempHabits=d._tempHabits.filter(h=>h.id!==id);
  delete d[id];
  sd(cur,d);renderDaily();
}

// ========== MIGRACAO ==========
function checkMigration(){
  let hasOld=false;
  for(let i=0;i<localStorage.length;i++){if(localStorage.key(i).startsWith('hb_')){hasOld=true;break;}}
  if(hasOld&&Object.keys(DATA.days).length===0)document.getElementById('migrateBox').style.display='block';
}
function migrateFromLocalStorage(){
  const psk=localStorage.getItem('hb_project_start');const usk=localStorage.getItem('hb_usage_start');
  if(psk)DATA.project_start=psk;if(usk)DATA.usage_start=usk;
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('hb_')&&k!=='hb_project_start'&&k!=='hb_usage_start'){try{DATA.days[k.slice(3)]=JSON.parse(localStorage.getItem(k));}catch(e){}}}
  saveData();document.getElementById('migrateBox').style.display='none';
  alert('Dados migrados! '+Object.keys(DATA.days).length+' dias.');renderDaily();
}

// ========== DADOS BASICOS ==========
function dk(d){return d.toISOString().split('T')[0];}
function ld(d){
  var k=dk(d),data=DATA.days[k];
  if(!data){
    data={};
    // Apply default skips for new days
    var habits=getAllHabits();
    for(var i=0;i<habits.length;i++){
      if(habits[i].defaultSkip){
        if(!data._skips)data._skips={};
        data._skips[habits[i].id]=habits[i].defaultSkip;
      }
    }
    DATA.days[k]=data;
  }
  return data;
}
function sd(d,v){DATA.days[dk(d)]=v;saveData();}
function PS(){return new Date(DATA.project_start+'T00:00:00');}

// ========== ACOES ==========
function toggle(id){const d=ld(cur);d[id]=!d[id];sd(cur,d);renderDaily();}
function addAgua(ml){const d=ld(cur);d.agua_ml=Math.max(0,(d.agua_ml||0)+ml);d.agua_ok=d.agua_ml>=META;sd(cur,d);renderDaily();}
function addHoras(delta){const d=ld(cur);d.yt_horas=Math.max(0,parseFloat(((d.yt_horas||0)+delta).toFixed(1)));sd(cur,d);document.getElementById('disp-yt').textContent=fmtH(d.yt_horas);}
function addCal(delta){const d=ld(cur);d.calorias=Math.max(0,(d.calorias||0)+delta);sd(cur,d);renderCal(d.calorias);}
function setCal(v){const n=parseInt(v);if(isNaN(n)||n<0)return;const d=ld(cur);d.calorias=Math.min(n,99999);sd(cur,d);renderCal(d.calorias);}
function renderCal(v){const el=document.getElementById('calDisplay'),inp=document.getElementById('calInput');if(!v||v===0){el.textContent='\u2014';if(document.activeElement!==inp)inp.value='';}else{el.textContent=v.toLocaleString('pt-BR');if(document.activeElement!==inp)inp.value=v;}}
function saveSono(){const d=ld(cur);d.sono_inicio=document.getElementById('sonoInicio').value;d.sono_fim=document.getElementById('sonoFim').value;sd(cur,d);renderSono(d);}
function calcSono(i,f){if(!i||!f)return null;const[ih,im]=i.split(':').map(Number);const[fh,fm]=f.split(':').map(Number);let m=(fh*60+fm)-(ih*60+im);if(m<=0)m+=1440;return m/60;}
function fmtSono(h){const hr=Math.floor(h),mn=Math.round((h-hr)*60);return mn===0?hr+'h':hr+'h'+mn+'min';}
function renderSono(data){const h=calcSono(data.sono_inicio,data.sono_fim);const res=document.getElementById('sonoResult'),badge=document.getElementById('sonoQualBadge');if(h===null){res.style.display='none';badge.innerHTML='';return;}res.style.display='flex';document.getElementById('sonoHDisp').textContent=fmtSono(h);let cls,lbl;if(h>=7.5){cls='bom';lbl='bom sono';}else if(h>=6){cls='ok';lbl='sono ok';}else{cls='ruim';lbl='pouco sono';}badge.innerHTML='<span class="sono-badge '+cls+'">'+lbl+'</span>';}
function fmtH(h){if(!h||h===0)return '0h';const hr=Math.floor(h),mn=Math.round((h-hr)*60);if(hr===0)return mn+'min';return mn===0?hr+'h':hr+'h'+mn+'min';}

// ========== HABIT MANAGEMENT ==========
function showAddForm(section){
  addingSection=section;
  const existing=document.getElementById('addform-'+section);
  if(existing){existing.remove();addingSection=null;return;}
  document.querySelectorAll('[id^="addform-"]').forEach(e=>e.remove());
  const container=document.getElementById('card-'+section);
  if(!container)return;
  const row=document.createElement('div');
  row.id='addform-'+section;
  row.className='add-habit-row';
  row.innerHTML='<input class="add-habit-icon" id="addi-'+section+'" placeholder="emoji" maxlength="4"/><input class="add-habit-inp" id="addn-'+section+'" placeholder="Nome do habito..."/><button class="add-habit-ok" onclick="confirmAddHabit(\''+section+'\')">+</button>';
  container.appendChild(row);
  document.getElementById('addn-'+section).focus();
  document.getElementById('addn-'+section).addEventListener('keydown',function(e){if(e.key==='Enter')confirmAddHabit(section);});
}
function confirmAddHabit(section){
  const nameEl=document.getElementById('addn-'+section);
  const iconEl=document.getElementById('addi-'+section);
  const name=(nameEl?nameEl.value:'').trim();
  const icon=(iconEl?iconEl.value:'').trim()||'\uD83D\uDCCC';
  if(!name)return;
  const id=name.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'');
  if(DATA.habits.some(h=>h.id===id)){alert('Ja existe um habito com esse ID.');return;}
  DATA.habits.push({id,name,icon,section});
  saveData();renderDaily();
}
function deleteHabit(id){
  if(!confirm('Remover este habito da lista?'))return;
  DATA.habits=DATA.habits.filter(h=>h.id!==id);
  saveData();renderDaily();
}

// ========== IMPORTACAO ==========
function resolveKey(raw){const r=raw.toLowerCase().trim();for(const[k,aliases]of Object.entries(KEY_MAP)){if(aliases.some(a=>r===a||r.includes(a)))return k;}return r;}
function parseSingleMacro(line){
  if(!line.startsWith('MACRO:'))return null;
  const parts=line.slice(6).split('|');if(parts.length<5)return null;
  const key=resolveKey(parts[0]);const bloco=BL.find(b=>b.key===key);
  if(!bloco)return null;
  return{key,multi:bloco.multi,label:bloco.label,icon:bloco.icon,desc:parts.slice(5).join('|')||parts[0],kcal:parseInt(parts[1])||0,prot:parseInt(parts[2])||0,carb:parseInt(parts[3])||0,gord:parseInt(parts[4])||0};
}
let pendingMulti=null;
function parseImport(){
  const raw=document.getElementById('importInput').value.trim();
  if(!raw){alert('Cole o codigo MACRO: primeiro.');return;}
  const lines=raw.split('\n').map(l=>l.trim()).filter(l=>l.length>0);
  if(lines.length===1){
    if(!raw.startsWith('MACRO:')){alert('Formato invalido.');return;}
    const p=parseSingleMacro(raw);
    if(!p){alert('Codigo incompleto ou refeicao nao reconhecida.');return;}
    pendingImport={key:p.key,multi:p.multi,desc:p.desc,kcal:p.kcal,prot:p.prot,carb:p.carb,gord:p.gord};
    document.getElementById('modalDesc').textContent='"'+p.desc+'" -> '+p.label;
    document.getElementById('mKcal').value=p.kcal;document.getElementById('mProt').value=p.prot;
    document.getElementById('mCarb').value=p.carb;document.getElementById('mGord').value=p.gord;
    document.getElementById('modalOv').classList.add('show');
    return;
  }
  const parsed=[];const errors=[];
  lines.forEach((line,i)=>{
    const p=parseSingleMacro(line);
    if(p)parsed.push(p);else errors.push('Linha '+(i+1)+': '+line);
  });
  if(parsed.length===0){alert('Nenhuma linha MACRO valida encontrada.');return;}
  pendingMulti=parsed;
  document.getElementById('multiSub').textContent=parsed.length+' refeicoes encontradas'+(errors.length?' ('+errors.length+' ignoradas)':'');
  let html='';let tK=0,tP=0,tC=0,tG=0;
  parsed.forEach(p=>{
    tK+=p.kcal;tP+=p.prot;tC+=p.carb;tG+=p.gord;
    html+='<div class="multi-item"><div class="multi-item-hdr"><span class="multi-item-meal">'+p.icon+' '+p.label+'</span></div>'
      +'<div class="multi-item-desc">'+p.desc+'</div>'
      +'<div class="multi-item-macros"><span class="mk">'+p.kcal+' kcal</span><span class="mp2">P '+p.prot+'g</span><span class="mc">C '+p.carb+'g</span><span class="mg">G '+p.gord+'g</span></div></div>';
  });
  if(errors.length)errors.forEach(e=>{html+='<div class="multi-err">'+e+'</div>';});
  document.getElementById('multiList').innerHTML=html;
  document.getElementById('multiTotal').innerHTML='<span class="mk">'+tK+' kcal</span><span class="mp2">P '+tP+'g</span><span class="mc">C '+tC+'g</span><span class="mg">G '+tG+'g</span>';
  document.getElementById('modalMultiOv').classList.add('show');
}
function closeModal(){document.getElementById('modalOv').classList.remove('show');pendingImport=null;}
function closeMultiModal(){document.getElementById('modalMultiOv').classList.remove('show');pendingMulti=null;}
function confirmImport(){
  if(!pendingImport)return;
  const{key,multi,desc}=pendingImport;
  const kcal=parseInt(document.getElementById('mKcal').value)||0;const prot=parseInt(document.getElementById('mProt').value)||0;
  const carb=parseInt(document.getElementById('mCarb').value)||0;const gord=parseInt(document.getElementById('mGord').value)||0;
  const d=ld(cur);if(!d['ref_'+key])d['ref_'+key]=[];
  const item={id:Date.now(),desc,macros:{kcal,prot_g:prot,carb_g:carb,gord_g:gord,obs:''}};
  if(!multi){d['ref_'+key]=[item];}else{d['ref_'+key].push(item);}
  sd(cur,d);document.getElementById('importInput').value='';closeModal();renderRefs();
}
function confirmMultiImport(){
  if(!pendingMulti||!pendingMulti.length)return;
  const d=ld(cur);
  pendingMulti.forEach((p,i)=>{
    if(!d['ref_'+p.key])d['ref_'+p.key]=[];
    const item={id:Date.now()+i,desc:p.desc,macros:{kcal:p.kcal,prot_g:p.prot,carb_g:p.carb,gord_g:p.gord,obs:''}};
    if(!p.multi){d['ref_'+p.key]=[item];}else{d['ref_'+p.key].push(item);}
  });
  sd(cur,d);document.getElementById('importInput').value='';closeMultiModal();renderRefs();
}

// ========== REFEICOES ==========
function showEntrada(key){const el=document.getElementById('ent-'+key);if(el)el.style.display=el.style.display==='none'?'':'none';}
function saveRef(key,multi){
  const ta=document.getElementById('rta-'+key);const desc=ta?ta.value.trim():'';
  const kcal=parseInt(document.getElementById('rk-'+key).value)||0;const prot=parseInt(document.getElementById('rp-'+key).value)||0;
  const carb=parseInt(document.getElementById('rc-'+key).value)||0;const gord=parseInt(document.getElementById('rg-'+key).value)||0;
  if(!desc&&kcal===0)return;
  const d=ld(cur);if(!d['ref_'+key])d['ref_'+key]=[];
  const item={id:Date.now(),desc:desc||'Refeicao',macros:{kcal,prot_g:prot,carb_g:carb,gord_g:gord,obs:''}};
  if(!multi){d['ref_'+key]=[item];}else{d['ref_'+key].push(item);}
  sd(cur,d);if(ta)ta.value='';['rk-','rp-','rc-','rg-'].forEach(p=>{const el=document.getElementById(p+key);if(el)el.value='';});
  const ent=document.getElementById('ent-'+key);if(ent)ent.style.display='none';renderRefs();
}
function delRef(key,id){const d=ld(cur);d['ref_'+key]=(d['ref_'+key]||[]).filter(r=>r.id!==id);sd(cur,d);renderRefs();}
function mHtml(r){if(!r.macros)return '';const m=r.macros;return '<span class="mp mk">'+m.kcal+' kcal</span><span class="mp mp2">P '+m.prot_g+'g</span><span class="mp mc">C '+m.carb_g+'g</span><span class="mp mg">G '+m.gord_g+'g</span>';}
function renderRefs(){
  const data=ld(cur);let tk=0,tp=0,tc=0,tg=0,tem=false;let html='';
  BL.forEach((b,i)=>{
    const items=data['ref_'+b.key]||[];const last=i===BL.length-1;
    html+='<div class="ref-b"'+(last?' style="border-bottom:none"':'')+'>';
    html+='<div class="ref-hdr"><span class="ref-hdr-icon">'+b.icon+'</span><span class="ref-hdr-title">'+b.label+'</span><button class="ref-add-btn" onclick="showEntrada(\''+b.key+'\')">'+(b.multi?'+ adicionar':'+ registrar')+'</button></div>';
    items.forEach(r=>{if(r.macros){tem=true;tk+=r.macros.kcal;tp+=r.macros.prot_g;tc+=r.macros.carb_g;tg+=r.macros.gord_g;}html+='<div class="ref-item"><div class="ref-item-top"><span class="ref-item-desc">'+r.desc+'</span><button class="ref-item-del" onclick="delRef(\''+b.key+'\','+r.id+')">x</button></div><div class="macro-row">'+mHtml(r)+'</div></div>';});
    if(items.length===0)html+='<div class="ref-empty">nao registrado</div>';
    html+='<div class="ref-entrada" id="ent-'+b.key+'" style="display:none"><textarea class="ref-ta" id="rta-'+b.key+'" placeholder="descricao do que comeu..." rows="2"></textarea><div class="ref-mgrid"><div class="ref-mf"><span class="ref-ml">Kcal</span><input class="ref-mi" type="number" id="rk-'+b.key+'" placeholder="0" min="0"/></div><div class="ref-mf"><span class="ref-ml">Proteina (g)</span><input class="ref-mi" type="number" id="rp-'+b.key+'" placeholder="0" min="0"/></div><div class="ref-mf"><span class="ref-ml">Carbo (g)</span><input class="ref-mi" type="number" id="rc-'+b.key+'" placeholder="0" min="0"/></div><div class="ref-mf"><span class="ref-ml">Gordura (g)</span><input class="ref-mi" type="number" id="rg-'+b.key+'" placeholder="0" min="0"/></div></div><button class="ref-save" onclick="saveRef(\''+b.key+'\','+b.multi+')">Salvar</button></div>';
    html+='</div>';
  });
  document.getElementById('refeicoesCard').innerHTML=html;
  const tw=document.getElementById('totalDiaWrap');
  if(tem){document.getElementById('tot-kcal').textContent=tk+' kcal';document.getElementById('tot-prot').textContent='P '+tp+'g';document.getElementById('tot-carb').textContent='C '+tc+'g';document.getElementById('tot-gord').textContent='G '+tg+'g';tw.style.display='';}else{tw.style.display='none';}
}

// ========== PROGRESS ==========
function getAllDayHabits(d){
  const normal=getNormalHabits();
  const data=DATA.days[dk(d)]||{};
  const temp=(data._tempHabits||[]).filter(h=>h.section!=='ruim');
  return normal.concat(temp);
}
function getApp(d){
  let n=0;
  getAllDayHabits(d).forEach(h=>{if(isHabitActive(h,d))n++;});
  n+=1; // agua
  n+=1; // yt
  return n;
}
function getDone(d,data){
  let done=0;
  getAllDayHabits(d).forEach(h=>{if(isHabitActive(h,d)&&data[h.id])done++;});
  if((data.agua_ml||0)>=META)done++;
  if(data.yt_trabalhou)done++;
  return done;
}

// ========== RENDER DAILY ==========
function renderDynamicSections(){
  const data=ld(cur);
  let html='';
  SECTIONS.forEach(sec=>{
    const permanentHabits=getHabits(sec.id);
    const tempHabits=(data._tempHabits||[]).filter(h=>h.section===sec.id);
    const allHabits=permanentHabits.concat(tempHabits);
    html+='<div class="section"><div class="stitle">'+sec.label+' <button class="add-sec-btn" onclick="addTempHabit(\''+sec.id+'\')">+</button></div><div class="card" id="card-'+sec.id+'">';
    allHabits.forEach(h=>{
      const isTemp=tempHabits.some(t=>t.id===h.id);
      const skipReason=getSkipReason(h.id,cur);
      const skipped=!!skipReason;
      const active=!skipped;
      const checked=!!data[h.id];
      const isDone=active&&checked;
      const cls='hi'+(isDone?' done':'')+(skipped?' disabled':'');
      html+='<div class="'+cls+'" onclick="'+(active?'toggle(\''+h.id+'\')':'')+'">';
      html+='<div class="cb'+(checked&&active?' checked':'')+'"><div class="ck"'+((checked&&active)?'':' style="display:none"')+'></div></div>';
      html+='<span class="hicon">'+h.icon+'</span><span class="hname">'+h.name+'</span>';
      if(isTemp)html+='<span class="off-b" style="color:var(--amber);border-color:rgba(245,158,11,.3)">so hoje</span>';
      if(skipReason==='sem_aula')html+='<span class="off-b">sem aula</span>';
      else if(skipReason==='nao_fui')html+='<span class="off-b" style="color:var(--red);border-color:rgba(239,68,68,.3)">nao fui</span>';
      if(skipped)html+='<button id="skip-btn-'+h.id+'" onclick="event.stopPropagation();unskipHabit(\''+h.id+'\')" title="Reativar" style="background:transparent;border:none;cursor:pointer;font-size:13px;color:var(--amber);padding:0 4px">\u21A9</button>';
      else html+='<button id="skip-btn-'+h.id+'" onclick="event.stopPropagation();showSkipMenu(\''+h.id+'\')" title="Pular hoje" style="background:transparent;border:none;cursor:pointer;font-size:13px;color:var(--text3);padding:0 4px">\u23ED</button>';
      if(isTemp)html+='<button class="del-habit" onclick="event.stopPropagation();deleteTempHabit(\''+h.id+'\')" style="color:var(--text3)">x</button>';
      else html+='<button class="del-habit" onclick="event.stopPropagation();deleteHabit(\''+h.id+'\')">x</button>';
      html+='</div>';
    });
    if(sec.id==='saude'){
      const aml=data.agua_ml||0,aok=aml>=META;
      html+='<div class="agua-w"><div class="agua-top"><div class="cb'+(aok?' checked':'')+'"><div class="ck"'+(aok?'':' style="display:none"')+'></div></div><span class="hicon">\uD83D\uDCA7</span><div class="agua-info"><div class="agua-name">Agua</div><div class="agua-ml">'+aml.toLocaleString('pt-BR')+' ml de 4.000 ml</div></div>'+(aok?'<span class="agua-ok-b">4L</span>':'')+'</div><div class="agua-track"><div class="agua-fill" style="width:'+Math.min(100,Math.round((aml/META)*100))+'%"></div></div><div class="agua-btns"><button class="agua-btn" onclick="addAgua(50)">+ 50</button><button class="agua-btn" onclick="addAgua(100)">+ 100</button><button class="agua-btn" onclick="addAgua(500)">+ 500</button><button class="agua-btn" onclick="addAgua(800)">+ 800</button><button class="agua-btn m" onclick="addAgua(-50)">- 50</button><button class="agua-btn m" onclick="addAgua(-100)">- 100</button></div></div>';
    }
    html+='</div></div>';
  });
  document.getElementById('dynamicSections').innerHTML=html;
  const badHabits=getBadHabits();
  let ruimHtml='<div class="card"><div style="display:flex;align-items:center;padding:8px 14px 4px"><span style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;flex:1"></span><button class="add-sec-btn" onclick="showAddForm(\'ruim\')" style="font-size:11px">+</button></div><div id="card-ruim">';
  badHabits.forEach(h=>{
    const v=!!data[h.id];
    ruimHtml+='<div class="hi'+(v?' done':'')+'" onclick="toggle(\''+h.id+'\')">';
    ruimHtml+='<div class="cb'+(v?' checked-bad':'')+'"><div class="ck"'+(v?'':' style="display:none"')+'></div></div>';
    ruimHtml+='<span class="hicon">'+h.icon+'</span><span class="hname">'+h.name+'</span>';
    ruimHtml+='<span class="bad-b '+(v?'sim':'nao')+'">'+(v?'sim':'nao')+'</span>';
    ruimHtml+='<button class="del-habit" onclick="event.stopPropagation();deleteHabit(\''+h.id+'\')">x</button>';
    ruimHtml+='</div>';
  });
  ruimHtml+='</div></div>';
  document.getElementById('section-ruim').innerHTML=ruimHtml;
}

function renderDaily(){
  const data=ld(cur);
  document.getElementById('sonoInicio').value=data.sono_inicio||'';document.getElementById('sonoFim').value=data.sono_fim||'';renderSono(data);
  renderDynamicSections();
  const ytOk=!!data.yt_trabalhou;
  const cbYt=document.getElementById('cb-yt_trabalhou');
  if(cbYt){cbYt.className='cb'+(ytOk?' checked':'');cbYt.innerHTML=ytOk?'<div class="ck"></div>':'<div class="ck" style="display:none"></div>';}
  const yn=document.getElementById('yt-nome');if(yn)yn.style.textDecoration=ytOk?'line-through':'';
  document.getElementById('disp-yt').textContent=fmtH(data.yt_horas||0);
  const{streak,total}=ytStreak();
  document.getElementById('ytStreak').innerHTML=total<=1&&!data.yt_trabalhou?'Dia <strong>1</strong>':'Dia <strong>'+total+'</strong> - <strong>'+streak+'</strong> seguidos';
  renderCal(data.calorias||0);renderRefs();
  const app=getApp(cur),done=getDone(cur,data);const pct=app>0?Math.round((done/app)*100):0;
  document.getElementById('progressText').textContent=done+' de '+app+' habitos';document.getElementById('progressPct').textContent=pct+'%';document.getElementById('progressFill').style.width=pct+'%';
  const today=new Date();today.setHours(0,0,0,0);const isT=dk(cur)===dk(today);
  let lbl=isT?'Hoje - ':(DP[cur.getDay()].charAt(0).toUpperCase()+DP[cur.getDay()].slice(1)+', ');
  lbl+=cur.getDate()+' de '+MP[cur.getMonth()]+' de '+cur.getFullYear();
  document.getElementById('dateLabel').textContent=lbl;
  const dow=DP[today.getDay()];document.getElementById('headerSub').textContent=dow.charAt(0).toUpperCase()+dow.slice(1)+', '+today.getDate()+' de '+MP[today.getMonth()];
}

function ytStreak(){const t=new Date();t.setHours(0,0,0,0);let s=0,d=new Date(t);const ps=PS();for(let i=0;i<366;i++){if(d<ps)break;if(ld(d).yt_trabalhou)s++;else if(i>0)break;d.setDate(d.getDate()-1);}return{streak:s,total:Math.floor((t-ps)/86400000)+1};}
function changeDay(delta){cur=new Date(cur);cur.setDate(cur.getDate()+delta);renderDaily();}

// ========== TABS ==========
function initDetailDates(){const today=new Date();today.setHours(0,0,0,0);const from=new Date(today);from.setDate(today.getDate()-6);document.getElementById('detailFrom').value=dk(from);document.getElementById('detailTo').value=dk(today);}
function switchHabitTab(tab,btn){['daily','calendar','report','treinos','detail'].forEach(t=>document.getElementById('tab-'+t).style.display=t===tab?'':'none');btn.parentElement.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');if(tab==='calendar')renderCalendar();if(tab==='report')renderReport();if(tab==='treinos')renderTreinos();if(tab==='detail'){initDetailDates();renderDetail();}}

// ========== CALENDARIO ==========
function getDayScore(d){const data=ld(d);return{done:getDone(d,data),app:getApp(d)};}
function allMacros(data){let k=0,p=0,c=0,g=0,tem=false;BL.forEach(b=>{(data['ref_'+b.key]||[]).forEach(r=>{if(r.macros){tem=true;k+=r.macros.kcal;p+=r.macros.prot_g;c+=r.macros.carb_g;g+=r.macros.gord_g;}});});return{k,p,c,g,tem};}
function renderCalendar(){
  document.getElementById('calMonthLabel').textContent=MP[calM.getMonth()]+' '+calM.getFullYear();
  const grid=document.getElementById('calGrid');grid.innerHTML='';
  const today=new Date();today.setHours(0,0,0,0);
  const fd=new Date(calM.getFullYear(),calM.getMonth(),1);const ld2=new Date(calM.getFullYear(),calM.getMonth()+1,0);
  for(let i=0;i<fd.getDay();i++)grid.appendChild(Object.assign(document.createElement('div'),{className:'sday'}));
  for(let d=1;d<=ld2.getDate();d++){const dd=new Date(calM.getFullYear(),calM.getMonth(),d);const el=document.createElement('div');const fut=dd>today;let cls='sday ';if(!fut){const{done,app}=getDayScore(dd);cls+=done===app?'full':done>0?'partial':'empty';}else cls+='empty';if(dk(dd)===dk(today))cls+=' today';el.className=cls;el.textContent=d;grid.appendChild(el);}
}
function changeCalMonth(delta){calM=new Date(calM.getFullYear(),calM.getMonth()+delta,1);renderCalendar();}

// ========== RELATORIO ==========
function renderReport(){
  document.getElementById('reportMonthLabel').textContent=MP[repM.getMonth()]+' '+repM.getFullYear();
  const today=new Date();today.setHours(0,0,0,0);
  const ld2=new Date(repM.getFullYear(),repM.getMonth()+1,0);const lv=ld2>today?today:ld2;
  const monthStart=new Date(repM.getFullYear(),repM.getMonth(),1);
  let fd=new Date(lv);
  for(let dx=new Date(monthStart);dx<=lv;dx.setDate(dx.getDate()+1)){if(Object.keys(ld(dx)).length>0){fd=new Date(dx);break;}}
  let td=0,pd=0,aw=0,atm=0,yd=0,yh=0;
  const hc={};getAllHabits().forEach(h=>hc[h.id]=0);
  const htotal={};getAllHabits().forEach(h=>htotal[h.id]=0);
  const hskip_sem={};getAllHabits().forEach(h=>hskip_sem[h.id]=0);
  const hskip_nao={};getAllHabits().forEach(h=>hskip_nao[h.id]=0);
  let ct=0,cd=0,cmax=0,cmin=Infinity,st=0,sn=0,sb=0,so=0,sr=0,nk=0,np=0,nc=0,ng=0,nn=0,amax=0,amin=Infinity;
  // consistencia refeicoes
  const refCount={};BL.forEach(b=>refCount[b.key]=0);
  // melhor e pior dia (calorias ingeridas)
  let bestDay=null,bestDayKcal=0,worstDay=null,worstDayKcal=Infinity;
  for(let d=new Date(fd);d<=lv;d.setDate(d.getDate()+1)){
    td++;const data=ld(d);
    getAllHabits().forEach(h=>{
      const reason=getSkipReason(h.id,d);
      if(reason==='sem_aula'){hskip_sem[h.id]++;}
      else if(reason==='nao_fui'){htotal[h.id]++;hskip_nao[h.id]++;}
      else{htotal[h.id]++;if(data[h.id])hc[h.id]++;}
    });
    const ml=data.agua_ml||0;atm+=ml;if(ml>=META)aw++;if(ml>0){if(ml>amax)amax=ml;if(ml<amin)amin=ml;}
    if(data.yt_trabalhou)yd++;yh+=data.yt_horas||0;
    const cal=data.calorias||0;if(cal>0){ct+=cal;cd++;if(cal>cmax)cmax=cal;if(cal<cmin)cmin=cal;}
    const h=calcSono(data.sono_inicio,data.sono_fim);if(h!==null){st+=h;sn++;if(h>=7.5)sb++;else if(h>=6)so++;else sr++;}
    const{k,p,c,g,tem}=allMacros(data);if(tem){nn++;nk+=k;np+=p;nc+=c;ng+=g;
      if(k>bestDayKcal){bestDayKcal=k;bestDay=new Date(d);}
      if(k<worstDayKcal){worstDayKcal=k;worstDay=new Date(d);}
    }
    // consistencia refeicoes
    BL.forEach(b=>{if((data['ref_'+b.key]||[]).length>0)refCount[b.key]++;});
    const{done,app}=getDayScore(d);if(done===app&&app>0)pd++;
  }
  const ps=PS();let pj=0,hj=0;for(let d2=new Date(ps);d2<=today;d2.setDate(d2.getDate()+1)){const data=ld(d2);if(data.yt_trabalhou)pj++;hj+=data.yt_horas||0;}
  const ptd=Math.floor((today-ps)/86400000)+1;
  const{streak}=ytStreak();const avgS=sn>0?st/sn:0;const avgC=cd>0?Math.round(ct/cd):0;
  document.getElementById('summaryGrid').innerHTML='<div class="scard"><div class="scard-lbl">Dias registrados</div><div class="scard-val">'+td+'</div><div class="scard-sub">desde '+fd.getDate()+' de '+MP[fd.getMonth()]+'</div></div><div class="scard"><div class="scard-lbl">Dias perfeitos</div><div class="scard-val" style="color:var(--green)">'+pd+'</div><div class="scard-sub">todos os habitos</div></div><div class="scard"><div class="scard-lbl">Media de sono</div><div class="scard-val">'+(avgS>0?fmtSono(avgS):'\u2014')+'</div><div class="scard-sub">'+sn+' dias</div></div><div class="scard"><div class="scard-lbl">Kcal queimadas</div><div class="scard-val" style="color:var(--orange)">'+(avgC>0?avgC.toLocaleString('pt-BR'):'\u2014')+'</div><div class="scard-sub">media/dia</div></div>';
  document.getElementById('reportSono').innerHTML=sn===0?'<span style="font-size:13px;color:var(--text3)">Nenhum dado ainda.</span>':'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px"><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Media/noite</div><div style="font-weight:700;font-size:20px">'+fmtSono(avgS)+'</div></div><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Noites</div><div style="font-weight:700;font-size:20px">'+sn+'</div></div><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Bom sono</div><div style="font-weight:700;font-size:20px;color:var(--green)">'+sb+'</div></div></div><div style="display:flex;gap:6px;flex-wrap:wrap"><span style="font-size:12px;padding:3px 10px;border-radius:20px;background:var(--green-dim);color:var(--green)">Bom: '+sb+'</span><span style="font-size:12px;padding:3px 10px;border-radius:20px;background:rgba(245,158,11,.15);color:var(--amber)">Ok: '+so+'</span><span style="font-size:12px;padding:3px 10px;border-radius:20px;background:rgba(239,68,68,.15);color:var(--red)">Pouco: '+sr+'</span></div>';
  let secHtml='';
  SECTIONS.forEach(sec=>{
    const habits=getHabits(sec.id);
    if(habits.length===0)return;
    secHtml+='<div class="section"><div class="stitle">'+sec.label+'</div><div class="rcard">';
    habits.forEach(h=>{
      const cnt=hc[h.id]||0;const tot=htotal[h.id]||0;
      const sem=hskip_sem[h.id]||0;const nfui=hskip_nao[h.id]||0;
      const pct=tot>0?Math.round((cnt/tot)*100):0;
      const color=pct>=80?'var(--green)':pct>=50?'var(--amber)':'var(--red)';
      secHtml+='<div class="rrow"><span class="rname">'+h.icon+' '+h.name+'</span><span class="rval">'+cnt+'/'+tot+'<span class="rpct">'+pct+'%</span></span></div><div class="mini-bar"><div class="mini-fill" style="width:'+pct+'%;background:'+color+'"></div></div>';
      if(sem>0||nfui>0){
        secHtml+='<div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap">';
        if(sem>0)secHtml+='<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:var(--bg3);color:var(--text3)">sem aula: '+sem+'</span>';
        if(nfui>0)secHtml+='<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:rgba(239,68,68,.15);color:var(--red)">nao fui: '+nfui+'</span>';
        secHtml+='</div>';
      }
    });
    secHtml+='</div></div>';
  });
  document.getElementById('reportSectionsContainer').innerHTML=secHtml;

  // Alimentacao: consistencia + habitos ruins + melhor/pior dia
  let alimHtml='';
  // Consistencia de refeicoes
  alimHtml+='<div class="section"><div class="stitle">Consistencia de refeicoes</div><div class="rcard">';
  BL.forEach(b=>{
    const cnt=refCount[b.key]||0;
    const pct=td>0?Math.round((cnt/td)*100):0;
    const color=pct>=80?'var(--green)':pct>=50?'var(--amber)':'var(--red)';
    alimHtml+='<div class="rrow"><span class="rname">'+b.icon+' '+b.label+'</span><span class="rval">'+cnt+'/'+td+'<span class="rpct">'+pct+'%</span></span></div><div class="mini-bar"><div class="mini-fill" style="width:'+pct+'%;background:'+color+'"></div></div>';
  });
  alimHtml+='</div></div>';
  // Habitos ruins
  const badH=getBadHabits();
  if(badH.length>0){
    alimHtml+='<div class="section"><div class="stitle">Habitos alimentares ruins</div><div class="rcard">';
    badH.forEach(h=>{
      const cnt=hc[h.id]||0;const pct=td>0?Math.round((cnt/td)*100):0;
      const color=pct<=20?'var(--green)':pct<=50?'var(--amber)':'var(--red)';
      alimHtml+='<div class="rrow"><span class="rname">'+h.icon+' '+h.name+'</span><span class="rval">'+cnt+'/'+td+' dias<span class="rpct">'+pct+'%</span></span></div><div class="mini-bar"><div class="mini-fill" style="width:'+pct+'%;background:'+color+'"></div></div>';
    });
    alimHtml+='</div></div>';
  }
  // Melhor e pior dia (calorias ingeridas)
  if(nn>0){
    alimHtml+='<div class="section"><div class="stitle">Melhor e pior dia (calorias ingeridas)</div><div class="rcard">';
    if(bestDay){
      const bd=DP[bestDay.getDay()].charAt(0).toUpperCase()+DP[bestDay.getDay()].slice(1);
      alimHtml+='<div class="rrow"><span class="rname" style="color:var(--red)">\uD83D\uDD3A Mais calorias</span><span class="rval" style="color:var(--red)">'+bestDayKcal.toLocaleString('pt-BR')+' kcal</span></div><div style="font-size:12px;color:var(--text3);padding:2px 0 8px">'+bd+', '+bestDay.getDate()+' de '+MP[bestDay.getMonth()]+'</div>';
    }
    if(worstDay){
      const wd=DP[worstDay.getDay()].charAt(0).toUpperCase()+DP[worstDay.getDay()].slice(1);
      alimHtml+='<div class="rrow"><span class="rname" style="color:var(--green)">\uD83D\uDD3B Menos calorias</span><span class="rval" style="color:var(--green)">'+worstDayKcal.toLocaleString('pt-BR')+' kcal</span></div><div style="font-size:12px;color:var(--text3);padding:2px 0 4px">'+wd+', '+worstDay.getDate()+' de '+MP[worstDay.getMonth()]+'</div>';
    }
    alimHtml+='</div></div>';
  }
  document.getElementById('reportAlimContainer').innerHTML=alimHtml;
  const yp=td>0?Math.round((yd/td)*100):0;const yavg=yd>0?parseFloat((yh/yd).toFixed(1)):0;
  document.getElementById('reportYT').innerHTML='<div class="rrow"><span class="rname">\uD83C\uDFA5 Dias trabalhando</span><span class="rval">'+yd+'/'+td+'<span class="rpct">'+yp+'%</span></span></div><div class="mini-bar"><div class="mini-fill" style="width:'+yp+'%;background:#8b5cf6"></div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px"><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Total mes</div><div style="font-weight:700;font-size:16px">'+fmtH(parseFloat(yh.toFixed(1)))+'</div></div><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Media/dia</div><div style="font-weight:700;font-size:16px">'+fmtH(yavg)+'</div></div><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Total projeto</div><div style="font-weight:700;font-size:16px">'+fmtH(parseFloat(hj.toFixed(1)))+'</div></div></div><div style="margin-top:10px;padding-top:10px;border-top:0.5px solid var(--border);font-size:12px;color:var(--text3)">Iniciado em '+ps.getDate()+' de '+MP[ps.getMonth()]+' de '+ps.getFullYear()+' - '+pj+'/'+ptd+' dias com producao</div>';
  if(nn===0){document.getElementById('reportNutri').innerHTML='<span style="font-size:13px;color:var(--text3)">Nenhuma refeicao registrada.</span>';}
  else{const ak=Math.round(nk/nn),ap=Math.round(np/nn),ac=Math.round(nc/nn),ag=Math.round(ng/nn);document.getElementById('reportNutri').innerHTML='<div style="font-size:12px;color:var(--text3);margin-bottom:10px">'+nn+' dias com refeicoes:</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div style="text-align:center;padding:12px;background:var(--bg3);border-radius:8px"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Calorias</div><div style="font-weight:700;font-size:20px;color:var(--orange)">'+ak.toLocaleString('pt-BR')+'</div></div><div style="text-align:center;padding:12px;background:var(--bg3);border-radius:8px"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Proteina</div><div style="font-weight:700;font-size:20px;color:var(--green)">'+ap+'g</div></div><div style="text-align:center;padding:12px;background:var(--bg3);border-radius:8px"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Carboidrato</div><div style="font-weight:700;font-size:20px;color:var(--amber)">'+ac+'g</div></div><div style="text-align:center;padding:12px;background:var(--bg3);border-radius:8px"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Gordura</div><div style="font-weight:700;font-size:20px;color:var(--blue)">'+ag+'g</div></div></div>';}
  const awp=td>0?Math.round((aw/td)*100):0;const avgml=td>0?Math.round(atm/td):0;
  document.getElementById('reportAgua').innerHTML='<div class="rrow"><span class="rname">\uD83D\uDCA7 Dias com 4L</span><span class="rval">'+aw+'/'+td+'<span class="rpct">'+awp+'%</span></span></div><div class="mini-bar"><div class="mini-fill" style="width:'+awp+'%;background:var(--blue)"></div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px"><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Media/dia</div><div style="font-weight:700;font-size:18px;color:var(--blue)">'+avgml.toLocaleString('pt-BR')+' ml</div></div><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Maior</div><div style="font-weight:700;font-size:18px">'+(amax>0?amax.toLocaleString('pt-BR'):0)+' ml</div></div><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Menor</div><div style="font-weight:700;font-size:18px">'+(amin===Infinity?0:amin.toLocaleString('pt-BR'))+' ml</div></div></div>';
  document.getElementById('reportCal').innerHTML=cd===0?'<span style="font-size:13px;color:var(--text3)">Nenhum dado.</span>':'<div class="rrow"><span class="rname">\uD83D\uDD25 Dias registrados</span><span class="rval">'+cd+'/'+td+'</span></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px"><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Media</div><div style="font-weight:700;font-size:18px;color:var(--orange)">'+avgC.toLocaleString('pt-BR')+' kcal</div></div><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Maior</div><div style="font-weight:700;font-size:18px">'+cmax.toLocaleString('pt-BR')+'</div></div><div style="text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:3px">Menor</div><div style="font-weight:700;font-size:18px">'+(cmin===Infinity?0:cmin).toLocaleString('pt-BR')+'</div></div></div>';
}
function changeReportMonth(delta){repM=new Date(repM.getFullYear(),repM.getMonth()+delta,1);renderReport();}

// ========== PDF ==========
function exportPDF(){
  const mes=document.getElementById('reportMonthLabel').textContent;
  const styles='body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#111314;color:#f0f0f0;padding:2rem;max-width:700px;margin:0 auto;}h1{font-size:22px;font-weight:700;margin-bottom:4px;}.sub{font-size:13px;color:#6b7280;margin-bottom:2rem;}h2{font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin:1.5rem 0 .5rem;}.block{background:#1a1d1f;border:0.5px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin-bottom:8px;}.rrow{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:0.5px solid rgba(255,255,255,0.08);font-size:13px;}.rrow:last-child{border-bottom:none;}.rval{font-weight:600;}.rpct{font-size:11px;color:#6b7280;margin-left:4px;}.mini-bar{height:4px;border-radius:2px;background:#222628;margin-top:3px;margin-bottom:5px;overflow:hidden;}.mini-fill{height:100%;border-radius:2px;}.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1rem;}.scard{background:#1a1d1f;border:0.5px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;}.scard-lbl{font-size:10px;color:#6b7280;margin-bottom:4px;}.scard-val{font-size:20px;font-weight:700;}.scard-sub{font-size:10px;color:#6b7280;margin-top:2px;}@media print{body{background:#fff;color:#111;}.block,.scard{background:#f9f9f9;border-color:#ddd;}h1,h2,.rval,.scard-val{color:#111;}}';
  const sections=[{title:'Resumo',el:'summaryGrid'},{title:'Sono',el:'reportSono'}];
  const dynEl=document.getElementById('reportSectionsContainer');
  let body='<h1>Relatorio de habitos</h1><p class="sub">'+mes+'</p>';
  sections.forEach(s=>{const el=document.getElementById(s.el);if(el&&el.innerHTML.trim())body+='<h2>'+s.title+'</h2><div class="block">'+el.innerHTML+'</div>';});
  if(dynEl)body+=dynEl.innerHTML;
  [{title:'YouTube',el:'reportYT'},{title:'Nutricao',el:'reportNutri'},{title:'Calorias',el:'reportCal'},{title:'Agua',el:'reportAgua'}].forEach(s=>{const el=document.getElementById(s.el);if(el&&el.innerHTML.trim())body+='<h2>'+s.title+'</h2><div class="block">'+el.innerHTML+'</div>';});
  const win=window.open('','_blank');
  win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatorio '+mes+'</title><style>'+styles+'</style></head><body>'+body+'</body></html>');
  win.document.close();setTimeout(()=>{win.focus();win.print();},500);
}

// ========== DETALHADO ==========
function renderDetail(){
  const fromVal=document.getElementById('detailFrom').value;const toVal=document.getElementById('detailTo').value;
  if(!fromVal||!toVal)return;
  const from=new Date(fromVal+'T00:00:00');const to=new Date(toVal+'T00:00:00');
  if(from>to){document.getElementById('detailContent').innerHTML='<p style="color:var(--red);font-size:13px">Data inicial maior que final.</p>';return;}
  let html='';
  for(let d=new Date(from);d<=to;d.setDate(d.getDate()+1)){
    const data=ld(d);const dow=DP[d.getDay()].charAt(0).toUpperCase()+DP[d.getDay()].slice(1);
    const dateStr=dow+', '+d.getDate()+' de '+MP[d.getMonth()]+' de '+d.getFullYear();
    const done=getDone(d,data),app=getApp(d);const pct=app>0?Math.round((done/app)*100):0;
    const pcolor=pct===100?'var(--green)':pct>=50?'var(--amber)':'var(--red)';
    html+='<div style="background:var(--bg2);border:0.5px solid var(--border);border-radius:12px;margin-bottom:12px;overflow:hidden">';
    html+='<div style="padding:12px 14px;border-bottom:0.5px solid var(--border);display:flex;align-items:center;justify-content:space-between"><span style="font-size:15px;font-weight:600">'+dateStr+'</span><span style="font-size:12px;font-weight:600;color:'+pcolor+'">'+done+'/'+app+' habitos</span></div>';
    const sonoH=calcSono(data.sono_inicio,data.sono_fim);const aml=data.agua_ml||0;
    html+='<div style="padding:10px 14px;border-bottom:0.5px solid var(--border);display:flex;gap:16px;flex-wrap:wrap">';
    html+='<span style="font-size:12px;color:var(--text3)">\uD83D\uDE34 '+(sonoH!==null?fmtSono(sonoH):'\u2014')+'</span>';
    html+='<span style="font-size:12px;color:var(--text3)">\uD83D\uDCA7 '+(aml>0?aml.toLocaleString('pt-BR')+' ml':'\u2014')+'</span>';
    if(data.calorias)html+='<span style="font-size:12px;color:var(--text3)">\uD83D\uDD25 '+data.calorias.toLocaleString('pt-BR')+' kcal</span>';
    html+='</div>';
    const habFeitos=[];
    getNormalHabits().forEach(h=>{if(isHabitActive(h,d)&&data[h.id])habFeitos.push(h.icon+' '+h.name);});
    if(data.yt_trabalhou)habFeitos.push('\uD83C\uDFA5 YouTube'+(data.yt_horas?' ('+fmtH(data.yt_horas)+')':''));
    if(habFeitos.length>0){html+='<div style="padding:8px 14px;border-bottom:0.5px solid var(--border);display:flex;gap:5px;flex-wrap:wrap">';habFeitos.forEach(h=>html+='<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:var(--green-dim);color:var(--green);font-weight:600">'+h+'</span>');html+='</div>';}
    let temRef=false,refHtml='',totalK=0,totalP=0,totalC=0,totalG=0;
    BL.forEach(b=>{(data['ref_'+b.key]||[]).forEach(r=>{temRef=true;if(r.macros){totalK+=r.macros.kcal;totalP+=r.macros.prot_g;totalC+=r.macros.carb_g;totalG+=r.macros.gord_g;}refHtml+='<div style="padding:6px 14px;border-bottom:0.5px solid var(--border);display:flex;align-items:center;gap:8px"><span>'+b.icon+'</span><span style="font-size:12px;color:var(--text3);flex:1">'+r.desc+'</span>'+(r.macros?'<span style="font-size:11px;color:var(--orange);font-weight:600">'+r.macros.kcal+' kcal</span>':'')+'</div>';});});
    if(temRef){html+=refHtml+'<div style="padding:8px 14px;display:flex;gap:5px;flex-wrap:wrap;background:var(--bg3)"><span class="mp mk">'+totalK+' kcal</span><span class="mp mp2">P '+totalP+'g</span><span class="mp mc">C '+totalC+'g</span><span class="mp mg">G '+totalG+'g</span></div>';}
    else{html+='<div style="padding:8px 14px;font-size:12px;color:var(--text3);font-style:italic">Nenhuma refeicao</div>';}
    html+='</div>';
  }
  if(!html)html='<p style="font-size:13px;color:var(--text3)">Nenhum dado no periodo.</p>';
  document.getElementById('detailContent').innerHTML=html;
}
function exportDetailPDF(){
  const content=document.getElementById('detailContent').innerHTML;if(!content)return;
  const styles='body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#111314;color:#f0f0f0;padding:2rem;max-width:700px;margin:0 auto;}.mp{font-size:11px;padding:2px 7px;border-radius:20px;font-weight:600;display:inline-block;margin:2px;}.mk{background:rgba(249,115,22,.15);color:#f97316;}.mp2{background:rgba(34,197,94,.12);color:#22c55e;}.mc{background:rgba(245,158,11,.15);color:#f59e0b;}.mg{background:rgba(59,130,246,.15);color:#3b82f6;}@media print{body{background:#fff;color:#111;}}';
  const win=window.open('','_blank');
  win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Detalhado</title><style>'+styles+'</style></head><body>'+content+'</body></html>');
  win.document.close();setTimeout(()=>{win.focus();win.print();},500);
}

// ========== ABA TREINOS ==========
let treinoM=new Date(new Date().getFullYear(),new Date().getMonth(),1);
function changeTreinoMonth(delta){treinoM=new Date(treinoM.getFullYear(),treinoM.getMonth()+delta,1);renderTreinos();}

function getTrainingHabits(){return getHabits('treino');}

function renderTreinos(){
  document.getElementById('treinoMonthLabel').textContent=MP[treinoM.getMonth()]+' '+treinoM.getFullYear();
  const today=new Date();today.setHours(0,0,0,0);
  const ld2=new Date(treinoM.getFullYear(),treinoM.getMonth()+1,0);
  const lv=ld2>today?today:ld2;
  const monthStart=new Date(treinoM.getFullYear(),treinoM.getMonth(),1);
  const habits=getTrainingHabits();

  // Encontrar primeiro dia com dados no mes
  let firstDataDay=null;
  for(let d=new Date(monthStart);d<=lv;d.setDate(d.getDate()+1)){
    if(Object.keys(DATA.days[dk(d)]||{}).length>0){firstDataDay=new Date(d);break;}
  }
  if(!firstDataDay)firstDataDay=new Date(monthStart);
  const dataStart=firstDataDay;

  // Coletar dados do mes
  let totalDias=0;
  let diasComTreino=0;
  const stats={};
  habits.forEach(h=>{stats[h.id]={name:h.name,icon:h.icon,done:0,nao_fui:0,sem_aula:0,total:0,streak:0,currentStreak:0};});
  const dailyData=[];// {date, treinos:[], skips:{}}
  let melhorDia=null,melhorQtd=0,piorDia=null,piorQtd=999;
  const avulsos=[];

  for(let d=new Date(dataStart);d<=lv;d.setDate(d.getDate()+1)){
    totalDias++;
    const data=DATA.days[dk(d)]||{};
    const skips=data._skips||{};
    let treinosDia=0;
    const dayHabits=[];

    habits.forEach(h=>{
      const reason=typeof skips==='object'&&!Array.isArray(skips)?skips[h.id]:null;
      if(reason==='sem_aula'){
        stats[h.id].sem_aula++;
        dayHabits.push({id:h.id,status:'sem_aula'});
      } else if(reason==='nao_fui'){
        stats[h.id].nao_fui++;
        stats[h.id].total++;
        dayHabits.push({id:h.id,status:'nao_fui'});
      } else if(data[h.id]){
        stats[h.id].done++;
        stats[h.id].total++;
        treinosDia++;
        dayHabits.push({id:h.id,status:'done'});
      } else {
        stats[h.id].total++;
        dayHabits.push({id:h.id,status:'none'});
      }
    });

    // Treinos avulsos do dia
    const dayAvulsos=(data._oneTimeHabits||[]).filter(h=>h.section==='treino');
    dayAvulsos.forEach(a=>{
      if(data[a.id]){treinosDia++;avulsos.push({date:new Date(d),name:a.name,icon:a.icon});}
    });

    if(treinosDia>0)diasComTreino++;
    dailyData.push({date:new Date(d),count:treinosDia,habits:dayHabits});

    if(treinosDia>melhorQtd){melhorQtd=treinosDia;melhorDia=new Date(d);}
    if(treinosDia<piorQtd){piorQtd=treinosDia;piorDia=new Date(d);}
  }

  // Calcular streaks por modalidade
  habits.forEach(h=>{
    let s=0,maxS=0;
    for(let d=new Date(dataStart);d<=lv;d.setDate(d.getDate()+1)){
      const data=DATA.days[dk(d)]||{};
      const skips=data._skips||{};
      const reason=typeof skips==='object'&&!Array.isArray(skips)?skips[h.id]:null;
      if(data[h.id]){s++;if(s>maxS)maxS=s;}
      else if(reason==='sem_aula'){/* nao quebra streak */}
      else{s=0;}
    }
    stats[h.id].streak=maxS;
    // current streak (de hoje pra tras)
    let cs=0;
    for(let d=new Date(lv);d>=dataStart;d.setDate(d.getDate()-1)){
      const data=DATA.days[dk(d)]||{};
      const skips=data._skips||{};
      const reason=typeof skips==='object'&&!Array.isArray(skips)?skips[h.id]:null;
      if(data[h.id])cs++;
      else if(reason==='sem_aula'){/* nao quebra */}
      else break;
    }
    stats[h.id].currentStreak=cs;
  });

  // Media semanal
  const semanas=Math.max(1,Math.ceil(totalDias/7));
  const mediaSemanal=(diasComTreino/semanas).toFixed(1);

  let html='';

  // ===== 1. RESUMO GERAL =====
  html+='<div class="section"><div class="stitle">Resumo geral</div>';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">';
  html+='<div class="scard"><div class="scard-lbl">Dias com treino</div><div class="scard-val" style="color:var(--green)">'+diasComTreino+'</div><div class="scard-sub">de '+totalDias+' dias</div></div>';
  html+='<div class="scard"><div class="scard-lbl">Sem treino</div><div class="scard-val" style="color:var(--red)">'+(totalDias-diasComTreino)+'</div><div class="scard-sub">dias</div></div>';
  html+='<div class="scard"><div class="scard-lbl">Media semanal</div><div class="scard-val" style="color:var(--amber)">'+mediaSemanal+'</div><div class="scard-sub">treinos/sem</div></div>';
  html+='</div></div>';

  // ===== 2. POR MODALIDADE =====
  html+='<div class="section"><div class="stitle">Por modalidade</div>';
  habits.forEach(h=>{
    const s=stats[h.id];
    const diasEfetivos=s.total;// exclui sem_aula
    const pct=diasEfetivos>0?Math.round((s.done/diasEfetivos)*100):0;
    const color=pct>=80?'var(--green)':pct>=50?'var(--amber)':'var(--red)';
    html+='<div class="rcard" style="margin-bottom:8px">';
    html+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:20px">'+h.icon+'</span><span style="font-size:16px;font-weight:600;flex:1">'+h.name+'</span><span style="font-size:22px;font-weight:700;color:'+color+'">'+pct+'%</span></div>';
    html+='<div class="mini-bar" style="height:6px;margin-bottom:10px"><div class="mini-fill" style="width:'+pct+'%;background:'+color+'"></div></div>';
    html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;text-align:center">';
    html+='<div><div style="font-size:10px;color:var(--text3);margin-bottom:2px">Feitos</div><div style="font-weight:700;color:var(--green)">'+s.done+'</div></div>';
    html+='<div><div style="font-size:10px;color:var(--text3);margin-bottom:2px">Faltas</div><div style="font-weight:700;color:var(--red)">'+s.nao_fui+'</div></div>';
    html+='<div><div style="font-size:10px;color:var(--text3);margin-bottom:2px">Sem aula</div><div style="font-weight:700;color:var(--text3)">'+s.sem_aula+'</div></div>';
    html+='<div><div style="font-size:10px;color:var(--text3);margin-bottom:2px">Sequencia</div><div style="font-weight:700;color:var(--amber)">'+s.currentStreak+'</div></div>';
    html+='</div>';
    html+='</div>';
  });
  html+='</div>';

  // ===== 3. CALENDARIO DE TREINOS (HEATMAP) =====
  html+='<div class="section"><div class="stitle">Calendario de treinos</div>';
  html+='<div class="rcard">';
  // Legenda de cores
  html+='<div style="display:flex;gap:12px;margin-bottom:10px;font-size:11px;color:var(--text3)">';
  html+='<span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:3px;background:var(--green);display:inline-block"></span> 3+</span>';
  html+='<span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:3px;background:rgba(34,197,94,.5);display:inline-block"></span> 2</span>';
  html+='<span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:3px;background:rgba(34,197,94,.25);display:inline-block"></span> 1</span>';
  html+='<span style="display:flex;align-items:center;gap:4px"><span style="width:12px;height:12px;border-radius:3px;background:var(--bg3);display:inline-block"></span> 0</span>';
  html+='</div>';
  // Week labels
  html+='<div class="wklbl"><div class="wl">D</div><div class="wl">S</div><div class="wl">T</div><div class="wl">Q</div><div class="wl">Q</div><div class="wl">S</div><div class="wl">S</div></div>';
  html+='<div class="sgrid2">';
  const fd=new Date(treinoM.getFullYear(),treinoM.getMonth(),1);
  for(let i=0;i<fd.getDay();i++)html+='<div class="sday"></div>';
  for(let d=1;d<=ld2.getDate();d++){
    const dd=new Date(treinoM.getFullYear(),treinoM.getMonth(),d);
    const fut=dd>today;
    let bg='var(--bg3)';
    if(!fut){
      const entry=dailyData.find(x=>dk(x.date)===dk(dd));
      const cnt=entry?entry.count:0;
      if(cnt>=3)bg='var(--green)';
      else if(cnt===2)bg='rgba(34,197,94,.5)';
      else if(cnt===1)bg='rgba(34,197,94,.25)';
    }
    const isToday=dk(dd)===dk(today)?' today':'';
    html+='<div class="sday'+isToday+'" style="background:'+bg+';color:'+(bg==='var(--bg3)'?'var(--text3)':'#fff')+';font-weight:'+(bg!=='var(--bg3)'?'600':'400')+'">'+d+'</div>';
  }
  html+='</div></div></div>';

  // ===== 4. CONSISTENCIA SEMANAL =====
  html+='<div class="section"><div class="stitle">Consistencia semanal</div>';
  html+='<div class="rcard">';
  let weekNum=1,weekStart2=new Date(dataStart),weekTreinos=0,weekDias=0;
  const weeks=[];
  for(let d=new Date(dataStart);d<=lv;d.setDate(d.getDate()+1)){
    weekDias++;
    const entry=dailyData.find(x=>dk(x.date)===dk(d));
    if(entry)weekTreinos+=entry.count;
    if(d.getDay()===6||dk(d)===dk(lv)){
      weeks.push({num:weekNum,treinos:weekTreinos,dias:weekDias});
      weekNum++;weekTreinos=0;weekDias=0;
    }
  }
  const maxWeek=Math.max(...weeks.map(w=>w.treinos),1);
  weeks.forEach(w=>{
    const pct=Math.round((w.treinos/maxWeek)*100);
    const color=w.treinos>=4?'var(--green)':w.treinos>=2?'var(--amber)':'var(--red)';
    html+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">';
    html+='<span style="font-size:12px;color:var(--text3);min-width:65px">Semana '+w.num+'</span>';
    html+='<div style="flex:1;height:20px;background:var(--bg3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:4px;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;font-size:11px;font-weight:600;color:#fff;min-width:30px">'+w.treinos+'</div></div>';
    html+='<span style="font-size:11px;color:var(--text3);min-width:40px">'+w.dias+' dias</span>';
    html+='</div>';
  });
  html+='</div></div>';

  // ===== 5. TREINOS AVULSOS =====
  if(avulsos.length>0){
    html+='<div class="section"><div class="stitle">Treinos avulsos do mes</div>';
    html+='<div class="rcard">';
    avulsos.forEach(a=>{
      const dateStr=a.date.getDate()+' de '+MP[a.date.getMonth()];
      html+='<div class="rrow"><span class="rname">'+a.icon+' '+a.name+'</span><span style="font-size:12px;color:var(--text3)">'+dateStr+'</span></div>';
    });
    html+='</div></div>';
  }

  document.getElementById('treinoContent').innerHTML=html;
}

function exportTreinoPDF(){
  const content=document.getElementById('treinoContent').innerHTML;if(!content)return;
  const mes=document.getElementById('treinoMonthLabel').textContent;
  const styles='body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#111314;color:#f0f0f0;padding:2rem;max-width:700px;margin:0 auto;}h1{font-size:22px;font-weight:700;margin-bottom:4px;}.sub{font-size:13px;color:#6b7280;margin-bottom:2rem;}.stitle{font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin:1.5rem 0 .5rem;}.rcard{background:#1a1d1f;border:0.5px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin-bottom:8px;}.rrow{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:0.5px solid rgba(255,255,255,0.08);font-size:13px;}.rrow:last-child{border-bottom:none;}.mini-bar{height:6px;border-radius:3px;background:#222628;overflow:hidden;margin-bottom:5px;}.mini-fill{height:100%;border-radius:3px;}.scard{background:#1a1d1f;border:0.5px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;}.scard-lbl{font-size:10px;color:#6b7280;margin-bottom:4px;}.scard-val{font-size:20px;font-weight:700;}.scard-sub{font-size:10px;color:#6b7280;margin-top:2px;}.sgrid2{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}.sday{aspect-ratio:1;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;}.wklbl{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:4px;}.wl{font-size:10px;color:#6b7280;text-align:center;font-weight:600;}@media print{body{background:#fff;color:#111;}.rcard,.scard{background:#f9f9f9;border-color:#ddd;}}';
  const win=window.open('','_blank');
  win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Treinos - '+mes+'</title><style>'+styles+'</style></head><body><h1>Relatorio de Treinos</h1><p class="sub">'+mes+'</p>'+content+'</body></html>');
  win.document.close();setTimeout(()=>{win.focus();win.print();},500);
}
