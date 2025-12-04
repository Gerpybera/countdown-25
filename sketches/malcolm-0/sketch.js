import { createEngine } from "../_shared/engine.js";
import { createSpringSettings, Spring } from "../_shared/spring.js";
import FallingObject, {
  updateSharedPhysics,
  initSvgCollision,
  hasReachedTargetBodies,
  updateMousePosition,
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
  //console.log("SVG collision initialized");
});

const objects = [];

// Spawn objects on interval when activated
let spawnInterval = null;
const SPAWN_DELAY = 10; // milliseconds between spawns

function startSpawning() {
  if (spawnInterval) return; // Already spawning
  spawnInterval = setInterval(() => {
    const x = Math.random() * canvas.width; // Spawn within a range
    const y = Math.random() * -20; // Spawn above the canvas
    const size = ctx.canvas.width * 0.025;
    objects.push(new FallingObject(ctx, x, y, size, rollNumberChoice()));
  }, SPAWN_DELAY);
}

function stopSpawning() {
  if (spawnInterval) {
    clearInterval(spawnInterval);
    spawnInterval = null;
  }
}

run(update);

const leverMovingSFX = new Audio("./assets/AUDIO/lever-moving.wav");
leverMovingSFX.volume = 0.2;
leverMovingSFX.loop = true;

const leverStopSFX = new Audio("./assets/AUDIO/lever-click.wav");
leverStopSFX.volume = 0.3;

const machineRunning = new Audio("./assets/AUDIO/machine_running.wav");
machineRunning.volume = 0.5;

const openingSFX = new Audio("./assets/AUDIO/open.wav");
openingSFX.volume = 0.5;

