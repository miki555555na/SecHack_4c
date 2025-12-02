"use client"

import React, { useState, useRef } from 'react'
import SectionLayout from '../../Framework/SectionLayout'
import { FileJson, Server, ShieldAlert, ShieldCheck, Activity, Terminal, Database, CheckCircle, AlertTriangle, Code2, Clock, Lock, Search } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

// --- 設定値 ---
const CORRECT_HMAC = '9f86d081' 
const HMAC_LENGTH = 8
const DELAY_PER_BYTE = 40 
const HEX_CHARS = '0123456789abcdef'.split('')

// --- コードスニペット定義 ---
const SNIPPET_INSECURE = `// ❌ 危険な実装: Early Return (早期リターン)
// 言語標準の文字列比較 (==, memcmp, strcmp)
async function verify(received, expected) {
  for (let i = 0; i < len; i++) {
    // ⚠️ 1バイトでも不一致があれば即座に終了
    if (received[i] !== expected[i]) {
      return false; 
      // 結果: 「何文字目まで合っていたか」が
      // 処理時間として外部に漏洩する
    }
    await sleep(DELAY); // メモリ読み込み等の微小コスト
  }
  return true;
}`

const SNIPPET_SECURE = `// ⭕ 安全な実装: Constant Time (定数時間)
// どのような入力でも必ず最後まで計算する
async function verify(received, expected) {
  let result = 0;
  for (let i = 0; i < len; i++) {
    // 🔄 XOR演算で差異を累積する
    // 不一致があってもループを止めない！
    result |= received[i] ^ expected[i];
    
    await sleep(DELAY); // 常に一定時間かかる
  }
  return result === 0;
}`

// --- ユーティリティ ---
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

// サーバーサイド検証ロジック
async function verifySignature(receivedSig: string, insecure: boolean) {
  const expectedSig = CORRECT_HMAC 
  const len = expectedSig.length

  if (insecure) {
    for (let i = 0; i < len; i++) {
      if (receivedSig[i] === expectedSig[i]) {
        await sleep(DELAY_PER_BYTE) 
      } else {
        return { ok: false, matchCount: i } 
      }
    }
    return { ok: true, matchCount: len }
  } else {
    let result = 0;
    for (let i = 0; i < len; i++) {
      const a = receivedSig.charCodeAt(i) || 0
      const b = expectedSig.charCodeAt(i)
      result |= a ^ b
      await sleep(DELAY_PER_BYTE) 
    }
    return { ok: result === 0, matchCount: len }
  }
}

