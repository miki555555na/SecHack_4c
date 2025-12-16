'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

type FlowDemoInnerProps = Props & {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

function FlowDemoInner({
  variant,
  accent,
  title,
  description,
  username,
  password,
  onUsernameChange,
  onPasswordChange
}: FlowDemoInnerProps) {
  const [result, setResult] = useState<SimResult | null>(null);
  const [activeStep, setActiveStep] = useState<StepId | null>(null);
  const [running, setRunning] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const run = () => {
    if (running) return;
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
  }, []);

  const activeLabel = activeStep ? steps.find((s) => s.id === activeStep)?.label ?? '' : '';

  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="size-2.5 rounded-full" style={{ background: accent }} />
        <div className="text-2xl font-semibold text-foreground">{title}</div>
      </div>
      <div className="mt-2 text-xl leading-relaxed text-muted-foreground">{description}</div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
        {/* 左：ログインフォーム */}
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="text-xl font-semibold text-foreground">ログインを試す</div>
          <div className="mt-3 grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-base font-semibold text-muted-foreground">username</label>
              <Input
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="例: alice"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') run();
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-base font-semibold text-muted-foreground">password</label>
              <Input
                type="text"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="例: pass1234"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') run();
                }}
              />
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {sampleUsers.map((s) => {
              const selected = username === s.username && password === s.password;
	              return (
	                <Button
	                  key={s.label}
	                  type="button"
	                  variant="outline"
	                  onClick={() => {
	                    onUsernameChange(s.username);
	                    onPasswordChange(s.password);
	                  }}
                  className={cn('h-auto justify-start whitespace-normal px-3 py-3 text-left text-base font-semibold', selected && 'border-transparent')}
	                  style={{
	                    background: selected ? `${accent}14` : undefined,
	                    boxShadow: selected ? `0 0 0 3px ${accent}22` : undefined
	                  }}
                >
                  {s.label}
                </Button>
              );
            })}
          </div>

          <Button
            onClick={run}
            disabled={running}
            size="lg"
            className="mt-4 w-full text-xl font-semibold text-white"
            style={{ background: running ? '#94a3b8' : accent }}
          >
            {running ? '計測中...' : 'この条件で試行'}
          </Button>
        </div>

        {/* 右：可視化（コードのみ） */}
        <div className="grid gap-3">
          <div className="flex items-center gap-3 rounded-xl border bg-slate-950 px-4 py-3 text-slate-100 shadow-sm">
            <div
              className="size-2.5 rounded-full"
              style={{
                background: running ? '#22c55e' : '#94a3b8',
                boxShadow: running ? '0 0 0 6px rgba(34,197,94,0.18)' : 'none'
              }}
            />
            <div className="flex-1 text-right text-xl font-semibold">
              {running ? `サーバー処理中: ${activeLabel || '準備中…'}` : 'サーバー待機中'}
            </div>
          </div>

          <div className="rounded-xl border bg-slate-950 p-4 text-slate-100 shadow-sm">
            <div className="grid gap-2 font-mono text-base leading-relaxed">
              {steps.map((stepMeta) => {
                const isActive = activeStep === stepMeta.id;
                const code = codeSnippets[variant][stepMeta.id];
                return (
                  <div
                    key={stepMeta.id}
                    className={cn(
                      'rounded-lg border px-3 py-2 transition-all',
                      isActive ? 'border-white/30' : 'border-white/10'
                    )}
                    style={{
                      background: isActive ? `${accent}2a` : 'transparent',
                      boxShadow: isActive ? `0 0 0 4px ${accent}22` : 'none'
                    }}
                  >
                    <div className="mb-1 text-sm text-slate-300">{stepMeta.label}</div>
                    <div className="whitespace-pre-wrap text-slate-50">{code}</div>
                  </div>
                );
              })}
            </div>
          </div>

	          <div className="rounded-xl border bg-background p-4 text-right">
	            <div className="text-xl font-semibold text-foreground">
	              {result ? result.message : 'まだ実行していません'}
	            </div>
	            <div className="mt-1 font-mono text-3xl font-semibold" style={{ color: accent }}>
	              {result ? `${result.total.toFixed(0)} ms` : '--- ms'}
	            </div>
	          </div>
	        </div>
	      </div>
	    </div>
	);
}

export function FlowDemo(props: Props) {
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('pass1234');

  return (
    <FlowDemoInner
      key={props.variant}
      {...props}
      username={username}
      password={password}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
    />
  );
}
