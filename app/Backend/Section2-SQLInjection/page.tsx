"use client"

import React, { useState, useRef, useEffect } from 'react'
import SectionLayout from '../../Framework/SectionLayout'
import { styles } from '../../Framework/SectionStyles'
import { 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Filter,
  Lock,
  SearchCheck,
  Code
} from 'lucide-react'
import QueryPanel from './QueryPanel'
import BackendMonitor from './BackendMonitor'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const MOCK_DB_USERS = [
  { id: 1, name: 'alice', role: 'user', email: 'alice@example.com' },
  { id: 2, name: 'bob', role: 'user', email: 'bob@example.com' },
  { id: 99, name: 'admin', role: 'admin', email: 'admin@corp.secret' },
]

function sleep(ms: number) { return new Promise((res) => setTimeout(res, ms)) }

export default function SqlInjectionPage() {
  const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable')
  const [secureType, setSecureType] = useState<'prepared' | 'orm'>('prepared')
  const [enableValidation, setEnableValidation] = useState(false)
  
  const [queryInput, setQueryInput] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [queryResult, setQueryResult] = useState<any[] | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [logs])

  function appendLog(line: string) { setLogs((s) => [...s, line].slice(-20)) }

  async function executeQuery() {
    setIsExecuting(true)
    setQueryResult(null)
    appendLog(`>> REQUEST: "${queryInput}"`)
    
    await sleep(400)

    if (enableValidation) {
      appendLog(">> [1. Validation] Checking format...")
      await sleep(300)
      const isValid = /^[a-zA-Z0-9]+$/.test(queryInput)
      if (!isValid) {
        appendLog(">> [ERROR] Validation Failed: Invalid characters.")
        setIsExecuting(false)
        return
      }
      appendLog(">> [OK] Validation passed.")
    } else {
      appendLog(">> [1. Validation] SKIPPED (No checks)")
    }

    if (mode === 'secure') {
        appendLog(">> [2. Sanitization] Auto-escaping via Placeholder...")
        await sleep(200)
        appendLog(">> [OK] Special characters neutralized.")
    } else {
        appendLog(">> [2. Sanitization] SKIPPED (Raw input used)")
    }

    appendLog(`>> [3. Execution] Running SQL... [Mode: ${mode.toUpperCase()}]`)
    await sleep(400)

    let result: any[] = []
    
    if (mode === 'vulnerable') {
      const input = queryInput
      if (input.includes("' OR '1'='1") || input.includes("' OR 1=1")) {
        appendLog(">> [WARN] Injection Successful!")
        result = MOCK_DB_USERS
      } 
      else if (input.includes("--") || input.includes("#")) {
         const cleanInput = input.split(/--|#/)[0].replace(/'/g, '').trim()
         result = MOCK_DB_USERS.filter(u => u.name === cleanInput)
         if(result.length > 0) appendLog(">> [WARN] Comment Attack Detected")
      }
      else {
        const cleanName = input.replace(/'/g, '')
        result = MOCK_DB_USERS.filter(u => u.name === cleanName)
      }
    } else {
      result = MOCK_DB_USERS.filter(u => u.name === queryInput)
    }

    if (result.length > 0) appendLog(`>> RESULT: ${result.length} records found.`)
    else appendLog(">> RESULT: No records found.")
    setQueryResult(result)
    setIsExecuting(false)
  }

  const renderSqlPreview = () => {
    const validationBlock = enableValidation ? (
      <div style={{ marginBottom: 8, padding: 8, background: '#064e3b', borderRadius: 4, border: '1px solid #059669' }}>
        <div style={{color: '#6ee7b7', fontSize: 11, marginBottom: 2, fontWeight: 'bold'}}>// 1. Validation (入力検証)</div>
        <span style={{color: '#f9a8d4'}}>if</span> (!input.<span style={{color: '#fcd34d'}}>match</span>(/^[a-zA-Z0-9]+$/)) <span style={{color: '#fca5a5'}}>throw Error</span>;
      </div>
    ) : (
      <div style={{ marginBottom: 8, padding: 8, border: '1px dashed #4b5563', borderRadius: 4, opacity: 0.5 }}>
        <div style={{color: '#9ca3af', fontSize: 11}}>// 1. Validation (検証なし)</div>
      </div>
    );

    let sqlBlock;
    const displayInput = queryInput || "(input)";

    if (mode === 'vulnerable') {
      sqlBlock = (
        <div style={{ padding: 10, background: '#450a0a', borderRadius: 4, border: '1px solid #7f1d1d' }}>
           <div style={{color: '#fca5a5', fontSize: 11, marginBottom: 4, fontWeight: 'bold'}}>// 2 & 3. No Protection (脆弱: 文字列結合)</div>
           <div style={{color: '#9ca3af', fontSize: 11, marginBottom: 4}}>※ 入力値がそのままSQLの一部になります</div>
           
           <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5, color: '#e2e8f0' }}>
             <span style={{ color: '#c084fc' }}>const</span> sql = <span style={{ color: '#86efac' }}>"SELECT * FROM users WHERE name = '"</span> + <span style={{ color: '#fca5a5', fontWeight: 'bold', borderBottom: '1px solid #fca5a5' }}>input</span> + <span style={{ color: '#86efac' }}>"'"</span>;
           </div>

           <div style={{ marginTop: 10, padding: 8, background: '#1a0505', borderRadius: 4, border: '1px solid #5c1818' }}>
             <div style={{ fontSize: 10, color: '#7f1d1d', marginBottom: 2 }}>生成されるSQL:</div>
             <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#fca5a5' }}>
               SELECT * FROM users WHERE name = '<span style={{ fontWeight: 'bold', color: '#ef4444', textDecoration: 'underline' }}>{displayInput}</span>'
             </div>
           </div>
        </div>
      )
    } else if (secureType === 'prepared') {
      sqlBlock = (
        <div style={{ padding: 10, background: '#1e3a8a', borderRadius: 4, border: '1px solid #1d4ed8' }}>
           <div style={{color: '#93c5fd', fontSize: 11, marginBottom: 4, fontWeight: 'bold'}}>// 2 & 3. Placeholder (推奨: プリペアドステートメント)</div>
           <div style={{color: '#bfdbfe', fontSize: 11, marginBottom: 4, fontStyle: 'italic'}}>
             ※ 構造とデータが分離され、安全に実行されます
           </div>
           
           <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5, color: '#e2e8f0' }}>
             <span style={{ color: '#c084fc' }}>const</span> sql = <span style={{ color: '#86efac' }}>"SELECT * FROM users WHERE name = <span style={{ color: '#fcd34d', fontWeight: 'bold' }}>?</span>"</span>;
             <br/>
             <span style={{ color: '#60a5fa' }}>db</span>.execute(sql, [<span style={{ color: '#86efac', fontWeight: 'bold' }}>input</span>]);
           </div>

           <div style={{ marginTop: 10, padding: 8, background: '#0f172a', borderRadius: 4, border: '1px solid #1e40af' }}>
             <div style={{ fontSize: 10, color: '#60a5fa', marginBottom: 2 }}>実行イメージ:</div>
             <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#93c5fd' }}>
               Statement: SELECT * FROM users WHERE name = ?
               <br/>
               Parameters: ["<span style={{ color: '#86efac' }}>{displayInput}</span>"]
             </div>
           </div>
        </div>
      )
    } else {
      sqlBlock = (
        <div style={{ padding: 10, background: '#1e3a8a', borderRadius: 4, border: '1px solid #1d4ed8' }}>
           <div style={{color: '#93c5fd', fontSize: 11, marginBottom: 4, fontWeight: 'bold'}}>// 2 & 3. ORM (推奨: Prisma等)</div>
           <div style={{color: '#bfdbfe', fontSize: 11, marginBottom: 4, fontStyle: 'italic'}}>
             ※ ORMが内部でプレースホルダを使用したSQLを生成します
           </div>
           
           <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5, color: '#e2e8f0' }}>
             <span style={{ color: '#c084fc' }}>await</span> <span style={{ color: '#60a5fa' }}>prisma</span>.user.findMany({'{'}
             <br/>&nbsp;&nbsp;where: {'{'} name: <span style={{ color: '#86efac', fontWeight: 'bold' }}>input</span> {'}'}
             <br/>{'}'});
           </div>

           <div style={{ marginTop: 10, padding: 8, background: '#0f172a', borderRadius: 4, border: '1px solid #1e40af' }}>
             <div style={{ fontSize: 10, color: '#60a5fa', marginBottom: 2 }}>生成されるSQL (内部):</div>
             <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#93c5fd' }}>
               SELECT ... FROM "User" WHERE "name" = $1
               <br/>
               Parameters: ["<span style={{ color: '#86efac' }}>{displayInput}</span>"]
             </div>
           </div>
        </div>
      )
    }

    return (
      <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5 }}>
        {validationBlock}
        <div style={{ textAlign: 'center', fontSize: 16, color: '#6b7280', margin: '4px 0' }}>↓</div>
        {sqlBlock}
      </div>
    )
  }

  const description = (
    <>
        <b>SQLインジェクション</b>を完全に防ぐためには、攻撃のメカニズムを理解し、適切な防御策を講じる必要があります。
        <br/><br/>
        このページでは、エンジニア向けに<b>「入力検証 (Validation)」</b>、<b>「サニタイズ (Sanitization)」</b>、<b>「実行制限 (Restriction)」</b>の3つの防御層がどのように機能するか、実際のコードとSQL生成プロセスを通して解説します。
    </>
  );

  const summary = (
    <section style={{ ...styles.section, background: '#f9fafb', border: '1.5px solid #e5e7eb', marginTop: 32 }}>
        <h2 style={{ ...styles.h2, fontSize: 22, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={24} /> エンジニアのためのSQLインジェクション対策鉄則
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
            <div style={{ background: '#fff', padding: 15, borderRadius: 8, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, color: '#059669' }}>
                    <Filter size={18} /> 1. 入力検証 (Validation)
                </h4>
                <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, flex: 1 }}>
                    <b>「入り口で弾く」</b><br/>
                    アプリケーションの仕様として、想定外のデータ形式（例：数値フィールドへの文字列入力）を拒否します。
                    データの整合性維持にも寄与する、防御の第一歩です。
                </p>
            </div>

            <div style={{ background: '#fff', padding: 15, borderRadius: 8, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, color: '#d97706' }}>
                    <SearchCheck size={18} /> 2. サニタイズ
                </h4>
                <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, flex: 1 }}>
                    <b>「無害化する」</b><br/>
                    SQLにおいて特別な意味を持つ文字（<code>'</code> や <code>;</code> など）をエスケープします。
                    現代の開発では、<b>プレースホルダを利用することで、ライブラリ層で自動的に行わせる</b>のが標準です。
                </p>
            </div>

            <div style={{ background: '#fff', padding: 15, borderRadius: 8, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb' }}>
                    <Lock size={18} /> 3. プレースホルダ
                </h4>
                <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5, flex: 1 }}>
                    <b>「構造と値を分離する」</b><br/>
                    SQL文の構造をコンパイル時に確定させ、ユーザー入力は後から「値」としてバインドします。
                    これにより、入力値がSQLコマンドとして解釈されることを根本的に防ぎます。
                </p>
            </div>
        </div>
    </section>
  );

  const children = (
    <div style={{ fontSize: 17 }}>
      <>
      <section style={styles.section}>
        <h2 style={styles.h2}>1. 攻撃のメカニズムとSQL生成</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <h3 style={{ ...styles.h3, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={20} color="#eab308" /> 文字列結合の危険性
                </h3>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    脆弱性の原因は、外部からの入力を<b>信頼してそのままSQL文に結合してしまう</b>点にあります。
                </p>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, marginTop: 10, border: '1px solid #e2e8f0' }}>
                   <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>脆弱なコード例 (Node.js):</div>
                   <code style={{ fontSize: 13, color: '#334155', fontFamily: 'monospace' }}>
                     const query = "SELECT * FROM users WHERE name = '" + <span style={{ color: '#ef4444', fontWeight: 'bold' }}>req.body.name</span> + "'";
                   </code>
                </div>
                <p style={{ fontSize: 13, color: '#666', marginTop: 10 }}>
                    この場合、攻撃者が <code>' OR '1'='1</code> を入力すると、生成されるSQLは以下のようになります。
                </p>
                 <div style={{ background: '#fef2f2', padding: 12, borderRadius: 6, marginTop: 4, border: '1px solid #fca5a5', fontFamily: 'monospace', fontSize: 13, color: '#b91c1c' }}>
                    SELECT * FROM users WHERE name = '' OR '1'='1'
                 </div>
                 <p style={{ fontSize: 12, color: '#7f1d1d', marginTop: 4 }}>
                   条件 <code>'1'='1'</code> は常に真となるため、WHERE句全体が真となり、全レコードが返却されます。
                 </p>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <h3 style={{ ...styles.h3, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Code size={20} color="#2563eb" /> 安全なアプローチ
                </h3>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    対策の基本は、SQLの「構造」と「データ」を分離することです。これを実現するのが<b>プレースホルダ（プリペアドステートメント）</b>です。
                </p>
                <div style={{ background: '#f0f9ff', padding: 12, borderRadius: 6, marginTop: 10, border: '1px solid #bae6fd' }}>
                   <div style={{ fontSize: 12, color: '#0369a1', marginBottom: 4 }}>安全なコード例:</div>
                   <code style={{ fontSize: 13, color: '#0c4a6e', fontFamily: 'monospace' }}>
                     const query = "SELECT * FROM users WHERE name = ?";<br/>
                     db.execute(query, [<span style={{ color: '#0284c7', fontWeight: 'bold' }}>req.body.name</span>]);
                   </code>
                </div>
                <p style={{ fontSize: 13, color: '#666', marginTop: 10 }}>
                    データベースエンジンは、<code>?</code> の部分に入力値を「単なる文字列データ」として埋め込みます。SQL構文として解釈されることはありません。
                </p>
            </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>2. 脆弱性の検証と対策の実践</h2>
        <p style={{marginBottom: 20}}>
            以下のパネルで防御設定を切り替え、入力されたデータがどのように処理され、最終的にどのようなSQLが生成されるかをリアルタイムで確認してください。
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>🔎 Query Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <QueryPanel
                  mode={mode} setMode={(m) => { setMode(m); setQueryResult(null); }}
                  secureType={secureType} setSecureType={setSecureType}
                  enableValidation={enableValidation} setEnableValidation={setEnableValidation}
                  queryInput={queryInput} setQueryInput={setQueryInput}
                  executeQuery={executeQuery} isExecuting={isExecuting} queryResult={queryResult}
                />
              </CardContent>
            </Card>

            <Card style={{ marginTop: 8 }}>
              <CardHeader>
                <CardTitle style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Database size={14} /> 検索結果 (DB Output)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ minHeight: 120 }}>
                  {queryResult === null ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>実行待ち...</div>
                  ) : queryResult.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>該当データなし</div>
                  ) : (
                    queryResult.map((u) => (
                      <div key={u.id} style={{ 
                        display: 'grid', gridTemplateColumns: '1fr 2fr 3fr', padding: '8px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 13,
                        background: u.role === 'admin' ? '#fef2f2' : '#fff',
                        color: u.role === 'admin' ? '#b91c1c' : '#1f2937'
                      }}>
                        <div>{u.id}</div>
                        <div>{u.name}</div>
                        <div style={{ fontWeight: u.role === 'admin' ? 700 : 400 }}>{u.email}</div>
                      </div>
                    ))
                  )}
                </div>

                {queryResult && queryResult.some(u => u.role === 'admin') && mode === 'vulnerable' && queryInput !== 'admin' && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, padding: 8, background: '#fef2f2', borderRadius: 6, border: '1px solid #fca5a5' }}>
                    <ShieldAlert size={16} /> 警告: 管理者のデータが漏洩しました
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <BackendMonitor renderSqlPreview={renderSqlPreview} logs={logs} scrollRef={scrollRef} />
        </div>
      </section>
      </>
    </div>
  );

  return (
    <SectionLayout
      title1="3. SQLインジェクション"
      title2="〜 安全なSQL構築のベストプラクティス 〜"
      description={description}
      summary={summary}
    >
      {children}
    </SectionLayout>
  )
}