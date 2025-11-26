import { Mat4, Vec3 } from "./math.js";
export class RenderInstance {
    #translation;
    #rotation;
    #scale;
    #color;
    #modelMatrix;
    changed = true;
    constructor(translation = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], color = [1, 1, 1]) {
        this.#translation = Vec3.from(translation);
        this.#rotation = Vec3.from(rotation);
        this.#scale = Vec3.from(scale);
        this.#color = Vec3.from(color);
        this.#modelMatrix = new Mat4();
    }
    set translation(translation) {
        this.#translation.copyFrom(Vec3.from(translation));
        this.changed = true;
    }
    get translation() {
        return this.#translation;
    }
    set rotation(rotation) {
        this.#rotation.copyFrom(Vec3.from(rotation));
        this.changed = true;
    }
    get rotation() {
        return this.#rotation;
    }
    set scale(scale) {
        this.#scale.copyFrom(Vec3.from(scale));
        this.changed = true;
    }
    get scale() {
        return this.#scale;
    }
    set color(color) {
        this.#color.copyFrom(Vec3.from(color));
    }
    get color() {
        return this.#color;
    }
    get modelMatrix() {
        if (this.changed) {
            const translation = new Mat4().translate(this.#translation);
            const rotation = new Mat4().rotate(this.#rotation);
            const scale = new Mat4().scale(this.#scale);
            this.#modelMatrix = translation.multiply(rotation).multiply(scale);
            this.changed = false;
        }
        return this.#modelMatrix;
    }
}
