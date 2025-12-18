'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function BackendMenu() {
  const router = useRouter();

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>バックエンドパート</h1>

      <div style={{ display: 'grid', gap: 20 }}>
        <button onClick={() => router.push('/BackendModule/Part1')}>
          Part1：早期リターンと可変長ループが生む時間差の理解
        </button>

        <button onClick={() => router.push('/BackendModule/Part2')}>
          Part2：
        </button>

        <button onClick={() => router.push('/BackendModule/Part3')}>
          Part3：ユーザー存在チェックの時間差
        </button>
      </div>
    </main>
  );
}
