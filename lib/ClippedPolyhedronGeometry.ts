import { BufferGeometry, Float32BufferAttribute, Vector2, Vector3 } from "three";
import { BBox, getLat, getLon } from "./location";
import { getChunkWidthSegments, getChunkX, getChunkY } from "./terrain";

function getWestAndEast(latArray: number[], lonArray: number[]) {
  let _lonArray: number[] = [];

  lonArray.forEach((lon, index) => {
    const _lon = latArray[index] === -90 || latArray[index] === 90
      ? index === 0
        ? lonArray[1]
        : lonArray[0]
      : lon;

    _lonArray[index] = index === 0
      ? _lon
      : Math.abs(_lon - _lonArray[0]) < 180
        ? _lon
        : _lonArray[0] < _lon
          ? _lon - 360 : _lon + 360;
  });

  const west = Math.min(..._lonArray);
  const east = Math.max(..._lonArray);

  return [west - Math.floor((west + 180) / 360) * 360, east - Math.floor((east + 180) / 360) * 360];
}

export function isTouchingTriangle(a: Vector3, b: Vector3, c: Vector3, bbox: BBox) {
  const latA = getLat(a);
  const latB = getLat(b);
  const latC = getLat(c);
  const south = Math.min(latA, latB, latC);
  const north = Math.max(latA, latB, latC);
  if (south > bbox.north || bbox.south > north) return false;

  if (bbox.west === bbox.east) return true;

  const lonA = getLon(a);
  const lonB = getLon(b);
  const lonC = getLon(c);
  const [west, east] = getWestAndEast([latA, latB, latC], [lonA, lonB, lonC]);
  const d = west <= east;
  const e = bbox.west <= bbox.east;
  return e
    ? d
      ? west <= bbox.east && bbox.west <= east
      : west <= bbox.east || bbox.west <= east
    : d
      ? west <= bbox.east || bbox.west <= east
      : true;
}

