import Link from "next/link";

export default function PrinciplePage() {
  return (
    <main className="p-8 space-y-4 bg-white text-black">
      <h1 className="text-2xl font-semibold">1.4 時間差の原理III : 人間の入力パターン（キーストローク推定）</h1>

      <p>
        この攻撃の基本的な原理は、人間がキーボードをタイプする生物学的なリズムが、ネットワーク上で観測可能な物理的なパターンとして現れることを悪用することです。すなわち、攻撃者は対話型通信におけるパケットの送タイミングを観測することで、ユーザーの入力リズムを窃取し、秘密情報を推測します。
      </p>

      <h2 className="text-lg font-medium">仕組み：人間の入力リズムをパケット時間差へ変換</h2>
      <ol className="list-decimal ml-6 mt-2">
        <li>人間特有のパターン：人がキーを叩く間隔（インターキーストローク間隔）は、パスワードやフレーズの文字の並びやタイプ速度によって一定のリズムを持ちます。</li>
        <li>パケットへの変換：SSHやターミナルセッションでは、ユーザーがキーをタイプするたびに、その入力（またはエコーバック）を格納したパケットがネットワークに送信されます。</li>
        <li>時間情報の漏洩：ネットワークを流れる連続したパケット間の時間差を正確に測定します。このパケット間の時間差が、そのままユーザーのキーとキーの間の時間間隔を反映します。</li>
      </ol>

      <h2 className="text-lg font-medium">主な標的</h2>
      <ul className="list-disc ml-6 mt-2">
        <li>SSH/TLSセッション：パスワード入力や、エコーバックが無効な秘密のコマンド入力など。</li>
        <li>VNC/リモートデスクトップ：ユーザーが入力したログイン情報や操作内容。</li>
        <li>Webアプリケーション：Webフォームでのパスワード入力や、ブラウザ上でのキーボードイベントの転送処理。</li>
      </ul>

      <div className="pt-4 flex items-center gap-4">
        <div className="ml-auto">
          <Link href="/section1/subsection-3/demo" className="px-4 py-2 bg-blue-600 text-white rounded">次へ</Link>
        </div>
      </div>
    </main>
  );
}
