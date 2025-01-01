const CHOICES = ["🪨\nROCK", "📃\nPAPER", "✂️\nSCISSORS"];
const WINNING = { 0: 2, 1: 0, 2: 1 };

let OFFSET = 20;
let CARD_WIDTH = 160;
let CARD_HEIGHT = 240;
const colors = [];

let resetButton;

let selectedCard1 = null;
let selectedCard2 = null;

let computerChoice = [];

let currentPosition;
let destinationPosition;
let movingDirection;

let currentSecondPosition;
let destinationSecondPosition;
let movingSecondDirection;

let finalChoice = null;
let computerFinalChoice = null;

function setup() {
  const w = min(windowWidth, 560);
  OFFSET = w / 28;
  CARD_WIDTH = (w - OFFSET * 4) / 3;
  CARD_HEIGHT = CARD_WIDTH * 1.5;
  const h = CARD_HEIGHT * 2.5;

  createCanvas(w, h);

  colors.push(color(100, 150, 155));
  colors.push(color(100, 220, 150));
  colors.push(color(200, 25, 100));
  resetButton = document.getElementById("reset");
  resetButton.addEventListener("click", () => {
    selectedCard1 = null;
    selectedCard2 = null;
    computerChoice = [];
    finalChoice = null;
    computerFinalChoice = null;
  });
}

function mousePressed() {
  if (finalChoice || movingDirection || movingSecondDirection) return;
  //   final choice
  if (selectedCard1 != null && selectedCard2 != null) {
    const x = mouseX;
    const y = mouseY;
    let selected;
    if (
      x >= width / 2 - CARD_WIDTH - OFFSET &&
      x < width / 2 - OFFSET &&
      y >= height - CARD_HEIGHT - OFFSET &&
      y < height - OFFSET
    ) {
      // 1 selected
      finalChoice = selectedCard1;
      selected = 1;
    } else if (
      x >= width / 2 + OFFSET &&
      x < width / 2 + OFFSET + CARD_WIDTH &&
      y >= height - CARD_HEIGHT - OFFSET &&
      y < height - OFFSET
    ) {
      // 2 selected
      finalChoice = selectedCard2;
      selected = 2;
    }
    if (selected) {
      const computerSelectedIndex = getBestChoice();
      computerFinalChoice = computerChoice[computerSelectedIndex];
      //       moving user choice
      currentPosition = createVector(
        selected == 1 ? width / 2 - OFFSET - CARD_WIDTH : width / 2 + OFFSET,
        height - CARD_HEIGHT - OFFSET
      );
      destinationPosition = createVector(
        width / 2 - CARD_WIDTH - OFFSET * 2,
        height / 2 - CARD_HEIGHT / 2
      );
      movingDirection = p5.Vector.sub(destinationPosition, currentPosition)
        .normalize()
        .mult(currentPosition.dist(destinationPosition) / 15);
      //       moving computer's choice
      currentSecondPosition = createVector(
        computerSelectedIndex == 1
          ? width / 2 - OFFSET - CARD_WIDTH
          : width / 2 + OFFSET,
        OFFSET * 2
      );
      destinationSecondPosition = createVector(
        width / 2 + OFFSET * 2,
        height / 2 - CARD_HEIGHT / 2
      );
      movingSecondDirection = p5.Vector.sub(
        destinationSecondPosition,
        currentSecondPosition
      )
        .normalize()
        .mult(currentSecondPosition.dist(destinationSecondPosition) / 15);
    }
    return;
  }

  const x = mouseX - OFFSET;
  const y = mouseY;
  if (
    x > width - OFFSET ||
    x < 0 ||
    y < height / 3 ||
    y > height / 3 + CARD_HEIGHT
  ) {
    return;
  }

  const xPos = x / (CARD_WIDTH + OFFSET);
  const indexX = Math.floor(xPos);
  if (x > (indexX + 1) * CARD_WIDTH + indexX * OFFSET) {
    return;
  }
  if (selectedCard1 == null) {
    selectedCard1 = indexX;
    currentPosition = createVector(
      (indexX + 1) * OFFSET + indexX * CARD_WIDTH,
      height / 3
    );
    destinationPosition = createVector(width - OFFSET - CARD_WIDTH / 3, OFFSET);
    movingDirection = p5.Vector.sub(destinationPosition, currentPosition)
      .normalize()
      .mult(currentPosition.dist(destinationPosition) / 20);
  } else if (selectedCard2 == null) {
    computerChoice = [Math.floor(random(3)), Math.floor(random(3))];
    selectedCard2 = indexX;
    currentSecondPosition = createVector(
      (indexX + 1) * OFFSET + indexX * CARD_WIDTH,
      height / 3
    );
    destinationSecondPosition = createVector(
      width / 2 + OFFSET,
      height - CARD_HEIGHT - OFFSET
    );
    movingSecondDirection = p5.Vector.sub(
      destinationSecondPosition,
      currentSecondPosition
    )
      .normalize()
      .mult(currentSecondPosition.dist(destinationSecondPosition) / 20);

    currentPosition = createVector(width - OFFSET - CARD_WIDTH / 3, OFFSET);
    destinationPosition = createVector(
      width / 2 - CARD_WIDTH - OFFSET,
      height - CARD_HEIGHT - OFFSET
    );
    movingDirection = p5.Vector.sub(destinationPosition, currentPosition)
      .normalize()
      .mult(currentPosition.dist(destinationPosition) / 20);
  }
}

