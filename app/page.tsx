'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="text-5xl font-extrabold mb-5 text-center">
        セキュリティ教材 ホーム
      </h1>

      <p className="text-lg text-gray-600 text-center mb-8">
        タイミング攻撃を学べる 3 つのパートから構成されています。
      </p>

      <div className="grid gap-5 mt-10">
        {/* 導入パート */}
        <Card
          className="hover:-translate-y-0.5 transition-transform cursor-pointer"
          onClick={() => router.push('/IntroModule')}
        >
          <CardHeader>
            <CardTitle className="text-2xl">📘 導入パート</CardTitle>
            <CardDescription className="text-base">
              タイミング攻撃とは何か？を分かりやすく学ぶ
            </CardDescription>
          </CardHeader>
        </Card>

        {/* フロントエンドパート */}
        <Card
          className="hover:-translate-y-0.5 transition-transform cursor-pointer"
          onClick={() => router.push('/FrontendModule')}
        >
          <CardHeader>
            <CardTitle className="text-2xl">🎨 フロントエンドパート</CardTitle>
            <CardDescription className="text-base">
              ブラウザキャッシュ や UI 読み込みが生む時間差の理解
            </CardDescription>
          </CardHeader>
        </Card>

        {/* バックエンドパート */}
        <Card
          className="hover:-translate-y-0.5 transition-transform cursor-pointer"
          onClick={() => router.push('/BackendModule')}
        >
          <CardHeader>
            <CardTitle className="text-2xl">🔧 バックエンドパート</CardTitle>
            <CardDescription className="text-base">
              比較・暗号処理で発生する時間差の理解
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}



