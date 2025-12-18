'use client';
import React, { useState, useRef, useCallback } from 'react';
import { InsecureDemo, DemoRef } from './InsecureDemo';
import { SecureDemo } from './SecureDemo';
import { styles } from '../../Framework/SectionStyles';

export default function DemoSwitcher() {
    const [mode, setMode] = useState<'insecure' | 'secure'>('insecure');
    const [input, setInput] = useState('Sxxxx'); // default guess

    const insecureRef = useRef<DemoRef | null>(null);
    const secureRef = useRef<DemoRef | null>(null);

    //現在のモードに応じて対応するデモを実行
    const handleRun = useCallback(() => {
        if (mode === 'insecure' && insecureRef.current) {
            insecureRef.current.run();
        } else if (mode === 'secure' && secureRef.current) {
            secureRef.current.run();
        }
    }, [mode]);

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

    return (
        <section style={{ ...styles.section, background: '#fff', border: '1px solid #e2e8f0' }}>
        <div style={{ marginTop: 10, marginBottom: 10 }}>
            <h2 style={{ ...styles.h2, marginTop: 0, marginBottom: 15 }} >🕰️ パスワード比較デモ：実行時間から推測する</h2>
            <span style={{ fontWeight: 700 }}>正解パスワード：</span>
            <span style={{ background: '#fca5a5', color: '#fff', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>S3CR3T</span>
            <span style={{ marginLeft: 18, fontWeight: 700 }}>PW最大文字数：</span>
            <span style={{ background: '#bae6fd', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 18 }}>10文字</span>

            {/* 2. 実行ガイド */}
            <h3 style={{ ...styles.h3, marginTop: 10, color: '#1f2937' }}>🚀 試してみよう！</h3>
            <ol style={{ fontSize: 17, marginLeft: 18, paddingLeft: 0, lineHeight: 1.8, marginBottom: 5 }}>
                <li><b>【ステップ1】脆弱な実装の体感</b> : まず「<b>⚠️ 脆弱な実装</b>」を選びましょう。</li>
                <li><b>【ステップ2】実行時間を比較</b> : 以下の 3 パターンを実行して、実行時間を比較しましょう。(※xは任意の文字)
                    <ul style={{ listStyleType: 'disc', marginLeft: 60, marginTop: 5, marginBottom: 5 }}>
                        <li>`Axxxxx` (1文字目から不一致) → `S3xxxx`(先頭が部分一致) → `S3CR3T`(完全一致)</li>
                    </ul>
                </li>
                <li><b>【ステップ3】安全な実装の体感</b> : 「<b>✓ 安全な実装</b>」に切り替えて、同じ入力値で再度実行して、実行時間を比較しましょう。</li>
            </ol>

            <section style={{...styles.todoWrapper, marginTop: 3, marginBottom: 18 }}>
                <h2 style={{ ...styles.h2, fontSize: 18, marginBottom: 6, marginTop: 0 }}><b>🔍 確認ポイント</b></h2>
                <ul style={{ fontSize: 17, marginLeft: 18, marginBottom: 0 }}>
                    <li style={{ marginBottom: 6 }}>
                        <span style={{ color: '#22c55e', fontWeight: 700, marginRight: 6 }}>☑</span>
                        <b>脆弱な実装</b>で、
                        <span style={{  textDecoration: 'underline' }}>一致文字数を増やす</span>と、
                        <span style={{ background: '#f3bcbcff', padding: '2px 4px', borderRadius: 3, margin: '0 3px' }}>実行時間が段階的に長くなる</span>
                        ことを確認しよう
                    </li>
                    <li>
                        <span style={{ color: '#22c55e', fontWeight: 700, marginRight: 6 }}>☑</span>
                        <b>安全な実装</b>で、同じように、
                        <span style={{  textDecoration: 'underline' }}>一致文字数を増やし</span>、
                        <span style={{ background: '#bbf7d0', padding: '2px 4px', borderRadius: 3, margin: '0 3px' }}>実行時間がほぼ一定になる</span>
                        ことを確認しよう
                    </li>
                </ul>
            </section>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <button
                    type="button"
                    onClick={() => setMode('insecure')}
                    aria-pressed={mode === 'insecure'}
                    style={{ ...btnBase, ...(mode === 'insecure' ? { borderColor: '#ef4444', background: '#fff7f7' } : {}), ...(mode === 'insecure' ? active : {}) }}
                >
                    ⚠️ 脆弱な実装
                </button>
                <button
                    type="button"
                    onClick={() => setMode('secure')}
                    aria-pressed={mode === 'secure'}
                    style={{ ...btnBase, ...(mode === 'secure' ? { borderColor: '#16a34a', background: '#f7fffb' } : {}), ...(mode === 'secure' ? active : {}) }}
                >
                    ✓ 安全な実装
                </button>
            </div>
            <div style={{ 
                display: 'flex', 
                gap: 16, 
                alignItems: 'center', 
                marginBottom: 20, 
                padding: '10px 0',
                // borderTop: '1px dashed #ccc', 
                paddingTop: 10,
                width: '60%'
            }}>
                <label style={{ fontSize: 24, fontWeight: 600, minWidth: 80 }}>推測入力:</label>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="パスワードを入力"
                    style={{
                        padding: '12px 16px',
                        fontSize: 22,
                        flexGrow: 1,
                        border: '2px solid #ddd',
                        borderRadius: 6,
                        boxSizing: 'border-box'
                    }}
                />
                <button
                    onClick={handleRun}
                    style={{
                        padding: '12px 28px',
                        fontSize: 22,
                        fontWeight: 600,
                        background: '#3b82f6', 
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                    }}
                >
                    実行
                </button>
            </div>

            <div>
                {/* inputとrefを子に渡す */}
                {mode === 'insecure' ? (
                    <div>
                        <InsecureDemo input={input} ref={insecureRef} />
                    </div>
                ) : (
                    <div>
                        <SecureDemo input={input} ref={secureRef} />
                    </div>
                )}
            </div>
            
        </div>
        </section>
    );
}
