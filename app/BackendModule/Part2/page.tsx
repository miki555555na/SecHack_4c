"use client"

import React, { useState, useRef } from 'react'
import SectionLayout from '../../Framework/SectionLayout'
import { FileJson, Server, ShieldAlert, ShieldCheck, Activity, Info, Play, Eye, Lock, Terminal } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// --- 設定値 ---
const SECRET = 'a1b2c3d4' // デモ用の正解署名
const HMAC_LENGTH = 8
const DELAY_PER_CHAR = 50 // ms
const HEX_CHARS = '0123456789abcdef'.split('')

// --- ユーティリティ ---
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

// サーバーの挙動をシミュレートする関数
async function simulateServerResponse(candidate: string, insecure: boolean) {
  const correct = SECRET // 正解の署名
  const len = correct.length

  if (insecure) {
    // 【脆弱な実装】: 文字列比較における「早期リターン (Early Return)」
    // 不一致が発生した時点で処理を中断するため、処理時間は「前方一致している文字数」に比例する。
    for (let i = 0; i < len; i++) {
      if (candidate[i] === correct[i]) {
        await sleep(DELAY_PER_CHAR) 
      } else {
        return { ok: false } 
      }
    }
    return { ok: true }
  } else {
    // 【安全な実装】: 固定時間比較 (Constant-Time Comparison)
    // 内容の正誤に関わらず、必ず全バイトをスキャンしてから結果を返す。
    for (let i = 0; i < len; i++) {
      const a = candidate.charCodeAt(i) || 0
      const b = correct.charCodeAt(i)
      const _ = (a ^ b) & 0xff // 最適化防止用のダミー演算
      await sleep(DELAY_PER_CHAR) 
    }
    const ok = candidate === correct
    return { ok }
  }
}

