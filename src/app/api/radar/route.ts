import { getRadarFrames } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const frames = await getRadarFrames();
    return NextResponse.json(frames);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch radar frames' }, { status: 500 });
  }
}
