'use client'

import { getLat, getLon, setLocation } from '@/lib/location'
import { radius, scale } from '@/lib/planet'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import EventEmitter from 'events'
import { ComponentProps, useEffect, useRef } from 'react'
import { PerspectiveCamera } from 'three'
import { proxy } from 'valtio'

export let minDistance = (100 + radius) * scale / radius
//export let maxDistance = 2 * scale
export let maxDistance = (100000 + radius) * scale / radius
export let zoomSpeed = 0.01

export const location = proxy({
  lat: 35.685,
  lon: 139.775
})

export const eventEmitter = new EventEmitter()

export default function GlobeControls(props: ComponentProps<typeof OrbitControls>) {
  const camera = useThree(state => state.camera as PerspectiveCamera)

  const rotateSpeed = useRef((camera.position.length() / scale - 1) * 0.3)

  useEffect(() => {
    setLocation(camera.position, location.lat, location.lon)
    rotateSpeed.current = (camera.position.length() / scale - 1) * 0.3

    eventEmitter.emit('changed')
  }, [])

  return <>
    <OrbitControls
      enablePan={false}
      minDistance={minDistance}
      maxDistance={maxDistance}
      zoomSpeed={zoomSpeed}
      onChange={() => {
        location.lat = getLat(camera.position)
        location.lon = getLon(camera.position)
        rotateSpeed.current = (camera.position.length() / scale - 1) * 0.3

        eventEmitter.emit('changed')
      }}
      rotateSpeed={rotateSpeed.current}
      {...props}
    />
  </>
}