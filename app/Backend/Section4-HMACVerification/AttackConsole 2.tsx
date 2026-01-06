"use client"

import React from 'react'
import { Terminal } from 'lucide-react'

type Props = {
  logs: string[]
  scrollRef: React.RefObject<HTMLDivElement> | null
  running: boolean
  runAttack: () => void
  stopAttack: () => void
  darkPanelBase: React.CSSProperties
  targetInfoBase: React.CSSProperties
  hmacBoxBase: React.CSSProperties
  logAreaBase: React.CSSProperties
  attackStatus: 'idle' | 'running' | 'success' | 'fail'
  crackedHmac: string
  currentByteIndex: number
  tryingChar: string
  insecure: boolean
}


export default function AttackConsole({ logs, scrollRef, running, runAttack, stopAttack }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={runAttack} disabled={running}>実行</button>
        <button onClick={stopAttack} disabled={!running}>停止</button>
      </div>

      <div
        ref={scrollRef}
        style={{ flex: 1, background: '#0f172a', color: '#e5e7eb', padding: 10, borderRadius: 6, overflowY: 'auto', fontFamily: 'monospace', fontSize: 12 }}
      >
        {logs.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>ログはここに表示されます</div>
        ) : (
          logs.map((line, i) => (
            <div key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: 6 }}>{line}</div>
          ))
        )}
      </div>
    </div>
  )
}