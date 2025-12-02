import { createEngine } from "../_shared/engine.js";
import { Spring } from "../_shared/spring.js";
import Leaves from "./leaves.js";

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

  // Create leaves only once
  if (!leavesInitialized) {
    for (let i = 0; i < randomNumbers.length; i++) {
      const { posX, posY } = randomNumbers[i];
      leaves.push(new Leaves(ctx, input, posX, posY));
    }
    leavesInitialized = true;
  }

  // Update and draw all leaves
  for (let i = 0; i < leaves.length; i++) {
    leaves[i].update();
    leaves[i].draw();
  }
  //if all of my leaves have their isInsideArea to true, I can finish the sequence
  const allLeavesInside = leaves.every((leaf) => leaf.isInsideArea);
  if (allLeavesInside && currentState !== State.Finished) {
    currentState = State.Finished;
    shouldStartFalling = true;

    console.log("All leaves are inside the SVG area. Finishing sequence.");
    //finish();
    // You can add any additional logic here for when the sequence finishes
  }
  if (shouldStartFalling) {
    setTimeout(() => {
      leaves.forEach((leaf) => {
        leaf.falloffOffset();
        if (leaf.posY > canvas.height + leaf.size) {
          leaves.splice(leaves.indexOf(leaf), 1);
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
