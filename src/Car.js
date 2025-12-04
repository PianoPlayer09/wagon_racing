/**This is Code for "Italian Car" object and its properties */
//Might have to add more properties later on like drift, and direction later on(can def as a normal vector based on user input )
// Preset configurations for different kart types. Taken from form submission before joining game.(Can move to seperate file for cleaner code)

//Const acceperation. Percent of
const KART_PRESETS = {
  light: { handling: 2.5, acceleration: 30, maxSpeed: 150 },
  medium: { handling: 2.0, acceleration: 25, maxSpeed: 160 },
  heavy: { handling: 1.5, acceleration: 23, maxSpeed: 190 },
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
  #omega; // angular velocity
  width = 30;
  length = 120;
  #coins; //def the speedboost
  constructor(color, type) {
    this.#color = color;
    if (!KART_PRESETS[type]) {
      type = "medium"; // Default to medium if invalid type
    }
    this.#type = type;
    const preset = KART_PRESETS[type];
    this.#handling = preset.handling;
    this.#acceleration = preset.acceleration;
    this.#maxSpeed = preset.maxSpeed;
    this.#currentSpeed = 0;
    this.#x = 0; // Initial X position
    this.#y = 0; // Initial Y position
    this.#omega = 0; // initial angular velocity
    this.#coins = 0;
    this.#theta = 0; // initial direction angle
    //theta is in RADIANS!
  }
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
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
  get theta() {
    return this.#theta;
  }
  set theta(angle) {
    this.#theta = angle;
  }
  get omega() {
    return this.#omega;
  }
  set omega(angularVelocity) {
    this.#omega = angularVelocity;
  }
  get coins() {
    return this.#coins;
  }
  set coins(num) {
    this.#coins = num;
  }
  set x(posX) {
    this.#x = posX;
  }
  set y(posY) {
    this.#y = posY;
  }
}
