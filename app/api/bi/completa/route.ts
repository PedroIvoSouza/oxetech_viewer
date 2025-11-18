import { NextResponse } from 'next/server'
import { gerarAnaliseCompletaBI } from '@/lib/bi/analysis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const analise = await gerarAnaliseCompletaBI()
    
    return NextResponse.json({
      data: analise,
      error: null,
    })
  } catch (error) {
    console.error('Error generating BI analysis:', error)
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao gerar análise de BI',
      },
      { status: 500 }
    )
  }
}

