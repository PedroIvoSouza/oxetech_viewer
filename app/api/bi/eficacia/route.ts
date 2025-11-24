import { NextResponse } from 'next/server'
import { analisarEficaciaProgramas } from '@/lib/bi/analysis'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        taxaConclusao: 0,
        taxaContratacao: 0,
        satisfacao: 0,
        programas: [],
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const eficacia = await analisarEficaciaProgramas()
    
    return NextResponse.json({
      data: eficacia,
      error: null,
    })
  } catch (error) {
    console.error('Error analyzing program effectiveness:', error)
    return NextResponse.json({
      data: {
        taxaConclusao: 0,
        taxaContratacao: 0,
        satisfacao: 0,
        programas: [],
      },
      error: error instanceof Error ? error.message : 'Erro ao analisar eficácia dos programas',
    }, { status: 200 })
  }
}

