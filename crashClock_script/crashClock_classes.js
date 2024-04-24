class DropLetter {
  constructor(t, s, i, e) {
    (this.nowSize = s),
      (this.thisLetter = t),
      (this.orgX = i),
      (this.orgY = e),
      this.coreOrg,
      this.minPoint,
      this.maxPoint,
      this.diff,
      this.points,
      this.bodyLetter,
      ' ' != this.thisLetter && (this.textPointMaker(), this.physicsPointMaker());
  }
  textPointMaker() {
    this.points = tFont[fontSelect].textToPoints(
      this.thisLetter,
      this.orgX,
      this.orgY,
      this.nowSize,
      { sampleFactor: 0.1, simplifyThreshold: 0 }
    );
    if (!this.points || this.points.length === 0) {
      console.error('Failed to generate points for letter:', this.thisLetter);
    }
  }
  physicsPointMaker() {
    var t = this.orgX + textWidth(this.thisLetter) / 2,
      s = this.orgY - (this.nowSize * pgTextFactor[fontSelect]) / 2;
    (this.bodyLetter = Bodies.fromVertices(t, s, this.points, { friction: 0, restitution: 0 })),
      Composite.add(world, this.bodyLetter),
      (this.minPoint = createVector(this.bodyLetter.bounds.min.x, this.bodyLetter.bounds.min.y)),
      (this.maxPoint = createVector(this.bodyLetter.bounds.max.x, this.bodyLetter.bounds.max.y));
    var i = this.bodyLetter.position;
    (this.diff = createVector(-(i.x - this.minPoint.x), -(i.y - this.maxPoint.y))),
      Matter.Body.setPosition(this.bodyLetter, { x: i.x, y: this.orgY - this.diff.y }),
      (this.coreOrg = createVector(i.x, this.orgY - this.diff.y));
  }
  run() {
    ' ' != this.thisLetter && (this.update(), this.display());
  }
  update() {}
  display() {
    var t = this.bodyLetter.position,
      s = this.bodyLetter.angle;
    noStroke(),
      this.bodyLetter.vertices,
      push(),
      translate(t.x, t.y),
      rotate(s),
      translate(0, this.diff.y),
      fill(fillColor),
      textAlign(CENTER),
      textSize(this.nowSize),
      text(this.thisLetter, 0, 0),
      pop();
  }
  resetPos() {
    ' ' != this.thisLetter &&
      (Matter.Body.setPosition(this.bodyLetter, { x: this.coreOrg.x, y: this.coreOrg.y }),
      Matter.Body.setAngle(this.bodyLetter, 0),
      Matter.Body.setAngularSpeed(this.bodyLetter, 0),
      Matter.Body.setAngularVelocity(this.bodyLetter, 0),
      Matter.Body.setSpeed(this.bodyLetter, 0));
  }
  removeIt() {
    ' ' != this.thisLetter && Composite.remove(world, this.bodyLetter);
  }
}
class DropLine {
  constructor(t, s, i) {
    (this.mode = t),
      (this.lineIndex = s),
      (this.topBot = i),
      this.lineLength,
      this.input,
      this.nowSize,
      this.rad,
      0 == this.mode
        ? ((this.input = inputTextHour),
          (this.nowSize = pgTextSizeHour),
          (this.rad = borderRadius / 2 - (3 * this.nowSize) / 4))
        : 1 == this.mode
        ? ((this.input = inputTextMin),
          (this.nowSize = pgTextSizeMin),
          (this.rad = borderRadius / 2 - pgTextSizeHour - 2 * pgTextSizeMin))
        : (0 == this.topBot ? (this.input = inputTextTop) : (this.input = inputTextBottom),
          (this.nowSize = pgTextSizeHead),
          (this.rad = borderRadius / 2 - (3 * this.nowSize) / 4)),
      (this.lineLength = this.input.length),
      this.ang,
      2 == this.mode
        ? (this.ang = PI / (this.input.length + 1))
        : (this.ang = TWO_PI / this.input.length),
      (this.letterCounter = 0),
      (this.dropLetters = []),
      (this.dropConstraints = []),
      (this.dropDebris = []),
      (this.debugX = 0),
      (this.debugY = 0),
      this.setUnits();
  }
  run() {
    for (var t = 0; t < this.dropLetters.length; t++) this.dropLetters[t].run();
  }
  setUnits() {
    textFont(tFont[fontSelect]), textSize(this.nowSize);
    for (var t = this.input[this.lineIndex], s = 0; s < t.length; s++) {
      var i,
        e,
        h = t.charAt(s),
        r = 0,
        o = (this.nowSize * pgTextFactor[fontSelect]) / 2;
      s > 0 && (r = textWidth(t.substring(0, s + 1)) - textWidth(t.charAt(s))),
        0 == this.mode
          ? ((i = width / 2 + cos(-PI / 2 + (this.lineIndex + 1) * this.ang) * this.rad),
            (e = height / 2 + sin(-PI / 2 + (this.lineIndex + 1) * this.ang) * this.rad))
          : 1 == this.mode
          ? ((i = width / 2 + cos(-PI / 2 + (this.lineIndex + 0.5) * this.ang) * this.rad),
            (e = height / 2 + sin(-PI / 2 + (this.lineIndex + 0.5) * this.ang) * this.rad))
          : 2 == this.mode &&
            (0 == this.topBot
              ? ((i =
                  width / 2 +
                  cos(-PI / 2 + (this.lineIndex - this.lineLength / 2 + 0.5) * this.ang) *
                    this.rad),
                (e =
                  height / 2 +
                  sin(-PI / 2 + (this.lineIndex - this.lineLength / 2 + 0.5) * this.ang) *
                    this.rad))
              : ((i =
                  width / 2 +
                  cos(PI / 2 + (-this.lineIndex + this.lineLength / 2 - 0.5) * this.ang) *
                    this.rad),
                (e =
                  height / 2 +
                  sin(PI / 2 + (-this.lineIndex + this.lineLength / 2 - 0.5) * this.ang) *
                    this.rad))),
        (this.debugX = i),
        (this.debugY = e),
        (r += i),
        (r -= textWidth(t) / 2),
        (o += e);
      var n = this.dropLetters.length;
      (this.dropLetters[n] = new DropLetter(h, this.nowSize, r, o)),
        s > 0 && this.configureConstraint(this.letterCounter),
        this.letterCounter++;
    }
  }
  debug() {
    noStroke(), fill(0, 0, 255), ellipse(this.debugX, this.debugY, 10, 10);
  }
  configureConstraint(t) {
    if (1 == constrainMode) {
      if (' ' != this.dropLetters[t].thisLetter && ' ' != this.dropLetters[t - 1].thisLetter) {
        let s = {
          bodyA: this.dropLetters[t].bodyLetter,
          bodyB: this.dropLetters[t - 1].bodyLetter,
          stiffness: 0.05,
          damping: 0.1,
        };
        this.dropConstraints[this.dropConstraints.length] = Constraint.create(s);
        var i = this.dropConstraints[this.dropConstraints.length - 1];
        World.add(world, i);
      }
    } else if (
      2 == constrainMode &&
      ' ' != this.dropLetters[t].thisLetter &&
      ' ' != this.dropLetters[t - 1].thisLetter
    ) {
      let e = {
        bodyA: this.dropLetters[t].bodyLetter,
        bodyB: this.dropLetters[t - 1].bodyLetter,
        pointA: { x: 0, y: -(this.nowSize * pgTextFactor[fontSelect]) / 2 },
        pointB: { x: 0, y: -(this.nowSize * pgTextFactor[fontSelect]) / 2 },
        stiffness: 0.1,
        damping: 0.05,
      };
      this.dropConstraints[this.dropConstraints.length] = Constraint.create(e);
      var i = this.dropConstraints[this.dropConstraints.length - 1];
      World.add(world, i);
      let h = {
        bodyA: this.dropLetters[t].bodyLetter,
        bodyB: this.dropLetters[t - 1].bodyLetter,
        stiffness: 0.1,
        damping: 0.05,
      };
      this.dropConstraints[this.dropConstraints.length] = Constraint.create(h);
      var r = this.dropConstraints[this.dropConstraints.length - 1];
      World.add(world, r);
      let o = {
        bodyA: this.dropLetters[t].bodyLetter,
        bodyB: this.dropLetters[t - 1].bodyLetter,
        pointA: { x: 0, y: (this.nowSize * pgTextFactor[fontSelect]) / 2 },
        pointB: { x: 0, y: (this.nowSize * pgTextFactor[fontSelect]) / 2 },
        stiffness: 0.1,
        damping: 0.05,
      };
      this.dropConstraints[this.dropConstraints.length] = Constraint.create(o);
      var n = this.dropConstraints[this.dropConstraints.length - 1];
      World.add(world, n);
    }
  }
  refresh() {
    for (var t = 0; t < this.dropLetters.length; t++) this.dropLetters[t].refresh();
    this.setOriginalOrder();
  }
  resetPos() {
    for (var t = 0; t < this.dropLetters.length; t++) this.dropLetters[t].resetPos();
  }
  removeIt() {
    for (var t = this.dropLetters.length - 1; t >= 0; t--) this.dropLetters[t].removeIt();
  }
  removeConstraint() {
    for (var t = this.dropConstraints.length - 1; t >= 0; t--) {
      var s = this.dropConstraints[t];
      Composite.remove(world, s);
    }
  }
}
class DropAll {
  constructor(t) {
    if (((this.dropLines = []), this.count, 0 == t)) {
      this.count = inputTextHour.length;
      for (var s = 0; s < this.count; s++) this.dropLines[s] = new DropLine(t, s, 0);
    } else if (1 == t) {
      this.count = inputTextMin.length;
      for (var s = 0; s < this.count; s++) this.dropLines[s] = new DropLine(t, s, 0);
    } else {
      this.count = inputTextTop.length + inputTextBottom.length;
      for (var s = 0; s < inputTextTop.length; s++) this.dropLines[s] = new DropLine(t, s, 0);
      for (var s = inputTextTop.length; s < this.count; s++)
        this.dropLines[s] = new DropLine(t, s - inputTextTop.length, 1);
    }
  }
  run() {
    for (var t = 0; t < this.count; t++) this.dropLines[t].run();
  }
  refresh() {
    for (var t = 0; t < this.count; t++) this.dropLines[t].refresh();
  }
  resetPos() {
    for (var t = 0; t < this.count; t++) this.dropLines[t].resetPos();
  }
  removeIt() {
    for (var t = this.count - 1; t >= 0; t--) this.dropLines[t].removeIt();
  }
  removeConstraint() {
    for (var t = this.count - 1; t >= 0; t--) this.dropLines[t].removeConstraint();
  }
}
class PartPac {
  constructor() {
    print(clockBorder),
      (this.min = 0.015 * clockBorder),
      (this.max = 0.06 * clockBorder),
      (this.parts = []),
      (this.partsPhysics = []),
      (this.buffer = 500),
      this.packer();
  }
  packer() {
    for (var t = 0; t < this.buffer; ) {
      for (
        var s,
          i = random(this.min, this.max),
          e = random(clockBorder / 2),
          h = random(TWO_PI),
          r = width / 2 + cos(h) * e,
          o = height / 2 + sin(h) * e,
          n = !0,
          d = 0;
        d < this.parts.length;
        d++
      ) {
        dist(r, o, this.parts[d].x, this.parts[d].y) < i / 2 + this.parts[d].dia / 2 && (n = !1);
      }
      if (n) {
        var a = { x: r, y: o, dia: i };
        this.parts.push(a), (t = 0);
      } else t++;
    }
    for (var d = 0; d < this.parts.length; d++) {
      let p = { friction: 0.1, restitution: 0.95 };
      (this.partsPhysics[d] = Bodies.circle(
        this.parts[d].x,
        this.parts[d].y,
        this.parts[d].dia / 2,
        p
      )),
        Composite.add(world, this.partsPhysics[d]);
    }
    print(this.partsPhysics.length);
  }
  run() {
    this.display();
  }
  display() {
    for (var t = 0; t < this.partsPhysics.length; t++) {
      let s = this.partsPhysics[t].position;
      push(),
        translate(s.x, s.y),
        noStroke(),
        fill(fillColor),
        ellipse(0, 0, this.parts[t].dia),
        pop();
    }
  }
  resetIt() {
    print('PARTICLE RESET!');
    for (var t = this.partsPhysics.length - 1; t >= 0; t--)
      Matter.Body.setPosition(this.partsPhysics[t], {
        x: this.parts[t].x + random(-5, 5),
        y: this.parts[t].y + random(-5, 5),
      });
  }
  removeIt() {
    for (var t = this.partsPhysics.length - 1; t >= 0; t--)
      Composite.remove(world, this.partsPhysics[t]);
  }
}
class Particle {
  constructor(t, s, i, e) {
    (this.x = t), (this.y = s), (this.r = i);
    let h = { friction: 0.1, restitution: 0.95, isStatic: e };
    (this.body = Bodies.circle(this.x, this.y, this.r, h)), Composite.add(world, this.body);
  }
  show() {
    let t = this.body.position,
      s = this.body.angle;
    push(),
      translate(t.x, t.y),
      rotate(s),
      rectMode(CENTER),
      strokeWeight(1),
      stroke(255),
      fill(127),
      ellipse(0, 0, 2 * this.r),
      line(0, 0, this.r, 0),
      pop();
  }
}
class Hand {
  constructor(t, s, i, e, h) {
    (this.x = t), (this.y = s), (this.w = i), (this.h = e), (this.type = h);
    let r = { friction: 0, restitution: 0.6, isStatic: !0 };
    (this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, r)),
      Composite.add(world, this.body);
  }
  show() {
    let t = this.body.position,
      s = this.body.angle;
    push(),
      translate(t.x, t.y),
      rotate(s),
      rectMode(CENTER),
      1 == this.type || 2 == this.type ? fill(handColor) : fill(accentColor),
      noStroke(),
      rect(0, 0, this.w, this.h),
      pop();
  }
}
class Boundary {
  constructor(t, s, i, e, h) {
    this.x = t;
    this.y = s;
    this.w = i;
    this.h = e;
    this.a = h;
    let options = {
      friction: 0,
      restitution: 0.6,
      angle: this.a,
      isStatic: true,
    };

    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, options);
    if (!this.body) {
      console.error('Failed to create body:', this);
      return;
    }

    Composite.add(world, this.body);
  }

  show() {
    let pos = this.body.position,
      angle = this.body.angle;
    strokeWeight(1);
    stroke(0, 0, 255);
    noFill();
    ellipse(pos.x, pos.y, 20, 20);
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h);
    pop();
  }
}
