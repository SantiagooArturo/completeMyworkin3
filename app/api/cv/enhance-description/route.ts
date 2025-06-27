import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ✅ SEGURO: API Key solo en el servidor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Sin NEXT_PUBLIC_
});

export async function POST(request: NextRequest) {
  try {
    const { description, role, company, industry } = await request.json();

    if (!description || !role) {
      return NextResponse.json(
        { error: 'description y role son requeridos' },
        { status: 400 }
      );
    }

    const prompt = `Eres un experto en redacción de CVs para el mercado de LATAM, especializado en el formato Harvard.
    Mejora la siguiente descripción de trabajo para un CV, haciéndola más impactante y profesional.
    
    **Contexto:**
    - **Puesto:** ${role}
    - **Empresa:** ${company || 'No especificada'}
    - **Industria:** ${industry || 'No especificada'}
    
    **Descripción actual:** 
    "${description}"
    
    **Instrucciones:**
    1.  Usa verbos de acción fuertes (ej: "Lideré", "Desarrollé", "Implementé").
    2.  Cuantifica los logros siempre que sea posible (ej: "aumenté las ventas en un 20%", "reduje los costos en $15,000").
    3.  Enfócate en resultados e impacto, no solo en responsabilidades.
    4.  Mantén un tono profesional y formal, adecuado para un CV.
    5.  La respuesta debe ser solo la descripción mejorada, sin introducciones ni texto adicional.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const enhancedDescription = completion.choices[0].message.content?.trim() || '';

    return NextResponse.json({ description: enhancedDescription });
    
  } catch (error) {
    console.error('Error al mejorar la descripción:', error);
    return NextResponse.json(
      { error: 'Error al mejorar la descripción' },
      { status: 500 }
    );
  }
}
