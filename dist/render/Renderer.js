import { Mat4, Vec3, CameraOptions } from "../math";
export class Renderer {
    gl;
    canvas;
    cameraOptions;
    renderClasses = new Set();
    keys = new Set();
    lastTime = performance.now();
    animationFrameId = null;
    cameraPosition;
    cameraTarget;
    cameraUp;
    cameraYaw = 0.0;
    cameraPitch = 0.0;
    moveSpeed;
    mouseSensitivity;
    updateCallback;
    constructor(options) {
        this.canvas = options.canvas;
        const gl = this.canvas.getContext("webgl2", { antialias: true });
        if (!gl) {
            throw new Error("WebGL2 is required for rendering");
        }
        this.gl = gl;
        const clearColor = options.clearColor ?? [0.05, 0.05, 0.08, 1];
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clearColor(...clearColor);
        this.cameraPosition = new Vec3(0, 0, 0);
        this.cameraTarget = new Vec3(0, 0, 0);
        this.cameraUp = new Vec3(0, 0, 1);
        this.cameraOptions = new CameraOptions(this.cameraPosition.clone(), this.cameraTarget.clone(), this.cameraUp.clone(), options.fov ?? (60 * Math.PI) / 180, this.canvas.clientWidth / this.canvas.clientHeight, options.near ?? 0.1, options.far ?? 500);
        this.moveSpeed = options.moveSpeed ?? 15;
        this.mouseSensitivity = options.mouseSensitivity ?? 0.002;
        this.setupInputHandlers(options.enablePointerLock ?? true);
    }
    get cameraForward() {
        return new Mat4()
            .rotateY(this.cameraPitch)
            .rotateZ(this.cameraYaw)
            .multiplyVec(new Vec3(1, 0, 0));
    }
    addRenderClass(renderClass) {
        this.renderClasses.add(renderClass);
    }
    removeRenderClass(renderClass) {
        this.renderClasses.delete(renderClass);
    }
    onUpdate(callback) {
        this.updateCallback = callback;
    }
    start() {
        this.lastTime = performance.now();
        this.animate(this.lastTime);
    }
    stop() {
        if (this.animationFrameId != null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    isKeyPressed(key) {
        return this.keys.has(key.toLowerCase());
    }
    setupInputHandlers(enablePointerLock) {
        window.addEventListener("keydown", (event) => this.keys.add(event.key.toLowerCase()));
        window.addEventListener("keyup", (event) => this.keys.delete(event.key.toLowerCase()));
        if (enablePointerLock) {
            this.canvas.addEventListener("click", () => {
                this.canvas.requestPointerLock();
            });
            document.addEventListener("mousemove", (event) => {
                if (document.pointerLockElement !== this.canvas)
                    return;
                this.cameraYaw -= event.movementX * this.mouseSensitivity;
                this.cameraPitch -= event.movementY * this.mouseSensitivity;
                this.cameraPitch = Math.max(Math.min(this.cameraPitch, Math.PI / 2 - 0.1), -Math.PI / 2 + 0.1);
            });
        }
    }
    resizeCanvas() {
        const width = Math.floor(this.canvas.clientWidth);
        const height = Math.floor(this.canvas.clientHeight);
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
        this.cameraOptions.aspect = width / height;
    }
    updateCamera(deltaTime) {
        const right = Vec3.normalize(Vec3.cross(this.cameraForward, this.cameraUp));
        let movement = new Vec3(0);
        const step = this.moveSpeed * deltaTime;
        if (this.keys.has("w")) {
            movement = Vec3.add(movement, this.cameraForward.scale(step));
        }
        if (this.keys.has("s")) {
            movement = Vec3.add(movement, this.cameraForward.scale(-step));
        }
        if (this.keys.has("a")) {
            movement = Vec3.add(movement, right.scale(-step));
        }
        if (this.keys.has("d")) {
            movement = Vec3.add(movement, right.scale(step));
        }
        if (this.keys.has("e")) {
            movement = Vec3.add(movement, this.cameraUp.scale(step));
        }
        if (this.keys.has("q")) {
            movement = Vec3.add(movement, this.cameraUp.scale(-step));
        }
        const nextPos = Vec3.add(this.cameraPosition, movement);
        this.cameraPosition.copyFrom(nextPos);
        const lookTarget = Vec3.add(this.cameraPosition, this.cameraForward);
        this.cameraTarget.copyFrom(lookTarget);
        this.cameraOptions.position.copyFrom(this.cameraPosition);
        this.cameraOptions.target.copyFrom(this.cameraTarget);
        this.cameraOptions.up.copyFrom(this.cameraUp);
    }
    animate = (time) => {
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;
        this.resizeCanvas();
        this.updateCamera(deltaTime);
        if (this.updateCallback) {
            this.updateCallback(deltaTime, time);
        }
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        for (const renderClass of this.renderClasses) {
            renderClass.draw(this.cameraOptions);
        }
        this.animationFrameId = requestAnimationFrame(this.animate);
    };
}
