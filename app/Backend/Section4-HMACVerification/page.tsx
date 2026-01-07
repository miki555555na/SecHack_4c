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
  Code2,
  ArrowDown,
  Underline
} from 'lucide-react'
import AttackConsole from './AttackConsole'
import ResponseChart from './ResponseChart'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts'
import { color } from 'framer-motion';

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
  console.log('[DEBUG appendLog] adding:', line); // 追加
  setLogs((s) => {
    const next = [...s, line].slice(-50);
    console.log('[DEBUG logs next length]', next.length); // 追加
    return next;
  });
}

useEffect(() => {
  console.log('[DEBUG logs changed]', logs); // 追加：state 変更を監視
  if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
}, [logs]);

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
    <p className="text-lg font-medium">
    前の章で見た
    <span className="bg-yellow-100 px-1 rounded">
      「処理時間がヒントになる」
    </span>
    という話、
    実はパスワードだけの問題ではありません。
  </p>

  <p className="mt-2 text-lg font-medium">
    同じことが、
    <b>API署名</b>や<b>トークン検証</b>といった
    「より重要な処理」でも起こります。
  </p><br />
  </>
);

    const checklist = (
        <Card style={{ border: '2px solid #aee2feff', boxShadow: '0 2px 8px #0001',background: '#f5faffff',}}>
            <CardHeader style={{ paddingBottom: 3}}>
                <CardTitle style={{ fontSize: 17, marginTop: 0 }}>📝 4章の見どころ</CardTitle>
            </CardHeader>
            <CardContent style={{ paddingTop: 0 }}>
                <ul style={{ fontSize: 15, marginLeft: 18, marginBottom: 0 }}>
                    <li>・パスワード以外でも、同じ時間差の問題は起きる？</li>
                    <li>・署名検証の処理時間から、何が分かってしまう？</li>
                    <li>・コードを少し変えるだけで、結果はどう変わる？</li><br />
                    <ul style={{ fontSize: 16, marginTop: 5,  }}>
                      <b>→ 実際に動かしながら確認します</b>
                    </ul>
                </ul>
            </CardContent>
        </Card>
    );


  const cardBaseSmall: React.CSSProperties = { background: '#fff', padding: 15, borderRadius: 8, border: '1px solid #e5e7eb' };
