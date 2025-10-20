function initGame() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            grid[y][x] = 0;
        }
    }

    score = 0;
    scoreCtx.clearRect(0, 0, scoreScreen.width, scoreScreen.height);
    scoreCtx.fillText(score.toString(), centerX, centerY);

    currentPiece = randomShape();
    nextPiece = randomShape();

    drawNextBlock();

    dropCounter = 0;
    lastTime = 0;

    updateGame();
}

function updateGame(time = 0) {
    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;

    if (dropCounter > dropInterval) {
        if (!collision(currentPiece, 0, 1)) {
            currentPiece.y++;
        } else {
            merge(currentPiece);
            clearLines();

            currentPiece = nextPiece;
            nextPiece = randomShape();

            drawNextBlock();

            if (collision(currentPiece, 0, 0)) {
                drawGame();
                gameOver();
                return;
            }
        }
        dropCounter = 0;
    }

    drawGame();
    requestAnimationFrame(updateGame);
}

function gameOver() {
    gameScreenCtx.fillStyle = "rgba(0, 0, 0, 0.75)";
    gameScreenCtx.fillRect(0, 0, gameScreen.width, gameScreen.height);

    gameScreenCtx.fillStyle = "#ff4444";
    gameScreenCtx.font = "30px Courier New";
    gameScreenCtx.textAlign = "center";
    gameScreenCtx.textBaseline = "middle";
    gameScreenCtx.fillText("Game Over", gameScreen.width / 2, gameScreen.height / 2 - 20);
    
    gameScreenCtx.fillStyle = "#ffffff";
    gameScreenCtx.font = "15px Courier New";
    gameScreenCtx.fillText("Press 'R' to Restart", gameScreen.width / 2, gameScreen.height / 2 + 20);
}

function handleInput(event) {
    switch (event.code) {
        case "ArrowLeft":
            if (!collision(currentPiece, -1, 0)) currentPiece.x--;
            break;
        case "ArrowRight":
            if (!collision(currentPiece, 1, 0)) currentPiece.x++;
            break;
        case "ArrowDown":
            if (!collision(currentPiece, 0, 1)) currentPiece.y++;
            break;
        case "ArrowUp":
            rotate(currentPiece);
            break;
        case "Space":
            while (!collision(currentPiece, 0, 1)) {
                currentPiece.y++;
            }
            break;
        case "KeyR":
            initGame();
            break;
    }
}
window.addEventListener("keydown", handleInput);

function randomShape() {
    const shapes = Object.keys(SHAPES);
    const randomIndex = shapes[Math.floor(Math.random() * shapes.length)];
    return {
        shape: SHAPES[randomIndex],
        color: randomIndex,
        x: 3,
        y: 0
    };
}

function collision(piece, offsetX, offsetY) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                let newX = piece.x + x + offsetX;
                let newY = piece.y + y + offsetY;
                if (newY >= ROWS || newX < 0 || newX >= COLS || grid[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                grid[piece.y + y][piece.x + x] = COLORS[piece.color];
            }
        }
    }
}

function clearLines() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell !== 0)) {
            grid.splice(y, 1);
            grid.unshift(Array(COLS).fill(0));
            score += 100;
            y++;
        }
    }
}

function rotate(piece) {
    const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    if (!collision({ ...piece, shape: rotated }, 0, 0)) piece.shape = rotated;
}

function drawGame() {
    gameScreenCtx.clearRect(0, 0, gameScreen.width, gameScreen.height);

    gameScreenCtx.strokeStyle = "#00000025";
    for (let x = 0; x <= COLS; x++) {
        gameScreenCtx.beginPath();
        gameScreenCtx.moveTo(x * CELL_SIZE, 0);
        gameScreenCtx.lineTo(x * CELL_SIZE, gameScreen.height);
        gameScreenCtx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        gameScreenCtx.beginPath();
        gameScreenCtx.moveTo(0, y * CELL_SIZE);
        gameScreenCtx.lineTo(gameScreen.width, y * CELL_SIZE);
        gameScreenCtx.stroke();
    }

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = grid[y][x];
            if (cell) drawCell(x, y, cell, 0.6);
        }
    }
    

    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                drawCell(currentPiece.x + x, currentPiece.y + y, COLORS[currentPiece.color], 1);
            }
        }
    }

    scoreCtx.clearRect(0, 0, scoreScreen.width, scoreScreen.height);
    scoreCtx.fillText(score.toString(), centerX, centerY);
}

function drawCell(x, y, color, opacity = 1) {
    gameScreenCtx.fillStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
    gameScreenCtx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    gameScreenCtx.strokeStyle = "#00000020";
    gameScreenCtx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawNextBlock() {
    nextBlockCtx.clearRect(0, 0, nextBlockScreen.width, nextBlockScreen.height);

    const shape = nextPiece.shape;
    const blockSize = CELL_SIZE;
    const offsetX = (nextBlockScreen.width - shape[0].length * blockSize) / 2;
    const offsetY = (nextBlockScreen.height - shape.length * blockSize) / 2;

    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                nextBlockCtx.fillStyle = COLORS[nextPiece.color];
                nextBlockCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                nextBlockCtx.strokeStyle = "#00000020";
                nextBlockCtx.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
            }
        }
    }
}

const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 20;

const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]],
};

const COLORS = {
    I: "#00f0f0",
    O: "#f0f000",
    T: "#a000f0",
    S: "#00f000",
    Z: "#f00000",
    J: "#0000f0",
    L: "#f0a000"
}

let currentPiece, nextPiece;
let score = 0;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

const gameScreen = document.getElementById("gameScreen");
const scoreScreen = document.getElementById("score");
const nextBlockScreen = document.getElementById("nextBlock");

const gameScreenCtx = gameScreen.getContext("2d");
const scoreCtx = scoreScreen.getContext("2d");
const nextBlockCtx = nextBlockScreen.getContext("2d");

scoreCtx.font = "50px Courier New";
scoreCtx.fillStyle = "#000";
scoreCtx.textAlign = "center";
scoreCtx.textBaseline = "middle";
const centerX = scoreScreen.width / 2;
const centerY = scoreScreen.height / 2;

initGame();
