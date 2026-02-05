// ===== CONFIGURAÇÃO FIREBASE =====
const firebaseConfig = {
  apiKey: "SEU_API_KEY",
  authDomain: "SEU_PROJECT.firebaseapp.com",
  databaseURL: "https://SEU_PROJECT.firebaseio.com",
  projectId: "SEU_PROJECT",
  storageBucket: "SEU_PROJECT.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const playersRef = db.ref('players');

// ===== CONFIGURAÇÃO DA DATA DO JOGO =====
const gameDate = new Date();
gameDate.setHours(23,59,59);
document.getElementById('gameDateInfo').innerText = `Data da resenha: ${gameDate.toLocaleDateString()}`;

// ===== RESET AUTOMÁTICO =====
const now = new Date();
if(now > gameDate){
  playersRef.remove();
}

// ===== FUNÇÃO DE ADICIONAR JOGADOR =====
document.getElementById('joinBtn').addEventListener('click', () => {
  const name = document.getElementById('playerName').value.trim();
  const type = document.getElementById('playerType').value;
  if(!name) return alert('Digite seu nome!');

  playersRef.once('value', snapshot => {
    const players = snapshot.val() || [];
    const playerArray = Object.values(players);

    const goalkeepers = playerArray.filter(p => p.type==='goalkeeper').length;
    const linePlayers = playerArray.filter(p => p.type==='line').length;
    const maxLine = goalkeepers>0 ? 15 : 18;
    const maxGoal = 2;

    if(type==='line' && linePlayers >= maxLine) return alert('Limite de jogadores de linha atingido!');
    if(type==='goalkeeper' && goalkeepers >= maxGoal) return alert('Limite de goleiros atingido!');

    playersRef.push({name, type});
    document.getElementById('playerName').value = '';
  });
});

// ===== FUNÇÃO DE ATUALIZAR LISTA =====
playersRef.on('value', snapshot => {
  const listEl = document.getElementById('playerList');
  listEl.innerHTML = '';
  const players = snapshot.val() || {};
  const playerArray = Object.values(players);

  playerArray.forEach((p, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${index+1}. ${p.name}</span><span>${p.type==='goalkeeper'?'Goleiro':'Linha'}</span>`;
    listEl.appendChild(li);
  });

  const goalkeepers = playerArray.filter(p => p.type==='goalkeeper').length;
  const linePlayers = playerArray.filter(p => p.type==='line').length;
  const maxLine = goalkeepers>0 ? 15 : 18;
  const maxGoal = 2;
  document.getElementById('status').innerText = `Jogadores de linha: ${linePlayers}/${maxLine} | Goleiros: ${goalkeepers}/${maxGoal}`;

  // Bloquear botão se limite atingido
  const joinBtn = document.getElementById('joinBtn');
  joinBtn.disabled = (linePlayers >= maxLine && document.getElementById('playerType').value==='line') ||
                     (goalkeepers >= maxGoal && document.getElementById('playerType').value==='goalkeeper');
});