function draw() {
  background(0);
  cursor("default");
  textAlign(CENTER, CENTER);
  textSize((width / 560) * 32);
  strokeWeight(1);
  stroke(255);

  textStyle(NORMAL);
  fill(255, 100, 50);
  if (selectedCard1 == null) {
    text("Choose your first card:", width / 2, height / 5);
  } else if (selectedCard2 == null) {
    if (movingDirection) {
      drawMovingFirstCard();
    } else {
      drawFirstCardThumbnail();
    }
  }
  stroke(255);
  strokeWeight(2);
  if (finalChoice != null) {
    drawFinalCards();
  } else if (selectedCard1 !== null && selectedCard2 !== null) {
    drawSelectedCards();
  } else {
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    const hoverIndex = drawHoverCard();
    drawChoiceCards(hoverIndex);
  }
}

function drawChoiceCards(hoverIndex) {
  textSize((width / 560) * 24);
  for (let i = 0; i < 3; i++) {
    if (i === hoverIndex) continue;
    if (hoverIndex >= 0) colors[i].setAlpha(150);
    fill(colors[i]);
    colors[i].setAlpha(255);
    rect(
      (i + 1) * OFFSET + i * CARD_WIDTH,
      height / 3,
      CARD_WIDTH,
      CARD_HEIGHT,
      8
    );
    fill(0);
    text(
      CHOICES[i],
      i * (CARD_WIDTH + OFFSET) + OFFSET + CARD_WIDTH / 2,
      height / 3 + CARD_HEIGHT / 2
    );
  }
}

function drawFinalCards() {
  if (movingDirection) {
    drawMovingFinalCard();
    return;
  }
  textSize((width / 560) * 24);
  fill(colors[finalChoice]);
  rect(
    width / 2 - CARD_WIDTH - OFFSET * 2,
    height / 2 - CARD_HEIGHT / 2,
    CARD_WIDTH,
    CARD_HEIGHT,
    8
  );
  fill(colors[computerFinalChoice]);
  rect(
    width / 2 + OFFSET * 2,
    height / 2 - CARD_HEIGHT / 2,
    CARD_WIDTH,
    CARD_HEIGHT,
    8
  );
  fill(0);
  text(
    CHOICES[finalChoice],
    width / 2 - CARD_WIDTH / 2 - OFFSET * 2,
    height / 2
  );
  text(
    CHOICES[computerFinalChoice],
    width / 2 + CARD_WIDTH / 2 + OFFSET * 2,
    height / 2
  );
  fill(255);
  noStroke();
  text("vs", width / 2, height / 2);
  textAlign(CENTER, BASELINE);
  text(
    "YOU",
    width / 2 - CARD_WIDTH / 2 - OFFSET * 2,
    height / 2 - CARD_HEIGHT / 2 - OFFSET
  );
  text(
    "COMPUTER",
    width / 2 + CARD_WIDTH / 2 + OFFSET * 2,
    height / 2 - CARD_HEIGHT / 2 - OFFSET
  );

  textAlign(CENTER, TOP);
  fill(255);
  if (computerFinalChoice === finalChoice) {
    text("DRAW", width / 2, height / 2 + CARD_HEIGHT / 2 + OFFSET);
  } else if (WINNING[computerFinalChoice] === finalChoice) {
    text("COMPUTER WINS", width / 2, height / 2 + CARD_HEIGHT / 2 + OFFSET);
  } else {
    text("YOU WIN!", width / 2, height / 2 + CARD_HEIGHT / 2 + OFFSET);
  }
}

