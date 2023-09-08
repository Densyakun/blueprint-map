'use client'

import { getLat, getLon, setLocation } from '@/lib/location'
import { scale } from '@/lib/planet'
import { TrackballControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import EventEmitter from 'events'
import { ComponentProps, useEffect, useRef } from 'react'
import { PerspectiveCamera } from 'three'
import { proxy } from 'valtio'

export const location = proxy({
  lat: 35.712,
  lon: 139.8
})

export const eventEmitter = new EventEmitter()

export default function GlobeControls(props: ComponentProps<typeof TrackballControls>) {
  const camera = useThree(state => state.camera as PerspectiveCamera)

  const rotateSpeed = useRef((camera.position.length() / scale - 1) * 0.3)

  useEffect(() => {
    setLocation(camera.position, location.lat, location.lon)
    rotateSpeed.current = (camera.position.length() / scale - 1) * 0.3

    eventEmitter.emit('changed')
  }, [])

  return <>
    <TrackballControls
      noPan
      minDistance={1.01 * scale}
      maxDistance={2 * scale}
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