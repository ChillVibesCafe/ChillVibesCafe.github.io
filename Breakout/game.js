// Global variables and configuration
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Base resolution used for scaling
const baseWidth = 480, baseHeight = 320;
let scaleFactor = 1; // computed on game start

// Game states: "start", "serve", "playing", "gameover"
let gameState = "start";

// Game variables
let score, lives;
let bricks, powerups;
let brickRowCount, brickColumnCount, brickWidth, brickHeight, brickPadding, brickOffsetTop, brickOffsetLeft;
let ball, paddle;
let paddleOriginalWidth;
let paddleEnlarged = false;

// Control flags
let rightPressed = false, leftPressed = false;

// Create a single AudioContext for playing sounds
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// ==========================
// Initialization Functions
// ==========================
function initGame() {
  // Set canvas size relative to the visible window (90% of viewport)
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.9;
  // Compute uniform scale factor based on our base resolution
  scaleFactor = Math.min(canvas.width / baseWidth, canvas.height / baseHeight);

  // Initialize score and lives
  score = 0;
  lives = 3;

  // Initialize paddle
  paddle = {
    width: 75 * scaleFactor,
    height: 10 * scaleFactor,
    x: (canvas.width - 75 * scaleFactor) / 2,
    y: canvas.height - 10 * scaleFactor,
    speed: 7 * scaleFactor
  };
  paddleOriginalWidth = paddle.width;
  paddleEnlarged = false;

  // Initialize ball (it will be attached to the paddle until served)
  ball = {
    radius: 8 * scaleFactor,
    x: paddle.x + paddle.width / 2,
    y: paddle.y - 8 * scaleFactor,
    dx: 0,
    dy: 0
  };

  // Initialize brick settings so that they span the width of the game area
  brickPadding = 10 * scaleFactor;
  brickOffsetLeft = 30 * scaleFactor;
  brickOffsetTop = 30 * scaleFactor;
  brickRowCount = 5;
  // Use a desired brick width as a reference
  let desiredBrickWidth = 55 * scaleFactor;
  brickColumnCount = Math.floor((canvas.width - 2 * brickOffsetLeft + brickPadding) / (desiredBrickWidth + brickPadding));
  // Recalculate brickWidth so they evenly span the canvas width (with the given offsets)
  brickWidth = (canvas.width - 2 * brickOffsetLeft - (brickColumnCount - 1) * brickPadding) / brickColumnCount;
  brickHeight = 15 * scaleFactor;

  // Create bricks 2D array
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  // Clear any powerups from a previous game
  powerups = [];

  // Set state to "serve" so the player can launch the ball
  gameState = "serve";
}

// ==========================
// Sound Effects Function
// ==========================
function playSound(freq, type, duration) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.frequency.value = freq;
  oscillator.type = type;
  gainNode.gain.value = 0.1;
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

// ==========================
// Drawing Functions
// ==========================
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffcc00";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#33cc33";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = `${16 * scaleFactor}px Arial`;
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + score, 8 * scaleFactor, 20 * scaleFactor);
}

function drawLives() {
  ctx.font = `${16 * scaleFactor}px Arial`;
  ctx.fillStyle = "#fff";
  ctx.fillText("Lives: " + lives, canvas.width - 65 * scaleFactor, 20 * scaleFactor);
}

function drawPowerups() {
  for (let p of powerups) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = (p.type === "extraLife") ? "#ff66cc" : "#66ff66";
    ctx.fill();
    ctx.closePath();
  }
}

// ==========================
// Game Mechanics Functions
// ==========================
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        if (
          ball.x > brickX &&
          ball.x < brickX + brickWidth &&
          ball.y > brickY &&
          ball.y < brickY + brickHeight
        ) {
          ball.dy = -ball.dy;
          b.status = 0;
          score++;
          playSound(400, "square", 0.05);
          // 10% chance to drop a powerup from the hit brick
          if (Math.random() < 0.1) {
            spawnPowerup(brickX, brickY, brickWidth, brickHeight);
          }
          // Win condition: all bricks cleared
          if (score === brickRowCount * brickColumnCount) {
            gameOver(true);
            return;
          }
        }
      }
    }
  }
}

function spawnPowerup(brickX, brickY, brickW, brickH) {
  const types = ["extraLife", "enlarge"];
  const type = types[Math.floor(Math.random() * types.length)];
  const powerup = {
    x: brickX + brickW / 2,
    y: brickY + brickH / 2,
    radius: 8 * scaleFactor,
    dy: 2 * scaleFactor,
    type: type
  };
  powerups.push(powerup);
}

function updatePowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += p.dy;
    // Collision with paddle
    if (
      p.y + p.radius > paddle.y &&
      p.x > paddle.x &&
      p.x < paddle.x + paddle.width
    ) {
      applyPowerup(p);
      powerups.splice(i, 1);
    } else if (p.y - p.radius > canvas.height) {
      powerups.splice(i, 1);
    }
  }
}

