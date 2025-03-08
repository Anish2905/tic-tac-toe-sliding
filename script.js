const board = document.getElementById("board");
const playerDisplay = document.getElementById("player-display");
const currentPlayerName = document.getElementById("current-player-name");
const playerSetup = document.getElementById("player-setup");
const gameArea = document.getElementById("game-area");
const startGameBtn = document.getElementById("start-game-btn");
const playerXInput = document.getElementById("player-x");
const playerOInput = document.getElementById("player-o");

let cells = [];
let moves = [];
let currentPlayer = "X";
let gameActive = true;
let playerNames = {
  X: "",
  O: ""
};

startGameBtn.addEventListener("click", startGame);

function startGame() {
  const nameX = playerXInput.value.trim();
  const nameO = playerOInput.value.trim();
  if (!nameX || !nameO) {
    alert("Please enter both player names.");
    return;
  }
  playerNames.X = nameX;
  playerNames.O = nameO;
  playerSetup.style.display = "none";
  gameArea.style.display = "flex";
  resetGame();
}

function newPlayers() {
  playerXInput.value = "";
  playerOInput.value = "";
  playerSetup.style.display = "flex";
  gameArea.style.display = "none";
}

function createBoard() {
  board.innerHTML = "";
  cells = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    cell.addEventListener("touchstart", handleTouch, { passive: false });
    board.appendChild(cell);
    cells.push(cell);
  }
  updatePlayerDisplay();
}

function handleClick(event) {
  processMove(event.target);
}

function handleTouch(event) {
  event.preventDefault();
  processMove(event.target);
}

function processMove(cell) {
  if (!gameActive) return;
  const index = parseInt(cell.dataset.index);
  // Allow move only if cell is not already marked
  if (!cell.classList.contains('x') && !cell.classList.contains('o')) {
    handleMove(index);
  }
}

function handleMove(index) {
  // Place the move on the board
  cells[index].classList.add(currentPlayer.toLowerCase());
  moves.push({ index: index, player: currentPlayer });

  // Check for win after the move
  const winPattern = checkWin(currentPlayer);
  if (winPattern) {
    highlightWinLine(winPattern);
    gameActive = false;
    return;
  }
  
  // From the 6th move onwards, remove the oldest move (first element)
  if (moves.length > 5) {
    const removedMove = moves.shift();
    cells[removedMove.index].classList.remove(removedMove.player.toLowerCase());
  }

  // Switch player normally
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updatePlayerDisplay();
}

function undoMove() {
  if (moves.length === 0) return;
  const lastMove = moves.pop();
  cells[lastMove.index].classList.remove(lastMove.player.toLowerCase());
  gameActive = true;
  currentPlayer = lastMove.player;
  updatePlayerDisplay();
  
  // Remove any win highlights
  document.querySelectorAll('.win-line').forEach(el => el.remove());
}

function updatePlayerDisplay() {
  playerDisplay.textContent = currentPlayer;
  currentPlayerName.textContent = playerNames[currentPlayer];
  playerDisplay.style.color = currentPlayer === "X" ? "var(--x-color)" : "var(--o-color)";
}

function checkWin(player) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
  ];
  for (let pattern of winPatterns) {
    if (pattern.every(index => cells[index].classList.contains(player.toLowerCase()))) {
      return pattern;
    }
  }
  return null;
}

function highlightWinLine(pattern) {
  pattern.forEach(index => {
    let winMarker = document.createElement("div");
    winMarker.classList.add("win-line");
    cells[index].appendChild(winMarker);
  });

  setTimeout(() => {
    alert(`${playerNames[currentPlayer]} (${currentPlayer}) Wins!`);
    resetGame();
  }, 1500);
}

function resetGame() {
  moves = [];
  currentPlayer = "X";
  gameActive = true;
  createBoard();
}

gameArea.style.display = "none";
playerSetup.style.display = "flex";
