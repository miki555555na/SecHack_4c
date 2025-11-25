'use client';

import React, { useEffect, useRef, useState } from 'react';

type Resource = { id: string; label: string };
type AccessResult = { id: string; label: string; cached: boolean; time: number; message: string };

const RESOURCES: Resource[] = [
  { id: 'img_logo', label: '画像: ロゴ（アクセス有無）' },
  { id: 'profile_pic', label: '画像： ログイン成功画面（ログイン有無）' },
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
  // ベース遅延
  const base = cached ? randRange(20, 70) : randRange(250, 520);
  // キャッシュミスには追加のランダム遅延（ネットワーク揺らぎなどを模す）
  const jitter = cached ? 0 : Math.round(Math.random() * 120);
  const totalDelay = base + jitter;
  // 実際に待つ（ここが「API呼び出し」の代わり）
  await new Promise((res) => {
    const t = window.setTimeout(res, totalDelay);
    // タイマーは管理外（UI 側でキャンセル不要な短時間）
  });
  // 戻り値は実際に待ったミリ秒（近似）
  return totalDelay;
}

function randRange(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

// 表示をゆっくりするためのスケール
const DISPLAY_SCALE = 4;
const MIN_DISPLAY = 300;

export function CacheDemo() {
  const [cachedMap, setCachedMap] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string>(RESOURCES[0].id);
  const [history, setHistory] = useState<AccessResult[]>([]);
  const [running, setRunning] = useState(false);
  const timersRef = useRef<number[]>([]);

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

  const access = async (resId: string) => {
    const cached = !!cachedMap[resId];
    setRunning(true);

    // pending 表示（すぐに追加）
    const pending: AccessResult = { id: resId, label: RESOURCES.find((r) => r.id === resId)!.label, cached, time: 0, message: 'アクセス中…' };
    setHistory((h) => [pending, ...h].slice(0, 6));

    // 実際に API を呼ぶ（模擬）しつつ経過時間を測る
    const start = performance.now();
    const simulatedMs = await simulateApiRequest(resId, cached);
    const end = performance.now();
    const actualMs = Math.max(1, Math.round(end - start)); // 実測値（ms）

    // 表示用の遅延（視認性のため拡大）は従来のロジックを踏襲
    const displayTime = Math.max(MIN_DISPLAY, actualMs * DISPLAY_SCALE);

    // 既に入れている pending を置き換えるためにタイマーで結果表示
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

  const setCache = (resId: string, flag: boolean) => {
    setCachedMap((m) => ({ ...m, [resId]: flag }));
  };

  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e6eef8', padding: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 700 }}>リソースを選択</div>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8 }}>
          {RESOURCES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => access(selected)}
          disabled={running}
          style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}
        >
          {running ? 'アクセス中…' : 'アクセス'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        {RESOURCES.map((r) => (
          <div key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setCache(r.id, true)}
              style={{
                padding: '6px 8px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: cachedMap[r.id] ? '#bbf7d0' : '#f8fafc',
                cursor: 'pointer'
              }}
            >
              セット ({r.label})
            </button>
            <button
              onClick={() => setCache(r.id, false)}
              style={{
                padding: '6px 8px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: !cachedMap[r.id] ? '#fee2e2' : '#f8fafc',
                cursor: 'pointer'
              }}
            >
              クリア
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ fontWeight: 700 }}>直近のアクセス結果</div>
        <div>
          {history.length === 0 && <div style={{ color: '#64748b' }}>まだアクセスしていません</div>}
          {history.map((h, idx) => {
            const barWidth = Math.max(6, Math.min(100, (h.time / 600) * 100));
            const color = h.message.includes('ヒット') ? '#16a34a' : '#ef4444';
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 160 }}>
                  <div style={{ fontWeight: 700 }}>{h.label}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{h.cached ? '現在: キャッシュあり' : '現在: キャッシュなし'}</div>
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
                <div style={{ width: 220, textAlign: 'right', fontSize: 13, color: '#0f172a' }}>{h.message}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