function Cross(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

function getIntersectionS(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number) {
  const deno = Cross(bx - ax, by - ay, dx - cx, dy - cy);
  if (deno == 0.0) {
    // 線分が平行
    return;
  }
  const s = Cross(cx - ax, cy - ay, dx - cx, dy - cy) / deno;
  return s;
}

function getIntersectionLon(a: Vector3, b: Vector3, lonRad: number) {
  const lonX = Math.cos(lonRad);
  const lonZ = Math.sin(lonRad);

  return getIntersectionS(a.x, -a.z, b.x, -b.z, 0, 0, lonX, lonZ);
}

function getStartAndEndCol(cols: number, a: Vector3, b: Vector3, c: Vector3, bbox: BBox) {
  // クリッピングした三角形が複数に分かれる場合には非対応

  let startWest = 0;
  let endWest = 1;
  let startEast = 0;
  let endEast = 1;
  if (bbox.west !== bbox.east) {
    const lonA = Math.round(getLon(a) / 36) * 36;
    const lonB = Math.round(getLon(b) / 36) * 36;
    const lonC = Math.round(getLon(c) / 36) * 36;

    //const lonAB = lonB - lonA - Math.floor((lonB + 180 - lonA) / 360) * 360;
    const lonAC = lonC - lonA - Math.floor((lonC + 180 - lonA) / 360) * 360;
    //const lonBC = lonC - lonB - Math.floor((lonC + 180 - lonB) / 360) * 360;

    const westA = lonA - bbox.west - Math.floor((lonA + 180 - bbox.west) / 360) * 360;
    const westB = lonB - bbox.west - Math.floor((lonB + 180 - bbox.west) / 360) * 360;

    const bboxWestRad = bbox.west * Math.PI / 180;
    const sWestAC = getIntersectionLon(a, c, bboxWestRad);
    const sWestBC = getIntersectionLon(b, c, bboxWestRad);

    // TODO 範囲内に三角形の境界線がある場合、正しくクリッピングされない

    startWest = 0 <= westA === westB < 0
      ? 0
      : sWestAC !== undefined && 0 <= sWestAC && sWestAC <= 1 && sWestBC !== undefined && 0 <= sWestBC && sWestBC <= 1
        ? 0 <= lonAC
          ? Math.min(sWestAC, sWestBC)
          : 0
        : 0 <= westA
          ? 0
          : 1;
    endWest = sWestAC !== undefined && 0 <= sWestAC && sWestAC <= 1
      ? 0 <= lonAC
        ? 1
        : sWestBC !== undefined && 0 <= sWestBC && sWestBC <= 1
          ? Math.max(sWestAC, sWestBC)
          : sWestAC
      : sWestBC !== undefined && 0 <= sWestBC && sWestBC <= 1
        ? 0 <= lonAC
          ? 1
          : sWestBC
        : 0 <= westA
          ? 1
          : 0;

    const bboxEastRad = bbox.east * Math.PI / 180;
    const sEastAC = getIntersectionLon(a, c, bboxEastRad);
    const sEastBC = getIntersectionLon(b, c, bboxEastRad);

    const eastA = lonA - bbox.east - Math.floor((lonA + 180 - bbox.east) / 360) * 360;
    const eastB = lonB - bbox.east - Math.floor((lonB + 180 - bbox.east) / 360) * 360;

    startEast = 0 <= eastA === eastB < 0
      ? 0
      : sEastAC !== undefined && 0 <= sEastAC && sEastAC <= 1 && sEastBC !== undefined && 0 <= sEastBC && sEastBC <= 1
        ? 0 <= lonAC
          ? 0
          : Math.min(sEastAC, sEastBC)
        : eastA <= 0
          ? 0
          : 1;
    endEast = sEastAC !== undefined && 0 <= sEastAC && sEastAC <= 1
      ? 0 <= lonAC
        ? sEastBC !== undefined && 0 <= sEastBC && sEastBC <= 1
          ? Math.max(sEastAC, sEastBC)
          : sEastAC
        : 1
      : sEastBC !== undefined && 0 <= sEastBC && sEastBC <= 1
        ? 0 <= lonAC
          ? sEastBC
          : 1
        : eastA <= 0
          ? 1
          : 0;

    console.log(0 <= westA, eastA <= 0);
  }

  //console.log(startWest, endWest, startEast, endEast);

  return [Math.floor(Math.max(startWest, startEast) * cols), Math.ceil(Math.min(endWest, endEast) * cols)];
}

export class ClippedPolyhedronGeometry extends BufferGeometry {
  constructor(vertices: number[] = [], indices: number[] = [], radius = 1, detail = 0, bbox: BBox) {
    super();

    const vertexBuffer: number[] = [];
    const uvBuffer: number[] = [];

    // the subdivision creates the vertex buffer data
    subdivide(detail);

    // all vertices should lie on a conceptual sphere with a given radius
    applyRadius(radius);

    // finally, create the uv data
    generateUVs();

    // build non-indexed geometry
    this.setAttribute('position', new Float32BufferAttribute(vertexBuffer, 3));
    this.setAttribute('normal', new Float32BufferAttribute(vertexBuffer.slice(), 3));
    this.setAttribute('uv', new Float32BufferAttribute(uvBuffer, 2));

    if (detail === 0) {
      this.computeVertexNormals(); // flat normals
    } else {
      this.normalizeNormals(); // smooth normals
    }

    // helper functions
    function subdivide(detail: number) {
      const a = new Vector3();
      const b = new Vector3();
      const c = new Vector3();

      // iterate over all faces and apply a subdivision with the given detail value
      for (let i = 0; i < indices.length; i += 3) {
        // get the vertices of the face
        getVertexByIndex(indices[i + 0], a);
        getVertexByIndex(indices[i + 1], b);
        getVertexByIndex(indices[i + 2], c);

        // perform subdivision
        subdivideFace(a, b, c, detail);
      }
    }

    function getVerticesInChunk(v: Vector3[][], bbox: BBox) {
      const chunkY = getChunkY(bbox.south);
      const chunkX = getChunkX(bbox.west, getChunkWidthSegments(chunkY));

      let count = 0;
      v.forEach(array => array.forEach(v => {
        const chunkY1 = getChunkY(getLat(v));
        const chunkX1 = getChunkX(getLon(v), getChunkWidthSegments(chunkY1));
        if (chunkY1 === chunkY && chunkX1 === chunkX) count++;
      }))

      return count;
    }

    function subdivideFaceOld(a: Vector3, b: Vector3, c: Vector3, detail: number) {
      const cols = detail + 1;

      const v: Vector3[][] = [];

      for (let i = 0; i <= cols; i++) {
        v[i] = [];

        const aj = a.clone().lerp(c, i / cols);
        const bj = b.clone().lerp(c, i / cols);

        const rows = cols - i;

        for (let j = 0; j <= rows; j++) {
          if (j === 0 && i === cols) {
            v[i][j] = aj;
          } else {
            v[i][j] = aj.clone().lerp(bj, j / rows);
          }
        }
      }

      return getVerticesInChunk(v, bbox);
    }

    function subdivideFace(a: Vector3, b: Vector3, c: Vector3, detail: number) {
      const cols = detail + 1;

      // we use this multidimensional array as a data structure for creating the subdivision
      const v: Vector3[][] = [];

      let d = false;
      let [startCol, endCol] = getStartAndEndCol(cols, a, b, c, bbox);
      for (let i = startCol; i <= endCol; i++) {
        // construct all of the vertices for this subdivision
        v[i] = [];

        const aj = a.clone().lerp(c, i / cols);
        const bj = b.clone().lerp(c, i / cols);

        const rows = cols - i;

        for (let j = 0; j <= rows; j++) {
          if (j === 0 && i === cols) {
            v[i][j] = aj;
          } else {
            v[i][j] = aj.clone().lerp(bj, j / rows);
          }
        }

        // construct all of the faces
        if (i === startCol) continue;
        let e = false;
        for (let j = 0; j < 2 * (cols - (i - 1)) - 1; j++) {
          const k = Math.floor(j / 2);

          if (j % 2 === 0) {
            pushVertex(v[i - 1][k + 1]);
            pushVertex(v[i][k]);
            pushVertex(v[i - 1][k]);
          } else {
            pushVertex(v[i - 1][k + 1]);
            pushVertex(v[i][k + 1]);
            pushVertex(v[i][k]);
          }
        }

        if (d && !e)
          break;
        d = e;
      }

      // TODO 経度のクリッピングだけでも、場所によって正しくクリッピングされない

      console.log(getVerticesInChunk(v, bbox) === subdivideFaceOld(a, b, c, detail));
    }

    function applyRadius(radius: number) {
      const vertex = new Vector3();

      // iterate over the entire buffer and apply the radius to each vertex
      for (let i = 0; i < vertexBuffer.length; i += 3) {
        vertex.x = vertexBuffer[i + 0];
        vertex.y = vertexBuffer[i + 1];
        vertex.z = vertexBuffer[i + 2];

        vertex.normalize().multiplyScalar(radius);

        vertexBuffer[i + 0] = vertex.x;
        vertexBuffer[i + 1] = vertex.y;
        vertexBuffer[i + 2] = vertex.z;
      }
    }

    function generateUVs() {
      const vertex = new Vector3();

      for (let i = 0; i < vertexBuffer.length; i += 3) {
        vertex.x = vertexBuffer[i + 0];
        vertex.y = vertexBuffer[i + 1];
        vertex.z = vertexBuffer[i + 2];

        const u = azimuth(vertex) / 2 / Math.PI + 0.5;
        const v = inclination(vertex) / Math.PI + 0.5;
        uvBuffer.push(u, 1 - v);
      }

      correctUVs();

      correctSeam();
    }

    function correctSeam() {
      // handle case when face straddles the seam, see #3269
      for (let i = 0; i < uvBuffer.length; i += 6) {
        // uv data of a single face
        const x0 = uvBuffer[i + 0];
        const x1 = uvBuffer[i + 2];
        const x2 = uvBuffer[i + 4];

        const max = Math.max(x0, x1, x2);
        const min = Math.min(x0, x1, x2);

        // 0.9 is somewhat arbitrary
        if (max > 0.9 && min < 0.1) {
          if (x0 < 0.2) uvBuffer[i + 0] += 1;
          if (x1 < 0.2) uvBuffer[i + 2] += 1;
          if (x2 < 0.2) uvBuffer[i + 4] += 1;
        }
      }
    }

    function pushVertex(vertex: Vector3) {
      vertexBuffer.push(vertex.x, vertex.y, vertex.z);
    }

    function getVertexByIndex(index: number, vertex: Vector3) {
      const stride = index * 3;

      vertex.x = vertices[stride + 0];
      vertex.y = vertices[stride + 1];
      vertex.z = vertices[stride + 2];
    }

    function correctUVs() {
      const a = new Vector3();
      const b = new Vector3();
      const c = new Vector3();

      const centroid = new Vector3();

      const uvA = new Vector2();
      const uvB = new Vector2();
      const uvC = new Vector2();

      for (let i = 0, j = 0; i < vertexBuffer.length; i += 9, j += 6) {
        a.set(vertexBuffer[i + 0], vertexBuffer[i + 1], vertexBuffer[i + 2]);
        b.set(vertexBuffer[i + 3], vertexBuffer[i + 4], vertexBuffer[i + 5]);
        c.set(vertexBuffer[i + 6], vertexBuffer[i + 7], vertexBuffer[i + 8]);

        uvA.set(uvBuffer[j + 0], uvBuffer[j + 1]);
        uvB.set(uvBuffer[j + 2], uvBuffer[j + 3]);
        uvC.set(uvBuffer[j + 4], uvBuffer[j + 5]);

        centroid.copy(a).add(b).add(c).divideScalar(3);

        const azi = azimuth(centroid);

        correctUV(uvA, j + 0, a, azi);
        correctUV(uvB, j + 2, b, azi);
        correctUV(uvC, j + 4, c, azi);
      }
    }

    function correctUV(uv: Vector2, stride: number, vector: Vector3, azimuth: number) {
      if ((azimuth < 0) && (uv.x === 1)) {
        uvBuffer[stride] = uv.x - 1;
      }

      if ((vector.x === 0) && (vector.z === 0)) {
        uvBuffer[stride] = azimuth / 2 / Math.PI + 0.5;
      }
    }

    // Angle around the Y axis, counter-clockwise when looking from above.
    function azimuth(vector: Vector3) {
      return Math.atan2(vector.z, - vector.x);
    }

    // Angle above the XZ plane.
    function inclination(vector: Vector3) {
      return Math.atan2(- vector.y, Math.sqrt((vector.x * vector.x) + (vector.z * vector.z)));
    }
  }
}