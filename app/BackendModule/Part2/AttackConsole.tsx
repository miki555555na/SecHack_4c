"use client"

import React from 'react'
import { Terminal } from 'lucide-react'

type Props = {
  darkPanelBase: React.CSSProperties
  targetInfoBase: React.CSSProperties
  hmacBoxBase: React.CSSProperties
  logAreaBase: React.CSSProperties
  attackStatus: 'idle' | 'running' | 'success' | 'fail'
  running: boolean
  crackedHmac: string
  currentByteIndex: number
  tryingChar: string
  logs: string[]
  scrollRef: React.RefObject<HTMLDivElement | null>
  runAttack: () => void
  stopAttack: () => void
  insecure: boolean
}

export default function AttackConsole(props: Props) {
  const { darkPanelBase, targetInfoBase, hmacBoxBase, logAreaBase, attackStatus, running, crackedHmac, currentByteIndex, tryingChar, logs, scrollRef, runAttack, stopAttack, insecure } = props

  return (
    <div style={{ ...darkPanelBase, border: attackStatus === 'success' ? '2px solid #22c55e' : '2px solid #374151' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottom: '1px solid #374151', paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14 }}>
          <Terminal size={16} /> ATTACKER_CONSOLE
        </div>
        {attackStatus === 'success' && <span style={{ background: '#16a34a', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>SUCCESS</span>}
      </div>

      <div style={targetInfoBase}>
        <div style={{ color: '#9ca3af', marginBottom: 4 }}>Target Payload (Tampered):</div>
        <div style={{ color: '#ef4444', fontWeight: 700 }}>{`{ "role": "admin" }`}</div>
        <div style={{ borderTop: '1px dashed #374151', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9ca3af' }}>Forging Signature:</span>
          <span style={{ color: '#eab308', fontWeight: 700, letterSpacing: 1 }}>
            {attackStatus === 'success' ? crackedHmac : '?? ?? ?? ??'}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
          <span>Brute-force Progress</span>
          <span style={{ color: insecure ? '#f87171' : '#4ade80', fontWeight: 700 }}>{insecure ? '[VULNERABLE TARGET]' : '[SECURE TARGET]'}</span>
        </div>

        <div style={hmacBoxBase}>
          {crackedHmac.split('').map((char, i) => (
            <span key={i} style={{
              width: 24, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 4, fontWeight: 700, fontFamily: 'monospace', fontSize: 16,
              background: i < currentByteIndex ? (attackStatus === 'success' ? '#22c55e' : '#064e3b') : '#374151',
              color: i < currentByteIndex ? '#fff' : (i === currentByteIndex && running ? '#eab308' : '#6b7280'),
              border: i === currentByteIndex && running ? '1px solid #eab308' : 'none'
            }}>
              {i === currentByteIndex && running ? tryingChar : (i < currentByteIndex || attackStatus === 'success' ? char : '*')}
            </span>
          ))}
        </div>

        <div ref={scrollRef} style={logAreaBase}>
          {logs.map((l, i) => (
            <div key={i} style={{ marginBottom: 2, color: l.includes('SUCCESS') ? '#4ade80' : l.includes('LEAKAGE') ? '#eab308' : '#9ca3af' }}>{l}</div>
          ))}
          {logs.length === 0 && <span style={{ opacity: 0.5 }}>Ready to initiate attack...</span>}
        </div>
      </div>

      <button
        onClick={running ? stopAttack : runAttack}
        disabled={attackStatus === 'success' && !running}
        style={{
          marginTop: 15, width: '100%', padding: '10px', borderRadius: 6, border: 'none', fontWeight: 700, cursor: attackStatus === 'success' ? 'default' : 'pointer',
          background: running ? '#4b5563' : attackStatus === 'success' ? '#16a34a' : '#dc2626',
          color: '#fff', fontSize: 14
        }}
      >
        {running ? 'STOP ATTACK' : attackStatus === 'success' ? 'ACCESS GRANTED' : 'EXECUTE ATTACK'}
      </button>
    </div>
  )
}
