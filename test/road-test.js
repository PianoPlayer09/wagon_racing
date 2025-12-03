import { Mesh, UnlitSolidClass, Renderer } from "../src/render/index";
import { Vec3 } from "../src/math";
import { generateProceduralRoad } from "../src/road/index";

const canvas = document.getElementById("test-canvas");

const renderer = new Renderer({
  canvas,
  clearColor: [0.05, 0.05, 0.08, 1],
  moveSpeed: 18,
});

const road = generateProceduralRoad({
  controlPointCount: 10,
  baseRadius: 50,
  radiusVariance: 0.3,
  elevationRange: 0,
  width: 1,
  samplesPerSegment: 20,
  closed: true,
});

const mesh = new Mesh(renderer.gl, road.positions, road.indices);
const roadClass = new UnlitSolidClass(renderer.gl, mesh);
const roadInstance = roadClass.createInstance();
roadInstance.color = new Vec3(0.24, 0.26, 0.28);
roadInstance.translation = new Vec3(0, 0, 0);
roadInstance.scale = new Vec3(1, 1, 1);

renderer.addRenderClass(roadClass);

renderer.start();