import { NextResponse } from 'next/server';

const GAS_URL = process.env.GOOGLE_SCRIPT_URL!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const id = searchParams.get('id');
  
  const url = `${GAS_URL}?action=${action}${id ? `&id=${id}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data);
}