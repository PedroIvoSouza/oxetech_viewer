import { NextResponse } from 'next/server'
import { analisarOportunidadesGaps } from '@/lib/bi/analysis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const oportunidades = await analisarOportunidadesGaps()
    
    return NextResponse.json({
      data: oportunidades,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing opportunities:', error)
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao analisar oportunidades',
      },
      { status: 500 }
    )
  }
}

