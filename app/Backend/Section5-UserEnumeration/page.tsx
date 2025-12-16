'use client';

import React, { useMemo, useState } from 'react';
import SectionLayout from '../../Framework/SectionLayout';
import { FlowDemo } from './FlowDemo';
import { Button } from '@/components/ui/button';
import { DemoButton, SecureCard, VulnerableCard } from '@/components/educational';
import { cn } from '@/lib/utils';

type StepId = 'why' | 'bad' | 'fix' | 'demo';

const STEPS: Array<{
  id: StepId;
  title: string;
  kicker: string;
}> = [
  { id: 'why', title: 'なぜ危険？', kicker: '時間がメッセージになる' },
  { id: 'bad', title: 'NGパターン', kicker: '途中終了で分岐する' },
  { id: 'fix', title: '対策', kicker: '定数時間化＋統一' },
  { id: 'demo', title: '体験', kicker: '段階ごとの時間差を見る' }
];

function clampStepIndex(index: number) {
  return Math.min(Math.max(index, 0), STEPS.length - 1);
}

function stepIndexOf(stepId: StepId) {
  const index = STEPS.findIndex((step) => step.id === stepId);
  return index === -1 ? 0 : index;
}

function AtAGlanceSheet() {
  const rows = [
    { 
      label: 'ユーザー不在', 
      desc: 'Step 1: 即座に却下', 
      time: 150, 
      width: '15%', 
      // Using a monochrome scale for sophistication
      color: 'bg-slate-300 dark:bg-slate-700', 
    },
    { 
      label: 'パスワード不一致', 
      desc: 'Step 2: ハッシュ計算後', 
      time: 650, 
      width: '65%', 
      color: 'bg-slate-400 dark:bg-slate-600', 
    },
    { 
      label: 'ログイン成功', 
      desc: 'Step 3: トークン発行まで', 
      time: 980, 
      width: '100%', 
      color: 'bg-slate-600 dark:bg-slate-400', 
    }
  ];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-slate-50 p-10 dark:bg-slate-900/50 md:p-14">
      
      <div className="relative z-10 mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-slate-500">
            <span className="size-3 rounded-full bg-slate-800 dark:bg-slate-200" />
            {"ATTACKER'S VIEW"}
          </div>
          <h3 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            攻撃者の視点
          </h3>
        </div>
      </div>

      <div className="relative z-10 space-y-12">
        {rows.map((row) => (
          <div key={row.label} className="group relative">
            <div className="mb-5 flex items-end justify-between">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{row.label}</div>
                <div className="text-lg font-medium text-slate-500">{row.desc}</div>
              </div>
              <div className="font-mono text-4xl font-bold tracking-tighter text-slate-900 dark:text-slate-100">
                ~{row.time}<span className="text-xl text-slate-400 ml-1">ms</span>
              </div>
            </div>
            
            <div className="relative h-8 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000 ease-out", row.color)} 
                style={{ width: row.width }}
              />
            </div>
            
            {/* Visual Guide Line */}
            <div className="absolute top-14 -z-10 h-full w-px border-l-2 border-dashed border-slate-300 dark:border-slate-700" style={{ left: row.width }} />
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-16 border-t-2 border-slate-200 pt-10 dark:border-slate-800">
        <p className="text-xl font-medium leading-relaxed text-slate-600 dark:text-slate-300">
          <span className="mr-2 inline-block font-bold text-slate-900 dark:text-slate-100">なぜ危険か？</span>
          攻撃者はサーバーからの返答内容を見ていません。<br className="hidden md:block"/>
          ただストップウォッチで<span className="border-b-2 border-slate-400 font-bold text-slate-900 dark:text-slate-100">「拒否されるまでの時間」</span>を測っているだけです。
        </p>
      </div>
    </div>
  );
}

