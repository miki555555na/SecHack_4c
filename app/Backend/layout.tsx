import React from 'react';

export default function BackendLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ background: '#1e293b', color: '#fff', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>🔧 バックエンド脆弱性コース</h2>
      </nav>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        {children}
      </div>
    </div>
  );
}