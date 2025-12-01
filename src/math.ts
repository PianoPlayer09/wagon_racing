export type Vec3Array = [number, number, number];
export type Vec3Like = Vec3 | Vec3Array;

export class Vec3 {
  readonly elements: Float32Array;

  constructor(x = 0, y = 0, z = 0) {
    this.elements = new Float32Array(3);
    this.elements[0] = x;
    this.elements[1] = y;
    this.elements[2] = z;
  }

  copyFrom(other: Vec3): this {
    this.elements.set(other.elements);
    return this;
  }

  static from(value: Vec3Like): Vec3 {
    if (value instanceof Vec3) {
      return new Vec3(value.x, value.y, value.z);
    }
    return new Vec3(value[0], value[1], value[2]);
  }

  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  get x(): number {
    return this.elements[0];
  }
  set x(value: number) {
    this.elements[0] = value;
  }

  get y(): number {
    return this.elements[1];
  }
  set y(value: number) {
    this.elements[1] = value;
  }

  get z(): number {
    return this.elements[2];
  }
  set z(value: number) {
    this.elements[2] = value;
  }

  static add(a: Vec3Like, b: Vec3Like): Vec3 {
    const lhs = Vec3.from(a);
    const rhs = Vec3.from(b);
    return new Vec3(lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z);
  }

  static subtract(a: Vec3Like, b: Vec3Like): Vec3 {
    const lhs = Vec3.from(a);
    const rhs = Vec3.from(b);
    return new Vec3(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z);
  }

  static cross(a: Vec3Like, b: Vec3Like): Vec3 {
    const lhs = Vec3.from(a);
    const rhs = Vec3.from(b);
    return new Vec3(
      lhs.y * rhs.z - lhs.z * rhs.y,
      lhs.z * rhs.x - lhs.x * rhs.z,
      lhs.x * rhs.y - lhs.y * rhs.x,
    );
  }

  static normalize(value: Vec3Like, fallback: Vec3 = new Vec3(0, 0, 0)): Vec3 {
    const vec = Vec3.from(value);
    const len = Math.hypot(vec.x, vec.y, vec.z);
    if (len === 0) {
      return fallback.clone();
    }
    return new Vec3(vec.x / len, vec.y / len, vec.z / len);
  }

  static dot(a: Vec3Like, b: Vec3Like): number {
    const lhs = Vec3.from(a);
    const rhs = Vec3.from(b);
    return lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
  }

  static distance(a: Vec3, b: Vec3): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.hypot(dx, dy, dz);
  }

  scale(s: number): Vec3 {
    return new Vec3(this.x * s, this.y * s, this.z * s);
  }
}

export class CameraOptions {
  position: Vec3;
  target: Vec3;
  up: Vec3;
  fovRadians: number;
  aspect: number;
  near: number;
  far: number;

  constructor(
    position: Vec3,
    target: Vec3,
    up: Vec3,
    fovRadians: number,
    aspect: number,
    near: number,
    far: number,
  ) {
    this.position = position;
    this.target = target;
    this.up = up;
    this.fovRadians = fovRadians;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }
}

export class Mat4 {
  private static index(row: number, col: number): number {
    return col * 4 + row;
  }

  readonly elements: Float32Array;

  constructor(values?: Float32Array | number[]) {
    if (values) {
      console.assert(values.length === 16);
      this.elements = new Float32Array(values);
    } else {
      const elements = new Float32Array(16);
      for (let i = 0; i < 4; i++) {
        elements[Mat4.index(i, i)] = 1;
      }
      this.elements = elements;
    }
  }

