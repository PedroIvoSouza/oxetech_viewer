import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: null,
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    const aluno = await prisma.alunos.findUnique({
      where: { id },
      include: {
        inscricoes_trilhas_alunos: {
          include: {
            trilhas_de_conhecimento: true,
            modulos_trilhas_alunos: {
              include: {
                modulos_trilhas: {
                  include: {
                    cursos: true,
                  },
                },
              },
            },
          },
        },
        oxetechlab_inscricoes: {
          include: {
            turmas: {
              include: {
                laboratorios: true,
              },
            },
          },
        },
        matriculas: {
          include: {
            turmas: {
              include: {
                laboratorios: true,
              },
            },
          },
        },
        matriculas_oxetech_edu: {
          include: {
            escolas_oxetech_edu: true,
          },
        },
      },
    })

    if (!aluno) {
      return NextResponse.json(
        { data: null, error: 'Aluno not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: aluno, error: null })
  } catch (error) {
    console.error('Error fetching aluno data:', error)
    return NextResponse.json({
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch aluno data',
    }, { status: 200 })
  }
}

