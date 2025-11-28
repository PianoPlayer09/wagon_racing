import { CameraOptions, Mat4, Vec3, Vec3Like } from "../math";
import { RenderInstance } from "../RenderInstance";
import { RenderClass } from "../RenderClass";
import { Shader } from "../Shader";

export class UnlitSolidInstance extends RenderInstance {
  color: Vec3;
  constructor(
    translation: Vec3Like = [0, 0, 0],
    rotation: Vec3Like = [0, 0, 0],
    scale: Vec3Like = [1, 1, 1],
    color: Vec3Like = [1, 1, 1],
  ) {
    super(translation, rotation, scale);
    this.color = Vec3.from(color);
  }
}

export class UnlitSolidClass extends RenderClass<
  CameraOptions,
  UnlitSolidInstance
> {
  instanceFloats() {
    return 16 + 3;
  }

  createShader() {
    const vertexSource = `#version 300 es
    precision highp float;
    layout(location = 0) in vec3 aPosition;
    in mat4 aModel;
    in vec3 aInstanceColor;
    uniform mat4 uViewProj;
    out vec3 vColor;
    void main() {
      vColor = aInstanceColor;
      gl_Position = uViewProj * aModel * vec4(aPosition, 1.0);
    }`;

    const fragmentSource = `#version 300 es
    precision highp float;
    in vec3 vColor;
    out vec4 fragColor;
    void main() {
      fragColor = vec4(vColor, 1.0);
    }`;

    return new Shader(this.gl, vertexSource, fragmentSource);
  }

  newInstance(): UnlitSolidInstance {
    return new UnlitSolidInstance();
  }

  setupVertexAttribs(): void {
    const gl = this.gl;
    const posAttrib = this.shader.getAttribLocation("aPosition");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 3 * 4, 0);
  }

  setupInstanceAttribs(): void {
    const gl = this.gl;
    const instanceFloats = this.instanceFloats();
    const modelAttrib = this.shader.getAttribLocation("aModel");
    const colorAttrib = this.shader.getAttribLocation("aInstanceColor");

    for (let i = 0; i < 4; i++) {
      const loc = modelAttrib + i;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(
        loc,
        4,
        gl.FLOAT,
        false,
        instanceFloats * 4,
        i * 16,
      );
      gl.vertexAttribDivisor(loc, 1);
    }

    gl.enableVertexAttribArray(colorAttrib);
    gl.vertexAttribPointer(
      colorAttrib,
      3,
      gl.FLOAT,
      false,
      instanceFloats * 4,
      16 * 4,
    );
    gl.vertexAttribDivisor(colorAttrib, 1);
  }

  setUniforms(camera: CameraOptions): void {
    let viewProj = Mat4.viewProjectionFromOptions(camera);
    this.shader.uniformMat4("uViewProj", viewProj);
  }

  pack(instance: UnlitSolidInstance, data: Float32Array, offset: number): void {
    this.writeMatrixToInstanceBuffer(data, offset, instance.modelMatrix);
    data.set(instance.color.elements, offset + 16);
  }

  // packs row-major matrix into column-major buffer
  private writeMatrixToInstanceBuffer(
    buffer: Float32Array,
    offset: number,
    matrix: Mat4,
  ): void {
    const elements = matrix.elements;
    let i = 0;
    for (let column = 0; column < 4; column++) {
      for (let row = 0; row < 4; row++) {
        buffer[offset + i] = elements[row * 4 + column];
        i++;
      }
    }
  }
}
