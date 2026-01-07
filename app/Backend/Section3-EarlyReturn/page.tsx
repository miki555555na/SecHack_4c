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
import { Unlock } from 'lucide-react';




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
    <p className="text-lg font-medium">
      文字の比較処理で、<span style={{ background: '#fef9c3', fontWeight: 500 }}>不一致が見つかった時点で return する実装(早期リターン)</span>を見たことはありませんか？
    </p>

    <p className="mt-2 text-lg font-medium">
      しかし、この実装をパスワード検証に使ってしまうと<b>パスワードを推測できてしまう</b>可能性があります。
    </p>
    <p className="mt-2 text-lg font-medium">
      この章では、<b>早期リターンが生む問題</b>と、
      <b>実装を少し変えるだけで防げる理由</b>を
      動かしながら確認します。
    </p>
  </>
);


    const checklist = (
  <Card
    style={{
      border: '2px solid #aee2feff',
      boxShadow: '0 2px 8px #0001',
      background: '#f5faffff',
    }}
  >
    <CardHeader style={{ paddingBottom: 3 }}>
      <CardTitle style={{ fontSize: 17, marginTop: 0 }}>
        📝 3章の見どころ
      </CardTitle>
    </CardHeader>

    <CardContent style={{ paddingTop: 0 }}>
      <ul style={{ fontSize: 15, marginLeft: 18, marginBottom: 0 }}>
        <li>
          ・処理時間のわずかな差から、何が分かってしまうのか？
        </li>

        <li>
          ・比較検証の書き方を少し変えるだけで、結果はどう変わるのか？
        </li>

        <br />
        <ul style={{ fontSize: 16, marginTop: 5 }}>
          <b>→ 実際に動かしながら確認します</b>
        </ul>
      </ul>
    </CardContent>
  </Card>
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
  const baseButton = {
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
const children = (
        <>
          <div style={{ background: '#fff', padding: 24, borderRadius: 10, border: '1px solid #e5e7eb' }}>
            <h3 style={{ ...styles.h3, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Unlock size={20} color="#dc2626" />
              攻撃者の見ているもの
            </h3>
            {/* 一言サマリー */}
            <div style={{
              borderRadius: 8,
              marginBottom: 16
            }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
                攻撃者は、「当たったか外れたか」よりも、 
                <span className="text-indigo-600">「処理がどこで止まったか」</span>を見ています。
              </p>
              <p style={{ marginTop: 10, fontSize: 15, color: '#374151' }}>
                早期リターンのある比較処理では、  
                <b>一致する文字が多いほど、処理時間が長くなります</b>。 <br />
                そのわずかな時間の違いから、<b>中身を推測されてしまいます</b>。
              </p>
            </div>
            <div style={{
              marginTop: 10,
              padding: 16,
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>
                早期リターンを使用した比較処理の流れ（イメージ）
              </p>
              <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>
                例として、正しいパスワードを
                <span
                  style={{
                    background: '#fca5a5',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontWeight: 700,
                    marginLeft: 6,
                    letterSpacing: 1
                  }}
                >
                  S3CR3T
                </span>
                とします。
              </p>
              <br />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
                {/* ケース1 */}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    ❌ 1文字目で不一致
                  </p>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, lineHeight: 1.8 }}>
                    比較①：A ≠ S  
                    <br />
                    ↓ 不一致  
                    <br />
                    return
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                    ⏱ 処理時間：短い
                  </p>
                </div>

                {/* ケース2 */}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    ⚠️ 途中まで一致
                  </p>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, lineHeight: 1.8 }}>
                    比較①：S = S  
                    <br />
                    ↓ 次の文字  
                    <br />
                    比較②：3 = 3  
                    <br />
                    ↓ 次の文字  
                    <br />
                    比較③：x ≠ C  
                    <br />
                    ↓ 不一致  
                    <br />
                    return
                  </div>

                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                    ⏱ 処理時間：少し長い
                  </p>
                </div>
                {/* ケース3 */}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    ✅ 全部一致
                  </p>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, lineHeight: 1.8 }}>
                    比較①：S = S  
                    <br />
                    ↓ 次の文字  
                    <br />
                    比較②：3 = 3  
                    <br />
                    ↓ 次の文字  
                    <br />
                    比較③：C = C  
                    <br />
                    ↓ 次の文字  
                    <br />
                    比較④：R = R  
                    <br />
                    ↓ 次の文字  
                    <br />
                    比較⑤：E = E  
                    <br />
                    ↓ 次の文字  
                    <br />
                    比較⑥：T = T  
                    <br />
                    ↓ 全部一致
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                    ⏱ 処理時間：最も長い
                  </p>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#374151', marginTop: 12 }}>
                  攻撃者は、この <b>処理時間の違い</b> から
                  「どこまで文字が一致していたか」を推測できます。<br />
                  パスワード検証の結果が同じ「不正解」であっても、
                  <b>途中で処理が止まる位置が異なれば、処理時間も変わってしまいます。</b>
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
                設定できるパスワードの文字数を増やせば解決する、と考えられがちです。<br />
                しかし、早期リターンを使った比較処理では、
                <b>パスワードの長さそのものは本質的な問題ではありません。</b><br />
                問題なのは、<b>検証処理の途中で処理結果が分岐してしまうこと</b>です。<br />
              </p>
            </div>
          </div>
        <br />
            
          <Card>
            <CardHeader>
              <CardTitle style={{ marginBottom: 10 }}>
                パスワード検証処理の比較
              </CardTitle>
              <CardDescription>
                    ここからは、同じ「パスワード比較」でも<b>処理時間に差が出る実装と、出ない実装を</b>比較して見てみましょう。
              </CardDescription> 
            </CardHeader>
            <hr style={{ border: 'none', height: 1, background: '#e5e7eb', margin: '3px 0' }} />
            <CardContent>             
              <div style={styles.comparison}>
                {/* 脆弱な実装 */}
                <div style={styles.comparisonColumn}>
                  <p style={{ fontSize: 16, marginBottom: 20, lineHeight: 1.6 }}>
                      <span style={{ color:'#dc2626', fontWeight: 600 }}>脆弱な実装</span>では、
                      <b>文字が一致しなくなった時点で処理を終了</b>します。<br />
                      そのため、
                      <b>どこまで一致していたかが処理時間として外部から観測可能</b>になります。
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

    // ⚠️ 不一致が見つかった位置が「実行時間」として外から見える
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
                <div style={styles.divider} />

                {/* 安全な実装 */}
                <div style={styles.comparisonColumn}>
                  <p style={{ fontSize: 16, marginBottom: 20, lineHeight: 1.6 }}>
                      <span style={{color:'#138c40ff', fontWeight: 600 }}>安全な実装</span>
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

    // ✓ 不一致でも処理を継続するため、「実行時間」に差が出ない
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
          <br />

    <Card style={{ marginTop: 24 }}>
      <CardHeader>
        <CardTitle style={{ marginBottom: 10 }}>
          パスワード検証デモ：処理時間の違いを体感しよう
        </CardTitle>
        <CardDescription>
          <p>
            このデモでは、<b>パスワード検証処理の書き方</b>によって、
            外部から観測できる
            <b>処理時間の差（タイミング差）</b>
            が生まれることを確認します。
          </p>

          <p style={{ marginTop: 8 }}>
            正解パスワードは
            <span style={{ background: '#fca5a5', color: '#fff', padding: '2px 8px', borderRadius: 4, fontWeight: 700, margin: '0 4px' }}>
              S3CR3T
            </span>
            、最大文字数は
            <span style={{ background: '#bae6fd', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontWeight: 700, margin: '0 4px' }}>
              10文字
            </span>
            に設定しています。
          </p>

          <p style={{ marginTop: 8 }}>
            実行ボタンを押すと、選択した実装でパスワード比較が行われます。
            処理時間のばらつきを抑えるため、比較は
            <b>100回実行した平均時間</b>を表示しています。
          </p>
        </CardDescription>
      </CardHeader>
      <hr style={{ border: 'none', height: 0.1, background: '#e5e7eb'}} />
      <CardContent className="space-y-4">
        {/* 2. 実行ガイド（見た目改善） */}
        <h3 style={{ ...styles.h3, marginTop: 2, color: '#0f172a' }}>
          🚀 試してみよう
        </h3>

        <ol className="ml-4 space-y-4" style={{ fontSize: 16, lineHeight: 1.8 }}>
          <li>
            <div style={{ fontWeight: 700 }}>
              【ステップ1】脆弱な実装を試す
            </div>
            <div style={{ color: '#475569', marginTop: 6 }}>
              まず「⚠️ 脆弱な実装（Early Return）」を選択し、<b>実行</b>を押してみましょう。
            </div>
          </li>

          <li>
            <div style={{ fontWeight: 700 }}>
              【ステップ2】入力を変えて時間を比べる
            </div>
            <div style={{ color: '#475569', marginTop: 6 }}>
              次の入力を順に試してみてください。
              <br />
              一致する文字が増えるにつれて、
              <span style={{ background: '#fef9c3', padding: '2px 6px', borderRadius: 4 }}>処理時間が少しずつ長くなる</span>ことが分かります。
              <br />
              これは、<b>処理の進み方が外から観測できている</b>ことを意味します。
            </div>
            <div style={{ marginTop: 8 }}>
              <pre style={{ background: '#f1f5f9', padding: '8px 10px', borderRadius: 6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace', fontSize: 13, margin: 0 }}>
  Axxxxx  // 先頭が不一致（早く終わる）
  S3xxxx  // 先頭が部分一致（時間が少し長い）
  S3CR3T  // 完全一致（最長）
              </pre>
            </div>

          </li>

          <li>
            <div style={{ fontWeight: 700 }}>
              【ステップ3】安全な実装を試す
            </div>
            <div style={{ color: '#475569', marginTop: 6 }}>
              「✓ 安全な実装（Constant Time）」に切り替えて、
              同じ入力で再度実行してみましょう。
              今度は、
              <b>処理時間がほぼ一定になる</b>か確認してください。
            </div>
          </li>
        </ol>

        {/* 入力フォーム（見た目改善） */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            {/* <label style={{ display: 'block', fontWeight: 700, marginBottom: 8, marginTop: 12, fontSize: 15, color: '#0f172a' }}>
                入力パスワード（最大10文字）
            </label> */}
            <span style={{ fontWeight: 700, fontSize: 14 }}>正解パスワード：</span>
            <span style={{ background: '#fca5a5', color: '#fff', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>S3CR3T</span>
            <span style={{ marginLeft: 18, fontWeight: 700, fontSize: 14 }}>PW最大文字数：</span>
            <span style={{ background: '#bae6fd', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 14 }}>10文字</span>
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
            <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
              Tip：まずは <b>A</b> → <b>S3</b> → <b>S3CR3T</b> の順で試してみましょう。
            </div>
          </div>
        </div>
        
        {/* 実装切替ボタン */}
<div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
  <button
    type="button"
    onClick={() => setVariant('insecure')}
    style={{
      ...btnBase,
      ...(variant === 'insecure'
        ? {
            borderColor: '#ef4444',
            background: '#fff7f7',
            fontWeight: 700,
          }
        : {}),
    }}
  >
    ⚠️ 脆弱な実装 (Early Return)
  </button>

  <button
    type="button"
    onClick={() => setVariant('secure')}
    style={{
      ...btnBase,
      ...(variant === 'secure'
        ? {
            borderColor: '#16a34a',
            background: '#f7fffb',
            fontWeight: 700,
          }
        : {}),
    }}
  >
    ✓ 安全な実装 (Constant Time)
  </button>
</div>

{/* ===== 脆弱な実装 ===== */}
{variant === 'insecure' && (
  <>
    <div style={{ display: 'flex'}}>
      <Button
        onClick={handleRunInsecure}
        style={{
          ...baseButton,
          background:'#fee0e0ff',
          padding: '8px 10px',
          fontSize: 13,
          borderColor: '#ef4444',
          color: '#222222ff',
        }}
      >
        ▶ 実行（100回）
      </Button>
    </div>

    <InsecureDemo ref={insecureRef} input={input} />
  </>
)}

{/* ===== 安全な実装 ===== */}
{variant === 'secure' && (
  <>
    <div style={{ display: 'flex' }}>
      <Button
        onClick={handleRunSecure}
        style={{
          ...baseButton,
          background:'#e0fee7ff',
          padding: '8px 10px',
          fontSize: 13,
          borderColor: '#16a34a',
          color: '#343434ff',
        }}
      >
        ▶ 実行（100回）
      </Button>
    </div>

    <SecureDemo ref={secureRef} input={input} />
  </>
)}

      </CardContent>
    </Card>
        </>
    );

    const summary = (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-bold">
        3章のまとめ
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
            <b>Q.</b> 処理時間のわずかな差から、何が分かってしまうのか？
            <br />
            <span className="ml-4">
              <b>→ パスワードが「どこまで一致しているか」</b>
            </span>
          </li>

          <li>
            <b>Q.</b> 比較処理の書き方を少し変えると、結果はどう変わるのか？
            <br />
            <span className="ml-4">
              <b>→ 同じ機能でも、情報が漏れる実装と漏れない実装に分かれる</b>
            </span>
          </li>
        </ul>
      </div>

      {/* 本質の説明 */}
      <div
        className="rounded-md bg-white p-4 text-gray-800"
        style={{ lineHeight: 1.8 }}
      >
        <p style={{ fontSize: 16 }}>
          この章で見た問題は、
          <b>パスワードそのものが弱い</b>から起きたわけではありません。
          <br />
          問題になるのは、
          <span style={{ color: '#4f46e5', fontWeight: 600 }}>
            「パスワードをどう比較しているか」
          </span>
          です。
        </p>

        <p style={{ fontSize: 16, marginTop: 12 }}>
          早期リターンのある比較処理では、
          <b>一致している文字が多いほど処理時間が長くなる</b>ため、
          その時間差から
          <b>中身を推測される可能性</b>があります。
        </p>

        <p style={{ fontSize: 16, marginTop: 12 }}>
          秘密情報を比較する処理では、
          正解・不正解に関係なく、
          <span style={{ color: '#4f46e5', fontWeight: 600 }}>
            常に同じ回数・同じ流れで処理する
          </span>
          ことが重要です。
        </p>

        {/* 締め */}
        <div className="mt-4 pt-3 border-t text-gray-700 font-medium">
          「正しく動いているように見えるコード」でも、
          <b>処理時間</b>という形で
          情報を漏らしてしまうことがあります。
          <br />
          次の章では、この問題が
          <b>パスワード以外の場面でも起こる</b>ことを見ていきます。
        </div>
      </div>
    </CardContent>
  </Card>
);


    return(
    <SectionLayout
        title1="3. 正しく書いたコードが、パスワードを漏らす"
        title2="〜 処理時間から起きる意外な情報漏えい 〜"
        description={description}
        checklist={checklist}
        summary={summary}
    >
        {children}
    </SectionLayout>
    );
}