import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Listar trilhas com módulos e atividades
    const trilhas = await prisma.trilhas_de_conhecimento.findMany({
      select: {
        id: true,
        titulo: true,
        descricao: true,
        carga_horaria: true,
        created_at: true,
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

    // Progresso médio dos alunos por trilha
    const inscricoes = await prisma.inscricoes_trilhas_alunos.findMany({
      select: {
        trilha_id: true,
        concluido: true,
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
        trilha: trilha.titulo,
        totalInscritos,
        concluidos,
        progressoMedio: progressoMedio * 100,
      }
    })

    // Tabela de inscritos com % concluído
    const inscritosDetalhados = await prisma.inscricoes_trilhas_alunos.findMany(
      {
        select: {
          id: true,
          aluno_id: true,
          concluido: true,
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
      }
    )

    const trilhasComModulos = await prisma.trilhas_de_conhecimento.findMany({
      select: {
        id: true,
        modulos_trilhas: {
          select: {
            id: true,
          },
        },
      },
    })

    const inscritosComProgresso = inscritosDetalhados.map((inscricao) => {
      const modulosConcluidos = inscricao.modulos_trilhas_alunos.filter(
        (m) => m.curso_concluido && m.atividade_concluida
      ).length
      
      // Buscar total de módulos da trilha
      const trilhaModulos = trilhasComModulos.find(
        (t) => t.id === inscricao.trilha_id
      )
      const totalModulos = trilhaModulos?.modulos_trilhas.length || inscricao.modulos_trilhas_alunos.length
      const percentualConcluido =
        totalModulos > 0 ? (modulosConcluidos / totalModulos) * 100 : 0

      return {
        id: inscricao.id,
        aluno: inscricao.alunos?.name || 'Sem nome',
        email: inscricao.alunos?.email || 'Sem email',
        trilha: inscricao.trilhas_de_conhecimento?.titulo || 'Sem trilha',
        concluido: inscricao.concluido,
        percentualConcluido,
      }
    })

    return NextResponse.json({
      trilhas,
      progressoPorTrilha,
      inscritos: inscritosComProgresso,
    })
  } catch (error) {
    console.error('Error fetching trilhas data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trilhas data' },
      { status: 500 }
    )
  }
}