  static from3x3(values: Float32Array | number[]): Mat4 {
    console.assert(values.length === 9);
    const res = new Mat4();
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        res.elements[Mat4.index(r, c)] = values[r * 3 + c];
      }
    }
    return res;
  }

  duplicate(): Mat4 {
    return new Mat4(this.elements);
  }

  copyFrom(other: Mat4): Mat4 {
    this.elements.set(other.elements);
    return this;
  }

  multiply(rhs: Mat4): Mat4 {
    const out = new Mat4();
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        let sum = 0;
        for (let i = 0; i < 4; i++) {
          sum +=
            this.elements[Mat4.index(r, i)] * rhs.elements[Mat4.index(i, c)];
        }
        out.elements[Mat4.index(r, c)] = sum;
      }
    }
    return out;
  }

  multiplyVec(rhs: Vec3): Vec3 {
    const out = new Vec3();
    let w = 0;
    for (let r = 0; r < 4; r++) {
      let sum = this.elements[Mat4.index(r, 3)];
      for (let i = 0; i < 3; i++) {
        sum += this.elements[Mat4.index(r, i)] * rhs.elements[i];
      }
      if (r < 3) {
        out.elements[r] = sum;
      } else {
        w = sum;
      }
    }
    if (w !== 0 && w !== 1) {
      const invW = 1 / w;
      out.elements[0] *= invW;
      out.elements[1] *= invW;
      out.elements[2] *= invW;
    }
    return out;
  }

  // from https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
  perspective(
    fov: number,
    aspectRatio: number,
    near: number,
    far: number,
  ): Mat4 {
    const f = 1.0 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);

    // prettier-ignore
    return new Mat4([
      f / aspectRatio, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, near * far * rangeInv * 2,
      0, 0, -1, 0,
    ]).transpose();
  }

  // https://learnopengl.com/Getting-started/Camera
  // from https://github.com/g-truc/glm/blob/a583c59e1616a628b18195869767ea4d6faca5f4/glm/ext/matrix_transform.inl#L153.
  // difference is these matrices are row-major.
  lookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
    const f = Vec3.normalize(Vec3.subtract(target, eye), new Vec3(0, 0, 1));
    const s = Vec3.normalize(Vec3.cross(f, up), new Vec3(1, 0, 0));
    const u = Vec3.cross(s, f);

    // prettier-ignore
    return new Mat4([
      s.x, s.y, s.z, -Vec3.dot(s, eye),
      u.x, u.y, u.z, -Vec3.dot(u, eye),
      -f.x, -f.y, -f.z, Vec3.dot(f, eye),
      0, 0, 0, 1,
    ]).transpose();
  }

  transform(by: Mat4): Mat4 {
    return by.multiply(this);
  }

  translate(value: Vec3): Mat4 {
    // prettier-ignore
    return this.transform(
      new Mat4([
        1, 0, 0, value.x,
        0, 1, 0, value.y,
        0, 0, 1, value.z,
        0, 0, 0, 1
      ]).transpose()
    );
  }

  scale(value: Vec3 | number): Mat4 {
    const vector =
      typeof value === "number"
        ? new Vec3(value, value, value)
        : Vec3.from(value);

    // prettier-ignore
    return this.transform(
      new Mat4([
        vector.x, 0, 0, 0,
        0, vector.y, 0, 0,
        0, 0, vector.z, 0,
        0, 0, 0, 1
      ]).transpose()
    );
  }

  rotate(rotation: Vec3): Mat4 {
    return this.rotateX(rotation.x).rotateY(rotation.y).rotateZ(rotation.z);
  }

  rotateX(rad: number): Mat4 {
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    // prettier-ignore
    return this.transform(
      Mat4.from3x3([
        1, 0, 0,
        0, c, -s,
        0, s, c
      ])
    );
  }

  rotateY(rad: number): Mat4 {
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    // prettier-ignore
    return this.transform(
      Mat4.from3x3([
        c, 0, -s,
        0, 1, 0,
        s, 0, c
      ])
    );
  }

  rotateZ(rad: number): Mat4 {
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    // prettier-ignore
    return this.transform(
      Mat4.from3x3([
        c, -s, 0,
        s, c, 0,
        0, 0, 1
      ])
    );
  }

  static viewProjectionFromOptions(opts: CameraOptions): Mat4 {
    const view = new Mat4().lookAt(opts.position, opts.target, opts.up);
    const projection = new Mat4().perspective(
      opts.fovRadians,
      opts.aspect,
      opts.near,
      opts.far,
    );
    return projection.multiply(view);
  }

  transpose(): Mat4 {
    const out = new Mat4();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        out.elements[Mat4.index(r, c)] = this.elements[Mat4.index(c, r)];
      }
    }
    return out;
  }
}
