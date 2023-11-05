'use client'

import { location } from "./GlobeControls"
import { useEffect, useRef, useState } from "react"
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

  const [dwest, setWest] = useState(0)
  const [deast, setEast] = useState(0)
  const [dsouth, setSouth] = useState(0)
  const [dnorth, setNorth] = useState(0)

  useFrame(() => {
    //if (socket.readyState !== 1) return

    const newChunkY = getChunkY(location.lat)
    const chunkWidthSegments = getChunkWidthSegments(newChunkY)
    const newChunkX = getChunkX(location.lon, chunkWidthSegments)

    if (newChunkX === currentChunkX && newChunkY === currentChunkY) return
    currentChunkX = newChunkX
    currentChunkY = newChunkY

    //socket.send(JSON.stringify([FROM_CLIENT_GET_TERRAIN, [newChunkX, newChunkY]]))

    const west = newChunkX * 360 / chunkWidthSegments - 180
    const east = (newChunkX + 1 === chunkWidthSegments) ? -180 : (newChunkX + 1) * 360 / chunkWidthSegments - 180
    const south = 90 - (newChunkY + 1) * 180 / chunkHeightSegments
    const north = 90 - newChunkY * 180 / chunkHeightSegments
    setWest(west * Math.PI / 180)
    setEast(east * Math.PI / 180)
    setSouth(south * Math.PI / 180)
    setNorth(north * Math.PI / 180)
    //const geometry = new ClippedIcosahedronGeometry(scale, 524287, {
    const geometry = new ClippedIcosahedronGeometry(scale, 63, {
      west,
      east,
      south,
      north
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
    <>
      <mesh castShadow receiveShadow ref={meshRef}>
        <bufferGeometry />
        <meshStandardMaterial shadowSide={DoubleSide} />
      </mesh>
      <mesh rotation={[0, dwest, dsouth]}>
        <boxGeometry args={[scale * 2, scale * 0.01, scale * 0.01]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>
      <mesh rotation={[0, deast, dnorth]}>
        <boxGeometry args={[scale * 2, scale * 0.01, scale * 0.01]} />
        <meshBasicMaterial color={0x00ff00} />
      </mesh>
    </>
  )
}