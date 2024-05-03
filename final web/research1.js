const nodeArray = [];
let linkArray = [];
const cutHistory = [];
const xGridCount = 48;
const friction = 0.99;
const forceMultiplier = 0.3;
const knifeRange = 12;
const speedLimit = 8;
const gravity = 0.5;

function setup() {
  const scaleFactor = 0.9;
  const m = min(windowWidth, windowHeight)* scaleFactor;
  const canvas= createCanvas(m, m);
  canvas.style('margin-top','30vh');
  


  // Create nodes
  const yGridCount = ceil(xGridCount / 2);
  for (let j = 0; j <= yGridCount; j++) {
    for (let i = 0; i <= xGridCount; i++) {
      const x = map(i, 0, xGridCount, 0, width);
      const y = map(j, 0, yGridCount, 0, height * (yGridCount / xGridCount));
      const pinned = j == 0 ? true : false;
      nodeArray.push(new node(x, y, pinned));
    }
  }

  // Create links
  for (let i = 0; i < nodeArray.length; i++) {
    const current = nodeArray[i];
    const rest = nodeArray.slice(i + 1);
    const neighbors = rest.filter(
      (target) => target.pos.dist(current.pos) <= (width / xGridCount) * 1.5
    );
    neighbors.forEach(
      (target) =>
        (current.pinned && target.pinned) ||
        linkArray.push(new link(current, target))
    );
  }
}

function draw() {
  background("black");
  stroke("white");
  fill("white");
  rectMode(CENTER);

  linkArray.forEach((link) => link.update());
  nodeArray.forEach((node) => node.update());

  linkArray.forEach((link) => link.show());
  nodeArray.forEach((node) => node.show());

  if (keyIsPressed && (key == " " || key == "u" || key == "U")) undo();
}

function undo() {
  if (!cutHistory.length) return;
  const tail = cutHistory.pop();
  linkArray.push(tail);
}

function mouseDragged() {
  const mouse = createVector(mouseX, mouseY);

  linkArray = linkArray.filter((link) => {
    const middle = link.getMiddlePoint();
    const difference = middle.copy().sub(mouse);
    const distance = Math.hypot(difference.x, difference.y);

    if (distance > knifeRange) return true;
    cutHistory.push(link);
    return false;
  });
}

const node = function (x, y, pinned) {
  this.pos = createVector(x, y);
  this.vel = createVector(0, 0);
  this.force = createVector(0, 0);
  this.pinned = pinned;

  this.show = () => rect(this.pos.x, this.pos.y, 4);

  this.update = () => {
    if (this.pinned) return;
    const acc = this.force.mult(forceMultiplier);

    this.vel.add(acc);
    this.vel.limit(speedLimit);
    this.pos.add(this.vel);

    this.force.mult(0);
    this.force.y = (gravity * width) / 640;
    this.vel.mult(friction);

    if (this.pos.y > height) {
      this.pos.y = height;
      this.vel.y *= -1;
    }
  };
};

const link = function (node1, node2) {
  this.node1 = node1;
  this.node2 = node2;
  this.restLength = node1.pos.dist(node2.pos);

  this.getMiddlePoint = () => this.node1.pos.copy().add(this.node2.pos).div(2);

  this.show = () =>
    line(
      this.node1.pos.x,
      this.node1.pos.y,
      this.node2.pos.x,
      this.node2.pos.y
    );

  this.update = () => {
    const difference = node2.pos.copy().sub(node1.pos);
    const distance = max(0.1, Math.hypot(difference.x, difference.y));
    const k = (distance - this.restLength) / distance;
    const force = difference.mult(k);

    this.node1.pinned || this.node1.force.add(force);
    this.node2.pinned || this.node2.force.sub(force);
  };
};
