'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Variant = 'vulnerable' | 'secure';

type StepId = 'exist' | 'password' | 'token';

type StepResult = {
  id: StepId;
  label: string;
  time: number;
  executed: boolean;
  status: 'pass' | 'fail' | 'dummy';
};

type SimResult = {
  steps: StepResult[];
  total: number;
  message: string;
  outcome: 'success' | 'fail';
};

type Props = {
  variant: Variant;
  accent: string;
  title: string;
  description: string;
};

const userDb: Record<string, string> = {
  alice: 'pass1234',
  bob: 'batteryhorse',
  carol: 'S3CR3T'
};

const steps: { id: StepId; label: string }[] = [
  { id: 'exist', label: '存在チェック' },
  { id: 'password', label: 'パスワード照合' },
  { id: 'token', label: 'トークン生成' }
];

function randRange(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

function simulateFlow(variant: Variant, username: string, password: string): SimResult {
  const normalized = username.trim().toLowerCase();
  const exists = normalized.length > 0 && Object.prototype.hasOwnProperty.call(userDb, normalized);
  const passwordOk = exists && password === userDb[normalized];

  if (variant === 'vulnerable') {
    const existTime = randRange(12, 28);
    const pwTime = randRange(60, 110);
    const tokenTime = randRange(30, 55);

    if (!exists) {
      return {
        steps: [
          { id: 'exist', label: '存在チェック', time: existTime, executed: true, status: 'fail' },
          { id: 'password', label: 'パスワード照合', time: 0, executed: false, status: 'fail' },
          { id: 'token', label: 'トークン生成', time: 0, executed: false, status: 'fail' }
        ],
        total: existTime,
        message: 'ユーザーが見つからず存在チェックで終了 → 速いレスポンス',
        outcome: 'fail'
      };
    }

    if (!passwordOk) {
      return {
        steps: [
          { id: 'exist', label: '存在チェック', time: existTime, executed: true, status: 'pass' },
          { id: 'password', label: 'パスワード照合', time: pwTime, executed: true, status: 'fail' },
          { id: 'token', label: 'トークン生成', time: 0, executed: false, status: 'fail' }
        ],
        total: existTime + pwTime,
        message: '存在チェックは通るがパスワード不一致で途中終了',
        outcome: 'fail'
      };
    }

    return {
      steps: [
        { id: 'exist', label: '存在チェック', time: existTime, executed: true, status: 'pass' },
        { id: 'password', label: 'パスワード照合', time: pwTime, executed: true, status: 'pass' },
        { id: 'token', label: 'トークン生成', time: tokenTime, executed: true, status: 'pass' }
      ],
      total: existTime + pwTime + tokenTime,
      message: 'すべての段階を通過 → レスポンスが最も遅い',
      outcome: 'success'
    };
  }

  // secure: すべての段階を同じ重さで実行（ダミー処理含む）
  const existTime = randRange(60, 70);
  const pwTime = randRange(70, 85);
  const tokenTime = randRange(55, 70);

  return {
    steps: [
      { id: 'exist', label: '存在チェック', time: existTime, executed: true, status: exists ? 'pass' : 'dummy' },
      { id: 'password', label: 'パスワード照合', time: pwTime, executed: true, status: passwordOk ? 'pass' : 'dummy' },
      { id: 'token', label: 'トークン生成', time: tokenTime, executed: true, status: passwordOk ? 'pass' : 'dummy' }
    ],
    total: existTime + pwTime + tokenTime,
    message: exists
      ? passwordOk
        ? '成功（ただし段階ごとに同じ重さ）'
        : 'パスワード不一致でも最後まで同じ重さで進む'
      : 'ユーザーがいなくてもダミー処理で全段階を実行',
    outcome: passwordOk ? 'success' : 'fail'
  };
}

function barColor(step: StepResult, accent: string) {
  if (!step.executed) return '#e2e8f0';
  if (step.status === 'dummy') return '#cbd5e1';
  if (step.status === 'pass') return accent;
  return '#ef4444';
}

export function FlowDemo({ variant, accent, title, description }: Props) {
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('pass1234');
  const [result, setResult] = useState<SimResult | null>(null);
  const [activeStep, setActiveStep] = useState<StepId | null>(null);
  const [running, setRunning] = useState(false);
  const timersRef = useRef<number[]>([]);

  const maxTime = useMemo(() => {
    if (!result) return 1;
    return Math.max(1, ...result.steps.map((s) => s.time));
  }, [result]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const run = () => {
    clearTimers();
    setRunning(true);
    const sim = simulateFlow(variant, username, password);
    setResult(sim);

    // 段階ごとの時間に応じてステップをハイライト
    let elapsed = 0;
    sim.steps.forEach((step) => {
      const duration = step.executed ? step.time : 80;
      const displayDuration = Math.max(160, duration * 4); // 見やすい長さにスケーリング
      const timer = window.setTimeout(() => {
        setActiveStep(step.id);
      }, elapsed);
      timersRef.current.push(timer);
      elapsed += displayDuration;
    });

    const endTimer = window.setTimeout(() => {
      setActiveStep(null);
      setRunning(false);
    }, elapsed + 300);
    timersRef.current.push(endTimer);
  };

  useEffect(() => {
    run();
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  const activeLabel = activeStep ? steps.find((s) => s.id === activeStep)?.label ?? '' : '';

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent }} />
        <div style={{ fontWeight: 700, fontSize: 18 }}>{title}</div>
      </div>
      <div style={{ fontSize: 15, color: '#475569', marginBottom: 12 }}>{description}</div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <label style={{ fontWeight: 600 }}>username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '10px 12px', fontSize: 16, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 140 }}
        />
        <label style={{ fontWeight: 600 }}>password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px 12px', fontSize: 16, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 160 }}
        />
        <button
          onClick={run}
          disabled={running}
          style={{
            padding: '10px 18px',
            fontWeight: 700,
            color: '#fff',
            background: running ? '#94a3b8' : accent,
            border: 'none',
            borderRadius: 10,
            cursor: running ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {running ? '計測中...' : 'この条件で試行'}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          padding: '10px 12px',
          borderRadius: 12,
          background: '#0f172a',
          color: '#e2e8f0',
          boxShadow: '0 6px 16px rgba(0,0,0,0.25)'
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: running ? '#22c55e' : '#94a3b8',
            boxShadow: running ? '0 0 0 8px rgba(34,197,94,0.18)' : 'none',
            transition: 'all 0.2s ease'
          }}
        />
        <div style={{ fontWeight: 700 }}>
          {running ? `サーバー処理中: ${activeLabel || '準備中…'}` : 'サーバー待機中'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 14 }}>
        {steps.map((step) => {
          const res = result?.steps.find((s) => s.id === step.id);
          const isActive = activeStep === step.id;
          const color = res ? barColor(res, accent) : '#e2e8f0';
          const borderColor = isActive ? accent : '#cbd5e1';
          return (
            <div
              key={step.id}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: 10,
                padding: 10,
                background: '#f8fafc',
                boxShadow: isActive ? `0 0 0 4px ${accent}22` : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
                <div style={{ fontWeight: 700 }}>{step.label}</div>
              </div>
              <div style={{ fontSize: 13, color: '#475569' }}>
                {res
                  ? !res.executed
                    ? '実行されず'
                    : res.status === 'dummy'
                      ? 'ダミー処理'
                      : res.status === 'pass'
                        ? '実行'
                        : '途中終了'
                  : '---'}
              </div>
            </div>
          );
        })}
      </div>

      {result && (
        <>
          <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
            {result.steps.map((step) => {
              const width = step.time === 0 ? 4 : Math.max(12, Math.round((step.time / maxTime) * 100));
              return (
                <div key={step.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475569' }}>
                    <span>{step.label}</span>
                    <span>{step.time.toFixed(0)} ms</span>
                  </div>
                  <div
                    style={{
                      height: 16,
                      borderRadius: 8,
                      background: '#e2e8f0',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div
                      style={{
                        width: `${width}%`,
                        height: '100%',
                        background: barColor(step, accent),
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 700
            }}
          >
            <span style={{ color: '#0f172a' }}>{result.message}</span>
            <span style={{ color: accent }}>{result.total.toFixed(0)} ms</span>
          </div>
        </>
      )}
    </div>
  );
}
