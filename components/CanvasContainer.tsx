'use client'

import { Canvas } from '@react-three/fiber'
import CameraAndControls from './CameraAndControls'
import TerrainGenerator from './TerrainGenerator'
import { CityNameTest } from './CityNameTest'

export default function CanvasContainer() {
  return (
    <div id="canvas-container">
      <Canvas shadows>
        <CameraAndControls />
        <directionalLight />
        <TerrainGenerator />
        <CityNameTest position={[139.775, 35.685]} />
      </Canvas>
    </div>
  )
}