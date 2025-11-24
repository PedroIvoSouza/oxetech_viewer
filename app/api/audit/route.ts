import { NextResponse } from 'next/server'
import { gerarAuditoriaCompleta } from '@/lib/audit/ai-auditor'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        inconsistencias: [],
        sugestoes: [],
        estatisticas: {},
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const auditoria = await gerarAuditoriaCompleta()

    return NextResponse.json({
      data: auditoria,
      error: null,
    })
  } catch (error) {
    console.error('Error generating audit:', error)
    return NextResponse.json({
      data: {
        inconsistencias: [],
        sugestoes: [],
        estatisticas: {},
      },
      error: error instanceof Error ? error.message : 'Erro ao gerar auditoria',
    }, { status: 200 })
  }
}

