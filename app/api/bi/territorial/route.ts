import { NextResponse } from 'next/server'
import { analisarDesempenhoTerritorial } from '@/lib/bi/analysis'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        municipios: [],
        regioes: [],
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const territorial = await analisarDesempenhoTerritorial()
    
    return NextResponse.json({
      data: territorial,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing territorial performance:', error)
    return NextResponse.json({
      data: {
        municipios: [],
        regioes: [],
      },
      error: error instanceof Error ? error.message : 'Erro ao analisar desempenho territorial',
    }, { status: 200 })
  }
}

