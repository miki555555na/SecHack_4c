'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function FrontendMenu() {
  const router = useRouter();

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>フロントエンドパート</h1>

      <div style={{ display: 'grid', gap: 20 }}>
        <button onClick={() => router.push('/FrontendModule/Part1')}>
          Part1：キャッシュが生む時間差
        </button>

        <button onClick={() => router.push('/FrontendModule/Part2')}>
          Part2：
        </button>

        <button onClick={() => router.push('/FrontendModule/Part3')}>
          Part3：
        </button>
      </div>
    </main>
  );
}
