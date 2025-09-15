const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restart-btn");
const music = document.getElementById("music");

let tiles = [];
let score = 0;
let speed = 6; // faster starting speed
let gameOver = false;
let spawnInterval;
let gameOverOverlay;
let lastCol = -1;
let musicStarted = false; // track if music started

// Local songs in the same folder as index.html
const songs = [
  "song1.mp3",
  "song2.mp3",
  "song3.mp3"
];

function playRandomSong() {
  const randomSong = songs[Math.floor(Math.random() * songs.length)];
  music.src = randomSong;

  // Ensure playback works after user interaction
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
    this.el.remove();
    score++;
    scoreDisplay.textContent = "Score: " + score;

    // start music on first hit
    if (!musicStarted) {
      musicStarted = true;
      playRandomSong();
    }

    // increase difficulty gradually
    speed = 6 + Math.floor(score / 8) * 0.7; 
  }
}

function spawnTile() {
  if (gameOver) return;

  let col;
  do {
    col = Math.floor(Math.random() * 4);
  } while (col === lastCol); 
  lastCol = col;

  const tile = new Tile(col);
  tiles.push(tile);
}

function gameLoop() {
  if (gameOver) return;
  tiles.forEach(tile => tile.move());
  tiles = tiles.filter(tile => tile.el.parentNode);
  requestAnimationFrame(gameLoop);
}

function startGame() {
  // Reset states
  menuScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  if (gameOverOverlay) gameOverOverlay.remove();
  restartBtn.classList.add("hidden");

  score = 0;
  speed = 6; // reset starting speed
  musicStarted = false;
  scoreDisplay.textContent = "Score: 0";
  gameOver = false;
  tiles = [];

  spawnInterval = setInterval(spawnTile, 1000);
  gameLoop();
}

function endGame() {
  gameOver = true;
  clearInterval(spawnInterval);

  if (musicStarted) {
    music.pause();
    music.currentTime = 0; // reset music for next round
    musicStarted = false;
  }

  // Create game over overlay
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
