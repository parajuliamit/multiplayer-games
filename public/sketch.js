let TILE_SIZE = 100;
let gameStatus;
let choices = [];
let nextRemove;
let gameFinished;
let myTurn = false;
const gameMessageDiv = document.getElementById("game_message");

function setup() {
  const calculatedWidth = min(windowWidth, 330);
  createCanvas(calculatedWidth, 330);
  TILE_SIZE = calculatedWidth / 3;
  translate(width / 2, height / 2);
  reset(false);
  gameFinished = true;
  noLoop();
}

function reset(turn) {
  choices = [];
  gameMessageDiv.innerText = turn ? "Your Turn" : "Opponent's Turn";
  gameFinished = false;
  myTurn = turn;
  redraw();
}

function mousePressed() {
  if (gameFinished || !myTurn) {
    return;
  }
  const relativeX = mouseX - width / 2;
  const relativeY = mouseY - height / 2;
  let currentTile = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (
        relativeX > -TILE_SIZE / 2 + j * TILE_SIZE &&
        relativeX < TILE_SIZE / 2 + j * TILE_SIZE &&
        relativeY > -TILE_SIZE / 2 + i * TILE_SIZE &&
        relativeY < TILE_SIZE / 2 + i * TILE_SIZE
      ) {
        console.log("Clicked on tile", currentTile);
        if (!choices[currentTile]) {
          makeMove(currentTile);
        }
        return;
      }
      currentTile++;
    }
  }
}

function updateMoveData(turn, moves, winner, next) {
  myTurn = turn;
  if (winner) {
    gameMessageDiv.innerText = winner;
    gameFinished = true;
  } else {
    if (turn) {
      gameMessageDiv.innerText = "Your Turn";
    } else {
      gameMessageDiv.innerText = "Opponent's Turn";
    }
  }
  choices = moves;
  nextRemove = next;
  redraw();
}

function draw() {
  background(0);

  translate(width / 2, height / 2);
  stroke(255);
  strokeWeight(6);
  noFill();

  for (let i = 1; i < 3; i++) {
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
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      if (choices[currentTile] === "O") {
        if (currentTile === nextRemove) {
          stroke(0, 0, 255, 100);
        } else {
          stroke(0, 0, 255, 255);
        }
        circle(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE / 2);
      } else if (choices[currentTile] === "X") {
        if (currentTile === nextRemove) {
          stroke(255, 0, 0, 100);
        } else {
          stroke(255, 0, 0, 255);
        }
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
      }
      currentTile++;
    }
  }
}
