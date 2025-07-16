import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pdf_url = searchParams.get('pdf_url');
  const puesto = searchParams.get('puesto');
  const numero = searchParams.get('numero');

  if (!pdf_url || !puesto || !numero) {
    return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
  }

  const apiUrl = `https://api-jobs-tyc1.onrender.com/analizar_practicas/?pdf_url=${encodeURIComponent(pdf_url)}&puesto=${encodeURIComponent(puesto)}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  return NextResponse.json(data);
}
