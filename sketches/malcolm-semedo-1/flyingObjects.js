import { d } from "./svg.js";

export default class FlyingObject {
  constructor(ctx, input) {
    this.ctx = ctx;
    this.input = input;
    this.svg = new Path2D(d);

    // Get target position inside SVG
    this.basePos = this.getRandomPointInsideSVG();
    this.x = this.basePos.x;
    this.y = -Math.random() * window.innerHeight; // Start above the canvas

    this.targetX = this.basePos.x;
    this.targetY = this.basePos.y;
    this.mouseX = this.input.getX();
    this.mouseY = this.input.getY();
    this.size = 30;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
    this.isHover = this.hoverCheck();
    this.velocityX = 0;
    this.velocityY = 0;
    this.incrLVL = 0.2;
    this.randomincrementX = Math.random() * this.incrLVL - this.incrLVL / 2;
    this.randomincrementY = Math.random() * this.incrLVL - this.incrLVL / 2;
    this.hasBeenHovered = false;
    this.supposedToGoBack = true;
  }

  getRandomPointInsideSVG() {
    const scale = 2;
    const svgOriginalSize = 500; // Original SVG size before scaling
    const canvasWidth = this.ctx.canvas.width;
    const canvasHeight = this.ctx.canvas.height;

    // Offset where scaled SVG is drawn on canvas
    const offsetX = canvasWidth / 2 - (svgOriginalSize * scale) / 2;
    const offsetY = canvasHeight / 2 - (svgOriginalSize * scale) / 2;

    // Keep trying until we find a point inside the SVG
    for (let i = 0; i < 1000; i++) {
      // Generate random point in ORIGINAL SVG coordinates (0-500)
      const svgX = Math.random() * svgOriginalSize;
      const svgY = Math.random() * svgOriginalSize;

      // Check if point is inside using original SVG coordinates
      if (this.ctx.isPointInPath(this.svg, svgX, svgY)) {
        // Convert to canvas coordinates
        const canvasX = offsetX + svgX * scale;
        const canvasY = offsetY + svgY * scale;
        return { x: canvasX, y: canvasY };
      }
    }

    // Fallback to center
    return { x: canvasWidth / 2, y: canvasHeight / 2 };
  }

  isInsideSVG(x, y) {
    // Not needed anymore, keeping for potential future use
    return false;
  }
  setup() {
    console.log("FlyingObject created at:", this.x, this.y);
    this.draw();
  }
  update() {
    this.mouseX = this.input.getX();
    this.mouseY = this.input.getY();
    this.isHover = this.hoverCheck();
    this.goToBasePosition();
    this.goDifferentDirection();
  }
  hoverCheck() {
    const dx = this.x - this.input.getX();
    const dy = this.y - this.input.getY();
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.size;
  }
  draw() {
    const shakingAmount = 0;
    this.ctx.fillStyle = this.isHover ? "red" : "white";
    this.ctx.beginPath();
    this.ctx.arc(
      this.x + Math.random() * shakingAmount - shakingAmount / 2,
      this.y + Math.random() * shakingAmount - shakingAmount / 2,
      this.size,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }
  goToBasePosition() {
    if (!this.supposedToGoBack) return;
    if (this.y < this.basePos.y) {
      this.y += 5;
    } else {
      this.y = this.basePos.y;
      this.supposedToGoBack = false;
    }
  }
  goDifferentDirection() {
    // Mark as hovered once touched
    if (this.isHover) {
      this.hasBeenHovered = true;
    }

    // Once hovered, keep moving and accelerating
    if (this.hasBeenHovered) {
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.velocityX += this.randomincrementX;
      this.velocityY += this.randomincrementY;
    }
  }
}
