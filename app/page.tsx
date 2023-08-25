import dynamic from 'next/dynamic'

const Client = dynamic(() => import('../components/Client'), { ssr: false })
const Text = dynamic(() => import('../components/Text'), { ssr: false })

export default function Home() {
  return (
    <main>
      <Client />
      <Text />
    </main>
  )
}
