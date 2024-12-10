let TILE_SIZE = 100;
let lastStarted;
let currentTurn;
let gameStatus;
let choices = [];
const winningCondition = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
let gameFinished;

function setup() {
  const calculatedWidth = min(windowWidth, 400);
  createCanvas(calculatedWidth, 400);
  TILE_SIZE = calculatedWidth / 4;
  translate(width / 2, height / 2);
  reset();
  noLoop();
}

function reset() {
  choices = [];
  if (!lastStarted) {
    currentTurn = random(["X", "O"]);
    lastStarted = currentTurn;
  } else {
    currentTurn = lastStarted === "X" ? "O" : "X";
    lastStarted = currentTurn;
  }
  gameStatus = "Current Turn: " + currentTurn;
  gameFinished = false;
  redraw();
}

function mousePressed() {
  if (gameFinished) {
    confirm(gameStatus + " Do you want to play again?") && reset();
    return;
  }
  const relativeX = mouseX - width / 2;
  const relativeY = mouseY - height / 2;
  let currentTile = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (
        relativeX > -TILE_SIZE / 2 + i * TILE_SIZE &&
        relativeX < TILE_SIZE / 2 + i * TILE_SIZE &&
        relativeY > -TILE_SIZE / 2 + j * TILE_SIZE &&
        relativeY < TILE_SIZE / 2 + j * TILE_SIZE
      ) {
        if (!choices[currentTile]) {
          choices[currentTile] = currentTurn;
          if (currentTurn == "O") {
            currentTurn = "X";
          } else {
            currentTurn = "O";
          }
          gameStatus = "Current Turn: " + currentTurn;
          redraw();
          return;
        }
      }
      currentTile++;
    }
  }
}

function draw() {
  background(220);

  translate(width / 2, height / 2);
  stroke(0);
  strokeWeight(2);
  noFill();

  for (let i = 0; i <= 3; i++) {
    line(
      i * TILE_SIZE - TILE_SIZE * 1.5,
      -TILE_SIZE * 1.5,
      i * TILE_SIZE - TILE_SIZE * 1.5,
      TILE_SIZE * 1.5
    );
    line(
      -TILE_SIZE * 1.5,
      i * TILE_SIZE - TILE_SIZE * 1.5,
      TILE_SIZE * 1.5,
      i * TILE_SIZE - TILE_SIZE * 1.5
    );
  }

  let currentTile = 0;
  let filled = true;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (choices[currentTile] === "O") {
        circle(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE / 2);
      } else if (choices[currentTile] === "X") {
        line(
          i * TILE_SIZE - TILE_SIZE / 4,
          j * TILE_SIZE - TILE_SIZE / 4,
          i * TILE_SIZE + TILE_SIZE / 4,
          j * TILE_SIZE + TILE_SIZE / 4
        );
        line(
          i * TILE_SIZE + TILE_SIZE / 4,
          j * TILE_SIZE - TILE_SIZE / 4,
          i * TILE_SIZE - TILE_SIZE / 4,
          j * TILE_SIZE + TILE_SIZE / 4
        );
      } else {
        filled = false;
      }
      currentTile++;
    }
  }

  if (choices.length > 3) {
    for (let condition of winningCondition) {
      if (
        choices[condition[0]] &&
        choices[condition[0]] === choices[condition[1]] &&
        choices[condition[1]] === choices[condition[2]]
      ) {
        filled = false;
        gameStatus = choices[condition[0]] + " WINS !!";
        gameFinished = true;
      }
    }
  }

  strokeWeight(0);
  fill(0);
  textSize(28);
  textAlign(CENTER, CENTER);
  if (filled) {
    gameStatus = "DRAW !!";
    gameFinished = true;
  }
  text(gameStatus, 0, height / 2 - 25);
}