function update(dt) {
  let bgColor = "black";

  if (activated) {
    startSpawning();
  } else {
    stopSpawning();
  }

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  createContainer();

  // Update mouse position for collision
  updateMousePosition(input.getX(), input.getY());

  // Update physics for all objects
  updateSharedPhysics();

  //console.log("Total objects:", objects.length);

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
let lastLeverPosY = leverPosY; // Track previous lever position
let circleSize = canvas.width * 0.01;

let isPullable = false;
let wasAtLimit = false; // Track if lever was at a limit position

let activated = false;
let posY = 0;

const boxImg = new Image();
boxImg.src = "./assets/PNG/box.png";

const connectionImg = new Image();
connectionImg.src = "./assets/PNG/connection.png";

const leverImg = new Image();
leverImg.src = "./assets/PNG/lever.png";

let isSvgDeleteMode = false;

function createLever() {
  const padding = 20;

  const leverLength = canvas.width * 0.2;
  const leverWidth = leverLength / 2;
  const posX = canvas.width * 0.1;
  const STOREDPosY = canvas.height / 2 + leverLength / 2;

  // Only clamp posY if not in exit animation (delete mode with no objects)
  const isExiting = isSvgDeleteMode && objects.length === 0;
  if (!isExiting) {
    if (posY < STOREDPosY) {
      posY += 5;
    } else {
      posY = STOREDPosY;
    }
  }

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
  const minConstraintY = posY - leverLength + circleSize / 2 + padding;
  const maxConstraintY = posY - circleSize / 2 - padding;
  if (input.getY() >= minConstraintY && input.getY() <= maxConstraintY) {
    isInsideConstraint = true;
  }
  const detectionZoneMinY = posY - leverLength / 3;
  if (leverPosY + posY > detectionZoneMinY) {
    //console.log("activating lever");
    if (!isSvgDeleteMode) {
      activated = true;
    }
  } else {
    activated = false;
  }

  if (input.isPressed()) {
    document.body.style.cursor = "grabbing";

    if (isHovering && isInsideConstraint) {
      isPullable = true;
    }
    if (isPullable && isInsideConstraint) {
      colorCheck = "red";
      leverPosY = input.getY() - posY;
    }
  } else {
    if (leverPosY > -leverLength + circleSize + padding) {
      leverPosY -= 5;
    }
  }
  if (input.isUp()) {
    isPullable = false;
    document.body.style.cursor = "default";
  }

  if (
    leverPosY < -leverLength + circleSize + padding * 3 &&
    hasReachedTargetBodies()
  ) {
    isSvgDeleteMode = true;
    activated = false;
  }

  if (isSvgDeleteMode && leverPosY + posY > detectionZoneMinY) {
    containerRotation += 0.02;
    if (containerRotation > Math.PI / 6) {
      containerRotation = Math.PI / 6;
    }
    objects.forEach((obj) => {
      // delete collision with svg
      obj.disableSvgCollision();
    });
  }
  if (isSvgDeleteMode) {
    if (objects.length === 0) {
      posY += 5;
      containerPosY += 5;
      if (posY > canvas.height + leverLength && containerPosY > canvas.height) {
        finish();
      }
    }
  }

  //DRAWING PART
  ctx.fillStyle = "gray";
  ctx.save();
  ctx.translate(posX, posY);
  // create lever rectangle
  ctx.fillStyle = "gray";
  ctx.drawImage(boxImg, -leverWidth / 2, -leverLength, leverWidth, leverLength);
  //ctx.fillRect(-leverWidth / 2, -leverLength, leverWidth, leverLength);

  ctx.fillStyle = "darkgray";

  const rectCenterY = -leverLength / 2;
  let ConnectionHeight = leverPosY - rectCenterY;
  //console.log("ConnectionHeight:", ConnectionHeight);
  //create connection between box and circle
  ctx.drawImage(
    connectionImg,
    -circleSize / 2,
    rectCenterY,
    circleSize,
    ConnectionHeight
  );
  //
  //ctx.fillRect(-circleSize / 4, rectCenterY, circleSize / 2, ConnectionHeight);

  ctx.drawImage(
    leverImg,
    leverPosX - circleSize,
    leverPosY - circleSize,
    circleSize * 2,
    circleSize * 2
  );
  ctx.restore();

  // AUDIO PART
  const leverMinY = -leverLength + circleSize + padding; // Top limit
  const leverMaxY = -circleSize - padding * 2; // Bottom limit

  console.log("leverPosY:", leverPosY, "MinY:", leverMinY, "MaxY:", leverMaxY);

  const isAtLimit = leverPosY <= leverMinY || leverPosY >= leverMaxY;

  // Lever moving sound - play when lever position changes
  const isLeverMoving = leverPosY !== lastLeverPosY;
  if (isLeverMoving && !isAtLimit) {
    if (leverMovingSFX.paused) {
      leverMovingSFX.play();
    }
  } else {
    leverMovingSFX.pause();
  }
  lastLeverPosY = leverPosY;

  // Only play sound when just reaching a limit (not while staying there)
  if (isAtLimit && !wasAtLimit) {
    leverStopSFX.currentTime = 0;
    leverStopSFX.play();
  }
  wasAtLimit = isAtLimit;

  if (activated) {
    if (machineRunning.paused) {
      machineRunning.play();
    }
  } else {
    machineRunning.pause();
    machineRunning.currentTime = 0;
  }
}

function rollNumberChoice() {
  const randomNum = Math.floor(Math.random() * 3);
  if (randomNum === 0 || randomNum === 1) {
    return true;
  } else {
    return false;
  }
}

let containerRotation = 0;
let lastContainerRotation = containerRotation;
let containerPosX = canvas.width / 2;
let containerTargetY = canvas.height / 2; // Final position
let containerPosY = -imgGlobalSize; // Start above canvas

const containerImgLeft = new Image();
containerImgLeft.src = "./assets/PNG/container-left.png";

const containerImgRight = new Image();
containerImgRight.src = "./assets/PNG/container-right.png";

function createContainer() {
  let containerWidth = imgGlobalSize / 2;
  let containerHeight = imgGlobalSize;
  const marginWidth = 70;
  const marginHeight = 50;

  // Animate container from top to target position (unless exiting)
  const isExiting = isSvgDeleteMode && objects.length === 0;
  if (!isExiting) {
    if (containerPosY < containerTargetY) {
      containerPosY += 5;
    } else {
      containerPosY = containerTargetY;
    }
  }

  let containerRotationInv = -containerRotation;

  ctx.save();
  ctx.translate(
    containerPosX - marginWidth,
    containerPosY - containerHeight / 2 + marginHeight
  );

  ctx.rotate(containerRotation);
  ctx.drawImage(
    containerImgLeft,
    -containerWidth,
    0,
    containerWidth,
    containerHeight
  );
  //ctx.fillRect(-containerWidth, 0, containerWidth, containerHeight);
  ctx.restore();

  ctx.save();
  ctx.translate(
    containerPosX + marginWidth,
    containerPosY - containerHeight / 2 + marginHeight
  );

  ctx.rotate(containerRotationInv);
  ctx.drawImage(containerImgRight, 0, 0, containerWidth, containerHeight);
  //ctx.fillRect(0, 0, containerWidth, containerHeight);
  ctx.restore();
  //containerRotation += 0.01;

  //AUDIO for container opening when rotating
  if (containerRotation !== lastContainerRotation) {
    if (containerRotation > 0 && openingSFX.paused) {
      openingSFX.play();
    }
    lastContainerRotation = containerRotation;
  }
}
