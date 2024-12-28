let TILE_SIZE;
let BOARD_MARGIN;
let choices = [];
let nextRemove;
let gameFinished;
let myTurn = false;
let drawingTile;
let drawingStep = 0;
let drawingSign;
let mySign;
let winningCondition;

const gameMessageDiv = document.getElementById("game_message");

function setup() {
  const calculatedWidth = min(windowWidth, 390);
  createCanvas(calculatedWidth, calculatedWidth);
  BOARD_MARGIN = calculatedWidth / 15;
  TILE_SIZE = (calculatedWidth - BOARD_MARGIN * 2) / 3;
  reset(false);
  gameFinished = true;
  noLoop();
}

function reset(turn) {
  mySign = turn ? "X" : "O";
  winningCondition = null;
  choices = [];
  gameMessageDiv.innerText = turn ? "Your Turn (X)" : "Opponent's Turn (X)";
  gameFinished = false;
  myTurn = turn;
  nextRemove = undefined;
  drawingTile = null;
  drawingStep = 0;
  drawingSign = null;
  redraw();
}

function mousePressed() {
  clickTile(mouseX, mouseY);
}

function touchStarted() {
  clickTile(mouseX, mouseY);
}

function clickTile(x, y) {
  if (gameFinished || !myTurn) {
    return;
  }

  if (
    x < BOARD_MARGIN ||
    x > 3 * TILE_SIZE + BOARD_MARGIN ||
    y < BOARD_MARGIN ||
    y > 3 * TILE_SIZE + BOARD_MARGIN
  ) {
    return;
  }

  const i = Math.floor((x - BOARD_MARGIN) / TILE_SIZE);
  const j = Math.floor((y - BOARD_MARGIN) / TILE_SIZE);
  const currentTile = i + j * 3;

  if (!choices[currentTile]) {
    drawingSign = mySign;
    drawingTile = currentTile;
    drawingStep = 0;
    loop();
    makeMove(currentTile);
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
      gameMessageDiv.innerText = "Your Turn (" + mySign + ")";
    } else {
      gameMessageDiv.innerText =
        "Opponent's Turn (" + (mySign === "X" ? "O" : "X") + ")";
    }
  }
  choices = moves;
  nextRemove = next;
  if (myTurn) {
    drawingSign = mySign === "X" ? "O" : "X";
    drawingTile = lastMove;
    drawingStep = 0;
    loop();
  } else {
    redraw();
  }
}

function drawGrid() {
  drawingContext.shadowColor = "rgba(0, 255, 0, 1)";
  stroke(200, 230, 200);
  for (let i = 1; i < 3; i++) {
    line(
      i * TILE_SIZE + BOARD_MARGIN,
      BOARD_MARGIN,
      i * TILE_SIZE + BOARD_MARGIN,
      width - BOARD_MARGIN
    );
    line(
      BOARD_MARGIN,
      i * TILE_SIZE + BOARD_MARGIN,
      width - BOARD_MARGIN,
      i * TILE_SIZE + BOARD_MARGIN
    );
  }
}

function draw() {
  background(0);
  strokeWeight(6);
  noFill();
  drawingContext.shadowBlur = 15;
  drawGrid();
  drawingContext.shadowBlur = 20;

  let winLine = [];
  for (let i = 0; i < 9; i++) {
    if (i === drawingTile) {
      if (drawingSign === "X") {
        const x = (i % 3) * TILE_SIZE + BOARD_MARGIN;
        const y = Math.floor(i / 3) * TILE_SIZE + BOARD_MARGIN;
        drawingContext.shadowColor = "rgba(255, 0, 0, 0.8)";
        stroke(255, 0, 0, 255);
        if (drawingStep <= TILE_SIZE / 8) {
          line(
            x + TILE_SIZE / 4,
            y + TILE_SIZE / 4,
            x + TILE_SIZE / 4 + drawingStep * 4,
            y + TILE_SIZE / 4 + drawingStep * 4
          );
          drawingStep += 1.5;
        } else if (drawingStep <= TILE_SIZE / 4) {
          line(
            x + TILE_SIZE / 4,
            y + TILE_SIZE / 4,
            x + (3 * TILE_SIZE) / 4,
            y + (3 * TILE_SIZE) / 4
          );
          line(
            x + (3 * TILE_SIZE) / 4,
            y + TILE_SIZE / 4,
            x + (3 * TILE_SIZE) / 4 - (drawingStep - TILE_SIZE / 8) * 4,
            y + TILE_SIZE / 4 + (drawingStep - TILE_SIZE / 8) * 4
          );
          drawingStep += 1.5;
        } else {
          noLoop();
          drawingStep = 0;
          drawingTile = null;
          drawX(i);
        }
      } else {
        const x = (i % 3) * TILE_SIZE + BOARD_MARGIN + TILE_SIZE / 2;
        const y = Math.floor(i / 3) * TILE_SIZE + BOARD_MARGIN + TILE_SIZE / 2;
        stroke(0, 0, 255, 255);
        drawingContext.shadowColor = "rgba(0, 0, 255, 0.8)";
        if (drawingStep <= TILE_SIZE / 4) {
          arc(
            x,
            y,
            TILE_SIZE / 2,
            TILE_SIZE / 2,
            -PI / 2,
            (PI * drawingStep) / 16 - PI / 2
          );
          drawingStep += 1.5;
        } else {
          noLoop();
          circle(x, y, TILE_SIZE / 2);
          drawingStep = 0;
          drawingTile = null;
        }
      }
    } else {
      if (choices[i] === "O") {
        const x = (i % 3) * TILE_SIZE + BOARD_MARGIN + TILE_SIZE / 2;
        const y = Math.floor(i / 3) * TILE_SIZE + BOARD_MARGIN + TILE_SIZE / 2;
        drawingContext.shadowColor = "rgba(0, 0, 255, 0.8)";
        if (i === nextRemove) {
          stroke(0, 0, 255, 100);
        } else {
          stroke(0, 0, 255, 255);
        }
        circle(x, y, TILE_SIZE / 2);
      } else if (choices[i] === "X") {
        if (i === nextRemove) {
          stroke(255, 0, 0, 100);
        } else {
          stroke(255, 0, 0, 255);
        }
        drawX(i);
      }
    }
    if (
      winningCondition &&
      (winningCondition[0] === i || winningCondition[2] === i)
    ) {
      const x = (i % 3) * TILE_SIZE + BOARD_MARGIN + TILE_SIZE / 2;
      const y = Math.floor(i / 3) * TILE_SIZE + BOARD_MARGIN + TILE_SIZE / 2;
      winLine.push(x);
      winLine.push(y);
    }
  }
  drawWinLine(winLine);
}

function drawX(i) {
  const x = (i % 3) * TILE_SIZE + BOARD_MARGIN;
  const y = Math.floor(i / 3) * TILE_SIZE + BOARD_MARGIN;
  drawingContext.shadowColor = "rgba(255, 0, 0, 0.8)";
  line(
    x + TILE_SIZE / 4,
    y + TILE_SIZE / 4,
    x + (3 * TILE_SIZE) / 4,
    y + (3 * TILE_SIZE) / 4
  );
  line(
    x + (3 * TILE_SIZE) / 4,
    y + TILE_SIZE / 4,
    x + TILE_SIZE / 4,
    y + (3 * TILE_SIZE) / 4
  );
}

function drawWinLine(winLine) {
  if (winLine.length === 0) {
    return;
  }
  drawingContext.shadowColor = "rgba(0, 255, 0, 0.8)";
  stroke(0, 255, 0, 150);
  line(winLine[0], winLine[1], winLine[2], winLine[3]);
}
