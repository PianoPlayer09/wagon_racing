import ItalianCar from "./Car"


// this function will be used to detect collision between two items and also tell whether movement is valid
//class is in place of namespace
//WE have Cars as same dimensions
export class CollisionDetection {
    //simplest
    static isCollidingCarCar(car1: ItalianCar, car2: ItalianCar): boolean {
        let dx = car1.x - (car2.x / 2);
        let dy = car1.y - (car2.y / 2);
        return (Math.abs(dx) < (car1.width)) && (Math.abs(dy) < (car1.length));
    }
    
    /* 
    FIXME: need better object structure to work properly
    */
    //any for now. later will be changed.
    static isCollidingCarObject(car: ItalianCar,object: any ): boolean {
        let dx = car.x - (object.x / 2);
        let dy = car.y - (object.y / 2);
        return (Math.abs(dx) < (car.width)) && (Math.abs(dy) < (car.length));
    }
//Dependign on boundaries of track, we can have function here to check car track collision

}   