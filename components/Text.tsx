'use client'

import { useSnapshot } from "valtio"
import { useEffect, useState } from "react"
import { yjsClient } from "@/lib/client"

export default function Text() {
  const [synced, setSynced] = useState(yjsClient.wsProvider.synced)
  const { count } = useSnapshot(yjsClient.state)

  useEffect(() => {
    setSynced(yjsClient.wsProvider.synced)
  }, [yjsClient.wsProvider.synced])

  return <>
    <p>synced: {synced ? "true" : "false"}</p>
    <p>count: {count}</p>
    <button onClick={() => ++yjsClient.state.count}>count up</button>
  </>
}