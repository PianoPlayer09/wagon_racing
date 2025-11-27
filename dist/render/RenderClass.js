import { Mesh } from "./Mesh";
import { STATELESS_BINDS } from "./index";
export class RenderClass {
    gl;
    mesh;
    shader;
    vao;
    instanceBuffer;
    instances = [];
    constructor(gl, mesh) {
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
    createInstance(instance = this.newInstance()) {
        this.instances.push(instance);
        return instance;
    }
    removeInstance(instance) {
        this.instances.splice(this.instances.indexOf(instance), 1);
    }
    clearInstances() {
        this.instances = [];
    }
    draw(uniform) {
        const instanceFloats = this.instanceFloats();
        const count = this.instances.length;
        if (count === 0)
            return;
        const gl = this.gl;
        this.shader.use();
        this.setUniforms(uniform);
        //todo: reuse buffers
        const data = new Float32Array(count * instanceFloats);
        let offset = 0;
        for (const instance of this.instances) {
            this.pack(instance, data, offset);
            offset += instanceFloats;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
        gl.bindVertexArray(this.vao);
        this.mesh.drawInstanced(count);
        if (STATELESS_BINDS)
            gl.bindVertexArray(null);
    }
    setupVertexArray() {
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
}
