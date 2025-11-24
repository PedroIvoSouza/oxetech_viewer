import { NextResponse } from 'next/server'
import { analisarROIEficiencia } from '@/lib/bi/analysis'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        investimento: 0,
        retorno: 0,
        multiplicador: 0,
        eficiencia: [],
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const roi = await analisarROIEficiencia()
    
    return NextResponse.json({
      data: roi,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing ROI:', error)
    return NextResponse.json({
      data: {
        investimento: 0,
        retorno: 0,
        multiplicador: 0,
        eficiencia: [],
      },
      error: error instanceof Error ? error.message : 'Erro ao analisar ROI',
    }, { status: 200 })
  }
}

