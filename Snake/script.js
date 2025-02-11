const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const blockSize = 20;
let canvasSize;

// Resize the canvas so that the entire play area is visible vertically.
// The canvas will be a square whose side is the largest multiple of blockSize
// that fits into the window's innerHeight minus a margin.
function resizeCanvas() {
  const margin = 20; // margin (in pixels) to ensure top and bottom aren't cut off
  const availableHeight = window.innerHeight - margin * 2;
  const rows = Math.floor(availableHeight / blockSize);
  canvasSize = rows * blockSize;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
}

resizeCanvas();

// Reload the page when the window is resized so the grid remains aligned.
window.addEventListener("resize", () => {
  location.reload();
});

// Calculate the middle cell so starting positions align to the grid.
const columns = canvasSize / blockSize;
const middleCell = Math.floor(columns / 2) * blockSize;

// Game state variables.
let initialSnakeLength = 3;
let snake;
let dx;
let dy;
let foodX;
let foodY;
let gameRunning = false;
let score = 0;

// Get overlay elements.
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const gameOverScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");
const scoreDisplay = document.getElementById("scoreDisplay");
const highScoreDisplay = document.getElementById("highScoreDisplay");

// Initialize game variables.
function initGame() {
  snake = [
    { x: middleCell, y: middleCell },
    { x: middleCell - blockSize, y: middleCell },
    { x: middleCell - 2 * blockSize, y: middleCell }
  ];
  dx = blockSize;
  dy = 0;
  createFood();
  score = 0;
}

// Create a single AudioContext for playing sounds.
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Resume the AudioContext on first user interaction if it is suspended.
document.addEventListener("keydown", function() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
});

// Function to play a tone using the Web Audio API.
function playSound(frequency, duration) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  oscillator.start();
  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  oscillator.stop(audioCtx.currentTime + duration);
}

// Generate a random position for the food that aligns to the grid.
function createFood() {
  foodX = Math.floor(Math.random() * (canvasSize / blockSize)) * blockSize;
  foodY = Math.floor(Math.random() * (canvasSize / blockSize)) * blockSize;
}

// Clear the canvas.
function clearCanvas() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw the food.
function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(foodX, foodY, blockSize, blockSize);
}

// Draw the snake.
function drawSnake() {
  snake.forEach(drawSnakePart);
}

function drawSnakePart(snakePart) {
  ctx.fillStyle = "lightgreen";
  ctx.strokeStyle = "darkgreen";
  ctx.fillRect(snakePart.x, snakePart.y, blockSize, blockSize);
  ctx.strokeRect(snakePart.x, snakePart.y, blockSize, blockSize);
}

// Move the snake and check if food is eaten.
function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  // If food is eaten:
  if (head.x === foodX && head.y === foodY) {
    playSound(200, 0.1); // quick beep
    score++;
    createFood();
  } else {
    snake.pop();
  }
}

// Check for collisions with walls or self.
function checkCollision() {
  const head = snake[0];
  if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
    return true;
  }
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  return false;
}

// The main game loop.
function gameLoop() {
  if (!gameRunning) return;
  if (checkCollision()) {
    gameOverHandler();
    return;
  }
  setTimeout(function onTick() {
    clearCanvas();
    drawFood();
    moveSnake();
    drawSnake();
    gameLoop();
  }, 100);
}

// Change direction based on key press (prevent snake from reversing).
// Supports both arrow keys and WASD controls.
function changeDirection(event) {
  let keyPressed = event.keyCode;
  // Map WASD keys to arrow key codes
  if (event.key) {
    const key = event.key.toLowerCase();
    if (key === "w") keyPressed = 38;
    if (key === "a") keyPressed = 37;
    if (key === "s") keyPressed = 40;
    if (key === "d") keyPressed = 39;
  }

  const LEFT_KEY = 37;
  const UP_KEY = 38;
  const RIGHT_KEY = 39;
  const DOWN_KEY = 40;

  const goingUp = dy === -blockSize;
  const goingDown = dy === blockSize;
  const goingRight = dx === blockSize;
  const goingLeft = dx === -blockSize;

  if (keyPressed === LEFT_KEY && !goingRight) {
    dx = -blockSize;
    dy = 0;
  }
  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -blockSize;
  }
  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = blockSize;
    dy = 0;
  }
  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = blockSize;
  }
}

window.addEventListener("keydown", changeDirection);

// Handle game over: stop the game, update high score, and show the game over overlay.
function gameOverHandler() {
  playSound(110, 0.3);
  gameRunning = false;
  // Retrieve and update the high score from local storage.
  let highScore = localStorage.getItem("highScore") || 0;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  // Display current score and high score.
  scoreDisplay.textContent = "Score: " + score;
  highScoreDisplay.textContent = "High Score: " + highScore;
  gameOverScreen.style.display = "flex";
}

// Start (or restart) the game.
function startGame() {
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  initGame();
  gameRunning = true;
  gameLoop();
}

// Event listeners for the start and restart buttons.
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
