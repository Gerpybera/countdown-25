import { VerletPhysics } from "../_shared/verletPhysics.js";
import { dOutter, dInner } from "./svg.js";

// Shared physics instance for all falling objects
let sharedPhysics = null;
let sharedCtx = null;

// SVG collision settings
let svgOuterPath = null;
let svgInnerPath = null;
let svgScale = 1;
let svgOffsetX = 0;
let svgOffsetY = 0;
const svgOriginalSize = 500;

export function initSvgCollision(ctx, imgGlobalSize, scale) {
  sharedCtx = ctx;
  svgScale = (imgGlobalSize * scale) / svgOriginalSize;
  svgOffsetX = ctx.canvas.width / 2 - (imgGlobalSize * scale) / 2;
  svgOffsetY = ctx.canvas.height / 2 - (imgGlobalSize * scale) / 2;

  if (dOutter) svgOuterPath = new Path2D(dOutter);
  if (dInner) svgInnerPath = new Path2D(dInner);
}

export function getSharedPhysics(ctx) {
  if (!sharedPhysics) {
    sharedPhysics = new VerletPhysics();
    /*
    sharedPhysics.bounds = {
      bottom: ctx.canvas.height,
      left: 0,
      right: ctx.canvas.width,
    };
    */
    sharedPhysics.gravityY = 500;
    sharedCtx = ctx;
  }
  return sharedPhysics;
}

function checkSvgCollision(body) {
  if (!sharedCtx) return;

  // Transform body position to SVG coordinates
  const svgX = (body.positionX - svgOffsetX) / svgScale;
  const svgY = (body.positionY - svgOffsetY) / svgScale;

  const isInsideOuter =
    svgOuterPath && sharedCtx.isPointInPath(svgOuterPath, svgX, svgY);

  // Track if ball has ever been inside the outer shape
  if (isInsideOuter) {
    body.hasEnteredOuter = true;
  }

  // Check collision with outer path - only after ball has entered once
  if (body.hasEnteredOuter && !isInsideOuter) {
    // Ball left the outer SVG shape - push it back in
    const lastX = body.lastPositionX ?? body.positionX;
    const lastY = body.lastPositionY ?? body.positionY;

    body.positionX = lastX;
    body.positionY = lastY;
  }

  // Check collision with inner path - balls should stay OUTSIDE it (bounce off)
  if (svgInnerPath && sharedCtx.isPointInPath(svgInnerPath, svgX, svgY)) {
    // Ball entered the inner SVG shape - push it back out
    const lastX = body.lastPositionX ?? body.positionX;
    const lastY = body.lastPositionY ?? body.positionY;

    body.positionX = lastX;
    body.positionY = lastY;
  }
}

export function updateSharedPhysics() {
  if (sharedPhysics) {
    sharedPhysics.update(1 / 60);

    // Body-to-body collision
    const bodies = sharedPhysics.bodies;
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyA = bodies[i];
        const bodyB = bodies[j];

        const dx = bodyB.positionX - bodyA.positionX;
        const dy = bodyB.positionY - bodyA.positionY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = bodyA.radius + bodyB.radius;

        if (distance < minDist && distance > 0) {
          const overlap = (minDist - distance) / 2;
          const nx = dx / distance;
          const ny = dy / distance;

          bodyA.positionX -= overlap * nx;
          bodyA.positionY -= overlap * ny;
          bodyB.positionX += overlap * nx;
          bodyB.positionY += overlap * ny;
        }
      }
    }

    // SVG collision for each body
    for (const body of bodies) {
      checkSvgCollision(body);
    }
  }
}

export default class FallingObject {
  constructor(ctx, x, y, size) {
    this.ctx = ctx;
    this.physics = getSharedPhysics(ctx);
    this.body = this.physics.createBody({
      positionX: x,
      positionY: y,
      radius: size / 2,
    });
    this.size = size;
    this.color = "blue";
  }
  update() {
    // Physics is updated globally, just draw
    this.draw();
  }
  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(
      this.body.positionX,
      this.body.positionY,
      this.size / 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }
}
