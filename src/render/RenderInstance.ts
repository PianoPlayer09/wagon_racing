import { Mat4, Vec3, Vec3Like } from "./math";

export class RenderInstance {
  #translation: Vec3;
  #rotation: Vec3;
  #scale: Vec3;

  #modelMatrix: Mat4;
  private changed = true;

  constructor(
    translation: Vec3Like = [0, 0, 0],
    rotation: Vec3Like = [0, 0, 0],
    scale: Vec3Like = [1, 1, 1],
  ) {
    this.#translation = Vec3.from(translation);
    this.#rotation = Vec3.from(rotation);
    this.#scale = Vec3.from(scale);
    this.#modelMatrix = new Mat4();
  }

  set translation(translation: Vec3Like) {
    this.#translation.copyFrom(Vec3.from(translation));
    this.changed = true;
  }

  get translation(): Vec3 {
    return this.#translation;
  }

  set rotation(rotation: Vec3Like) {
    this.#rotation.copyFrom(Vec3.from(rotation));
    this.changed = true;
  }

  get rotation(): Vec3 {
    return this.#rotation;
  }

  set scale(scale: Vec3Like) {
    this.#scale.copyFrom(Vec3.from(scale));
    this.changed = true;
  }

  get scale(): Vec3 {
    return this.#scale;
  }

  get modelMatrix(): Mat4 {
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
