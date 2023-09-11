'use client'

import { useSnapshot } from "valtio"
import { location } from "./GlobeControls"
import { clientState } from "@/lib/client"

export default function UIContainer() {
  const { lat, lon } = useSnapshot(location)

  const { isSynced } = useSnapshot(clientState)

  return (
    <div id="ui-container">
      <div className="ui-panel">
        <p>lat: {Math.floor(lat * 1000) / 1000}</p>
        <p>lon: {Math.floor(lon * 1000) / 1000}</p>
        <p>isSynced: {isSynced ? "true" : "false"}</p>
      </div>
    </div>
  )
}