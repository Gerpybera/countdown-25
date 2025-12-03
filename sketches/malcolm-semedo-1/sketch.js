import { createEngine } from "../_shared/engine.js";
import { Spring } from "../_shared/spring.js";
import FlyingObjects from "./flyingObjects.js";
import { onSvgLoad } from "./svg.js";

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;
run(update);

const spring = new Spring({
  position: -canvas.width,
  frequency: 0.5,
  halfLife: 0.3,
});

let flyingObjects = [];
const NUM_OBJECTS = 50;

// Create flying objects AFTER SVG is loaded
onSvgLoad(() => {
  for (let i = 0; i < NUM_OBJECTS; i++) {
    flyingObjects.push(new FlyingObjects(ctx, input));
  }
});

function update(dt) {
  /*
  
  if (input.isPressed()) {
	spring.target = canvas.width
	}
	else {
		spring.target = 0
}

spring.step(dt)
*/

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  flyingObjects.forEach((obj) => {
    obj.update();
    obj.draw();
    if (!obj.supposedToGoBack) {
      if (
        obj.x < 0 - obj.size ||
        obj.x > canvas.width + obj.size ||
        obj.y < 0 - obj.size ||
        obj.y > canvas.height + obj.size
      ) {
        flyingObjects.splice(flyingObjects.indexOf(obj), 1);
        if (flyingObjects.length === 0) {
          finish();
        }
      }
    }
  });
}
