import { Mesh } from "./Mesh.js";
import { Shader } from "./Shader.js";
import { RenderInstance } from "./RenderInstance.js";
import { CameraOptions, Mat4 } from "./math.js";
import { STATELESS_BINDS } from "./index.js";

export class RenderClass {
  private readonly gl: WebGL2RenderingContext;
  private readonly mesh: Mesh;
  private readonly shader: Shader;
  private readonly vao: WebGLVertexArrayObject;
  private readonly instanceBuffer: WebGLBuffer;
  private readonly instanceStrideBytes = 19 * 4; // mat4 (16) + color (3)
  private instances: RenderInstance[] = [];

  constructor(gl: WebGL2RenderingContext, mesh: Mesh, shader: Shader) {
    this.gl = gl;
    this.mesh = mesh;
    this.shader = shader;

    const vao = gl.createVertexArray();
    const instanceBuffer = gl.createBuffer();
    if (!vao || !instanceBuffer) {
      throw new Error("Failed to create VAO or instance buffer");
    }
    this.vao = vao;
    this.instanceBuffer = instanceBuffer;

    this.setupVertexArray();
  }

  createInstance(instance?: RenderInstance): RenderInstance {
    const inst = instance ?? new RenderInstance();
    this.instances.push(inst);
    return inst;
  }

  removeInstance(instance: RenderInstance): void {
    this.instances = this.instances.filter((i) => i !== instance);
  }

  clearInstances(): void {
    this.instances = [];
  }

  draw(camera: CameraOptions): void {
    const count = this.instances.length;
    if (count === 0) return;

    const gl = this.gl;
    this.shader.use();
    const viewProjection = Mat4.viewProjectionFromOptions(camera);
    this.shader.uniformMat4("uViewProj", viewProjection);

    const data = new Float32Array(count * 19);
    let offset = 0;
    for (const instance of this.instances) {
      this.writeMatrixToInstanceBuffer(data, offset, instance.modelMatrix);
      offset += 16;
      data.set(instance.color.elements, offset);
      offset += 3;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

    gl.bindVertexArray(this.vao);
    this.mesh.drawInstanced(count);
    if (STATELESS_BINDS) gl.bindVertexArray(null);
  }

  private setupVertexArray(): void {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);

    const positionLocation = this.shader.getAttribLocation("aPosition");
    this.mesh.configureVertexAttributes(positionLocation);

    const modelBaseLocation = this.shader.getAttribLocation("aModel");
    const colorLocation = this.shader.getAttribLocation("aInstanceColor");

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    for (let i = 0; i < 4; i++) {
      const loc = modelBaseLocation + i;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(
        loc,
        4,
        gl.FLOAT,
        false,
        this.instanceStrideBytes,
        i * 16,
      );
      gl.vertexAttribDivisor(loc, 1);
    }

    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(
      colorLocation,
      3,
      gl.FLOAT,
      false,
      this.instanceStrideBytes,
      16 * 4,
    );
    gl.vertexAttribDivisor(colorLocation, 1);

    gl.bindVertexArray(null);
    if (STATELESS_BINDS) gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  // packs row-major matrix into column-major buffer
  private writeMatrixToInstanceBuffer(
    buffer: Float32Array,
    offset: number,
    matrix: Mat4,
  ): void {
    const elements = matrix.elements;
    for (let column = 0; column < 4; column += 1) {
      for (let row = 0; row < 4; row += 1) {
        buffer[offset++] = elements[row * 4 + column];
      }
    }
  }
}
