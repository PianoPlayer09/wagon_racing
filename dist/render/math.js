export class Vec3 {
    elements;
    constructor(x = 0, y = 0, z = 0) {
        this.elements = new Float32Array(3);
        this.elements[0] = x;
        this.elements[1] = y;
        this.elements[2] = z;
    }
    copyFrom(other) {
        this.elements.set(other.elements);
        return this;
    }
    static from(value) {
        if (value instanceof Vec3) {
            return new Vec3(value.x, value.y, value.z);
        }
        return new Vec3(value[0], value[1], value[2]);
    }
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
    get x() {
        return this.elements[0];
    }
    set x(value) {
        this.elements[0] = value;
    }
    get y() {
        return this.elements[1];
    }
    set y(value) {
        this.elements[1] = value;
    }
    get z() {
        return this.elements[2];
    }
    set z(value) {
        this.elements[2] = value;
    }
    static add(a, b) {
        const lhs = Vec3.from(a);
        const rhs = Vec3.from(b);
        return new Vec3(lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z);
    }
    static subtract(a, b) {
        const lhs = Vec3.from(a);
        const rhs = Vec3.from(b);
        return new Vec3(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z);
    }
    static cross(a, b) {
        const lhs = Vec3.from(a);
        const rhs = Vec3.from(b);
        return new Vec3(lhs.y * rhs.z - lhs.z * rhs.y, lhs.z * rhs.x - lhs.x * rhs.z, lhs.x * rhs.y - lhs.y * rhs.x);
    }
    static normalize(value, fallback = new Vec3(0, 0, 0)) {
        const vec = Vec3.from(value);
        const len = Math.hypot(vec.x, vec.y, vec.z);
        if (len === 0) {
            return fallback.clone();
        }
        return new Vec3(vec.x / len, vec.y / len, vec.z / len);
    }
    static dot(a, b) {
        const lhs = Vec3.from(a);
        const rhs = Vec3.from(b);
        return lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
    }
    scale(s) {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }
}
export class CameraOptions {
    position;
    target;
    up;
    fovRadians;
    aspect;
    near;
    far;
    constructor(position, target, up, fovRadians, aspect, near, far) {
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
    elements;
    constructor(values) {
        if (values) {
            console.assert(values.length === 16);
            this.elements = new Float32Array(values);
        }
        else {
            const elements = new Float32Array(16);
            elements[0] = 1;
            elements[5] = 1;
            elements[10] = 1;
            elements[15] = 1;
            this.elements = elements;
        }
    }
    static from3x3(values) {
        console.assert(values.length === 9);
        const res = new Mat4();
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                res.elements[r * 4 + c] = values[r * 3 + c];
            }
        }
        return res;
    }
    duplicate() {
        return new Mat4(this.elements);
    }
    copyFrom(other) {
        this.elements.set(other.elements);
        return this;
    }
    multiply(rhs) {
        const out = new Mat4();
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                let sum = 0;
                for (let i = 0; i < 4; i++) {
                    sum += this.elements[r * 4 + i] * rhs.elements[c + i * 4];
                }
                out.elements[r * 4 + c] = sum;
            }
        }
        return out;
    }
    multiplyVec(rhs) {
        const out = new Vec3();
        for (let r = 0; r < 4; r++) {
            let sum = this.elements[r * 4 + 3];
            for (let i = 0; i < 3; i++) {
                sum += this.elements[r * 4 + i] * rhs.elements[i];
            }
            if (r == 3) {
                out.elements[0] /= sum;
                out.elements[1] /= sum;
                out.elements[2] /= sum;
            }
            else {
                out.elements[r] = sum;
            }
        }
        return out;
    }
    // from https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
    perspective(fov, aspectRatio, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const rangeInv = 1 / (near - far);
        // prettier-ignore
        return new Mat4([
            f / aspectRatio, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, near * far * rangeInv * 2,
            0, 0, -1, 0,
        ]);
    }
    // https://learnopengl.com/Getting-started/Camera
    // from https://github.com/g-truc/glm/blob/a583c59e1616a628b18195869767ea4d6faca5f4/glm/ext/matrix_transform.inl#L153.
    // difference is these matrices are row-major.
    lookAt(eye, target, up) {
        const f = Vec3.normalize(Vec3.subtract(target, eye), new Vec3(0, 0, 1));
        const s = Vec3.normalize(Vec3.cross(f, up), new Vec3(1, 0, 0));
        const u = Vec3.cross(s, f);
        // prettier-ignore
        return new Mat4([
            s.x, s.y, s.z, -Vec3.dot(s, eye),
            u.x, u.y, u.z, -Vec3.dot(u, eye),
            -f.x, -f.y, -f.z, Vec3.dot(f, eye),
            0, 0, 0, 1,
        ]);
    }
    transform(by) {
        return by.multiply(this);
    }
    translate(value) {
        // prettier-ignore
        return this.transform(new Mat4([
            1, 0, 0, value.x,
            0, 1, 0, value.y,
            0, 0, 1, value.z,
            0, 0, 0, 1
        ]));
    }
    scale(value) {
        const vector = typeof value === "number"
            ? new Vec3(value, value, value)
            : Vec3.from(value);
        // prettier-ignore
        return this.transform(new Mat4([
            vector.x, 0, 0, 0,
            0, vector.y, 0, 0,
            0, 0, vector.z, 0,
            0, 0, 0, 1
        ]));
    }
    rotate(rotation) {
        return this.rotateX(rotation.x).rotateY(rotation.y).rotateZ(rotation.z);
    }
    rotateX(rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        // prettier-ignore
        return this.transform(Mat4.from3x3([
            1, 0, 0,
            0, c, -s,
            0, s, c
        ]));
    }
    rotateY(rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        // prettier-ignore
        return this.transform(Mat4.from3x3([
            c, 0, -s,
            0, 1, 0,
            s, 0, c
        ]));
    }
    rotateZ(rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        // prettier-ignore
        return this.transform(Mat4.from3x3([
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ]));
    }
    static viewProjectionFromOptions(opts) {
        const view = new Mat4().lookAt(opts.position, opts.target, opts.up);
        const projection = new Mat4().perspective(opts.fovRadians, opts.aspect, opts.near, opts.far);
        return projection.multiply(view);
    }
    transpose() {
        const out = new Mat4();
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                out.elements[c * 4 + r] = this.elements[r * 4 + c];
            }
        }
        return out;
    }
}