function applyPowerup(p) {
  if (p.type === "extraLife") {
    lives++;
  } else if (p.type === "enlarge") {
    if (!paddleEnlarged) {
      paddleEnlarged = true;
      paddle.width *= 1.5;
      setTimeout(() => {
        paddle.width = paddleOriginalWidth;
        paddleEnlarged = false;
      }, 10000);
    }
  }
  playSound(500, "triangle", 0.1);
}

function resetBallAndPaddle() {
  ball.dx = 0;
  ball.dy = 0;
  paddle.x = (canvas.width - paddle.width) / 2;
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - ball.radius;
  gameState = "serve";
}

function launchBall() {
  // Launch the ball with a slight random angle
  const angle = (Math.random() - 0.5) * (Math.PI / 3); // between -30° and 30°
  const speed = 3 * scaleFactor;
  ball.dx = speed * Math.sin(angle);
  ball.dy = -speed * Math.cos(angle);
  gameState = "playing";
}

// Called when lives run out or when all bricks are cleared (win)
function gameOver(win) {
  gameState = "gameover";
  let storedHighScore = localStorage.getItem("breakoutHighScore");
  if (!storedHighScore || score > storedHighScore) {
    localStorage.setItem("breakoutHighScore", score);
    storedHighScore = score;
  }
  document.getElementById("finalScore").innerText = win
    ? "You Win! Score: " + score
    : "Game Over! Score: " + score;
  document.getElementById("highScore").innerText = "High Score: " + storedHighScore;
  document.getElementById("gameOverScreen").style.display = "flex";
  playSound(100, "sawtooth", 0.3);
}

// ==========================
// Main Game Loop
// ==========================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "playing" || gameState === "serve") {
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    drawPowerups();

    if (gameState === "playing") {
      collisionDetection();
      updatePowerups();

      // Bounce off left/right walls
      if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
        playSound(200, "sine", 0.05);
      }
      // Bounce off the top wall
      if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
        playSound(200, "sine", 0.05);
      }
      // Check collision with paddle or bottom
      else if (ball.y + ball.dy > canvas.height - ball.radius - paddle.height) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
          const relativeIntersect = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
          const bounceAngle = relativeIntersect * (Math.PI / 3);
          const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
          ball.dx = speed * Math.sin(bounceAngle);
          ball.dy = -speed * Math.cos(bounceAngle);
          if (rightPressed) ball.dx += 0.5 * scaleFactor;
          if (leftPressed) ball.dx -= 0.5 * scaleFactor;
          playSound(300, "sine", 0.05);
        } else if (ball.y + ball.dy > canvas.height - ball.radius) {
          lives--;
          if (lives <= 0) {
            gameOver(false);
            return;
          } else {
            resetBallAndPaddle();
          }
        }
      }

      ball.x += ball.dx;
      ball.y += ball.dy;
    } else if (gameState === "serve") {
      // Stick the ball to the paddle
      ball.x = paddle.x + paddle.width / 2;
      ball.y = paddle.y - ball.radius;
      ctx.font = `${16 * scaleFactor}px Arial`;
      ctx.fillStyle = "#fff";
      const serveText = "Press W to serve";
      const textWidth = ctx.measureText(serveText).width;
      ctx.fillText(serveText, (canvas.width - textWidth) / 2, canvas.height / 2);
    }

    // Update paddle movement (works in both "serve" and "playing" states)
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
      paddle.x += paddle.speed;
    }
    if (leftPressed && paddle.x > 0) {
      paddle.x -= paddle.speed;
    }
  }

  requestAnimationFrame(draw);
}

// ==========================
// Input Handlers
// ==========================
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  const key = e.key;
  if (key === "Right" || key === "ArrowRight" || key === "d" || key === "D") {
    rightPressed = true;
  } else if (key === "Left" || key === "ArrowLeft" || key === "a" || key === "A") {
    leftPressed = true;
  }
  // Launch the ball if in "serve" state
  if (gameState === "serve" && (key === "w" || key === "W" || key === "ArrowUp")) {
    launchBall();
  }
}

function keyUpHandler(e) {
  const key = e.key;
  if (key === "Right" || key === "ArrowRight" || key === "d" || key === "D") {
    rightPressed = false;
  } else if (key === "Left" || key === "ArrowLeft" || key === "a" || key === "A") {
    leftPressed = false;
  }
}

// ==========================
// UI Button Event Listeners
// ==========================
document.getElementById("startButton").addEventListener("click", function () {
  document.getElementById("startScreen").style.display = "none";
  initGame();
});

document.getElementById("restartButton").addEventListener("click", function () {
  document.getElementById("gameOverScreen").style.display = "none";
  initGame();
});

// ==========================
// Start the Render Loop
// ==========================
draw();
