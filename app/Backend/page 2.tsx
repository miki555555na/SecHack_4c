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
      description: '認可の抜け漏れによって、本来許可されていない操作が可能になるケースを確認します。',
      href: '/Backend/Section1-AuthBypass'
    },
    {
      number: 2,
      title: 'SQLインジェクション',
      description: '入力値をそのままクエリに使った場合に起こる、典型的なインジェクションの例を体験します。',
      href: '/Backend/Section2-SQLInjection'
    },
    {
      number: 3,
      title: 'パスワード検証時の早期リターン',
      description: '処理時間の差が情報として利用されてしまう可能性について見ていきます。',
      href: '/Backend/Section3-EarlyReturn'
    },
    {
      number: 4,
      title: 'HMACの検証処理',
      description: 'トークン検証の実装によって生じる、見落とされがちなリスクを確認します。',
      href: '/Backend/Section4-HMACVerification'
    },
    {
      number: 5,
      title: 'ユーザー存在確認の時間差',
      description: '認証フロー中の処理時間の違いが、攻撃につながるケースを学びます。',
      href: '/Backend/Section5-UserEnumeration'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black mb-6">バックエンドの実装とセキュリティ</h1>

      <p className="text-base text-slate-600">
        バックエンド実装で起こりやすい代表的なセキュリティ上の落とし穴を、
        <br />
        「脆弱な実装」と「改善後の実装」を比較しながら学びます。
      </p>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.number}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center font-bold text-white"
                  style={{
                    background: '#3b82f6',
                    width: 40,
                    height: 40,
                    borderRadius: '9999px'
                  }}
                >
                  {section.number}
                </span>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-slate-500">
                {section.description}
              </p>
              <Link href={section.href}>
                <Button className="bg-blue-500 text-white">
                  セクション {section.number} を見る →
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

