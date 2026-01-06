'use client';

import React, { useEffect, useRef, useState } from 'react';

type Resource = { id: string; label: string };
type AccessResult = { id: string; label: string; cached: boolean; time: number; message: string };

// 変更: キャッシュキーをページ訪問 / サインイン情報 / API履歴に統一
const RESOURCES: Resource[] = [
  { id: 'page_visit', label: '画像: ロゴ（ページ訪問）' },
  { id: 'signed_in', label: '画像： サインイン成功（ログイン有無）' },
  { id: 'api_history', label: 'API: 過去ログ' }
];

// シンプルな遅延差（ms）
// function simulateAccess(cached: boolean) {
//   // キャッシュヒットは軽い（高速）、ミスは重い（遅延）
//   if (cached) {
//     return Math.round(20 + Math.random() * 50); // 20-70ms
//   }
//   return Math.round(300 + Math.random() * 220); // 300-520ms
// }

// --- 変更: 実際の API 呼び出しを模した非同期関数に置換 ---
async function simulateApiRequest(resourceId: string, cached: boolean): Promise<number> {
  const base = cached ? randRange(20, 70) : randRange(250, 520);
  const jitter = cached ? 0 : Math.round(Math.random() * 120);
  const totalDelay = base + jitter;
  await new Promise((res) => {
    const t = window.setTimeout(res, totalDelay);
  });
  return totalDelay;
}
function randRange(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

// 表示をゆっくりするためのスケール
const DISPLAY_SCALE = 4;
const MIN_DISPLAY = 300;

// 追加: 右ペインの画面を表す型
type Screen = 'SignIn' | 'SignedIn' | 'ApiResult';

export function CacheDemo() {
  // ...existing state...
  const [cachedMap, setCachedMap] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string>(RESOURCES[0].id);
  const [history, setHistory] = useState<AccessResult[]>([]);
  const [running, setRunning] = useState(false);
  const timersRef = useRef<number[]>([]);
  // 追加: 右ペインの画面管理
  const [screen, setScreen] = useState<Screen>('SignIn');
  // API結果画面で表示する簡易データ
  const [apiData, setApiData] = useState<string | null>(null);

  useEffect(() => {
    // 初期で何もキャッシュされていない
    const init: Record<string, boolean> = {};
    RESOURCES.forEach((r) => (init[r.id] = false));
    setCachedMap(init);
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 右ペインが SignIn にいるとき「ページ訪問キャッシュ」を残す（サインイン前に訪れた痕跡）
  useEffect(() => {
    if (screen === 'SignIn') {
      setCachedMap((m) => ({ ...m, page_visit: true }));
    }
  }, [screen]);

  const access = async (resId: string) => {
    const cached = !!cachedMap[resId];
    setRunning(true);

    const pending: AccessResult = { id: resId, label: RESOURCES.find((r) => r.id === resId)!.label, cached, time: 0, message: 'アクセス中…' };
    setHistory((h) => [pending, ...h].slice(0, 6));

    const start = performance.now();
    const simulatedMs = await simulateApiRequest(resId, cached);
    const end = performance.now();
    const actualMs = Math.max(1, Math.round(end - start));

    const displayTime = Math.max(MIN_DISPLAY, actualMs * DISPLAY_SCALE);

    const t = window.setTimeout(() => {
      const result: AccessResult = {
        id: resId,
        label: pending.label,
        cached,
        time: actualMs,
        message: cached ? 'キャッシュヒット：高速に取得' : 'キャッシュミス：遅延が発生'
      };
      setHistory((h) => [result, ...h.filter((x) => x !== pending)].slice(0, 6));
      setRunning(false);
    }, displayTime);
    timersRef.current.push(t);
  };

  // キャッシュ setter をラップ（外部からも呼ぶ）
  const setCache = (resId: string, flag: boolean) => {
    setCachedMap((m) => ({ ...m, [resId]: flag }));
  };

  // サインイン / サインアウトの挙動
  const signIn = () => {
    // サインインすると signed_in キャッシュが残る
    setCache('signed_in', true);
    setScreen('SignedIn');
  };
  const signOut = () => {
    setCache('signed_in', false);
    setScreen('SignIn');
  };

  // API取得（プロフィール等） -> キャッシュをセットし、APIResult画面へ
  const fetchProfileApi = async () => {
    // 実際のアクセスを模す（同時に履歴に登録）
    await access('api_history');
    // API が完了したらキャッシュを残し、結果表示
    setCache('api_history', true);
    setApiData('ユーザー履歴データ（ダミー）');
    setScreen('ApiResult');
  };

  const clearAllCaches = () => {
    const cleared: Record<string, boolean> = {};
    RESOURCES.forEach((r) => (cleared[r.id] = false));
    setCachedMap(cleared);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e6eef8', padding: 14 }}>
      {/* レイアウト: 左（操作） / 右（ブラウザ風） */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左カラム */}
        <div style={{ width: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 左上: キャッシュアクセス用ボタン群 */}
          <div style={{ padding: 12, borderRadius: 8, border: '1px solid #e6eef8', background: '#fbfdff' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>キャッシュ操作</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <button
                onClick={() => access('page_visit')}
                disabled={running}
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: 'pointer' }}
              >
                アクセス: ページ訪問（ロゴ）
              </button>
              <button
                onClick={() => access('signed_in')}
                disabled={running}
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: 'pointer' }}
              >
                アクセス: サインイン状態（サインイン画像）
              </button>
              <button
                onClick={() => access('api_history')}
                disabled={running}
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: 'pointer' }}
              >
                アクセス: API（過去ログ）
              </button>
            </div>
            <div>
              <button
                onClick={clearAllCaches}
                style={{ padding: '8px 10px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                全キャッシュをクリア
              </button>
            </div>
          </div>

          {/* 左下: 現在のキャッシュ状況 */}
          <div style={{ padding: 12, borderRadius: 8, border: '1px solid #e6eef8', background: '#fff7ed', flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>現在のキャッシュ状況</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>ページ訪問（ロゴ）</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ color: cachedMap.page_visit ? '#16a34a' : '#ef4444', fontWeight: 700 }}>
                    {cachedMap.page_visit ? 'あり' : 'なし'}
                  </div>
                  <button onClick={() => setCache('page_visit', false)} style={{ padding: '4px 8px', borderRadius: 6 }}>
                    クリア
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>サインイン情報（サインイン成功）</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ color: cachedMap.signed_in ? '#16a34a' : '#ef4444', fontWeight: 700 }}>
                    {cachedMap.signed_in ? 'あり' : 'なし'}
                  </div>
                  <button onClick={() => setCache('signed_in', false)} style={{ padding: '4px 8px', borderRadius: 6 }}>
                    クリア
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>API: 過去ログ</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ color: cachedMap.api_history ? '#16a34a' : '#ef4444', fontWeight: 700 }}>
                    {cachedMap.api_history ? 'あり' : 'なし'}
                  </div>
                  <button onClick={() => setCache('api_history', false)} style={{ padding: '4px 8px', borderRadius: 6 }}>
                    クリア
                  </button>
                </div>
              </div>
            </div>

            {/* 履歴表示（直近アクセス） */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>直近のアクセス結果</div>
              {history.length === 0 && <div style={{ color: '#64748b' }}>まだアクセスしていません</div>}
              {history.map((h, idx) => {
                const barWidth = Math.max(6, Math.min(100, (h.time / 600) * 100));
                const color = h.message.includes('ヒット') ? '#16a34a' : '#ef4444';
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 140 }}>
                      <div style={{ fontWeight: 700 }}>{h.label}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{h.cached ? 'キャッシュ: あり' : 'キャッシュ: なし'}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ position: 'relative', background: '#f1f5f9', height: 22, borderRadius: 8, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${barWidth}%`,
                            height: '100%',
                            background: color,
                            transition: 'width 300ms linear',
                            boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.06)'
                          }}
                        />
                        <div style={{ position: 'absolute', right: 8, top: 0, bottom: 0, display: 'flex', alignItems: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                          {h.time > 0 ? `${h.time} ms` : h.message}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右カラム: ブラウザ風表示（3画面） */}
        <div style={{ flex: 1, borderRadius: 8, border: '1px solid #e6eef8', padding: 18, background: '#f8fafc' }}>
          <div style={{ fontWeight: 800, marginBottom: 12 }}>ブラウザ風表示</div>

          {/* SignIn 画面 */}
          {screen === 'SignIn' && (
            <div style={{ padding: 20, borderRadius: 8, background: '#fff', textAlign: 'center' }}>
                <img src="/image/logo_image.png" alt="logo" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} />
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>サインインページ</div>
              <div style={{ marginBottom: 12, color: '#64748b' }}>このページに訪れるだけで「ページ訪問」キャッシュが残ります。</div>
              <button
                onClick={signIn}
                style={{ padding: '10px 14px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                サインイン
              </button>
            </div>
          )}

          {/* SignedIn 画面 */}
          {screen === 'SignedIn' && (
            <div style={{ padding: 20, borderRadius: 8, background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>サインイン成功</div>
                  <div style={{ color: '#64748b', marginTop: 6 }}>ここにプロフィール画像等が表示されます。</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={signOut}
                    style={{ padding: '8px 10px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    サインアウト
                  </button>
                  <button
                    onClick={fetchProfileApi}
                    disabled={running}
                    style={{ padding: '8px 10px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    プロフィール取得 (API)
                  </button>
                </div>
              </div>

              {/* 簡易プロフィール表示（キャッシュがあると緑で表示） */}
              <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: 8, background: cachedMap.signed_in ? '#bbf7d0' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  <img src="/image/user_icon.png" alt="logo" style={{objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>ユーザー名: demo_user</div>
                  <div style={{ color: '#64748b' }}>ログイン状態のキャッシュ: {cachedMap.signed_in ? 'あり' : 'なし'}</div>
                </div>
              </div>
            </div>
          )}

          {/* API 結果画面 */}
          {screen === 'ApiResult' && (
            <div style={{ padding: 20, borderRadius: 8, background: '#fff' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>API結果</div>
              <div style={{ color: '#64748b', marginTop: 8 }}>{apiData ?? '（結果なし）'}</div>
              <div style={{ marginTop: 12 }}>
                <button onClick={() => setScreen('SignedIn')} style={{ padding: '8px 10px', borderRadius: 8 }}>
                  戻る
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
