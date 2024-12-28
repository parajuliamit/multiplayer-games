let TILE_SIZE;
let BOARD_MARGIN;

let tiger;
let goat;

let goatsAvailable;

let board = [];

let yourAnimal;
let currentTurn;
let selectedAnimal;
let possibleMoves = [];
let couldKill = [];
let movingAnimal;
let currentPosition;
let destinationPosition;
let movingDirection;

let winner;

let currentDrag;

function preload() {
  tiger = loadImage("../../images/tiger.png");
  goat = loadImage("../../images/goat.png");
}

function setup() {
  const calculatedWidth = min(windowWidth - 60, windowHeight - 100, 600);
  createCanvas(calculatedWidth, calculatedWidth);
  BOARD_MARGIN = calculatedWidth / 12;
  TILE_SIZE = calculatedWidth / 4 - BOARD_MARGIN / 2;
}

function resetGame(roomBoard, turn, myTurn, goatsRemaining) {
  setAnimal(null);
  currentTurn = turn;
  yourAnimal = myTurn ? "goat" : "tiger";
  board = roomBoard;
  goatsAvailable = goatsRemaining;
  winner = null;
}

function mouseDragged() {
  dragAnimal(mouseX, mouseY);
}

function touchMoved() {
  dragAnimal(mouseX, mouseY);
}

function dragAnimal(x, y) {
  if (winner || yourAnimal !== currentTurn) return;
  if (yourAnimal === "goat" && goatsAvailable > 0) return;
  if (!currentDrag) {
    const i = Math.round((x - BOARD_MARGIN) / TILE_SIZE);
    const j = Math.round((y - BOARD_MARGIN) / TILE_SIZE);
    if (i > 4 || j > 4 || i < 0 || j < 0) return;
    const x1 = i * TILE_SIZE + BOARD_MARGIN;
    const y1 = j * TILE_SIZE + BOARD_MARGIN;
    const distanceFromPoint = dist(x, y, x1, y1);
    if (distanceFromPoint < TILE_SIZE / 3) {
      if (yourAnimal === "tiger" && board[i][j] === "tiger") {
        setAnimal(createVector(i, j));
        currentDrag = tiger;
      } else if (
        yourAnimal === "goat" &&
        goatsAvailable == 0 &&
        board[i][j] === "goat"
      ) {
        currentDrag = goat;
        setAnimal(createVector(i, j));
      }
    }
  }
}

function touchEnded() {
  if (winner || yourAnimal !== currentTurn) return;
  if (currentDrag) {
    currentDrag = null;
    yourMove(mouseX, mouseY, false);
  } else {
    yourMove(mouseX, mouseY, true);
  }
}

function draw() {
  if (!yourAnimal) return;
  cursor("default");
  background(0);
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = "rgba(255, 255, 255, 0.7)";
  drawGrid();
  drawAnimalAndNodes();

  if (movingAnimal) {
    image(
      board[movingAnimal.x][movingAnimal.y] === "tiger" ? tiger : goat,
      currentPosition.x - TILE_SIZE / 4,
      currentPosition.y - TILE_SIZE / 4,
      TILE_SIZE / 2,
      TILE_SIZE / 2
    );
    if (currentPosition.dist(destinationPosition) < 16) {
      movingAnimal = null;
      if (winner) {
        noLoop();
        stroke(255);
        strokeWeight(4);
        fill(180, 100, 100);
        textAlign(CENTER);
        textSize(TILE_SIZE / 3);
        drawingContext.shadowBlur = 25;
        drawingContext.shadowColor = "rgba(255, 0, 255, 1)";
        text(winner.toUpperCase() + " WINS", width / 2, height / 2);
        return;
      }
    } else {
      currentPosition.add(movingDirection);
    }
  }

  if (currentDrag) {
    tint(255, 100);
    cursor("grab");
    image(
      currentDrag,
      mouseX - TILE_SIZE / 4,
      mouseY - TILE_SIZE / 4,
      TILE_SIZE / 2,
      TILE_SIZE / 2
    );
    tint(255, 255);
  }
  if (yourAnimal === "goat" && currentTurn === "goat" && goatsAvailable > 0) {
    tint(255, 100);
    image(
      goat,
      mouseX - TILE_SIZE / 4,
      mouseY - TILE_SIZE / 4,
      TILE_SIZE / 2,
      TILE_SIZE / 2
    );
    tint(255, 255);
  }
}

