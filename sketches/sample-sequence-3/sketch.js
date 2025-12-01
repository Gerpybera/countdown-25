import { createEngine } from "../_shared/engine.js";
import { Spring } from "../_shared/spring.js";
import Tomato from "./tomato.js";

const { renderer, input, math, run, finish } = createEngine();
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

let tomato = [];
let stuckTomatoCount = 0;
const limiteStuckTomatoes = 400;

function update(dt) {
  if (input.isPressed()) {
    spring.target = 0;
    tomato.push(new Tomato(ctx, input));
  } else {
    spring.target = 1;
  }

  spring.step(dt);

  const x = canvas.width / 2;
  const y = canvas.height / 2;
  const scale = Math.max(spring.position, 0);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update and draw the tomato
  //tomato.forEach((t) => t.update());

  /*
  ctx.save();
  ctx.fillStyle = "white";
  ctx.textBaseline = "middle";
  ctx.font = `${canvas.height}px Helvetica Neue, Helvetica , bold`;
  ctx.textAlign = "center";
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillText("3", 0, 0);
  ctx.restore();
  */
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
        finish();
      }
    }
  });
}
