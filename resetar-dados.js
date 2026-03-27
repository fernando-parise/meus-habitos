const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'habitos.json');

try {
  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);

  // Backup antes de resetar
  const backupName = 'habitos_backup_' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
  fs.writeFileSync(path.join(__dirname, backupName), raw, 'utf8');
  console.log('Backup salvo: ' + backupName);

  // Manter habits e loa.affirmations
  const habits = data.habits || [];
  const affirmations = (data.loa && data.loa.affirmations) ? data.loa.affirmations : [];

  // Data de hoje
  const today = new Date().toISOString().split('T')[0];

  // Novo JSON zerado
  const newData = {
    project_start: today,
    usage_start: today,
    days: {},
    habits: habits,
    bible: {
      currentDayIdx: 0,
      quickNote: "",
      diary: ""
    },
    loa: {
      affirmations: affirmations,
      done: {}
    }
  };

  fs.writeFileSync(file, JSON.stringify(newData, null, 2), 'utf8');
  console.log('');
  console.log('=== RESET COMPLETO ===');
  console.log('Habitos mantidos: ' + habits.length);
  console.log('Afirmacoes mantidas: ' + affirmations.length);
  console.log('Dias zerados: ' + Object.keys(data.days || {}).length + ' removidos');
  console.log('Estudo biblico: voltou ao dia 1');
  console.log('Data de inicio: ' + today);
  console.log('');

} catch (e) {
  console.error('Erro ao resetar:', e.message);
}
