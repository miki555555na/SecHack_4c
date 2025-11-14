// app/page.tsx
import React from 'react';
import TimingDemo from './demo';

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
        <p>//図は後で書きます</p>     
      </header>

      <section style={styles.section}>
        <h2 style={styles.h2}>1. タイミング攻撃の基礎：なぜ時間差で情報が漏れるのか</h2>
        <p>
          タイミング攻撃はサイドチャネル攻撃の一種で、処理に要する時間の違いを計測・分析してシステム内部の機密情報（例：暗号鍵やパスワード）を推測しようとする攻撃です。ローカル環境からリモート環境まで幅広いシナリオが存在します。脅威を正しく理解し、適切な対策を講じることが重要です。
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>2. 攻撃の種類と回避（概観）</h2>
        <h3 style={styles.h3}>通常の攻撃（フロントドア攻撃）の回避</h3>
        <ul>
          <li>正規ルートを悪用した不正アクセス（例：認証バイパス）</li>
          <li>対策：認証強化、アクセス制御、WAF など</li>
        </ul>

        <h3 style={styles.h3}>サイドチャネル（間接的な漏洩経路）の回避</h3>
        <ul>
          <li>例：電磁波、電力消費、タイミング情報など</li>
          <li>対策：シールド、ノイズ導入、堅牢な OS 設計 など</li>
        </ul>

        <h3 style={styles.h3}>タイミングチャネルの正当化と回避</h3>
        <p>タイミングチャネルは意図せず発生することが多く、検出と緩和（固定時間処理、ランダム遅延、定数時間比較など）が重要です。</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>3. 時間差の原理：文字列比較（パスワードなど）による早期リターン</h2>
        <p>
          典型的な問題は「先に不一致が見つかると即座に戻る」比較処理です。例えば C 風の擬似コードで早期リターンする比較を行うと、最初の一致する文字数に応じて処理時間が伸びます。これを精密に計測することで、正しい文字を一文字ずつ推測できます。
        </p>

        <pre style={styles.code}>
{`int check(const char *input, const char *secret, size_t len) {
    size_t i;
    for (i = 0; i < len; i++) {
        if (input[i] != secret[i]) return 0; // early return
    }
    return 1;
}`}
        </pre>

        <p>上のような実装では、先頭から一致が続くほど処理が長くなるため、タイミング攻撃の標的になります。</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>4. シミュレーション：パスワード推測と時間差</h2>
        <p>以下は「推測が進むほど処理時間が長くなる」挙動を示す簡易シミュレーション表です。</p>
        <p style={{ color: '#888', fontStyle: 'italic' }}>//動いて見えるように実装したい</p>     

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ステップ</th>
                <th style={styles.th}>入力値（中間段階のシミュレーション）</th>
                <th style={styles.th}>ストップウォッチの時間</th>
                <th style={styles.th}>備考</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>ステップ1（初期値）</td>
                <td style={styles.td}>3xxxx（不正解）</td>
                <td style={styles.td}>0.1秒</td>
                <td style={styles.td}>最初の文字が不正解なので、すぐに処理が終了する</td>
              </tr>
              <tr>
                <td style={styles.td}>ステップ2（1文字目が正解）</td>
                <td style={styles.td}>Sxxxx（不正解）</td>
                <td style={styles.td}>0.2秒</td>
                <td style={styles.td}>最初の文字が正解なので、2文字目まで処理が進む</td>
              </tr>
              <tr>
                <td style={styles.td}>ステップ3（2文字目が正解）</td>
                <td style={styles.td}>S3xxx（不正解）</td>
                <td style={styles.td}>0.3秒</td>
                <td style={styles.td}>最初の2文字が正解なので、3文字目まで処理が進む</td>
              </tr>
              <tr>
                <td style={styles.td}>ステップ4（3文字目が正解）</td>
                <td style={styles.td}>S3Cxx（不正解）</td>
                <td style={styles.td}>0.4秒</td>
                <td style={styles.td}>最初の3文字が正解なので、4文字目まで処理が進む</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>攻撃者はこの微妙な時間差を測定することで、先頭から順に正解文字を推測できます。</p>
        <p>demo: 正解文字列「S3CRET」 PW最大文字数：10文字</p>
        {/* Insert the interactive demo (client-side) */}
        <div style={{ marginTop: 18 }}>
          <TimingDemo />
        </div>

      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>5. 緩和策（簡易一覧）</h2>
        <ul>
          <li>定数時間の比較関数を使う（例：constant-time compare）</li>
          <li>処理時間を均一化する（パディングやダミー処理）</li>
          <li>ノイズ導入で測定を困難にする（ただし運用へ影響を与えないこと）</li>
          <li>サーバ側でのレート制限と監視</li>
        </ul>
      </section>
    </main>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: {
    maxWidth: 980,
    margin: '32px auto',
    padding: '0 20px',
    fontFamily: '"Noto Sans JP", "ヒラギノ角ゴ ProN", "Segoe UI", Roboto, sans-serif',
    color: '#111',
    lineHeight: 1.6
  },
  header: {
    textAlign: 'center',
    marginBottom: 28
  },
  h1: {
    fontSize: 28,
    margin: '0 0 6px'
  },
  lead: {
    margin: 0,
    color: '#555'
  },
  section: {
    marginBottom: 26,
    padding: 16,
    borderRadius: 8,
    background: '#fbfbfb',
    border: '1px solid #ececec'
  },
  h2: {
    fontSize: 18,
    margin: '0 0 10px'
  },
  h3: {
    fontSize: 15,
    margin: '10px 0 6px'
  },
  code: {
    display: 'block',
    background: '#1e1e1e',
    color: '#dcdcdc',
    padding: 12,
    borderRadius: 6,
    overflowX: 'auto',
    fontFamily: 'monospace',
    fontSize: 13
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
    padding: '10px 12px',
    borderBottom: '2px solid #ddd',
    background: '#f7f7f7',
    fontWeight: 600
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #eee',
    verticalAlign: 'top'
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    color: '#666'
  }
};