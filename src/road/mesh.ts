import { Vec3 } from "../math";

export function buildRoadMesh(
  polyline: Vec3[],
  width: number,
  depth: number,
  closed: boolean = false,
): { positions: Float32Array; indices: Uint32Array } {
  const roadVerticesSlice = [
    new Vec3(0, -width, 0),
    new Vec3(0, width, 0),
    // new Vec3(0, width, -depth),
    // new Vec3(0, -width, -depth),
  ];

  const nextSlice = roadVerticesSlice.length;

  // prettier-ignore
  const roadIndicesSlice = [
    //top
    nextSlice + 1, 1, 0,
    nextSlice, nextSlice + 1, 0,

    // //right
    // 2, 1, nextSlice + 1,
    // 2, nextSlice + 2, nextSlice + 1,
    //
    // //left
    // 3, 0, nextSlice + 0,
    // nextSlice + 0, nextSlice + 3, 3,
  ];

  const vertices: number[] = [];
  const indices: number[] = [];

  const count = polyline.length;

  const halfWidth = width / 2;
  for (let i = 0; i < count; i += 1) {
    let prevIndex = i - 1;
    let nextIndex = i + 1;

    if (prevIndex < 0) {
      if (closed) {
        prevIndex = count - 1;
      } else {
        prevIndex = 0;
        nextIndex = 1;
      }
    }
    if (nextIndex > count - 1) {
      if (closed) {
        nextIndex = 0;
      } else {
        prevIndex = i - 1;
        nextIndex = i;
      }
    }

    const tangent = Vec3.normalize(
      Vec3.subtract(polyline[prevIndex], polyline[nextIndex]),
    );

    // const tangent = new Vec3(1, 0, 0);
    // const binormal = Vec3.normalize(Vec3.cross(new Vec3(0, 0, 1), tangent));
    // const normal = Vec3.cross(binormal, tangent);
    const normal = Vec3.cross(tangent, new Vec3(0, 0, 1));
    // const normal = new Vec3(0, 1, 0);

    for (let v of roadVerticesSlice) {
      let transformed = polyline[i];

      transformed = Vec3.add(transformed, tangent.scale(v.x));
      transformed = Vec3.add(transformed, normal.scale(v.y));
      vertices.push(transformed.x, transformed.y, transformed.z);
    }
  }

  for (let offset = 0; offset < nextSlice * (count - 1); offset += nextSlice) {
    indices.push(...roadIndicesSlice.map((x) => x + offset));
  }

  console.log(vertices);
  console.log(indices);

  return {
    positions: new Float32Array(vertices),
    indices: new Uint32Array(indices),
  };
}
