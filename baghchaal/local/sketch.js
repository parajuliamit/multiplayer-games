let TILE_SIZE;
let BOARD_MARGIN;
const MAX_GOAT = 20;
let tigerImage;
let goatImage;

let goatsAvailable;
let goatsKilled;
let goatsAlive;

let goats = [];
let tigers = [];
let goatTurn;
let selectedAnimal;
let possibleMoves = [];
let couldKill = [];
let movingAnimal;
let currentPosition;
let destinationPosition;
let movingDirection;

let winner;
let restartButton;

const goatImageSrc = "../../images/goat.png";
const tigerImageSrc = "../../images/tiger.png";

const goatsAvailableDiv = document.getElementById("available");
const goatsAliveDiv = document.getElementById("alive");
const goatsKilledDiv = document.getElementById("killed");
const trappedDiv = document.getElementById("trapped");
const turnImage = document.getElementById("turn");

function preload() {
  tigerImage = loadImage(tigerImageSrc);
  goatImage = loadImage(goatImageSrc);
}

function setup() {
  const calculatedWidth = min(windowWidth - 60, windowHeight - 100, 600);
  createCanvas(calculatedWidth, calculatedWidth);
  BOARD_MARGIN = calculatedWidth / 12;
  TILE_SIZE = calculatedWidth / 4 - BOARD_MARGIN / 2;
  resetGame();
}

function resetGame() {
  goatsAvailable = MAX_GOAT;
  goatsKilled = 0;
  goatsAlive = 0;
  goatTurn = true;
  for (let i = 0; i <= 4; i++) {
    tigers[i] = [];
    goats[i] = [];
    for (let j = 0; j <= 4; j++) {
      if (i % 4 === 0 && j % 4 === 0) {
        tigers[i][j] = true;
      } else {
        tigers[i][j] = false;
      }
      goats[i][j] = false;
    }
  }
  setGoatCount();
  trappedDiv.innerText = 0;
  setAnimal(null);
  turnImage.src = goatImageSrc;
  turnImage.style.display = "block";
  setTimeout(() => {
    winner = null;
    loop();
  }, 500);
  restartButton?.hide();
}

let currentDrag;

function mouseDragged() {
  dragAnimal(mouseX, mouseY);
}

function touchMoved() {
  dragAnimal(mouseX, mouseY);
}

function dragAnimal(x, y) {
  if (winner) return;
  if (!currentDrag) {
    const i = Math.round((x - BOARD_MARGIN) / TILE_SIZE);
    const j = Math.round((y - BOARD_MARGIN) / TILE_SIZE);
    if (i > 4 || j > 4 || i < 0 || j < 0) return;
    const x1 = i * TILE_SIZE + BOARD_MARGIN;
    const y1 = j * TILE_SIZE + BOARD_MARGIN;
    const distanceFromPoint = dist(x, y, x1, y1);
    if (distanceFromPoint < TILE_SIZE / 3) {
      if (!goatTurn && tigers[i][j]) {
        setAnimal(createVector(i, j));
        currentDrag = tigerImage;
      } else if (goatTurn && goatsAvailable == 0 && goats[i][j]) {
        currentDrag = goatImage;
        setAnimal(createVector(i, j));
      }
    }
  }
}

function touchEnded() {
  if (winner) return;
  if (currentDrag) {
    currentDrag = null;
    makeMove(mouseX, mouseY, false);
  } else {
    makeMove(mouseX, mouseY, true);
  }
}

