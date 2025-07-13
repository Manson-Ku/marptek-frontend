// components/ErrorReload.js
'use client'
import { useEffect } from "react"

export default function ErrorReload() {
  useEffect(() => {
    const handler = (event) => {
      if (event?.error?.name === 'ChunkLoadError') {
        // 可限制 reload 次數避免無限循環
        if (!window.__chunk_reload__) {
          window.__chunk_reload__ = true
          window.location.reload()
        }
      }
    }
    window.addEventListener('error', handler)
    return () => window.removeEventListener('error', handler)
  }, [])
  return null
}
