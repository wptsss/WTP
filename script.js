const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const scoreLabel = document.getElementById('score');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const speed = 8; // 每秒移动次数

let snake = [];
let direction = { x: 1, y: 0 };
let queuedDirection = null;
let food = null;
let score = 0;
let isRunning = false;
let isGameOver = false;
let lastTimestamp = 0;
let accumulator = 0;

function initGame() {
    snake = [
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    queuedDirection = null;
    score = 0;
    isGameOver = false;
    scoreLabel.textContent = score.toString();
    spawnFood();
    draw();
}

function spawnFood() {
    let candidate;
    do {
        candidate = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === candidate.x && segment.y === candidate.y));
    food = candidate;
}

function gameLoop(timestamp) {
    if (!isRunning) {
        lastTimestamp = timestamp;
        requestAnimationFrame(gameLoop);
        return;
    }

    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    accumulator += delta;

    while (accumulator > 1 / speed) {
        accumulator -= 1 / speed;
        step();
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function step() {
    if (queuedDirection) {
        direction = queuedDirection;
        queuedDirection = null;
    }

    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    if (isCollision(newHead)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);

    if (food && newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        scoreLabel.textContent = score.toString();
        spawnFood();
    } else {
        snake.pop();
    }
}

function isCollision(position) {
    const outOfBounds = position.x < 0 || position.y < 0 || position.x >= tileCount || position.y >= tileCount;
    if (outOfBounds) return true;
    return snake.some((segment, index) => index !== 0 && segment.x === position.x && segment.y === position.y);
}

function gameOver() {
    isRunning = false;
    isGameOver = true;
    setTimeout(() => alert('游戏结束！点击“重置”重新开始。'), 0);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景与网格
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#38bdf8');
        gradient.addColorStop(1, '#818cf8');
        ctx.fillStyle = gradient;
        ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);

        if (index === 0) {
            ctx.fillStyle = '#0f172a';
            const eyeSize = gridSize / 6;
            ctx.beginPath();
            ctx.arc(segment.x * gridSize + gridSize / 3, segment.y * gridSize + gridSize / 3, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(segment.x * gridSize + (gridSize * 2) / 3, segment.y * gridSize + gridSize / 3, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // 绘制食物
    if (food) {
        ctx.fillStyle = '#f97316';
        if (typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(food.x * gridSize + 3, food.y * gridSize + 3, gridSize - 6, gridSize - 6, 6);
            ctx.fill();
        } else {
            ctx.fillRect(food.x * gridSize + 3, food.y * gridSize + 3, gridSize - 6, gridSize - 6);
        }
    }
}

function changeDirection(x, y) {
    if (direction.x === -x && direction.y === -y) return; // 禁止反向
    queuedDirection = { x, y };
}

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    switch (key) {
        case 'arrowup':
        case 'w':
            changeDirection(0, -1);
            break;
        case 'arrowdown':
        case 's':
            changeDirection(0, 1);
            break;
        case 'arrowleft':
        case 'a':
            changeDirection(-1, 0);
            break;
        case 'arrowright':
        case 'd':
            changeDirection(1, 0);
            break;
        case ' ':
            if (isGameOver) return;
            isRunning = !isRunning;
            break;
    }
});

startButton.addEventListener('click', () => {
    if (isGameOver) return;
    isRunning = true;
});

pauseButton.addEventListener('click', () => {
    isRunning = false;
});

resetButton.addEventListener('click', () => {
    initGame();
    isRunning = true;
});

initGame();
requestAnimationFrame(gameLoop);
