import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sessionId }: { sessionId: 'exp1' | 'exp2' } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const cookieName = `lastKeystrokeTime-${sessionId}`;

    const res = NextResponse.json({ message: 'Keystroke session reset' });
    
    res.cookies.set(cookieName, '', { path: '/', maxAge: 0 });

    return res;
  } catch (err) {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
