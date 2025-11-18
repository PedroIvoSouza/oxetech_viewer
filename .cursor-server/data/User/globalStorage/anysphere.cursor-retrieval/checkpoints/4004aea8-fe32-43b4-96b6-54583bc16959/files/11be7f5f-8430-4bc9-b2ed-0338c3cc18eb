import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Listar alunos com suas informações
    const [alunos, total] = await Promise.all([
      prisma.alunos.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          telefone: true,
          status: true,
          created_at: true,
          inscricoes_trilhas_alunos: {
            select: {
              id: true,
              concluido: true,
              trilhas_de_conhecimento: {
                select: {
                  titulo: true,
                },
              },
            },
          },
          oxetechlab_inscricoes: {
            select: {
              id: true,
              status: true,
              turmas: {
                select: {
                  titulo: true,
                },
              },
            },
          },
          matriculas: {
            select: {
              id: true,
              status: true,
              turmas: {
                select: {
                  titulo: true,
                },
              },
            },
          },
          matriculas_oxetech_edu: {
            select: {
              id: true,
              status: true,
              escolas_oxetech_edu: {
                select: {
                  nome: true,
                },
              },
            },
          },
          frequencias: {
            select: {
              id: true,
              status: true,
              aulas: {
                select: {
                  titulo: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.alunos.count(),
    ])

    // Processar dados dos alunos
    const alunosData = alunos.map((aluno) => ({
      id: aluno.id,
      name: aluno.name,
      email: aluno.email,
      telefone: aluno.telefone,
      status: aluno.status,
      created_at: aluno.created_at,
      trilhasInscritas: aluno.inscricoes_trilhas_alunos.length,
      trilhasConcluidas: aluno.inscricoes_trilhas_alunos.filter(
        (i) => i.concluido
      ).length,
      labInscricoes: aluno.oxetechlab_inscricoes.length,
      matriculasLab: aluno.matriculas.length,
      matriculasEdu: aluno.matriculas_oxetech_edu.length,
      totalFrequencias: aluno.frequencias.length,
    }))

    return NextResponse.json({
      alunos: alunosData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching alunos data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alunos data' },
      { status: 500 }
    )
  }
}

