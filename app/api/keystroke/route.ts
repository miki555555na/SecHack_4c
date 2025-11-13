import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sessionId }: { sessionId: 'exp1' | 'exp2' } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const cookieName = `lastKeystrokeTime-${sessionId}`;

    // サーバーがリクエストを観測した現在の時刻
    const currentTime = Date.now();

    // Cookieから前回の観測時刻を読み取る
    const lastTimeString = request.cookies.get(cookieName)?.value;
    const lastTime = lastTimeString ? parseInt(lastTimeString, 10) : null;

    let observedDelta = 0;
    if (lastTime) {
      // 観測した時間差 = 今回の到着時刻 - 前回の到着時刻
      observedDelta = currentTime - lastTime;
    }

    // レスポンスを作成し、今回の観測時刻をクッキーに保存する
    const res = NextResponse.json({ observedDelta });
    res.cookies.set(cookieName, currentTime.toString(), {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 10, // 10分
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}