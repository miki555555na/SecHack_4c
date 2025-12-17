"use client"

import React, { useState, useRef, useEffect } from 'react'
import SectionLayout from '../../Framework/SectionLayout'
import { styles } from '../../Framework/SectionStyles'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    // 最後の検証は「正解だったことにする」
      if (insecure) {
        setAttackStatus('success')
        appendLog(">> RESULT: HMAC fully matched.")
        appendLog(">> SERVER: Signature verification succeeded.")
      } else {
        setAttackStatus('fail')
        appendLog(">> RESULT: Attack Failed.")
        appendLog(">> SYSTEM: Constant-time comparison prevented leakage.")
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
    <p>
      HMACの検証処理でも、
      <b>「間違っていたら早く返した方が効率がいい」</b>と考えて、
      署名を1文字ずつ比較し、
      不一致が見つかった時点で return する実装にしていませんか？
    </p>

    <p style={{ marginTop: 6 }}>
      HMACは
      <b>秘密鍵を知らなければ正しい値を作れない</b>ため、
      「ちゃんとHMACを使っているから安全」
      と感じやすい仕組みです。
    </p>

    <p style={{ marginTop: 6 }}>
      しかしこの
      <b>効率を優先した検証方法</b>では、
      処理がどこで止まるかによって
      <b>レスポンス時間にわずかな差</b>が生まれます。
      <br />
      その差から、
      <span style={{ background: '#fef9c3', fontWeight: 500 }}>
        「どこまで署名が一致しているか」
      </span>
      を推測されてしまいます。
    </p>

    <p style={{ marginTop: 6 }}>
      この章では、
      <b>HMAC検証における早期リターンの危険性</b>と、
      <b>定数時間比較でどう防げるのか</b>を、
      実際に動かしながら確認します。
    </p>
  </>
);


    const checklist = (
        <Card style={{ border: '2px solid #aee2feff', boxShadow: '0 2px 8px #0001',background: '#f5faffff',}}>
            <CardHeader style={{ paddingBottom: 3}}>
                <CardTitle style={{ fontSize: 17, marginTop: 0 }}>📝 4章の見どころ</CardTitle>
            </CardHeader>
            <CardContent style={{ paddingTop: 0 }}>
                <ul style={{ fontSize: 15, marginLeft: 18, marginBottom: 0 }}>
                    <li>・なぜ「一致している文字数」が推測できてしまうのかを、時間の変化で確認します</li>
<li>・一見正しそうな実装が、どの点で問題になるのかをコードで見比べます</li>
<li>・実装を少し変えるだけで、結果がどう変わるのかを実行結果で確かめます</li>

                </ul>
            </CardContent>
        </Card>
    );


  const cardBaseSmall: React.CSSProperties = { background: '#fff', padding: 15, borderRadius: 8, border: '1px solid #e5e7eb' };

  const summary = (
  <Card className="border-gray-300 bg-gray-50">
    <CardHeader>
      <CardTitle className="text-lg">🔎 この章の要点</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-sm">
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          <span className="mt-0.5 rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
            注意
          </span>
          <span>
            HMAC自体は安全な仕組みですが、
            <b>「署名をどう検証するか」</b>を誤ると、
            その安全性は簡単に崩れてしまいます。
          </span>
        </li>

        <li className="flex items-start gap-3">
          <span className="mt-0.5 rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
            対策
          </span>
          <span>
            署名が正しいかどうかに関係なく、
            <b>常に同じ回数・同じ流れで比較する</b>ように実装します。
          </span>
        </li>

        <li className="text-gray-600">
          「HMACを使っているから安全」と思っていても、
          <b>検証処理に早期リターンがある</b>と、
          API トークンや署名検証でも
          同じ問題が起こり得ます。
        </li>
      </ul>
    </CardContent>
  </Card>
)


    // <section style={{ ...styles.section, background: '#f9fafb', border: '1.5px solid #e5e7eb', marginTop: 32 }}>
    //     <h2 style={{ ...styles.h2, fontSize: 22, marginBottom: 10 }}>📝 まとめ：サーバー側で行われている対策</h2>
    //     <div style={{ fontSize: 16, marginLeft: 10, color: '#4b5563', marginBottom: 15 }}>
    //         タイミング攻撃を防ぐためには、入力値によらず計算時間を一定に保つ必要があります。
    //     </div>
    //     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
    //         <div style={cardBaseSmall}>
    //             <h4 style={{ margin: '0 0 8px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a' }}>
    //                 <CheckCircle size={18} /> 実装レベルの対策
    //             </h4>
    //             <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
    //                 <li><b>定数時間比較 (Constant Time):</b> 文字列の不一致があっても途中で処理を止めず、必ず最後まで計算する。</li>
    //                 <li><b>ライブラリの利用:</b> 実務では自作せず、言語標準の安全な関数を使う。
    //                     <div style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12, marginTop: 4, display: 'inline-block' }}>
    //                        Ex: crypto.timingSafeEqual(a, b)
    //                     </div>
    //                 </li>
    //             </ul>
    //         </div>
    //         <div style={cardBaseSmall}>
    //             <h4 style={{ margin: '0 0 8px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb' }}>
    //                 <Layers size={18} /> インフラ・運用レベルの対策
    //             </h4>
    //             <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
    //                 <li><b>レート制限 (Rate Limiting):</b> 攻撃に必要な数千〜数万回のリクエスト自体を遮断する。</li>
    //                 <li><b>人工的な遅延 (Random Jitter):</b> 意図的にランダムな遅延を付与し、統計的な解析を困難にする。</li>
    //             </ul>
    //         </div>
    //     </div>
    // </section>
  //);

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
  <h2 style={styles.h2}>
    1. 脆弱性のメカニズム：署名検証の早期リターン
  </h2>

  {/* ▼ 縦並びコンテナ */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

    {/* ① HMACの概念 */}
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb' }}>
      <h3 style={{ ...styles.h3, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Shield size={20} color="#2563eb" /> HMACとは？
      </h3>

      <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>
        HMACは、データと<b>サーバーだけが知っている秘密鍵</b>を組み合わせて作る署名です。
        <br />
        サーバーは、受け取ったデータに対して
        <b>同じ秘密鍵でHMACを再計算</b>し、
        送られてきた署名と一致するかを検証します。
        <br /><br />
        <span style={{ color: '#dc2626', fontWeight: 600 }}>
          重要なのは、HMACの強度ではなく、
          「この一致確認をどう実装しているか」です。
          <br />
          検証処理に時間差があると、
          その時間自体が攻撃者へのヒントになります。
        </span>
      </p>


      {/* 図 */}
      <div style={{
        marginTop: 16,
        padding: 12,
        background: '#f3f4f6',
        borderRadius: 6,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
      }}>
        <div style={{ textAlign: 'center' }}>
          <FileDigit size={24} color="#6b7280" />
          <div style={{ fontWeight: 600 }}>Data</div>
        </div>
        <span style={{ fontSize: 20 }}>+</span>
        <div style={{ textAlign: 'center' }}>
          <KeyRound size={24} color="#eab308" />
          <div style={{ fontWeight: 600 }}>Secret Key</div>
        </div>
        <ArrowRight size={20} />
        <div style={{
          background: '#2563eb',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: 4,
          fontWeight: 700
        }}>
          HMAC
        </div>
      </div>
    </div>

    {/* ② 攻撃者の狙い */}
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb' }}>
      <h3 style={{ ...styles.h3, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Unlock size={20} color="#dc2626" /> 攻撃者の狙い：署名検証の内部挙動を読む
      </h3>

      <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>
        この攻撃の目的は、
        <b>HMACの値を直接計算することではありません</b>。
        <br /><br />
        攻撃者は、
        サーバーが署名を検証する際の
        <b>「処理時間の違い」</b>だけを観測します。
        <br />
        そして、
        「どこまで一致していたか」を
        時間から逆算します。
      </p>


      {/* APIリクエスト表現 */}
      <div style={{
        marginTop: 12,
        background: '#0f172a',
        color: '#e5e7eb',
        padding: 12,
        borderRadius: 6,
        fontFamily: 'monospace',
        fontSize: 13
      }}>
        <div>POST /api/updateProfile</div>
        <div style={{ color: '#94a3b8' }}>Content-Type: application/json</div>
        <div style={{ color: '#f87171' }}>X-Signature: ??????</div>
        <br />
        <div>{`{ "role": "admin" }`}</div>
      </div>

      <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626'}}>
        ↑ この署名を「当てられるか」が全て
      </div>

      <div style={{ marginTop: 16, fontSize: 15, color: '#374151', lineHeight: 1.6 }}>
        <br />
          また、多くの場合サーバー側では
          <b>入力回数制限が緩い、あるいは存在しない</b>ため、
          何千回・何万回ものリクエストを送ることが可能です。
          <ul style={{ fontSize: 14, marginTop: 12, background: '#f3f4f6', padding: 12, borderRadius: 6 }}>
            <li>ログイン画面：5回失敗 → ロック</li>
            <li><b>APIエンドポイント：1万回送っても止まらない</b></li>
          </ul>
      </div>
      

    </div>

  </div>
</section>

       <Card>
  <CardHeader>
    <CardTitle>
      シミュレーション：時間差を利用した署名検証の突破
    </CardTitle>
    <CardDescription>
      <p>
        署名検証における脆弱な実装と、安全な実装を比較しながら、
        API が内部情報を漏らしてしまうリスクを体感しましょう。
      </p>
    </CardDescription>
  </CardHeader>

  <hr style={{ border: 'none', height: 1, background: '#e5e7eb', margin: '3px 0' }} />

  <CardContent>
    <div style={styles.comparison}>
      
      {/* 脆弱な実装 */}
      <div style={styles.comparisonColumn}>
        <p style={{ fontSize: 17, marginBottom: 12 }}>
          <span style={{ color:'#dc2626', fontWeight: 600 }}>
            脆弱な実装
          </span>
          では、
          署名の<b>不一致が見つかった時点で処理を終了</b>するため、
          <b>どこまで正しかったかが処理時間として観測できます</b>。
          <br />
        </p>

        <div
          style={{
            ...styles.codeContainer,
            background: '#fef2f2',
            border: '3px solid #fca5a5'
          }}
        >
          <div style={{ ...styles.codeLabel, color: '#dc2626' }}>
            ⚠️ 脆弱な実装
          </div>

          <pre style={styles.code}>
{`function verifyHMAC(received, expected) {
  for (let i = 0; i < expected.length; i++) {
    // ⚠️ 不一致が見つかった瞬間に処理が終わる
`}    <span style={{
  background: '#ef4444',
  color: '#fff',
  padding: '2px 4px',
  borderRadius: '3px',
  fontWeight: 'bold'
}}>{`if (received[i] !== expected[i]) return false;`}</span>{`
  }
  return true;
}`}
          </pre>
        </div>
      </div>

      {/* 安全な実装 */}
      <div style={styles.comparisonColumn}>
        <p style={{ fontSize: 17, marginBottom: 12 }}>
          <span style={{ color:'#138c40ff', fontWeight: 600 }}>
            安全な実装
          </span>
          では、
          検証結果に関係なく
          <b>必ず同じ回数の処理</b>を行います。
          そのため、
          API の応答時間から
          <b>署名の正しさを推測することはできません</b>。
        </p>

        <div
          style={{
            ...styles.codeContainer,
            background: '#f0fdf4',
            border: '3px solid #86efac'
          }}
        >
          <div style={{ ...styles.codeLabel, color: '#16a34a' }}>
            ✓ 安全な実装
          </div>

          <pre style={styles.code}>
{`function verifyHMAC(received, expected) {
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    // ✓ 差分を蓄積し、途中で終了しない
`}    <span style={{
  background: '#429460',
  color: '#fff',
  padding: '2px 4px',
  borderRadius: '3px',
  fontWeight: 'bold'
}}>{`diff |= received[i] ^ expected[i];`}</span>{`
  }
  return diff === 0;
}`}
          </pre>
        </div>
        <div className="text-xs text-gray-500 mt-2">
※このコードは「時間差が生まれる仕組み」を理解するための
  簡略化した例です。<br></br>
  　実務では crypto.timingSafeEqual などの
  標準APIを必ず使用してください。
</div>

      </div>
    </div>
  </CardContent>
</Card>

<Card style={{ marginTop: 24 }}>
        <CardHeader>
          <CardTitle>HMAC署名検証デモ：実行時間の差を体感しよう</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
            <h3 style={{ ...styles.h3, marginTop: 10, color: '#0f172a' }}>🚀 試してみよう！</h3>
            
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
                targetInfoBase={{ marginBottom: 12 }}
                hmacBoxBase={{ display: 'flex', gap: 4, marginBottom: 12 }}
                logAreaBase={{ flexGrow: 1, overflowY: 'auto', fontSize: 12, background: '#0f172a', padding: 10, borderRadius: 4 }}
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
              <ResponseChart 
                rightPanelBase={rightPanelBase} 
                chartData={chartData} 
                insecure={insecure} 
                running={running} 
              />
            </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <SectionLayout
      title1="4. HMACタイミング攻撃"
      title2="〜 署名検証の早期リターンによる情報漏洩 〜"
      description={description}
      summary={summary}
      checklist={checklist}
    >
      {children}
    </SectionLayout>
  )
}