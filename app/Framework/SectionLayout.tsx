

import React from 'react';
import { styles } from './SectionStyles';

type Props = {
    title1: string;                // ページタイトル
    title2?: string;               // サブタイトル
    description?: React.ReactNode; // ページ説明
    checklist?: React.ReactNode;   // やることリスト
    children: React.ReactNode;     // Section 内のコンテンツ
    summary?: React.ReactNode;     // まとめ
    stickyChecklist?: boolean;
};

export default function SectionLayout({
    title1,
    title2,
    description,
    checklist,
    children,
    summary,
    stickyChecklist
}: Props) {
    return (
    <main style={styles.page}>
        {/* ▼ やることリスト */}
        {checklist && (
            <div style={stickyChecklist ? styles.todoWrapper : undefined}>
                <section style={{ ...styles.section, background: 'transparent', border: 'none', marginBottom: 0, marginTop: 0, padding: 0 }}>
                {checklist}
                </section>
            </div>
        )}
        {/* ▲ やることリスト */}

        <header style={styles.header}>
            <h1 style={styles.h1}>{title1}</h1>
            {title2 && <h2 style={styles.h2}>{title2}</h2>}
            {description && (
            <p style={styles.lead}>{description}</p>
            )}
        </header>

        {/* ▼ 各 Section の本体 */}
        <section style={{ ...styles.section}}>{children}</section>
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
