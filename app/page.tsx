// 'use client';

// import React from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import Link from 'next/link';

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 px-5 py-16">
//       <div className="mx-auto max-w-4xl">
//         {/* Hero */}
//         <h1 className="text-center text-4xl font-extrabold text-white md:text-5xl">
//   書いたそのコード、<br className="md:hidden" />
//   <span className="text-indigo-300">本当に安全ですか？</span>
// </h1>



//         <p className="mt-6 text-center text-lg text-indigo-100">
//   「あとで学べばいい」「規約は正直ピンとこない」——
//   <br /> 
//   そんな“よくある書き方”が、実はすぐ壊れることを体験してみませんか？
// </p>


//         {/* Why before training */}
//         <Card className="mt-12 shadow-xl">
//           <CardHeader>
//             <CardTitle className="text-2xl">なぜ“研修の前”にこれをやるのか</CardTitle>
//             <CardDescription>
//               知識の前に、危機感と納得感をつくるため
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="rounded-md border-l-4 border-red-500 bg-red-50 p-4">
//               <p className="font-semibold text-red-700">❌ ありがちな状態</p>
//               <ul className="mt-2 list-disc pl-5 text-red-600">
//                 <li>セキュリティは難しそうで後回し</li>
//                 <li>規約は読む気が起きない</li>
//                 <li>自分の担当範囲には関係なさそう</li>
//               </ul>
//             </div>
//             <div className="rounded-md border-l-4 border-green-500 bg-green-50 p-4">
//               <p className="font-semibold text-green-700">✅ この体験で起きること</p>
//               <p className="mt-2 text-green-700">
//                 効率重視で書いた<b>“自分でもやりそうなコード”</b>が、
//                 実際に悪用される様子を目で見て理解できます。
//                 <br />
//                 セキュリティが<b>「守らされるルール」</b>から
//                 <b>「自分のコードを守る技術」</b>に変わります。
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Goal */}
//         <Card className="mt-10 shadow-xl">
//           <CardHeader>
//             <CardTitle className="text-2xl">このツールのゴール</CardTitle>
//             <CardDescription>
//               セキュリティ研修を“意味のある時間”に変える
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ul className="list-disc space-y-2 pl-5 text-base">
//               <li>対象：セキュリティをこれから学ぶ Web エンジニア（フロント / バックエンド）</li>
//               <li>脆弱な実装 → 悪用 → 安全な実装 を<b>短時間で比較</b></li>
//               <li>その後の研修や規約を<b>「なぜ必要か分かる状態」</b>で読める</li>
//             </ul>
//           </CardContent>
//         </Card>

//         <div className="mt-10 rounded-md border border-indigo-300 bg-indigo-50 p-4 text-center">
//           <p className="text-sm font-semibold text-indigo-900">
//             👇 自分が普段触っている領域だけで大丈夫です
//           </p>
//           <p className="mt-1 text-sm text-indigo-800">
//             フロントエンドの人はフロントだけ、<br />
//             バックエンドの人はバックエンドだけをまず体験してください。
//           </p>
//         </div>

//         {/* Choose role */}
//         <div className="mt-12 grid gap-6 md:grid-cols-2">
//           {/* Backend */}
//           <Card className="border-2 border-blue-500 bg-slate-50">
//             <CardHeader>
//               <CardTitle className="text-xl text-blue-800">バックエンド編</CardTitle>
//               <CardDescription>
//                 API / サーバー実装を触る人向け
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ul className="list-disc space-y-1 pl-5 text-sm">
//                 <li>認可チェック漏れによるロジックバイパス</li>
//                 <li>SQL インジェクション</li>
//                 <li>パスワード比較の早期リターン</li>
//                 <li>HMAC 検証の時間差</li>
//                 <li>ユーザー存在有無の推測</li>
//               </ul>
//               <Link href="/Backend"> <Button style={{ width: '100%', background: '#3b82f6', color: '#fff', marginTop: 16 }}> バックエンド体験を始める → </Button> </Link>
//             </CardContent>
//           </Card>

