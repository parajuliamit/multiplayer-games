function getBestChoice() {
  let possibleResult1;
  let possibleResult2;

  //   for first choice
  if (computerChoice[0] === selectedCard1) {
    possibleResult1 = 0;
  } else if (WINNING[computerChoice[0]] === selectedCard1) {
    possibleResult1 = 1;
  } else {
    possibleResult1 = -1;
  }
  if (computerChoice[0] === selectedCard2) {
    possibleResult1 += 0;
  } else if (WINNING[computerChoice[0]] === selectedCard2) {
    possibleResult1 += 1;
  } else {
    possibleResult1 -= 1;
  }

  if (computerChoice[1] === selectedCard1) {
    possibleResult2 = 0;
  } else if (WINNING[computerChoice[1]] === selectedCard1) {
    possibleResult2 = 1;
  } else {
    possibleResult2 = -1;
  }
  if (computerChoice[1] === selectedCard2) {
    possibleResult2 += 0;
  } else if (WINNING[computerChoice[1]] === selectedCard2) {
    possibleResult2 += 1;
  } else {
    possibleResult2 -= 1;
  }
  if (possibleResult1 === possibleResult2) {
    return random([0, 1]);
  } else if (possibleResult1 > possibleResult2) {
    return 0;
  } else {
    return 1;
  }
}