const summary = (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-bold">
        4章のまとめ
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6 text-sm">

    {/* 見どころ回収 */}
    <div
      className="rounded-md border p-4"
      style={{
        background: '#f5faff',
        borderColor: '#aee2fe',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}
    >
      <p className="font-semibold mb-3 text-slate-800" style={{ fontSize: 16 }}>
        この章のはじめに投げた問い、答えはこうでした
      </p>

      <ul className="space-y-2 text-gray-700">
        <li>
          <b>Q.</b> パスワード以外でも、同じ時間差の問題は起きる？
          <br />
          <span className="ml-4">
            <b>→ API署名やトークン検証でも起きる</b>
          </span>
        </li>

        <li>
          <b>Q.</b> 処理時間から、何が分かってしまう？
          <br />
          <span className="ml-4">
            <b>→ 署名が「どこまで一致しているか」</b>
          </span>
        </li>

        <li>
          <b>Q.</b> コードを少し変えると、結果はどう変わる？
          <br />
          <span className="ml-4">
            <b>→ 同じ処理でも、安全にも危険にもなる</b>
          </span>
        </li>
      </ul>
    </div>
    <div
    className="rounded-md bg-white p-4 text-gray-800"
    style={{ lineHeight: 1.8 }}
  >
      <p style={{ fontSize: 16 }}>
        この章で見た問題は、
        <b>HMACの仕組みそのものが弱い</b>から起きたわけではありません。
        <br />
        本当に問題になるのは、
        <span style={{ color: '#4f46e5', fontWeight: 600 }}>
          「HMACをどう比較しているか」
        </span>
        です。
      </p><br />

      <p style={{ fontSize: 16 }}>
        「HMACを使っているから安全」と思っていても、
        検証処理に<b>早期リターン</b>があると、
        処理時間から
        <b>署名の正しさを推測される</b>可能性があります。
      </p>

      <p style={{ fontSize: 16 }}>
        秘密情報を比較する処理では、
        正解・不正解に関係なく、
        <span style={{ color: '#4f46e5', fontWeight: 600 }}>常に同じ流れ・同じ回数で処理する</span>
        ことが重要です。
        <br />
        実務では
        <code className="mx-1 rounded bg-gray-100 px-1">
          timingSafeEqual
        </code>
        などの
        <b>標準APIを使う</b>のが基本になります。
      </p>

      <div className="mt-4 pt-3 border-t text-gray-700 font-medium">
        パスワードで起きた問題は、
        署名検証やトークン検証でも
        <b>形を変えて現れます</b>。
        <br />
        「秘密を扱う比較処理」は、
        <b>常に攻撃者に観測されている前提</b>で
        設計しましょう。
      </div>
    </div>
  </CardContent>
</Card>
)



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
  {/* ▼ 縦並びコンテナ */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

    {/* ① HMACの概念 */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>


  <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb' }}>
    <h3 style={{ ...styles.h3, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
      <Shield size={20} color="#2563eb" /> HMACとは？
    </h3>

    {/* 一言まとめ */}
    <p style={{ fontSize: 17, fontWeight: 600, color: '#1f2937', marginBottom: 10 }}>
      HMACは<span className="text-indigo-600">「送られてきたデータは本物か？」「通信している相手は本物か？」</span>を確かめるための仕組みです。
    </p>

    {/* やさしい説明 */}
    <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}>
      HMACでは、<b>送信者と受信者だけが知っている秘密の鍵(共通鍵)</b>を使います。
      <br />
      この鍵を使ってデータから<b>目印（HMAC）</b>を作り、
      データと一緒に送ります。
    </p>

    {/* 手順を分解 */}
    <ul style={{ marginTop: 12, marginLeft: 18, fontSize: 15, lineHeight: 1.7, color: '#374151' }}>
      <li><b>送信者</b>：1.データ＋秘密の鍵 → HMACを作る<br />
      <b>　　　　</b>2.データとHMACを一緒に送る</li>
      <li><b>受信者</b>：1.あらかじめ共有している同じ鍵でHMACを作り直す<br />
      <b>　　　　</b>2.送られてきたHMACと比較する</li><br />

      <li>HMACが</li>
      <li><b>一致したら</b>：「途中で改ざんされていない」「送信者も正しい」と分かる</li>
      <li><b>一致しなかったら</b>：改ざんされているか、送信者が偽物と分かる</li>
    </ul>

    {/* 図（説明しすぎない） */}
    <div
      style={{
        marginTop: 16,
        padding: 12,
        background: '#f3f4f6',
        borderRadius: 6,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
      }}
    >
      <div
        style={{
          marginTop: 16,
          padding: 16,
          background: '#f3f4f6',
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 25
        }}
      >
        {/* 送信者 */}
        <div style={{ flex: 1, textAlign: 'center', width: 150 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>送信者</div>
            <div style={{ display: 'flex', marginLeft: 20, gap: 8 }}>
              <div>
                <FileDigit size={22} color="#6b7280" />
                <div>データ</div>
              </div>
              <span style={{ fontSize: 18 }}>＋</span>
              <div>
                <KeyRound size={22} color="#eab308" />
                <div>秘密の鍵</div>
              </div>
            </div>
            <ArrowDown size={18} style={{ margin: '10px auto' }} />
            <div
              style={{
                background: '#2563eb',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: 4,
                fontWeight: 700,
                display: 'inline-block'
              }}
            >
              HMAC
            </div>
            <ArrowDown size={18} style={{ margin: '10px auto' }} />
          <div style={{ fontWeight: 600 }}>データ + HMAC</div>
        </div>

        {/* 矢印 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ArrowRight size={28} />
        </div>

        {/* 受信者 */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>受信者</div>
          <div style={{ fontWeight: 400, marginBottom: 6 }}>受信したデータ'+HMAC</div>
          <ArrowDown size={18} style={{ margin: '10px auto' }} />
          <div style={{ display: 'flex', marginLeft: 17, gap: 8 }}>
            <div>
              <FileDigit size={22} color="#6b7280" />
              <div>データ'</div>
            </div>
            <span style={{ fontSize: 18 }}>＋</span>
            <div>
              <KeyRound size={22} color="#eab308" />
              <div>秘密の鍵</div>
            </div>
          </div>
          <ArrowDown size={18} style={{ margin: '10px auto' }} />
          <div
            style={{
              background: '#2563eb',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 4,
              fontWeight: 700,
              display: 'inline-block'
            }}
          >
            HMAC'
          </div>
          <ArrowDown size={18} style={{ margin: '10px auto' }} />
          <div
            style={{
              background: '#e5e7eb',
              padding: '4px 8px',
              borderRadius: 4,
              fontWeight: 600
            }}
          >
            HMAC == HMAC'
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ArrowRight size={28} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop:30 }}>
          {/* 一致した場合 */}
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #86efac',
              borderRadius: 8,
              padding: '8px 12px',
              maxWidth: 260
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
              一致した場合
            </div>
            <div style={{ fontSize: 13, color: '#065f46', lineHeight: 1.5 }}>
              データは途中で改ざんされておらず、<br />
              <b>送信者も正しい</b>と判断できます。
            </div>
          </div>

          {/* 一致しなかった場合 */}
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: 8,
              padding: '8px 12px',
              maxWidth: 260
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
              一致しなかった場合
            </div>
            <div style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.5 }}>
              <b>データが改ざんされた、</b><br />
              もしくは<b>送信者がなりすましの可能性</b>があります。
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* 補足（軽く） */}
    <p style={{ marginTop: 12, fontSize: 14, color: '#6b7280' }}>
      ※ HMACは、データの完全性(改ざんされていないこと)と認証(正しい送信者であること)を保証するために広く使われています。<br />
    </p>
  </div>
</div>
  {/* ② 攻撃者の目的 */}
  <div style={{ background: '#fff', padding: 24, borderRadius: 10, border: '1px solid #e5e7eb' }}>
    <h3 style={{ ...styles.h3, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
      <Unlock size={20} color="#dc2626" />
      攻撃者のしていること
    </h3>

    {/* 一言サマリー */}
    <div style={{
      borderRadius: 8,
      marginBottom: 16
    }}>
      <p style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
        攻撃者は、HMACを「自分で作る」のではなく  
        <span className="text-indigo-600">受信者のサーバーの反応を使って少しずつ当てていきます</span>。
      </p>
    </div>

    {/* 直感的な説明 */}
    <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}>
      HMACは本来、
      <b>秘密の鍵を知らなければ正しい値を作れない</b>ため、
      安全そうに見える仕組みです。
      <br /><br />
      しかし、HMACを
      <b>先頭から順番に比較し、途中で不一致が見つかると処理を止める</b>
      実装の場合、処理時間にわずかな差が生まれます。 <br />

        この時間差から攻撃者は、
        <b>「HMACのどこまでが一致しているか」</b>
        を推測できます。
        <br />
        これを繰り返すことで、
        <b>HMACを1文字ずつ特定</b>できてしまいます。
    </p>

    {/* 勘違い注意 */}
    <div style={{
      marginTop: 16,
      background: '#eef2ff',
      borderLeft: '4px solid #6366f1',
      borderRadius: 6,
      padding: 12
    }}>
      <p style={{ margin: 0, fontWeight: 600,fontSize: 15 }}>
        よくある誤解
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 14 }}>
        HMACのアルゴリズムが弱いわけではありません。<br />
        問題なのは、
        <b>「HMACをどう比較しているか」</b>です。
      </p>
    </div>

    {/* 攻撃の流れ */}
    <div style={{ marginTop: 20 }}>
      <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>攻撃の流れ</p>
      <ol style={{ fontSize: 14, lineHeight: 1.7, paddingLeft: 20 }}>
        <li>1. 受信者のサーバーはHMACを先頭から順に比較する</li>
        <li>2. 一致する文字数が多いほど処理が少し遅くなる</li>
        <li>3. 攻撃者はこの時間差を測定し、1文字ずつ推測する</li>
      </ol>
    </div>

    {/* 試行回数 */}
    <div style={{
      marginTop: 16,
      background: '#fff1f2',
      border: '1px solid #fecdd3',
      borderRadius: 8,
      padding: 12,
      fontSize: 14
    }}>
      <p style={{ margin: 0 }}>
        ログイン処理と違い、
        <b>HMAC署名は試行回数制限がないことが多い</b>ため、
        攻撃が成立しやすくなります。
      </p>
    </div>
  </div>
</div>

<br />
<Card>
  <CardHeader>
    <CardTitle style={{ marginBottom: 10 }}>
      HMAC検証処理の比較
    </CardTitle>

    <CardDescription>
      HMAC署名を検証する際の  
      <b>時間差が生まれる実装</b>と
      <b>時間差を防ぐ安全な実装</b>を
      比較して見てみましょう。
    </CardDescription>
  </CardHeader>
  <hr style={{ border: 'none', height: 0.1, background: '#e5e7eb'}} />
  <CardContent>
    <div style={styles.comparison}>
      
      {/* 脆弱な実装 */}
      <div style={styles.comparisonColumn}>
        <p style={{ fontSize: 16, marginBottom: 20, lineHeight: 1.6 }}>
          <span style={{ color:'#dc2626', fontWeight: 600 }}>
            脆弱な実装
          </span>
          では、
          <b>不一致が見つかった時点で処理を終了</b>します。
          <br />
          そのため、
          <b>どこまで一致していたかが処理時間として外部から観測可能</b>になります。
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
      <div style={styles.divider} />

      {/* 安全な実装 */}
      <div style={styles.comparisonColumn}>
        <p style={{ fontSize: 16, marginBottom: 20, lineHeight: 1.6 }}>
          <span style={{ color:'#16a34a', fontWeight: 600 }}>
            安全な実装
          </span>
          では、
          検証結果に関わらず
          <b>常に同じ回数の処理</b>を行います。
          <br />
          そのため、
          <b>応答時間から署名の正しさを推測することはできません</b>。
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
<br />

<Card>
  <CardHeader>
    <CardTitle style={{ marginBottom: 10 }}>HMAC検証デモ：実行時間の差を体感しよう</CardTitle>
    <CardDescription>
      <p>
        このデモでは、
        <b>HMACそのものではなく、「HMACの検証処理の書き方」</b>によって、
        外部から観測可能な<b>処理時間差（タイミング差）</b>が生まれることを確認します。
      </p>
      <p style={{ marginTop: 6 }}>
        同じHMAC検証でも、正解と一致しない文字が見つかった時点で
        <span style={{ fontWeight: 600 }}>returnを行う実装</span>と、正解・不正解に依らず
        <span style={{ fontWeight: 600 }}>一定の時間を行う実装</span>では、
        攻撃者から見える情報量が大きく異なります。
      </p>
    </CardDescription>
  </CardHeader>
  <hr style={{ border: 'none', height: 0.1, background: '#e5e7eb'}} />
  <CardContent className="space-y-4">      
    <h3 style={{ ...styles.h3, marginTop: 2, color: '#0f172a' }}>
      🚀 試してみよう
    </h3>
    <ol className="ml-4 space-y-4" style={{ fontSize: 16, lineHeight: 1.8 }}>
      <li>
        <div style={{ fontWeight: 700 }}>
          【ステップ1】脆弱な実装を選ぶ
        </div>
        <div style={{ color: '#475569', marginTop: 6 }}>
          まず「⚠️ 脆弱な実装（Early Return）」を選択し、
          <b>実行</b>を押してください。
          <br />
          この実装では、HMACを
          <b>先頭から1文字ずつ比較し、不一致が見つかった時点で処理を終了</b>します。
        </div>
      </li>

      <li>
        <div style={{ fontWeight: 700 }}>
          【ステップ2】1文字ずつ推測される様子を見る
        </div>
        <div style={{ color: '#475569', marginTop: 6 }}>
          左のコンソールでは、
          攻撃者が
          <b>16通り（0–f）の候補</b>を順番に試し、
          <b>最も処理時間が長い文字</b>を選んでいる様子が表示されます。
          <br />
          右のグラフでは、
          <span style={{ background: '#fef9c3', padding: '2px 6px', borderRadius: 4 }}>
            正解の文字だけ処理時間が長くなる
          </span>
          ことを確認してください。
        </div>
      </li>

      <li>
        <div style={{ fontWeight: 700 }}>
          【ステップ3】HMACが少しずつ判明していく
        </div>
        <div style={{ color: '#475569', marginTop: 6 }}>
          処理時間の差を手がかりに、
          攻撃者は
          <b>HMACを1文字ずつ特定</b>していきます。
          <br />
          これは単なる総当たりではなく、
          <b>サーバー内部の処理を「時間」から読み取っている</b>
          攻撃である点に注目してください。
        </div>
      </li>

      <li>
        <div style={{ fontWeight: 700 }}>
          【ステップ4】安全な実装と比べてみる
        </div>
        <div style={{ color: '#475569', marginTop: 6 }}>
          次に「✓ 安全な実装（Constant Time）」に切り替えて、
          同じ操作を行ってみましょう。
          <br />
          今度は、
          <b>どの文字を試しても処理時間がほぼ同じ</b>になり、
          正解を推測できなくなることが分かります。
        </div>
      </li>
    </ol>


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
      title1="4. 署名は守られている、はずだった"
      title2="〜 HMAC検証に潜む同じ落とし穴 〜"
      description={description}
      summary={summary}
      checklist={checklist}
    >
      {children}
    </SectionLayout>
  )
}