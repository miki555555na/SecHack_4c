
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FrontendPage() {
  const sections = [
    {
      number: 1,
      title: 'ハードコードされた秘密鍵',
      description: 'ソースコード内に埋め込まれたAPI鍵の流出リスク',
      href: '/Frontend/Section1-HardcodedSecrets'
    },
    {
      number: 2,
      title: 'XSS（クロスサイトスクリプティング）',
      description: 'ユーザー入力の不適切な処理による悪意あるスクリプト実行',
      href: '/Frontend/Section2-XSS'
    },
    {
      number: 3,
      title: 'ブラウザキャッシュの時間差',
      description: 'キャッシュヒット/ミスから生まれる実行時間差を用いた情報推測',
      href: '/Frontend/Section3-BrowserCache'
    },
    {
      number: 4,
      title: 'リソース読み込み時間差',
      description: 'サブリソースタイミング攻撃によるクロスオリジン情報漏洩',
      href: '/Frontend/Section4-SubresourceTiming'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 24 }}>フロントエンド脆弱性を学ぶ</h1>
      <p style={{ fontSize: 16, color: '#475569' }}>
        クライアントサイドで陥りやすい4つのセキュリティ脆弱性を、実際に動かして学びます。
      </p>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.number}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span style={{ background: '#f59e0b', color: '#fff', width: 40, height: 40, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {section.number}
                </span>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>{section.description}</p>
              <Link href={section.href}>
                <Button style={{ background: '#f59e0b', color: '#fff' }}>
                  セクション {section.number} を始める →
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}