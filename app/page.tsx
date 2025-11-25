// app/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const cardStyle: React.CSSProperties = {
  padding: '24px 32px',
  background: '#fff',
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  cursor: 'pointer',
  transition: '0.15s ease',
  fontSize: 22,
  fontWeight: 600,
};

const cardHover: React.CSSProperties = {
  transform: 'translateY(-2px)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

export default function HomePage() {
  const router = useRouter();
  const [hover, setHover] = React.useState<string | null>(null);

  const go = (path: string) => router.push(path);

  return (
    <main
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: 40,
          fontWeight: 800,
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        セキュリティ教材 ホーム
      </h1>

      <p style={{ fontSize: 18, color: '#555', textAlign: 'center', marginBottom: 32 }}>
        タイミング攻撃を学べる 3 つのパートから構成されています。
      </p>

      <div
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: '1fr',
          marginTop: 40,
        }}
      >
        {/* 導入パート */}
        <div
          style={{
            ...cardStyle,
            ...(hover === 'intro' ? cardHover : {}),
          }}
          onMouseEnter={() => setHover('intro')}
          onMouseLeave={() => setHover(null)}
          onClick={() => go('/IntroModule')}
        >
          📘 導入パート  
          <div style={{ fontSize: 16, color: '#64748b', marginTop: 6 }}>
            タイミング攻撃とは何か？を分かりやすく学ぶ
          </div>
        </div>

        {/* フロントエンド */}
        <div
          style={{
            ...cardStyle,
            ...(hover === 'frontend' ? cardHover : {}),
          }}
          onMouseEnter={() => setHover('frontend')}
          onMouseLeave={() => setHover(null)}
          onClick={() => go('/FrontendModule')}
        >
          🎨 フロントエンドパート  
          <div style={{ fontSize: 16, color: '#64748b', marginTop: 6 }}>
            ブラウザキャッシュ や UI 読み込みが生む時間差の理解
          </div>
        </div>

        {/* バックエンド */}
        <div
          style={{
            ...cardStyle,
            ...(hover === 'backend' ? cardHover : {}),
          }}
          onMouseEnter={() => setHover('backend')}
          onMouseLeave={() => setHover(null)}
          onClick={() => go('/BackendModule')}
        >
          🔧 バックエンドパート  
          <div style={{ fontSize: 16, color: '#64748b', marginTop: 6 }}>
            比較・暗号処理で発生する時間差の理解
          </div>
        </div>
      </div>
    </main>
  );
}


