import { Mesh, UnlitSolidClass } from "../src/render/index";

import { Mat4, Vec3, CameraOptions } from "../src/math";

import { generateProceduralRoad, generateRoad } from "../src/road/index";

const canvas = document.getElementById("test-canvas");

const gl = canvas.getContext("webgl2", { antialias: true });
if (!gl) {
  throw new Error("WebGL2 is required for this test");
}

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.clearColor(0.05, 0.05, 0.08, 1);

const road = generateProceduralRoad({
  controlPointCount: 10,
  baseRadius: 50,
  radiusVariance: 0.3,
  elevationRange: 0,
  width: 1,
  samplesPerSegment: 20,
  closed: true,
});

// const road = generateRoad(
//   [new Vec3(0,0,0), new Vec3(1,0,0), new Vec3(2,0,0), new Vec3(3,0,0)],2,0
// )

const mesh = new Mesh(gl, road.positions, road.indices);
const roadClass = new UnlitSolidClass(gl, mesh);
const roadInstance = roadClass.createInstance();
roadInstance.color = new Vec3(0.24, 0.26, 0.28);
roadInstance.translation = new Vec3(0, 0, 0);
roadInstance.scale = new Vec3(1, 1, 1);

const cameraPosition = new Vec3(0, 0, 0);
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

const moveSpeed = 18;
let lastTime = performance.now();

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

function animate(time) {
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  resizeCanvas();
  updateCamera(deltaTime);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  roadClass.draw(cameraOptions);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
