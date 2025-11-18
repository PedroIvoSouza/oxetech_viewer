import { NextResponse } from 'next/server'
import { analisarImpactoSocial } from '@/lib/bi/analysis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const impacto = await analisarImpactoSocial()
    
    return NextResponse.json({
      data: impacto,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing social impact:', error)
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao analisar impacto social',
      },
      { status: 500 }
    )
  }
}

