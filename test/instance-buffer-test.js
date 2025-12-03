import { Mesh, UnlitSolidClass, Renderer } from "../src/render/index";
import { Vec3 } from "../src/math";

const canvas = document.getElementById("test-canvas");
const slider = document.getElementById("instance-slider");
const sliderValue = document.getElementById("instance-value");

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

const GRID_SIZE = 5;
const SPACING = 2;
const instances = [];
const rotationTargets = [];

const centerOffset = 0;
for (let x = 0; x < GRID_SIZE; x += 1) {
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let z = 0; z < GRID_SIZE; z += 1) {
      const instance = renderClass.newInstance();
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

const TOTAL_INSTANCES = instances.length;
slider.max = String(TOTAL_INSTANCES);
slider.value = "1";
let activeInstanceCount = 0;

function applyInstanceCount(value) {
  activeInstanceCount = value;
  sliderValue.textContent = String(value);
  renderClass.clearInstances();
  for (let i = 0; i < value; i += 1) {
    renderClass.createInstance(instances[i]);
  }
}

applyInstanceCount(1);

slider.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  applyInstanceCount(Number(target.value));
});

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

const gl = renderer.gl;
const boundBuffers = new Map();
const originalBindBuffer = gl.bindBuffer.bind(gl);
gl.bindBuffer = (target, buffer) => {
  originalBindBuffer(target, buffer);
  boundBuffers.set(target, buffer ?? null);
};

const instanceBuffer = renderClass["instanceBuffer"];
let lastInstanceBufferSize = 0;
const originalBufferData = gl.bufferData.bind(gl);
gl.bufferData = (target, dataOrSize, usage) => {
  originalBufferData(target, dataOrSize, usage);
  if (
    target === gl.ARRAY_BUFFER &&
    boundBuffers.get(gl.ARRAY_BUFFER) === instanceBuffer
  ) {
    const byteLength =
      typeof dataOrSize === "number" ? dataOrSize : dataOrSize.byteLength;
    if (byteLength !== lastInstanceBufferSize) {
      const action = byteLength > lastInstanceBufferSize ? "grew" : "shrunk";
      console.log(`[InstanceBuffer] ${action} to ${byteLength} bytes`);
      lastInstanceBufferSize = byteLength;
    }
  }
};

renderer.start();