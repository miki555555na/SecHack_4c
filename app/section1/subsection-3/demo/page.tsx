"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type TimePoint = { idx: number; time: number };

function ChartLine({ data, labels, hideXAxis }: { data: TimePoint[]; labels?: string[]; hideXAxis?: boolean }) {
  const chartData = {
    labels: labels || data.map((_, i) => `${i + 1}`),
    datasets: [
      {
        label: 'キー間(ms)',
        data: data.map(d => d.time),
        fill: false,
        borderColor: '#2563eb',
        backgroundColor: '#1d4ed8',
        tension: 0.2,
        pointRadius: 5,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const v = context.raw;
            return `${v} ms`;
          }
        }
      },
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        display: hideXAxis ? false : true,
        title: { display: false },
      },
      y: {
        display: true,
        title: { display: true, text: 'ms' },
      }
    }
  };

  return (
    <div style={{ height: 160 }} className="border bg-white p-2">
      <Line data={chartData} options={options} />
    </div>
  );
}


export default function DemoPage() {
  // ローディング状態は表示用途のみにして入力の無効化はしない

  // Experience 1 (left input / right chart)
  const [timings1, setTimings1] = useState<number[]>([]);
  const [value1, setValue1] = useState("");

  // Experience 2 (right input / left chart)
  const [timings2, setTimings2] = useState<number[]>([]);
  const [value2, setValue2] = useState("");

  const candidateWords = ["happy", "hurry", "harpy"];

  // Challenge state (ここは変更なし)
  const [challengeWord, setChallengeWord] = useState<string | null>(null);
  const [challengeTimings, setChallengeTimings] = useState<number[] | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  // APIを叩く共通関数 (キーストローク送信)
  const sendKeystroke = async (sessionId: 'exp1' | 'exp2'): Promise<number> => {
    try {
      const res = await fetch('/api/keystroke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId }),
      });
      if (!res.ok) {
        throw new Error('API request failed');
      }
      const data = await res.json();
      return data.observedDelta;
    } catch (error) {
      console.error(error);
      return -1; // エラー時は負の値を返すなど
    }
  };

  // APIを叩く共通リセット関数
  const resetKeystrokeSession = async (sessionId: 'exp1' | 'exp2') => {
    try {
      await fetch('/api/keystroke/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId }),
      });
    } catch (error) {
      console.error(error);
    }
  };


  function onKeyDown1(e: React.KeyboardEvent<HTMLInputElement>) {
    // 非表示キー（Shift, Ctrl など）は計測しない
    const k = e.key;
    if (
      k === 'Shift' || k === 'Control' || k === 'Alt' || k === 'Meta' ||
      k === 'Tab' || k === 'Enter' || k.startsWith('Arrow')
    ) return;

    // サーバー計測を非同期に呼び出す（入力はブロックしない）
    sendKeystroke('exp1').then(delta => {
      if (delta > 0) setTimings1(prev => [...prev, delta]);
    }).catch(() => {});
  }

  function onChange1(e: React.ChangeEvent<HTMLInputElement>) {
    setValue1(e.target.value);
    if (e.target.value.length === 0) {
      // サーバーセッションのリセットも行う (非同期だが待たない)
      resetKeystrokeSession('exp1'); 
      setTimings1([]);
    }
  }

  async function clear1() {
    // サーバーセッションのリセット
    await resetKeystrokeSession('exp1');
    setTimings1([]);
    setValue1("");
  }

  function onKeyDown2(e: React.KeyboardEvent<HTMLInputElement>) {
    const k = e.key;
    if (
      k === 'Shift' || k === 'Control' || k === 'Alt' || k === 'Meta' ||
      k === 'Tab' || k === 'Enter' || k.startsWith('Arrow')
    ) return;

    sendKeystroke('exp2').then(delta => {
      if (delta > 0) setTimings2(prev => [...prev, delta]);
    }).catch(() => {});
  }

  function onChange2(e: React.ChangeEvent<HTMLInputElement>) {
    setValue2(e.target.value);
    if (e.target.value.length === 0) {
      // サーバーセッションのリセットも行う (非同期だが待たない)
      resetKeystrokeSession('exp2');
      setTimings2([]);
    }
  }

  async function clear2() {
    // サーバーセッションのリセット
    await resetKeystrokeSession('exp2');
    setTimings2([]);
    setValue2("");
  }

  // ... (generateChallenge, submitAnswer は変更なし) ...
  function shuffle<T>(arr: T[]) {
    return arr.slice().sort(() => Math.random() - 0.5);
  }

  function generateChallenge() {
    const target = candidateWords[Math.floor(Math.random() * candidateWords.length)];
    const len = Math.max(0, target.length - 1);
    const base = 100 + Math.random() * 200; // 100..300ms
    const t = Array.from({ length: len }, () => Math.max(30, Math.round(base + (Math.random() - 0.5) * 80)));
    setChallengeWord(target);
    setChallengeTimings(t);
    setChoices(shuffle(candidateWords));
    setSelectedChoice(null);
    setResult(null);
  }

  function submitAnswer() {
    if (!selectedChoice || !challengeWord) return;
    setResult(selectedChoice === challengeWord ? '正解！' : `不正解（正解: ${challengeWord}）`);
  }

  // ... (グラフ用のデータ生成(points1, etc) は変更なし) ...
  const points1: TimePoint[] = timings1.map((t, i) => ({ idx: i, time: t }));
  const points2: TimePoint[] = timings2.map((t, i) => ({ idx: i, time: t }));
  const challengePoints: TimePoint[] = (challengeTimings ?? []).map((t, i) => ({ idx: i, time: t }));

  function pairLabelsFromWord(word: string | null, count: number) {
    if (!word) return [] as string[];
    const labels: string[] = [];
    for (let i = 1; i < word.length; i++) {
      labels.push(`${word[i - 1]}-${word[i]}`);
    }
    if (labels.length > count) return labels.slice(0, count);
    while (labels.length < count) labels.push(`-${labels.length}`);
    return labels;
  }

  const labels1 = pairLabelsFromWord(value1, timings1.length);
  const labels2 = pairLabelsFromWord(value2, timings2.length);
  const challengeLabels = pairLabelsFromWord(challengeWord, (challengeTimings ?? []).length);


  return (
    <main className="p-8 space-y-6 bg-white text-black">
      <h1 className="text-2xl font-semibold">インタラクティブデモ：キー間隔を計測して可視化する</h1>

      <p>好きな単語を入力して、キー間隔（ms）がどのように現れるかを観察してください。折れ線グラフで可視化します。</p>

      {/* Experience 1: input left, graph right */}
      <section className="flex gap-6 items-start">
        <div className="w-1/2">
          <label className="block font-medium">実験用入力（体験1）</label>
          <input
            type="text"
            value={value1}
            onChange={onChange1}
            onKeyDown={onKeyDown1}
            placeholder="例: hello"
            className="border rounded p-2 w-full bg-white text-black"
          />
          <div className="mt-3">
            <p className="font-medium">計測されたキー間隔（ms）</p>
            {timings1.length === 0 ? (
              <p className="text-sm text-gray-600">ここに 110, 145 ... のように表示されます。</p>
            ) : (
              <ul className="list-disc ml-6">
                {timings1.map((t, i) => (
                  <li key={i} className="text-sm">{i + 1}: {t} ms</li>
                ))}
              </ul>
            )}
            <div className="mt-2">
              <button onClick={clear1} className="px-3 py-1 bg-gray-200 rounded">クリア（体験1）</button>
            </div>
          </div>
        </div>

        <div className="w-1/2">
          <p className="font-medium">折れ線グラフ（あなたの計測）</p>
          <ChartLine data={points1} labels={labels1} />
          {timings1.length > 0 && (
            <div className="mt-2 text-sm text-gray-700">
              {timings1.map((t, i) => (
                <span key={i} className="mr-3">{labels1[i] ?? `${i + 1}`}: {t}ms</span>
              ))}
            </div>
          )}
        </div>
      </section>

      <hr />

      {/* Experience 2: graph left, experimental input right */}
      <section className="flex gap-6 items-start">
        <div className="w-1/2">
          <h2 className="text-lg font-semibold">体験2（予測）: 与えられたキー感覚から単語を当てる</h2>
          <p className="text-sm">まずは「出題」ボタンを押して問題を表示します。表示されたキー間隔の折れ線を見て、下の選択肢から答えてください。回答する前に右側の実験用入力フィールドに入力して自分のタイピングを確認できます。</p>

          <div className="mt-3 flex items-center gap-3">
            <button onClick={generateChallenge} className="px-3 py-1 bg-blue-600 text-white rounded">出題</button>
            <button onClick={() => { setChallengeWord(null); setChallengeTimings(null); setChoices([]); setResult(null); }} className="px-3 py-1 bg-gray-200 rounded">リセット</button>
          </div>

          <div className="mt-4">
            <p className="font-medium">問題のキー間隔（ms）</p>
              <ChartLine data={challengePoints} labels={challengeLabels} hideXAxis={true} />
          </div>

          <div className="mt-3">
            <p className="font-medium">選択肢</p>
            <div className="mt-2 space-y-2">
              {choices.length === 0 ? (
                <p className="text-sm text-gray-600">出題ボタンを押してください。</p>
              ) : (
                choices.map(c => (
                  <label key={c} className="flex items-center gap-2">
                    <input type="radio" name="choice" value={c} checked={selectedChoice === c} onChange={() => setSelectedChoice(c)} />
                    <span>{c}</span>
                  </label>
                ))
              )}
            </div>

            <div className="mt-3">
              <button onClick={submitAnswer} className="px-3 py-1 bg-green-600 text-white rounded">回答する</button>
            </div>

            {result && (
              <p className="mt-3 font-medium">結果: {result}</p>
            )}
          </div>
        </div>

        <div className="w-1/2">
          <label className="block font-medium">実験用入力（体験2）</label>
          <input
            type="text"
            value={value2}
            onChange={onChange2}
            onKeyDown={onKeyDown2}
            placeholder="例: happy"
            className="border rounded p-2 w-full bg-white text-black"
          />
          <div className="mt-3">
            <p className="font-medium">あなたの計測（体験2）</p>
            <ChartLine data={points2} labels={labels2} hideXAxis={true} />
            {timings2.length > 0 && (
              <div className="mt-2 text-sm text-gray-700">
                {timings2.map((t, i) => (
                  <span key={i} className="mr-3">{labels2[i] ?? `${i + 1}`}: {t}ms</span>
                ))}
              </div>
            )}
            <div className="mt-2">
              <button onClick={clear2} className="px-3 py-1 bg-gray-200 rounded">クリア（体験2）</button>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-4 flex items-center">
        <Link href="/section1/subsection-3/principle" className="text-sm text-gray-700">← 戻る</Link>
        <div className="ml-auto">
          <Link href="/section1/subsection-3/application" className="px-4 py-2 bg-blue-600 text-white rounded">次へ</Link>
        </div>
      </div>
    </main>
  );
}