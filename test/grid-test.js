import { Mesh, UnlitSolidClass, Renderer } from "../src/render/index";
import { Vec3 } from "../src/math";

const canvas = document.getElementById("grid-test-canvas");

const renderer = new Renderer({
  canvas,
  clearColor: [0.05, 0.05, 0.08, 1],
  moveSpeed: 15,
});

// prettier-ignore
const cubePositions = new Float32Array([
  -0.5, -0.5, -0.5,
  0.5, -0.5, -0.5,
  0.5, 0.5, -0.5,
  -0.5, 0.5, -0.5,
  -0.5, -0.5, 0.5,
  0.5, -0.5, 0.5,
  0.5, 0.5, 0.5,
  -0.5, 0.5, 0.5,
]);

// prettier-ignore
const cubeIndices = new Uint32Array([
  0, 3, 2, 0, 2, 1,
  4, 5, 7, 6, 7, 5,
  0, 4, 7, 0, 7, 3,
  1, 2, 6, 1, 6, 5,
  3, 7, 6, 3, 6, 2,
  0, 1, 5, 0, 5, 4,
]);

const mesh = new Mesh(renderer.gl, cubePositions, cubeIndices);
const renderClass = new UnlitSolidClass(renderer.gl, mesh);

const GRID_SIZE = 2;
const SPACING = 2;
const instances = [];
const rotationTargets = [];

const centerOffset = 0;
for (let x = 0; x < GRID_SIZE; x += 1) {
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let z = 0; z < GRID_SIZE; z += 1) {
      const instance = renderClass.createInstance();
      instance.translation = new Vec3(
        (x - centerOffset) * SPACING,
        (y - centerOffset) * SPACING,
        (z - centerOffset) * SPACING,
      );
      instance.scale = new Vec3(1, 1, 1).scale(0.5);

      const color = new Vec3(
        0.25 + (x / (GRID_SIZE - 1)) * 0.75,
        0.25 + (y / (GRID_SIZE - 1)) * 0.75,
        0.25 + (z / (GRID_SIZE - 1)) * 0.75,
      );
      instance.color = color;

      instances.push(instance);

      rotationTargets.push({
        from: new Vec3(
          Math.random() * 2 * Math.PI,
          Math.random() * 2 * Math.PI,
          Math.random() * 2 * Math.PI,
        ),
        to: new Vec3(
          Math.random() * 2 * Math.PI,
          Math.random() * 2 * Math.PI,
          Math.random() * 2 * Math.PI,
        ),
      });
    }
  }
}

renderer.addRenderClass(renderClass);

renderer.onUpdate((dt, time) => {
  instances.forEach((instance, index) => {
    const t = Math.sin(time * 0.001);
    const from = rotationTargets[index].from;
    const to = rotationTargets[index].to;
    instance.rotation = new Vec3(
      from.x + (to.x - from.x) * t,
      from.y + (to.y - from.y) * t,
      from.z + (to.z - from.z) * t,
    );
  });
});

renderer.start();