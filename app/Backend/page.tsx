'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BackendPage() {
  const sections = [
    {
      number: 1,
      title: '認可チェックの不備',
      description: 'ロジックバイパスによるアクセス制御の破綻',
      href: '/Backend/Section1-AuthBypass'
    },
    {
      number: 2,
      title: 'SQLインジェクション',
      description: 'クエリ文字列への不正な入力による情報漏洩',
      href: '/Backend/Section2-SQLInjection'
    },
    {
      number: 3,
      title: 'パスワード検証時の早期リターン',
      description: '早期リターンと可変長ループが招くタイミング攻撃',
      href: '/Backend/Section3-EarlyReturn'
    },
    {
      number: 4,
      title: 'HMAC検証時の早期リターン',
      description: 'トークン検証漏れによる改ざん検知失敗',
      href: '/Backend/Section4-HMACVerification'
    },
    {
      number: 5,
      title: 'ユーザー存在確認の時間差',
      description: 'ユーザー列挙攻撃につながるタイミング情報の漏洩',
      href: '/Backend/Section5-UserEnumeration'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 24 }}>バックエンド脆弱性を学ぶ</h1>
      <p style={{ fontSize: 16, color: '#475569' }}>
        サーバーサイドで陥りやすい5つのセキュリティ脆弱性を、実際に動かして学びます。
      </p>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.number}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span style={{ background: '#3b82f6', color: '#fff', width: 40, height: 40, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {section.number}
                </span>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>{section.description}</p>
              <Link href={section.href}>
                <Button style={{ background: '#3b82f6', color: '#fff' }}>
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
