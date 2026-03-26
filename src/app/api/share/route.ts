import { NextRequest, NextResponse } from 'next/server';

// GET /api/share?d=<base64-compressed-json>
// Decodes and returns the project JSON
export async function GET(request: NextRequest) {
  const data = request.nextUrl.searchParams.get('d');

  if (!data) {
    return NextResponse.json({ error: 'No data parameter' }, { status: 400 });
  }

  try {
    // Decode base64url to binary
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const binary = Buffer.from(base64, 'base64');

    // Decompress with pako (dynamic import for edge compatibility)
    const pako = await import('pako');
    const decompressed = pako.inflate(binary, { to: 'string' });
    const json = JSON.parse(decompressed);

    // Return with CORS headers for Figma plugin
    return NextResponse.json(json, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
