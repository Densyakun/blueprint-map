//export const chunkHeightSegments = 1024
export const chunkHeightSegments = 3 * 64

export function getChunkY(lat: number) {
  return Math.min(Math.floor((90 - lat) * chunkHeightSegments / 180), chunkHeightSegments - 1)
}

export function getChunkWidthSegments(chunkY: number) {
  const height0 = 1 - Math.cos(Math.PI / chunkHeightSegments)
  const height1 = 1 - Math.cos(Math.PI * chunkY / chunkHeightSegments)
  const height2 = 1 - Math.cos(Math.PI * (chunkY + 1) / chunkHeightSegments)

  return Math.round((height2 - height1) / height0 / 2)
}

export function getChunkX(lon: number, chunkWidthSegments: number) {
  const chunkX = Math.floor((lon + 180) * chunkWidthSegments / 360)

  return chunkX === chunkWidthSegments ? 0 : chunkX
}