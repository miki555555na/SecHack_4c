import Link from "next/link";

export default function ApplicationPage() {
  return (
    <main className="p-8 space-y-4 bg-white text-black">
      <h1 className="text-2xl font-semibold">1.5 応用 : 攻撃の適用範囲 (ローカルからリモートまで)</h1>

      <p>
        ここまでに学んだ「ロジックの差（早期リターン）」や「物理的な差（キャッシュ）」といった時間差の原理は、攻撃者の位置に関係なく普遍的に適用されます。ここでは、この原理が「ローカル環境」と「リモート環境」という二つの異なる場所で、どのように観測され、情報漏洩へと応用されるのかを見ていきましょう。
      </p>

      <h2 className="text-lg font-medium">ローカル環境：高精度な物理的観測</h2>
      <p>
        ローカル環境とは、攻撃者がターゲットと同じコンピューター、同じCPU上にいるケースを指します。攻撃者は管理者権限などを用いて、ターゲットと共通のハードウェアリソースを共有していることを悪用します。この環境では、CPU内部の高速な時計（TSCなど）を使用できるため、ナノ秒単位の非常に高い精度で計測が可能です。これにより、キャッシュのような極めて短い時間差で発生する物理的な現象を情報源とすることができます。
      </p>

      <h2 className="text-lg font-medium">リモート環境：統計的なロジックの観測</h2>
      <p>
        リモート環境とは、攻撃者がネットワーク越しにターゲットのサーバーやサービスを攻撃するケースを指します。この環境では、ネットワーク遅延というノイズが多いため、高い精度は望めません。しかし、早期リターンのようなロジックの脆弱性によって生じる時間差を、大量の試行と統計的な分析によって観測することで、世界中どこからでも機密情報を推測することが可能となります。
      </p>

      <div className="mt-4 overflow-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">適用範囲</th>
              <th className="border px-3 py-2 text-left">攻撃者の位置</th>
              <th className="border px-3 py-2 text-left">主な利用手段</th>
              <th className="border px-3 py-2 text-left">計測の細かさ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-3 py-2">ローカル環境</td>
              <td className="border px-3 py-2">ターゲットと同じコンピューターの中</td>
              <td className="border px-3 py-2">CPU内部の高速な時計（TSC）</td>
              <td className="border px-3 py-2">非常に精密（ナノ秒）</td>
            </tr>
            <tr>
              <td className="border px-3 py-2">リモート環境</td>
              <td className="border px-3 py-2">ネットワーク越しの遠い場所</td>
              <td className="border px-3 py-2">ネットワークの往復時間（RTT）</td>
              <td className="border px-3 py-2">大まか（ミリ秒）</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pt-4 flex items-center gap-4">
        <Link href="/section1/subsection-3" className="text-sm text-gray-700">← セクション1-3トップ</Link>
        <Link href="/section2/subsection-1" className="ml-auto px-4 py-2 bg-blue-600 text-white rounded">次へ</Link>
      </div>
    </main>
  );
}
