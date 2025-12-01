import { STATELESS_BINDS } from "./index";

export class Mesh {
  private gl: WebGL2RenderingContext;
  private vertexBuffer: WebGLBuffer;
  private indexBuffer: WebGLBuffer;
  private indexCount: number;

  constructor(
    gl: WebGL2RenderingContext,
    positions: Float32Array | number[],
    indices: Uint32Array | number[],
  ) {
    this.gl = gl;
    this.indexCount = indices.length;

    this.vertexBuffer = this.createVertexBuffer(positions);
    this.indexBuffer = this.createIndexBuffer(indices);
  }

  private createVertexBuffer(positions: Float32Array | number[]): WebGLBuffer {
    const gl = this.gl;
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const posArray =
      positions instanceof Float32Array
        ? positions
        : new Float32Array(positions);
    gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.STATIC_DRAW);
    if (STATELESS_BINDS) gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buffer;
  }

  private createIndexBuffer(indices: Uint32Array | number[]) {
    const gl = this.gl;

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    const indexArray =
      indices instanceof Uint32Array ? indices : new Uint32Array(indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
    if (STATELESS_BINDS) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return buffer;
  }

  bind(): void {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

  static unbind(gl: WebGL2RenderingContext): void {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  drawInstanced(instanceCount: number): void {
    if (instanceCount == 0) return;
    const gl = this.gl;
    this.bind()
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      this.indexCount,
      gl.UNSIGNED_INT,
      0,
      instanceCount,
    );
    if (STATELESS_BINDS) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
  }
}
