const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restart-btn");
const music = document.getElementById("music");

let tiles = [];
let score = 0;
let speed = 10; // starting speed
let gameOver = false;
let spawnInterval;
let gameOverOverlay;
let lastCol = -1;
let musicStarted = false;

const songs = ["song1.mp3", "song2.mp3", "song3.mp3"];

// Brighter background gradients
const gradients = [
  "linear-gradient(135deg, #3a7bd5, #00d2ff)", // bright blue
  "linear-gradient(135deg, #ff416c, #ff4b2b)", // bright red
  "linear-gradient(135deg, #f7971e, #ffd200)", // bright yellow
  "linear-gradient(135deg, #56ab2f, #a8e063)", // bright green
  "linear-gradient(135deg, #3a7bd5, #00d2ff)"  // back to blue
];

function updateBackground(score) {
  let index = Math.floor(score / 50) % gradients.length;
  document.body.style.background = gradients[index];
}

function playRandomSong() {
  const randomSong = songs[Math.floor(Math.random() * songs.length)];
  music.src = randomSong;

  music.play().catch(() => {
    document.body.addEventListener("click", () => music.play(), { once: true });
    document.body.addEventListener("touchstart", () => music.play(), { once: true });
  });
}

class Tile {
  constructor(col) {
    this.col = col;
    this.el = document.createElement("div");
    this.el.classList.add("tile");

    // force solid black background (ignore neon glow classes)
    this.el.style.background = "#000";

    this.el.style.top = "-25%";
    document.querySelector(`.column[data-col="${col}"]`).appendChild(this.el);
    this.clicked = false;

    this.el.addEventListener("click", () => this.hit());
    this.el.addEventListener("touchstart", () => this.hit());
  }

  move() {
    if (gameOver) return;
    const top = parseFloat(this.el.style.top);
    this.el.style.top = top + speed + "px";

    if (top + this.el.offsetHeight >= grid.clientHeight && !this.clicked) {
      endGame();
    }
  }

  hit() {
    if (this.clicked || gameOver) return;
    this.clicked = true;

    // Gold flash effect
    this.el.classList.add("gold-flash");
    setTimeout(() => this.el.remove(), 200);

    // Increase score
    score++;
    scoreDisplay.textContent = "Score: " + score;

    // Update background when score increases
    updateBackground(score);

    if (!musicStarted) {
      musicStarted = true;
      playRandomSong();
    }

    // increase difficulty
    speed = 10 + Math.floor(score / 8) * 0.5;
  }
}

function spawnTile() {
  if (gameOver) return;

  let cols = [];
  let attempts = 0;

  // always at least one tile
  let col1;
  do {
    col1 = Math.floor(Math.random() * 4);
    attempts++;
    if (attempts > 10) return;
  } while (
    col1 === lastCol ||
    tiles.some(tile => tile.col === col1 && !tile.clicked)
  );
  cols.push(col1);

  // sometimes spawn a second tile
  if (Math.random() < 0.3) { // 30% chance
    let col2;
    do {
      col2 = Math.floor(Math.random() * 4);
    } while (
      col2 === col1 ||
      tiles.some(tile => tile.col === col2 && !tile.clicked)
    );
    cols.push(col2);
  }

  lastCol = cols[cols.length - 1];

  cols.forEach(col => {
    const tile = new Tile(col);
    tiles.push(tile);
  });
}

function gameLoop() {
  if (gameOver) return;
  tiles.forEach(tile => tile.move());
  tiles = tiles.filter(tile => tile.el.parentNode);
  requestAnimationFrame(gameLoop);
}

function startGame() {
  // Reset UI
  menuScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  if (gameOverOverlay) gameOverOverlay.remove();
  restartBtn.classList.add("hidden");

  // Reset state
  score = 0;
  speed = 10;
  musicStarted = false;
  scoreDisplay.textContent = "Score: 0";
  gameOver = false;
  tiles = [];

  // Reset background to bright blue at start
  document.body.style.background = gradients[0];

  // Clear leftover tiles if restarting
  document.querySelectorAll(".tile").forEach(tile => tile.remove());

  // Start tile spawning
  spawnInterval = setInterval(spawnTile, 900);
  gameLoop();
}

function endGame() {
  gameOver = true;
  clearInterval(spawnInterval);

  if (musicStarted) {
    music.pause();
    music.currentTime = 0;
    musicStarted = false;
  }

  gameOverOverlay = document.createElement("div");
  gameOverOverlay.id = "game-over";
  gameOverOverlay.innerHTML = `
    <p>Game Over!</p>
    <p>Your Score: ${score}</p>
  `;
  gameOverOverlay.appendChild(restartBtn);
  gameScreen.appendChild(gameOverOverlay);

  restartBtn.classList.remove("hidden");
}

document.getElementById("start-btn").addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