function drawGrid() {
  stroke(50);
  strokeWeight(TILE_SIZE / 20);
  for (let i = 0; i <= 4; i++) {
    line(
      i * TILE_SIZE + BOARD_MARGIN,
      BOARD_MARGIN,
      i * TILE_SIZE + BOARD_MARGIN,
      height - BOARD_MARGIN
    );
    line(
      BOARD_MARGIN,
      i * TILE_SIZE + BOARD_MARGIN,
      width - BOARD_MARGIN,
      i * TILE_SIZE + BOARD_MARGIN
    );
  }

  line(BOARD_MARGIN, BOARD_MARGIN, width - BOARD_MARGIN, height - BOARD_MARGIN);
  line(width - BOARD_MARGIN, BOARD_MARGIN, BOARD_MARGIN, height - BOARD_MARGIN);

  line(width / 2, BOARD_MARGIN, BOARD_MARGIN, height / 2);
  line(width / 2, BOARD_MARGIN, width - BOARD_MARGIN, height / 2);

  line(width / 2, height - BOARD_MARGIN, BOARD_MARGIN, height / 2);
  line(width / 2, height - BOARD_MARGIN, width - BOARD_MARGIN, height / 2);

  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor =
    currentTurn === "goat" ? "rgba(255, 0, 255, 1)" : "rgba(255, 127, 80, 1)";
  strokeWeight(TILE_SIZE / 15);
  for (let move of possibleMoves) {
    line(
      selectedAnimal.x * TILE_SIZE + BOARD_MARGIN,
      selectedAnimal.y * TILE_SIZE + BOARD_MARGIN,
      move.x * TILE_SIZE + BOARD_MARGIN,
      move.y * TILE_SIZE + BOARD_MARGIN
    );
  }
  drawingContext.shadowBlur = 0;
}

function drawAnimalAndNodes() {
  drawingContext.shadowBlur = 0;
  for (let i = 0; i <= 4; i++) {
    for (let j = 0; j <= 4; j++) {
      const x = i * TILE_SIZE + BOARD_MARGIN;
      const y = j * TILE_SIZE + BOARD_MARGIN;

      if (movingAnimal && movingAnimal.x == i && movingAnimal.y == j) {
        drawCircle(x, y);
        continue;
      }

      if (board[i][j] === "tiger") {
        if (selectedAnimal && selectedAnimal.x == i && selectedAnimal.y == j) {
          drawingContext.shadowBlur = 50;
          drawingContext.shadowColor = "rgba(255, 127, 80, 1)";
        }
        image(
          tiger,
          x - TILE_SIZE / 4,
          y - TILE_SIZE / 4,
          TILE_SIZE / 2,
          TILE_SIZE / 2
        );
      } else if (board[i][j] === "goat") {
        if (selectedAnimal && selectedAnimal.x == i && selectedAnimal.y == j) {
          drawingContext.shadowBlur = 50;
          drawingContext.shadowColor = "rgba(255, 0, 255, 1)";
        }
        image(
          goat,
          x - TILE_SIZE / 4,
          y - TILE_SIZE / 4,
          TILE_SIZE / 2,
          TILE_SIZE / 2
        );
      } else {
        drawCircle(x, y);
      }
      drawingContext.shadowBlur = 0;
    }
  }

  if (!winner && possibleMoves.length) {
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor =
      yourAnimal === "goat" ? "rgba(255, 0, 255, 1)" : "rgba(255, 127, 80, 1)";
    fill(50);
    if (yourAnimal === "goat") stroke(255, 0, 255, 100);
    else stroke(255, 127, 80, 100);
    strokeWeight(1);
    for (let move of possibleMoves) {
      const x = move.x * TILE_SIZE + BOARD_MARGIN;
      const y = move.y * TILE_SIZE + BOARD_MARGIN;
      const distance = dist(mouseX, mouseY, x, y);
      circle(x, y, TILE_SIZE * 0.25);
      if (distance <= TILE_SIZE * 0.3) {
        if (yourAnimal === "goat") fill(255, 0, 255, 50);
        else fill(255, 127, 80, 50);
        circle(x, y, TILE_SIZE * 0.25);
        fill(50);
      }
    }
  }

  if (!winner && couldKill.length) {
    drawingContext.shadowBlur = 50;
    drawingContext.shadowColor = "rgba(255, 0, 0, 1)";
    for (let kill of couldKill) {
      const x = kill.x * TILE_SIZE + BOARD_MARGIN;
      const y = kill.y * TILE_SIZE + BOARD_MARGIN;
      image(
        goat,
        x - TILE_SIZE / 4,
        y - TILE_SIZE / 4,
        TILE_SIZE / 2,
        TILE_SIZE / 2
      );
    }
  }
}

function drawCircle(x, y) {
  fill(50);
  const distance = dist(mouseX, mouseY, x, y);
  const withinNode = distance <= TILE_SIZE * 0.3;
  if (
    !winner &&
    withinNode &&
    currentTurn === "goat" &&
    yourAnimal === "goat" &&
    goatsAvailable > 0
  ) {
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = "rgba(255, 0, 255, 1)";
    stroke(255, 0, 255, 100);
  } else {
    stroke(255, 50);
  }
  strokeWeight(1);
  circle(x, y, TILE_SIZE * 0.25);
}

function getNearbyNodes(i, j) {
  possibleMoves = [];
  couldKill = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      if (x === 0 && y === 0) continue;
      if (x + i >= 0 && x + i <= 4 && y + j >= 0 && y + j <= 4) {
        if (board[x + i][y + j] === "tiger") continue;
        if (currentTurn === "goat" && board[x + i][y + j] === "goat") continue;
        const moveX = abs(x);
        const moveY = abs(y);
        const canCross = moveX === 1 && moveY === 1 && (i + j) % 2 === 0;
        if (canCross || moveX + moveY === 1) {
          if (board[x + i][y + j] === "goat") {
            const skipX = i + x * 2;
            const skipY = j + y * 2;
            if (skipX >= 0 && skipX <= 4 && skipY >= 0 && skipY <= 4) {
              if (
                board[skipX][skipY] === "goat" ||
                board[skipX][skipY] === "tiger"
              )
                continue;
              couldKill.push(createVector(x + i, y + j));
              possibleMoves.push(createVector(skipX, skipY));
            }
          } else {
            possibleMoves.push(createVector(x + i, y + j));
          }
        }
      }
    }
  }
}

