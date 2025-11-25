'use client';

import React, { useEffect, useRef, useState } from 'react';

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

const sampleUsers: { label: string; username: string; password: string }[] = [
  { label: '正しいパスワード', username: 'alice', password: 'pass1234' },
  { label: '誤ったパスワード', username: 'alice', password: 'wrongpass' },
  { label: '存在しないユーザー', username: 'ghost', password: 'guessme' }
];

// 表示時間を意図的に長めにするためのスケール
const DISPLAY_SCALE = 6;
const MIN_DISPLAY_MS = 900;

const steps: { id: StepId; label: string }[] = [
  { id: 'exist', label: '存在チェック' },
  { id: 'password', label: 'パスワード照合' },
  { id: 'token', label: 'トークン生成' }
];

const codeSnippets: Record<Variant, Record<StepId, string>> = {
  vulnerable: {
    exist: "if (!db.has(user)) return fail('ユーザーなし'); // ① ここで早期終了",
    password:
      "const ok = verifyPass(db.get(user).hash, pass); // ② 重い処理は存在する人だけ\nif (!ok) return fail('パスワード不一致'); // 途中終了",
    token: 'return issueToken(user); // ③ 成功時のみ実行'
  },
  secure: {
    exist:
      "const exists = db.has(user);\nconst hash = exists ? db.get(user).hash : dummyHash; // ダミーで全員同じ重さ",
    password:
      "const ok = constantTimeVerify(hash, pass); // 定数時間比較\nconst _token = issueTokenLikeWork(); // 成功/失敗に関わらず実行",
    token: "sleepUntil(targetMs); // 最小応答時間で固定\nreturn exists && ok ? success() : fail('same latency');"
  }
};

function randRange(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

function simulateFlow(variant: Variant, username: string, password: string): SimResult {
  const normalized = username.trim().toLowerCase();
  const exists = normalized.length > 0 && Object.prototype.hasOwnProperty.call(userDb, normalized);
  const passwordOk = exists && password === userDb[normalized];

  if (variant === 'vulnerable') {
    // わざと時間差が見やすい値に引き上げる
    const existTime = randRange(120, 180);
    const pwTime = randRange(380, 620);
    const tokenTime = randRange(220, 360);

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
  const existTime = randRange(300, 360);
  const pwTime = randRange(330, 400);
  const tokenTime = randRange(280, 340);

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

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  // パターン切替時は自動実行せず、状態だけリセット
  useEffect(() => {
    clearTimers();
    setRunning(false);
    setActiveStep(null);
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  const run = () => {
    clearTimers();
    setRunning(true);
    const sim = simulateFlow(variant, username, password);
    setResult(sim);

    // 段階ごとの時間に応じてステップをハイライト
    let elapsed = 0;
    sim.steps.forEach((step) => {
      const duration = step.executed ? step.time : 0;
      const displayDuration = step.executed
        ? Math.max(MIN_DISPLAY_MS, duration * DISPLAY_SCALE) // 体感用に大幅スロー
        : 220; // 早期終了したステップは光らせず短く流す

      if (step.executed) {
        const timer = window.setTimeout(() => {
          setActiveStep(step.id);
        }, elapsed);
        timersRef.current.push(timer);
      }
      elapsed += displayDuration;
    });

    const endTimer = window.setTimeout(() => {
      setActiveStep(null);
      setRunning(false);
    }, elapsed + 300);
    timersRef.current.push(endTimer);
  };

  useEffect(() => {
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeLabel = activeStep ? steps.find((s) => s.id === activeStep)?.label ?? '' : '';

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent }} />
        <div style={{ fontWeight: 700, fontSize: 18 }}>{title}</div>
      </div>
      <div style={{ fontSize: 15, color: '#475569', marginBottom: 12 }}>{description}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16, alignItems: 'start' }}>
        {/* 左：ログインフォームと状態 */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>ログインを試す</div>
          <div style={{ display: 'grid', gap: 8, marginBottom: 8 }}>
            <label style={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="例: alice"
              style={{ padding: '10px 12px', fontSize: 16, borderRadius: 8, border: '1px solid #cbd5e1' }}
            />
            <label style={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="例: pass1234"
              style={{ padding: '10px 12px', fontSize: 16, borderRadius: 8, border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8, marginBottom: 12 }}>
            {sampleUsers.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setUsername(s.username);
                  setPassword(s.password);
                }}
                style={{
                  padding: '9px 11px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background:
                    username === s.username && password === s.password ? `${accent}15` : '#f8fafc',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#0f172a',
                  fontWeight: 600,
                  textAlign: 'left',
                  boxShadow:
                    username === s.username && password === s.password
                      ? `0 0 0 3px ${accent}22`
                      : '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={run}
            disabled={running}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontWeight: 700,
              color: '#fff',
              background: running ? '#94a3b8' : accent,
              border: 'none',
              borderRadius: 10,
              cursor: running ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'background 0.2s ease'
            }}
          >
            {running ? '計測中...' : 'この条件で試行'}
          </button>
        </div>

        {/* 右：段階の可視化 */}
        <div>
          <div style={{ display: 'grid', gap: 8, alignItems: 'flex-end', justifyItems: 'end', marginBottom: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 12,
                background: '#0f172a',
                color: '#e2e8f0',
                boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                width: '100%',
                boxSizing: 'border-box'
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
              <div style={{ fontWeight: 700, textAlign: 'right', flex: 1 }}>
                {running ? `サーバー処理中: ${activeLabel || '準備中…'}` : 'サーバー待機中'}
              </div>
            </div>

          </div>

          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                background: '#0b1220',
                color: '#e2e8f0',
                padding: '12px 14px',
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.6,
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
              }}
            >
              {steps.map((step) => {
                const isActive = activeStep === step.id;
                const code = codeSnippets[variant][step.id];
                return (
                  <div
                    key={step.id}
                    style={{
                      padding: '8px 10px',
                      marginBottom: 6,
                      borderRadius: 10,
                      background: isActive ? `${accent}33` : 'transparent',
                      border: isActive ? `1px solid ${accent}` : '1px solid #1e293b',
                      boxShadow: isActive ? `0 0 0 4px ${accent}22` : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ color: '#94a3b8', marginBottom: 4 }}>{step.label}</div>
                    <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{code}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {!running && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: '#fff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 6,
                fontWeight: 700,
                textAlign: 'right',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ color: '#0f172a' }}>
                {result ? result.message : 'まだ実行していません'}
              </span>
              <span style={{ color: accent, fontSize: 18 }}>
                {result ? `${result.total.toFixed(0)} ms` : '--- ms'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
