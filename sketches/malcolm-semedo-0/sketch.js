import { createEngine } from "../_shared/engine.js";
import { createSpringSettings, Spring } from "../_shared/spring.js";
import FallingObject, {
  updateSharedPhysics,
  initSvgCollision,
} from "./fallingObjects.js";
import { onSvgLoad } from "./svg.js";

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;

// SVG collision settings
const imgGlobalSize = canvas.width / 2;
const svgScale = 1;

// Initialize SVG collision after SVGs are loaded
onSvgLoad(() => {
  initSvgCollision(ctx, imgGlobalSize, svgScale);
  console.log("SVG collision initialized");
});

const test = new FallingObject(ctx, canvas.width / 2, 0, 50);

const objects = [];
const MAX_OBJECTS = 5000;

// Spawn objects on interval when activated
let spawnInterval = null;
const SPAWN_DELAY = 10; // milliseconds between spawns

function startSpawning() {
  if (spawnInterval) return; // Already spawning
  spawnInterval = setInterval(() => {
    if (objects.length < MAX_OBJECTS) {
      const x = 900 + Math.random() * 200; // Spawn within a range
      const y = Math.random(20, -20); // Spawn above the canvas
      const size = 30;
      objects.push(new FallingObject(ctx, x, y, size));
      console.log("Number of objects:", objects.length);
    }
  }, SPAWN_DELAY);
}

function stopSpawning() {
  if (spawnInterval) {
    clearInterval(spawnInterval);
    spawnInterval = null;
  }
}

const spring = new Spring({
  position: 0,
});

const settings1 = createSpringSettings({
  frequency: 3.5,
  halfLife: 0.05,
});
const settings2 = createSpringSettings({
  frequency: 0.2,
  halfLife: 1.15,
});

run(update);

function update(dt) {
  if (input.isPressed()) {
    spring.target = -0.1;
    spring.settings = settings2;
  } else {
    spring.target = 1;
    spring.settings = settings1;
  }

  spring.step(dt);

  const x = canvas.width / 2;
  const y = canvas.height / 2;
  const scale = Math.max(spring.position, 0);

  let bgColor = "black";

  if (activated) {
    bgColor = "white";
    startSpawning();
  } else {
    bgColor = "black";
    stopSpawning();
  }

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update physics for all objects
  updateSharedPhysics();

  console.log("Total objects:", objects.length);

  objects.forEach((obj) => {
    obj.update();
    if (obj.body.positionY - obj.size > canvas.height) {
      objects.splice(objects.indexOf(obj), 1);
    }
  });

  createLever();
}

let leverPosX = 0;
let leverPosY = -250;
let circleSize = 50;

let activated = false;

function createLever() {
  const padding = 20;

  const leverLength = 600;
  const leverWidth = 300;
  const posX = canvas.width * 0.1;
  let posY = canvas.height / 2 + leverLength / 2;

  let colorCheck = "darkgray";

  /*
  const plateRectangle = new Image();
  plateRectangle.src = "./assets/PNG/plate-rectangle.png";
*/
  //INTERACTION PART

  let isHovering = false;
  if (
    input.getX() > posX + leverPosX - circleSize &&
    input.getX() < posX + leverPosX + circleSize &&
    input.getY() > posY + leverPosY - circleSize &&
    input.getY() < posY + leverPosY + circleSize
  ) {
    isHovering = true;
    document.body.style.cursor = "grab";
  } else {
    document.body.style.cursor = "default";
  }
  let isInsideConstraint = false;
  const minConstraintY = posY - leverLength + circleSize + padding;
  const maxConstraintY = posY - circleSize - padding;
  if (input.getY() >= minConstraintY && input.getY() <= maxConstraintY) {
    isInsideConstraint = true;
  }
  const detectionZoneMinY = posY - leverLength / 3;
  if (leverPosY + posY > detectionZoneMinY) {
    console.log("activating lever");
    activated = true;
  } else {
    activated = false;
  }

  if (input.isPressed()) {
    if (isHovering) {
      document.body.style.cursor = "grabbing";
    }
    if (isHovering && isInsideConstraint) {
      colorCheck = "red";
      leverPosY = input.getY() - posY;
    }
  } else {
    if (leverPosY > -leverLength + circleSize + padding) {
      leverPosY -= 2;
    }
  }

  //DRAWING PART
  ctx.fillStyle = "gray";
  ctx.save();
  ctx.translate(posX, posY);
  // create lever rectangle
  ctx.fillStyle = "gray";
  ctx.fillRect(-leverWidth / 2, -leverLength, leverWidth, leverLength);

  ctx.fillStyle = "darkgray";

  const rectCenterY = -leverLength / 2;
  let ConnectionHeight = leverPosY - rectCenterY;
  console.log("ConnectionHeight:", ConnectionHeight);
  //create connection between box and circle
  ctx.fillRect(-circleSize / 4, rectCenterY, circleSize / 2, ConnectionHeight);
  ctx.closePath();
  ctx.fillStyle = colorCheck;
  //create lever circle
  ctx.beginPath();
  ctx.arc(leverPosX, leverPosY, circleSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
}
