import ItalianCar from "./Car.js";
import inputStates from "./input";
import CarPhysics from "./CarPhysics";
import { Renderer } from "./render/Renderer.js";
import { Mesh } from "./render/Mesh.js";
import { UnlitSolidClass, UnlitSolidInstance } from "./render/objects/UnlitSolid";
import { Vec3 } from "./math";
import { collideRoad, generateProceduralRoad, ProceduralRoad } from "./road/index";
import { RenderInstance } from "./render/RenderInstance.js";

//some form or something to create cars based on user input before joining game

export default class GameLogic {
  #car: ItalianCar;
  #carInstance: UnlitSolidInstance;
  #roadInstance: UnlitSolidInstance;

  #road: ProceduralRoad;

  #renderer: Renderer;
  constructor(canvas: HTMLCanvasElement) {
    this.#car = new ItalianCar("red", "medium");

    this.#renderer = new Renderer({
      canvas,
      clearColor: [0.05, 0.05, 0.08, 1],
      moveSpeed: 15,
    });

    // Generate procedural road
    this.#road = generateProceduralRoad({
      controlPointCount: 10,
      baseRadius: 50,
      radiusVariance: 0.3,
      elevationRange: 0,
      width: 6,
      depth: 2,
      samplesPerSegment: 20,
    });

    // Create road mesh and render class
    const roadMesh = new Mesh(this.#renderer.gl, this.#road.positions, this.#road.indices);
    const roadClass = new UnlitSolidClass(this.#renderer.gl, roadMesh);
    this.#roadInstance = roadClass.createInstance();
    this.#roadInstance.color = new Vec3(0.24, 0.26, 0.28);
    this.#roadInstance.translation = new Vec3(0, 0, 0);
    this.#roadInstance.scale = new Vec3(1, 1, 1);

    this.#renderer.addRenderClass(roadClass);

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

    const carMesh = new Mesh(this.#renderer.gl, cubePositions, cubeIndices);
    const carClass = new UnlitSolidClass(this.#renderer.gl, carMesh);
    this.#carInstance = carClass.createInstance();
    this.#carInstance.color = new Vec3(1, 0, 0);
    this.#carInstance.scale = new Vec3(2, 1, 2);

    this.#renderer.addRenderClass(carClass);
  }

  start() {
    //game loop
    this.#renderer.onUpdate(this.loop.bind(this));
    this.#renderer.start();
  }

  loop(dt: number, time: number) {

    //Applying Car Physics methods.

    CarPhysics.applyAcceleration(this.#car, inputStates, dt);
    CarPhysics.applySteering(this.#car, inputStates, dt);
    CarPhysics.applyFriction(this.#car, dt);
    CarPhysics.updatePosition(this.#car, CarPhysics.NextPosition(this.#car,dt));

    let p = new Vec3(this.#car.position.x,this.#car.position.y,0);

    if(collideRoad(this.#road, p)) {
      this.#carInstance.color = new Vec3(0,1,0);
    } else {
      this.#carInstance.color = new Vec3(1,0,0);
    }

    // Update car render instance position
    this.#carInstance.translation = new Vec3(
      this.#car.position.x,
      this.#car.position.y,
      0.1,
    );
    this.#carInstance.rotation = new Vec3(0, 0, this.#car.theta);
  }
}
