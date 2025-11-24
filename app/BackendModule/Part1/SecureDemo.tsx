'use client'
import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

// randomInt の代替実装（min以上max未満の整数を返す）
function randomInt(min: number, max: number): number {
  const range = max - min;
  if (range <= 0) return min;
  // 32bit乱数
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return min + (array[0] % range);
}
export type DemoRef = {
  run: () => void;
};

export const SecureDemo = forwardRef<DemoRef, {input: string}>(({input}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [avgTime, setAvgTime] = useState<number | null>(null);
  const [countsSummary, setCountsSummary] = useState<number[]>([]);
  const secret = 'S3CR3T'; // vulnerable secret

  // 固定設定
  const cfg = {
    runs: 100,
    perCharDelayMs: 1.0,
    bins: 10,
    maxMs: 15
  };

  // secureCompare: 各一致文字ごとに cfg.perCharDelayMs を挿入（同期的な busy-wait）
  function secureCompare(a: string, b: string): boolean {
    let result = true;
    const len = Math.max(a.length, b.length);
    // ノイズ追加（±0.1ms のランダムノイズ）
    const noise = randomInt(-100, 101) * 0.005;
    const perCharDelayMs = cfg.perCharDelayMs + noise;
    for (let i = 0; i < 10; i++) {
      if (i >= a.length || i >= b.length) result = false;
      if (a[i] !== b[i]) result=false; // early return on first mismatch
      const start = performance.now();
      while (performance.now() - start < perCharDelayMs) {
        /* busy-wait */
      }
    }
    return result;
  }

  // ヒストグラム生成
  function buildHistogram(durationsMs: number[]) {
    const counts = new Array(cfg.bins).fill(0);
    const binSize = cfg.maxMs / cfg.bins;
    for (const v0 of durationsMs) {
      const v = Math.max(0, Math.min(cfg.maxMs, v0));
      const idx = Math.min(cfg.bins - 1, Math.floor(v / binSize));
      counts[idx]++;
    }
    return counts;
  }

  // 描画
  function drawHistogram(counts: number[]) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const maxCount = Math.max(1, ...counts);
    const margin = 30;
    const plotW = w - margin * 2;
    const plotH = h - margin * 2;
    const barW = plotW / counts.length;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#4c9aff';
    for (let i = 0; i < counts.length; i++) {
      const c = counts[i];
      const bw = Math.max(1, Math.floor(barW - 1));
      const bh = Math.round((c / maxCount) * plotH);
      const x = margin + i * barW;
      const y = margin + (plotH - bh);
      ctx.fillRect(x, y, bw, bh);
    }

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, margin + plotH);
    ctx.lineTo(margin + plotW, margin + plotH);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '14px sans-serif';
    const ticks = 2;
    for (let t = 0; t <= ticks; t++) {
      const frac = t / ticks;
      const x = margin + frac * plotW;
      const val = Math.round(frac * cfg.maxMs);
      const y = margin + plotH + 18;
      ctx.fillText(`${val}ms`, x - 20, y);
      ctx.beginPath();
      ctx.moveTo(x, margin + plotH);
      ctx.lineTo(x, margin + plotH + 4);
      ctx.stroke();
    }
  }

  // 描画
  useEffect(() => {
    if (countsSummary.length === 0) return;
    drawHistogram(countsSummary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countsSummary]);

  // 実行関数
  const runConfigured = useCallback(async () => {
    const durations = [];
    const target = input; // <--- 親から渡された input prop を使用
    const MAX_RUNS = cfg.runs;
    for (let i = 0; i < MAX_RUNS; i++) {
      const t0 = performance.now();
      secureCompare(secret, input);
      const t1 = performance.now();
      durations.push(t1 - t0);
      if ((i + 1) % 10 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    // 平均時間を計算
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    setAvgTime(avg);

    // ヒストグラム作成
    const counts = buildHistogram(durations);
    setCountsSummary(counts);
  }, [input, secret, cfg.runs, cfg.perCharDelayMs, cfg.bins, cfg.maxMs]);

  useImperativeHandle(ref, () => ({
    run: runConfigured
  }));

  return (
    <div style={{ height: 350, maxHeight:'100%', padding: 15, background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', boxSizing:'border-box' }}>
      {/* 入力エリア */}
      {/* <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <label style={{ fontSize: 24, fontWeight: 600 }}>入力:</label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            padding: '12px 16px',
            fontSize: 22,
            minWidth: 220,
            border: '2px solid #ddd',
            borderRadius: 6
          }}
        />
        <button
          onClick={runConfigured}
          style={{
            padding: '12px 28px',
            fontSize: 22,
            fontWeight: 600,
            background: '#4c9aff',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          実行
        </button>
      </div> */}

      {/* 平均時間 */}
      {avgTime !== null && (
        <div style={{
          fontSize: 32, // 2. 平均時間のフォントサイズを縮小
          fontWeight: 700,
          marginBottom: 10, // 3. マージンを縮小
          color: '#16a34a' // 安全なコードなので緑色にする
        }}>
          平均: {avgTime.toFixed(2)} ms
        </div>
      )}

      {/* グラフ */}
      <canvas
        ref={canvasRef}
        width={500} // 4. グラフの幅を縮小
        height={250} // 5. グラフの高さを縮小
        style={{ display: 'block', margin: '0 auto' }}
      />
    </div>
  );
});