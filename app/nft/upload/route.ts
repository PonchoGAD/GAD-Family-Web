import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

    // Отправляем на Pinata pinFile (multipart/form-data)
    const pinata = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: (() => {
        const fd = new FormData();
        fd.append('file', file, file.name || 'asset.png');
        return fd;
      })(),
      cache: 'no-store',
    });
    if (!pinata.ok) {
      const txt = await pinata.text();
      throw new Error(`pin error: ${pinata.status} ${txt}`);
    }
    const data = await pinata.json(); // { IpfsHash }
    const cid = data.IpfsHash as string;

    return NextResponse.json({ cid, uri: `ipfs://${cid}` }, { headers: { 'cache-control':'no-store' }});
  } catch(e:any) {
    return NextResponse.json({ error: e?.message || 'upload failed' }, { status: 500 });
  }
}
