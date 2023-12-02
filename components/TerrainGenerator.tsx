'use client'

import { location } from "./GlobeControls"
import { useEffect, useRef } from "react"
import { BufferAttribute, DoubleSide, Mesh } from "three"
import { radius, scale } from "@/lib/planet"
import SphericalMercator from "@mapbox/sphericalmercator"
import { useFrame } from "@react-three/fiber"
//import { chunkHeightSegments, getChunkWidthSegments, getChunkX, getChunkY } from "@/lib/terrain"
import { FROM_CLIENT_GET_TERRAIN, FROM_SERVER_SEND_TERRAIN, OnMessageInClient } from "@/lib/game"
import { socket } from "./Client"
import { messageEmitter } from "@/lib/client"

export type HeightmapType = (number | undefined)[][]

const terrainZoom = 15
let currentTileX = -1
let currentTileY = -1
const terrainSize = 256

var merc = new SphericalMercator({
  size: 256,
  antimeridian: true
})

export default function TerrainGenerator() {
  const meshRef = useRef<Mesh>(null!)

  const vertices = useRef(new Float32Array((terrainSize + 1 - 2) ** 2 * 2 * 3 * 3))

  const applyMesh = () => {
    const { geometry } = meshRef.current
    const { position } = geometry.attributes
    position.array.set(vertices.current)
    position.needsUpdate = true
    geometry.computeVertexNormals()
  }

  async function fetchTile(url: string, tileSize = 256) {
    return fetch(url)
      .then(async res => {
        const text = await res.text()

        const heightmap: HeightmapType = text.split("\n").slice(0, tileSize).map(line =>
          line.split(",").map(point => point === "e" ? undefined : parseInt(point))
        )

        if (heightmap.length !== terrainSize) return

        return heightmap
      })
  }

  function writeHeightmap(backHeightmap: HeightmapType, frontHeightmap: HeightmapType, terrainTileX: number, terrainTileY: number, mapTileX: number, mapTileY: number, mapTileZoom: number) {
    if (mapTileZoom === terrainZoom) {
      for (let x = 0; x <= terrainSize - 2; x++)
        for (let y = 0; y <= terrainSize - 2; y++)
          if (frontHeightmap[y][x] !== undefined)
            backHeightmap[y][x] = frontHeightmap[y][x]

      return backHeightmap
    } else {
      // TODO ズームレベルの異なる地図タイルから標高データを更新する
      return backHeightmap
    }
  }

  function applyTile(heightmap: HeightmapType, tileX: number, tileY: number) {
    for (let x = 0; x <= terrainSize - 2; x++) {
      for (let y = 0; y <= terrainSize - 2; y++) {
        const i = (y * (terrainSize - 1) + x) * 2 * 3 * 3

        const isEmpty =
          heightmap[y + 1][x] === undefined
          || heightmap[y + 1][x + 1] === undefined
          || heightmap[y][x + 1] === undefined
          || heightmap[y][x] === undefined

        if (isEmpty) {
          vertices.current[i] =
            vertices.current[i + 1] =
            vertices.current[i + 2] =
            vertices.current[i + 3] =
            vertices.current[i + 4] =
            vertices.current[i + 5] =
            vertices.current[i + 6] =
            vertices.current[i + 7] =
            vertices.current[i + 8] =
            vertices.current[i + 9] =
            vertices.current[i + 10] =
            vertices.current[i + 11] =
            vertices.current[i + 12] =
            vertices.current[i + 13] =
            vertices.current[i + 14] =
            vertices.current[i + 15] =
            vertices.current[i + 16] =
            vertices.current[i + 17] = 0
        } else {
          const h0 = (radius + heightmap[y + 1][x]!) / radius
          const h1 = (radius + heightmap[y + 1][x + 1]!) / radius
          const h2 = (radius + heightmap[y][x + 1]!) / radius
          const h3 = (radius + heightmap[y][x]!) / radius

          const [lon0, lat0] = merc.ll([tileX * 256 + x, tileY * 256 + y], terrainZoom)
          const [lon1, lat1] = merc.ll([tileX * 256 + x + 1, tileY * 256 + y + 1], terrainZoom)

          const a0 = lon0 * Math.PI / 180
          const a1 = lon1 * Math.PI / 180

          const b0 = lat0 * Math.PI / 180
          const b1 = lat1 * Math.PI / 180

          vertices.current[i] =
            vertices.current[i + 15] = Math.cos(a0) * Math.cos(b1) * h0 * scale
          vertices.current[i + 1] =
            vertices.current[i + 16] = Math.sin(b1) * h0 * scale
          vertices.current[i + 2] =
            vertices.current[i + 17] = -Math.sin(a0) * Math.cos(b1) * h0 * scale

          vertices.current[i + 3] = Math.cos(a1) * Math.cos(b1) * h1 * scale
          vertices.current[i + 4] = Math.sin(b1) * h1 * scale
          vertices.current[i + 5] = -Math.sin(a1) * Math.cos(b1) * h1 * scale

          vertices.current[i + 6] =
            vertices.current[i + 9] = Math.cos(a1) * Math.cos(b0) * h2 * scale
          vertices.current[i + 7] =
            vertices.current[i + 10] = Math.sin(b0) * h2 * scale
          vertices.current[i + 8] =
            vertices.current[i + 11] = -Math.sin(a1) * Math.cos(b0) * h2 * scale

          vertices.current[i + 12] = Math.cos(a0) * Math.cos(b0) * h3 * scale
          vertices.current[i + 13] = Math.sin(b0) * h3 * scale
          vertices.current[i + 14] = -Math.sin(a0) * Math.cos(b0) * h3 * scale
        }
      }
    }

    applyMesh()
  }

  useFrame(() => {
    //if (socket.readyState !== 1) return

    let [newTileX, newTileY] = merc.px([location.lon, location.lat], terrainZoom)
      .map((value: number) => Math.floor(value / 256))

    if (newTileY < 0 || (2 ** terrainZoom <= newTileY)) return

    if (newTileX === currentTileX && newTileY === currentTileY) return
    currentTileX = newTileX
    currentTileY = newTileY

    // TODO サーバー側で処理
    //socket.send(JSON.stringify([FROM_CLIENT_GET_TERRAIN, [newTileX, newTileY]]))

    // 範囲内のタイルを取得
    /*function fetchTiles(fetchTileCallback: (mapTileX: number, mapTileY: number) => Promise<HeightmapType | undefined>, terrainTileX: number, terrainTileY: number, mapTileZoom: number) {
      if (mapTileZoom === terrainZoom) {

        return [fetchTileCallback(terrainTileX, terrainTileY)]
      } else {
        // TODO ズームレベルの異なる複数の地図タイル
        // mapTileZoom < terrainZoom
        return [fetchTileCallback(terrainTileX, terrainTileY)]
      }
    }*/

    //const tileXList = [newTileX, newTileX]
    //const tileYList = [newTileY, newTileY]

    Promise.allSettled([
      //...fetchTiles((mapTileX, mapTileY) => fetchTile(`https://cyberjapandata.gsi.go.jp/xyz/demgm/8/${mapTileX}/${mapTileY}.txt`), newTileX, newTileY, 8),
      fetchTile(`https://cyberjapandata.gsi.go.jp/xyz/dem5b/15/${newTileX}/${newTileY}.txt`),
      fetchTile(`https://cyberjapandata.gsi.go.jp/xyz/dem5a/15/${newTileX}/${newTileY}.txt`),
    ])
      .then(results => {
        if (newTileX !== currentTileX || newTileY !== currentTileY) return

        let oldHeightmap: HeightmapType = new Array(terrainSize).fill(0).map(() => new Array(terrainSize))
        results.forEach(result => {
          if (result.status === "rejected") return

          const heightmap = result.value
          if (!heightmap) return

          oldHeightmap = writeHeightmap(oldHeightmap, heightmap, newTileX, newTileY, newTileX, newTileY, 15)
        })

        applyTile(oldHeightmap, newTileX, newTileY)
      })
      .catch(error => {
        console.error(error)
      })
  })

  useEffect(applyMesh)

  const onReceiveTerrain: OnMessageInClient = (id, value, ws) => {
    switch (id) {
      case FROM_SERVER_SEND_TERRAIN:
        // TODO
        break
      default:
        break
    }
  }

  useEffect(() => {
    messageEmitter.on('message', onReceiveTerrain)

    return () => {
      messageEmitter.off('message', onReceiveTerrain)
    }
  }, [])

  return (
    <mesh castShadow receiveShadow ref={meshRef}>
      <bufferGeometry attributes={{ "position": new BufferAttribute(vertices.current, 3) }} />
      <meshStandardMaterial shadowSide={DoubleSide} />
    </mesh>
  )
}