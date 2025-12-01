import { d } from "./svg.js";

export default class Leaves {
  constructor(ctx, input, x, y) {
    this.ctx = ctx;
    this.input = input;
    this.posX = x || ctx.canvas.width / 2;
    this.posY = y || ctx.canvas.height / 2;
    this.mouseX = this.input.getX();
    this.mouseY = this.input.getY();
    this.isInRange = false;
    this.rangeDetection = 500;
    this.blowAwaySpeed = 5;
    this.isInsideArea = false;
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
    this.blowAway();
  }

  draw() {
    if (this.isInRange) {
      this.ctx.fillStyle = "red";
    } else {
      this.ctx.fillStyle = "green";
    }
    this.ctx.beginPath();
    this.ctx.ellipse(this.posX, this.posY, 10, 30, Math.PI / 4, 0, Math.PI * 2);
    this.ctx.fill();
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
}
