'use client'

import { useEffect } from "react"
import { proxy } from "valtio"
import YjsClient from "@/lib/yjsClient"

export let yjsClient: YjsClient

export const state = proxy({
  count: 0,
});

export default function Text() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    yjsClient = new YjsClient(state)
  }, [])

  return null
}