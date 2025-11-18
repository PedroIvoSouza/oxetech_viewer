import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Filtros avançados
    const programa = searchParams.get('programa') || 'all'
    const status = searchParams.get('status') || 'all'
    const municipio = searchParams.get('municipio') || ''
    const busca = searchParams.get('busca') || ''

    // Construir where clause
    const where: any = {}

    if (busca) {
      where.OR = [
        { name: { contains: busca, mode: 'insensitive' as any } },
        { email: { contains: busca, mode: 'insensitive' as any } },
      ]
    }

    if (status !== 'all') {
      where.status = status
    }

    if (municipio) {
      where.municipio = { contains: municipio, mode: 'insensitive' as any }
    }

    // Filtro por programa
    if (programa !== 'all') {
      if (programa === 'work') {
        where.oxetechwork_inscricao_alunos = { some: {} }
      } else if (programa === 'edu') {
        where.matriculas_oxetech_edu = { some: {} }
      } else if (programa === 'trilhas') {
        where.inscricoes_trilhas_alunos = { some: {} }
      } else if (programa === 'lab') {
        where.oxetechlab_inscricoes = { some: {} }
      }
    }

    // Listar alunos com suas informações
    const [alunos, total] = await Promise.all([
      prisma.alunos.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          telefone: true,
          status: true,
          municipio: true,
          created_at: true,
          avatar_url: true,
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
          oxetechwork_inscricao_alunos: {
            select: {
              id: true,
              status: true,
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
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.alunos.count({ where }),
    ])

    // Processar dados dos alunos
    const alunosData = alunos.map((aluno) => {
      // Calcular progresso geral em trilhas
      const trilhasTotal = aluno.inscricoes_trilhas_alunos.length
      const trilhasConcluidas = aluno.inscricoes_trilhas_alunos.filter(
        (i) => i.concluido
      ).length
      const progressoGeral =
        trilhasTotal > 0 ? (trilhasConcluidas / trilhasTotal) * 100 : 0

      // Última atividade
      const ultimaAtividade = aluno.created_at

      return {
        id: aluno.id,
        name: aluno.name,
        email: aluno.email,
        telefone: aluno.telefone,
        municipio: aluno.municipio,
        status: aluno.status,
        avatar_url: aluno.avatar_url,
        created_at: aluno.created_at,
        trilhasInscritas: trilhasTotal,
        trilhasConcluidas,
        progressoGeral,
        labInscricoes: aluno.oxetechlab_inscricoes.length,
        matriculasLab: aluno.matriculas.length,
        matriculasEdu: aluno.matriculas_oxetech_edu.length,
        workInscricoes: aluno.oxetechwork_inscricao_alunos.length,
        totalFrequencias: aluno.frequencias.length,
        ultimaAtividade,
        programas: [
          aluno.oxetechwork_inscricao_alunos.length > 0 ? 'Work' : null,
          aluno.matriculas_oxetech_edu.length > 0 ? 'Edu' : null,
          aluno.inscricoes_trilhas_alunos.length > 0 ? 'Trilhas' : null,
          aluno.oxetechlab_inscricoes.length > 0 ? 'Lab' : null,
        ].filter((p) => p !== null) as string[],
      }
    })

    // Obter lista de municípios únicos
    const municipios = await prisma.alunos.findMany({
      select: {
        municipio: true,
      },
      distinct: ['municipio'],
      orderBy: {
        municipio: 'asc',
      },
    })

    return NextResponse.json({
      data: {
        alunos: alunosData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          municipios: municipios.map((m) => m.municipio),
        },
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching alunos data:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to fetch alunos data' },
      { status: 500 }
    )
  }
}
