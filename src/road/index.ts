import { Vec3 } from "../math";
import { catmullRom } from "./curve";
import { buildRoadMesh } from "./mesh";

export const DEFAULT_OPTIONS: ProceduralRoadOptions = {
  controlPointCount: 12,
  baseRadius: 50,
  radiusVariance: 0.1,
  elevationRange: 0,
  width: 2,
  depth: 0,
  samplesPerSegment: 24,
  controlPoints: undefined
};

export interface ProceduralRoadOptions {
  controlPointCount: number;
  baseRadius: number;
  radiusVariance: number;
  elevationRange: number;
  width: number;
  depth: number;
  samplesPerSegment: number;
  controlPoints: Vec3[] | undefined
}

export interface ProceduralRoad {
  positions: Float32Array;
  indices: Uint32Array;
  centerline: Vec3[];
  control_points: Vec3[];
  width: number
}

export function generateRoad(
  centerline: Vec3[],
  width: number,
  depth: number
): ProceduralRoad {
  const { positions, indices } = buildRoadMesh(
    centerline,
    width,
    depth
  );

  return {
    positions,
    indices,
    centerline,
    control_points: centerline,
    width
  };
}

export function generateProceduralRoad(
  opts: ProceduralRoadOptions 
): ProceduralRoad {
  const controlPoints = opts.controlPoints ? opts.controlPoints : createControlPoints(opts);

  const centerline = catmullRom(
    controlPoints,
    opts.samplesPerSegment,
  );

  const { positions, indices } = buildRoadMesh(
    centerline,
    opts.width,
    opts.depth
  );

  return {
    positions,
    indices,
    centerline,
    control_points: controlPoints,
    width: opts.width
  };
}

export function collideRoad(
  road: ProceduralRoad,
  p: Vec3
): boolean {
  return !! road.centerline.find(x => Vec3.distance(x,p) < road.width)
}

export function createControlPoints(
  options: ProceduralRoadOptions,
): Vec3[] {
  const points: Vec3[] = [];
  const step = (Math.PI * 2) / options.controlPointCount;

  for (let i = 0; i < options.controlPointCount; i += 1) {
    const angle = i * step;
    const radius =
      options.baseRadius *
      (1 + (Math.random() * 2 - 1) * options.radiusVariance);
    const z = (Math.random() * 2 - 1) * options.elevationRange;

    points.push(
      new Vec3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        z,
      ),
    );
  }

  return points;
}
