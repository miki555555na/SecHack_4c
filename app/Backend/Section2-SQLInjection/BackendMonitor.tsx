"use client"

import React from 'react'
import { Terminal, Code2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type Props = {
  renderSqlPreview: () => React.ReactNode
  logs: string[]
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export default function BackendMonitor({ renderSqlPreview, logs, scrollRef }: Props) {
  return (
    <Card style={{ fontSize: 17 }}>
      <CardHeader>
        <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code2 size={18} /> Backend Logic Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>実行パイプライン:</div>
          <div style={{ background: '#000', padding: 15, borderRadius: 6, border: '1px solid #374151', overflowX: 'auto', color: '#d1d5db' }}>
            {renderSqlPreview()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Terminal size={14} /> System Logs
          </div>
          <div ref={scrollRef} style={{ background: '#000', borderRadius: 6, padding: 10, fontFamily: 'monospace', fontSize: 11, color: '#d1d5db', border: '1px solid #374151', overflowY: 'auto', minHeight: 150, maxHeight: 300 }}>
            {logs.map((l, i) => (
              <div key={i} style={{ marginBottom: 4, color: l.includes('WARN') || l.includes('ERROR') ? '#fca5a5' : l.includes('EXECUTING') ? '#60a5fa' : l.includes('VALIDATING') ? '#a7f3d0' : '#d1d5db' }}>
                {l}
              </div>
            ))}
            {logs.length === 0 && <span style={{ opacity: 0.5 }}>System ready. Waiting for requests...</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}