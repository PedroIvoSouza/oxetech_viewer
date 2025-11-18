import { NextResponse } from 'next/server'
import { gerarAuditoriaCompleta } from '@/lib/audit/ai-auditor'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auditoria = await gerarAuditoriaCompleta()

    return NextResponse.json({
      data: auditoria,
      error: null,
    })
  } catch (error) {
    console.error('Error generating audit:', error)
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao gerar auditoria',
      },
      { status: 500 }
    )
  }
}

