import { NextResponse } from 'next/server'
import { debugLabInconsistencias } from '@/lib/audit/lab-debug'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        inconsistencias: [],
        sugestoes: [],
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const debugInfo = await debugLabInconsistencias()

    return NextResponse.json({
      data: debugInfo,
      error: null,
    })
  } catch (error) {
    console.error('Error debugging Lab inconsistencies:', error)
    return NextResponse.json({
      data: {
        inconsistencias: [],
        sugestoes: [],
      },
      error: error instanceof Error ? error.message : 'Erro ao debugar inconsistências do Lab',
    }, { status: 200 })
  }
}

