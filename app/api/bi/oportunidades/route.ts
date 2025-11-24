import { NextResponse } from 'next/server'
import { analisarOportunidadesGaps } from '@/lib/bi/analysis'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        oportunidades: [],
        gaps: [],
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const oportunidades = await analisarOportunidadesGaps()
    
    return NextResponse.json({
      data: oportunidades,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing opportunities:', error)
    return NextResponse.json({
      data: {
        oportunidades: [],
        gaps: [],
      },
      error: error instanceof Error ? error.message : 'Erro ao analisar oportunidades',
    }, { status: 200 })
  }
}

