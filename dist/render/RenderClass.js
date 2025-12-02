import { Mesh } from "./Mesh";
import { STATELESS_BINDS } from "./index";
export class RenderClass {
    gl;
    mesh;
    shader;
    vao;
    instanceBuffer;
    instances = [];
    instanceData = new Float32Array(0);
    constructor(gl, mesh) {
        this.gl = gl;
        this.mesh = mesh;
        gl.cullFace(gl.FRONT_AND_BACK);
        gl.disable(gl.CULL_FACE);
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
        this.adjustInstanceBufferSize();
        let offset = 0;
        for (const instance of this.instances) {
            this.pack(instance, this.instanceData, offset);
            offset += instanceFloats;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.instanceData.subarray(0, count * instanceFloats));
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
    adjustInstanceBufferSize() {
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
            if (STATELESS_BINDS)
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    }
}
