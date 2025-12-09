'use client';

import React, { useState, useRef} from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectionLayout from '../../Framework/SectionLayout';
import { styles } from '../../Framework/SectionStyles';
import { CacheDemo } from './CacheDemo';



export default function CacheTimingPage(){
  const description = (
    <>
      キャッシュが効いている場合はリソース取得が速く、効いていない場合は遅くなります。
      この時間差を観測することで「過去にアクセスしたか（履歴）」や「最後に参照した時間帯」などの推測が可能になることを体験します。
    </>
  );

  const checklist = (
    <>
      <h2 style={{ ...styles.h2, fontSize: 19, marginBottom: 6, marginTop: 0 }}>📝 やってみよう</h2>
      <ul style={{ fontSize: 16, marginLeft: 18, marginBottom: 0 }}>
        <li>同じリソースを先にアクセスしてキャッシュを作った状態と、キャッシュなしの状態で比較する</li>
        <li>時間差から「過去にそのリソースにアクセスした可能性」が推測できる点を確認する</li>
      </ul>
    </>
  );

  const summary = (
    <div>
      <b>ポイント:</b> キャッシュの有無によるアクセス時間差は、プライバシーに関わる情報を漏らす手がかりになります。必要に応じてキャッシュ制御やサイドチャネルを考慮してください。
    </div>
  );

  return (
    <SectionLayout
      title1="3. フロントエンド：キャッシュの時間差による情報漏洩"
      title2="キャッシュヒット／ミスで変わるアクセス時間の可視化デモ"
      description={description}
      checklist={checklist}
      summary={summary}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section style={{ ...styles.section, background: '#fff', border: '1px solid #e6eef8' }}>
          <h2 style={styles.h2}>デモの使い方（簡単）</h2>
          <ol style={{ marginLeft: 18, fontSize: 16 }}>
            <li>リソースを選択して「アクセス」→ キャッシュが作成される（ヒット状態になる）</li>
            <li>同じリソースを再度「アクセス」するとヒット時の高速レスポンスを確認</li>
            <li>「キャッシュをクリア」してミス状態でアクセスすると遅いレスポンスになる</li>
            <li>ヒットとミスの差から「そのリソースに過去アクセスしたか」を推測してみる</li>
          </ol>
        </section>

        {/* ▼ 追加: フロントエンド実装の良い例 / よくない例 */}
        <section style={{ ...styles.section, background: '#fff', border: '1px solid #e6eef8' }}>
          <h2 style={styles.h2}>フロントエンド実装の注意：良い例 / よくない例</h2>
          <p style={{ marginTop: 0 }}>
            クライアント側の実装次第で機微な情報がブラウザや中間キャッシュに残ることがあります。以下は実装例です（サーバー側でもヘッダで制御することが前提です）。
          </p>

          <div style={styles.comparison}>
            <div style={styles.comparisonColumn}>
              <h3 style={styles.h3}>⚠️ よくない例（NG）</h3>
              <p style={{ fontSize: 15, marginBottom: 8 }}>
                クライアントで強制的にキャッシュを利用したり、敏感なデータを永続ストレージに残す例。
              </p>
              <div style={{ ...styles.codeContainer, background: '#fff7f6', border: '3px solid #fca5a5' }}>
                <div style={{ ...styles.codeLabel, color: '#dc2626' }}>✗ NG: fetch でキャッシュを強制</div>
                <pre style={styles.code}>
{`// fetch で force-cache を使うと、共有キャッシュや古いレスポンスを参照してしまう可能性がある
fetch('/api/user/history', { cache: 'force-cache' })
  .then(r => r.json())
  .then(data => console.log(data));`}
                </pre>

                <div style={{ ...styles.codeLabel, color: '#dc2626', marginTop: 10 }}>✗ NG: localStorage に機微データを保存</div>
                <pre style={styles.code}>
{`// localStorage はブラウザに永続的に残り、他のスクリプトから参照されるリスクがある
localStorage.setItem('user_history', JSON.stringify(resp));
const saved = JSON.parse(localStorage.getItem('user_history'));`}
                </pre>

                <div style={{ ...styles.codeLabel, color: '#dc2626', marginTop: 10 }}>✗ NG: Service Worker が検証なしにキャッシュ</div>
                <pre style={styles.code}>
{`// Service Worker で検証せずにレスポンスをキャッシュすると機微情報が共有キャッシュ層に残る
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open('v1').then(cache =>
      cache.match(event.request).then(resp => resp || fetch(event.request).then(r => { cache.put(event.request, r.clone()); return r; }))
    )
  );
});
`}
                </pre>
              </div>
            </div>

            <div style={styles.comparisonColumn}>
              <h3 style={styles.h3}>✓ 推奨例（OK）</h3>
              <p style={{ fontSize: 15, marginBottom: 8 }}>
                クライアント側で明示的にキャッシュを無効化し、機微な情報はブラウザ永続ストレージに残さないことを推奨します。Service Worker はヘッダを検査してからキャッシュ。
              </p>
              <div style={{ ...styles.codeContainer, background: '#f7fffa', border: '3px solid #86efac' }}>
                <div style={{ ...styles.codeLabel, color: '#16a34a' }}>✓ OK: fetch でキャッシュを無効化</div>
                <pre style={styles.code}>
{`// 即時の最新データが必要な場合は no-store を指定（中間キャッシュも使わせない）
fetch('/api/user/history', { cache: 'no-store', credentials: 'include' })
  .then(r => r.json())
  .then(data => console.log(data));`}
                </pre>

                <div style={{ ...styles.codeLabel, color: '#16a34a', marginTop: 10 }}>✓ OK: 機微データを永続化しない</div>
                <pre style={styles.code}>
{`// 永続化は避ける。必要なら短時間のメモリ保持のみ。
let temp = resp; // メモリ内で一時利用して破棄する
// 不要なフィールドはサーバ側で除去して返す（例: full logs -> count のみ）`}
                </pre>

                <div style={{ ...styles.codeLabel, color: '#16a34a', marginTop: 10 }}>✓ OK: Service Worker はヘッダを確認してキャッシュ</div>
                <pre style={styles.code}>
{`// Service Worker 側で Cache-Control を確認してからキャッシュする
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request).then(resp => {
    const cc = resp.headers.get('Cache-Control') || '';
    if (cc.includes('no-store')) return resp;
    // 条件を満たす場合のみキャッシュする（検証した上で）
    const copy = resp.clone();
    caches.open('v1').then(cache => cache.put(event.request, copy));
    return resp;
  }));
});
`}
                </pre>
              </div>
            </div>
          </div>
        </section>
        {/* ▲ 追加ここまで */}

        <section style={{ ...styles.section }}>
          <h2 style={styles.h2}>シンプルデモ：キャッシュヒット vs ミス</h2>
          <p style={{ marginTop: 0 }}>
            下のインタラクティブで、キャッシュの有無がレスポンス時間にどう影響するかを試してください。
            （想定例：過去にアクセスしたリソースは高速で返るため、履歴推測に利用されうる）
          </p>

          <div style={{ marginTop: 12 }}>
            <CacheDemo />
          </div>
        </section>
      </div>
    </SectionLayout>
  );
}