export default function Part2Page() {
  const [insecure, setInsecure] = useState(true)
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState<string>('0'.repeat(HMAC_LENGTH))
  const [currentByteIndex, setCurrentByteIndex] = useState(0)
  const [tryingChar, setTryingChar] = useState('')
  const [chartData, setChartData] = useState<Array<{ char: string; time: number; isHit?: boolean }>>([])
  
  const abortRef = useRef(false)

  function appendLog(line: string) {
    setLogs((s) => [`> ${line}`, ...s].slice(0, 50))
  }

  function stopAttack() {
    abortRef.current = true
    setRunning(false)
    appendLog("PROCESS ABORTED.")
  }

  async function runAttack() {
    abortRef.current = false
    setRunning(true)
    setLogs([])
    setChartData([])
    let currentConfirmed = '0'.repeat(HMAC_LENGTH)
    setConfirmed(currentConfirmed)
    
    appendLog("INITIATING FORGERY ATTACK...")
    appendLog(`TARGET: HMAC-SHA256 (Truncated)`)

    for (let pos = 0; pos < HMAC_LENGTH; pos++) {
      if (abortRef.current) break
      setCurrentByteIndex(pos)
      appendLog(`[Byte ${pos}] Brute-forcing...`)

      const roundMetrics: Array<{ char: string; time: number; isHit?: boolean }> = []
      let maxLatency = -1
      let bestCandidate = '0'

      for (const hex of HEX_CHARS) {
        if (abortRef.current) break
        setTryingChar(hex)

        const prefix = currentConfirmed.substring(0, pos)
        const suffix = currentConfirmed.substring(pos + 1)
        const payloadSig = prefix + hex + suffix
        
        const t0 = performance.now()
        const res = await verifySignature(payloadSig, insecure)
        const t1 = performance.now()
        const latency = Math.round(t1 - t0)

        const isHit = insecure && (res.matchCount > pos) 
        roundMetrics.push({ char: hex, time: latency, isHit })
        setChartData([...roundMetrics]) 

        if (latency > maxLatency) {
            maxLatency = latency
            bestCandidate = hex
        }
        await sleep(10)
      }

      if (abortRef.current) break

      if (insecure) {
        appendLog(`[Byte ${pos}] HIT: '${bestCandidate}' (${maxLatency}ms)`)
        const chars = currentConfirmed.split('')
        chars[pos] = bestCandidate
        currentConfirmed = chars.join('')
        setConfirmed(currentConfirmed)
      } else {
        appendLog(`[Byte ${pos}] MISS: Latency uniform.`)
        const randomHex = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]
        const chars = currentConfirmed.split('')
        chars[pos] = randomHex
        currentConfirmed = chars.join('')
        setConfirmed(currentConfirmed)
      }
      
      await sleep(200)
    }

    const finalRes = await verifySignature(currentConfirmed, insecure)
    if (finalRes.ok) {
        appendLog("SUCCESS: Forgery accepted by server.")
    } else {
        appendLog("FAILED: Invalid signature.")
    }
    setRunning(false)
  }

  // --- 技術解説セクション（大幅拡充） ---
  const technicalSpecs = (
    <div className="space-y-8 text-slate-200 mt-8">
      
      {/* Section 1: 根本原因の解説 */}
      <section className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
        <div className="bg-slate-950/50 p-4 border-b border-slate-700 flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-lg text-white">なぜ「文字列比較」が脆弱性になるのか？</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4"/> 
                    標準比較 (Standard Comparison)
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    多くのプログラミング言語の標準的な比較演算子（<code>==</code>, <code>===</code>, <code>strcmp</code>）は、パフォーマンス最適化のために<strong>「遅延評価（Lazy Evaluation）」</strong>を行います。
                </p>
                <div className="bg-black p-4 rounded font-mono text-sm space-y-1">
                    <div className="flex gap-2">
                        <span className="text-slate-500">Correct:</span>
                        <span className="text-emerald-500">a</span>
                        <span className="text-emerald-500">1</span>
                        <span className="text-emerald-500">b</span>
                        <span className="text-emerald-500">2</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-slate-500">Input:  </span>
                        <span className="text-emerald-500">a</span>
                        <span className="text-emerald-500">1</span>
                        <span className="text-red-500 font-bold">X</span>
                        <span className="text-slate-700">?</span>
                    </div>
                    <div className="mt-2 text-red-400 text-xs border-t border-red-900/50 pt-2">
                        → 3文字目で即座に停止 (Execution stops at index 2)
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4"/> 
                    定数時間比較 (Constant-Time)
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    セキュリティ用途の比較関数（<code>crypto.timingSafeEqual</code> 等）は、入力が正解でも不正解でも、<strong>必ず全バイトをスキャン</strong>します。
                </p>
                <div className="bg-black p-4 rounded font-mono text-sm space-y-1">
                    <div className="flex gap-2">
                        <span className="text-slate-500">Correct:</span>
                        <span className="text-emerald-500">a</span>
                        <span className="text-emerald-500">1</span>
                        <span className="text-emerald-500">b</span>
                        <span className="text-emerald-500">2</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-slate-500">Input:  </span>
                        <span className="text-emerald-500">a</span>
                        <span className="text-emerald-500">1</span>
                        <span className="text-red-500">X</span>
                        <span className="text-slate-500">?</span>
                    </div>
                    <div className="mt-2 text-emerald-400 text-xs border-t border-emerald-900/50 pt-2">
                        → 最後まで計算して結果を返す (Iterates full length)
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Section 2: 解決策 (AEAD) */}
      <section className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl overflow-hidden">
        <div className="bg-indigo-950/50 p-4 border-b border-indigo-500/30 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg text-white">実務での正しい対策：AEADの利用</h3>
        </div>
        <div className="p-6">
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                比較関数を修正するのも一つの手ですが、よりモダンで安全なアプローチは、<strong>暗号化と認証を分離しない</strong>ことです。
                <br/>認証付き暗号（AEAD: Authenticated Encryption with Associated Data）を使用すれば、ライブラリレベルで安全な検証が保証されます。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/40 p-4 rounded border border-slate-700">
                    <div className="text-xs text-slate-800 uppercase tracking-wider mb-1">Recommended Algorithm</div>
                    <div className="text-emerald-400 font-bold font-mono">AES-GCM</div>
                    <div className="text-xs text-slate-400 mt-2">高速かつハードウェア支援が効く標準的なAEAD。</div>
                </div>
                <div className="bg-black/40 p-4 rounded border border-slate-700">
                    <div className="text-xs text-slate-800 uppercase tracking-wider mb-1">Alternative</div>
                    <div className="text-emerald-400 font-bold font-mono">ChaCha20-Poly1305</div>
                    <div className="text-xs text-slate-400 mt-2">モバイル端末等で高速。TLS 1.3でも採用。</div>
                </div>
                <div className="bg-black/40 p-4 rounded border border-slate-700">
                    <div className="text-xs text-slate-800 uppercase tracking-wider mb-1">Avoid (Manual)</div>
                    <div className="text-red-400 font-bold font-mono line-through">AES-CBC + HMAC</div>
                    <div className="text-xs text-slate-400 mt-2">手動で組み合わせると「MAC-then-Encrypt」等の実装ミスを招きやすい。</div>
                </div>
            </div>
        </div>
      </section>
    </div>
  )

  return (
    <SectionLayout
      title1="2. 署名偽造とタイミング攻撃"
      title2="HMAC Verification & Forgery"
      description="サーバーの検証ロジックが「処理時間」という情報を漏洩させてしまう脆弱性を体験します。危険なコードと安全なコードを切り替え、攻撃者の視点でその違いを観測してください。"
      checklist={technicalSpecs}
      stickyChecklist={false}
    >
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Attacker Control */}
        <div className="lg:col-span-4 space-y-6">
            {/* Target Card */}
            <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10"><FileJson className="w-20 h-20 text-emerald-400" /></div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">1. Target Payload</h3>
                <div className="font-mono text-xs bg-black p-4 rounded border border-slate-700 text-emerald-400 whitespace-pre overflow-x-auto shadow-inner">
{`POST /api/transfer HTTP/1.1
Content-Type: application/json

{
  "from": "user_123",
  "to": "attacker_wallet",
  "amount": 10000000
}`}
                </div>
                <div className="mt-3 text-xs text-slate-400">
                    攻撃者はAPIリクエストを改ざんしました。受理されるには正しい署名が必要です。
                </div>
            </div>

            {/* Attack Control */}
            <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl shadow-lg">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">2. Attack Control</h3>
                
                <div className="mb-4">
                    <span className="text-xs text-slate-400 block mb-2">Forged HMAC (Hex)</span>
                    <div className="font-mono text-xl bg-black p-4 rounded border border-slate-600 flex items-center tracking-widest overflow-hidden shadow-inner">
                        {confirmed.split('').map((char, idx) => (
                            <span key={idx} className={`
                                w-6 text-center transition-colors
                                ${idx < currentByteIndex ? 'text-emerald-500 font-bold' : ''}
                                ${idx === currentByteIndex && running ? 'text-yellow-400 bg-yellow-900/30' : 'text-slate-600'}
                            `}>
                                {idx === currentByteIndex && running ? tryingChar : char}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-700 flex flex-col gap-4">
                    <button
                        onClick={running ? stopAttack : runAttack}
                        className={`w-full py-3 rounded font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg
                            ${running 
                                ? 'bg-slate-700 text-slate-300 border border-slate-600' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
                            }`}
                    >
                        {running ? 'ABORT ATTACK' : 'START BRUTE-FORCE'}
                    </button>
                </div>
            </div>

            {/* Console Output */}
            <div className="h-48 bg-black border border-slate-700 rounded-xl p-4 font-mono text-xs overflow-y-auto custom-scrollbar shadow-inner">
                {logs.length === 0 && <span className="text-slate-600">_ Ready for analysis.</span>}
                {logs.map((log, i) => (
                    <div key={i} className={`border-b border-slate-900/60 py-1 ${
                        log.includes('SUCCESS') ? 'text-emerald-400 font-bold bg-emerald-900/10' :
                        log.includes('FAILED') ? 'text-red-400' :
                        log.includes('HIT') ? 'text-yellow-400 font-bold' :
                        'text-slate-400'
                    }`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>

        {/* Right Col: Server Simulation */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Live Code Inspector */}
            <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-indigo-400" /> 
                        Active Server Logic
                    </h3>
                    
                    {/* Mode Toggle Switch */}
                    <button 
                        onClick={() => setInsecure(!insecure)}
                        className={`text-xs px-3 py-1.5 rounded border font-bold transition-all flex items-center gap-2 ${insecure 
                            ? 'bg-red-950/50 border-red-800 text-red-400 hover:bg-red-900/50' 
                            : 'bg-emerald-950/50 border-emerald-800 text-emerald-400 hover:bg-emerald-900/50'}`}
                    >
                        {insecure ? (
                           <><AlertTriangle className="w-3 h-3"/> Mode: Insecure (Vulnerable)</>
                        ) : (
                           <><CheckCircle className="w-3 h-3"/> Mode: Secure (Safe)</>
                        )}
                    </button>
                </div>

                {/* Code Block Area */}
                <div className="relative group">
                    <div className={`absolute top-0 left-0 w-1 h-full rounded-l ${insecure ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <pre className="font-mono text-xs bg-black p-4 pl-6 rounded border border-slate-700 overflow-x-auto leading-relaxed shadow-inner transition-colors duration-300">
                        <code className={insecure ? "text-red-100" : "text-emerald-100"}>
                            {insecure ? SNIPPET_INSECURE : SNIPPET_SECURE}
                        </code>
                    </pre>
                </div>
            </div>

            {/* Latency Visualizer */}
            <div className="flex-1 bg-slate-900 border border-slate-700 p-5 rounded-xl shadow-lg flex flex-col relative">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" /> 
                        Response Latency (Execution Time)
                    </h3>
                    {running && (
                        <div className="flex items-center gap-2 text-xs text-yellow-400 font-bold animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                            Probing Byte {currentByteIndex}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-h-[250px] bg-black/40 rounded border border-slate-700 relative p-2">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <XAxis dataKey="char" stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit="ms" />
                                <Tooltip 
                                    cursor={{fill: '#1e293b'}}
                                    contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '12px'}}
                                />
                                <Bar dataKey="time" radius={[2, 2, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.isHit ? '#10b981' : (insecure && entry.time > 100 ? '#f59e0b' : '#3b82f6')} 
                                            stroke={entry.isHit ? '#34d399' : 'none'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-600 flex-col gap-3">
                            <Activity className="w-10 h-10 opacity-30" />
                            <span className="text-sm">Waiting for traffic...</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </SectionLayout>
  )
}