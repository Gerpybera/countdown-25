import { d } from "./svg.js";

export default class Leaves {
  constructor(ctx, input, x, y) {
    this.ctx = ctx;
    this.input = input;
    this.posX = x || ctx.canvas.width / 2;
    this.posY = y || ctx.canvas.height / 2;
    this.size = 50 + Math.random() * 20 - 10;
    this.mouseX = this.input.getX();
    this.mouseY = this.input.getY();
    this.isInRange = false;
    this.affectedByMouse = true;
    this.rangeDetection = 400;
    this.blowAwaySpeed = 15;
    this.isInsideArea = false;
    this.imgPath = this.getfilePath();
    this.leafIMG = new Image();
    this.leafIMG.src = this.imgPath;
    this.leafIMG.onload = () => {
      console.log("Leaf image loaded successfully.");
    };
    this.randomAngle = Math.random() * Math.PI * 2;
    this.isBounderiesAffected = true;
    this.fallOffDelay = Math.random() * 1; // Random delay between 0-1 seconds
    this.timeSinceFallOff = 0;
    this.isFallingOff = false;
  }

  getfilePath() {
    const randomChoice = Math.floor(Math.random() * 5);
    switch (randomChoice) {
      case 0:
        return "./assets/PNG/leaf.png";
      case 1:
        return "./assets/PNG/leaf2.png";
      case 2:
        return "./assets/PNG/leaf3.png";
      case 3:
        return "./assets/PNG/leaf4.png";
      case 4:
        return "./assets/PNG/leaf5.png";
      default:
        return "./assets/PNG/leaf.png";
    }
  }

  update() {
    this.mouseX = this.input.getX();
    this.mouseY = this.input.getY();
    this.handleBoundaries();
    this.isInsideArea = this.isLeafInsideSVG(
      this.posX,
      this.posY,
      new Path2D(d)
    );
    this.detectRange();
    if (this.affectedByMouse) {
      this.blowAway();
    }
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.posX, this.posY);
    this.ctx.rotate(this.randomAngle);
    this.ctx.translate(-this.posX, -this.posY);
    this.ctx.drawImage(
      this.leafIMG,
      this.posX - this.size,
      this.posY - this.size,
      this.size * 2,
      this.size * 2
    );
    this.ctx.restore();
  }

  mouseVisual() {
    this.ctx.strokeStyle = "green";
    this.ctx.beginPath();
    this.ctx.arc(this.mouseX, this.mouseY, this.rangeDetection, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  detectRange() {
    const distX = this.mouseX - this.posX;
    const distY = this.mouseY - this.posY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    this.isInRange = distance < this.rangeDetection;
  }

  blowAway() {
    if (this.isInRange && !this.isInsideArea) {
      // Calculate direction away from mouse
      const distX = this.posX - this.mouseX;
      const distY = this.posY - this.mouseY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      // Normalize direction and apply speed
      if (distance > 0) {
        const dirX = distX / distance;
        const dirY = distY / distance;

        this.posX += dirX * this.blowAwaySpeed + Math.random() * 5 - 2.5;
        this.posY += dirY * this.blowAwaySpeed + Math.random() * 5 - 2.5;
      }
    }
  }

  handleBoundaries() {
    const padding = 20; // Distance from edge before bouncing

    if (this.isBounderiesAffected === false) return;

    // Bounce off left and right edges
    if (this.posX < padding) {
      this.posX = padding;
    } else if (this.posX > this.ctx.canvas.width - padding) {
      this.posX = this.ctx.canvas.width - padding;
    }

    // Bounce off top and bottom edges
    if (this.posY < padding) {
      this.posY = padding;
    } else if (this.posY > this.ctx.canvas.height - padding) {
      this.posY = this.ctx.canvas.height - padding;
    }
  }
  isLeafInsideSVG(posX, posY, svgPath) {
    // Save the current canvas state
    this.ctx.save();

    // Apply the same transformations as when rendering the SVG
    const canvasWidth = this.ctx.canvas.width;
    const canvasHeight = this.ctx.canvas.height;

    const scale = 2.5; // Use the same scale as your rendered SVG
    const imgSizeX = 500 * scale; // Original SVG width
    const imgSizeY = 500 * scale; // Original SVG height

    // Translate to center, then subtract half the SVG size
    this.ctx.translate(
      canvasWidth / 2 - imgSizeX / 2,
      canvasHeight / 2 - imgSizeY / 2
    );
    this.ctx.scale(scale, scale);

    // Check if the tomato point is inside the transformed path
    const isInside = this.ctx.isPointInPath(svgPath, posX, posY);

    this.ctx.restore();

    return isInside;
  }
  falloff() {
    this.isBounderiesAffected = false;
    this.affectedByMouse = false;
    this.posY += 5 + Math.random() * 2;
  }
  falloffOffset() {
    if (this.isInsideArea && !this.isFallingOff) {
      this.timeSinceFallOff += 0.016; // Approximate delta time (60fps)
      if (this.timeSinceFallOff >= this.fallOffDelay) {
        this.isFallingOff = true;
      }
    }

    if (this.isFallingOff) {
      this.falloff();
    }
  }
  drawSVGPath() {
    this.ctx.save();
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 2;
    this.ctx.translate(
      this.ctx.canvas.width / 2 - (500 * 2.5) / 2,
      this.ctx.canvas.height / 2 - (500 * 2.5) / 2
    );
    this.ctx.scale(2.5, 2.5);
    this.ctx.stroke(new Path2D(d));
    this.ctx.restore();
  }
}
