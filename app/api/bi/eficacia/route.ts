import { NextResponse } from 'next/server'
import { analisarEficaciaProgramas } from '@/lib/bi/analysis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const eficacia = await analisarEficaciaProgramas()
    
    return NextResponse.json({
      data: eficacia,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing program effectiveness:', error)
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao analisar eficácia dos programas',
      },
      { status: 500 }
    )
  }
}