export default function AuthFlowTimingPage() {
  const [variant, setVariant] = useState<'vulnerable' | 'secure'>('vulnerable');
  const [step, setStep] = useState<StepId>('why');

  const stepIndex = stepIndexOf(step);

  const variantInfo = useMemo(
    () =>
      variant === 'vulnerable'
        ? {
            title: '誤ったパターン（途中終了あり）',
            accent: '#ef4444',
            description: '存在しないユーザーは①で即終了、存在するユーザーは②以降が重くなりレスポンス時間で区別される。'
          }
        : {
            title: '正しいパターン（定数時間化）',
            accent: '#16a34a',
            description: '存在有無に関わらずダミー処理を含め全段階を通過し、最小応答時間を揃えてレスポンスを返す。'
          },
    [variant]
  );

  const description = (
    <div className="mx-auto max-w-3xl space-y-6 py-6 text-left">
      <p className="text-xl leading-10 text-slate-600 dark:text-slate-300">
        <span className="font-extrabold text-slate-900 dark:text-slate-100">
          ユーザー存在チェックや段階的な認証フローで
          <span className="mx-1 inline-block rounded bg-rose-50 px-2 py-0.5 font-bold text-rose-600 ring-1 ring-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800">
            途中で return
          </span>
          すると、処理にかかる
          <span className="mx-1 inline-block border-b-2 border-slate-300 font-bold text-slate-900 dark:border-slate-600 dark:text-slate-100">
            レスポンス時間
          </span>
          が分岐し、外部からユーザーの有無が推測されてしまいます。
        </span>
      </p>
    </div>
  );

  const summary = (
    <div className="space-y-2 text-base">
      <div className="font-semibold">ポイント</div>
      <div className="text-muted-foreground">
        途中終了や段階ごとの重さの違いは、時間を通じて状態（存在/不一致）を漏らす。対策は「同じだけ処理する」「最小応答時間を揃える」「メッセージ/ステータスも統一」。
      </div>
    </div>
  );

  const next = () => setStep(STEPS[clampStepIndex(stepIndex + 1)]!.id);
  const prev = () => setStep(STEPS[clampStepIndex(stepIndex - 1)]!.id);

  return (
    <SectionLayout
      title1={
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 font-mono text-xl font-bold tracking-widest text-slate-400 dark:text-slate-500">
            SECTION 05
          </div>
          <div className="max-w-4xl text-3xl font-extrabold leading-tight text-slate-900 dark:text-slate-100 md:text-5xl lg:leading-[1.2]">
            ユーザー存在チェックや<br className="hidden md:block" />
            段階的認証フローの<span className="text-rose-500">処理時間差</span>
          </div>
        </div>
      }
      title2={undefined}
      description={description}
      summary={summary}
      framed={false}
    >
      <div className="space-y-8">
        <div className="flex justify-center py-2">
          <div className="inline-flex items-center gap-4 rounded-full border border-slate-200 bg-white px-8 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-slate-400">STEP</span>
            <div className="flex items-baseline gap-1.5 font-mono text-lg font-medium leading-none">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stepIndex + 1}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500">{STEPS.length}</span>
            </div>
          </div>
        </div>

        <div key={step} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {step === 'why' && (
            <div className="grid gap-16 lg:grid-cols-12 lg:items-start">
              
              {/* Left Column: Narrative */}
              <div className="flex flex-col justify-center space-y-12 lg:col-span-5 lg:py-8">
                
                {/* Header Section */}
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-4 py-1.5 text-sm font-bold tracking-widest text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    <span className="relative flex size-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-400 opacity-75"></span>
                      <span className="relative inline-flex size-3 rounded-full bg-slate-500"></span>
                    </span>
                    TIMING ATTACK BASICS
                  </div>
                  
                  <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100 md:text-6xl lg:text-7xl">
                    応答時間の差は、<br />
                    <span className="text-slate-500 decoration-slate-300 underline-offset-8">
                      情報漏洩です。
                    </span>
                  </h2>
                  
                  <p className="text-2xl leading-relaxed text-slate-600 dark:text-slate-300">
                    存在しないユーザーの処理を「早める」と、<br className="hidden md:block" />
                    その短縮された時間が<span className="font-bold text-slate-900 dark:text-slate-50">「ユーザーは不在」</span>という事実を伝えてしまいます。
                  </p>
                </div>

                {/* Key Takeaways (Large Minimalist List) */}
                <div className="space-y-8 border-l-4 border-slate-200 pl-8 dark:border-slate-800">
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100">1. 即時の終了（Early Return）</h4>
                    <p className="text-xl text-slate-500">処理を途中で打ち切ると、そこで時間が短縮されます。</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100">2. 計測可能な差</h4>
                    <p className="text-xl text-slate-500">ネットワーク越しでも、その数百ミリ秒の差は明確に計測できます。</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100">3. 推測の成立</h4>
                    <p className="text-xl text-slate-500">「速い＝不在」「遅い＝存在」。エラー文言を統一しても、時間は嘘をつきません。</p>
                  </div>
                </div>



              </div>

              {/* Right Column: Visual */}
              <div className="lg:col-span-7 lg:mt-10">
                <AtAGlanceSheet />
              </div>

            </div>
          )}

          

          {step === 'bad' && (
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1">
                <VulnerableCard
                  title="NG: 早期リターン"
                  description="「ユーザー不在」で即座に関数を抜ける実装"
                >
                  <pre className="overflow-x-auto rounded-xl bg-slate-950 p-6 font-mono text-base leading-loose text-slate-50 shadow-2xl">
                    <code>{`function login(user, pass) {
  // ユーザーがいない場合
  if (!db.has(user)) {
    return fail(); // ⚠️ ここで即終了（高速）
  }

  // ユーザーがいる場合（重い処理）
  const ok = verifyPass(hash, pass);
  
  if (!ok) return fail();
  return issueToken(user);
}`}</code>
                  </pre>
                </VulnerableCard>
              </div>

              <div className="order-1 flex flex-col justify-center space-y-8 lg:order-2">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-rose-500">
                    <span className="size-2 rounded-full bg-rose-500" />
                    Vulnerable Pattern
                  </div>
                  <h3 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 lg:text-5xl">
                    その「効率化」が、<br />
                    <span className="text-rose-500">命取り</span>になる。
                  </h3>
                  <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                    プログラマーは無駄な処理を省こうとします。<br />
                    しかし、セキュリティの世界では<span className="font-bold text-slate-900 dark:text-slate-100">「早く終わること」自体が情報</span>になります。
                  </p>
                </div>

                <div className="space-y-6 border-l-4 border-rose-100 pl-6 dark:border-rose-900/30">
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100">分岐した瞬間、バレる</h4>
                    <p className="text-lg text-slate-500">
                      if文で `return` した瞬間、処理時間の計測タイマーが止まります。
                      攻撃者はその「短さ」を見て、「ああ、このユーザーは登録されていないな」と確信します。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'fix' && (
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1">
                <SecureCard
                  title="OK: 定数時間処理"
                  description="結果に関わらず、常に一定の計算量と時間を消費する"
                >
                  <pre className="overflow-x-auto rounded-xl bg-slate-950 p-6 font-mono text-base leading-loose text-slate-50 shadow-2xl">
                    <code>{`function loginConstantTime(user, pass) {
  // 1. 常にDB検索（なければダミー）
  const userRec = db.get(user) || DUMMY_USER;
  
  // 2. 常にハッシュ計算を行う
  const ok = check(userRec.hash, pass);

  // 3. 最小時間まで待機 (Padding)
  sleepUntil(MIN_RESPONSE_TIME);

  // 4. 結果を返す
  return (userRec.id && ok) ? success() : fail();
}`}</code>
                  </pre>
                </SecureCard>
              </div>

              <div className="order-1 flex flex-col justify-center space-y-8 lg:order-2">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-emerald-600">
                    <span className="size-2 rounded-full bg-emerald-600" />
                    Secure Pattern
                  </div>
                  <h3 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 lg:text-5xl">
                    すべての客に、<br />
                    <span className="text-emerald-600">同じ「待機」</span>を。
                  </h3>
                  <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                    ユーザーがいても、いなくても、同じ計算量をこなし、同じだけ待ちます。<br />
                    外から見る人には、中の状態が一切読み取れません。
                  </p>
                </div>

                <div className="space-y-6 border-l-4 border-emerald-100 pl-6 dark:border-emerald-900/30">
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100">徹底的な統一</h4>
                    <p className="text-lg text-slate-500">
                      レスポンス時間だけでなく、エラーメッセージやHTTPステータスコードも完全に統一することで、
                      攻撃者の手がかりをゼロにします。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'demo' && (
            <div className="w-full space-y-10 py-10">
              
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-bold uppercase tracking-widest text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-blue-500"></span>
                  </span>
                  Interactive Demo
                </div>
                <h3 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  その目で確かめてください
                </h3>
                <p className="mx-auto max-w-4xl text-2xl leading-relaxed text-slate-600 dark:text-slate-400">
                  コードの実行位置と時間の関係を可視化します。<br />
                  「NG」では処理が途切れる様子を、「OK」では最後まで走り切る様子を確認してください。
                </p>
              </div>

              {/* Demo Area - Less constraints for better code visibility */}
              <div className="space-y-7">
                <div className="flex flex-wrap justify-center gap-4">
                  <DemoButton variant="vulnerable" active={variant === 'vulnerable'} onClick={() => setVariant('vulnerable')}>
                    NGパターン（時間差あり）
                  </DemoButton>
                  <DemoButton variant="secure" active={variant === 'secure'} onClick={() => setVariant('secure')}>
                    対策済み（定数時間）
                  </DemoButton>
                </div>
                
                {/* Direct rendering of FlowDemo to maximize space for code visualization */}
                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <FlowDemo
                    variant={variant}
                    accent={variantInfo.accent}
                    title={variantInfo.title}
                    description={variantInfo.description}
                  />
                </div>
              </div>
              
            </div>
          )}
        </div>

        <div
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-background/70 p-5"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        >
          <div className="text-base text-muted-foreground">
            <span className="font-semibold text-foreground">ヒント:</span> 分からなくなったら「デモ」で体験してみると理解が深まります。
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="xl" className="h-16 px-10 text-xl font-bold" onClick={prev} disabled={stepIndex === 0}>
              ← 戻る
            </Button>
            {stepIndex === STEPS.length - 1 ? (
              <Button size="xl" className="h-16 px-10 text-xl font-bold" onClick={() => setStep('why')}>最初から</Button>
            ) : (
              <Button size="xl" className="h-16 px-10 text-xl font-bold" onClick={next}>次へ →</Button>
            )}
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}
