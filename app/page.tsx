import dynamic from 'next/dynamic'

const Text = dynamic(() => import('../components/Text'), { ssr: false })

export default function Home() {
  return (
    <main>
      <Text />
    </main>
  )
}
