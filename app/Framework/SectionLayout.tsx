

import React from 'react';
import { styles } from './SectionStyles';

type Props = {
    title1: React.ReactNode;     // ページタイトル
    title2?: React.ReactNode;    // サブタイトル
    description?: React.ReactNode; // ページ説明
    checklist?: React.ReactNode;   // やることリスト
    children: React.ReactNode;     // Section 内のコンテンツ
    summary?: React.ReactNode;     // まとめ
    framed?: boolean;              // children を枠で囲むか
};

export default function SectionLayout({
    title1,
    title2,
    description,
    checklist,
    children,
    summary,
    framed = true,
}: Props) {
    return (
    <main style={styles.page}>
        {/* ▼ やることリスト */}
        {checklist && (
            <div style={styles.todoWrapper }>
                <section style={{ ...styles.section, background: 'transparent', border: 'none', marginBottom: 0, marginTop: 0, padding: 0 }}>
                {checklist}
                </section>
            </div>
        )}
        {/* ▲ やることリスト */}

        <header style={styles.header}>
  <h1 style={styles.h1}>{title1}</h1>
  {title2 && <h2 style={styles.h2}>{title2}</h2>}
</header>

{description && (
  <div style={styles.description}>
    {description}
  </div>
)}


        {/* ▼ 各 Section の本体 */}
        <section
            style={
                framed
                    ? { ...styles.section }
                    : { marginBottom: 26, padding: 0, border: 'none', background: 'transparent' }
            }
        >
            {children}
        </section>
        {/* ▲ Section内容 */}

        {/* ▼ まとめセクション */}
        {summary && (
            <section style={{ ...styles.section, ...styles.summary }}>
                {summary}
        </section>
        )}
        {/* ▲ まとめここまで */}
    </main>
    );
}
