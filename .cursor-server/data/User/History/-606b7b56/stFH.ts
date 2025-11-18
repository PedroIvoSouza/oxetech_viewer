import { NextResponse } from 'next/server'
import { debugLabInconsistencias } from '@/lib/audit/lab-debug'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const debugInfo = await debugLabInconsistencias()

    return NextResponse.json({
      data: debugInfo,
      error: null,
    })
  } catch (error) {
    console.error('Error debugging Lab inconsistencies:', error)
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao debugar inconsistências do Lab',
      },
      { status: 500 }
    )
  }
}

