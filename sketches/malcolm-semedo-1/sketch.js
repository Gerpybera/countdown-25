import { createEngine } from "../_shared/engine.js";
import { Spring } from "../_shared/spring.js";

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;
run(update);

const spring = new Spring({
  position: -canvas.width,
  frequency: 0.5,
  halfLife: 0.3,
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
}
