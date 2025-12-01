import { Mesh } from "./Mesh";
import { Shader } from "./Shader";
import { RenderInstance } from "./RenderInstance";
import { Mat4 } from "../math";
import { STATELESS_BINDS } from "./index";

export abstract class RenderClass<Uniform, Instance extends RenderInstance> {
  protected readonly gl: WebGL2RenderingContext;
  protected readonly mesh: Mesh;
  protected readonly shader: Shader;
  private readonly vao: WebGLVertexArrayObject;
  private readonly instanceBuffer: WebGLBuffer;
  private instances: Instance[] = [];
  private instanceData = new Float32Array(0);

  constructor(gl: WebGL2RenderingContext, mesh: Mesh) {
    this.gl = gl;
    this.mesh = mesh;

    this.shader = this.createShader();
    const vao = gl.createVertexArray();
    const instanceBuffer = gl.createBuffer();
    if (!vao || !instanceBuffer) {
      throw new Error("Failed to create VAO or instance buffer");
    }
    this.vao = vao;
    this.instanceBuffer = instanceBuffer;

    this.setupVertexArray();
  }

  abstract createShader(): Shader;
  abstract setupVertexAttribs(): void;
  abstract setupInstanceAttribs(): void;
  abstract setUniforms(data: Uniform): void;
  abstract instanceFloats(): number;
  abstract pack(instance: Instance, data: Float32Array, offset: number): void;
  abstract newInstance(): Instance;

  createInstance(instance: Instance = this.newInstance()): Instance {
    this.instances.push(instance);
    return instance;
  }

  removeInstance(instance: Instance): void {
    this.instances.splice(this.instances.indexOf(instance), 1);
  }

  clearInstances(): void {
    this.instances = [];
  }

  draw(uniform: Uniform): void {
    const instanceFloats = this.instanceFloats();
    const count = this.instances.length;
    if (count === 0) return;

    const gl = this.gl;
    this.shader.use();
    this.setUniforms(uniform);

    this.adjustInstanceBufferSize();

    let offset = 0;
    for (const instance of this.instances) {
      this.pack(instance, this.instanceData, offset);
      offset += instanceFloats;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      0,
      this.instanceData.subarray(0, count * instanceFloats),
    );

    gl.bindVertexArray(this.vao);
    this.mesh.drawInstanced(count);
    if (STATELESS_BINDS) gl.bindVertexArray(null);
  }

  private setupVertexArray(): void {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);

    this.mesh.bind();
    this.setupVertexAttribs();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);

    this.setupInstanceAttribs();

    if (STATELESS_BINDS) {
      gl.bindVertexArray(null);
      Mesh.unbind(gl);
    }
  }

  private adjustInstanceBufferSize(): void {
    const gl = this.gl;
    const capacity = this.instanceData.length / this.instanceFloats();
    const used = this.instances.length;

    if (used > capacity || used < capacity * 0.25) {
      const newCapacity = Math.max(1, Math.ceil(used * 1.5));
      const floats = newCapacity * this.instanceFloats();
      const bytes = floats * 4;
      this.instanceData = new Float32Array(floats);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, bytes, gl.DYNAMIC_DRAW);
      if (STATELESS_BINDS) gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
  }
}
