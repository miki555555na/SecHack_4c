"use client"

import React from 'react'
import { Activity } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts'

type Datum = { char: string; time: number; isHit?: boolean }

type Props = {
  rightPanelBase: React.CSSProperties
  chartData: Datum[]
  insecure: boolean
  running: boolean
}

export default function ResponseChart({ rightPanelBase, chartData, insecure, running }: Props) {
  return (
    <div style={rightPanelBase}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={16} color="#2563eb" /> Response Latency
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#6b7280' }}>{insecure ? "⚠️ 警告: 正解の文字で処理時間が突出しています" : "✓ 安全: 処理時間は一定です"}</p>
        </div>
        {running && <div style={{ fontSize: 10, background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Measuring...</div>}
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="char" stroke="#9ca3af" tick={{ fontSize: 11 }} interval={0} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} unit="ms" />
            <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Bar dataKey="time" radius={[2, 2, 0, 0]} animationDuration={200}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isHit ? '#f97316' : (insecure ? '#3b82f6' : '#10b981')} />
              ))}
            </Bar>
            {insecure && chartData.length > 0 && (
              <ReferenceLine y={Math.max(...chartData.map(d => d.time)) * 0.9} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Spike Detected", fill: "#ef4444", fontSize: 10 }} />
            )}
          </BarChart>
        </ResponsiveContainer>

        {chartData.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column', gap: 8 }}>
            <Activity size={32} style={{ opacity: 0.2 }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Waiting for data...</span>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: 10, color: '#6b7280', marginTop: 4, fontFamily: 'monospace' }}>Byte Candidate (Hex 0-F)</div>
    </div>
  )
}
