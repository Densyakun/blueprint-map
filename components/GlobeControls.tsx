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
export let rotateSpeedFactor = 0.175
export let zoomSpeedFactor = 10

export const location = proxy({
  lat: 35.685,
  lon: 139.775
})

export const eventEmitter = new EventEmitter()

export default function GlobeControls(props: ComponentProps<typeof OrbitControls>) {
  const camera = useThree(state => state.camera as PerspectiveCamera)

  const distance = camera.position.length() / scale - 1
  const rotateSpeed = useRef(distance * rotateSpeedFactor)
  const zoomSpeed = useRef(distance * zoomSpeedFactor)

  useEffect(() => {
    setLocation(camera.position, location.lat, location.lon)
    const distance = camera.position.length() / scale - 1
    rotateSpeed.current = distance * rotateSpeedFactor
    zoomSpeed.current = distance * zoomSpeedFactor

    eventEmitter.emit('changed')
  }, [])

  return <>
    <OrbitControls
      enablePan={false}
      minDistance={minDistance}
      maxDistance={maxDistance}
      zoomSpeed={zoomSpeed.current}
      onChange={() => {
        location.lat = getLat(camera.position)
        location.lon = getLon(camera.position)
        const distance = camera.position.length() / scale - 1
        rotateSpeed.current = distance * rotateSpeedFactor
        zoomSpeed.current = distance * zoomSpeedFactor

        eventEmitter.emit('changed')
      }}
      rotateSpeed={rotateSpeed.current}
      {...props}
    />
  </>
}