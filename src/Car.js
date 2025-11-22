/**This is Code for "Italian Car" object and its properties */

// Preset configurations for different kart types. Taken from form submission before joining game.
const KART_PRESETS = {
  light:  { handling: 0.9, acceleration: 0.18, maxSpeed: 4.4 },
  medium: { handling: 0.7, acceleration: 0.15, maxSpeed: 5.0 },
  heavy:  { handling: 0.5, acceleration: 0.12, maxSpeed: 5.6 }
};

class ItalianCar {
        #color;
        #type;
        #handling;
        #acceleration;
        #maxSpeed;
        #currentSpeed;
        #x;
        #y;
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
    }
    getColor() {
        return this.#color;
    }
    getType() {
        return this.#type;
    }
    getHandling() {
        return this.#handling;
    }
    getAcceleration() {
        return this.#acceleration;
    }
    getMaxSpeed() {
        return this.#maxSpeed;
    }
    getCurrentSpeed() {
        return this.#currentSpeed;
    }
    setCurrentSpeed(speed) {
        this.#currentSpeed = Math.min(speed, this.#maxSpeed);
    }
    getPosition() {
        return { x: this.#x, y: this.#y };
    }   
    setPosition(x, y) {
        this.#x = x;
        this.#y = y;
    }
    
}