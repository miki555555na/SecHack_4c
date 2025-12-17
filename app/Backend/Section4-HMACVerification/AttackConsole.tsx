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

// AttackConsole.tsx (一部抜粋)
export default function AttackConsole(props: Props) {
  const { attackStatus, running, crackedHmac, currentByteIndex, tryingChar, logs, runAttack, stopAttack } = props;

  return (
    <div style={{ ...props.darkPanelBase, position: 'relative' }}>
      <div style={{ marginBottom: 15, padding: '10px', background: '#1e293b', borderRadius: 6 }}>
        <h4 style={{ color: '#9ca3af', fontSize: 12, margin: '0 0 8px 0' }}>HMAC署名の検証中</h4>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              width: 36, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 4, border: '1px solid #4b5563',
              fontSize: 20, fontFamily: 'monospace',
              background: i < currentByteIndex ? '#065f46' : (i === currentByteIndex && running ? '#854d0e' : '#1f2937'),
              color: i < currentByteIndex ? '#34d399' : '#fff',
              transition: 'all 0.2s'
            }}>
             {i < currentByteIndex || attackStatus === 'success'
  ? crackedHmac[i]
  : (i === currentByteIndex && running ? tryingChar : '?')}

            </div>
          ))}
        </div>
      </div>
      
      {/* 攻撃ボタンの強調 */}
      <button
        onClick={running ? stopAttack : runAttack}
        style={{
          width: '100%', padding: '12px', borderRadius: 8, border: 'none',
          background: running ? '#ef4444' : '#3b82f6',
          color: 'white', fontWeight: 'bold', cursor: 'pointer',
          fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}
      >
        {running ? "攻撃を停止" : "タイミング解析を開始"}
      </button>
      
      {/* ログエリア */}
      <div style={{ ...props.logAreaBase, marginTop: 15, fontSize: 12 }}>
         {/* ログの内容 */}
      </div>
    </div>
  );
}