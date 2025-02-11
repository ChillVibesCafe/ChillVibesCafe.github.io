// Grab canvas and UI elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElem = document.getElementById('score');

// Game state variables
let score = 0;
let spawnInterval = 2000; // milliseconds between spawns
let lastSpawn = 0;
let spawnRateUpgradeCost = 50;
let scoreMultiplierUpgradeCost = 100;
let maxBallsUpgradeCost = 150;

let scoreMultiplier = 1;

// For scoring, idle balls are worth 1 point (modified by multiplier)
// while interactive balls are worth only 0.1 points.
const idleValue = 1;
const interactiveValue = 0.1;

// Maximum number of idle balls allowed on screen (upgradable)
let maxIdleBalls = 10;

// Arrays for balls, pegs, and slots
const balls = [];
const pegs = [];
let slots = [];  // will be recalculated based on canvas size

// Fixed UI panel width (matches CSS)
const uiWidth = 220;
const slotHeight = 30; // Height of bonus slots at the bottom

// Resize the canvas to fill the visible screen (minus the UI panel) and recreate pegs/slots
function resizeGame() {
  canvas.width = window.innerWidth - uiWidth;
  canvas.height = window.innerHeight;
  // Recreate pegs and slots based on new canvas dimensions
  pegs.length = 0;
  createPegs();
  createSlots();
}
resizeGame();
window.addEventListener('resize', resizeGame);

// Create peg objects arranged in rows (a simple plinko board)
function createPegs() {
  const rows = 5;
  const cols = 8;
  const spacingX = canvas.width / (cols + 1);
  const spacingY = 80; // vertical spacing between rows
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = (row % 2 === 0) ? spacingX / 2 : 0;
      const x = (col + 1) * spacingX + offsetX;
      const y = 100 + row * spacingY;
      pegs.push({ x: x, y: y, radius: 5 });
    }
  }
}

// Create slots at the bottom of the game area.
// We create 5 slots whose widths are scaled proportionally so they exactly fill the canvas width.
function createSlots() {
  slots = []; // clear previous slots
  const numSlots = 5;
  // These factors determine relative widths and associated bonus multipliers.
  const widthFactors = [0.8, 0.9, 1.0, 0.9, 1.0];
  const bonuses = [3, 2.5, 2, 2.5, 2];
  // Scale the factors so that their sum equals the canvas width.
  const totalFactor = widthFactors.reduce((a, b) => a + b, 0);
  let currentX = 0;
  for (let i = 0; i < numSlots; i++) {
    const slotW = (widthFactors[i] / totalFactor) * canvas.width;
    slots.push({ x: currentX, width: slotW, bonus: bonuses[i] });
    currentX += slotW;
  }
}

// Ball object with physics and drawing routines
function Ball(x, y, interactive = false) {
  this.x = x;
  this.y = y;
  this.radius = 8;
  // Random horizontal velocity
  this.vx = (Math.random() - 0.5) * 4;
  this.vy = 0;
  this.interactive = interactive;
  this.color = interactive ? 'orange' : 'dodgerblue';
}

Ball.prototype.update = function() {
  // Apply gravity
  this.vy += 0.2;
  this.x += this.vx;
  this.y += this.vy;

  // Collision with side walls
  if (this.x < this.radius) {
    this.x = this.radius;
    this.vx *= -0.8;
  } else if (this.x > canvas.width - this.radius) {
    this.x = canvas.width - this.radius;
    this.vx *= -0.8;
  }

  // Collision with pegs
  for (let peg of pegs) {
    const dx = this.x - peg.x;
    const dy = this.y - peg.y;
    const dist = Math.hypot(dx, dy);
    if (dist < this.radius + peg.radius) {
      // Calculate normalized collision vector
      const nx = dx / dist;
      const ny = dy / dist;
      // Resolve overlap
      const overlap = (this.radius + peg.radius) - dist;
      this.x += nx * overlap;
      this.y += ny * overlap;
      // Reflect velocity using standard reflection with restitution of 0.8
      const dot = this.vx * nx + this.vy * ny;
      this.vx = this.vx - (1 + 0.8) * dot * nx;
      this.vy = this.vy - (1 + 0.8) * dot * ny;
      // Enforce a minimum downward velocity and add a small downward impulse
      if (this.vy < 1) {
        this.vy = 1;
      }
      this.vy += 1;
    }
  }
};