export default function Part2Page() {
  const [insecure, setInsecure] = useState(true)
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState<string>(''.padEnd(HMAC_LENGTH, '?'))
  const [confirmed, setConfirmed] = useState<string>(''.padEnd(HMAC_LENGTH, '_'))
  const [position, setPosition] = useState(0)
  const [chartData, setChartData] = useState<Array<{ char: string; time: number; isHit?: boolean }>>([])
  
  const abortRef = useRef(false)
  const verifyingRef = useRef(false)

  // ログ追加
  function appendLog(line: string) {
    setLogs((s) => [...s, line].slice(-100))
  }

  // 攻撃停止
  function stopAttack() {
    abortRef.current = true
    setRunning(false)
  }

  // 攻撃実行ロジック
  async function runAttack() {
    abortRef.current = false
    setRunning(true)
    setLogs([])
    setChartData([])
    setConfirmed(''.padEnd(HMAC_LENGTH, '_'))
    setCurrentGuess(''.padEnd(HMAC_LENGTH, '?'))

    for (let pos = 0; pos < HMAC_LENGTH; pos++) {
      if (abortRef.current) break
      setPosition(pos)
      appendLog(`--- [Byte ${pos + 1}] 解析開始 ---`)

      const roundData: Array<{ char: string; time: number; isHit?: boolean }> = []
      let bestChar = ''
      let bestTime = -Infinity

      // 0〜f まで総当たり
      for (const ch of HEX_CHARS) {
        if (abortRef.current) break
        
        // 既知の部分 + 今回の推測文字 + 残りの埋め草
        let candidateArr = confirmed.split('').map((c) => (c === '_' ? '0' : c))
        candidateArr[pos] = ch
        const candidate = candidateArr.join('')
        setCurrentGuess(candidate) // 画面更新

        // 計測開始
        const t0 = performance.now()
        verifyingRef.current = true
        const res = await simulateServerResponse(candidate, insecure)
        verifyingRef.current = false
        const t1 = performance.now()
        const elapsed = Math.round(t1 - t0)

        roundData.push({ char: ch, time: elapsed, isHit: res.ok })
        setChartData([...roundData]) 

        if (elapsed > bestTime) {
          bestTime = elapsed
          bestChar = ch
        }
        await sleep(10) // UI更新のための微小ウェイト
      }

      if (abortRef.current) break

      // 結果判定
      if (insecure) {
        // 最も処理時間が長かった文字 ＝ サーバー側でループが長く回った文字 ＝ 正解
        appendLog(`判定: '${bestChar}' の応答遅延を検知 (${bestTime}ms) → 確定`)
        setConfirmed((prev) => prev.split('').map((c, i) => (i === pos ? bestChar : c)).join(''))
      } else {
        // 安全モードでは時間差が出ない
        appendLog(`判定: 応答時間に有意な差なし。推測不可。`)
        const randomChar = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]
        setConfirmed((prev) => prev.split('').map((c, i) => (i === pos ? randomChar : c)).join(''))
      }
      
      await sleep(200)
    }

    // 最終結果確認
    const final = confirmed.split('').map((c) => (c === '_' ? '0' : c)).join('')
    const finalRes = await simulateServerResponse(final, insecure)
    if (finalRes.ok) {
      appendLog('【SUCCESS】 HMAC署名の再構築に成功。改ざんデータが受理されました。')
    } else {
      appendLog('【FAILURE】 HMAC署名不一致。データは拒否されました。')
    }
    setRunning(false)
  }

  // --- 解説コンテンツ（技術ベース） ---
  const knowledgeBase = (
    <div className="space-y-6 text-slate-200">
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-400 mb-2">
          <Info className="w-5 h-5" /> HMACとは（技術的定義）
        </h3>
        <p className="text-sm leading-relaxed mb-3">
          <strong>HMAC (Hash-based Message Authentication Code)</strong> は、データの「完全性（改ざんされていないこと）」と「認証（送信元が正しいこと）」を検証するための技術です。
        </p>
        
        <ul className="list-disc list-inside text-sm space-y-2 text-slate-300">
          <li><strong>仕組み:</strong> データ本体と「秘密鍵」を組み合わせてハッシュ値を計算します。</li>
          <li><strong>特性:</strong> 秘密鍵を持たない攻撃者が、改ざんしたデータ（ペイロード）に対して正しいHMACを生成することは計算論的に不可能です。</li>
          <li><strong>今回の攻撃手法:</strong> HMACそのものを破るのではなく、サーバー側の「検証ロジックの不備（処理時間の漏洩）」を利用して、正しいHMAC値を1バイトずつ特定します（サイドチャネル攻撃）。</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <h4 className="font-bold text-red-400 mb-2">🚫 脆弱な実装 (Early Return)</h4>
          <pre className="bg-black/50 p-2 rounded text-xs font-mono text-slate-400 overflow-x-auto mb-2">
{`for (i=0; i<len; i++) {
  if (a[i] !== b[i]) 
    return false; // 即時終了
}`}
          </pre>
          <p className="text-xs text-slate-300">
            不一致が見つかった瞬間に処理を終了します。これにより、<strong>「何文字目まで合っていたか」が処理時間として外部に漏洩</strong>します。
          </p>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <h4 className="font-bold text-emerald-400 mb-2">✅ 安全な実装 (Constant Time)</h4>
          <pre className="bg-black/50 p-2 rounded text-xs font-mono text-slate-400 overflow-x-auto mb-2">
{`let result = 0;
for (i=0; i<len; i++) {
  result |= a[i] ^ b[i]; 
}
return result === 0;`}
          </pre>
          <p className="text-xs text-slate-300">
             不一致があっても必ず最後までループを回します。計算量は常に一定となり、タイミング情報による推測を防ぎます（Node.jsでは <code>crypto.timingSafeEqual</code> を使用）。
          </p>
        </div>
      </div>
    </div>
  )

  const steps = (
    <div className="mb-6">
       <h2 className="text-base font-semibold text-black mb-2">🎮 シミュレーション手順</h2>
         <ol className="list-decimal list-inside text-sm space-y-1">
           <li><span className="text-black">左パネルの「ターゲットJSON」を確認してください。攻撃者によりパラメータが改ざんされています。</span></li>
           <li><span className="text-black"><strong>「脆弱な検証（Insecure）」</strong>モードで攻撃を開始し、処理時間のばらつき（グラフの変化）を観察します。</span></li>
           <li><span className="text-black">処理時間の長い文字が「正解」として特定され、HMACが復元されていく様子を確認します。</span></li>
           <li><span className="text-black">次に<strong>「脆弱な検証」をオフ</strong>にして攻撃し、対策済みの環境では処理時間が一定になり、攻撃が成立しないことを確認します。</span></li>
         </ol>
    </div>
  )

  return (
    <SectionLayout
      title1="2. HMAC検証におけるタイミング攻撃"
      title2="データ完全性と比較アルゴリズムの脆弱性"
      description="APIリクエストの署名検証ロジックにおいて、単純な文字列比較（早期リターン）を使用した場合のリスクを検証します。応答時間の差異（サイドチャネル）を利用し、秘密鍵なしで署名を偽造するプロセスをシミュレートします。"
      checklist={knowledgeBase}
      stickyChecklist={false}
    >
      {steps}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 攻撃者画面 */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Terminal className="w-32 h-32 text-white" />
          </div>
          
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <FileJson className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-white">Attacker Simulator</h3>
          </div>

          <div className="space-y-4 relative z-10">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Payload (Tampered)</label>
              <div className="mt-1 bg-black p-3 rounded border border-slate-700 font-mono text-sm text-green-400">
                {`{
  "user": "attacker",
  "role": "admin",      // 権限昇格の試行
  "amount": 10000000    // 不正送金の試行
}`}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Brute-forcing HMAC</label>
              <div className="mt-1 flex items-center gap-1 font-mono text-2xl bg-black/50 p-3 rounded border border-slate-700 overflow-x-auto">
                {confirmed.split('').map((c, i) => {
                  const isScanning = i === position && running
                  if (c !== '_') return <span key={i} className="text-emerald-400 font-bold">{c}</span>
                  if (isScanning) return <span key={i} className="text-yellow-400 animate-pulse">{currentGuess[i]}</span>
                  return <span key={i} className="text-slate-600">?</span>
                })}
              </div>
              <p className="text-xs text-slate-500 mt-1">Status: {running ? `Byte ${position + 1} を解析中...` : '待機中'}</p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${insecure ? 'bg-red-600' : 'bg-emerald-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${insecure ? 'translate-x-0' : 'translate-x-4'}`} />
                  </div>
                  <span className={`text-sm font-bold ${insecure ? 'text-red-400' : 'text-emerald-400'}`}>
                    {insecure ? 'Insecure (Early Return)' : 'Secure (Constant Time)'}
                  </span>
                  <input type="checkbox" className="hidden" checked={insecure} onChange={() => setInsecure(!insecure)} />
                </label>

                <button
                  onClick={running ? stopAttack : runAttack}
                  className={`flex items-center gap-2 px-6 py-2 rounded font-bold text-white transition-all ${
                    running ? 'bg-slate-700 hover:bg-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20 shadow-lg'
                  }`}
                >
                  {running ? 'STOP' : <><Play className="w-4 h-4" /> START ATTACK</>}
                </button>
              </div>

              {/* ログウィンドウ */}
              <div className="bg-black/90 rounded border border-slate-700 p-3 h-40 overflow-y-auto font-mono text-xs text-slate-300">
                {logs.length === 0 && <span className="text-slate-500">Ready to attack...</span>}
                {logs.map((log, i) => (
                  <div key={i} className="border-b border-white/5 py-1 whitespace-nowrap">{log}</div>
                ))}
                <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: サーバー検証画面 */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-6 h-6 text-sky-500" />
            <h3 className="text-xl font-bold text-white">Server Logic & Metrics</h3>
          </div>

          <div className="flex-1 bg-slate-900/50 rounded-lg p-4 border border-slate-800 relative">
            <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Response Time Analysis
            </h4>
            
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="char" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="ms" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                      cursor={{ fill: '#1e293b' }}
                    />
                    <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isHit ? '#22c55e' : (entry.time > 100 && insecure ? '#f59e0b' : '#3b82f6')} 
                          stroke={entry.isHit ? '#4ade80' : 'none'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <Eye className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Waiting for requests...</p>
                </div>
              )}
            </div>

            {/* 結果表示アラート */}
            <div className="mt-4">
                {logs.some(l => l.includes('【SUCCESS】')) ? (
                    <Alert className="bg-red-950/40 border-red-500/50 text-red-200">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>INTEGRITY CHECK FAILED</AlertTitle>
                        <AlertDescription>署名の偽造を検知しました。不正なペイロードが処理されました。</AlertDescription>
                    </Alert>
                ) : logs.some(l => l.includes('【FAILURE】')) ? (
                    <Alert className="bg-emerald-950/40 border-emerald-500/50 text-emerald-200">
                        <ShieldCheck className="h-4 w-4" />
                        <AlertTitle>VERIFICATION FAILED (SAFE)</AlertTitle>
                        <AlertDescription>署名不一致によりリクエストは拒否されました。</AlertDescription>
                    </Alert>
                ) : (
                    <div className="text-center text-xs text-slate-500 py-2">IDLE</div>
                )}
            </div>
          </div>

          {/* 解説ミニボックス */}
          <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-500/20 rounded text-xs text-indigo-200">
            <strong>💡 Observation:</strong><br/>
            {insecure 
              ? '【危険】グラフの突出（レイテンシの増加）は、そのバイトまで検証が成功したことを示唆しています。攻撃者はこの情報をフィードバックとして利用します。' 
              : '【安全】グラフは平坦です。検証の成否に関わらず処理時間が一定であるため、攻撃者は内部状態を推測できません。'}
          </div>
        </div>
      </div>
    </SectionLayout>
  )
}