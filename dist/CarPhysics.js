// all funcitions will be static
export default class CarPhysics {
    //Things to implement:
    static update(car, input, dt) {
        this.applySteering(car, input, dt);
        this.applyAcceleration(car, input, dt);
        this.applyFriction(car, dt);
        let nextMove = this.NextPosition(car, dt);
        return nextMove;
    }
    //acceleratoin/Velocity update ( we can use some sort of sqrt function to make it approach max speed asymptotically)
    /**
    @function applyAcceleration
    @description Updates the car's current speed based on user input for acceleration and deceleration. We are using vector approach. Broken into components later for position update.
    @param {ItalianCar} car - The car object whose speed is to be updated.
    @param {InputStates} input - The current state of user inputs (up/down).
    @param {number} dt - The time delta since the last update (in seconds).

 */
    static applyAcceleration(car, input, dt) {
        if (input.up) {
            let d = car.acceleration * dt;
            car.currentSpeed += Math.min(d, car.maxSpeed - car.currentSpeed);
        }
        if (input.down) {
            let d = car.acceleration * dt;
            car.currentSpeed -= Math.min(d, car.currentSpeed); //currently simple deceleration: same factor as acceleration. Can change later to simulate braking better.
        }
    }
    //asumes coordinate system is staightforward such that right is pos. and left is neg.
    //Turing/Steering
    static applySteering(car, input, dt) {
        if (input.left) {
            car.theta -= car.handling * dt;
        }
        if (input.right) {
            car.theta += car.handling * dt;
        }
    }
    //Friction/Drag ( @Thomas)
    static applyFriction(car, dt) {
        const frictionCoefficient = 0.1; // Adjust this value to change the friction effect
        car.currentSpeed *= (1 - frictionCoefficient) * dt;
        if (Math.abs(car.currentSpeed) < 0.01) {
            car.currentSpeed = 0;
        }
    }
    // Collision Detection/Response 
    //https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    //   predicts based on speed and direction
    static NextPosition(car, dt) {
        // Update position based on current speed and direction (theta)
        let x_change = car.currentSpeed * Math.cos(car.theta) * dt;
        let y_change = car.currentSpeed * Math.sin(car.theta) * dt;
        return { x: car.x + x_change, y: car.y + y_change };
    }
    static updatePosition(car, nextMove) {
        car.x = nextMove.x;
        car.y = nextMove.y;
    }
}
