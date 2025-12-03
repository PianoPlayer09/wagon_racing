import { Vec3 } from "../math";

// https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline

export function catmullRom(
  controlPoints: Vec3[],
  samplesPerSegment: number,
): Vec3[] {
  if (controlPoints.length < 2) return [];
  const sampled: Vec3[] = [];
  const total = controlPoints.length;

  for (let i = 1; i < total - 2; i++) {
    const p0 = controlPoints[i - 1];
    const p1 = controlPoints[i];
    const p2 = controlPoints[i + 1];
    const p3 = controlPoints[i + 2];

    catmullRomSegment(p0, p1, p2, p3, sampled, samplesPerSegment);
  }

  return sampled;
}

function catmullRomSample(
  p0: Vec3,
  p1: Vec3,
  p2: Vec3,
  p3: Vec3,
  t: number,
  alpha = 0.5,
): Vec3 {
  const k0 = 0;
  const k1 = k0 + Math.pow(Vec3.distance(p0, p1), alpha);
  const k2 = k1 + Math.pow(Vec3.distance(p1, p2), alpha);
  const k3 = k2 + Math.pow(Vec3.distance(p2, p3), alpha);

  const t2 = k1 + t * (k2 - k1);

  const a1 = remap(p0, p1, t2, k0, k1);
  const a2 = remap(p1, p2, t2, k1, k2);
  const a3 = remap(p2, p3, t2, k2, k3);

  const b1 = remap(a1, a2, t2, k0, k2);
  const b2 = remap(a2, a3, t2, k1, k3);

  return remap(b1, b2, t2, k1, k2);
}

function catmullRomSegment(
  p0: Vec3,
  p1: Vec3,
  p2: Vec3,
  p3: Vec3,
  out: Vec3[],
  resolution: number,
  alpha = 0.5,
) {
  const k0 = 0;
  const k1 = k0 + Math.pow(Vec3.distance(p0, p1), alpha);
  const k2 = k1 + Math.pow(Vec3.distance(p1, p2), alpha);
  const k3 = k2 + Math.pow(Vec3.distance(p2, p3), alpha);

  for (let sample = 0; sample < resolution; sample++) {
    const t = k1 + (sample / resolution) * (k2 - k1);

    const a1 = remap(p0, p1, t, k0, k1);
    const a2 = remap(p1, p2, t, k1, k2);
    const a3 = remap(p2, p3, t, k2, k3);

    const b1 = remap(a1, a2, t, k0, k2);
    const b2 = remap(a2, a3, t, k1, k3);

    out.push(remap(b1, b2, t, k1, k2));
  }
}

function remap(a: Vec3, b: Vec3, t: number, t0: number, t1: number): Vec3 {
  const weight = (t - t0) / (t1 - t0);
  return new Vec3(
    a.x + (b.x - a.x) * weight,
    a.y + (b.y - a.y) * weight,
    a.z + (b.z - a.z) * weight,
  );
}
