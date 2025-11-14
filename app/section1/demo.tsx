'use client'
import React, { useEffect, useRef, useState } from 'react';

// randomInt の代替実装（min以上max未満の整数を返す）
function randomInt(min: number, max: number): number {
  const range = max - min;
  if (range <= 0) return min;
  // 32bit乱数
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return min + (array[0] % range);
}

export default function TimingDemo(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [input, setInput] = useState('Sxxxx'); // default guess
  const [countsSummary, setCountsSummary] = useState<number[]>([]);
  const [lastDurations, setLastDurations] = useState<number[]>([]);
  const [binSize, setBinSize] = useState<number>(0); // 最後の binSize を保持
  const secret = 'S3CR3T'; // vulnerable secret

  // 変更: 設定を state 化していつでも変更可能に
  const [cfg, setCfg] = useState({
    runs: 100,
    perCharDelayMs: 1.0, // ms（各一致文字あたりの同期遅延）
    bins: 10,
    maxMs: 15, // ヒストグラムの最大値（ms）
    unit: 'ms' as 'ms' | 'us'
  });
  function updateCfg<K extends keyof typeof cfg>(k: K, v: typeof cfg[K]) {
    setCfg((s) => ({ ...s, [k]: v }));
  }

  // insecureCompare: 各一致文字ごとに cfg.perCharDelayMs を挿入（同期的な busy-wait）
  function insecureCompare(a: string, b: string): boolean {
    const len = Math.max(a.length, b.length);
    // ノイズ追加（±0.1ms のランダムノイズ）
    const noise = randomInt(-100, 101) * 0.005;
    const perCharDelayMs = cfg.perCharDelayMs + noise;
    for (let i = 0; i < len; i++) {
      if (i >= a.length || i >= b.length) return false;
      if (a[i] !== b[i]) return false; // early return on first mismatch
      const start = performance.now();
      while (performance.now() - start < perCharDelayMs) {
        /* busy-wait */
      }
    }
    return true;
  }

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

  // ヒストグラム生成（単位は cfg.unit で切替可能）
  function buildHistogram(durationsMs: number[], bins = cfg.bins, maxMs = cfg.maxMs, unit: 'ms' | 'us' = cfg.unit) {
    let values: number[] = durationsMs;
    let max = maxMs;
    if (unit === 'us') {
      values = durationsMs.map((d) => d * 1000); // ms -> µs
      max = maxMs * 1000;
    }
    const counts = new Array(bins).fill(0);
    const binSize = max / bins;
    for (const v0 of values) {
      const v = Math.max(0, Math.min(max, v0));
      const idx = Math.min(bins - 1, Math.floor(v / binSize));
      counts[idx]++;
    }
    return { counts, binSize };
  }

  // 描画（ms/µs に応じてラベル切替）
  function drawHistogram(counts: number[], binSize: number, maxVal: number) {
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
    ctx.font = '12px sans-serif';
    const ticks = 2;
    for (let t = 0; t <= ticks; t++) {
      const frac = t / ticks;
      const x = margin + frac * plotW;
      const val = Math.round(frac * maxVal);
      const y = margin + plotH + 16;
      ctx.fillText(`${val}`, x - 18, y);
      ctx.beginPath();
      ctx.moveTo(x, margin + plotH);
      ctx.lineTo(x, margin + plotH + 4);
      ctx.stroke();
    }
    ctx.fillText(`回数 (out of ${cfg.runs})`, 8, 14);
  }

  // 描画を state に依存させる（countsSummary または binSize が変わったら描画）
  useEffect(() => {
    if (countsSummary.length === 0) return;
    if (cfg.unit === 'ms') {
      drawHistogram(countsSummary, binSize, cfg.maxMs, 'ms');
    } else {
      drawHistogram(countsSummary, binSize, cfg.maxMs * 1000, 'µs');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countsSummary, binSize, cfg.unit, cfg.maxMs, cfg.runs]);

  // 実行関数: cfg.runs を使う（UI ブロック回避のためバッチで yield）
  async function runConfigured() {
    const durations: number[] = []; // ms
    for (let i = 0; i < cfg.runs; i++) {
      const t0 = performance.now();
      secureCompare(secret, input);
      const t1 = performance.now();
      durations.push(t1 - t0);
      if ((i + 1) % Math.max(1, Math.floor(cfg.runs / 10)) === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    setLastDurations(durations);

    // コンソール出力（要約 + 先頭30件のみ）
    const secs = durations.map(d => d / 1000);
    const sample = secs.slice(0, 30).map(s => s.toFixed(6));
    const min = Math.min(...secs);
    const max = Math.max(...secs);
    const avg = secs.reduce((a, b) => a + b, 0) / secs.length;
    console.log('timing summary (s):', { count: secs.length, min: min.toFixed(6), max: max.toFixed(6), avg: avg.toFixed(6) });
    console.log('sample timings (s):', sample);

    // ヒストグラム作成（unit による切替）
    if (cfg.unit === 'ms') {
      const { counts, binSize: newBin } = buildHistogram(durations, cfg.bins, cfg.maxMs, 'ms');
      setBinSize(newBin);
      setCountsSummary(counts);
    } else {
      const { counts, binSize: newBin } = buildHistogram(durations, cfg.bins, cfg.maxMs, 'us');
      setBinSize(newBin);
      setCountsSummary(counts);
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, background: '#fff' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <label style={{ fontWeight: 600 }}>Guess:</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} style={{ padding: '6px 8px', minWidth: 140 }} />
        {/* 設定 UI */}
        <label style={{ fontSize: 12 }}>runs</label>
        <input type="number" value={cfg.runs} onChange={(e) => updateCfg('runs', Math.max(1, Number(e.target.value) || 1))} style={{ width: 80 }} />
        <label style={{ fontSize: 12 }}>delay(ms)</label>
        <input type="number" step="0.1" value={cfg.perCharDelayMs} onChange={(e) => updateCfg('perCharDelayMs', Math.max(0, Number(e.target.value) || 0))} style={{ width: 80 }} />
        <label style={{ fontSize: 12 }}>bins</label>
        <input type="number" value={cfg.bins} onChange={(e) => updateCfg('bins', Math.max(1, Number(e.target.value) || 1))} style={{ width: 80 }} />
        <label style={{ fontSize: 12 }}>max(ms)</label>
        <input type="number" value={cfg.maxMs} onChange={(e) => updateCfg('maxMs', Math.max(1, Number(e.target.value) || 1))} style={{ width: 80 }} />
        <select value={cfg.unit} onChange={(e) => updateCfg('unit', e.target.value as 'ms' | 'us')}>
          <option value="ms">ms</option>
          <option value="us">µs</option>
        </select>
        <button onClick={runConfigured} style={{ padding: '6px 10px' }}>{cfg.runs}回実行</button>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <canvas ref={canvasRef} width={600} height={220} style={{ border: '1px solid #eee' }} />
        <div style={{ width: 260 }}>
          <div style={{ fontSize: 13, marginBottom: 8 }}>
            結果（{cfg.runs}回の分布サマリ）
          </div>
          <div style={{ maxHeight: 180, overflow: 'auto', fontSize: 12 }}>
            {countsSummary.length === 0 ? (
              <div style={{ color: '#666' }}>
                実行してヒストグラムを表示します（範囲: 0-
                {cfg.unit === 'ms'
                  ? cfg.maxMs
                  : cfg.maxMs * 1000
                } {cfg.unit === 'ms' ? 'ms' : 'µs'}
                ）
              </div>
            ) : (
              countsSummary.map((c, i) => {
                // binの範囲をcfg.maxMs/cfg.binsで計算
                const binStart = i * (cfg.unit === 'ms' ? cfg.maxMs : cfg.maxMs * 1000) / countsSummary.length;
                const binEnd = (i + 1) * (cfg.unit === 'ms' ? cfg.maxMs : cfg.maxMs * 1000) / countsSummary.length;
                return (
                  <div key={i} style={{ marginBottom: 4 }}>
                    {Math.round(binStart)}-{Math.round(binEnd)} {cfg.unit === 'ms' ? 'ms' : 'µs'}: {c} 回
                  </div>
                );
              })
            )}
          </div>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            <div>直近の測定（最初の 10 件, 秒単位）:</div>
            <div style={{ color: '#333' }}>
              {lastDurations.slice(0, 10).map(d => (d / 1000).toFixed(6) + ' s').join(', ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}