import { Vector3 } from "three";
import { ClippedPolyhedronGeometry } from "./ClippedPolyhedronGeometry";
import { BBox, getLat, getLon } from "./location";

const t = (1 + Math.sqrt(5)) / 2;

const getWestAndEast = (lat0: number, lon0: number, lat1: number, lon1: number, lat2: number, lon2: number) => {
  let _lon0 = lon0;
  let _lon1 = lon1;
  let _lon2 = lon2;

  if (lat0 === -90 || lat0 === 90)
    _lon0 = lon1;
  else if (lat1 === -90 || lat1 === 90)
    _lon1 = lon0;
  else if (lat2 === -90 || lat2 === 90)
    _lon2 = lon0;

  const c = _lon0 < _lon1;
  const d = _lon0 < _lon2;

  const a = Math.abs(_lon1 - _lon0) < 180;
  const b = Math.abs(_lon2 - _lon0) < 180;

  _lon1 = a ? _lon1 : c ? _lon1 - 360 : _lon1 + 360;
  _lon2 = b ? _lon2 : d ? _lon2 - 360 : _lon2 + 360;

  const west = Math.min(_lon0, _lon1, _lon2);
  const east = Math.max(_lon0, _lon1, _lon2);

  return [west - Math.floor((west + 180) / 360) * 360, east - Math.floor((east + 180) / 360) * 360];
}

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

      const lat0 = getLat(v0);
      const lat1 = getLat(v1);
      const lat2 = getLat(v2);
      const south = Math.min(lat0, lat1, lat2);
      const north = Math.max(lat0, lat1, lat2);
      if (south > bbox.north || bbox.south > north) {
        indices[i] = indices[i + 1] = indices[i + 2] = -1;
        continue;
      }

      if (bbox.west === bbox.east)
        continue;

      const lon0 = getLon(v0);
      const lon1 = getLon(v1);
      const lon2 = getLon(v2);
      const [west, east] = getWestAndEast(lat0, lon0, lat1, lon1, lat2, lon2);
      const e = west <= east;
      const f = bbox.west <= bbox.east;
      if (f
        ? e
          ? west > bbox.east || bbox.west > east
          : west > bbox.east && bbox.west > east
        : e
          ? west > bbox.east && bbox.west > east
          : false)
        indices[i] = indices[i + 1] = indices[i + 2] = -1;
    }
    indices = indices.filter(value => 0 <= value);

    super(vertices, indices, radius, detail, bbox);

    // Clipping a subdivided mesh
    /*for (let i = 0; i < vertices.length; i += 3) {
      const v = new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);

      const lat = getLat(v);
      const lon = getLon(v);
      if (bbox.south) {
        for (let i1 = 0; i1 < indices.length; i1 += 3) {
          if (indices[i1] * 3 === i ||
            indices[i1 + 1] * 3 === i ||
            indices[i1 + 2] * 3 === i)
            indices[i1] = indices[i1 + 1] = indices[i1 + 2] = -1;
        }
      }
    }
    indices = indices.filter(value => 0 <= value);*/

    // Remove unused vertices
    /*vertices.forEach(value => {
      indices.forEach(_, index) => {
        if (index)
      }
    })*/
    //vertices = vertices.filter((_, index) => indices.includes(index));
  }
}