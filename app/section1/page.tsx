import Link from "next/link";

const subsections = [
  { id: 1, title: "セクション1-1: 概要", href: "/section1/subsection-1" },
  { id: 2, title: "セクション1-2: 実践", href: "/section1/subsection-2" },
  { id: 3, title: "セクション1-3: 課題", href: "/section1/subsection-3" },
];

export default function Section1Index() {
  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">セクション1 — タイミング攻撃の基礎</h1>
      <p className="mb-6">以下のサブセクションから担当範囲（1-3）を開いて編集してください。</p>

      <ul className="space-y-3">
        {subsections.map(s => (
          <li key={s.id}>
            <Link href={s.href} className="border p-4 rounded-lg block hover:bg-gray-100">
              {s.id}. {s.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
