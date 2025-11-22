/**This is Code for "Italian Car" object and its properties */
//Might have to add more properties later on like drift, and direction later on(can def as a normal vector based on user input )
// Preset configurations for different kart types. Taken from form submission before joining game.(Can move to seperate file for cleaner code)
const KART_PRESETS = {
    light: { handling: 0.9, acceleration: 0.18, maxSpeed: 4.4 },
    medium: { handling: 0.7, acceleration: 0.15, maxSpeed: 5.0 },
    heavy: { handling: 0.5, acceleration: 0.12, maxSpeed: 5.6 }
};
export default class ItalianCar {
    #color;
    #type;
    #theta; // direction angle
    #handling;
    #acceleration;
    #maxSpeed;
    #currentSpeed;
    #x;
    #y;
    #coins; //def the speedboost
    constructor(color, type) {
        this.#color = color;
        if (!KART_PRESETS[type]) {
            type = 'medium'; // Default to medium if invalid type
        }
        this.#type = type;
        const preset = KART_PRESETS[type];
        this.#handling = preset.handling;
        this.#acceleration = preset.acceleration;
        this.#maxSpeed = preset.maxSpeed;
        this.#currentSpeed = 0;
        this.#x = 0; // Initial X position  --- NOT SURE WHERE WE NEED TO SET THIS BUT YEA
        this.#y = 0; // Initial Y position  --- NOT SURE WHERE WE NEED TO SET THIS BUT YEA
        this.#coins = 0;
        this.#theta = 0; // initial direction angle ---MIGHT have to change to 90. Depends on how we implement certain things
    }
    get color() {
        return this.#color;
    }
    get type() {
        return this.#type;
    }
    get handling() {
        return this.#handling;
    }
    get acceleration() {
        return this.#acceleration;
    }
    get maxSpeed() {
        return this.#maxSpeed;
    }
    get currentSpeed() {
        return this.#currentSpeed;
    }
    set currentSpeed(speed) {
        this.#currentSpeed = Math.min(speed, this.#maxSpeed);
    }
    get position() {
        return { x: this.#x, y: this.#y };
    }
    setPosition(x, y) {
        this.#x = x;
        this.#y = y;
    }
    get coins() {
        return this.#coins;
    }
    set coins(num) {
        this.#coins = num;
    }
}
