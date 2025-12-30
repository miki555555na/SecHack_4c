"use client"

import React from 'react'
import { Play, Search, Unlock, Lock, ShieldCheck, ShieldAlert } from 'lucide-react'

type Props = {
  mode: 'vulnerable' | 'secure'
  setMode: (m: 'vulnerable' | 'secure') => void
  secureType: 'prepared' | 'orm'
  setSecureType: (t: 'prepared' | 'orm') => void
  enableValidation: boolean
  setEnableValidation: (b: boolean) => void
  queryInput: string
  setQueryInput: (s: string) => void
  executeQuery: () => Promise<void>
  isExecuting: boolean
  queryResult: any[] | null
}

const cardStyle: React.CSSProperties = { background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 20, fontSize: 17 };

export default function QueryPanel(props: Props) {
  const { 
    mode, setMode, 
    secureType, setSecureType, 
    enableValidation, setEnableValidation,
    queryInput, setQueryInput, 
    executeQuery, isExecuting 
  } = props

  const PresetBtn = ({ label, value }: { label: string; value: string }) => (
    <button
      onClick={() => setQueryInput(value)}
      style={{ padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #d1d5db', background: '#f3f4f6', cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap' }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 17 }}>
      <div style={cardStyle}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15, color: '#374151', display: 'flex', justifyContent: 'space-between' }}>
            防御層の設定
        </div>
        
        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px dashed #e5e7eb' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                1. 入力検証 (Validation)
            </div>
            <label style={{ 
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                padding: '10px 12px', borderRadius: 6, 
                border: enableValidation ? '1px solid #10b981' : '1px solid #e5e7eb',
                background: enableValidation ? '#ecfdf5' : '#f9fafb'
            }}>
                <div style={{ position: 'relative', width: 40, height: 22, background: enableValidation ? '#10b981' : '#d1d5db', borderRadius: 20, transition: '0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 3, left: enableValidation ? 20 : 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: '0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                </div>
                <input type="checkbox" checked={enableValidation} onChange={(e) => setEnableValidation(e.target.checked)} style={{ display: 'none' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: enableValidation ? '#047857' : '#6b7280' }}>
                        {enableValidation ? '有効: 英数字のみ許可' : '無効: チェックなし'}
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {enableValidation ? '※ 記号が含まれると実行前にエラーにします' : '※ どんな文字でもDBへ通します'}
                    </span>
                </div>
            </label>
        </div>

        <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                2. SQL実行制限 (Restriction)
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                <button
                    onClick={() => setMode('vulnerable')}
                    style={{
                    flex: 1, padding: '10px', borderRadius: 6, border: '1px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexDirection: 'column',
                    background: mode === 'vulnerable' ? '#fef2f2' : '#fff',
                    borderColor: mode === 'vulnerable' ? '#ef4444' : '#d1d5db',
                    color: mode === 'vulnerable' ? '#b91c1c' : '#6b7280',
                    }}
                >
                    <div style={{display:'flex', alignItems:'center', gap:6, fontWeight: 700}}><Unlock size={16} /> 制限なし</div>
                    <span style={{fontSize: 10, opacity: 0.8}}>(文字列結合)</span>
                </button>
                <button
                    onClick={() => setMode('secure')}
                    style={{
                    flex: 1, padding: '10px', borderRadius: 6, border: '1px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexDirection: 'column',
                    background: mode === 'secure' ? '#f0fdf4' : '#fff',
                    borderColor: mode === 'secure' ? '#22c55e' : '#d1d5db',
                    color: mode === 'secure' ? '#15803d' : '#6b7280',
                    }}
                >
                    <div style={{display:'flex', alignItems:'center', gap:6, fontWeight: 700}}><Lock size={16} /> 制限あり</div>
                    <span style={{fontSize: 10, opacity: 0.8}}>(プレースホルダ)</span>
                </button>
            </div>
            
            {mode === 'secure' && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #bbf7d0' }}>
                <span style={{fontSize: 11, fontWeight: 700, color: '#166534'}}>実装方式:</span>
                <label style={{fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#14532d'}}>
                    <input type="radio" name="secureType" checked={secureType === 'prepared'} onChange={() => setSecureType('prepared')} />
                    Placeholder
                </label>
                <label style={{fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#14532d'}}>
                    <input type="radio" name="secureType" checked={secureType === 'orm'} onChange={() => setSecureType('orm')} />
                    ORM (Prisma)
                </label>
            </div>
            )}
        </div>
      </div>

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
               <Search size={16} /> ユーザー検索
          </span>
        </label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <PresetBtn label="正常: alice" value="alice" />
          <PresetBtn label="攻撃: 全件 (' OR '1'='1)" value="' OR '1'='1" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
      <input 
        type="text" value={queryInput} onChange={(e) => setQueryInput(e.target.value)}
        placeholder="検索したい名前を入力..."
        style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 17, fontFamily: 'monospace' }}
      />
          <button
              onClick={executeQuery} disabled={isExecuting || !queryInput}
              style={{ padding: '0 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, opacity: (isExecuting || !queryInput) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
          >
              <Play size={16} /> {isExecuting ? '...' : '実行'}
          </button>
        </div>
      </div>
    </div>
  )
}