function drawMovingFinalCard() {
  fill(colors[finalChoice]);
  rect(currentPosition.x, currentPosition.y, CARD_WIDTH, CARD_HEIGHT, 8);
  if (currentPosition.dist(destinationPosition) > 2) {
    currentPosition.add(movingDirection);
  } else {
    movingDirection = null;
  }
  fill(colors[computerFinalChoice]);
  rect(
    currentSecondPosition.x,
    currentSecondPosition.y,
    CARD_WIDTH,
    CARD_HEIGHT,
    8
  );
  if (currentSecondPosition.dist(destinationSecondPosition) > 2) {
    currentSecondPosition.add(movingSecondDirection);
  } else {
    movingSecondDirection = null;
  }
}

function drawSelectedCards() {
  if (movingSecondDirection || movingDirection) {
    drawMovingSelectedCard();
    return;
  }

  textSize((width / 560) * 24);
  textAlign(CENTER, BASELINE);
  text(
    "Choose one to remove ❌ (Minus One)",
    width / 2,
    height - CARD_HEIGHT - OFFSET * 2
  );
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  const hoverCard = drawMinusHoverCard();

  if (hoverCard === 1) {
    colors[selectedCard1].setAlpha(100);
    fill(colors[selectedCard1]);
    colors[selectedCard1].setAlpha(255);
  } else {
    fill(colors[selectedCard1]);
  }
  rect(
    width / 2 - CARD_WIDTH - OFFSET,
    height - CARD_HEIGHT - OFFSET,
    CARD_WIDTH,
    CARD_HEIGHT,
    8
  );
  fill(0);
  text(
    CHOICES[selectedCard1],
    width / 2 - CARD_WIDTH / 2 - OFFSET,
    height - CARD_HEIGHT / 2 - OFFSET
  );
  if (hoverCard === 2) {
    colors[selectedCard2].setAlpha(100);
    fill(colors[selectedCard2]);
    colors[selectedCard2].setAlpha(255);
  } else {
    fill(colors[selectedCard2]);
  }
  rect(
    width / 2 + OFFSET,
    height - CARD_HEIGHT - OFFSET,
    CARD_WIDTH,
    CARD_HEIGHT,
    8
  );
  fill(0);
  text(
    CHOICES[selectedCard2],
    width / 2 + CARD_WIDTH / 2 + OFFSET,
    height - CARD_HEIGHT / 2 - OFFSET
  );
  if (hoverCard) {
    fill(255, 0, 0);
    text(
      "REMOVE",
      hoverCard === 1
        ? width / 2 - CARD_WIDTH / 2 - OFFSET
        : width / 2 + CARD_WIDTH / 2 + OFFSET,
      height - CARD_HEIGHT / 4 - OFFSET
    );
  }
  fill(255, 0, 255);
  //   Computers choices
  text("Computer's Choices", width / 2, OFFSET);
  fill(colors[computerChoice[0]]);
  rect(width / 2 - CARD_WIDTH - OFFSET, OFFSET * 2, CARD_WIDTH, CARD_HEIGHT, 8);
  fill(0);
  text(
    CHOICES[computerChoice[0]],
    width / 2 - CARD_WIDTH / 2 - OFFSET,
    CARD_HEIGHT / 2 + OFFSET * 2
  );
  fill(colors[computerChoice[1]]);
  rect(width / 2 + OFFSET, OFFSET * 2, CARD_WIDTH, CARD_HEIGHT, 8);
  fill(0);
  text(
    CHOICES[computerChoice[1]],
    width / 2 + CARD_WIDTH / 2 + OFFSET,
    CARD_HEIGHT / 2 + OFFSET * 2
  );
}

