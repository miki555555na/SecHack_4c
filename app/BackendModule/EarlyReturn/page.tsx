//BackendModule/EarlyReturn/page.tsx

import React from 'react';
import SectionLayout from './../../Framework/SectionLayout';
import { styles } from './../../Framework/SectionStyles';
import {InsecureDemo} from './InsecureDemo';
import {SecureDemo} from './SecureDemo';

// export const metadata = {
//   title: 'コードの実行時間がパスワードを漏らす！',
//   description1: '早期リターンとタイミング攻撃対策'
// };

export default function TimingAttackPage() {
    const checklist = (
        <>
            <h2 style={{ ...styles.h2, fontSize: 20, marginBottom: 6, marginTop: 0 }}>📝 やってみようリスト</h2>
            <ul style={{ fontSize: 17, marginLeft: 18, marginBottom: 0 }}>
                <li style={{ marginBottom: 6 }}>
                    <span style={{ color: '#22c55e', fontWeight: 700, marginRight: 6 }}>☑</span>
                    <b>脆弱なコード</b>で、
                    <span style={{  textDecoration: 'underline' }}>一致文字数を増やす</span>と、
                    <span style={{ background: '#f3bcbcff', padding: '2px 4px', borderRadius: 3, margin: '0 3px' }}>実行時間が段階的に長くなる</span>
                    ことを確認しよう
                </li>
                <li>
                    <span style={{ color: '#22c55e', fontWeight: 700, marginRight: 6 }}>☑</span>
                    <b>安全なコード</b>で、同じように、
                    <span style={{  textDecoration: 'underline' }}>一致文字数を増やし</span>、
                    <span style={{ background: '#bbf7d0', padding: '2px 4px', borderRadius: 3, margin: '0 3px' }}>実行時間がほぼ一定になる</span>
                    ことを確認しよう
                </li>
            </ul>
        </>
    );

    const description = (
        <>
            <b>「早期リターン」</b>や<b>「可変長ループ」</b>は、文字列比較で最適化のために何気なく使用される実装ですが、<span style={{ background: '#fef9c3', fontWeight: 500 }}>実行時間にわずかな差を生みます</span>。
            パスワード比較などの機密情報を扱う処理でこの差が生まれると、それがヒントとなり、<span style={{ color: '#ff0000ff', fontWeight: 600 }}>情報漏洩</span>につながります。
            <br></br>
            このページでは、<span style={{ color: '#2563eb', fontWeight: 600 }}>危険な実装が時間差を生む仕組み</span>を観察し、<span style={{ color: '#2563eb', fontWeight: 600 }}>定数時間比較</span>による安全な実装法を体験的に理解しましょう。
            
 
        </>       
    );

    const children = (
        <section style={styles.section}>
            <h2 style={styles.h2}>シミュレーション：時間差を利用したパスワード推測</h2>
            <p>
            時間差が生まれる脆弱な実装と、安全な実装を比較しながら、機密情報が漏洩するリスクを体感しましょう。<br></br>
            
            <h4 style={styles.h4}>なお、以下のデモでは、時間差を観測しやすくするために、各文字比較ごとに約1msの待ち時間を意図的に挿入しています。実際のシステムでは、これほど大きな時間差は発生しない場合が多いですが、ネットワーク遅延などのノイズがあっても攻撃が成立するケースがあります。</h4>
            <br></br>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>正解文字列：</span>
            <span style={{ background: '#fca5a5', color: '#fff', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>S3CR3T</span>
            <span style={{ marginLeft: 18, color: '#0ea5e9', fontWeight: 700 }}>PW最大文字数：</span>
            <span style={{ background: '#bae6fd', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 18 }}>10文字</span>
            </p>
            

            <div style={styles.comparison}>
            <div style={styles.comparisonColumn}>
                <h3 style={styles.h3}>脆弱な実装（insecureCompare）</h3>
                <p style={{ fontSize: 17, marginBottom: 12 }}>以下は、文字が一致しない時点で処理を即座に終了する<b>早期リターン</b>と、パスワードの最大長（10文字）ではなく<b>実際のパスワードの長さに応じてループ回数が変わる可変長ループ</b>を実装しています。</p>        

                <div style={{ ...styles.codeContainer, background: '#fef2f2', border: '3px solid #fca5a5' }}>   
                    <div style={{ ...styles.codeLabel, color: '#dc2626' }}>⚠️ 脆弱なコード</div>
                    <pre style={styles.code}>
                        {`function insecureCompare(a: string, b: string): boolean {
    const len = Math.max(a.length, b.length);
    const noise = randomInt(-100, 101) * 0.005;
    const perCharDelayMs = cfg.perCharDelayMs + noise;
    `}<span style={{ background: '#ef4444', color: '#fff', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>{`for (let i = 0; i < len; i++)`}</span>{` { `}<span style={{ color: '#fca5a5' }}>// ⚠️ 可変長ループ</span>{`
        if (i >= a.length || i >= b.length) return false;
        `}<span style={{ background: '#ef4444', color: '#fff', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>{`if (a[i] !== b[i]) return false;`}</span>{` `}<span style={{ color: '#fca5a5' }}>// ⚠️ 早期リターン</span>{`
        /* 今回のデモでは、観測しやすくするため、
        ここに約1msの待ち時間を入れています。*/
    }
    return true;
}`}
                    </pre>
                </div>
                <h3 style={styles.h3}>↓のデモは、<div style={{ ...styles.codeLabel, color: '#dc2626' }}>⚠️ 脆弱なコード</div>を実装した比較処理を<b>100回実行</b>してその分布を表示します。</h3>
                <h3>「やってみようリスト」の<u>１つ目の項目</u>を体感しましょう。</h3>
                <div style={{ marginTop: 18 }}>
                    <InsecureDemo />
                </div>
                </div>

                <div style={styles.comparisonColumn}>
                <h3 style={styles.h3}>安全なコード（secureCompare）</h3>
                <p style={{ fontSize: 17, marginBottom: 12 }}>以下は、<b>定数時間比較(Constant Time Comparison)の実装</b>です。<b>常に固定回数（最大文字数と同じ10回）のループ</b>を実行し、文字の比較結果に関わらず最後まで処理を続行（<b>早期リターンなし</b>）することで、比較時間を<b>入力内容によらず一定</b>に保っています。</p>
                <div style={{ ...styles.codeContainer, background: '#f0fdf4', border: '3px solid #86efac' }}>
                    <div style={{ ...styles.codeLabel, color: '#16a34a' }}>✓ 安全なコード</div>
                    <pre style={styles.code}>
                        {`function secureCompare(a: string, b: string): boolean {
    let result = true;
    const len = Math.max(a.length, b.length);
    const noise = randomInt(-100, 101) * 0.005;
    const perCharDelayMs = cfg.perCharDelayMs + noise;
    `}<span style={{ background: '#22c55e', color: '#fff', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>{`for (let i = 0; i < 10; i++)`}</span>{` { `}<span style={{ color: '#86efac' }}>// ✓ 固定長ループ</span>{`
        if (i >= a.length || i >= b.length) result = false;
        `}<span style={{ background: '#22c55e', color: '#fff', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>{`if (a[i] !== b[i]) result = false;`}</span>{` `}<span style={{ color: '#86efac' }}>// ✓ 早期リターンなし</span>{`
        /* 今回のデモでは、観測しやすくするため、
        ここに約1msの待ち時間を入れています。*/
    }
    return result;
}`}
                    </pre>
                </div>
                <h3 style={styles.h3}>↓のデモは、<div style={{ ...styles.codeLabel, color: '#16a34a' }}>✓ 安全なコード</div>を実装した比較処理を<b>100回実行</b>してその分布を表示します。</h3>
                <h3>「やってみようリスト」の<u>２つ目の項目</u>を体感しましょう。</h3>
                <div style={{ marginTop: 18 }}>
                    <SecureDemo />
                </div>
            </div>
        </div>
        </section>
    );

    const summary = (
        <section style={{ ...styles.section, background: '#f9fafb', border: '1.5px solid #e5e7eb', marginTop: 32 }}>
            <h2 style={{ ...styles.h2, fontSize: 22, marginBottom: 10 }}>🔎 まとめ：ここがポイント！</h2>
            <ul style={{ fontSize: 17, marginLeft: 18 }}>
                <li style={{ marginBottom: 8 }}>
                    <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: 4, fontWeight: 700, marginRight: 6 }}>✗ よくない例</span>
                    <b>早期リターン</b>や<b>可変長ループ</b>は、<span style={{ textDecoration: 'underline' }}>タイミング情報が漏れる</span>原因になる
                </li>
                <li>
                    <span style={{ background: '#bbf7d0', color: '#15803d', padding: '2px 6px', borderRadius: 4, fontWeight: 700, marginRight: 6 }}>✓ いい例</span>
                    <b>早期リターン</b>と<b>固定長ループなし</b>で、<span style={{ textDecoration: 'underline' }}>比較時間を一定にする</span>ことで安全性が高まる
                </li>
            </ul>
            <div style={{ marginTop: 18, color: '#64748b', fontSize: 16 }}>
                <b>ポイント：</b>「比較処理の時間差」は攻撃者にとって大きなヒントになるため、パスワード、認証トークン、暗号鍵など、機密情報の比較処理には、定数時間比較のような<span style={{ color: '#dc2626', fontWeight: 700 }}>時間差が出ない</span>ロジックで実装しましょう。
            </div>
        </section>
    );


    return(
    <SectionLayout
        title1="実行時間がパスワードを暴露！"
        title2='〜 早期リターンと可変長ループが招くタイミング攻撃 〜'
        description={description}
        checklist={checklist}
        summary={summary}
        stickyChecklist={true}
    >
        {children}
    </SectionLayout>
    );
}