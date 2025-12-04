import ItalianCar from "./Car.js";
import inputStates from "./input";
import CarPhysics from "./CarPhysics";
import { Renderer } from "./render/Renderer.js";
import { Mesh } from "./render/Mesh.js";
import {
  UnlitSolidClass,
  UnlitSolidInstance,
} from "./render/objects/UnlitSolid";
import { Vec3 } from "./math";
import {
  collideRoad,
  generateProceduralRoad,
  ProceduralRoad,
} from "./road/index";
import { clientSendCar, clientStart, onSocketMessage } from "./client.js";

//some form or something to create cars based on user input before joining game

export default class GameLogic {
  #car: ItalianCar;
  #carInstance: UnlitSolidInstance;
  #roadInstance: UnlitSolidInstance;
  #pid: string = "";
  #gid: string;

  #road: ProceduralRoad;

  #renderer: Renderer;
  #carClass: UnlitSolidClass;

  #otherCars: Map<string, { car: ItalianCar; instance: UnlitSolidInstance }> =
    new Map();

  constructor(canvas: HTMLCanvasElement, gid: string, clr: Vec3) {
    this.#gid = gid;

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
    const roadMesh = new Mesh(
      this.#renderer.gl,
      this.#road.positions,
      this.#road.indices,
    );
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
    this.#carClass = new UnlitSolidClass(this.#renderer.gl, carMesh);
    this.#carInstance = this.#carClass.createInstance();
    this.#carInstance.color = new Vec3(1, 0, 0);
    this.#carInstance.scale = new Vec3(2, 1, 2);

    this.#renderer.addRenderClass(this.#carClass);
  }

  async start() {
    //game loop
    this.#renderer.onUpdate(this.loop.bind(this));
    this.#renderer.start();

    this.#pid = (await clientStart(this.#gid, "medium", "red")) as string;

    onSocketMessage(this.handleWebSocketMessage.bind(this));
  }

  async loop(dt: number, time: number) {
    //Applying Car Physics methods.
    const nextP = CarPhysics.update(this.#car, inputStates, dt);
    CarPhysics.updatePosition(this.#car, nextP);

    let p = new Vec3(this.#car.position.x, this.#car.position.y, 0);

    if (collideRoad(this.#road, p)) {
      this.#carInstance.color = new Vec3(0, 1, 0);
    } else {
      this.#carInstance.color = new Vec3(1, 0, 0);
    }

    // Update car render instance position
    this.#carInstance.translation = new Vec3(
      this.#car.position.x,
      this.#car.position.y,
      0.1,
    );
    this.#carInstance.rotation = new Vec3(0, 0, this.#car.theta);

    if (this.#pid != "") clientSendCar(this.#gid, this.#pid, this.#car);

    const blankInputs = { up: false, down: false, right: false, left: false };

    for (let other of this.#otherCars.values()) {
      // console.log(other.car.position)
      // console.log(other.car.velocity)
      const nextP = CarPhysics.update(other.car, blankInputs, dt);
      CarPhysics.updatePosition(other.car, nextP);

      other.instance.translation = new Vec3(
        other.car.x,
        other.car.y,
        0.1,
      );

      other.instance.rotation = new Vec3(0, 0, other.car.theta);
    }
  }

  handleWebSocketMessage(data: any) {
    if (data.type == "state") {
      for (let v of data.cars) {
        if (v.pid != this.#pid) {
          if (!this.#otherCars.get(v.pid)) {
            console.log("created new!")

            let instance =this.#carClass.createInstance()

            instance.scale = new Vec3(2, 1, 2);
            instance.color = new Vec3(0,0,1)

            this.#otherCars.set(v.pid, {
              car: new ItalianCar(new Vec3(0, 0, 1), "medium"),
              instance
            });
          }

          let car = this.#otherCars.get(v.pid)!.car;

          car.x = v.car.x;
          car.y = v.car.y;
          car.theta = v.car.theta;
          car.currentSpeed = v.car.currentSpeed;
          car.omega = v.car.omega;
        }
      }
    }
  }
}
