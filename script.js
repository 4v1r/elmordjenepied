let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
const settingsBtn = document.getElementById('settings-btn');
const soundBtn = document.getElementById('sound-btn');
const themeToggle = document.getElementById('theme-toggle');
const settingsModal = document.getElementById('settings-modal');
const codeInput = document.getElementById('code-input');
const codeMessage = document.getElementById('code-message');
const backgroundMusic = document.getElementById('background-music');
const scoreElement = document.getElementById('score');

document.body.appendChild(canvas);

let isSoundOn = false;
let score = 0;
let tileSize = 100;
let png1X = window.innerWidth / 2 - 50;
let png1Y = window.innerHeight / 2 - 50;
let png2X = 300;
let png2Y = 300;
let isDragging = false;
let autoMove = false;
let offsetX = 0;
let offsetY = 0;
let hitboxReduction = 20;

let startX = 0;
let startY = 0;
let targetX = 0;
let targetY = 0;
let moveStartTime = 0;
let moveDuration = 2000;

let img1 = new Image();
let img2 = new Image();
let imagesLoaded = 0;
let gameStarted = false;

function startGame() {
    if (imagesLoaded === 2) {
        gameStarted = true;
        png1X = window.innerWidth / 2 - 50;
        png1Y = window.innerHeight / 2 - 50;
        repositionImages();
        gameLoop();
    }
}

function setNewTarget() {
    startX = png1X;
    startY = png1Y;
    targetX = Math.random() * (canvas.width - tileSize);
    targetY = Math.random() * (canvas.height - tileSize);
    moveStartTime = Date.now();
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

img1.onload = function() {
    imagesLoaded++;
    startGame();
};

img2.onload = function() {
    imagesLoaded++;
    startGame();
};

img1.src = 'png1.png';
img2.src = 'png2.png';

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (score < 5 && gameStarted) {
        png1X = window.innerWidth / 2 - 50;
        png1Y = window.innerHeight / 2 - 50;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function gameLoop() {
    if (!gameStarted) return;
    
    clearScreen();
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

function clearScreen() {
    ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#1a1a1a' : '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateGame() {
    if (score >= 5) {
        autoMove = true;
        let currentTime = Date.now();
        let elapsed = currentTime - moveStartTime;
        let progress = Math.min(elapsed / moveDuration, 1);
        
        let easedProgress = easeInOutQuad(progress);
        
        png1X = startX + (targetX - startX) * easedProgress;
        png1Y = startY + (targetY - startY) * easedProgress;
        
        if (progress >= 1) {
            setNewTarget();
        }
    }
}

function drawGame() {
    ctx.drawImage(img1, png1X, png1Y, tileSize, tileSize);
    ctx.drawImage(img2, png2X, png2Y, tileSize, tileSize);
}

function checkCollision() {
    const hitboxSize = tileSize - hitboxReduction;
    const offset = hitboxReduction / 2;
    
    return png2X + offset < png1X + tileSize - offset &&
           png2X + tileSize - offset > png1X + offset &&
           png2Y + offset < png1Y + tileSize - offset &&
           png2Y + tileSize - offset > png1Y + offset;
}

function repositionImages() {
    png2X = Math.random() * (canvas.width - tileSize);
    png2Y = Math.random() * (canvas.height - tileSize);
}

canvas.addEventListener('mousedown', function(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    if (mouseX >= png2X && mouseX <= png2X + tileSize &&
        mouseY >= png2Y && mouseY <= png2Y + tileSize) {
        isDragging = true;
        offsetX = png2X - mouseX;
        offsetY = png2Y - mouseY;
    }
});

canvas.addEventListener('mousemove', function(e) {
    if (isDragging) {
        let rect = canvas.getBoundingClientRect();
        png2X = e.clientX - rect.left + offsetX;
        png2Y = e.clientY - rect.top + offsetY;

        png2X = Math.max(0, Math.min(canvas.width - tileSize, png2X));
        png2Y = Math.max(0, Math.min(canvas.height - tileSize, png2Y));
    }
});

canvas.addEventListener('mouseup', function() {
    if (isDragging && checkCollision()) {
        score++;
        scoreElement.textContent = `SCORE: ${score}`;
        scoreElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
        }, 200);

        if (score >= 5) {
            targetX = Math.random() * (canvas.width - tileSize);
            targetY = Math.random() * (canvas.height - tileSize);
            startX = png1X;
            startY = png1Y;
            moveStartTime = Date.now();
        }
        
        repositionImages();
    }
    isDragging = false;
});

canvas.addEventListener('mouseleave', function() {
    isDragging = false;
});

settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
});

codeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (codeInput.value === 'code100') {
            score += 100;
            scoreElement.textContent = `SCORE: ${score}`;
            scoreElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                scoreElement.style.transform = 'scale(1)';
            }, 200);
            codeMessage.textContent = 'CODE VALID!';
        } else {
            codeMessage.textContent = 'INVALID CODE';
        }
        setTimeout(() => {
            codeMessage.textContent = '';
        }, 2000);
        codeInput.value = '';
    }
});

soundBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    if (isSoundOn) {
        backgroundMusic.play().catch(error => console.log("Audio autoplay prevented"));
        soundBtn.textContent = 'MUTE';
    } else {
        backgroundMusic.pause();
        soundBtn.textContent = 'UNMUTE';
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

document.addEventListener('click', (e) => {
    if (!settingsModal.contains(e.target) && e.target !== settingsBtn) {
        settingsModal.style.display = 'none';
    }
});

clearScreen();
