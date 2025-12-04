import { Mat4, Vec3, CameraOptions } from "../math";
import { RenderClass } from "./RenderClass";

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  clearColor?: [number, number, number, number];
  fov?: number;
  near?: number;
  far?: number;
  moveSpeed?: number;
  mouseSensitivity?: number;
  enablePointerLock?: boolean;
}

export class Renderer {
  readonly gl: WebGL2RenderingContext;
  readonly canvas: HTMLCanvasElement;
  readonly cameraOptions: CameraOptions;

  private renderClasses: Set<RenderClass<any, any>> = new Set();
  private keys: Set<string> = new Set();
  private lastTime: number = performance.now();
  private animationFrameId: number | null = null;

  private cameraPosition: Vec3;
  private cameraTarget: Vec3;
  private cameraUp: Vec3;
  private cameraYaw: number = 0.0;
  private cameraPitch: number = 0.0;

  private moveSpeed: number;
  private mouseSensitivity: number;

  private updateCallback?: (deltaTime: number, time: number) => void;
  private height: number = 0;
  private width: number = 0;

  private cameraMode: 'flycam' | 'follow' = 'flycam';
  private followTarget?: Vec3;
  private followTargetRotation?: number;
  private followDistance: number = 10;
  private followHeight: number = 5;
  private followSmoothness: number = 5;

  constructor(options: RendererOptions) {
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

    this.cameraOptions = new CameraOptions(
      this.cameraPosition.clone(),
      this.cameraTarget.clone(),
      this.cameraUp.clone(),
      options.fov ?? (60 * Math.PI) / 180,
      this.canvas.clientWidth / this.canvas.clientHeight,
      options.near ?? 0.1,
      options.far ?? 500,
    );

    this.moveSpeed = options.moveSpeed ?? 15;
    this.mouseSensitivity = options.mouseSensitivity ?? 0.002;

    this.setupInputHandlers(options.enablePointerLock ?? true);
  }

  get cameraForward(): Vec3 {
    return new Mat4()
      .rotateY(this.cameraPitch)
      .rotateZ(this.cameraYaw)
      .multiplyVec(new Vec3(1, 0, 0));
  }

  addRenderClass(renderClass: RenderClass<any, any>): void {
    this.renderClasses.add(renderClass);
  }
  removeRenderClass(renderClass: RenderClass<any, any>): void {
    this.renderClasses.delete(renderClass);
  }

  onUpdate(callback: (deltaTime: number, time: number) => void): void {
    this.updateCallback = callback;
  }

  setFollowTarget(position: Vec3, rotation: number): void {
    this.followTarget = position;
    this.followTargetRotation = rotation;
    this.cameraMode = 'follow';
  }

  toggleCameraMode(): void {
    this.cameraMode = this.cameraMode === 'flycam' ? 'follow' : 'flycam';
    console.log(`Camera mode switched to: ${this.cameraMode}`);
  }

  isFollowMode(): boolean {
    return this.cameraMode === 'follow';
  }

  start(): void {
    this.lastTime = performance.now();
    this.animate(this.lastTime);
  }

  stop(): void {
    if (this.animationFrameId != null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  isKeyPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  private setupInputHandlers(enablePointerLock: boolean): void {
    window.addEventListener("keydown", (event) =>
      this.keys.add(event.key.toLowerCase()),
    );
    window.addEventListener("keyup", (event) =>
      this.keys.delete(event.key.toLowerCase()),
    );

    if (enablePointerLock) {
      this.canvas.addEventListener("click", () => {
        this.canvas.requestPointerLock();
      });

      document.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement !== this.canvas) return;
        this.cameraYaw -= event.movementX * this.mouseSensitivity;
        this.cameraPitch -= event.movementY * this.mouseSensitivity;
        this.cameraPitch = Math.max(
          Math.min(this.cameraPitch, Math.PI / 2 - 0.1),
          -Math.PI / 2 + 0.1,
        );
      });
    }
  }

  private resizeCanvas(): void {
    const width = Math.floor(this.canvas.clientWidth);
    const height = Math.floor(this.canvas.clientHeight);

    if (this.width != width || this.height != height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
      this.cameraOptions.aspect = width / height;
      this.width = width;
      this.height = height;
    }
  }

  private updateCamera(deltaTime: number): void {
    if (this.keys.has("c")) {
      this.toggleCameraMode();
      this.keys.delete("c");
    }

    if (this.cameraMode === 'follow') {
      this.updateFollowCamera(deltaTime);
    } else {
      this.updateFlyCamera(deltaTime);
    }
  }

  private updateFlyCamera(deltaTime: number): void {
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

  private updateFollowCamera(deltaTime: number): void {
    if (!this.followTarget || this.followTargetRotation === undefined) {
      return;
    }

    const targetX = this.followTarget.x - Math.cos(this.followTargetRotation) * this.followDistance;
    const targetY = this.followTarget.y - Math.sin(this.followTargetRotation) * this.followDistance;
    const targetZ = this.followHeight;

    const targetPosition = new Vec3(targetX, targetY, targetZ);
    this.cameraPosition.x += (targetPosition.x - this.cameraPosition.x) * this.followSmoothness * deltaTime;
    this.cameraPosition.y += (targetPosition.y - this.cameraPosition.y) * this.followSmoothness * deltaTime;
    this.cameraPosition.z += (targetPosition.z - this.cameraPosition.z) * this.followSmoothness * deltaTime;

    this.cameraTarget.copyFrom(this.followTarget);

    this.cameraOptions.position.copyFrom(this.followSmoothness==0 ? targetPosition : this.cameraPosition);
    this.cameraOptions.target.copyFrom(this.cameraTarget);
    this.cameraOptions.up.copyFrom(this.cameraUp);
  }

  private animate = (time: number): void => {
    const deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.resizeCanvas();

    if (this.updateCallback) {
      this.updateCallback(deltaTime, time);
    }

    this.updateCamera(deltaTime);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    for (const renderClass of this.renderClasses) {
      renderClass.draw(this.cameraOptions);
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}
