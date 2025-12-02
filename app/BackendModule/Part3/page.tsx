'use client';

import React, { useMemo, useState } from 'react';
import SectionLayout from '../../Framework/SectionLayout';
import { styles } from '../../Framework/SectionStyles';
import { FlowDemo } from './FlowDemo';

export default function AuthFlowTimingPage() {
  const [variant, setVariant] = useState<'vulnerable' | 'secure'>('vulnerable');

  const variantInfo = useMemo(
    () =>
      variant === 'vulnerable'
        ? {
            title: '誤ったパターン（途中終了あり）',
            accent: '#ef4444',
            description: '存在しないユーザーは①で即終了、存在するユーザーは②以降が重くなりレスポンス時間で区別される。'
          }
        : {
            title: '正しいパターン（定数時間化）',
            accent: '#16a34a',
            description: '存在有無に関わらずダミー処理を含め全段階を通過し、最小応答時間を揃えてレスポンスを返す。'
          },
    [variant]
  );

  const description = (
    <>
      認証を「存在チェック → 照合 → トークン生成」と段階的に進めると、途中で終了するパスと最後まで進むパスで処理時間が大きく変わり、レスポンス時間からユーザーの有無が推測されます。
      ここではフローを“可視化”し、どの段階の差が漏洩要因になるかをリアルタイムに確認します。
    </>
  );

  const checklist = (
    <>
      <h2 style={{ ...styles.h2, fontSize: 19, marginBottom: 6, marginTop: 0 }}>📝 見どころ</h2>
      <ul style={{ fontSize: 16, marginLeft: 18, marginBottom: 0 }}>
        <li>段階的フローが時間差を生む仕組みを可視化</li>
        <li>誤った実装 vs 正しい実装のコード差分を比較</li>
        <li>実際に入力して各段階の計測結果をリアルタイム表示</li>
      </ul>
    </>
  );

  const summary = (
    <div>
      <b>ポイント:</b> 「途中終了」「重さの違う処理」がある段階フローは時間差を作り、存在/非存在・一致/不一致が推測される。ダミー処理や定数時間化で段階ごとの重さを揃え、さらにレート制限・監視で計測試行を抑える。
    </div>
  );

  return (
    <SectionLayout
      title1="3. ユーザー存在チェックや段階的認証フローの処理時間差"
      title2="段階フロー“可視化”＋時間差の原因追跡デモ"
      description={description}
      checklist={checklist}
      summary={summary}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section style={{ ...styles.section, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <h2 style={styles.h2}>段階設計が漏洩を生むワケ</h2>
          <p style={{ marginTop: 0 }}>
            「速い返答 = ユーザーなし」「少し遅い = ユーザーはいるがパスワード不一致」のように、段階ごとの重さが露骨に時間へ反映されると、
            ブラックボックス計測だけで内部状態が推測されます。
          </p>
          <div style={styles.comparison}>
            <div style={styles.comparisonColumn}>
              <div style={{ ...styles.codeContainer, background: '#fef2f2', border: '3px solid #fca5a5' }}>
                <div style={{ ...styles.codeLabel, color: '#dc2626' }}>⚠️ 誤った実装（段階ごとに途中終了）</div>
                <pre style={styles.code}>
                  {`function loginVulnerable(user, pass) {
  if (!db.has(user)) return fail('ユーザーなし');       // ① ここで即終了
  const ok = verifyPass(db.get(user).hash, pass);       // ② 重いハッシュは存在する人だけ
  if (!ok) return fail('パスワード不一致');            // 途中終了
  return issueToken(user);                              // ③ 成功時のみ実行
}`}
                </pre>
              </div>
            </div>
            <div style={styles.comparisonColumn}>
              <div style={{ ...styles.codeContainer, background: '#f0fdf4', border: '3px solid #86efac' }}>
                <div style={{ ...styles.codeLabel, color: '#16a34a' }}>✓ 正しい実装（段階を定数時間化）</div>
                <pre style={styles.code}>
                  {`function loginConstantTime(user, pass) {
  const exists = db.has(user);
  const hash = exists ? db.get(user).hash : dummyHash;  // ダミー値を使う
  const ok = constantTimeVerify(hash, pass);             // 全員同じ重さ
  const _token = issueTokenLikeWork();                   // 成功/失敗を問わず実行
  sleepUntil(targetMs);                                  // 最小応答時間で固定
  return exists && ok ? success() : fail('same latency');
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section style={{ ...styles.section, background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <h2 style={styles.h2}>リアルタイムデモ：どの段階で時間差が出る？</h2>
          <p style={{ marginTop: 0 }}>
            ユーザー名とパスワードを入力して試行すると、「存在チェック → 照合 → トークン」の各ノードが順に点灯し、計測時間のバーが更新されます。
            下のボタンで「誤ったパターン」「正しいパターン」を切り替えて、途中終了の有無による差を観察してください。
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => setVariant('vulnerable')}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: variant === 'vulnerable' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                background: variant === 'vulnerable' ? '#fef2f2' : '#fff',
                color: '#0f172a',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              誤ったパターン（NG）
            </button>
            <button
              onClick={() => setVariant('secure')}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: variant === 'secure' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                background: variant === 'secure' ? '#f0fdf4' : '#fff',
                color: '#0f172a',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              正しいパターン（OK）
            </button>
          </div>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(360px,1fr))' }}>
            <FlowDemo
              variant={variant}
              accent={variantInfo.accent}
              title={variantInfo.title}
              description={variantInfo.description}
            />
          </div>
        </section>

        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, border: '1px dashed #cbd5e1', color: '#475569' }}>
          💡 パスワードリセットや登録確認 API など「存在するか／しないか」を返したくなる場面でも、レスポンス時間・メッセージ・ステータスコードを統一しよう。
        </div>
      </div>
    </SectionLayout>
  );
}
