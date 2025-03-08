const board = document.getElementById("board");
const playerDisplay = document.getElementById("player-display");
const currentPlayerName = document.getElementById("current-player-name");
const playerSetup = document.getElementById("player-setup");
const gameArea = document.getElementById("game-area");
const startGameBtn = document.getElementById("start-game-btn");
const playerXInput = document.getElementById("player-x");
const playerOInput = document.getElementById("player-o");
const resetBtn = document.getElementById("reset-btn");
const undoBtn = document.getElementById("undo-btn");
const newPlayersBtn = document.getElementById("new-players-btn");

let cells = [];
let moves = [];
let currentPlayer = "X";
let gameActive = true;
let playerNames = { X: "", O: "" };
let scores = { X: 0, O: 0 };

startGameBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
undoBtn.addEventListener("click", undoMove);
newPlayersBtn.addEventListener("click", newPlayers);

function startGame() {
  const nameX = playerXInput.value.trim();
  const nameO = playerOInput.value.trim();
  if (!nameX || !nameO) {
    openModal("Please enter both player names.");
    return;
  }
  playerNames.X = nameX;
  playerNames.O = nameO;
  playerSetup.style.display = "none";
  gameArea.style.display = "flex";
  updateScoreDisplay();
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
  if (!cell.classList.contains('x') && !cell.classList.contains('o')) {
    handleMove(index);
  }
}

function handleMove(index) {
  // Place the new move on the board
  cells[index].classList.add(currentPlayer.toLowerCase());
  moves.push({ index: index, player: currentPlayer });
  
  // Check for win
  const winPattern = checkWin(currentPlayer);
  if (winPattern) {
    highlightWinLine(winPattern);
    gameActive = false;
    return;
  }
  
  // If moves.length > 5, remove the oldest move
  if (moves.length > 5) {
    const removedMove = moves.shift();
    const cellToRemove = cells[removedMove.index];
    const overlay = cellToRemove.querySelector('.pulse-overlay');
    if (overlay) {
      cellToRemove.removeChild(overlay);
    }
    cellToRemove.classList.remove(removedMove.player.toLowerCase());
  }
  
  // Always update the overlay (if there are exactly 5 moves, add it)
  updateOverlay();
  
  if (checkTie()) return;
  
  // Switch player
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updatePlayerDisplay();
}

function updateOverlay() {
  // Remove overlay from any cell that doesn't correspond to the current oldest move
  cells.forEach(cell => {
    if (cell.querySelector('.pulse-overlay')) {
      cell.removeChild(cell.querySelector('.pulse-overlay'));
    }
  });
  
  if (moves.length === 5) {
    const oldestMove = moves[0];
    const cellToPulse = cells[oldestMove.index];
    const overlay = document.createElement("div");
    overlay.classList.add("pulse-overlay");
    cellToPulse.appendChild(overlay);
  }
}

function undoMove() {
  if (moves.length === 0) return;
  const lastMove = moves.pop();
  cells[lastMove.index].classList.remove(lastMove.player.toLowerCase());
  gameActive = true;
  currentPlayer = lastMove.player;
  updatePlayerDisplay();
  // Remove any win lines
  document.querySelectorAll('.win-line').forEach(el => el.remove());
  updateOverlay();
}

function updatePlayerDisplay() {
  playerDisplay.textContent = currentPlayer;
  currentPlayerName.textContent = playerNames[currentPlayer] || currentPlayer;
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

function checkTie() {
  const isTie = cells.every(cell => cell.classList.contains("x") || cell.classList.contains("o"));
  if (isTie && !checkWin("X") && !checkWin("O")) {
    setTimeout(() => {
      openModal("It's a tie!");
      resetGame();
    }, 500);
    return true;
  }
  return false;
}

function highlightWinLine(pattern) {
  pattern.forEach(index => {
    let winMarker = document.createElement("div");
    winMarker.classList.add("win-line");
    cells[index].appendChild(winMarker);
  });
  
  updateScore(currentPlayer);
  
  setTimeout(() => {
    openModal(`Congratulations, ${playerNames[currentPlayer]}! You win!`, true);
  }, 1500);
}

function resetGame() {
  moves = [];
  currentPlayer = "X";
  gameActive = true;
  createBoard();
}

function updateScore(winner) {
  scores[winner]++;
  updateScoreDisplay();
}

function updateScoreDisplay() {
  const scoreboard = document.getElementById('scoreboard');
  const nameX = playerNames.X || "X";
  const nameO = playerNames.O || "O";
  scoreboard.textContent = `${nameX}: ${scores.X} | ${nameO}: ${scores.O}`;
}

// Modified openModal to accept an optional isWin flag.
function openModal(message, isWin = false) {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modal-message');
  modalMessage.textContent = message;
  if(isWin) {
    modal.dataset.win = "true";
  } else {
    modal.dataset.win = "";
  }
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  if(modal.dataset.win === "true") {
    resetGame();
  }
}

document.getElementById('modal-close').addEventListener('click', closeModal);
window.addEventListener('click', function(event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
});

// Initialize game state
gameArea.style.display = "none";
playerSetup.style.display = "flex";
