'use client'

import { useSnapshot } from "valtio"
import { state, wsProvider } from "./Yjs"
import { useEffect, useState } from "react"

export default function Text() {
  const [synced, setSynced] = useState(wsProvider?.synced)
  const { count } = useSnapshot(state)

  useEffect(() => {
    setSynced(wsProvider.synced)
  }, [wsProvider.synced])

  return <>
    <p>synced: {synced ? "true" : "false"}</p>
    <p>count: {count}</p>
    <button onClick={() => ++state.count}>count up</button>
  </>
}