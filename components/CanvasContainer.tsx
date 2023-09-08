'use client'

import { Canvas } from '@react-three/fiber'
import CameraAndControls from './CameraAndControls'
import { scale } from '@/lib/planet'

export default function CanvasContainer() {
  return (
    <div id="canvas-container">
      <Canvas shadows>
        <CameraAndControls />
        <directionalLight />
        <mesh>
          <icosahedronGeometry args={[scale, 6]} />
          <meshStandardMaterial />
        </mesh>
      </Canvas>
    </div>
  )
}