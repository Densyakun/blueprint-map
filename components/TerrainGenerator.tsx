'use client'

import { location } from "./GlobeControls"
import { useEffect, useRef } from "react"
import { DoubleSide, Mesh } from "three"
import { scale } from "@/lib/planet"
import { useFrame } from "@react-three/fiber"
import { chunkHeightSegments, getChunkWidthSegments, getChunkX, getChunkY } from "@/lib/terrain"
import { FROM_CLIENT_GET_TERRAIN, FROM_SERVER_SEND_TERRAIN, OnMessageInClient } from "@/lib/game"
import { socket } from "./Client"
import { messageEmitter } from "@/lib/client"
import { ClippedIcosahedronGeometry } from "@/lib/ClippedIcosahedronGeometry"

let currentChunkX = -1
let currentChunkY = -1

export default function TerrainGenerator() {
  const meshRef = useRef<Mesh>(null!)

  useFrame(() => {
    //if (socket.readyState !== 1) return

    const newChunkY = getChunkY(location.lat)
    const chunkWidthSegments = getChunkWidthSegments(newChunkY)
    const newChunkX = getChunkX(location.lon, chunkWidthSegments)

    if (newChunkX === currentChunkX && newChunkY === currentChunkY) return
    currentChunkX = newChunkX
    currentChunkY = newChunkY

    //socket.send(JSON.stringify([FROM_CLIENT_GET_TERRAIN, [newChunkX, newChunkY]]))

    const geometry = new ClippedIcosahedronGeometry(scale, 255, {
      west: newChunkX * 360 / chunkWidthSegments - 180,
      east: (newChunkX + 1 === chunkWidthSegments) ? -180 : (newChunkX + 1) * 360 / chunkWidthSegments - 180,
      south: 90 - (newChunkY + 1) * 180 / chunkHeightSegments,
      north: 90 - newChunkY * 180 / chunkHeightSegments
    })
    meshRef.current.geometry.attributes = geometry.attributes
    meshRef.current.geometry.computeBoundingBox()
    meshRef.current.geometry.computeBoundingSphere()
  })

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
      <bufferGeometry />
      <meshStandardMaterial shadowSide={DoubleSide} />
    </mesh>
  )
}