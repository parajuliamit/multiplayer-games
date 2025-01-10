let w;
const row = 6;
const col = 7;
const win = 4;

let resultDiv;

let grid = [];

let turn;
let movingGrid = {};
let winningSpots;

function setup() {
  w = Math.round(Math.min(80, windowWidth / 8));
  createCanvas(col * w, row * w);
  resultDiv = document.getElementById("result");
  setupGrid();
  frameRate(20);
  document.getElementById("restart").addEventListener("click", () => {
    if (winningSpots?.length) {
      setupGrid();
    } else {
      if (confirm("Do you want to restart the game?")) setupGrid();
    }
  });
}

function touchStarted() {
  if (movingGrid.x !== undefined) return;
  if (mouseX < 0 || mouseX > width) return;
  if (mouseY < 0 || mouseY > height) return;
  let clickedColumn = Math.floor(mouseX / w);
  addCoin(clickedColumn);
}

function mousePressed() {
  if (movingGrid.x !== undefined) return;
  if (mouseX < 0 || mouseX > width) return;
  if (mouseY < 0 || mouseY > height) return;
  let clickedColumn = Math.floor(mouseX / w);
  addCoin(clickedColumn);
}

function draw() {
  background(0);
  for (let i = 0; i < col; i++) {
    for (let j = 0; j < row; j++) {
      grid[i][j].show();
    }
  }
  moveCoin();
}

function setupGrid() {
  turn = random() < 0.5 ? "yellow" : "red";
  changeTurn();
  winningSpots = [];
  for (let i = 0; i < col; i++) {
    grid[i] = [];
    for (let j = 0; j < row; j++) {
      grid[i].push(new Spot(i, j));
    }
  }
}

function addCoin(clm) {
  if (winningSpots.length || grid[clm][0].coin) return;
  grid[clm][0].coin = turn;
  if (grid[clm][1].coin) {
    checkWin(turn, clm, 0);
    changeTurn();
    return;
  }
  movingGrid.x = clm;
  movingGrid.y = 0;
}

function moveCoin() {
  if (movingGrid.x === undefined) return;
  grid[movingGrid.x][movingGrid.y].coin = null;
  grid[movingGrid.x][movingGrid.y + 1].coin = turn;
  if (movingGrid.y + 2 >= row || grid[movingGrid.x][movingGrid.y + 2].coin) {
    checkWin(turn, movingGrid.x, movingGrid.y + 1);
    changeTurn();
    movingGrid = {};
    return;
  }
  movingGrid.y++;
}

function changeTurn() {
  if (winningSpots?.length) return;
  turn = turn === "yellow" ? "red" : "yellow";
  resultDiv.innerText = "TURN: " + turn.toUpperCase();
  resultDiv.style.color = turn;
}

function checkWin(player, col, row) {
  if (checkNeighbor(player, col, row, 1, 0)) return;
  if (checkNeighbor(player, col, row, 0, 1)) return;
  if (checkNeighbor(player, col, row, 1, 1)) return;
  if (checkNeighbor(player, col, row, 1, -1)) return;
}

function drawWin() {
  for (let spot of winningSpots) {
    spot.winning = true;
  }
  resultDiv.innerText = turn.toUpperCase() + " WINS !!";
  resultDiv.style.color = turn;
}

function checkNeighbor(player, x, y, dirX, dirY) {
  const winningMove = [];
  winningMove.push(grid[x][y]);
  let currentCheckX = x + dirX;
  let currentCheckY = y + dirY;

  while (
    currentCheckX >= 0 &&
    currentCheckX < col &&
    currentCheckY >= 0 &&
    currentCheckY < row &&
    grid[currentCheckX][currentCheckY].coin === player
  ) {
    winningMove.push(grid[currentCheckX][currentCheckY]);
    if (winningMove.length >= 4) {
      winningSpots = winningMove;
      drawWin();
      return true;
    }
    currentCheckX += dirX;
    currentCheckY += dirY;
  }

  currentCheckX = x - dirX;
  currentCheckY = y - dirY;

  while (
    currentCheckX >= 0 &&
    currentCheckX < col &&
    currentCheckY >= 0 &&
    currentCheckY < row &&
    grid[currentCheckX][currentCheckY].coin === player
  ) {
    winningMove.push(grid[currentCheckX][currentCheckY]);
    if (winningMove.length >= 4) {
      winningSpots = winningMove;
      drawWin();
      return true;
    }
    currentCheckX -= dirX;
    currentCheckY -= dirY;
  }
}
