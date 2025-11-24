// all funcitions will be static
export default class CarPhysics {
    //Things to implement:
    static update(car, input, dt) {
        this.applySteering(car, input, dt);
        this.applyAcceleration(car, input, dt);
        this.applyFriction(car, dt);
        this.updatePosition(car, dt);
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
            car.currentSpeed += d;
        }
        if (input.down) {
            let d = car.acceleration * dt;
            car.currentSpeed -= d; //currently simple deceleration: same factor as acceleration. Can change later to simulate braking better.
        }
    }
    //update positions based on speed and direction
    static updatePosition(car, dt) {
        // Update position based on current speed and direction (theta)
        const radians = car.theta * (Math.PI / 180);
        car.x += car.currentSpeed * Math.cos(radians) * dt;
        car.y += car.currentSpeed * Math.sin(radians) * dt;
    }
    //asumes coordinate system is staightforward such that right is pos. and left is neg.
    //Turing/Steerign
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
        car.currentSpeed *= frictionCoefficient * dt;
    }
}
