import ItalianCar from "./Car";
import { InputStates, inputStates } from "./input";
import * as CollisionSystem from "./CollisionSystem.js";
// all funcitions will be static

export default class CarPhysics {
  //Things to implement:

  static update(car: ItalianCar, input: InputStates, dt: number) {
    this.applySteering(car, input, dt);
    this.applyAcceleration(car, input, dt);
    this.applyFriction(car, dt);

    let nextMove = this.NextPosition(car, dt);
    return nextMove;
  }

  /**
    @function applyAcceleration
    @description Updates the car's current speed based on user input for acceleration and deceleration.
    @param {ItalianCar} car - The car object whose speed is to be updated.
    @param {InputStates} input - The current state of user inputs (up/down).
    @param {number} dt - The time delta since the last update (in seconds).

    */
  static applyAcceleration(car: ItalianCar, input: InputStates, dt: number) {
    if (input.up) {
      let d = car.acceleration * dt;
      car.currentSpeed += d;
    }
    if (input.down) {
      let d = car.acceleration * dt;
      car.currentSpeed -= Math.min(d, car.currentSpeed); //currently simple deceleration: same factor as acceleration. Can change later to simulate braking better.
    }
  }

  //asumes coordinate system is staightforward such that left + and right -.
  //Turing/Steering
  static applySteering(car: ItalianCar, input: InputStates, dt: number) {
    if (input.left) {
      car.omega = car.handling;
    } else if (input.right) {
      car.omega = -car.handling;
    } else {
      car.omega = 0;
    }

    car.theta += car.omega * dt;
  }

  //Friction/Drag ( @Thomas)
  static applyFriction(car: ItalianCar, dt: number) {
    const frictionCoefficient = 0.1; // Adjust this value to change the friction effect
    car.currentSpeed -=
      Math.pow(car.currentSpeed, 1.5) * frictionCoefficient * dt;
  }
  // Collision Detection/Response
  //https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  //   predicts based on speed and direction
  static NextPosition(car: ItalianCar, dt: number) {
    let x_change = car.currentSpeed * Math.cos(car.theta) * dt;
    let y_change = car.currentSpeed * Math.sin(car.theta) * dt;
    return { x: car.x + x_change, y: car.y + y_change };
  }
  static updatePosition(car: ItalianCar, nextMove: { x: number; y: number }) {
    car.x = nextMove.x;
    car.y = nextMove.y;
  }
}
