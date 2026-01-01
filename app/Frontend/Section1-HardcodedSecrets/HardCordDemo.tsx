'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VulnerableCard } from '@/components/educational/vulnerable-card';
import { SecureCard } from '@/components/educational/secure-card';
import { InfoCard } from '@/components/educational/info-card';

// デモ用: テストキーは DOM の hidden input に格納しています（開発者ツールで確認できます）
// 実運用ではクライアントに秘密を置かないでください。

export function HardCordDemo() {
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  const callApi = async () => {
    setRunning(true);
    setMessage('API にリクエスト中…');
    setSuccess(null);

    // 疑似的な遅延
    await new Promise((r) => setTimeout(r, 600));

    const expected = (document.getElementById('expected-key') as HTMLInputElement | null)?.value ?? '';
    if (input.trim() === expected) {
      setMessage('✅ 正解: 正しい API キーです（デモ成功）');
      setSuccess(true);
    } else {
      setMessage('✖️ 誤り: API キーが正しくありません');
      setSuccess(false);
    }

    setRunning(false);
  };

  const clear = () => {
    setInput('');
    setMessage(null);
    setSuccess(null);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Interactive panel */}
        <div className="md:w-[1000px] flex flex-col gap-4">
          <div className="p-4 rounded-md border bg-slate-50">
            <h3 className="text-lg font-bold mb-2">デモ：ハードコードされた API キーの危険性</h3>
            <p className="text-sm text-slate-600 mb-3">開発者ツールを使ってこのファイルのソースを探すと、コメントに埋め込まれたテストキーが見つかります。</p>

            <label htmlFor="api-key-input" className="block text-sm font-semibold mb-1">API キー（ここに貼り付け）</label>
            <Input
              id="api-key-input"
              value={input}
              onChange={(e) => setInput((e.target as HTMLInputElement).value)}
              placeholder="ここに API キーを入力"
            />

            {/* Hidden test key intentionally placed in DOM for the demo; find it via Elements/検索 */}
            <input type="hidden" id="expected-key" value="hardcord-testkey-xyz123" />

            <div className="flex gap-2 mt-3">
              <Button onClick={callApi} disabled={running} aria-label="API を叩く">
                API を叩く
              </Button>
              <Button variant="outline" onClick={clear} aria-label="入力をクリア">
                クリア
              </Button>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-1">ヒント</h4>
              <ul className="text-sm text-slate-600 list-disc list-inside">
                <li>開発者ツール（F12）の <strong>Sources</strong> や <strong>検索（Ctrl+F）</strong> を使ってファイルを探す</li>
                <li>コメントに書かれたテストキーを見つけ、ここに貼り付けて「API を叩く」を押す</li>
              </ul>
            </div>
          </div>
          {/* デモ用スクリプト：疑似的にハードコードされたテスト API キーを注入します。
              **デバッグ専用**で、本番に公開しないでください。 */}
          <script dangerouslySetInnerHTML={{
            __html: `
              /* デバッグ用：API キーの設定　！！！本番環境では消すこと！！！ */
              fetch("https://example.com/api", {
                method: "GET",
                headers: {
                  "x-api-key": "hardcord-testkey-xyz123" /* TEST API KEY */
                }
              })
                .then(res => res.json())
                .then(data => console.log(data))
                .catch(err => console.error(err));
            `
          }} />
          <InfoCard title="結果" description="デモの実行結果は下に表示されます。" >
            <div className={`min-h-[40px] flex items-center ${success === true ? 'text-green-600' : success === false ? 'text-red-600' : 'text-slate-600'}`} aria-live="polite">
              {message ?? 'まだ API を叩いていません'}
            </div>
          </InfoCard>
        </div>

        {/* Guidance / example panel */}
        <div className="flex-1 space-y-4">
          <div className="p-4 rounded-md bg-slate-50 border">
            <h4 className="font-bold mb-2">開発者ツールでの探し方（例）</h4>
            <ol className="list-decimal list-inside text-sm">
              <li>ブラウザで F12 を押して開発者ツールを開く</li>
              <li>Sources タブでプロジェクト内のファイルを探す</li>
              <li>ソース内のTEST API KEYを見つける</li>
              <li>TEST_API_KEY</li>
              <li>そのキーをコピーして左の入力欄に貼り付け、API を叩く</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
