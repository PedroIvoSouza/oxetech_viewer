import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verificar se Prisma está disponível
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        stats: {
          totalTrilhas: 0,
          totalInscritos: 0,
          totalConcluidos: 0,
          progressoMedioGeral: 0,
          conclusaoMediaModulo: 0,
        },
        trilhas: [],
        progressoPorTrilha: [],
        topTrilhas: [],
        evolucaoTemporal: [],
        inscritos: [],
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || 'all'
    const busca = searchParams.get('busca') || ''

    // Calcular período
    let dataInicio: Date | undefined
    if (periodo === '30d') {
      dataInicio = new Date()
      dataInicio.setDate(dataInicio.getDate() - 30)
    } else if (periodo === '90d') {
      dataInicio = new Date()
      dataInicio.setMonth(dataInicio.getMonth() - 3)
    } else if (periodo === '1y') {
      dataInicio = new Date()
      dataInicio.setFullYear(dataInicio.getFullYear() - 1)
    }

    // Listar trilhas com módulos e atividades
    const trilhas = await prisma.trilhas_de_conhecimento.findMany({
      where: {
        ...(busca && {
          titulo: {
            contains: busca,
            mode: 'insensitive' as any,
          },
        }),
      },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        carga_horaria: true,
        created_at: true,
        updated_at: true,
        modulos_trilhas: {
          select: {
            id: true,
            curso_id: true,
            cursos: {
              select: {
                id: true,
                titulo: true,
                descricao: true,
              },
            },
            modulos_trilhas_pdfs: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Inscrições com filtro de período
    const inscricoesWhere: any = {}
    if (dataInicio) {
      inscricoesWhere.created_at = {
        gte: dataInicio,
      }
    }

    const [inscricoes, inscricoesTotal] = await Promise.all([
      prisma.inscricoes_trilhas_alunos.findMany({
        where: inscricoesWhere,
        select: {
          id: true,
          trilha_id: true,
          concluido: true,
          created_at: true,
          trilhas_de_conhecimento: {
            select: {
              titulo: true,
            },
          },
          modulos_trilhas_alunos: {
            select: {
              curso_concluido: true,
              atividade_concluida: true,
            },
          },
        },
      }),
      prisma.inscricoes_trilhas_alunos.count(),
    ])

    // Evolução temporal de inscrições (últimos 12 meses)
    const dozeMesesAtras = new Date()
    dozeMesesAtras.setMonth(dozeMesesAtras.getMonth() - 12)

    const inscricoesTemporal = await prisma.inscricoes_trilhas_alunos.findMany({
      where: {
        created_at: {
          gte: dozeMesesAtras,
        },
      },
      select: {
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    })

    const evolucaoTemporal = []
    for (let i = 11; i >= 0; i--) {
      const mes = new Date()
      mes.setMonth(mes.getMonth() - i)

      const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1)
      const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)

      const total = inscricoesTemporal.filter((insc) => {
        const data = new Date(insc.created_at)
        return data >= inicioMes && data <= fimMes
      }).length

      evolucaoTemporal.push({
        mes: mes.toLocaleDateString('pt-BR', {
          month: 'short',
          year: 'numeric',
        }),
        inscricoes: total,
      })
    }

    // Progresso médio dos alunos por trilha
    const trilhasComModulos = await prisma.trilhas_de_conhecimento.findMany({
      select: {
        id: true,
        titulo: true,
        modulos_trilhas: {
          select: {
            id: true,
          },
        },
      },
    })

    const progressoPorTrilha = trilhas.map((trilha) => {
      const inscricoesTrilha = inscricoes.filter(
        (insc) => insc.trilha_id === trilha.id
      )
      const totalInscritos = inscricoesTrilha.length
      const concluidos = inscricoesTrilha.filter((i) => i.concluido).length

      // Calcular progresso médio dos módulos
      const progressoMedio =
        totalInscritos > 0
          ? inscricoesTrilha.reduce((acc, insc) => {
              const modulosConcluidos = insc.modulos_trilhas_alunos.filter(
                (m) => m.curso_concluido && m.atividade_concluida
              ).length
              const totalModulos = trilha.modulos_trilhas.length
              return (
                acc + (totalModulos > 0 ? modulosConcluidos / totalModulos : 0)
              )
            }, 0) / totalInscritos
          : 0

      return {
        id: trilha.id,
        trilha: trilha.titulo,
        totalInscritos,
        concluidos,
        progressoMedio: progressoMedio * 100,
        percentualConclusao:
          totalInscritos > 0 ? (concluidos / totalInscritos) * 100 : 0,
        totalModulos: trilha.modulos_trilhas.length,
        status: totalInscritos > 0 ? 'ativo' : 'inativo',
      }
    })

    // Top 10 trilhas mais acessadas
    const topTrilhas = progressoPorTrilha
      .sort((a, b) => b.totalInscritos - a.totalInscritos)
      .slice(0, 10)

    // Conclusão média por módulo (geral)
    const todasInscricoes = await prisma.inscricoes_trilhas_alunos.findMany({
      select: {
        modulos_trilhas_alunos: {
          select: {
            curso_concluido: true,
            atividade_concluida: true,
          },
        },
      },
    })

    const modulosConcluidos = todasInscricoes.reduce((acc, insc) => {
      return (
        acc +
        insc.modulos_trilhas_alunos.filter(
          (m) => m.curso_concluido && m.atividade_concluida
        ).length
      )
    }, 0)

    const totalModulosAtividades = todasInscricoes.reduce(
      (acc, insc) => acc + insc.modulos_trilhas_alunos.length,
      0
    )

    const conclusaoMediaModulo =
      totalModulosAtividades > 0
        ? (modulosConcluidos / totalModulosAtividades) * 100
        : 0

    // Tabela de inscritos detalhada
    const inscritosDetalhados = await prisma.inscricoes_trilhas_alunos.findMany(
      {
        select: {
          id: true,
          aluno_id: true,
          trilha_id: true,
          concluido: true,
          created_at: true,
          alunos: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          trilhas_de_conhecimento: {
            select: {
              titulo: true,
            },
          },
          modulos_trilhas_alunos: {
            select: {
              curso_concluido: true,
              atividade_concluida: true,
            },
          },
        },
        take: 100,
        orderBy: {
          created_at: 'desc',
        },
      }
    )

    const inscritosComProgresso = inscritosDetalhados.map((inscricao) => {
      const modulosConcluidos = inscricao.modulos_trilhas_alunos.filter(
        (m) => m.curso_concluido && m.atividade_concluida
      ).length

      const trilhaModulos = trilhasComModulos.find(
        (t) => t.id === inscricao.trilha_id
      )
      const totalModulos = trilhaModulos?.modulos_trilhas.length || 0
      const percentualConcluido =
        totalModulos > 0 ? (modulosConcluidos / totalModulos) * 100 : 0

      return {
        id: inscricao.id,
        aluno: inscricao.alunos?.name || 'Sem nome',
        email: inscricao.alunos?.email || 'Sem email',
        trilha: inscricao.trilhas_de_conhecimento?.titulo || 'Sem trilha',
        concluido: inscricao.concluido,
        percentualConcluido,
        dataInscricao: inscricao.created_at,
      }
    })

    // Estatísticas gerais
    const totalTrilhas = trilhas.length
    const totalInscritos = inscricoesTotal
    const totalConcluidos = await prisma.inscricoes_trilhas_alunos.count({
      where: { concluido: true },
    })

    const progressoMedioGeral =
      progressoPorTrilha.length > 0
        ? progressoPorTrilha.reduce(
            (acc, item) => acc + item.progressoMedio,
            0
          ) / progressoPorTrilha.length
        : 0

    return NextResponse.json({
      data: {
        stats: {
          totalTrilhas,
          totalInscritos,
          totalConcluidos,
          progressoMedioGeral,
          conclusaoMediaModulo,
        },
        trilhas,
        progressoPorTrilha,
        topTrilhas,
        evolucaoTemporal,
        inscritos: inscritosComProgresso,
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching trilhas data:', error)
    return NextResponse.json({
      data: {
        stats: {
          totalTrilhas: 0,
          totalInscritos: 0,
          totalConcluidos: 0,
          progressoMedioGeral: 0,
          conclusaoMediaModulo: 0,
        },
        trilhas: [],
        progressoPorTrilha: [],
        topTrilhas: [],
        evolucaoTemporal: [],
        inscritos: [],
      },
      error: error instanceof Error ? error.message : 'Failed to fetch trilhas data',
    }, { status: 200 })
  }
}
