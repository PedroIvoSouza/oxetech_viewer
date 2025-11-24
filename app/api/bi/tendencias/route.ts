import { NextResponse } from 'next/server'
import { analisarTendenciasProjecoes } from '@/lib/bi/analysis'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        tendencias: [],
        projecoes: [],
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const tendencias = await analisarTendenciasProjecoes()
    
    return NextResponse.json({
      data: tendencias,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing trends:', error)
    return NextResponse.json({
      data: {
        tendencias: [],
        projecoes: [],
      },
      error: error instanceof Error ? error.message : 'Erro ao analisar tendências',
    }, { status: 200 })
  }
}

