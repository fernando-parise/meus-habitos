// ========== GITHUB GIST API LAYER ==========
var GH = {
  token: '',
  gistId: '',
  configured: false,

  init: function() {
    var cfg = localStorage.getItem('gh_config');
    if (cfg) {
      try {
        var c = JSON.parse(cfg);
        this.token = c.token || '';
        this.gistId = c.gistId || '';
        this.configured = !!(this.token && this.gistId);
      } catch(e) { this.configured = false; }
    }
    return this.configured;
  },

  saveConfig: function() {
    localStorage.setItem('gh_config', JSON.stringify({
      token: this.token, gistId: this.gistId
    }));
    this.configured = true;
  },

  clearConfig: function() {
    localStorage.removeItem('gh_config');
    this.token = ''; this.gistId = '';
    this.configured = false;
  },

  isLocal: function() {
    var h = location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.');
  },

  load: async function() {
    var r = await fetch('https://api.github.com/gists/' + this.gistId, {
      headers: {
        'Authorization': 'Bearer ' + this.token,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!r.ok) throw new Error('Gist API erro: ' + r.status);
    var json = await r.json();
    var file = json.files['habitos.json'];
    if (!file) throw new Error('Arquivo habitos.json nao encontrado no Gist');
    // If content is truncated, fetch raw URL
    var content = file.content;
    if (file.truncated && file.raw_url) {
      var raw = await fetch(file.raw_url, {
        headers: { 'Authorization': 'Bearer ' + this.token }
      });
      content = await raw.text();
    }
    return JSON.parse(content);
  },

  save: async function(data) {
    var r = await fetch('https://api.github.com/gists/' + this.gistId, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + this.token,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'habitos.json': {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });
    if (!r.ok) throw new Error('Gist API erro ao salvar: ' + r.status);
    return true;
  },

  // Create a new private gist with habitos.json
  createGist: async function(token, initialData) {
    var r = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'Meus Habitos - dados',
        public: false,
        files: {
          'habitos.json': {
            content: JSON.stringify(initialData || {}, null, 2)
          }
        }
      })
    });
    if (!r.ok) throw new Error('Erro ao criar Gist: ' + r.status);
    var json = await r.json();
    return json.id;
  },

  test: async function(token, gistId) {
    var r = await fetch('https://api.github.com/gists/' + gistId, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!r.ok) return false;
    var json = await r.json();
    return !!json.files['habitos.json'];
  }
};
