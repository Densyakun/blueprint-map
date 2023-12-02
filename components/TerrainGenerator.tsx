'use client'

import { location } from "./GlobeControls"
import { useEffect, useRef } from "react"
import { BufferAttribute, DoubleSide, Mesh } from "three"
import { radius, scale } from "@/lib/planet"
import SphericalMercator from "@mapbox/sphericalmercator"
import { useFrame } from "@react-three/fiber"
import { FROM_CLIENT_GET_TERRAIN, FROM_SERVER_SEND_TERRAIN, OnMessageInClient } from "@/lib/game"
import { socket } from "./Client"
import { messageEmitter } from "@/lib/client"
import { HeightmapType, terrainSize, terrainZoom } from "@/lib/terrain"

let currentTileX = -1
let currentTileY = -1

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

  function applyTile(heightmap: HeightmapType, tileX: number, tileY: number) {
    for (let x = 0; x <= terrainSize - 2; x++) {
      for (let y = 0; y <= terrainSize - 2; y++) {
        const i = (y * (terrainSize - 1) + x) * 2 * 3 * 3

        const isEmpty =
          heightmap[y + 1][x] === null
          || heightmap[y + 1][x + 1] === null
          || heightmap[y][x + 1] === null
          || heightmap[y][x] === null

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
    if (socket.readyState !== 1) return

    let [newTileX, newTileY] = merc.px([location.lon, location.lat], terrainZoom)
      .map((value: number) => Math.floor(value / 256))

    if (newTileY < 0 || (2 ** terrainZoom <= newTileY)) return

    if (newTileX === currentTileX && newTileY === currentTileY) return
    currentTileX = newTileX
    currentTileY = newTileY

    socket.send(JSON.stringify([FROM_CLIENT_GET_TERRAIN, [newTileX, newTileY]]))
  })

  useEffect(applyMesh)

  const onReceiveTerrain: OnMessageInClient = (id, value, ws) => {
    switch (id) {
      case FROM_SERVER_SEND_TERRAIN:
        messageEmitter.isInvalidMessage = false

        const [tileX, tileY, heightmap] = value

        if (tileX !== currentTileX || tileY !== currentTileY) return

        applyTile(heightmap, tileX, tileY)

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