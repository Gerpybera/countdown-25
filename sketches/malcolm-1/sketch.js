import { createEngine } from "../_shared/engine.js";
import { Spring } from "../_shared/spring.js";
import FlyingObjects from "./flyingObjects.js";
import { onSvgLoad } from "./svg.js";

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;

// Preload the video once
const preloadedVideo = document.createElement("video");
preloadedVideo.src = "./assets/VIDEO/flies.webm";
preloadedVideo.loop = true;
preloadedVideo.muted = true;
preloadedVideo.playsInline = true;
preloadedVideo.preload = "auto";

// Wait for video to be ready before starting
preloadedVideo.addEventListener("canplaythrough", () => {
  preloadedVideo.play();
  run(update);
});

const spring = new Spring({
  position: -canvas.width,
  frequency: 0.5,
  halfLife: 0.3,
});

let flyingObjects = [];
const NUM_OBJECTS = 200;

// Create flying objects AFTER SVG is loaded
onSvgLoad(() => {
  for (let i = 0; i < NUM_OBJECTS; i++) {
    flyingObjects.push(new FlyingObjects(ctx, input, preloadedVideo));
  }
});

function update(dt) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  flyingObjects.forEach((obj) => {
    obj.update(dt);
    obj.draw();
    obj.updateAudio();

    if (obj.hasEverBeenHovered) {
      if (
        obj.x < 0 - obj.size ||
        obj.x > canvas.width + obj.size ||
        obj.y < 0 - obj.size ||
        obj.y > canvas.height + obj.size
      ) {
        obj.stopAudio();
        flyingObjects.splice(flyingObjects.indexOf(obj), 1);
      }
    }
  });

  if (flyingObjects.length === 0) {
    finish();
  }
}
