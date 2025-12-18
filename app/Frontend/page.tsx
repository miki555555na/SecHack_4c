'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FrontendPage() {
  const sections = [
    {
      number: 1,
      title: 'ハードコードされた秘密情報',
      description: 'ソースコードに直接埋め込まれた情報が、どのようなリスクにつながるかを確認します。',
      href: '/Frontend/Section1-HardcodedSecrets'
    },
    {
      number: 2,
      title: 'XSS（クロスサイトスクリプティング）',
      description: 'ユーザー入力の扱い方によって、意図しないスクリプト実行が起こる仕組みを体験します。',
      href: '/Frontend/Section2-XSS'
    },
    {
      number: 3,
      title: 'ブラウザキャッシュと処理時間の差',
      description: 'キャッシュの有無によって生じる処理時間の違いが、どのように観測され得るかを見ていきます。',
      href: '/Frontend/Section3-BrowserCache'
    },
    {
      number: 4,
      title: 'リソース読み込みのタイミング',
      description: 'リソース取得のタイミング情報から、意図しない情報が推測される可能性について学びます。',
      href: '/Frontend/Section4-SubresourceTiming'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black mb-6">
        フロントエンドの実装とセキュリティ
      </h1>

      <p className="text-base text-slate-600">
        フロントエンド実装で起こりやすい代表的なセキュリティ上の注意点を、
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
                    background: '#f59e0b',
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
                <Button className="bg-amber-500 text-white">
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
