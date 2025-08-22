// Fasom Cool Blackjack
const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const icons = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
const values = [
  { name: 'A', value: 11 },
  { name: '2', value: 2 },
  { name: '3', value: 3 },
  { name: '4', value: 4 },
  { name: '5', value: 5 },
  { name: '6', value: 6 },
  { name: '7', value: 7 },
  { name: '8', value: 8 },
  { name: '9', value: 9 },
  { name: '10', value: 10 },
  { name: 'J', value: 10 },
  { name: 'Q', value: 10 },
  { name: 'K', value: 10 }
];

let deck, playerHand, dealerHand, gameOver = false;
let stats = { games: 0, wins: 0 };

function createDeck() {
  let d = [];
  for (let s of suits) {
    for (let v of values) {
      d.push({ ...v, suit: s });
    }
  }
  return d.sort(() => Math.random() - 0.5);
}

function handValue(hand) {
  let val = hand.reduce((a, c) => a + c.value, 0);
  let aces = hand.filter(c => c.name === 'A').length;
  while (val > 21 && aces--) val -= 10;
  return val;
}

function renderCard(card, animate) {
  return `<span class="card ${card.suit}${animate ? ' dealer-animate' : ''}"><span class="value">${card.name}</span><span class="icon">${icons[card.suit]}</span></span>`;
}

function renderHand(hand, animateIndex = -1) {
  return `<div class="cards">` + hand.map((c, i) => renderCard(c, i === animateIndex)).join('') + `</div>`;
}

function showRules() {
  document.getElementById('rules').innerHTML = `
    <b>Rules:</b><br>
    - Get as close to 21 as possible without going over.<br>
    - Face cards are worth 10, Aces are 1 or 11.<br>
    - Dealer hits until 17+.<br>
  `;
}

let dealerAnimIndex = -1;
function renderGame() {
  const game = document.getElementById('game');
  let playerVal = handValue(playerHand);
  let dealerVal = handValue(dealerHand);
  let status = '';
  if (gameOver) {
    if (playerVal > 21) status = 'You busted! 💥';
    else if (dealerVal > 21) status = 'Dealer busted! You win! 🎉';
    else if (playerVal > dealerVal) status = 'You win! 🎉';
    else if (playerVal < dealerVal) status = 'Dealer wins! 😢';
    else status = 'Push! 🤝';
  }
  game.innerHTML = `
    <div class="hand-row dealer-row">
      <div class="hand-label">Dealer</div>
      ${renderHand(gameOver ? dealerHand : [dealerHand[0], {name:'?', suit:'spades'}], dealerAnimIndex)}
      <div class="hand-value">${gameOver ? dealerVal : ''}</div>
    </div>
    <div class="status">${status}</div>
    <div class="hand-row player-row">
      <div class="hand-label">Your Hand</div>
      ${renderHand(playerHand)}
      <div class="hand-value">${playerVal}</div>
    </div>
    <div>
      ${!gameOver ? '<button onclick="hit()">Hit</button><button onclick="stand()">Stand</button>' : '<button onclick="startGame()">Restart</button>'}
    </div>
  `;
  updateWinrate();
}

function updateWinrate() {
  const wr = document.getElementById('winrate');
  if (!wr) return;
  let rate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
  wr.textContent = `Winrate: ${rate}%`;
}

function hit() {
  if (gameOver) return;
  playerHand.push(deck.pop());
  if (handValue(playerHand) > 21) {
    gameOver = true;
    // Player busts, count as a loss
    stats.games++;
    renderGame();
    return;
  }
  renderGame();
}

async function stand() {
  if (gameOver) return;
  dealerAnimIndex = -1;
  while (handValue(dealerHand) < 17) {
    dealerHand.push(deck.pop());
    dealerAnimIndex = dealerHand.length - 1;
    renderGame();
    await new Promise(r => setTimeout(r, 500));
  }
  dealerAnimIndex = -1;
  gameOver = true;
  // Update stats
  let playerVal = handValue(playerHand);
  let dealerVal = handValue(dealerHand);
  stats.games++;
  if (playerVal > 21) {
    // Player busts, counts as loss (do not increment wins)
  } else if (dealerVal > 21 || playerVal > dealerVal) {
    stats.wins++;
  }
  renderGame();
}

function startGame() {
  deck = createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  gameOver = false;
  dealerAnimIndex = -1;
  renderGame();
}

document.getElementById('helpBtn').onclick = function() {
  const rules = document.getElementById('rules');
  if (rules.style.display === 'none') {
    showRules();
    rules.style.display = 'block';
  } else {
    rules.style.display = 'none';
  }
};

startGame();
