import ItalianCar from './Car.js';
import inputStates from './input';
import CarPhysics from './CarPhysics';
//some form or something to create cars based on user input before joining game
export default class GameLogic {
    #car;
    #dt = 0;
    constructor() {
        this.#car = new ItalianCar('red', 'medium'); //default values for now, will pull from form later
    }
    start() {
        //game loop
        requestAnimationFrame(this.loop.bind(this));
    }
    loop(time) {
        const change = (time - this.#dt) / 1000;
        this.#dt = time;
        CarPhysics.updatePosition(this.#car, change);
        CarPhysics.applyAcceleration(this.#car, inputStates, change);
        CarPhysics.applySteering(this.#car, inputStates, change);
        CarPhysics.applyFriction(this.#car, change);
        //Add renderer later...
        requestAnimationFrame(this.loop.bind(this));
    }
}
