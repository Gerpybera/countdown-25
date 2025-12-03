import { d } from "./svg.js";
import * as math from "../_shared/engine/math.js";

export default class FlyingObject {
  constructor(ctx, input, preloadedVideo) {
    this.ctx = ctx;
    this.input = input;
    this.svg = new Path2D(d);
    this.imgGlobalSize = this.ctx.canvas.width * 0.5; // SVG display size
    this.scale = 1;

    // Get target position inside SVG
    this.basePos = this.getRandomPointInsideSVG();
    this.x =
      this.basePos.x +
      Math.random() * window.innerWidth -
      window.innerWidth / 2;
    this.y = math.map(
      this.basePos.y + Math.random() * 300,
      window.innerHeight,
      0,
      -100,
      -window.innerHeight * 4
    ); //-Math.random() * window.innerHeight - 100; // Start above the canvas

    this.targetX = this.basePos.x;
    this.targetY = this.basePos.y;
    this.mouseX = this.input.getX();
    this.mouseY = this.input.getY();
    this.size = this.ctx.canvas.width * 0.02;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
    this.isHover = this.hoverCheck();
    this.velocityX = 0;
    this.velocityY = 0;
    this.incrLVL = 0.3;
    this.randomincrementX = Math.random() * this.incrLVL - this.incrLVL / 2;
    this.randomincrementY = Math.random() * this.incrLVL - this.incrLVL / 2;
    this.hasBeenHovered = false;
    this.supposedToGoBack = true;
    this.randomForce = 10;
    this.randomOffset = Math.random() * 1000;
    this.randomOffset2 = Math.random() * 1000;
    this.rotation = 0; // Rotation angle in radians
    this.targetForceMultiplier = 1;
    this.time = 0;

    // Use the preloaded video
    this.sprite = preloadedVideo;

    // Sound variations - add more files here as needed
    this.soundVariations = [
      "./assets/AUDIO/flies-moving.wav",
      "./assets/AUDIO/flies-moving2.wav",
      "./assets/AUDIO/flies-moving3.wav",
      "./assets/AUDIO/flies-moving4.wav",
    ];

    // Create individual audio for this fly with random sound
    this.audio = new Audio();
    this.pickRandomSound();
    this.audio.volume = 0;

    // When audio ends, reroll to a new random sound
    this.audio.addEventListener("ended", () => {
      this.pickRandomSound();
      // Restart if still moving
      if (this.isMoving()) {
        this.audio.play().catch(() => {});
      }
    });
  }

  pickRandomSound() {
    const randomIndex = Math.floor(Math.random() * this.soundVariations.length);
    this.audio.src = this.soundVariations[randomIndex];
  }

