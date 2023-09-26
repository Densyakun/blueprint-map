import { Vector3 } from "three";
import { ClippedPolyhedronGeometry, isTouchingTriangle } from "./ClippedPolyhedronGeometry";
import { BBox } from "./location";

const t = (1 + Math.sqrt(5)) / 2;

export class ClippedIcosahedronGeometry extends ClippedPolyhedronGeometry {
  constructor(radius = 1, detail = 0, bbox: BBox) {
    let vertices = [
      - 1, t, 0, 1, t, 0, - 1, - t, 0, 1, - t, 0,
      0, - 1, t, 0, 1, t, 0, - 1, - t, 0, 1, - t,
      t, 0, - 1, t, 0, 1, - t, 0, - 1, - t, 0, 1
    ];

    // 球面三角形のbboxの計算を効率化するため、極地に頂点が来るように回転する
    const angle = Math.atan2(1, t);
    const axis = new Vector3(0, 0, 1);
    for (let i = 0; i < vertices.length; i += 3) {
      const v = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
      v.applyAxisAngle(axis, angle);
      vertices[i] = v.x;
      vertices[i + 1] = v.y;
      vertices[i + 2] = v.z;
    }

    let indices = [
      0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
      1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
      3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
      4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
    ];

    // Clipping a icosahedron
    for (let i = 0; i < indices.length; i += 3) {
      const v0 = new Vector3(vertices[indices[i] * 3], vertices[indices[i] * 3 + 1], vertices[indices[i] * 3 + 2]);
      const v1 = new Vector3(vertices[indices[i + 1] * 3], vertices[indices[i + 1] * 3 + 1], vertices[indices[i + 1] * 3 + 2]);
      const v2 = new Vector3(vertices[indices[i + 2] * 3], vertices[indices[i + 2] * 3 + 1], vertices[indices[i + 2] * 3 + 2]);

      if (!isTouchingTriangle(v0, v1, v2, bbox))
        indices[i] = indices[i + 1] = indices[i + 2] = -1;
    }
    indices = indices.filter(value => 0 <= value);

    super(vertices, indices, radius, detail, bbox);
  }
}