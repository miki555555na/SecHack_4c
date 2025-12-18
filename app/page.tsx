'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 px-5 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <h1 className="text-center text-4xl font-extrabold text-white md:text-5xl">
  書いたそのコード、<br className="md:hidden" />
  <span className="text-indigo-300">本当に安全ですか？</span>
</h1>



        <p className="mt-6 text-center text-lg text-indigo-100">
  「あとで学べばいい」「規約は正直ピンとこない」——
  <br /> 
  そんな“よくある書き方”が、実はすぐ壊れることを体験してみませんか？
</p>


        {/* Why before training */}
        <Card className="mt-12 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">なぜ“研修の前”にこれをやるのか</CardTitle>
            <CardDescription>
              知識の前に、危機感と納得感をつくるため
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border-l-4 border-red-500 bg-red-50 p-4">
              <p className="font-semibold text-red-700">❌ ありがちな状態</p>
              <ul className="mt-2 list-disc pl-5 text-red-600">
                <li>セキュリティは難しそうで後回し</li>
                <li>規約は読む気が起きない</li>
                <li>自分の担当範囲には関係なさそう</li>
              </ul>
            </div>
            <div className="rounded-md border-l-4 border-green-500 bg-green-50 p-4">
              <p className="font-semibold text-green-700">✅ この体験で起きること</p>
              <p className="mt-2 text-green-700">
                効率重視で書いた<b>“自分でもやりそうなコード”</b>が、
                実際に悪用される様子を目で見て理解できます。
                <br />
                セキュリティが<b>「守らされるルール」</b>から
                <b>「自分のコードを守る技術」</b>に変わります。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Goal */}
        <Card className="mt-10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">このツールのゴール</CardTitle>
            <CardDescription>
              セキュリティ研修を“意味のある時間”に変える
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-base">
              <li>対象：セキュリティをこれから学ぶ Web エンジニア（フロント / バックエンド）</li>
              <li>脆弱な実装 → 悪用 → 安全な実装 を<b>短時間で比較</b></li>
              <li>その後の研修や規約を<b>「なぜ必要か分かる状態」</b>で読める</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-10 rounded-md border border-indigo-300 bg-indigo-50 p-4 text-center">
          <p className="text-sm font-semibold text-indigo-900">
            👇 自分が普段触っている領域だけで大丈夫です
          </p>
          <p className="mt-1 text-sm text-indigo-800">
            フロントエンドの人はフロントだけ、<br />
            バックエンドの人はバックエンドだけをまず体験してください。
          </p>
        </div>

        {/* Choose role */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Backend */}
          <Card className="border-2 border-blue-500 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">バックエンド編</CardTitle>
              <CardDescription>
                API / サーバー実装を触る人向け
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>認可チェック漏れによるロジックバイパス</li>
                <li>SQL インジェクション</li>
                <li>パスワード比較の早期リターン</li>
                <li>HMAC 検証の時間差</li>
                <li>ユーザー存在有無の推測</li>
              </ul>
              <Link href="/Backend"> <Button style={{ width: '100%', background: '#3b82f6', color: '#fff', marginTop: 16 }}> バックエンド体験を始める → </Button> </Link>
            </CardContent>
          </Card>

          {/* Frontend */}
          <Card className="border-2 border-amber-500 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-xl text-amber-800">フロントエンド編</CardTitle>
              <CardDescription>
                画面・JS・ブラウザ周りを書く人向け
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>ハードコードされた秘密情報</li>
                <li>XSS によるスクリプト実行</li>
                <li>キャッシュ挙動の悪用</li>
              </ul>
              <Link href="/Frontend"> <Button style={{ width: '100%', background: '#f59e0b', color: '#fff', marginTop: 16 }}> フロントエンド体験を始める → </Button> </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
