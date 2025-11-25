import { CSSProperties } from 'react';


export const styles: { [k: string]: CSSProperties } = {
    page: {
        maxWidth: 1400,
        margin: '32px auto',
        padding: '0 20px',
        fontFamily: '"Noto Sans JP", "ヒラギノ角ゴ ProN", "Segoe UI", Roboto, sans-serif',
        color: '#111',
        lineHeight: 1.7,
        fontSize: 17
    },
    todoWrapper: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#f5faffff',
        borderBottom: '2px solid #aee2feff',
        boxShadow: '0 2px 8px #0001',
        padding: '14px 0 10px 0',
        marginBottom: 18
    },
    header: {
        textAlign: 'center',
        marginBottom: 28
    },
    h1: {
    fontSize: 30,
    margin: '0 0 6px'
    },
    lead: {
        margin: 0,
        color: '#555',
        fontSize: 18
    },
    section: {
        marginBottom: 26,
        padding: 20,
        borderRadius: 8,
        background: '#fbfbfb',
        border: '1px solid #ececec'
    },
    comparison: {
        display: 'flex',
        gap: 24,
        marginTop: 20
    },
    comparisonColumn: {
        flex: 1,
        minWidth: 0
    },
    h2: {
        fontSize: 23,
        margin: '0 0 10px'
    },
    h3: {
        fontSize: 21,
        margin: '10px 0 6px'
    },
    h4: {
        fontSize: 15,
        margin: '12px 0 6px',
        color: '#333'
    },
    codeContainer: {
        borderRadius: 8,
        padding: 16,
        marginTop: 12
    },
    codeLabel: {
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 8,
        color: '#ff6b6b'
    },
    code: {
        display: 'block',
        background: '#1e1e1e',
        color: '#dcdcdc',
        padding: 18,
        borderRadius: 6,
        overflowX: 'auto',
        fontFamily: 'monospace',
        fontSize: 17,
        lineHeight: 1.6,
        margin: 0
    },
    tableWrap: {
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: 72
    },
    th: {
        textAlign: 'left',
        padding: '12px 16px',
        borderBottom: '2px solid #ddd',
        background: '#f7f7f7',
        fontWeight: 600,
        fontSize: 16
    },
    td: {
        padding: '12px 16px',
        borderBottom: '1px solid #eee',
        verticalAlign: 'top',
        fontSize: 16
    },
    footer: {
        marginTop: 24,
        textAlign: 'center',
        color: '#666'
    },
    summary: {
        background: '#f9fafb',
        border: '1.5px solid #e5e7eb',
        marginTop: 32
    }
    };

