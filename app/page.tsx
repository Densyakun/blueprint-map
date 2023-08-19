import dynamic from 'next/dynamic'

const Yjs = dynamic(() => import('../components/Yjs'), { ssr: false })
const Text = dynamic(() => import('../components/Text'), { ssr: false })

export default function Home() {
  return (
    <main>
      <Yjs />
      <Text />
    </main>
  )
}
