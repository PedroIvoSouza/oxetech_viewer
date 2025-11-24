import { NextResponse } from 'next/server'
import { gerarAnaliseDetalhadaLab } from '@/lib/bi/lab-analysis'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        estatisticas: {},
        analises: [],
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const analise = await gerarAnaliseDetalhadaLab()
    
    return NextResponse.json({
      data: analise,
      error: null,
    })
  } catch (error) {
    console.error('Error generating detailed Lab analysis:', error)
    return NextResponse.json({
      data: {
        estatisticas: {},
        analises: [],
      },
      error: error instanceof Error ? error.message : 'Erro ao gerar análise detalhada do Lab',
    }, { status: 200 })
  }
}

