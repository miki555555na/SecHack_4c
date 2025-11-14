import React, { useState } from 'react';

const SECRET = 'S3Cxx'; // デモ用のシークレット（例）

function busyWait(ms: number) {
	// 単純な busy-wait（ブラウザで短時間の遅延をシミュレート）
	const start = performance.now();
	while (performance.now() - start < ms) {
		/* busy */
	}
}

function vulnerableCompare(input: string, secret: string): boolean {
	// 先に不一致が見つかるとすぐに return する脆弱な比較。
	// マッチした文字ごとに small busy-wait を入れて時間差を強調する（1ms/文字程度）。
	const len = Math.min(input.length, secret.length);
	for (let i = 0; i < len; i++) {
		if (input[i] !== secret[i]) return false; // 早期リターン
		busyWait(1); // マッチごとの処理時間を発生させる（1ms）
	}
	return input.length === secret.length;
}

export default function TimingDemo(): JSX.Element {
	const [input, setInput] = useState('');
	const [running, setRunning] = useState(false);
	const [bins, setBins] = useState<number[]>([]);
	const [durations, setDurations] = useState<number[]>([]);

	const run100 = async () => {
		setRunning(true);
		const results: number[] = [];
		for (let i = 0; i < 100; i++) {
			const t0 = performance.now();
			vulnerableCompare(input, SECRET);
			const t1 = performance.now();
			results.push(t1 - t0);
			// 少し待って UI スレッドに余裕を持たせる
			// （実行順序が偏らないように）
			await new Promise((r) => setTimeout(r, 1));
		}
		setDurations(results);

		// ヒストグラム（0ms〜5ms、50ビン）
		const numBins = 50;
		const maxTime = 5;
		const counts = new Array(numBins).fill(0);
		for (const d of results) {
			const clamped = Math.max(0, Math.min(d, maxTime));
			let idx = Math.floor((clamped / maxTime) * numBins);
			if (idx === numBins) idx = numBins - 1;
			counts[idx]++;
		}
		setBins(counts);
		setRunning(false);
	};

	// SVG 描画設定
	const svgW = 600;
	const svgH = 220;
	const numBins = bins.length || 50;
	const maxCount = Math.max(...bins, 1);

	return (
		<div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
			<div style={{ marginBottom: 8 }}>
				<label style={{ display: 'block', marginBottom: 6 }}>入力（推測する値）</label>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="例: S3Cxx"
					style={{ padding: '8px 10px', width: 260, fontSize: 14 }}
				/>
				<button
					onClick={run100}
					disabled={running}
					style={{ marginLeft: 12, padding: '8px 12px' }}
				>
					{running ? '実行中…' : '100回実行'}
				</button>
			</div>

			<div style={{ color: '#666', fontSize: 13, marginBottom: 10 }}>
				シークレット（デモ用）: <strong>{SECRET}</strong>
			</div>

			{bins.length > 0 ? (
				<div>
					<svg width={svgW} height={svgH} style={{ border: '1px solid #f0f0f0', background: '#fafafa' }}>
						{/* bars */}
						{bins.map((c, i) => {
							const barW = svgW / numBins;
							const h = (c / maxCount) * (svgH - 40);
							const x = i * barW;
							const y = svgH - h - 30;
							return (
								<rect
									key={i}
									x={x + 1}
									y={y}
									width={Math.max(0, barW - 2)}
									height={h}
									fill="#4f46e5"
								/>
							);
						})}

						{/* x-axis labels: 0..5 ms every 1 ms */}
						{[0, 1, 2, 3, 4, 5].map((tick) => {
							const tx = (tick / 5) * svgW;
							return (
								<g key={tick}>
									<line x1={tx} x2={tx} y1={svgH - 28} y2={svgH - 24} stroke="#999" />
									<text x={tx} y={svgH - 6} fontSize={11} fill="#333" textAnchor="middle">
										{tick}ms
									</text>
								</g>
							);
						})}

						{/* y axis label */}
						<text x={8} y={18} fontSize={12} fill="#333">
							回数（100回中）
						</text>
					</svg>

					<div style={{ marginTop: 8, color: '#444', fontSize: 13 }}>
						最大カウント: {maxCount} / 100
					</div>

					{/* オプション：生の分布を表示 */}
					<div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
						平均時間: {(durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(3)} ms
					</div>
				</div>
			) : (
				<div style={{ color: '#888' }}>「100回実行」で計測してヒストグラムを表示します。</div>
			)}
		</div>
	);
}
