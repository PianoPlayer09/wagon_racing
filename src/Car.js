/**This is Code for "Italian Car" object and its properties */
//Might have to add more properties later on like drift, and direction later on(can def as a normal vector based on user input )
// Preset configurations for different kart types. Taken from form submission before joining game.(Can move to seperate file for cleaner code)

//Const acceperation. Percent of 
const KART_PRESETS = {
  light:  { handling: 2.5, acceleration: 30, maxSpeed: 150 },
  medium: { handling: 2.0, acceleration: 25, maxSpeed: 160},
  heavy:  { handling: 1.5, acceleration: 23, maxSpeed: 190 }
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
        width = 30;
        length = 120;
        #xvel;//xvel,yvel,xacc,and yacc are for the purpose of data storage
        #yvel;
        #xacc;
        #yacc;
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
        this.#xvel = 0
        this.#yvel = 0
        this.#xacc = 0
        this.#yacc = 0
        this.#coins = 0;
        this.#theta = 0; // initial direction angle ---MIGHT have to change to 90. Depends on how we implement certain things
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
    get velocity(){
        return{xvel:this.#xvel, yvel:this.#yvel}
    }
    get accelerationV(){
        return{xacc:this.#xacc, yacc:this.#yacc}
    }
    set x(posX) {
        this.#x = posX;
    }
    set y(posY) {
        this.#y = posY;
    }
    set xvel(xv){
        this.#xvel = xv
    }
    set yvel(yv){
        this.#yvel = yv
    }
    set xacc(xa){
        this.#xacc=xa
    }
    set yacc(ya){
        this.#yacc=ya
    }
    get coins(){
        return this.#coins;
    }
    set coins(num){
        this.#coins = num;
    }
    get theta(){
        return this.#theta;
    }
    set theta(angle){
        this.#theta = angle;
    }
    
}

