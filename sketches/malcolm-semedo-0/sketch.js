import { createEngine } from "../_shared/engine.js";
import { createSpringSettings, Spring } from "../_shared/spring.js";

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;
run(update);

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
  } else {
    bgColor = "black";
  }

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
  const posX = canvas.width / 4;
  let posY = canvas.height / 2 + leverLength / 2;

  let colorCheck = "darkgray";

  const plateRectangle = new Image();
  plateRectangle.src = "./assets/PNG/plate-rectangle.png";

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
  ctx.fillRect(-leverWidth / 2, -leverLength, leverWidth, leverLength);
  ctx.fillStyle = colorCheck ? (isHovering ? "red" : "darkgray") : "darkgray";
  //create lever circle
  ctx.beginPath();
  ctx.arc(leverPosX, leverPosY, circleSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
}