//           {/* Frontend */}
//           <Card className="border-2 border-amber-500 bg-amber-50">
//             <CardHeader>
//               <CardTitle className="text-xl text-amber-800">フロントエンド編</CardTitle>
//               <CardDescription>
//                 画面・JS・ブラウザ周りを書く人向け
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ul className="list-disc space-y-1 pl-5 text-sm">
//                 <li>ハードコードされた秘密情報</li>
//                 <li>XSS によるスクリプト実行</li>
//                 <li>キャッシュ挙動の悪用</li>
//               </ul>
//               <Link href="/Frontend"> <Button style={{ width: '100%', background: '#f59e0b', color: '#fff', marginTop: 16 }}> フロントエンド体験を始める → </Button> </Link>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const problems = [
  {
    title: 'フロント・バックエンドの自分には関係なさそう',
    description: 'セキュリティはインフラや専門の人が見るもの、と思っていた。'
  },
  {
    title: 'セキュリティの規約、正直読む気が起きない',
    description: 'ページ数が多くて抽象的。「なぜ必要なのか」が分からないまま、形だけ読んで終わってしまう。'
  },
  {
    title: '研修、受け身になりがち',
    description: 'とりあえず受講はするけど、自分の実装とどうつながるのか分からない。'
  },
  {
    title: '同じ指摘を何度も受けてしまう',
    description: '「前にも言われた気がするけど、何を直せばいいのか分からない」ままになっている。'
  }
]

  const concepts = [
    {
      number: '01',
      title: '「自分ごと」として感じられる',
      description: '教科書的な説明ではなく、実際にコードが壊れる様子を見ることで、「これ、自分のプロジェクトでも起こりうる」と実感できます。セキュリティが遠い話ではなくなります。'
    },
    {
      number: '02',
      title: '「なぜ必要か」が分かる',
      description: '規約に書いてある「これをしてはいけない」が、なぜダメなのか体験を通して理解できます。その後の研修や規約が「意味のある情報」として読めるようになります。'
    },
    {
      number: '03',
      title: '学習のスタート地点に立てる',
      description: 'この体験だけで完璧になるわけではありません。でも、「セキュリティって大事だな」と思える状態を作ります。そこから先の学習が、ずっと意味を持つようになります。'
    }
  ];

  return (
    <div className="min-h-screen  from-slate-100 to-indigo-100text-slate-900">

        {/* ================= Top ================= */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="relative w-full bg-blue-50 py-24 px-6"
        >
          <a
            href="#scenario"
            className="
              absolute
              top-6
              right-6
              rounded-full
              bg-blue-600
              px-5
              py-2
              text-sm
              font-semibold
              text-white
              shadow-md
              transition
              hover:bg-blue-700
            "
          >
            体験を始める →
          </a>
          <div className="mx-auto max-w-4xl text-center space-y-10">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              その実装、
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-indigo-600 inline-block"
              >
                壊されます。
              </motion.span>
            </h1>
            <p className="text-sm text-slate-600">
              <b>規約を読む前に、セキュリティ研修を受ける前に壊れる体験を。学ぶ理由を、説明ではなく体感で。</b>
            </p>
            <p className="mx-auto mt-20 max-w-3xl text-xl md:text-2xl text-slate-700 leading-relaxed">
              「規約は自分には関係ない」「いつかで学べばいい」<br />
              そう思って書いたコードが、<b>どう使われるか</b>を体験します。
            </p>
          </div>
        </motion.section>

        {/* ================= Background ================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t">
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="text-sm text-slate-500 mb-4 inline-block">こんな経験ありませんか？</span>
              <h3 className="text-4xl sm:text-5xl mb-6 text-slate-900 max-w-3xl">
                セキュリティって、
                <br />
                <span className="relative inline-block">
                  なんとなく後回しにしてた
                  <motion.span
                    className="absolute bottom-1 left-0 right-0 h-2 bg-blue-100 -z-10"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ originX: 0 }}
                  />
                </span>
              </h3>
              <p className="text-lg text-slate-600">
                セキュリティは難しそうだし、専門の人が気をつけるもの。<br />
                フロントエンドやバックエンドの実装をしている自分には、そこまで意識しなくても良さそう。<br /><br />
                <b>でも実際は、日々書いているコードとセキュリティは深くつながっています。</b>
              </p>

            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-16">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition">

                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm text-slate-600 mt-1">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2 ">{problem.title}</h4>
                      <p className="text-slate-600 leading-relaxed">{problem.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}        
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="text-blue-600 text-3xl animate-bounce">↓</div>
              <p className=" bg-blue-50 max-w-4xl leading-relaxed p-4  mt-10">
                近年、webサービスとセキュリティの関係はますます密接になっています。<b>（後にツール名）</b>を通して、「守らなかったらどうなるのか」を短時間で<b>体感</b>し、セキュリティを<b>「自分ごと」</b>として理解するための教育ツールです。
                <br />
                前提となる専門知識は必要ありません。<br />
                脆弱な実装・その悪用・安全な実装を<b>実際に比較しながら</b>体験することで、  
                webエンジニアとして<b>「なぜセキュリティが必要なのか」</b>を自然に理解できる設計になっています。
              </p>
            </motion.div>
        </section>

    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t">
      <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
        <span className="text-sm text-slate-500 mb-4 inline-block" id="scenario">体験できるシナリオ</span>
        <h3 className="text-4xl sm:text-5xl mb-6 text-slate-900 max-w-5xl">
          {/* あなたのコードが */}
          セキュリティを
          <br />
          <span className="relative inline-block">
            {/* どう壊されるか見てみよう */}
            「ルール」から「壊される現実」へ
            <motion.span
              className="absolute bottom-1 left-0 right-0 h-2 bg-blue-100 -z-10"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ originX: 0 }}
            />
          </span>
        </h3>
        {/* <p className="text-lg text-slate-600">
          コードを実際に動かしながら、脆弱な実装がどのように悪用され、どう直せば防げるのかを体験します。<br />
          理論を学ぶ前に、「壊される瞬間」を見ることで理解が深まります。<br />
          セキュリティを「ルール」ではなく「自分のコードが壊される現実的なリスク」として理解できます。
          まずは、自分の担当領域(フロントエンド/バックエンド)から体験してください。<br /><br />
          各シナリオは5〜8分で学べます。
        </p> */}
        <p className="text-lg text-slate-700 max-w-4xl leading-relaxed space-y-2">
        <span className="block">
          実際にコードを動かしながら、
          <strong className="text-blue-400">脆弱な実装 → 悪用 → 安全な実装</strong>
          を順に体験します。
        </span>

        <span className="block">
          理論や規約を学ぶ前に、「こんなふうに壊されるのか」を
          <strong>目で見て理解する</strong>ことができます。
        </span>

        <span className="block">
          まずは、自分の担当領域（フロントエンド / バックエンド）から体験してみてください。
        </span>

        <span className="block text-sm text-slate-600">
          各シナリオは 5〜8 分で完了します。
        </span>
      </p>
      </motion.div>
    </section>

        {/* ================= Choose ================= */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          variants={fadeUp}
          className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
        >
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-white border-l-4 border-blue-500 shadow-sm hover:shadow-md transition">

              <CardHeader>
                <CardTitle className="text-2xl text-blue-700">
                  バックエンド編
                </CardTitle>
                <CardDescription>
                  API / サーバー実装を触る人向け
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col">
                <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
                <li>認可チェック漏れによるロジックバイパス</li>
                <li>SQL インジェクション</li>
                <li>パスワード比較の早期リターン</li>
                <li>HMAC 検証の時間差</li>
                <li>ユーザー存在有無の推測</li>
                </ul>
                <Link href="/Backend">
                  <Button
                    className="
                      w-full text-lg mt-4
                      bg-blue-600 text-white
                      hover:bg-blue-700
                      transition-all duration-200
                      hover:scale-[1.02]
                      hover:shadow-lg
                      shadow-md
                    "
                  >
                    体験してみる →
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="bg-white border-l-4 border-amber-500 shadow-sm hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-2xl text-amber-700">
                  フロントエンド編
                </CardTitle>
                <CardDescription>
                  UI・JavaScriptを書く人向け
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col">
              <ul className="list-disc space-y-2 pl-5 text-base text-slate-700">
                <li>ハードコードされた秘密情報</li>
                <li>XSS によるスクリプト実行</li>
                <li>キャッシュ挙動の悪用</li>
                <br  />
                <br  />
              </ul>
                <Link href="/Frontend">
                  <Button
                    className="
                      w-full text-lg mt-4
                      bg-amber-500 text-white
                      hover:bg-amber-600
                      transition-all duration-200
                      hover:scale-[1.02]
                      hover:shadow-lg
                      shadow-md
                    "
                  >
                    体験してみる →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
            <span className="text-sm text-slate-500 mb-4 inline-block">体験後のゴール</span>
            <h3 className="text-4xl sm:text-5xl mb-6 text-slate-900 max-w-4xl">
              セキュリティを
              <br />
              <span className="relative inline-block">
                「自分ごと」として学びたくなる状態へ
                <motion.span
                  className="absolute bottom-1 left-0 right-0 h-2 bg-blue-100 -z-10"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  style={{ originX: 0 }}
                />
              </span>
            </h3>
          </motion.div>
          <div className="space-y-14 mb-20 max-w-4xl">
            {concepts.map((concept, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0">
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-slate-400">{concept.number}</span>
                    <h4 className="text-xl text-slate-900">{concept.title}</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-lg">{concept.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className=" w-full bg-blue-50 py-24"
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xl leading-relaxed text-slate-800 py-2">
              このツールは、セキュリティを学び始める前の<b>「準備運動」</b>です。<br />
              30分ほど体験して、<b>「これ、ちゃんと向き合ったほうがいいな」</b>と感じられたら成功。
              その先の学習が、きっとスムーズになります。
            </p>
          </div>
        </motion.div>
      </section>
    </div>
    
  );
}
