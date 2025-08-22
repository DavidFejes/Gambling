
// Casino-style Roulette Wheel
const numbers = [0, ...Array.from({length: 36}, (_, i) => i + 1)];
const colors = [
  'green',
  'red','black','red','black','red','black','red','black','red','black',
  'black','red','black','red','black','red','black','red','red','black',
  'red','black','red','black','red','black','red','black','red','black',
  'black','red','black','red','black','red','black','red','black','red'
];

function renderSVGWheel(size = 600) {
  const cx = size/2, cy = size/2, r = size/2-16;
  const n = numbers.length;
  let svg = `<svg width="100%" height="100%" viewBox="0 0 ${size} ${size}">`;
  for(let i=0; i<n; ++i) {
    const start = (i/n)*2*Math.PI - Math.PI/2;
    const end = ((i+1)/n)*2*Math.PI - Math.PI/2;
    const x1 = cx + r*Math.cos(start), y1 = cy + r*Math.sin(start);
    const x2 = cx + r*Math.cos(end), y2 = cy + r*Math.sin(end);
    const largeArc = 0;
    const color = colors[i]==='red'? '#e53935' : colors[i]==='black'? '#222' : '#43cea2';
    svg += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z" fill="${color}" stroke="#fff" stroke-width="2"/>`;
    // Number label
    const labelAngle = (start+end)/2;
    const lx = cx + (r-38)*Math.cos(labelAngle);
    const ly = cy + (r-38)*Math.sin(labelAngle);
    svg += `<g>
      <circle cx="${lx}" cy="${ly}" r="22" fill="#fff" stroke="#222" stroke-width="2"/>
      <text x="${lx}" y="${ly+7}" text-anchor="middle" font-size="22" font-family="Segoe UI,Arial" font-weight="bold" fill="#222">${numbers[i]}</text>
    </g>`;
  }
  svg += `<circle cx="${cx}" cy="${cy}" r="54" fill="#222" stroke="#fff" stroke-width="4"/>`;
  svg += `</svg>`;
  return svg;
}

function renderControls() {
  const controls = document.getElementById('controls');
  controls.innerHTML = `
    <label for="bet-number">Number:</label>
    <input type="number" id="bet-number" min="0" max="36" placeholder="0-36">
    <span style="font-weight:bold; margin:0 10px;">or</span>
    <label class="bet-color"><input type="radio" name="bet-color" value="none" checked>None</label>
    <label class="bet-color"><input type="radio" name="bet-color" value="red">Red</label>
    <label class="bet-color"><input type="radio" name="bet-color" value="black">Black</label>
    <button id="spin-btn" type="button">Spin</button>
  `;
  const betNumber = document.getElementById('bet-number');
  const colorRadios = Array.from(document.querySelectorAll('input[name="bet-color"]'));
  betNumber.addEventListener('input', () => {
    if (betNumber.value !== "" && !isNaN(betNumber.value)) {
      colorRadios.forEach(r => r.checked = r.value === 'none');
    }
  });
  colorRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value !== 'none' && radio.checked) {
        betNumber.value = '';
      }
    });
  });
  document.getElementById('spin-btn').onclick = spinRoulette;
}



let spinning = false;
let stats = { games: 0, wins: 0 };
function updateWinrate() {
  const wr = document.getElementById('winrate');
  if (!wr) return;
  let rate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
  wr.textContent = `Winrate: ${rate}%`;
}

function showRules() {
  document.getElementById('rules').innerHTML = `
    <b>Roulette Rules:</b><br>
    - Pick a number (0-36) and/or bet on red or black.<br>
    - If you hit the number, you win!<br>
    - If you bet on a color and it matches, you win!<br>
    - You can bet on both at once.<br>
  `;
}

function spinRoulette() {
  if (spinning) return;
  const resultBox = document.getElementById('result');
  // Hide result box immediately on spin
  resultBox.innerHTML = '';
  resultBox.style.display = 'none';
  // Show again only if needed below
  const betNumberInput = document.getElementById('bet-number');
  const bet = parseInt(betNumberInput.value);
  const betColor = document.querySelector('input[name="bet-color"]:checked').value;
  // Only allow one bet type
  if ((betColor !== 'none' && betNumberInput.value !== "") || (betColor === 'none' && betNumberInput.value === "")) {
    resultBox.innerHTML = '<span style="color:#ffd600">Choose either a number or a color!</span>';
    // Hide error after next valid spin
    const hideError = () => {
      if ((betColor !== 'none' && betNumberInput.value === "") || (betColor === 'none' && betNumberInput.value !== "")) {
        resultBox.innerHTML = '';
        resultBox.style.display = 'none';
        document.getElementById('spin-btn').removeEventListener('click', hideError);
      }
    };
    document.getElementById('spin-btn').addEventListener('click', hideError);
    return;
  }
  const result = Math.floor(Math.random() * 37);
  const wheel = document.getElementById('roulette-wheel');
  const n = numbers.length;
  const anglePer = 360 / n;
  // Spin at least 4 full turns + land on result
  const spinTo = 4*360 + (360 - result*anglePer - anglePer/2);
  spinning = true;
  wheel.style.transition = 'transform 4.2s cubic-bezier(.17,.67,.45,1.2)';
  wheel.style.transform = `rotate(${spinTo}deg)`;
  let win = false;
  setTimeout(() => {
    spinning = false;
    stats.games++;
    let msg = `Result: <span style=\"color:${colors[result]}\">${result}</span> `;
    if (bet === result) {
      win = true;
      stats.wins++;
      msg += '<br><span style=\"color:#43cea2;font-size:1.3em;">You win! 🎉</span>';
    } else if (betColor !== 'none' && betColor === colors[result]) {
      win = true;
      stats.wins++;
      msg += '<br><span style=\"color:#43cea2;font-size:1.3em;">You win! 🎉</span>';
    } else {
      msg += '<br><span style=\"color:#e53935;font-size:1.3em;">You lose!</span>';
    }
    document.getElementById('result').innerHTML = msg;
    updateWinrate();
    // Reset wheel for next spin
    setTimeout(()=>{
      wheel.style.transition = 'none';
      wheel.style.transform = `rotate(${(360 - result*anglePer - anglePer/2)%360}deg)`;
    }, 400);
  }, 4200);
}

window.onload = function() {
  document.getElementById('roulette-wheel').innerHTML = renderSVGWheel();
  renderControls();
  updateWinrate();
  // Hide result box initially
  const resultBox = document.getElementById('result');
  resultBox.style.display = 'none';
  
};
