import React from 'react';

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#faf8f3' }}>
      <nav style={{ background: '#92400e', color: '#fff', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>🎨 フロントエンド脆弱性コース</h2>
      </nav>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        {children}
      </div>
    </div>
  );
}