  getRandomPointInsideSVG() {
    const svgOriginalSize = 500; // Original SVG path size
    const scale = (this.imgGlobalSize * this.scale) / svgOriginalSize;
    const canvasWidth = this.ctx.canvas.width;
    const canvasHeight = this.ctx.canvas.height;

    // Offset where scaled SVG is drawn on canvas (centered)
    const offsetX = canvasWidth / 2 - (this.imgGlobalSize * this.scale) / 2;
    const offsetY = canvasHeight / 2 - (this.imgGlobalSize * this.scale) / 2;

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
    this.sprite = document.createElement("video");
    this.sprite.src = this.videoPath;
    this.sprite.loop = true;
    this.sprite.muted = true;
    this.sprite.play();
    this.sprite.addEventListener("loadedmetadata", () => {
      this.sprite.currentTime = Math.random() * this.sprite.duration;
    });
    this.draw();
  }
  update(dt) {
    this.time += dt;

    this.mouseX = this.input.getX();
    this.mouseY = this.input.getY();
    this.isHover = this.hoverCheck();

    const targetForceX = (this.targetX - this.x) * this.targetForceMultiplier;
    const targetForceY = (this.targetY - this.y) * this.targetForceMultiplier;

    this.velocityX += targetForceX;
    this.velocityY += targetForceY;

    // max speed
    const speed = math.dist(0, 0, this.velocityX, this.velocityY);
    const maxSpeed = 10;
    if (speed > maxSpeed) {
      this.velocityX = (this.velocityX / speed) * maxSpeed;
      this.velocityY = (this.velocityY / speed) * maxSpeed;
    }

    const distToTarget = math.dist(this.x, this.y, this.targetX, this.targetY);
    const distToTargetInfluence = math.mapClamped(
      distToTarget,
      0,
      window.innerWidth,
      0,
      1
    );
    const noiseScale = 3;
    const randomForceX =
      distToTargetInfluence *
      this.randomForce *
      Math.sin(this.time * noiseScale + this.randomOffset2);
    const randomForceY =
      distToTargetInfluence *
      this.randomForce *
      Math.sin(this.time * noiseScale + this.randomOffset);

    this.velocityX += randomForceX;
    this.velocityY += randomForceY;

    const drag = 0.2;

    //this.goToBasePosition();
    this.goDifferentDirection();
    this.velocityX = this.velocityX * Math.exp(-drag);
    this.velocityY = this.velocityY * Math.exp(-drag);
    this.x += this.velocityX;
    this.y += this.velocityY;
  }
  hoverCheck() {
    const dx = this.x - this.input.getX();
    const dy = this.y - this.input.getY();
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.size;
  }
  draw() {
    this.ctx.save();

    // Calculate rotation from velocity when flying away
    if (Math.abs(this.velocityX) > 3 || Math.abs(this.velocityY) > 3) {
      this.rotation = math.lerpAngleDeg(
        this.rotation,
        Math.atan2(this.velocityY, this.velocityX) - Math.PI / 2,
        0.5
      ); // +90° so "down" becomes forward
    }

    // Translate to object center, rotate, then draw
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.rotation);

    this.ctx.drawImage(
      this.sprite,
      -this.size,
      -this.size,
      this.size * 2,
      this.size * 2
    );

    this.ctx.restore();
  }

  goDifferentDirection() {
    // Check if fly has stopped moving (reached target)
    const hasStopped = this.getSpeed() < 0.5;

    // Allow re-hover if fly has stopped moving
    if (hasStopped && this.hasBeenHovered) {
      this.hasBeenHovered = false;
    }

    // Mark as hovered once touched and set new target
    if (this.isHover && !this.hasBeenHovered) {
      this.hasBeenHovered = true;

      // Pick a random direction to fly away
      const angle = Math.random() * Math.PI * 2;
      const distance = window.innerWidth * 2;

      this.targetX = this.x + Math.cos(angle) * distance;
      this.targetY = this.y + Math.sin(angle) * distance;

      this.targetX = math.clamp(
        this.targetX,
        -window.innerWidth * 2,
        window.innerWidth * 2
      );
      this.targetY = math.clamp(
        this.targetY,
        -window.innerHeight * 2,
        window.innerHeight * 2
      );
      this.targetForceMultiplier = 0.01;
      this.randomForce = 10;
    }
  }

  getSpeed() {
    return math.dist(0, 0, this.velocityX, this.velocityY);
  }

  isMoving() {
    return this.getSpeed() > 0.5;
  }

  isInsideCanvas() {
    return (
      this.x >= -this.size &&
      this.x <= this.ctx.canvas.width + this.size &&
      this.y >= -this.size &&
      this.y <= this.ctx.canvas.height + this.size
    );
  }

  updateAudio() {
    const speed = this.getSpeed();
    // Only play audio if fly is inside canvas and moving
    if (speed > 0.5 && this.isInsideCanvas()) {
      // Map speed (0-10) to volume (0-0.25), clamped to prevent loud audio
      const volume = math.clamp((speed / 10) * 0.25, 0, 0.25);
      this.audio.volume = volume;

      if (this.audio.paused) {
        this.audio.play().catch(() => {});
      }
    } else {
      this.audio.volume = 0;
      if (!this.audio.paused) {
        this.audio.pause();
      }
    }
  }

  stopAudio() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}
