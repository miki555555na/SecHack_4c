import Link from "next/link";

export default function Subsection3Start() {
  return (
    <main className="p-8 bg-white text-black">
      <h1 className="text-2xl font-semibold">セクション1-3: 時間差の応用</h1>

      <p className="mt-4">
        このセクションでは、原理の説明、インタラクティブな体験、応用例の順に進みます。下の「次へ」ボタンで最初のページへ進んでください。
      </p>

      <div className="mt-6">
        <Link href="/section1/subsection-3/principle" className="px-4 py-2 bg-blue-600 text-white rounded">
          次へ
        </Link>
      </div>
    </main>
  );
}
