let TILE_SIZE = 100;
let gameStatus;
let choices = [];
let nextRemove;
let gameFinished;
let myTurn = false;
const gameMessageDiv = document.getElementById("game_message");
let drawingTile;
let drawingStep = 0;
let drawingSign;
let mySign;
let winningCondition;

function setup() {
  const calculatedWidth = min(windowWidth, 330);
  createCanvas(calculatedWidth, 330);
  TILE_SIZE = Math.ceil(calculatedWidth / 3) - 5;
  reset(false);
  gameFinished = true;
  noLoop();
}

function reset(turn) {
  mySign = turn ? "X" : "O";
  winningCondition = null;
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
        if (!choices[currentTile]) {
          drawingSign = mySign;
          drawingTile = currentTile;
          drawingStep = 0;
          loop();
          makeMove(currentTile);
        }
        return;
      }
      currentTile++;
    }
  }
}

function updateMoveData(turn, moves, winner, next, lastMove, winCondition) {
  myTurn = turn;
  if (winner) {
    gameMessageDiv.innerText = winner;
    gameFinished = true;
    winningCondition = winCondition;
    redraw();
  } else {
    if (turn) {
      gameMessageDiv.innerText = "Your Turn";
    } else {
      gameMessageDiv.innerText = "Opponent's Turn";
    }
  }
  choices = moves;
  nextRemove = next;
  if (myTurn) {
    drawingSign = mySign === "X" ? "O" : "X";
    drawingTile = lastMove;
    drawingStep = 0;
    loop();
  }
}

function drawGrid() {
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
}

function draw() {
  background(0);
  translate(width / 2, height / 2);
  stroke(255);
  strokeWeight(6);
  noFill();

  drawGrid();
  let winLine = [];
  let currentTile = 0;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      if (currentTile === drawingTile) {
        if (drawingSign === "X") {
          stroke(255, 0, 0, 255);
          const y = j * TILE_SIZE - TILE_SIZE / 4;
          if (drawingStep <= TILE_SIZE / 8) {
            const x = i * TILE_SIZE - TILE_SIZE / 4;
            line(x, y, x + drawingStep * 4, y + drawingStep * 4);
            drawingStep++;
          } else if (drawingStep <= TILE_SIZE / 4) {
            const x = i * TILE_SIZE + TILE_SIZE / 4;
            line(
              i * TILE_SIZE - TILE_SIZE / 4,
              j * TILE_SIZE - TILE_SIZE / 4,
              i * TILE_SIZE + TILE_SIZE / 4,
              j * TILE_SIZE + TILE_SIZE / 4
            );
            line(
              x,
              y,
              x - (drawingStep - TILE_SIZE / 8) * 4,
              y + (drawingStep - TILE_SIZE / 8) * 4
            );
            drawingStep++;
          } else {
            noLoop();
            drawingStep = 0;
            drawingTile = null;
            drawX(i, j);
          }
        } else {
          stroke(0, 0, 255, 255);
          if (drawingStep <= TILE_SIZE / 4) {
            arc(
              i * TILE_SIZE,
              j * TILE_SIZE,
              TILE_SIZE / 2,
              TILE_SIZE / 2,
              -PI / 2,
              (PI * drawingStep) / 16 - PI / 2
            );
            drawingStep++;
          } else {
            noLoop();
            circle(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE / 2);
            drawingStep = 0;
            drawingTile = null;
          }
        }
      } else {
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
          drawX(i, j);
        }
      }
      if (winningCondition && winningCondition[0] === currentTile) {
        winLine.push(i * TILE_SIZE);
        winLine.push(j * TILE_SIZE);
      } else if (winningCondition && winningCondition[2] === currentTile) {
        winLine.push(i * TILE_SIZE);
        winLine.push(j * TILE_SIZE);
      }
      currentTile++;
    }
  }
  drawWinLine(winLine);
}

function drawX(i, j) {
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

function drawWinLine(winLine) {
  if (winLine.length === 0) {
    return;
  }
  stroke(0, 255, 0, 150);
  line(winLine[0], winLine[1], winLine[2], winLine[3]);
}
