'use client'

import GlobeControls, { location } from './GlobeControls'
import { PerspectiveCamera } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { getLat, getLon, setLocation } from '@/lib/location'
import { useSnapshot } from 'valtio'
import { radius, scale } from '@/lib/planet'

export let far = 2 * scale
export let near = 0.001 * scale / radius

export default function CameraAndControls() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!)

  const { lat, lon } = useSnapshot(location)

  useEffect(() => {
    setLocation(cameraRef.current.position, lat, lon)

    location.lat = getLat(cameraRef.current.position)
    location.lon = getLon(cameraRef.current.position)
  }, [cameraRef.current])

  return <>
    <PerspectiveCamera makeDefault ref={cameraRef} far={far} near={near} position={[0, 0, scale]} />
    <GlobeControls camera={cameraRef.current} />
  </>
}