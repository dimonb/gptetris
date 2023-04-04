const tetriminoes = [
  { id: 1, shape: [[1, 1], [1, 1]], color: "#f0a500" }, // O
  { id: 2, shape: [[1], [1], [1], [1]], color: "#00baff" }, // I
  { id: 3, shape: [[1, 0], [1, 0], [1, 1]], color: "#00e5ff" }, // L
  { id: 4, shape: [[0, 1], [0, 1], [1, 1]], color: "#00f977" }, // J
  { id: 5, shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: "#a500f0" }, // S
  { id: 6, shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: "#ff00e5" }, // Z
  { id: 7, shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: "#ff0000" }, // T
];

const gameBoard = document.querySelector("#game-board");
let piece, pieceX, pieceY;
let board = createEmptyBoard();

function createEmptyBoard() {
  return new Array(20).fill(null).map(() => new Array(10).fill(0));
}

function initBoard() {
  gameBoard.innerHTML = '';
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      gameBoard.appendChild(cell);
    }
  }
}

function getRandomPiece() {
  return tetriminoes[Math.floor(Math.random() * tetriminoes.length)];
}

function isCellFilled(boardRow, boardCol) {
  if (board[boardRow][boardCol]) {
    return true;
  }

  const pieceRow = boardRow - pieceY;
  const pieceCol = boardCol - pieceX;

  if (
    pieceRow >= 0 &&
    pieceRow < piece.shape.length &&
    pieceCol >= 0 &&
    pieceCol < piece.shape[pieceRow].length &&
    piece.shape[pieceRow][pieceCol]
  ) {
    return true;
  }

  return false;
}


function drawPiece(piece, x, y) {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        board[y + row][x + col] = piece.id;
      }
    }
  }
}

function hasCollision(piece, x, y) {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (
        piece.shape[row][col] &&
        (y + row < 0 || y + row >= board.length || x + col < 0 || x + col >= board[0].length || board[y + row][x + col])
      ) {
        return true;
      }
    }
  }
  return false;
}

let score = 0;
const scoreDisplay = document.querySelector("#score");

let level = 1;
const levelDisplay = document.querySelector("#level");

function updateLevelDisplay() {
  levelDisplay.textContent = level;
}

function calculateDropInterval() {
  // Calculate the drop interval based on the current level
  return Math.max(100, 300 - 50 * (level - 1));
}

function updateScore(linesCleared) {
  if (linesCleared > 0) {
    score += linesCleared * 100;
    updateScoreDisplay();

    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel > level) {
      level = newLevel;
      updateLevelDisplay();
    }
  }
}


function updateScoreDisplay() {
  scoreDisplay.textContent = score;
}

function clearLines() {
  let linesCleared = 0;

  for (let row = board.length - 1; row >= 0;) {
    if (board[row].every(cell => cell)) {
      linesCleared++;
      board.splice(row, 1);
      board.unshift(new Array(board[0].length).fill(0));
    } else {
      row--;
    }
  }

  return linesCleared;
}



function updateBoard() {
  gameBoard.innerHTML = '';
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      if (isCellFilled(row, col)) {
        cell.classList.add("filled");
        const color = tetriminoes.find(t => t.id === board[row][col])?.color || piece.color;
        cell.style.backgroundColor = color;
      }
      gameBoard.appendChild(cell);
    }
  }
}


function newPiece() {
  piece = getRandomPiece();
  pieceX = Math.floor(board[0].length / 2) - Math.floor(piece.shape[0].length / 2);
  pieceY = 0;
}

function rotatePiece(piece) {
  const rotatedPiece = { id: piece.id, color: piece.color, shape: [] };
  for (let col = 0; col < piece.shape[0].length; col++) {
    rotatedPiece.shape[col] = [];
    for (let row = piece.shape.length - 1; row >= 0; row--) {
      rotatedPiece.shape[col].push(piece.shape[row][col]);
    }
  }
  return rotatedPiece;
}

document.addEventListener("keydown", (event) => {
  const keyActionMap = {
    ArrowLeft: { dx: -1, dy: 0 },
    ArrowRight: { dx: 1, dy: 0 },
    ArrowDown: { dx: 0, dy: 1 }
  };

  if (event.key in keyActionMap && !hasCollision(piece, pieceX + keyActionMap[event.key].dx, pieceY + keyActionMap[event.key].dy)) {
    pieceX += keyActionMap[event.key].dx;
    pieceY += keyActionMap[event.key].dy;
  } else if (event.key === "ArrowUp") {
    const rotatedPiece = rotatePiece(piece);
    if (!hasCollision(rotatedPiece, pieceX, pieceY)) {
      piece = rotatedPiece;
    }
  }
  updateBoard();
});

function gameLoop() {
  const currentTime = performance.now();
  const timeSinceLastDrop = currentTime - lastFrameTime;

  if (timeSinceLastDrop >= calculateDropInterval(level)) {
    if (hasCollision(piece, pieceX, pieceY + 1)) {
      drawPiece(piece, pieceX, pieceY);
      const linesCleared = clearLines();
      updateScore(linesCleared);
      newPiece();
      if (hasCollision(piece, pieceX, pieceY)) {
        gameOver();
        return;
      }
    } else {
      pieceY++;
    }
    lastFrameTime = currentTime;
    updateBoard();
  }

  
  requestAnimationFrame(gameLoop);
}


function startGame() {
  clearInterval(gameInterval);
  board = createEmptyBoard();
  initBoard();
  newPiece();
  score = 0;
  level = 1; // Reset the level
  updateScoreDisplay();
  updateLevelDisplay(); // Update the level display
  lastFrameTime = performance.now();
  gameLoop();
}


function gameOver() {
  clearInterval(gameInterval);
  alert("Game Over!");
  startGame();
}

let gameInterval;
startGame();
