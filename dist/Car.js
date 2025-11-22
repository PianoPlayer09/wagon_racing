/**This is Code for "Italian Car" object and its properties */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ItalianCar_color, _ItalianCar_type, _ItalianCar_handling, _ItalianCar_acceleration, _ItalianCar_maxSpeed, _ItalianCar_currentSpeed, _ItalianCar_x, _ItalianCar_y;
// Preset configurations for different kart types. Taken from form submission before joining game.
const KART_PRESETS = {
    light: { handling: 0.9, acceleration: 0.18, maxSpeed: 4.4 },
    medium: { handling: 0.7, acceleration: 0.15, maxSpeed: 5.0 },
    heavy: { handling: 0.5, acceleration: 0.12, maxSpeed: 5.6 }
};
class ItalianCar {
    constructor(color, type) {
        _ItalianCar_color.set(this, void 0);
        _ItalianCar_type.set(this, void 0);
        _ItalianCar_handling.set(this, void 0);
        _ItalianCar_acceleration.set(this, void 0);
        _ItalianCar_maxSpeed.set(this, void 0);
        _ItalianCar_currentSpeed.set(this, void 0);
        _ItalianCar_x.set(this, void 0);
        _ItalianCar_y.set(this, void 0);
        __classPrivateFieldSet(this, _ItalianCar_color, color, "f");
        if (!KART_PRESETS[type]) {
            type = 'medium'; // Default to medium if invalid type
        }
        __classPrivateFieldSet(this, _ItalianCar_type, type, "f");
        const preset = KART_PRESETS[type];
        __classPrivateFieldSet(this, _ItalianCar_handling, preset.handling, "f");
        __classPrivateFieldSet(this, _ItalianCar_acceleration, preset.acceleration, "f");
        __classPrivateFieldSet(this, _ItalianCar_maxSpeed, preset.maxSpeed, "f");
        __classPrivateFieldSet(this, _ItalianCar_currentSpeed, 0, "f");
        __classPrivateFieldSet(this, _ItalianCar_x, 0, "f"); // Initial X position  --- NOT SURE WHERE WE NEED TO SET THIS BUT YEA
        __classPrivateFieldSet(this, _ItalianCar_y, 0, "f"); // Initial Y position  --- NOT SURE WHERE WE NEED TO SET THIS BUT YEA
    }
    getColor() {
        return __classPrivateFieldGet(this, _ItalianCar_color, "f");
    }
    getType() {
        return __classPrivateFieldGet(this, _ItalianCar_type, "f");
    }
    getHandling() {
        return __classPrivateFieldGet(this, _ItalianCar_handling, "f");
    }
    getAcceleration() {
        return __classPrivateFieldGet(this, _ItalianCar_acceleration, "f");
    }
    getMaxSpeed() {
        return __classPrivateFieldGet(this, _ItalianCar_maxSpeed, "f");
    }
    getCurrentSpeed() {
        return __classPrivateFieldGet(this, _ItalianCar_currentSpeed, "f");
    }
    setCurrentSpeed(speed) {
        __classPrivateFieldSet(this, _ItalianCar_currentSpeed, Math.min(speed, __classPrivateFieldGet(this, _ItalianCar_maxSpeed, "f")), "f");
    }
    getPosition() {
        return { x: __classPrivateFieldGet(this, _ItalianCar_x, "f"), y: __classPrivateFieldGet(this, _ItalianCar_y, "f") };
    }
    setPosition(x, y) {
        __classPrivateFieldSet(this, _ItalianCar_x, x, "f");
        __classPrivateFieldSet(this, _ItalianCar_y, y, "f");
    }
}
_ItalianCar_color = new WeakMap(), _ItalianCar_type = new WeakMap(), _ItalianCar_handling = new WeakMap(), _ItalianCar_acceleration = new WeakMap(), _ItalianCar_maxSpeed = new WeakMap(), _ItalianCar_currentSpeed = new WeakMap(), _ItalianCar_x = new WeakMap(), _ItalianCar_y = new WeakMap();
