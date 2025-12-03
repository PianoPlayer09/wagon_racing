import ItalianCar from './Car.js'
import inputStates from './input'
import CarPhysics from './CarPhysics'
//some form or something to create cars based on user input before joining game

export default class GameLogic {
    #car: ItalianCar;
    #dt: number = 0;
    constructor() {
        this.#car = new ItalianCar('red', 'medium');//default values for now, will pull from form later
    }
    start() {
        //game loop
        requestAnimationFrame(this.loop.bind(this));
    }
    loop(time: number) {
        const change = (time - this.#dt) / 1000;
        this.#dt = time;
        //Applying Car Physics methods.
        CarPhysics.applyAcceleration(this.#car, inputStates, change);
        CarPhysics.applySteering(this.#car, inputStates, change);
        CarPhysics.applyFriction(this.#car, change);
        //CarPhysics.updatePosition(this.#car, change);





        requestAnimationFrame(this.loop.bind(this)); //We do this so that we don't loose concept of this or class, since pasing as raw = loosing class context
    }
    //Render not making sense to me rn, so just focusing on logic for now

}
