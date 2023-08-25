'use client'

import { useEffect, useState } from "react"
import { useSnapshot } from "valtio"
import { state, yjsClient } from "./Client"

export default function Text() {
  const [synced, setSynced] = useState(yjsClient?.wsProvider.synced)
  const { count } = useSnapshot(state)

  useEffect(() => {
    if (yjsClient) {
      yjsClient.wsProvider.on('sync', (isSynced: boolean) => {
        setSynced(isSynced)
      })
    }
  }, [yjsClient?.wsProvider])

  return <>
    <p>synced: {synced ? "true" : "false"}</p>
    <p>count: {count}</p>
    <button onClick={() => ++state.count}>count up</button>
  </>
}