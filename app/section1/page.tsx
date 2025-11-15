// app/page.tsx
import React from 'react';
import InsecureDemo from './InsecureDemo';
import SecureDemo from './SecureDemo';

export const metadata = {
  title: 'タイミング攻撃チュートリアル',
  description: 'タイミング攻撃の基礎・回避法・文字列比較の問題点・シミュレーションを表示するサンプルページ'
};

export default function TimingAttackPage(): JSX.Element {
  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.h1}>タイミング攻撃チュートリアル</h1>
        <p style={styles.lead}>時間差を通じて情報が漏れる仕組みと回避策、簡単なシミュレーションをまとめたページです。</p>    
      </header>
      <section style={styles.section}>
        <h2 style={styles.h2}>4. シミュレーション：パスワード推測と時間差</h2>
        <p>以下は「推測が進むほど処理時間が長くなる」挙動を示す簡易シミュレーション表です。</p>

        <p>攻撃者はこの微妙な時間差を測定することで、先頭から順に正解文字を推測できます。</p>
        <p>demo: 正解文字列「S3CR3T」 PW最大文字数：10文字</p>

        <div style={styles.comparison}>
          <div style={styles.comparisonColumn}>
            <h3 style={styles.h3}>問題のあるコード（insecureCompare）</h3>
            <p style={{ fontSize: 18, marginBottom: 12 }}>以下は早期リターン（early return）を行うため、タイミング攻撃に脆弱です。</p>
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
    const start = performance.now();
    while (performance.now() - start < perCharDelayMs) {
      /* busy-wait */
    }
  }
  return true;
}`}
              </pre>
            </div>

            <h4 style={styles.h4}>差が出るグラフ</h4>
            {/* Insert the insecure demo (client-side) */}
            <div style={{ marginTop: 18 }}>
              <InsecureDemo />
            </div>
          </div>

          <div style={styles.comparisonColumn}>
            <h3 style={styles.h3}>安全なコード（secureCompare）</h3>
            <p style={{ fontSize: 18, marginBottom: 12 }}>以下は固定回数のループを行い、タイミング情報の漏洩を軽減します。</p>
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
    const start = performance.now();
    while (performance.now() - start < perCharDelayMs) {
      /* busy-wait */
    }
  }
  return result;
}`}
              </pre>
            </div>

            <h4 style={styles.h4}>差が出ないグラフ</h4>
            {/* Insert the secure demo (client-side) */}
            <div style={{ marginTop: 18 }}>
              <SecureDemo />
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: {
    maxWidth: 1400,
    margin: '32px auto',
    padding: '0 20px',
    fontFamily: '"Noto Sans JP", "ヒラギノ角ゴ ProN", "Segoe UI", Roboto, sans-serif',
    color: '#111',
    lineHeight: 1.7,
    fontSize: 17
  },
  header: {
    textAlign: 'center',
    marginBottom: 28
  },
  h1: {
    fontSize: 36,
    margin: '0 0 6px'
  },
  lead: {
    margin: 0,
    color: '#555',
    fontSize: 18
  },
  section: {
    marginBottom: 26,
    padding: 20,
    borderRadius: 8,
    background: '#fbfbfb',
    border: '1px solid #ececec'
  },
  comparison: {
    display: 'flex',
    gap: 24,
    marginTop: 20
  },
  comparisonColumn: {
    flex: 1,
    minWidth: 0
  },
  h2: {
    fontSize: 26,
    margin: '0 0 10px'
  },
  h3: {
    fontSize: 22,
    margin: '10px 0 6px'
  },
  h4: {
    fontSize: 19,
    margin: '12px 0 6px',
    color: '#333'
  },
  codeContainer: {
    borderRadius: 8,
    padding: 16,
    marginTop: 12
  },
  codeLabel: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    color: '#ff6b6b'
  },
  code: {
    display: 'block',
    background: '#1e1e1e',
    color: '#dcdcdc',
    padding: 18,
    borderRadius: 6,
    overflowX: 'auto',
    fontFamily: 'monospace',
    fontSize: 17,
    lineHeight: 1.6,
    margin: 0
  },
  tableWrap: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 720
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '2px solid #ddd',
    background: '#f7f7f7',
    fontWeight: 600,
    fontSize: 16
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #eee',
    verticalAlign: 'top',
    fontSize: 16
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    color: '#666'
  }
};