function draw() {
  cursor("default");
  background(0);
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = "rgba(255, 255, 255, 0.7)";
  drawGrid();
  drawAnimalAndNodes();

  if (movingAnimal) {
    image(
      tigers[movingAnimal.x][movingAnimal.y] ? tigerImage : goatImage,
      currentPosition.x - TILE_SIZE / 4,
      currentPosition.y - TILE_SIZE / 4,
      TILE_SIZE / 2,
      TILE_SIZE / 2
    );
    if (currentPosition.dist(destinationPosition) < TILE_SIZE * 0.1) {
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
        restartButton = createButton("Play Again");
        restartButton.parent("game");
        restartButton.position(
          "auto",
          height / 2 + restartButton.height / 2,
          "absolute"
        );
        restartButton.mousePressed(resetGame);
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
  if (goatTurn && goatsAvailable > 0) {
    tint(255, 100);
    image(
      goatImage,
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
  drawingContext.shadowColor = goatTurn
    ? "rgba(255, 0, 255, 1)"
    : "rgba(255, 127, 80, 1)";
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

      if (tigers[i][j]) {
        if (selectedAnimal && selectedAnimal.x == i && selectedAnimal.y == j) {
          drawingContext.shadowBlur = 50;
          drawingContext.shadowColor = "rgba(255, 127, 80, 1)";
        }
        image(
          tigerImage,
          x - TILE_SIZE / 4,
          y - TILE_SIZE / 4,
          TILE_SIZE / 2,
          TILE_SIZE / 2
        );
      } else if (goats[i][j]) {
        if (selectedAnimal && selectedAnimal.x == i && selectedAnimal.y == j) {
          drawingContext.shadowBlur = 50;
          drawingContext.shadowColor = "rgba(255, 0, 255, 1)";
        }
        image(
          goatImage,
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
    drawingContext.shadowColor = goatTurn
      ? "rgba(255, 0, 255, 1)"
      : "rgba(255, 127, 80, 1)";
    fill(50);
    if (goatTurn) stroke(255, 0, 255, 100);
    else stroke(255, 127, 80, 100);
    strokeWeight(1);
    for (let move of possibleMoves) {
      const x = move.x * TILE_SIZE + BOARD_MARGIN;
      const y = move.y * TILE_SIZE + BOARD_MARGIN;
      const distance = dist(mouseX, mouseY, x, y);
      circle(x, y, TILE_SIZE * 0.25);
      if (distance <= TILE_SIZE * 0.3) {
        if (goatTurn) fill(255, 0, 255, 50);
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
        goatImage,
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
  if (!winner && withinNode && goatTurn && goatsAvailable > 0) {
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
        if (tigers[x + i][y + j]) continue;
        if (goatTurn && goats[x + i][y + j]) continue;
        const moveX = abs(x);
        const moveY = abs(y);
        const canCross = moveX === 1 && moveY === 1 && (i + j) % 2 === 0;
        if (canCross || moveX + moveY === 1) {
          if (goats[x + i][y + j]) {
            const skipX = i + x * 2;
            const skipY = j + y * 2;
            if (skipX >= 0 && skipX <= 4 && skipY >= 0 && skipY <= 4) {
              if (goats[skipX][skipY] || tigers[skipX][skipY]) continue;
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

function setGoatCount() {
  goatsAvailableDiv.innerText = goatsAvailable;
  goatsAliveDiv.innerText = goatsAlive;
  goatsKilledDiv.innerText = goatsKilled;
}

function makeMove(x, y, deselect) {
  const i = Math.round((x - BOARD_MARGIN) / TILE_SIZE);
  const j = Math.round((y - BOARD_MARGIN) / TILE_SIZE);
  if (i > 4 || j > 4 || i < 0 || j < 0) return;
  const x1 = i * TILE_SIZE + BOARD_MARGIN;
  const y1 = j * TILE_SIZE + BOARD_MARGIN;
  const distanceFromPoint = dist(x, y, x1, y1);
  if (distanceFromPoint < TILE_SIZE / 3) {
    if (!goatTurn) {
      if (tigers[i][j]) {
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
      } else if (!goats[i][j] && selectedAnimal) {
        validMove(i, j);
        if (!goatTurn) {
          canKill(i, j);
        }
      }
    } else {
      if (tigers[i][j]) return;
      if (goatsAvailable > 0) {
        if (!goats[i][j]) {
          goats[i][j] = true;
          goatsAvailable--;
          goatsAlive++;
          setGoatCount();
          turnImage.src = tigerImageSrc;
          goatTurn = false;
          const trappedTiger = getTigerTrapCount();
          trappedDiv.innerText = trappedTiger;
          if (trappedTiger >= 4) {
            winner = "goat";
          }
        }
      } else if (goats[i][j]) {
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
    if (goatTurn) {
      moveAnimal(i, j);
      goats[i][j] = true;
      goats[selectedAnimal.x][selectedAnimal.y] = false;
      turnImage.src = tigerImageSrc;
      goatTurn = false;
    } else {
      moveAnimal(i, j);
      tigers[i][j] = true;
      tigers[selectedAnimal.x][selectedAnimal.y] = false;
      turnImage.src = goatImageSrc;
      goatTurn = true;
    }
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
    if (goats[checkX][checkY]) {
      goats[checkX][checkY] = false;
      goatsKilled++;
      goatsAlive--;
      setGoatCount();
      moveAnimal(i, j);
      tigers[i][j] = true;
      tigers[selectedAnimal.x][selectedAnimal.y] = false;
      setAnimal(null);
      if (goatsKilled >= 5) {
        winner = "tiger";
        return;
      }
      turnImage.src = goatImageSrc;
      goatTurn = true;
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

function moveAnimal(i, j) {
  movingAnimal = createVector(i, j);
  currentPosition = createVector(
    selectedAnimal.x * TILE_SIZE + BOARD_MARGIN,
    selectedAnimal.y * TILE_SIZE + BOARD_MARGIN
  );
  destinationPosition = createVector(
    i * TILE_SIZE + BOARD_MARGIN,
    j * TILE_SIZE + BOARD_MARGIN
  );
  movingDirection = p5.Vector.sub(destinationPosition, currentPosition)
    .normalize()
    .mult(16);
  const trappedTiger = getTigerTrapCount();
  trappedDiv.innerText = trappedTiger;
  if (trappedTiger >= 4) {
    winner = "goat";
  }
}

function getTigerTrapCount() {
  let movableTigers = 0;
  for (let i = 0; i <= 4; i++) {
    for (let j = 0; j <= 4; j++) {
      if (tigers[i][j]) {
        if (canTigerMove(i, j)) {
          movableTigers++;
        }
      }
    }
  }
  return 4 - movableTigers;
}

function canTigerMove(i, j) {
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      if (x === 0 && y === 0) continue;
      if (x + i >= 0 && x + i <= 4 && y + j >= 0 && y + j <= 4) {
        if (tigers[x + i][y + j]) continue;
        if (goatTurn && goats[x + i][y + j]) continue;
        const moveX = abs(x);
        const moveY = abs(y);
        const canCross = moveX === 1 && moveY === 1 && (i + j) % 2 === 0;
        if (canCross || moveX + moveY === 1) {
          if (goats[x + i][y + j]) {
            const skipX = i + x * 2;
            const skipY = j + y * 2;
            if (skipX >= 0 && skipX <= 4 && skipY >= 0 && skipY <= 4) {
              if (goats[skipX][skipY] || tigers[skipX][skipY]) continue;
              return true;
            }
          } else {
            return true;
          }
        }
      }
    }
  }
  return false;
}
