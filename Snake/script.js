const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const canvasSize = 400;
const blockSize = 20;

// Initial snake: an array of segments (each segment is an object with x and y coordinates)
let snake = [
  { x: 200, y: 200 },
  { x: 180, y: 200 },
  { x: 160, y: 200 }
];

// Starting velocity: moving to the right
let dx = blockSize;
let dy = 0;

// Food coordinates
let foodX;
let foodY;

createFood();

// Create a single AudioContext for playing sounds
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Resume the AudioContext on first user interaction if it is suspended (common in modern browsers)
document.addEventListener('keydown', function() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
});

// Function to play a tone using an oscillator
function playSound(frequency, duration) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  oscillator.start();
  // Set initial gain and fade out quickly
  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  oscillator.stop(audioCtx.currentTime + duration);
}

// Generate a random position for the food
function createFood() {
  foodX = Math.floor(Math.random() * (canvasSize / blockSize)) * blockSize;
  foodY = Math.floor(Math.random() * (canvasSize / blockSize)) * blockSize;
}

// Clear the canvas by drawing a black rectangle over it
function clearCanvas() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw the food as a red square
function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(foodX, foodY, blockSize, blockSize);
}

// Draw the entire snake by drawing each segment
function drawSnake() {
  snake.forEach(drawSnakePart);
}

// Draw an individual segment of the snake
function drawSnakePart(snakePart) {
  ctx.fillStyle = "lightgreen";
  ctx.strokeStyle = "darkgreen";
  ctx.fillRect(snakePart.x, snakePart.y, blockSize, blockSize);
  ctx.strokeRect(snakePart.x, snakePart.y, blockSize, blockSize);
}

// Move the snake by adding a new head based on the current direction.
// If the snake has eaten the food, play a sound and do not remove the tail; otherwise, remove the last segment.
function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  // Check if the snake has eaten the food
  if (head.x === foodX && head.y === foodY) {
    playSound(200, 0.1); // play a quick beep when food is eaten
    createFood();
  } else {
    snake.pop();
  }
}

// Check for collisions with walls or self
function gameOver() {
  const head = snake[0];
  
  // Check collision with walls
  if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
    return true;
  }
  
  // Check collision with itself
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  return false;
}

// The main game loop: update the game state, draw everything, and repeat.
function gameLoop() {
  if (gameOver()) {
    playSound(110, 0.3); // play a lower tone when the game is over
    setTimeout(function() {
      alert("Game Over!");
      document.location.reload();
    }, 100);
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

// Change the direction based on the arrow key pressed.
// Prevent the snake from reversing direction.
function changeDirection(event) {
  const LEFT_KEY = 37;
  const UP_KEY = 38;
  const RIGHT_KEY = 39;
  const DOWN_KEY = 40;

  const keyPressed = event.keyCode;
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

// Start the game
gameLoop();
