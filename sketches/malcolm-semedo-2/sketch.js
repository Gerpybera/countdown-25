import { createEngine } from "../_shared/engine.js";
import { Spring } from "../_shared/spring.js";
import Leaves from "./leaves.js";
import { d } from "./svg.js";

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;

run(update);

const ySpring = new Spring({
  position: -canvas.height,
  target: 0,
  frequency: 1.5,
  halfLife: 0.05,
});
const scaleSpring = new Spring({
  position: 1,
  frequency: 1.5,
  halfLife: 0.1,
});
const rotationSpring = new Spring({
  position: 180,
  frequency: 0.5,
  halfLife: 0.805,
  wrap: 360,
});

let fallPos = 0;
let fallVel = 0;
const numberLeaves = 2000;
let leaves = [];
let randomNumbers = [];
let leavesInitialized = false;
let shouldStartFalling = false;

// Generate random positions once
for (let i = 0; i < numberLeaves; i++) {
  randomNumbers.push({
    posX: Math.random() * canvas.width,
    posY: Math.random() * canvas.height,
  });
}

// Preload leaf sound (shared by all leaves)
const preloadedLeafSound = new Audio("./assets/AUDIO/leaf-rustle.wav");
preloadedLeafSound.volume = 1;

const State = {
  WaitingForInput: "waitingForInput",
  Interactive: "interactive",
  Falling: "falling",
  Finished: "finished",
};
let currentState = State.WaitingForInput;
let startInputX = 0;
function update(dt) {
  const x = canvas.width / 2;
  const y = canvas.height / 2 + fallPos;
  const rot = rotationSpring.position;
  const scale = scaleSpring.position;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  playLeafBlowSound();

  // Create leaves only once
  if (!leavesInitialized) {
    for (let i = 0; i < randomNumbers.length; i++) {
      const { posX, posY } = randomNumbers[i];
      leaves.push(new Leaves(ctx, input, posX, posY, preloadedLeafSound));
    }
    leavesInitialized = true;
  }
  // Update and draw all leaves
  let anyLeafMoving = false;
  let totalSpeed = 0;
  let movingCount = 0;
  for (let i = 0; i < leaves.length; i++) {
    leaves[i].update();
    leaves[i].draw();
    if (leaves[i].isMoving()) {
      anyLeafMoving = true;
      totalSpeed += leaves[i].getSpeed();
      movingCount++;
    }
  }

  // Control leaf rustle sound globally with volume based on speed
  if (anyLeafMoving) {
    const avgSpeed = totalSpeed / movingCount;
    // Map average speed (0-20) to volume (0.05-0.5)
    const volume = Math.min(0.05 + (avgSpeed / 20) * 0.45, 0.5);
    preloadedLeafSound.volume = volume;

    if (preloadedLeafSound.paused) {
      preloadedLeafSound.loop = true;
      preloadedLeafSound.play();
    }
  } else if (!preloadedLeafSound.paused) {
    preloadedLeafSound.pause();
    preloadedLeafSound.currentTime = 0;
  }
  //if all of my leaves have their isInsideArea to true, I can finish the sequence
  const allLeavesInside = leaves.every((leaf) => leaf.isInsideArea);
  if (allLeavesInside && currentState !== State.Finished) {
    currentState = State.Finished;
    shouldStartFalling = true;

    console.log("All leaves are inside the SVG area. Finishing sequence.");
    // You can add any additional logic here for when the sequence finishes
  }
  if (shouldStartFalling) {
    setTimeout(() => {
      leaves.forEach((leaf) => {
        leaf.falloffOffset();
        if (leaf.posY > canvas.height + leaf.size) {
          leaves.splice(leaves.indexOf(leaf), 1);
          if (leaves.length === 0) {
            finish();
          }
        }
      });
    }, 1000);
  }

  /*


  ctx.fillStyle = "white"
  ctx.textBaseline = "middle"
  ctx.font = `${canvas.height}px Helvetica Neue, Helvetica , bold`
  ctx.textAlign = "center"
  ctx.translate(x, y + ySpring.position)
  ctx.rotate(math.toRadian(rot))
  ctx.scale(scale, scale)
  ctx.fillText("2", 0, 0)
  
*/
}

// Preload audio outside the function
const blowStart = new Audio("./assets/AUDIO/leafblower-start.wav");
const blowLoop = new Audio("./assets/AUDIO/leafblower-loop.wav");
const blowEnd = new Audio("./assets/AUDIO/leafblower-end.wav");
const volumne = 0.7;
blowStart.volume = volumne;
blowLoop.volume = volumne;
blowEnd.volume = volumne;

function playLeafBlowSound() {
  // Only play blowStart if it's not playing AND blowLoop is not playing
  if (input.isPressed() && blowStart.paused && blowLoop.paused) {
    blowEnd.pause();
    blowEnd.currentTime = 0;
    blowStart.currentTime = 0;
    blowStart.play();
    blowStart.addEventListener(
      "ended",
      () => {
        blowStart.pause();
        blowLoop.currentTime = 0;
        blowLoop.loop = true;
        blowLoop.play();
      },
      { once: true }
    ); // Use once: true to prevent multiple listeners
  }
  if (input.isUp() && (!blowStart.paused || !blowLoop.paused)) {
    blowLoop.pause();
    blowStart.pause();
    blowStart.currentTime = 0;
    blowEnd.currentTime = 0;
    blowEnd.play();
  }
}
