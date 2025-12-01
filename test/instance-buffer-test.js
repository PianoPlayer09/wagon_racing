import { Mesh, UnlitSolidClass } from "../src/render/index";
import { Mat4, Vec3, CameraOptions } from "../src/math";

const canvas = document.getElementById("test-canvas");
const slider = document.getElementById("instance-slider");
const sliderValue = document.getElementById("instance-value");

const gl = canvas.getContext("webgl2", { antialias: true });
if (!gl) {
  throw new Error("WebGL2 is required for this test");
}

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.clearColor(0.05, 0.05, 0.08, 1);

// prettier-ignore
const cubePositions = new Float32Array([
  -0.5, -0.5, -0.5,
  0.5, -0.5, -0.5,
  0.5, 0.5, -0.5,
  -0.5, 0.5, -0.5,
  -0.5,-0.5, 0.5,
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

const mesh = new Mesh(gl, cubePositions, cubeIndices);
const renderClass = new UnlitSolidClass(gl, mesh);

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

const cameraPosition = new Vec3(0, 0);
const cameraTarget = new Vec3(0, 0, 0);
const cameraUp = new Vec3(0, 0, 1);
let cameraYaw = 0.0;
let cameraPitch = 0.0;

const cameraOptions = new CameraOptions(
  cameraPosition.clone(),
  cameraTarget.clone(),
  cameraUp.clone(),
  (60 * Math.PI) / 180,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  500,
);

const keys = new Set();
window.addEventListener("keydown", (event) =>
  keys.add(event.key.toLowerCase()),
);
window.addEventListener("keyup", (event) =>
  keys.delete(event.key.toLowerCase()),
);

slider.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  applyInstanceCount(Number(target.value));
});

canvas.addEventListener("click", () => {
  canvas.requestPointerLock();
});

document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement !== canvas) return;
  cameraYaw -= event.movementX * 0.002;
  cameraPitch -= event.movementY * 0.002;
  cameraPitch = Math.max(
    Math.min(cameraPitch, Math.PI / 2 - 0.1),
    -Math.PI / 2 + 0.1,
  );
});

function resizeCanvas() {
  const width = Math.floor(canvas.clientWidth);
  const height = Math.floor(canvas.clientHeight);

  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, width, height);
  cameraOptions.aspect = width / height;
}

let lastTime = performance.now();
const moveSpeed = 15;

function updateCamera(deltaTime) {
  const forward = new Mat4()
    .rotateY(cameraPitch)
    .rotateZ(cameraYaw)
    .multiplyVec(new Vec3(1, 0, 0));
  const right = Vec3.normalize(Vec3.cross(forward, cameraUp));

  let movement = new Vec3(0, 0, 0);
  const step = moveSpeed * deltaTime;

  if (keys.has("w")) {
    movement = Vec3.add(movement, forward.scale(step));
  }
  if (keys.has("s")) {
    movement = Vec3.add(movement, forward.scale(-step));
  }
  if (keys.has("a")) {
    movement = Vec3.add(movement, right.scale(-step));
  }
  if (keys.has("d")) {
    movement = Vec3.add(movement, right.scale(step));
  }
  if (keys.has("e")) {
    movement = Vec3.add(movement, cameraUp.scale(step));
  }
  if (keys.has("q")) {
    movement = Vec3.add(movement, cameraUp.scale(-step));
  }

  const nextPos = Vec3.add(cameraPosition, movement);
  cameraPosition.copyFrom(nextPos);

  const lookTarget = Vec3.add(cameraPosition, forward);
  cameraTarget.copyFrom(lookTarget);

  cameraOptions.position.copyFrom(cameraPosition);
  cameraOptions.target.copyFrom(cameraTarget);
  cameraOptions.up.copyFrom(cameraUp);
}

function updateInstances(time) {
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
}

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

function animate(time) {
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  resizeCanvas();
  updateCamera(deltaTime);
  updateInstances(time);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  renderClass.draw(cameraOptions);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
