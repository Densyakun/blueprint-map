'use client'

import { useSnapshot } from "valtio"
import { state } from "@/lib/yjs"

export default function Text() {
  const snap = useSnapshot(state)

  return <>
    count: {snap.count}
  </>
}