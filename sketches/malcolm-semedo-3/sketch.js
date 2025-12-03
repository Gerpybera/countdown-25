import { createEngine } from "../_shared/engine.js";
import { Spring } from "../_shared/spring.js";
import Tomato from "./tomato.js";

const { renderer, input, math, run, finish } = createEngine();
console.log(input);
const { ctx, canvas } = renderer;
run(update);

const spring = new Spring({
  position: 0,
  frequency: 2.5,
  halfLife: 0.05,
});
const svgImage = new Image();
svgImage.src = "./assets/SVG/number-3.svg";
let svgloaeded = false;
svgImage.onload = () => {
  svgloaeded = true;
};

// Preload tomato and splash images (arrays for randomization)
const NUM_SPRITES = 4; // Number of sprite variations (adjust based on your assets)
const preloadedImages = {
  tomatoes: [],
  splashes: [],
};

// Preload all sprite variations
for (let i = 0; i < NUM_SPRITES; i++) {
  const tomatoImg = new Image();
  const splashImg = new Image();
  // Assuming files are named: tomato.png, tomato2.png, tomato3.png, etc.
  // Or: tomato-0.png, tomato-1.png, etc. - adjust the path as needed
  tomatoImg.src =
    i === 0 ? "./assets/PNG/tomato.png" : `./assets/PNG/tomato${i + 1}.png`;
  splashImg.src =
    i === 0 ? "./assets/PNG/splash.png" : `./assets/PNG/splash${i + 1}.png`;
  preloadedImages.tomatoes.push(tomatoImg);
  preloadedImages.splashes.push(splashImg);
}

let tomato = [];
let stuckTomatoCount = 0;
const limiteStuckTomatoes = 20;
let allTraces = []; // Global array to store all traces separately
let isTomatoThrowable = true;

console.log(canvas.width, canvas.height);
function update(dt) {
  /*
  if (input.isPressed()) {
    spring.target = 0;
    tomato.push(new Tomato(ctx, input));
  } else {
    spring.target = 1;
  }
  */
  if (input.isDown()) {
    spring.target = 0;
    if (!isTomatoThrowable) return;
    tomato.push(new Tomato(ctx, input, allTraces, preloadedImages));
  } else {
    spring.target = 1;
  }

  spring.step(dt);

  const x = canvas.width / 2;
  const y = canvas.height / 2;
  const scale = Math.max(spring.position, 0);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw all traces from global array
  allTraces.forEach((trace) => {
    ctx.fillStyle = `rgba(255, 0, 0, ${trace.alpha})`;
    ctx.beginPath();
    ctx.arc(trace.x, trace.y, trace.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });

  // Update and draw the tomato
  tomato.forEach((t) => {
    t.update();
    if (t.posY - t.size > canvas.height) {
      tomato.splice(tomato.indexOf(t), 1);
      console.log("Tomato removed. Remaining tomatoes:", tomato.length);
    }
    if (t.wasJustThrownInside()) {
      stuckTomatoCount++;
      console.log("Tomatoes stuck inside SVG:", stuckTomatoCount);
    }
    if (stuckTomatoCount >= limiteStuckTomatoes) {
      t.posY += 5;
      if (tomato.length === 0) {
        cleanUpTraces();
      }
    }
  });
}

function getDifferentSplashImage() {
  switch (number) {
    case 1:
      return "./assets/PNG/splash.png";
    case 2:
      return "./assets/PNG/splash-2.png";
    case 3:
      return "./assets/PNG/splash-3.png";
    case 4:
      return "./assets/PNG/splash-4.png";
  }
}

function cleanUpTraces() {
  const rectSize = 100;
  ctx.fillStyle = "yellow";
  ctx.fillRect(
    input.getX() - rectSize / 2,
    input.getY() - rectSize / 2,
    rectSize,
    rectSize
  );
}
