import { NextResponse } from 'next/server'
import { analisarDesempenhoTerritorial } from '@/lib/bi/analysis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const territorial = await analisarDesempenhoTerritorial()
    
    return NextResponse.json({
      data: territorial,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing territorial performance:', error)
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao analisar desempenho territorial',
      },
      { status: 500 }
    )
  }
}

