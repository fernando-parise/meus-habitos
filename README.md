# Meus Habitos

App pessoal de habitos diarios com 3 modulos integrados, feito para rodar local no PC e visualizar no celular via sincronizacao com Google Drive.

## Modulos

### Habitos
- Tracker diario com habitos dinamicos (adicionar/remover)
- Registro de sono (dormiu/acordou, qualidade)
- Controle de agua (meta 4L/dia)
- Alimentacao com macros (kcal, proteina, carbo, gordura)
- Importacao de refeicoes via codigo MACRO (integracao com Claude)
- Calorias queimadas (smartwatch)
- Canal do YouTube (horas trabalhadas, streak)
- Treinos com sistema de skip (sem aula / nao fui) e treinos avulsos
- Calendario mensal com heatmap
- Relatorio mensal completo com exportacao PDF
- Relatorio detalhado por periodo
- Aba dedicada de treinos com estatisticas por modalidade

### Estudo Biblico
- Biblia King James Fiel completa (66 livros, 1.189 capitulos)
- Plano de leitura de 595 dias cobrindo a Biblia inteira
- Versiculo chave do dia
- Leitor de capitulo completo
- Anotacoes rapidas por dia
- Diario espiritual
- Progresso visual com barra e percentual

### Lei da Atracao
- Lista de afirmacoes personalizaveis
- Progresso diario com anel circular SVG
- Mensagens motivacionais por etapa
- Adicionar/remover afirmacoes
- Suporte a texto com quebras de linha

## Arquitetura

```
meus-habitos/
  habitos.html          # App principal (PC)
  viewer.html           # Viewer somente leitura (celular)
  server.js             # Servidor Node.js (Express-like, zero dependencias)
  habitos.json          # Dados do usuario (ignorado no git)
  iniciar.bat           # Inicia servidor em background + abre navegador
  parar.bat             # Para o servidor
  resetar.bat           # Reseta dados para estado inicial
  resetar-dados.js      # Script de reset
  js/
    main.js             # Navegacao entre apps + init
    habitos-app.js      # Logica do modulo de habitos
    bible-app.js        # Logica do estudo biblico
    bible-data.js       # Plano de 17 dias original (Salmos e mais)
    biblia-completa.json # Biblia KJF completa em JSON
    biblia-kjf-raw.json # Dados brutos da Biblia
    loa-app.js          # Logica da lei da atracao
    loa-data.js         # Afirmacoes e mensagens padrao
```

## Como usar

### PC (leitura + escrita)

**Requisitos:** Node.js instalado

1. Dois cliques em `iniciar.bat`
2. O navegador abre automaticamente em `http://localhost:3000`
3. Para parar o servidor: dois cliques em `parar.bat`

### Celular (somente leitura)

**Requisitos:** Simple HTTP Server (Play Store) + FolderSync

1. Configure o FolderSync para sincronizar a pasta do Google Drive para o celular
2. No Simple HTTP Server, aponte o Root Folder para a pasta sincronizada
3. Clique START
4. Abra o Chrome: `http://localhost:8080/viewer.html`
5. Opcional: "Adicionar a tela inicial" para criar atalho como app

### Sincronizacao

O fluxo de dados e unidirecional:

```
PC (edita) --> habitos.json --> Google Drive --> FolderSync --> Celular (visualiza)
```

## Stack

- **Frontend:** HTML + CSS + JavaScript puro (zero frameworks)
- **Backend:** Node.js puro (zero dependencias externas)
- **UI:** Dark theme, responsivo, inspirado em apps modernos
- **Componentes visuais:** DevExpress-style cards, SVG progress rings
- **Banco de dados:** Arquivo JSON local

## Importacao de refeicoes

O app aceita codigos no formato:

```
MACRO:refeicao|kcal|proteina|carbo|gordura|descricao
```

Exemplo:
```
MACRO:almoco|620|42|55|10|2 files de peixe grelhado, arroz, beterraba
```

---

Desenvolvido com auxilio do [Claude Code](https://claude.ai/claude-code)