function yourMove(x, y, deselect) {
  if (yourAnimal != currentTurn) return;
  const i = Math.round((x - BOARD_MARGIN) / TILE_SIZE);
  const j = Math.round((y - BOARD_MARGIN) / TILE_SIZE);
  if (i > 4 || j > 4 || i < 0 || j < 0) return;
  const x1 = i * TILE_SIZE + BOARD_MARGIN;
  const y1 = j * TILE_SIZE + BOARD_MARGIN;
  const distanceFromPoint = dist(x, y, x1, y1);
  if (distanceFromPoint < TILE_SIZE / 3) {
    if (currentTurn === "tiger") {
      if (board[i][j] === "tiger") {
        if (
          deselect &&
          selectedAnimal &&
          selectedAnimal.x == i &&
          selectedAnimal.y == j
        ) {
          setAnimal(null);
        } else {
          setAnimal(createVector(i, j));
        }
      } else if (board[i][j] !== "goat" && selectedAnimal) {
        validMove(i, j);
        if (currentTurn === "tiger") {
          canKill(i, j);
        }
      }
    } else {
      if (board[i][j] === "tiger") return;
      if (goatsAvailable > 0) {
        if (board[i][j] != "goat") {
          board[i][j] = "goat";
          goatsAvailable--;
          currentTurn = "tiger";
          makeMove({ x1: null, y1: null, x2: i, y2: j });
        }
      } else if (board[i][j] === "goat") {
        if (
          deselect &&
          selectedAnimal &&
          selectedAnimal.x == i &&
          selectedAnimal.y == j
        ) {
          setAnimal(null);
        } else {
          setAnimal(createVector(i, j));
        }
      } else if (selectedAnimal) {
        validMove(i, j);
      }
    }
  }
}

function validMove(i, j) {
  const moveX = abs(selectedAnimal.x - i);
  const moveY = abs(selectedAnimal.y - j);
  const canCross =
    moveX === 1 &&
    moveY === 1 &&
    (selectedAnimal.x + selectedAnimal.y) % 2 === 0;
  if (canCross || moveX + moveY === 1) {
    board[i][j] = currentTurn;
    board[selectedAnimal.x][selectedAnimal.y] = null;
    currentTurn = currentTurn === "goat" ? "tiger" : "goat";
    moveAnimal(i, j);
    makeMove({ x1: selectedAnimal.x, y1: selectedAnimal.y, x2: i, y2: j });
    setAnimal(null);
  }
}

function canKill(i, j) {
  const moveX = abs(selectedAnimal.x - i);
  const moveY = abs(selectedAnimal.y - j);
  const canCross =
    moveX === 2 &&
    moveY === 2 &&
    (selectedAnimal.x + selectedAnimal.y) % 2 === 0;
  if (canCross || ((moveX === 2 || moveY === 2) && moveX + moveY === 2)) {
    const checkX = (selectedAnimal.x + i) / 2;
    const checkY = (selectedAnimal.y + j) / 2;
    if (board[checkX][checkY] === "goat") {
      board[checkX][checkY] = null;
      moveAnimal(i, j);
      makeMove({ x1: selectedAnimal.x, y1: selectedAnimal.y, x2: i, y2: j });
      board[i][j] = "tiger";
      board[selectedAnimal.x][selectedAnimal.y] = null;
      setAnimal(null);
      currentTurn = "goat";
    }
  }
}

function setAnimal(animal) {
  selectedAnimal = animal;
  if (animal) {
    getNearbyNodes(selectedAnimal.x, selectedAnimal.y);
  } else {
    possibleMoves = [];
    couldKill = [];
  }
}

function moveMade(roomBoard, move, turn, myTurn, goatsRemaining, win) {
  setAnimal(null);
  currentTurn = turn;
  board = roomBoard;
  goatsAvailable = goatsRemaining;
  winner = win;
  if (myTurn && move.x1 !== null && move.y1 !== null) {
    moveAnimal(move.x2, move.y2, move.x1, move.y1);
  }
}

function moveAnimal(i, j, currentX, currentY) {
  movingAnimal = createVector(i, j);
  currentPosition = createVector(
    (currentX ?? selectedAnimal.x) * TILE_SIZE + BOARD_MARGIN,
    (currentY ?? selectedAnimal.y) * TILE_SIZE + BOARD_MARGIN
  );
  destinationPosition = createVector(
    i * TILE_SIZE + BOARD_MARGIN,
    j * TILE_SIZE + BOARD_MARGIN
  );
  movingDirection = p5.Vector.sub(destinationPosition, currentPosition)
    .normalize()
    .mult(16);
}
