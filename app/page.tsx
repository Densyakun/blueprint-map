import CanvasContainer from '@/components/CanvasContainer'
import UIContainer from '@/components/UIContainer'
import dynamic from 'next/dynamic'

const Client = dynamic(() => import('../components/Client'), { ssr: false })

export default function Home() {
  return (
    <main>
      <CanvasContainer />
      <UIContainer />
      <Client />
    </main>
  )
}
