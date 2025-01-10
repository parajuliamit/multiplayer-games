class Spot {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.coin = null;
    this.winning = false;
  }

  show() {
    fill(0, 0, 255);
    noStroke();
    square(this.i * w, this.j * w, w);

    //circle
    if (this.coin === "red") {
      fill(255, 0, 0);
    } else if (this.coin === "yellow") {
      fill(255, 255, 0);
    } else {
      fill(0);
    }
    stroke(100, 100, 255);
    strokeWeight(4);
    circle(this.i * w + w / 2, this.j * w + w / 2, w * 0.8);
    if (this.winning) {
      fill(0, 180, 50);
      noStroke();
      circle(this.i * w + w / 2, this.j * w + w / 2, w * 0.3);
    }
    // fill(0, 255, 0);
    // textAlign(CENTER, CENTER);
    // text(this.i + "," + this.j, this.i * w + w / 2, this.j * w + w / 2);
  }
}
