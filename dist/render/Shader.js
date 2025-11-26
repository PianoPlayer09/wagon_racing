export class Shader {
    gl;
    program;
    uniformLocations = new Map();
    constructor(gl, vertexSource, fragmentSource) {
        this.gl = gl;
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
        const program = gl.createProgram();
        if (!program) {
            throw new Error("Unable to create shader program");
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Program link error: ${info}`);
        }
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        this.program = program;
    }
    static createDefault(gl) {
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
        return new Shader(gl, vertexSource, fragmentSource);
    }
    use() {
        this.gl.useProgram(this.program);
    }
    getAttribLocation(name) {
        return this.gl.getAttribLocation(this.program, name);
    }
    getUniformLocation(name) {
        if (this.uniformLocations.has(name)) {
            return this.uniformLocations.get(name) ?? null;
        }
        const loc = this.gl.getUniformLocation(this.program, name);
        this.uniformLocations.set(name, loc);
        return loc;
    }
    uniformMat4(name, value) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            const columnMajor = value.transpose();
            this.gl.uniformMatrix4fv(loc, false, columnMajor.elements);
        }
    }
    uniformVec3(name, value) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            this.gl.uniform3fv(loc, value.elements);
        }
    }
    uniformFloat(name, value) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            this.gl.uniform1f(loc, value);
        }
    }
    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        if (!shader) {
            throw new Error("Unable to create shader");
        }
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(`Shader compile error: ${info ?? "unknown"}`);
        }
        return shader;
    }
}
