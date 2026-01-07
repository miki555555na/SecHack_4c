"use client"

import React from 'react'
import { Terminal } from 'lucide-react'

type Props = {
  logs: string[]
  scrollRef: React.RefObject<HTMLDivElement | null>
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


export default function AttackConsole({
  logs,
  scrollRef,
  running,
  runAttack,
  stopAttack,
}: Props) {
  const baseButton = {
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 操作エリア */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 10,
          alignItems: 'center',
        }}
      >
        {/* 実行ボタン */}
        <button
          onClick={runAttack}
          disabled={running}
          style={{
            ...baseButton,
            background: running ? '#e5e7eb' : '#e0f2fe',
            borderColor: '#38bdf8',
            color: '#0369a1',
            cursor: running ? 'not-allowed' : 'pointer',
            opacity: running ? 0.6 : 1,
          }}
        >
          ▶ 実行
        </button>

        {/* 停止ボタン */}
        <button
          onClick={stopAttack}
          disabled={!running}
          style={{
            ...baseButton,
            background: running ? '#f1f5f9' : '#f8fafc',
            borderColor: '#94a3b8',
            color: '#334155',
            cursor: !running ? 'not-allowed' : 'pointer',
            opacity: !running ? 0.5 : 1,
          }}
        >
          ■ 停止
        </button>

        {/* 状態表示（あるとかなり親切） */}
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {running ? '実行中…' : '待機中'}
        </span>
      </div>

      {/* ログ表示 */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          background: '#0f172a',
          color: '#e5e7eb',
          padding: 10,
          borderRadius: 6,
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: 12,
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>
            ログはここに表示されます
          </div>
        ) : (
          logs.map((line, i) => (
            <div key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: 6 }}>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
