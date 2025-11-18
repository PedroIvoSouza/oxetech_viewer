import { NextResponse } from 'next/server'
import { analisarTendenciasProjecoes } from '@/lib/bi/analysis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const tendencias = await analisarTendenciasProjecoes()
    
    return NextResponse.json({
      data: tendencias,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing trends:', error)
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao analisar tendências',
      },
      { status: 500 }
    )
  }
}

