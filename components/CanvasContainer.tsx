'use client'

import { Canvas } from '@react-three/fiber'
import CameraAndControls from './CameraAndControls'
import TerrainGenerator from './TerrainGenerator'

export default function CanvasContainer() {
  return (
    <div id="canvas-container">
      <Canvas shadows>
        <CameraAndControls />
        <directionalLight />
        <TerrainGenerator />
      </Canvas>
    </div>
  )
}