Ball.prototype.draw = function() {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fillStyle = this.color;
  ctx.fill();
  ctx.closePath();
};

// Draw all pegs on the canvas
function drawPegs() {
  ctx.fillStyle = '#333';
  for (let peg of pegs) {
    ctx.beginPath();
    ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

// Draw the bonus slots at the bottom of the game area
function drawSlots() {
  for (let slot of slots) {
    ctx.fillStyle = '#ccc';
    ctx.fillRect(slot.x, canvas.height - slotHeight, slot.width, slotHeight);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(slot.x, canvas.height - slotHeight, slot.width, slotHeight);
    // Draw bonus multiplier text in the center of the slot
    ctx.fillStyle = '#333';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`x${slot.bonus}`, slot.x + slot.width / 2, canvas.height - slotHeight / 2 + 6);
  }
}

// Main game loop: update physics, spawn balls, draw everything, and handle scoring
function gameLoop(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Spawn idle balls at varied horizontal positions if below the maximum allowed
  if (!lastSpawn) lastSpawn = timestamp;
  if (timestamp - lastSpawn > spawnInterval) {
    const idleCount = balls.filter(ball => !ball.interactive).length;
    if (idleCount < maxIdleBalls) {
      const spawnX = Math.random() * (canvas.width - 100) + 50;
      balls.push(new Ball(spawnX, 0, false));
      lastSpawn = timestamp;
    }
  }

  // Update and draw balls
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    ball.update();
    ball.draw();

    // Check if the ball has reached the bottom slots
    if (ball.y > canvas.height - slotHeight) {
      for (let slot of slots) {
        if (ball.x >= slot.x && ball.x <= slot.x + slot.width) {
          let points;
          if (ball.interactive) {
            points = interactiveValue * slot.bonus;
          } else {
            points = idleValue * scoreMultiplier * slot.bonus;
          }
          score += points;
          scoreElem.innerText = score.toFixed(1);
          balls.splice(i, 1);
          break;
        }
      }
    }
  }

  // Draw pegs and slots
  drawPegs();
  drawSlots();

  requestAnimationFrame(gameLoop);
}

// Set up the board and start the game loop
createPegs();
createSlots();
requestAnimationFrame(gameLoop);

// Allow clicking in the upper part of the canvas to spawn interactive balls
canvas.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  if (clickY < canvas.height / 4.5) {
    balls.push(new Ball(clickX, clickY, true));
  }
});

// Upgrade: Increase spawn rate (reduces the interval)
document.getElementById('upgradeSpawn').addEventListener('click', function() {
  if (score >= spawnRateUpgradeCost) {
    score -= spawnRateUpgradeCost;
    scoreElem.innerText = score.toFixed(1);
    spawnRateUpgradeCost = Math.floor(spawnRateUpgradeCost * 1.5);
    spawnInterval = Math.max(500, spawnInterval - 200);
    this.innerText = `Upgrade Spawn Rate (Cost: ${spawnRateUpgradeCost})`;
  }
});

// Upgrade: Increase score multiplier for idle balls
document.getElementById('upgradeScore').addEventListener('click', function() {
  if (score >= scoreMultiplierUpgradeCost) {
    score -= scoreMultiplierUpgradeCost;
    scoreElem.innerText = score.toFixed(1);
    scoreMultiplierUpgradeCost = Math.floor(scoreMultiplierUpgradeCost * 1.5);
    scoreMultiplier += 0.5;
    this.innerText = `Upgrade Score Multiplier (Cost: ${scoreMultiplierUpgradeCost})`;
  }
});

// Upgrade: Increase the maximum number of idle balls allowed on screen
document.getElementById('upgradeMaxBalls').addEventListener('click', function() {
  if (score >= maxBallsUpgradeCost) {
    score -= maxBallsUpgradeCost;
    scoreElem.innerText = score.toFixed(1);
    maxBallsUpgradeCost = Math.floor(maxBallsUpgradeCost * 1.5);
    maxIdleBalls += 5;
    this.innerText = `Upgrade Max Idle Balls (Cost: ${maxBallsUpgradeCost})`;
  }
});
