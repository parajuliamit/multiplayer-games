let TILE_SIZE;
let BOARD_MARGIN;
let choices = [];
let coiceHistory = [];
let nextRemove;
let gameFinished;
let currentTurn = {};
let drawingTile;
let drawingStep = 0;
let drawingSign;
let winningCondition;

let player1;
let player2;
let lastStart;

const gameMessageDiv = document.getElementById("game_message");
const playAgainButton = document.getElementById("play_again");

const player1Win = document.getElementById("player1win");
const player2Win = document.getElementById("player2win");
const inputModal = document.getElementById("modalOverlay");
const playBtn = document.getElementById("playBtn");
const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");
const player1Name = document.getElementById("player1name");
const player2Name = document.getElementById("player2name");

function exitGame() {
  if (confirm("Are you sure you want to leave the game?")) {
    window.location.href = "/";
  }
}

function playAgain() {
  document.getElementById("play_again").style.display = "none";
  reset();
}

function setup() {
  const calculatedWidth = min(windowWidth, 390);
  createCanvas(calculatedWidth, calculatedWidth);
  BOARD_MARGIN = calculatedWidth / 15;
  TILE_SIZE = (calculatedWidth - BOARD_MARGIN * 2) / 3;
  noLoop();
  inputModal.style.display = "flex";
  playBtn.addEventListener("click", () => {
    inputModal.style.display = "none";
    player1 = player1Input.value;
    player2 = player2Input.value;
    player1Input.value = "";
    player2Input.value = "";

    if (!player1.trim() || !player2.trim()) {
      player1 = "Player 1";
      player2 = "Player 2";
    }
    player1 = player1.length > 10 ? player1.substring(0, 10) : player1;
    player2 = player2.length > 10 ? player2.substring(0, 10) : player2;
    if (player1 === player2) {
      player1 = player1 + " 1";
      player2 = player2 + " 2";
    }
    player1Name.innerText = player1;
    player2Name.innerText = player2;
    reset();
  });
}

function reset() {
  currentTurn = {
    player: lastStart === player1 ? player2 : player1,
    sign: "X",
  };
  lastStart = currentTurn.player;
  winningCondition = null;
  choices = [];
  gameMessageDiv.innerText = currentTurn.player + "'s Turn";
  gameFinished = false;
  nextRemove = undefined;
  coiceHistory = [];
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
  if (gameFinished || !player1 || !player2) {
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
    drawingSign = currentTurn.sign;
    drawingTile = currentTile;
    drawingStep = 0;
    choices[currentTile] = drawingSign;
    coiceHistory.push(currentTile);
    if (nextRemove >= 0) choices[nextRemove] = undefined;
    if (coiceHistory.length === 6) {
      nextRemove = coiceHistory.shift();
    }
    if (coiceHistory.length < 5 || !checkWinner()) {
      currentTurn.player = currentTurn.player === player1 ? player2 : player1;
      currentTurn.sign = currentTurn.sign === "X" ? "O" : "X";
      gameMessageDiv.innerText = currentTurn.player + "'s Turn";
    }
    loop();
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

  const winLine = [];
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

function checkWinner() {
  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let condition of winningConditions) {
    if (
      choices[condition[0]] &&
      choices[condition[0]] === choices[condition[1]] &&
      choices[condition[1]] === choices[condition[2]]
    ) {
      winningCondition = condition;
      gameFinished = true;
      gameMessageDiv.innerText = currentTurn.player + " Wins !";
      playAgainButton.style.display = "block";
      if (currentTurn.player === player1) {
        player1Win.innerText = parseInt(player1Win.innerText) + 1;
      } else {
        player2Win.innerText = parseInt(player2Win.innerText) + 1;
      }
      return true;
    }
  }
}