function drawMovingSelectedCard() {
  fill(colors[selectedCard1]);
  rect(
    currentPosition.x,
    currentPosition.y,
    map(
      currentPosition.y,
      OFFSET,
      height - CARD_HEIGHT - OFFSET,
      CARD_WIDTH / 3,
      CARD_WIDTH
    ),
    map(
      currentPosition.y,
      OFFSET,
      height - CARD_HEIGHT - OFFSET,
      CARD_HEIGHT / 3,
      CARD_HEIGHT
    ),
    8
  );
  if (currentPosition.dist(destinationPosition) > 2) {
    currentPosition.add(movingDirection);
  } else {
    movingDirection = null;
  }
  fill(colors[selectedCard2]);
  rect(
    currentSecondPosition.x,
    currentSecondPosition.y,
    CARD_WIDTH,
    CARD_HEIGHT,
    8
  );
  if (currentSecondPosition.dist(destinationSecondPosition) > 2) {
    currentSecondPosition.add(movingSecondDirection);
  } else {
    movingSecondDirection = null;
  }
}

function drawHoverCard() {
  if (movingDirection) return;
  const x = mouseX - OFFSET;
  const y = mouseY;
  if (
    x > width - OFFSET ||
    x < 0 ||
    y < height / 3 ||
    y > height / 3 + CARD_HEIGHT
  ) {
    return;
  }

  const xPos = x / (CARD_WIDTH + OFFSET);
  const index = Math.floor(xPos);
  if (x > (index + 1) * CARD_WIDTH + index * OFFSET) {
    return;
  }
  cursor("pointer");
  stroke(255);
  strokeWeight(2);
  fill(colors[index]);
  rect(
    (index + 1) * OFFSET + index * CARD_WIDTH - OFFSET / 2,
    height / 3 - OFFSET / 2,
    CARD_WIDTH + OFFSET,
    CARD_HEIGHT + OFFSET,
    8
  );
  fill(0);
  textSize((width / 560) * 32);

  text(
    CHOICES[index],
    index * (CARD_WIDTH + OFFSET) + OFFSET + CARD_WIDTH / 2,
    height / 3 + CARD_HEIGHT / 2
  );
  return index;
}

function drawMinusHoverCard() {
  if (selectedCard1 == null || selectedCard2 == null) return;
  if (movingSecondDirection || movingDirection) return;
  const x = mouseX;
  const y = mouseY;
  if (
    x >= width / 2 - CARD_WIDTH - OFFSET &&
    x < width / 2 - OFFSET &&
    y >= height - CARD_HEIGHT - OFFSET &&
    y < height - OFFSET
  ) {
    cursor("pointer");
    return 1;
  }
  if (
    x >= width / 2 + OFFSET &&
    x < width / 2 + OFFSET + CARD_WIDTH &&
    y >= height - CARD_HEIGHT - OFFSET &&
    y < height - OFFSET
  ) {
    cursor("pointer");
    return 2;
  }
}

function drawFirstCardThumbnail() {
  text("Choose your second card:", width / 2, height / 5);
  fill(colors[selectedCard1]);
  rect(
    width - OFFSET - CARD_WIDTH / 3,
    OFFSET,
    CARD_WIDTH / 3,
    CARD_HEIGHT / 3,
    8
  );
  fill(0);

  textSize((width / 560) * 10);
  text(
    CHOICES[selectedCard1],
    width - OFFSET - CARD_WIDTH / 6,
    OFFSET + CARD_HEIGHT / 6
  );
  textAlign(RIGHT, CENTER);
  noStroke();
  fill(255);
  textSize((width / 560) * 16);
  text(
    "First Choice:",
    width - OFFSET - CARD_WIDTH / 3 - OFFSET / 2,
    OFFSET + CARD_HEIGHT / 6
  );
}

function drawMovingFirstCard() {
  fill(colors[selectedCard1]);
  rect(
    currentPosition.x,
    currentPosition.y,
    map(currentPosition.y, height / 3, OFFSET, CARD_WIDTH, CARD_WIDTH / 3),
    map(currentPosition.y, height / 3, OFFSET, CARD_HEIGHT, CARD_HEIGHT / 3),
    8
  );
  if (currentPosition.dist(destinationPosition) > 2) {
    currentPosition.add(movingDirection);
  } else {
    movingDirection = null;
  }
}
