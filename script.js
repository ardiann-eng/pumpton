// Game state
let gameState = {
    clickCount: 0,
    clicksPerSecond: 0,
    lastClickTime: Date.now(),
    clickHistory: [],
    milestones: [100, 500, 1000, 2000, 5000, 10000],
    currentMilestone: 0
};

// DOM elements
const pumpButton = document.getElementById('pumpButton');
const pumpImage = document.getElementById('pumpImage');
const clickCountDisplay = document.getElementById('clickCount');
const clicksPerSecondDisplay = document.getElementById('clicksPerSecond');
const clickEffect = document.getElementById('clickEffect');
const progressFill = document.getElementById('progressFill');

// Sound effects (using Web Audio API for simple sounds)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playClickSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800 + Math.random() * 400;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Update display functions
function updateDisplay() {
    clickCountDisplay.textContent = gameState.clickCount.toLocaleString();
    
    // Calculate progress to next milestone
    const nextMilestone = gameState.milestones[gameState.currentMilestone] || 10000;
    const progress = Math.min((gameState.clickCount % nextMilestone) / nextMilestone * 100, 100);
    progressFill.style.width = `${progress}%`;
    
    // Update milestone display
    updateMilestoneDisplay();
}

function updateClicksPerSecond() {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    // Remove clicks older than 1 second
    gameState.clickHistory = gameState.clickHistory.filter(time => time > oneSecondAgo);
    
    gameState.clicksPerSecond = gameState.clickHistory.length;
    clicksPerSecondDisplay.textContent = gameState.clicksPerSecond;
}

function updateMilestoneDisplay() {
    const milestoneItems = document.querySelectorAll('.milestone-item');
    
    milestoneItems.forEach((item, index) => {
        const milestoneValue = [100, 500, 1000][index];
        if (gameState.clickCount >= milestoneValue) {
            item.style.background = '#FFE5B4';
            item.style.transform = 'rotate(0deg) scale(1.1)';
            item.style.boxShadow = '0 6px 0 #FF4757';
        }
    });
}

// Visual effects
function createClickEffect(x, y) {
    // Animate +1 text
    clickEffect.classList.add('animate');
    setTimeout(() => {
        clickEffect.classList.remove('animate');
    }, 1000);
    
    // Create particle effects
    createParticles(x, y);
    
    // Button animation
    pumpButton.style.transform = 'scale(0.9)';
    setTimeout(() => {
        pumpButton.style.transform = 'scale(1)';
    }, 100);
    
    // Add click animation class
    addClickAnimation(pumpButton);
}

function addClickAnimation(button) {
    button.classList.add('clicked');
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 300);
}

function createParticles(x, y) {
    const colors = ['#4CAF50', '#66BB6A', '#43A047', '#81C784', '#2E7D32'];
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.setProperty('--x', (Math.random() - 0.5) * 100 + 'px');
        particle.style.setProperty('--y', (Math.random() - 0.5) * 100 + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Achievement system
function checkAchievements() {
    const nextMilestone = gameState.milestones[gameState.currentMilestone];
    
    if (nextMilestone && gameState.clickCount >= nextMilestone) {
        showAchievement(nextMilestone);
        gameState.currentMilestone++;
    }
}

function showAchievement(milestone) {
    const achievement = document.createElement('div');
    achievement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 20px;
        border: 3px solid #5F27CD;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        text-align: center;
        z-index: 1000;
        animation: achievementPop 0.5s ease-out;
    `;
    
    achievement.innerHTML = `
        <h2 style="color: #43A047; font-family: 'Fredoka One', cursive; margin-bottom: 10px;">🎉 CONGRATULATIONS! 🎉</h2>
        <p style="color: #2E7D32; font-weight: bold; font-size: 1.2rem;">You reached ${milestone} clicks!</p>
    `;
    
    document.body.appendChild(achievement);
    
    setTimeout(() => {
        achievement.remove();
    }, 2000);
}

// Event handlers
function handlePumpClick(event) {
    event.preventDefault();
    
    // Update game state
    gameState.clickCount++;
    gameState.clickHistory.push(Date.now());
    
    // Play sound
    try {
        playClickSound();
    } catch (e) {
        // Fallback if audio context is not available
    }
    
    // Visual effects
    const rect = pumpButton.getBoundingClientRect();
    const x = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : rect.left + rect.width / 2);
    const y = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : rect.top + rect.height / 2);
    createClickEffect(x, y);
    
    // Update displays
    updateDisplay();
    updateClicksPerSecond();
    checkAchievements();
    
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }
}

// Touch and mouse events
pumpButton.addEventListener('click', handlePumpClick);
pumpButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handlePumpClick(e);
});

// Prevent context menu on long press
pumpButton.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handlePumpClick(e);
    }
});

// Update clicks per second every second
setInterval(updateClicksPerSecond, 1000);

// Initialize
updateDisplay();
updateClicksPerSecond();

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('pumpClickerState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('pumpClickerState');
    if (saved) {
        const savedState = JSON.parse(saved);
        gameState.clickCount = savedState.clickCount || 0;
        gameState.currentMilestone = savedState.currentMilestone || 0;
        updateDisplay();
    }
}

// Save state periodically
setInterval(saveGameState, 5000);

// Load saved state on startup
loadGameState();

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        gameState.clickCount += 100;
        updateDisplay();
        showAchievement('Konami Code!');
    }
});

// Prevent zoom on double tap for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Focus management for accessibility
pumpButton.addEventListener('focus', () => {
    pumpButton.style.outline = '3px solid #5F27CD';
    pumpButton.style.outlineOffset = '3px';
});

pumpButton.addEventListener('blur', () => {
    pumpButton.style.outline = 'none';
});

// Initialize audio context on first user interaction
document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });