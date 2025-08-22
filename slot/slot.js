// Winrate tracking
let totalSpins = 0;
let winCount = 0;
const winrateEl = document.getElementById('winrate');
function updateWinrate() {
    if (totalSpins === 0) {
        winrateEl.textContent = 'Winrate: 0%';
    } else {
        const rate = ((winCount / totalSpins) * 100).toFixed(0);
        winrateEl.textContent = `Winrate: ${rate}%`;
    }
}

const symbols = [
    '🍒', '🍋', '🔥', '🦄', '🍀', '💎', '🍉', '⭐', '💤'
];

// TEMP: Console function to force jackpot mode
let forceJackpot = false;
window.jackpot = function() {
    forceJackpot = true;
    console.log('Jackpot mode enabled: every spin will win until reload.');
};

const reelEls = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinBtn = document.getElementById('spinBtn');
const resultEl = document.getElementById('slotResult');

function getSymbolHTML(symbol) {
    return symbol;
}


function spinReels() {
    let result = [];
    totalSpins++;
    if (forceJackpot) {
        // Pick a random symbol, all reels match
        const idx = Math.floor(Math.random() * symbols.length);
        result = [symbols[idx], symbols[idx], symbols[idx]];
    } else {
        for (let i = 0; i < 3; i++) {
            const idx = Math.floor(Math.random() * symbols.length);
            result[i] = symbols[idx];
        }
    }
    // Animate reels, show result after last reel finishes
    animateReel(reelEls[0], getSymbolHTML(result[0]), 0);
    animateReel(reelEls[1], getSymbolHTML(result[1]), 180);
    // For the last reel, show result after animation
    let spins = 18 + Math.floor(Math.random()*6);
    let i = 0;
    function spinLastReel() {
        if (i < spins) {
            const idx = Math.floor(Math.random() * symbols.length);
            reelEls[2].innerHTML = getSymbolHTML(symbols[idx]);
            i++;
            setTimeout(spinLastReel, 60 + i*8 + 360);
        } else {
            reelEls[2].innerHTML = getSymbolHTML(result[2]);
            // Show result after last reel
            if (result[0] === result[1] && result[1] === result[2]) {
                resultEl.textContent = "JACKPOT!";
                showMoneyRain();
                winCount++;
            } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
                resultEl.textContent = "Nice! Two match!";
                winCount++;
            } else {
                resultEl.textContent = "Try again!";
            }
            updateWinrate();
// Show winrate on load (empty)
updateWinrate();
// Money rain effect for jackpot
function showMoneyRain() {
    let rain = document.getElementById('money-rain');
    if (!rain) {
        rain = document.createElement('div');
        rain.id = 'money-rain';
        rain.style.position = 'fixed';
        rain.style.left = '0';
        rain.style.top = '0';
        rain.style.width = '100vw';
        rain.style.height = '100vh';
        rain.style.pointerEvents = 'none';
        rain.style.zIndex = '0';
        document.body.prepend(rain);
    }
    rain.innerHTML = '';
    const dropCount = 300;
    for (let i = 0; i < dropCount; i++) {
        const span = document.createElement('span');
        span.textContent = '💸';
        span.style.position = 'absolute';
        span.style.left = Math.random()*100 + 'vw';
        span.style.top = '-60px';
        span.style.fontSize = (2.2 + Math.random()*2.5) + 'em';
        span.style.opacity = 0.85;
        span.style.transition = 'transform 5.5s cubic-bezier(.4,.7,.2,1), opacity 1.2s';
        rain.appendChild(span);
        setTimeout(() => {
            span.style.transform = `translateY(${90 + Math.random()*10}vh) rotate(${Math.random()*360}deg)`;
            span.style.opacity = 0.2 + Math.random()*0.3;
        }, 30 + Math.random()*1200);
    }
    setTimeout(() => {
        if (rain) rain.innerHTML = '';
    }, 6000);
}
        }
    }
    spinLastReel();
}


function animateReel(reelEl, finalHTML, delay) {
    let spins = 18 + Math.floor(Math.random()*6);
    let i = 0;
    function spinStep() {
        if (i < spins) {
            const idx = Math.floor(Math.random() * symbols.length);
            reelEl.innerHTML = getSymbolHTML(symbols[idx]);
            i++;
            setTimeout(spinStep, 60 + i*8 + delay);
        } else {
            reelEl.innerHTML = finalHTML;
        }
    }
    spinStep();
}

// Initialize
reelEls.forEach(el => el.innerHTML = '❔');
resultEl.textContent = '';

spinBtn.addEventListener('click', () => {
    resultEl.textContent = '';
    spinReels();
});
