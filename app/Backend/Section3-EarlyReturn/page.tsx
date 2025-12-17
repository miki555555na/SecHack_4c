//BackendModule/Part1/page.tsx
'use client';

import React, { useState, useRef} from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectionLayout from '../../Framework/SectionLayout';
import { styles } from '../../Framework/SectionStyles';
import {InsecureDemo, DemoRef} from './InsecureDemo';
import {SecureDemo} from './SecureDemo';


// export const metadata = {
//   title: '実装の実行時間がパスワードを漏らす！',
//   description1: '早期リターンとタイミング攻撃対策'
// };

export default function TimingAttackPage() {
    const [input, setInput] = useState('xxxxx');
    const insecureRef = useRef<DemoRef | null>(null);
    const secureRef = useRef<DemoRef | null>(null);
     const [variant, setVariant] = useState<'insecure' | 'secure'>('insecure');

    const handleRunInsecure = () => {
        if (insecureRef.current) {
            insecureRef.current.run();
        }
    };

    const handleRunSecure = () => {
        if (secureRef.current) {
            secureRef.current.run();
        }
    };
    const description = (
  <>
    <p>
      パスワードの比較処理、
      <b>「早く終わった方が効率がいい」</b>と考えて、
      不一致が見つかった時点で
      return する実装にしていませんか？
    </p>

    <p style={{ marginTop: 6 }}>
      実はこの
      <b>「効率を優先した書き方」</b>が、
      攻撃者にヒントを与えてしまうことがあります。
    </p>

    <p style={{ marginTop: 6 }}>
      一見すると問題なさそうでも、
      <b>処理がどこで止まるか</b>によって
      実行時間にわずかな差が生まれ、
      <span style={{ background: '#fef9c3', fontWeight: 500 }}>
        「どこまで一致しているか」
      </span>
      を推測されてしまいます。
    </p>

    <p style={{ marginTop: 6 }}>
      この章では、
      <b>早期リターンがなぜ危険なのか</b>と、
      <b>少しの設計変更でどう防げるのか</b>を、
      実際に動かしながら確認します。
    </p>
  </>
);


    const checklist = (
        <Card style={{ border: '2px solid #aee2feff', boxShadow: '0 2px 8px #0001',background: '#f5faffff',}}>
            <CardHeader style={{ paddingBottom: 3}}>
                <CardTitle style={{ fontSize: 17, marginTop: 0 }}>📝 3章の見どころ</CardTitle>
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

    const children = (
        <>
            
            <Card>
                <CardHeader>
                    <CardTitle>シミュレーション：時間差を利用したパスワード推測</CardTitle>
                    <CardDescription>
                        <p>時間差が生まれる脆弱な実装と、安全な実装を比較しながら、パスワード比較処理において機密情報が漏洩するリスクを体感しましょう。</p>
                    </CardDescription> 
                </CardHeader>
                <hr style={{ border: 'none', height: 1, background: '#e5e7eb', margin: '3px 0' }} />
                <CardContent>             
<div style={styles.comparison}>
  {/* 脆弱な実装 */}
  <div style={styles.comparisonColumn}>
    <p style={{ fontSize: 17, marginBottom: 12 }}>
        <span style={{ color:'#dc2626', fontWeight: 600 }}>脆弱な実装</span>では、
            文字が一致しなくなった時点で処理を終了するため、
            <b>一致している長さが実行時間に表れます</b>。
            <br /><br />

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
{`function insecureCompare(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  const noise = randomInt(-100, 101) * 0.005;
  const perCharDelayMs = cfg.perCharDelayMs + noise;

  // ⚠️ 入力内容によってループ回数が変わる
`} <span style={{
  background: '#ef4444',
  color: '#fff',
  padding: '2px 4px',
  borderRadius: '3px',
  fontWeight: 'bold'
}}>{`for (let i = 0; i < len; i++)`}</span>{` {
    if (i >= a.length || i >= b.length) return false;

    // ⚠️ 不一致が見つかった瞬間に処理が終わる
    `}<span style={{
      background: '#ef4444',
      color: '#fff',
      padding: '2px 4px',
      borderRadius: '3px',
      fontWeight: 'bold'
    }}>{`if (a[i] !== b[i]) return false;`}</span>{`
  }
  return true;
}`}
      </pre>
    </div>
  </div>

  {/* 安全な実装 */}
  <div style={styles.comparisonColumn}>
     <p style={{ fontSize: 17, marginBottom: 12 }}>
                            <span style={{color:'#138c40ff', fontWeight: 600 }}>安全な実装</span>では、
                            入力内容に関係なく
                            <b>必ず同じ回数の比較</b>を行います。
                            その結果、処理時間から
                            <b>推測に使える情報が得られなくなります</b>。
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
{`function secureCompare(a: string, b: string): boolean {
  let result = true;
  const len = Math.max(a.length, b.length);
  const noise = randomInt(-100, 101) * 0.005;
  const perCharDelayMs = cfg.perCharDelayMs + noise;

  // ✓ 入力に関係なく一定回数ループする
`} <span style={{
  background: '#429460',
  color: '#fff',
  padding: '2px 4px',
  borderRadius: '3px',
  fontWeight: 'bold'
}}>{`for (let i = 0; i < 10; i++)`}</span>{` {
    if (i >= a.length || i >= b.length) result = false;

    // ✓ 不一致でも処理を継続する
    `}<span style={{
      background: '#429460',
      color: '#fff',
      padding: '2px 4px',
      borderRadius: '3px',
      fontWeight: 'bold'
    }}>{`if (a[i] !== b[i]) result = false;`}</span>{`
  }
  return result;
}`}
      </pre>
    </div>
  </div>
</div>

        </CardContent>
    </Card>

    <Card style={{ marginTop: 24 }}>
        <CardHeader>
            <CardTitle>パスワード比較デモ：実行時間の差を体感しよう</CardTitle>
            <CardDescription>
                <span style={{ fontWeight: 700 }}>正解パスワード：</span>
                <span style={{ background: '#fca5a5', color: '#fff', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>S3CR3T</span>
                <span style={{ marginLeft: 18, fontWeight: 700 }}>PW最大文字数：</span>
                <span style={{ background: '#bae6fd', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 18 }}>10文字</span>
                <p>デモでは、実行ボタンを押すと選択した実装でパスワード比較が行われます。ここでは、処理時間の平均を取るために、比較を100回実行しています。</p>
            </CardDescription>
        </CardHeader>
                <CardContent className="space-y-4">
                    {/* 2. 実行ガイド（見た目改善） */}
                    <h3 style={{ ...styles.h3, marginTop: 10, color: '#0f172a' }}>🚀 試してみよう！</h3>

                    <ol className="ml-4 space-y-3" style={{ fontSize: 16.5, lineHeight: 1.8, marginBottom: 6 }}>
                        <li>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div>
                            <div style={{ fontWeight: 700 }}>【ステップ1】脆弱な実装の体感</div>
                            <div style={{ color: '#475569', marginTop: 6 }}>まずタブで「⚠️ 脆弱な実装」を選択し、実行ボタンを押して挙動を確認します。</div>
                            </div>
                        </div>
                        </li>

                        <li>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div>
                            <div style={{ fontWeight: 700 }}>【ステップ2】実行時間を比較</div>
                            <div style={{ color: '#475569', marginTop: 6 }}>
                                以下の入力を順に試すと、
処理時間が少しずつ変化することが分かります。
これは、
<b>処理の進み方が外から観測できている</b>ことを意味します。

<br />
                                <div style={{ marginTop: 8 }}>
                                <pre style={{ background: '#f1f5f9', padding: '8px 10px', borderRadius: 6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace', fontSize: 13, margin: 0 }}>
                    Axxxxx  // 先頭が不一致（早く終わる）
                    S3xxxx  // 先頭が部分一致（時間が少し長い）
                    S3CR3T  // 完全一致（最長）
                                </pre>
                                </div>
                            </div>
                            </div>
                        </div>
                        </li>

                        <li>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div>
                            <div style={{ fontWeight: 700 }}>【ステップ3】安全な実装の体感</div>
                            <div style={{ color: '#475569', marginTop: 6 }}>「✓ 安全な実装」に切り替えて、同じ入力で再実行。実行時間がほぼ一定になるか確認します。</div>
                            </div>
                        </div>
                        </li>
                    </ol>

                    {/* 確認ポイント（カード風） */}
                    <div style={{ borderRadius: 8, border: '1px solid #e6f4ea', background: '#cfddf9ff', padding: 12, marginBottom: 10 }}>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#4447d9ff' }}>🔍 確認ポイント</h4>
                        <ul style={{ marginTop: 8, marginLeft: 18, fontSize: 16 }}>
                        <li style={{ marginBottom: 8 }}>
                            <span style={{ color: '#5f61d8ff', fontWeight: 800, marginRight: 8 }}>☑</span>
                            <b>脆弱な実装</b>では、「1文字多く合うごとに処理時間が伸びる」
                            → 攻撃者にヒントを与える
                        </li>
                        <li>
                            <span style={{ color: '#5f61d8ff', fontWeight: 800, marginRight: 8 }}>☑</span>
                            <b>安全な実装</b>では、「何を入れても処理時間がほぼ同じ」
→ 推測に使える情報が出ない
                        </li>
                        </ul>
                    </div>

                    {/* 入力フォーム（見た目改善） */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: 8, marginTop: 12, fontSize: 15, color: '#0f172a' }}>
                            入力パスワード（最大10文字）
                        </label>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value.slice(0, 10))}
                            maxLength={10}
                            placeholder="例: S3xxxx"
                            style={{
                            width: '100%',
                            padding: '10px 14px',
                            fontSize: 15,
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            boxSizing: 'border-box',
                            background: '#ffffff',
                            outline: 'none'
                            }}
                        />
                        <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>Tip: まずは <b>A</b> → <b>S3</b> → <b>S3CR3T</b> を試してみてください。</div>
                    </div>
                    </div>

    {/* タブ */}
                    <Tabs value={variant} onValueChange={(val) => setVariant(val as 'insecure' | 'secure')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger 
                                value="insecure" 
                                className="flex items-center gap-2"
                                style={{ 
                                    background: variant === 'insecure' ? '#fef2f2' : '#fff',
                                    borderBottom: variant === 'insecure' ? '2px solid #ef4444' : '1px solid #e5e7eb',
                                    color: variant === 'insecure' ? '#dc2626' : '#64748b'
                                }}
                            >
                                ⚠️ 脆弱な実装
                            </TabsTrigger>
                            <TabsTrigger 
                                value="secure" 
                                className="flex items-center gap-2"
                                style={{ 
                                    background: variant === 'secure' ? '#f0fdf4' : '#fff',
                                    borderBottom: variant === 'secure' ? '2px solid #16a34a' : '1px solid #e5e7eb',
                                    color: variant === 'secure' ? '#16a34a' : '#64748b'
                                }}
                            >
                                ✓ 安全な実装
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="insecure" className="mt-4">
                            
                            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                <Button
                                    onClick={handleRunInsecure}
                                    style={{
                                        padding: '10px 24px',
                                        fontSize: 16,
                                        background: '#ef4444',
                                        color: '#fff'
                                    }}
                                >
                                    実行（100回）
                                </Button>
                            </div>
                            <InsecureDemo ref={insecureRef} input={input} />
                        </TabsContent>
                        <TabsContent value="secure" className="mt-4">
                            
                            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                <Button
                                    onClick={handleRunSecure}
                                    style={{
                                        padding: '10px 24px',
                                        fontSize: 16,
                                        background: '#16a34a',
                                        color: '#fff'
                                    }}
                                >
                                    実行（100回）
                                </Button>
                            </div>
                            <SecureDemo ref={secureRef} input={input} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </>
    );

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
            秘密情報の比較処理で、
            <b>入力内容によって処理時間が変わる実装</b>は、
            情報漏えいの原因になります。
          </span>
        </li>

        <li className="flex items-start gap-3">
          <span className="mt-0.5 rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
            対策
          </span>
          <span>
            入力に関係なく、
            <b>比較回数と処理の流れが一定</b>になるように実装します。
          </span>
        </li>

        <li className="text-gray-600">
            「正しく動くから大丈夫」と思っていたコードでも、
<b>API トークンや署名検証</b>では
同じ落とし穴にはまることがあります。
        </li>
      </ul>
    </CardContent>
  </Card>
);



    return(
    <SectionLayout
        title1="3. パスワードは“速さ”で盗まれる"
        title2="〜 早期リターンが引き起こすタイミング攻撃 〜"
        description={description}
        checklist={checklist}
        summary={summary}
    >
        {children}
    </SectionLayout>
    );
}