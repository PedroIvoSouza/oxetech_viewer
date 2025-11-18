import { NextResponse } from 'next/server'
import { gerarAnaliseDetalhadaLab } from '@/lib/bi/lab-analysis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const analise = await gerarAnaliseDetalhadaLab()
    
    return NextResponse.json({
      data: analise,
      error: null,
    })
  } catch (error) {
    console.error('Error generating detailed Lab analysis:', error)
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao gerar análise detalhada do Lab',
      },
      { status: 500 }
    )
  }
}

