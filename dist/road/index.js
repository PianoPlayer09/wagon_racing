import { Vec3 } from "../math";
import { catmullRom } from "./curve";
import { buildRoadMesh } from "./mesh";
const DEFAULT_OPTIONS = {
    controlPointCount: 12,
    baseRadius: 40,
    radiusVariance: 0.35,
    elevationRange: 2,
    width: 6,
    depth: 2,
    samplesPerSegment: 24,
};
export function generateRoad(centerline, width, depth) {
    const { positions, indices } = buildRoadMesh(centerline, width, depth);
    return {
        positions,
        indices,
        centerline
    };
}
export function generateProceduralRoad(opts) {
    const controlPoints = createControlPoints(opts);
    const centerline = catmullRom(controlPoints, opts.samplesPerSegment);
    const { positions, indices } = buildRoadMesh(centerline, opts.width, opts.depth);
    return {
        positions,
        indices,
        centerline,
    };
}
function createControlPoints(options) {
    const points = [];
    const step = (Math.PI * 2) / options.controlPointCount;
    for (let i = 0; i < options.controlPointCount; i += 1) {
        const angle = i * step;
        const radius = options.baseRadius *
            (1 + (Math.random() * 2 - 1) * options.radiusVariance);
        const z = (Math.random() * 2 - 1) * options.elevationRange;
        points.push(new Vec3(Math.cos(angle) * radius, Math.sin(angle) * radius, z));
    }
    return points;
}
