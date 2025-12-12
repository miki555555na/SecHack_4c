"use client"

import React, { useState, useRef, useEffect } from 'react'
import SectionLayout from '../../Framework/SectionLayout'
import { styles } from '../../Framework/SectionStyles'
import { 
  Shield, 
  Unlock, 
  Activity, 
  Terminal, 
  CheckCircle,
  ArrowRight,
  FileDigit,
  KeyRound,
  Layers,
  Code2
} from 'lucide-react'
import AttackConsole from './AttackConsole'
import ResponseChart from './ResponseChart'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts'

// --- 設定値 ---
const CORRECT_HMAC = 'b7f2a9c4' 
const HMAC_LENGTH = 8
const DELAY_PER_BYTE = 40 
const HEX_CHARS = '0123456789abcdef'.split('')

// --- ユーティリティ ---
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

export default function HmacTimingAttackPage() {
  const [insecure, setInsecure] = useState(true)
  const [running, setRunning] = useState(false)
  const [attackStatus, setAttackStatus] = useState<'idle' | 'running' | 'success' | 'fail'>('idle')
  const [logs, setLogs] = useState<string[]>([])
  
  const [crackedHmac, setCrackedHmac] = useState<string>('0'.repeat(HMAC_LENGTH))
  const [currentByteIndex, setCurrentByteIndex] = useState(0)
  const [tryingChar, setTryingChar] = useState('')
  const [chartData, setChartData] = useState<Array<{ char: string; time: number; isHit?: boolean }>>([])
  
  const abortRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  function appendLog(line: string) {
    setLogs((s) => [...s, line].slice(-50))
  }

  // --- サーバーシミュレーション ---
  async function mockServerVerify(receivedHmac: string, isInsecure: boolean) {
    const expected = CORRECT_HMAC
    const len = expected.length
    const baseLatency = 15 

    if (isInsecure) {
      for (let i = 0; i < len; i++) {
        if (receivedHmac[i] !== expected[i]) {
          return { 
            valid: false, 
            latency: baseLatency + (i * DELAY_PER_BYTE) 
          }
        }
        await sleep(DELAY_PER_BYTE)
      }
      return { valid: true, latency: baseLatency + (len * DELAY_PER_BYTE) }
    } else {
      let result = 0
      for (let i = 0; i < len; i++) {
        const a = receivedHmac.charCodeAt(i) || 0
        const b = expected.charCodeAt(i)
        result |= a ^ b
        await sleep(DELAY_PER_BYTE)
      }
      return { 
        valid: result === 0, 
        latency: baseLatency + (len * DELAY_PER_BYTE) 
      }
    }
  }

  // --- 攻撃実行 ---
  async function runAttack() {
    abortRef.current = false
    setRunning(true)
    setAttackStatus('running')
    setLogs([])
    setChartData([])
    
    let currentKnown = '0'.repeat(HMAC_LENGTH)
    setCrackedHmac(currentKnown)
    
    appendLog(">> TARGET: Crypto API Endpoint")
    appendLog(">> PAYLOAD: Tampered Data (role=admin)")
    appendLog(">> START: Remote Timing Analysis...")
    
    for (let pos = 0; pos < HMAC_LENGTH; pos++) {
      if (abortRef.current) break
      setCurrentByteIndex(pos)
      
      const roundMetrics: Array<{ char: string; time: number; isHit?: boolean }> = []
      let maxLatency = -1
      let bestCandidate = '0'

      for (const hex of HEX_CHARS) {
        if (abortRef.current) break
        setTryingChar(hex)

        const prefix = currentKnown.substring(0, pos)
        const suffix = currentKnown.substring(pos + 1)
        const payloadHmac = prefix + hex + suffix
        
        const res = await mockServerVerify(payloadHmac, insecure)
        const isHitInternal = insecure && (hex === CORRECT_HMAC[pos])
        
        roundMetrics.push({ char: hex, time: res.latency, isHit: isHitInternal })
        setChartData([...roundMetrics]) 

        if (res.latency > maxLatency) {
          maxLatency = res.latency
          bestCandidate = hex
        }
        await sleep(15)
      }

      if (abortRef.current) break

      if (insecure) {
        appendLog(`[Byte ${pos}] LEAKAGE DETECTED: '${bestCandidate}' (${maxLatency}ms)`)
        const chars = currentKnown.split('')
        chars[pos] = bestCandidate
        currentKnown = chars.join('')
        setCrackedHmac(currentKnown)
      } else {
        appendLog(`[Byte ${pos}] FAILED: No timing difference observed.`)
        // 安全な場合はランダムな文字を入れて攻撃失敗を演出
        const randomHex = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]
        const chars = currentKnown.split('')
        chars[pos] = randomHex
        currentKnown = chars.join('')
        setCrackedHmac(currentKnown)
      }
      
      await sleep(100)
    }

    const finalCheck = await mockServerVerify(currentKnown, insecure)
    if (finalCheck.valid) {
      setAttackStatus('success')
      appendLog(">> RESULT: Signature Forged Successfully.")
      appendLog(">> SYSTEM: Access Granted as Admin.")
    } else {
      setAttackStatus('fail')
      appendLog(">> RESULT: Attack Failed.")
      appendLog(">> SYSTEM: Invalid Signature.")
    }
    setRunning(false)
  }

  function stopAttack() {
    abortRef.current = true
    setRunning(false)
    setAttackStatus('idle')
    appendLog(">> ABORTED BY USER.")
  }

  // --- コンテンツ定義 ---

  const description = (
    <>
        <b>署名検証ロジックの処理時間差（タイミング攻撃）</b>に起因する脆弱性について学習します。
        <br/><br/>
        HMACの比較処理において、文字が不一致だった時点で即座に処理を中断する<b>「早期リターン (Early Return)」</b>の実装になっていると、
        処理にかかった時間のわずかな差から「何文字目まで合っているか」が外部に漏洩してしまいます。
        <br/>
        このセクションでは、そのメカニズムと、<b>定数時間比較 (Constant Time Comparison)</b> による対策をシミュレーションします。
    </>
  );

  const cardBaseSmall: React.CSSProperties = { background: '#fff', padding: 15, borderRadius: 8, border: '1px solid #e5e7eb' };

  const summary = (
    <section style={{ ...styles.section, background: '#f9fafb', border: '1.5px solid #e5e7eb', marginTop: 32 }}>
        <h2 style={{ ...styles.h2, fontSize: 22, marginBottom: 10 }}>📝 まとめ：サーバー側で行われている対策</h2>
        <div style={{ fontSize: 16, marginLeft: 10, color: '#4b5563', marginBottom: 15 }}>
            タイミング攻撃を防ぐためには、入力値によらず計算時間を一定に保つ必要があります。
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div style={cardBaseSmall}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a' }}>
                    <CheckCircle size={18} /> 実装レベルの対策
                </h4>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    <li><b>定数時間比較 (Constant Time):</b> 文字列の不一致があっても途中で処理を止めず、必ず最後まで計算する。</li>
                    <li><b>ライブラリの利用:</b> 実務では自作せず、言語標準の安全な関数を使う。
                        <div style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12, marginTop: 4, display: 'inline-block' }}>
                           Ex: crypto.timingSafeEqual(a, b)
                        </div>
                    </li>
                </ul>
            </div>
            <div style={cardBaseSmall}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb' }}>
                    <Layers size={18} /> インフラ・運用レベルの対策
                </h4>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    <li><b>レート制限 (Rate Limiting):</b> 攻撃に必要な数千〜数万回のリクエスト自体を遮断する。</li>
                    <li><b>人工的な遅延 (Random Jitter):</b> 意図的にランダムな遅延を付与し、統計的な解析を困難にする。</li>
                </ul>
            </div>
        </div>
    </section>
  );

  const btnBase: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 600
  };
  const active = { boxShadow: '0 0 0 3px rgba(99,102,241,0.08)' };
  
  const darkPanelBase: React.CSSProperties = { background: '#1f2937', borderRadius: 8, padding: 15, display: 'flex', flexDirection: 'column', color: '#e5e7eb' };
  const targetInfoBase: React.CSSProperties = { background: '#000', padding: 10, borderRadius: 4, fontFamily: 'monospace', fontSize: 12, marginBottom: 15, border: '1px solid #374151' };
  const hmacBoxBase: React.CSSProperties = { display: 'flex', gap: 4, justifyContent: 'center', background: '#111827', padding: 10, borderRadius: 4, border: '1px solid #374151' };
  const logAreaBase: React.CSSProperties = { flex: 1, background: '#000', borderRadius: 4, padding: 8, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11, color: '#d1d5db', border: '1px solid #374151' };
  const rightPanelBase: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 15, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' };

  const children = (
    <>
      <section style={styles.section}>
        <h2 style={styles.h2}>1. 脆弱性のメカニズム：署名検証の早期リターン</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* 左カラム: HMACの概念 */}
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <h3 style={{ ...styles.h3, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={20} color="#2563eb" /> HMACとは？
                </h3>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>
                    HMACは、データと「秘密鍵」を混ぜ合わせて作る署名です。
                    単なるハッシュ値とは異なり、<b>「鍵を持つ正規のシステム」しか正しい署名を作れません。</b>
                    これにより、データの改ざん防止（完全性）を保証します。
                </p>
                <div style={{ marginTop: 15, padding: 10, background: '#f3f4f6', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <FileDigit size={24} color="#6b7280" style={{ margin: '0 auto' }} />
                        <div style={{ fontWeight: 600, color: '#374151' }}>Data</div>
                    </div>
                    <span style={{ fontSize: 20, color: '#9ca3af' }}>+</span>
                    <div style={{ textAlign: 'center' }}>
                        <KeyRound size={24} color="#eab308" style={{ margin: '0 auto' }} />
                        <div style={{ fontWeight: 600, color: '#374151' }}>Secret Key</div>
                    </div>
                    <ArrowRight size={20} color="#9ca3af" />
                    <div style={{ textAlign: 'center', background: '#2563eb', color: '#fff', padding: '4px 10px', borderRadius: 4 }}>
                        <div style={{ fontWeight: 700 }}>HMAC</div>
                    </div>
                </div>
            </div>

            {/* 右カラム: 攻撃者の狙い */}
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <h3 style={{ ...styles.h3, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Unlock size={20} color="#dc2626" /> 攻撃者の狙い：署名の偽造
                </h3>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>
                    攻撃者は権限を「一般ユーザー」から「管理者」に書き換えたいと考えています。
                    しかし、データ改ざんをするとHMAC署名も変わってしまいます。
                    そこで、検証サーバーの応答時間を精密に計測し、<b>「書き換えたデータに対応する正しい署名」</b>を無理やり特定しようとします。
                </p>
                <div style={{ marginTop: 10, padding: 10, background: '#fef2f2', border: '1px dashed #fca5a5', borderRadius: 6, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: '#6b7280' }}>Original:</span>
                        <code>{`{ role: "user" }`}</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#dc2626' }}>
                        <span>Tampered:</span>
                        <code>{`{ role: "admin" }`}</code>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 8, color: '#dc2626', fontSize: 12 }}>
                        ↑ この改ざんデータを通すための署名を探す！
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* コード比較セクション */}
      <section style={styles.section}>
        <h2 style={styles.h2}>実装の比較：早期リターン vs 定数時間比較</h2>
        <div style={styles.comparison}>
            <div style={styles.comparisonColumn}>
                <h3 style={{...styles.h3, textDecoration: 'underline'}}><b>早期リターン (Early Return)</b></h3>
                <p style={{ fontSize: 16, marginBottom: 12 }}>
                    不一致が見つかった瞬間に <code>return false</code> しています。
                    この実装では「何文字目まで合っていたか」が処理時間に比例して漏洩します。
                </p>
                <div style={{ ...styles.codeContainer, background: '#fef2f2', border: '3px solid #fca5a5' }}>
                    <div style={{ ...styles.codeLabel, color: '#dc2626' }}>⚠️ 脆弱なコード</div>
                    <pre style={styles.code}>
{`async function verifyHMAC(recv, exp) {
  for (let i = 0; i < exp.length; i++) {
    // 不一致なら即座にリターン (時間差が発生)
    `}
<span style={{ background: '#ef4444', color: '#fff', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>{`if (recv[i] !== exp[i]) return false;`}</span>
{`
    await sleep(PROCESSING_TIME);
  }
  return true;
}`}
                    </pre>
                </div>
            </div>

            <div style={styles.comparisonColumn}>
                <h3 style={{...styles.h3, textDecoration: 'underline'}}><b>定数時間比較 (Constant Time)</b></h3>
                <p style={{ fontSize: 16, marginBottom: 12 }}>
                    結果に関わらず、<b>必ず最後までループ</b>します。
                    入力データによらず処理時間が一定になるため、外部から内部状態を推測することは不可能です。
                </p>
                <div style={{ ...styles.codeContainer, background: '#f0fdf4', border: '3px solid #86efac' }}>
                    <div style={{ ...styles.codeLabel, color: '#16a34a' }}>✓ 安全なコード</div>
                    <pre style={styles.code}>
{`async function verifyHMAC(recv, exp) {
  let result = 0;
  for (let i = 0; i < exp.length; i++) {
    // 途中でreturnせず、差異をXORで累積
    `}
<span style={{ background: '#22c55e', color: '#fff', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>{`result |= recv[i] ^ exp[i];`}</span>
{`
    await sleep(PROCESSING_TIME);
  }
  return result === 0;
}`}
                    </pre>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#166534', background: '#dcfce7', padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Code2 size={14} /> 
                        <span>Memo: 実務では <code>crypto.timingSafeEqual</code> 等の標準関数を使います。</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/*デモ */}
      <section style={{ ...styles.section, background: '#fff', border: '1px solid #e2e8f0' }}>
        <h2 style={{ ...styles.h2, marginTop: 0, marginBottom: 15 }}>🚀 攻撃シミュレーション</h2>
        <p style={{ marginBottom: 20 }}>
            攻撃者が「時間差」を利用して入力データを推測する様子を観察します。
            <b>脆弱な実装</b>では、正解の文字において処理時間のスパイク（突出）が観測されます。
        </p>

        {/* モード切替ボタン */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <button
                type="button"
                onClick={() => { setInsecure(true); setAttackStatus('idle'); }}
                style={{ ...btnBase, ...(insecure ? { borderColor: '#ef4444', background: '#fff7f7' } : {}), ...(insecure ? active : {}) }}
            >
                ⚠️ 脆弱な実装 (Early Return)
            </button>
            <button
                type="button"
                onClick={() => { setInsecure(false); setAttackStatus('idle'); }}
                style={{ ...btnBase, ...(!insecure ? { borderColor: '#16a34a', background: '#f7fffb' } : {}), ...(!insecure ? active : {}) }}
            >
                ✓ 安全な実装 (Constant Time)
            </button>
        </div>

        {/* デモ本体エリア */}
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: 20, height: 450 }}>
            
            {/* 左: 攻撃者コンソール */}
            <AttackConsole
              darkPanelBase={darkPanelBase}
              targetInfoBase={targetInfoBase}
              hmacBoxBase={hmacBoxBase}
              logAreaBase={logAreaBase}
              attackStatus={attackStatus}
              running={running}
              crackedHmac={crackedHmac}
              currentByteIndex={currentByteIndex}
              tryingChar={tryingChar}
              logs={logs}
              scrollRef={scrollRef}
              runAttack={runAttack}
              stopAttack={stopAttack}
              insecure={insecure}
            />

            {/* 右: 応答時間グラフ */}
            <ResponseChart rightPanelBase={rightPanelBase} chartData={chartData} insecure={insecure} running={running} />

        </div>
      </section>
    </>
  );

  return (
    <SectionLayout
      title1="2. HMACタイミング攻撃"
      title2="〜 署名検証の早期リターンによる情報漏洩 〜"
      description={description}
      summary={summary}
      stickyChecklist={true}
    >
      {children}
    </SectionLayout>
  )
}