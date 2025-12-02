import { d } from "./svg.js";

export default class Tomato {
  constructor(ctx, input, globalTraces) {
    this.ctx = ctx;
    this.input = input;
    this.globalTraces = globalTraces; // Reference to global traces array
    this.isSticking = false;
    this.isbeingThrown = false;
    this.isInsideArea = false;
    this.posX = this.input.getX();
    this.posY = this.input.getY();
    this.randomSizeOffset = Math.random() * 50 - 20;
    this.imgSize = 200 + this.randomSizeOffset;
    this.tomatoSprite = "./assets/PNG/tomato.png";
    this.splashSprite = "./assets/PNG/splash.png";
    this.splashSize = this.imgSize - 50 + this.randomSizeOffset;
    this.traces = [];
    this.isCounted = false;
    this.isMoving = false;
    this.wasStickingBefore = false;
    this.velocity = 0;
    this.isPlayingSplash = true;
    this.preload();
    //const svgPath = new Path2D(svgPathData);
    this.setup();
  }
  preload() {
    this.splashSFX = new Audio("./assets/AUDIO/splash.wav");
    this.slideSFX = new Audio("./assets/AUDIO/slide.wav");
    //this.throwSFX = new Audio("./assets/AUDIO/throw.mp3");
  }
  playSounds() {
    if (this.isSticking && this.isPlayingSplash) {
      this.splashSFX.play();
      this.isPlayingSplash = false;
    }
    if (this.isMoving) {
      // Map velocity (0 to ~10) to volume (0 to 1), capped at 1
      this.slideSFX.volume = Math.min(this.velocity / 10, 1);
      this.slideSFX.play();
    } else {
      this.slideSFX.pause();
      this.slideSFX.currentTime = 0;
    }
  }
  setup() {
    this.color = "red";
    this.size = 50;
    this.update();
  }
  update() {
    this.throw();
    this.slideDown();
    //this.checkArea(200, 100, 400, 400);

    this.isInsideArea = this.isTomatoInsideSVG(
      this.posX,
      this.posY,
      new Path2D(d)
    );
    this.tomatoTrace();

    this.createTomato(this.posX, this.posY);
    this.playSounds();
  }

  wasJustThrownInside() {
    const justBecameStuck = this.isSticking && !this.wasStickingBefore;
    this.wasStickingBefore = this.isSticking;

    if (justBecameStuck && this.isInsideArea && !this.isCounted) {
      this.isCounted = true;
      return true;
    }
    return false;
  }

  createTomato(x, y) {
    if (this.isSticking) {
      //this.ctx.fillStyle = "green";
      let tomatoImg = new Image();
      tomatoImg.src = this.splashSprite;
      this.ctx.drawImage(
        tomatoImg,
        x - this.imgSize / 2,
        y - this.imgSize / 2,
        this.imgSize,
        this.imgSize
      );
      return;
    } else {
      //this.ctx.fillStyle = this.color;
      let tomatoImg = new Image();
      tomatoImg.src = this.tomatoSprite;
      this.ctx.drawImage(
        tomatoImg,
        x - this.imgSize / 2,
        y - this.imgSize / 2,
        this.imgSize,
        this.imgSize
      );
      return;
    }
    //this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.closePath();
  }
  throw() {
    if (this.imgSize > this.splashSize) {
      this.imgSize -= 1;
      this.isSticking = false;
      //console.log("Tomato thrown! Remaining size:", this.size);
    } else {
      this.isSticking = true;
      //console.log("No more tomatoes left to throw!");
    }
  }
  checkArea(areaX, areaY, areaWidth, areaHeight) {
    if (
      this.posX > areaX &&
      this.posX < areaX + areaWidth &&
      this.posY > areaY &&
      this.posY < areaY + areaHeight
    ) {
      this.isInsideArea = true;
    } else {
      this.isInsideArea = false;
    }
  }
  isTomatoInsideSVG(posX, posY, svgPath) {
    // Save the current canvas state
    this.ctx.save();

    // Apply the same transformations as when rendering the SVG
    const canvasWidth = this.ctx.canvas.width;
    const canvasHeight = this.ctx.canvas.height;

    const scale = 2; // Use the same scale as your rendered SVG
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
  slideDown() {
    if (this.isSticking && !this.isInsideArea) {
      this.isMoving = true;
      this.posX += Math.random() * 2 - 1; // Slight horizontal movement
      this.posY += this.velocity;
      this.velocity += 0.1; // Increment velocity each frame
    } else {
      this.isMoving = false;
      this.velocity = 0; // Reset velocity when not moving
    }
  }
  tomatoTrace() {
    if (!this.isMoving) return;
    console.log("Creating tomato trace at:", this.posX, this.posY);

    // Create a trace object with position, size, and opacity
    const trace = {
      x: this.posX,
      y: this.posY,
      size: this.size,
      alpha: 0.01,
    };

    // Push the trace to the global traces array
    this.globalTraces.push(trace);
  }

  drawTraces() {
    // Traces are now stored globally, so this method is not needed anymore
  }
}
