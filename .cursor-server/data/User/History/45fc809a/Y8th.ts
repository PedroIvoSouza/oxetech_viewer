import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Estatísticas gerais
    const [vagas, empresas, candidaturas, contratacoes] = await Promise.all([
      prisma.vagas.count(),
      prisma.empresas.count({
        where: { oxetech_work: true },
      }),
      prisma.candidaturas.count(),
      prisma.contratacoes.count(),
    ])

    // Funil por edital
    const editais = await prisma.oxetechwork_editals.findMany({
      select: {
        id: true,
        title: true,
        qt_vagas: true,
        qt_vagas_em_oferta: true,
        qt_vagas_preenchidas: true,
        dt_inicio_edital: true,
        dt_encerramento_edital: true,
        oxetechwork_inscricao_alunos: {
          select: {
            id: true,
            created_at: true,
          },
        },
      },
      orderBy: {
        dt_inicio_edital: 'desc',
      },
    })

    const funilPorEditalPromises = editais.map(async (edital) => {
      const ciclos = await prisma.oxetechwork_ciclos.findMany({
        where: { edital_id: edital.id },
        select: { id: true },
      })

      const cicloIds = ciclos.map((c) => c.id)

      const [candidaturasCount, contratacoesCount] = await Promise.all([
        prisma.candidaturas.count({
          where: {
            vagas: {
              ciclo_id: {
                in: cicloIds.length > 0 ? cicloIds : [-1],
              },
            },
          },
        }),
        prisma.contratacoes.count({
          where: {
            oxetechwork_ciclos: {
              edital_id: edital.id,
            },
          },
        }),
      ])

      return {
        edital: edital.title,
        inscricoes: edital.oxetechwork_inscricao_alunos.length,
        candidaturas: candidaturasCount,
        contratacoes: contratacoesCount,
        totalVagas: edital.qt_vagas,
        vagasOferta: edital.qt_vagas_em_oferta,
        vagasPreenchidas: edital.qt_vagas_preenchidas,
      }
    })

    const funilPorEdital = await Promise.all(funilPorEditalPromises)

    // Empresas com KPIs (ranking)
    const empresasComKPIs = await prisma.empresas.findMany({
      where: { oxetech_work: true },
      select: {
        id: true,
        razao_social: true,
        email: true,
        vagas: {
          select: {
            id: true,
            titulo: true,
            status: true,
            candidaturas: {
              select: {
                id: true,
              },
            },
          },
        },
        oxetechwork_inscricao_empresas: {
          select: {
            id: true,
          },
        },
      },
      take: 100,
    })

    const empresasData = empresasComKPIs
      .map((empresa) => {
        const totalContratacoes = empresa.vagas.reduce((acc, vaga) => {
          return (
            acc +
            vaga.candidaturas.filter((c) => {
              // Contratacoes relacionadas
              return true // Será calculado melhor depois
            }).length
          )
        }, 0)

        return {
          id: empresa.id,
          razao_social: empresa.razao_social,
          email: empresa.email,
          totalVagas: empresa.vagas.length,
          totalCandidaturas: empresa.vagas.reduce(
            (acc, vaga) => acc + vaga.candidaturas.length,
            0
          ),
          totalInscricoes: empresa.oxetechwork_inscricao_empresas.length,
          totalContratacoes,
          taxaConversao:
            empresa.vagas.reduce((acc, vaga) => acc + vaga.candidaturas.length, 0) >
            0
              ? (
                  (totalContratacoes /
                    empresa.vagas.reduce(
                      (acc, vaga) => acc + vaga.candidaturas.length,
                      0
                    )) *
                  100
                ).toFixed(1)
              : '0.0',
        }
      })
      .sort((a, b) => b.totalContratacoes - a.totalContratacoes)
      .slice(0, 50)

    // Vagas por status
    const vagasPorStatus = await prisma.vagas.groupBy({
      by: ['status'],
      _count: true,
    })

    const vagasDetalhadas = await prisma.vagas.findMany({
      select: {
        id: true,
        titulo: true,
        status: true,
        quantidade: true,
        data_encerramento: true,
        created_at: true,
        empresas: {
          select: {
            razao_social: true,
          },
        },
        candidaturas: {
          select: {
            id: true,
          },
        },
      },
      where: {
        oxetech_work: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 50,
    })

    // Tempo médio entre etapas
    const contratacoesComTempo = await prisma.contratacoes.findMany({
      select: {
        created_at: true,
        candidaturas: {
          select: {
            created_at: true,
            aluno_id: true,
            vaga_id: true,
            vagas: {
              select: {
                ciclo_id: true,
                oxetechwork_ciclos: {
                  select: {
                    edital_id: true,
                    oxetechwork_editals: {
                      select: {
                        dt_inicio_inscricao_aluno: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      take: 100,
    })

    // Buscar inscrições dos alunos para calcular tempo
    const alunosIds = contratacoesComTempo
      .map((c) => c.candidaturas?.aluno_id)
      .filter((id): id is number => id !== undefined)

    const inscricoesAlunos = await prisma.oxetechwork_inscricao_alunos.findMany({
      where: {
        aluno_id: {
          in: alunosIds,
        },
      },
      select: {
        aluno_id: true,
        created_at: true,
        edital_id: true,
      },
    })

    const temposMedios = contratacoesComTempo
      .map((contratacao) => {
        const dataInscricao =
          contratacao.candidaturas?.vagas?.oxetechwork_ciclos?.oxetechwork_editals
            ?.dt_inicio_inscricao_aluno
        const dataCandidatura = contratacao.candidaturas?.created_at
        const dataContratacao = contratacao.created_at

        if (dataInscricao && dataCandidatura && dataContratacao) {
          const tempoInscricaoCandidatura =
            (new Date(dataCandidatura).getTime() -
              new Date(dataInscricao).getTime()) /
            (1000 * 60 * 60 * 24) // dias

          const tempoCandidaturaContratacao =
            (new Date(dataContratacao).getTime() -
              new Date(dataCandidatura).getTime()) /
            (1000 * 60 * 60 * 24) // dias

          return {
            inscricaoCandidatura: tempoInscricaoCandidatura,
            candidaturaContratacao: tempoCandidaturaContratacao,
          }
        }

        return null
      })
      .filter((t) => t !== null) as Array<{
      inscricaoCandidatura: number
      candidaturaContratacao: number
    }>

    const tempoMedioInscricaoCandidatura =
      temposMedios.length > 0
        ? temposMedios.reduce(
            (acc, t) => acc + t.inscricaoCandidatura,
            0
          ) / temposMedios.length
        : 0

    const tempoMedioCandidaturaContratacao =
      temposMedios.length > 0
        ? temposMedios.reduce(
            (acc, t) => acc + t.candidaturaContratacao,
            0
          ) / temposMedios.length
        : 0

    return NextResponse.json({
      data: {
        stats: {
          vagas,
          empresas,
          candidaturas,
          contratacoes,
        },
        funilPorEdital,
        empresas: empresasData,
        vagasPorStatus: vagasPorStatus.map((item) => ({
          status: item.status,
          total: item._count,
        })),
        vagas: vagasDetalhadas.map((vaga) => ({
          id: vaga.id,
          titulo: vaga.titulo,
          status: vaga.status,
          quantidade: vaga.quantidade,
          empresa: vaga.empresas?.razao_social || 'Sem empresa',
          totalCandidaturas: vaga.candidaturas.length,
          dataEncerramento: vaga.data_encerramento,
        })),
        temposMedios: {
          inscricaoCandidatura: Math.round(tempoMedioInscricaoCandidatura),
          candidaturaContratacao: Math.round(tempoMedioCandidaturaContratacao),
        },
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching work data:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to fetch work data' },
      { status: 500 }
    )
  }
}
