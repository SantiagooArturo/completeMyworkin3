import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pdf_url = searchParams.get('pdf_url');
  const puesto_postular = searchParams.get('puesto_postular');

  if (!pdf_url || !puesto_postular) {
    return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
  }

  // const apiUrl = `https://api-cv-myworkin.onrender.com/analizar-cv?pdf_url=${encodeURIComponent(pdf_url)}&puesto_postular=${encodeURIComponent(puesto_postular)}`;
  const apiUrl = `https://myworkin-cv-2.onrender.com/analizar-cv?pdf_url=${encodeURIComponent(pdf_url)}&puesto_postular=${encodeURIComponent(puesto_postular)}`;
  try {
    const response = await fetch(apiUrl);
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return new NextResponse(text, { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Error al conectar con el endpoint externo', detalle: String(err) }, { status: 502 });
  }
}