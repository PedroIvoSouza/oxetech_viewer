import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { categorizarCursos } from '@/lib/course-normalizer'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Frequência por escola
    const escolas = await prisma.escolas_oxetech_edu.findMany({
      select: {
        id: true,
        nome: true,
        municipio: true,
        matriculas_oxetech_edu: {
          select: {
            id: true,
            faltas: true,
            inscricoes_turmas_oxetech_edu: {
              select: {
                presente: true,
                created_at: true,
                turmas_oxetech_edu: {
                  select: {
                    dia_da_aula: true,
                    hora_inicio: true,
                    hora_fim: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const frequenciaPorEscola = escolas.map((escola) => {
      const totalPresencas = escola.matriculas_oxetech_edu.reduce(
        (acc, matricula) =>
          acc +
          matricula.inscricoes_turmas_oxetech_edu.filter((i) => i.presente)
            .length,
        0
      )
      const totalAulas = escola.matriculas_oxetech_edu.reduce(
        (acc, matricula) =>
          acc + matricula.inscricoes_turmas_oxetech_edu.length,
        0
      )

      return {
        escola: escola.nome,
        municipio: escola.municipio,
        frequencia:
          totalAulas > 0 ? (totalPresencas / totalAulas) * 100 : 0,
        totalPresencas,
        totalAulas,
        totalMatriculas: escola.matriculas_oxetech_edu.length,
      }
    })

    // Frequência diária (últimos 30 dias)
    const trintaDiasAtras = new Date()
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

    const inscricoesRecentes = await prisma.inscricoes_turmas_oxetech_edu.findMany(
      {
        where: {
          created_at: {
            gte: trintaDiasAtras,
          },
        },
        select: {
          presente: true,
          created_at: true,
        },
      }
    )

    const frequenciaDiaria = []
    for (let i = 29; i >= 0; i--) {
      const data = new Date()
      data.setDate(data.getDate() - i)
      const dataStr = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })

      const inscricoesDia = inscricoesRecentes.filter((insc) => {
        const inscData = new Date(insc.created_at)
        return (
          inscData.getDate() === data.getDate() &&
          inscData.getMonth() === data.getMonth() &&
          inscData.getFullYear() === data.getFullYear()
        )
      })

      const presencas = inscricoesDia.filter((i) => i.presente).length
      const total = inscricoesDia.length

      frequenciaDiaria.push({
        dia: dataStr,
        frequencia: total > 0 ? (presencas / total) * 100 : 0,
        presencas,
        total,
      })
    }

    // Ranking de cursos mais procurados (com normalização)
    const turmasEdu = await prisma.turmas_oxetech_edu.findMany({
      select: {
        id: true,
        titulo: true,
        escola_id: true,
        escolas_oxetech_edu: {
          select: {
            nome: true,
          },
        },
        inscricoes_turmas_oxetech_edu: {
          select: {
            id: true,
          },
        },
      },
    })

    const cursosData = turmasEdu.map((turma) => ({
      curso: turma.titulo || 'Sem curso',
      escola: turma.escolas_oxetech_edu?.nome || 'Sem escola',
      totalMatriculas: turma.inscricoes_turmas_oxetech_edu.length,
    }))

    // Normalizar e categorizar cursos
    const cursosPorNome = cursosData.reduce((acc, item) => {
      acc[item.curso] = (acc[item.curso] || 0) + item.totalMatriculas
      return acc
    }, {} as Record<string, number>)

    const cursosArray = Object.entries(cursosPorNome).map(([curso, total]) => ({
      curso,
      total,
    }))

    const cursosNormalizados = categorizarCursos(cursosArray)

    const rankingCursos = cursosNormalizados.cursosNormalizados
      .slice(0, 10)
      .map((c) => ({
        curso: c.nomeNormalizado,
        totalMatriculas: c.total,
        categoria: c.categoria,
        nomeOriginal: c.nomeOriginal,
      }))

    // Matrículas por curso (completo)
    const matriculasPorCurso = cursosData.sort(
      (a, b) => b.totalMatriculas - a.totalMatriculas
    )

    // Mapa de calor por horário
    const horariosMap = new Map<string, number>()

    escolas.forEach((escola) => {
      escola.matriculas_oxetech_edu.forEach((matricula) => {
        matricula.inscricoes_turmas_oxetech_edu.forEach((inscricao) => {
          if (inscricao.presente && inscricao.turmas_oxetech_edu) {
            const hora = inscricao.turmas_oxetech_edu.hora_inicio
            const diaSemana = new Date(
              inscricao.turmas_oxetech_edu.dia_da_aula
            ).toLocaleDateString('pt-BR', { weekday: 'short' })

            const key = `${diaSemana} - ${hora}`
            horariosMap.set(key, (horariosMap.get(key) || 0) + 1)
          }
        })
      })
    })

    const mapaCalorHorario = Array.from(horariosMap.entries())
      .map(([horario, frequencia]) => ({
        horario,
        frequencia,
      }))
      .sort((a, b) => b.frequencia - a.frequencia)
      .slice(0, 20)

    // Comparativo mensal de matrículas (últimos 12 meses)
    const dozeMesesAtras = new Date()
    dozeMesesAtras.setMonth(dozeMesesAtras.getMonth() - 12)

    const matriculasRecentes = await prisma.matriculas_oxetech_edu.findMany({
      where: {
        created_at: {
          gte: dozeMesesAtras,
        },
      },
      select: {
        created_at: true,
      },
    })

    const comparativoMensal = []
    for (let i = 11; i >= 0; i--) {
      const mes = new Date()
      mes.setMonth(mes.getMonth() - i)

      const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1)
      const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)

      const matriculasMes = matriculasRecentes.filter((matricula) => {
        const dataMatricula = new Date(matricula.created_at)
        return dataMatricula >= inicioMes && dataMatricula <= fimMes
      }).length

      comparativoMensal.push({
        mes: mes.toLocaleDateString('pt-BR', {
          month: 'short',
          year: 'numeric',
        }),
        matriculas: matriculasMes,
      })
    }

    // Estatísticas gerais
    const [totalEscolas, totalMatriculas, totalTurmas, totalCertificados] = await Promise.all([
      prisma.escolas_oxetech_edu.count(),
      prisma.matriculas_oxetech_edu.count(),
      prisma.turmas_oxetech_edu.count(),
      prisma.matriculas_oxetech_edu.count({
        where: {
          status: {
            not: 'ZERO', // Status diferente de inicial pode indicar conclusão/certificação
          },
        },
      }),
    ])

    // Matrículas com status
    const matriculasComStatus = await prisma.matriculas_oxetech_edu.groupBy({
      by: ['status'],
      _count: true,
    })

    return NextResponse.json({
      data: {
        frequenciaPorEscola,
        frequenciaDiaria,
        rankingCursos,
        matriculasPorCurso,
        mapaCalorHorario,
        comparativoMensal,
        stats: {
          totalEscolas,
          totalMatriculas,
          totalTurmas,
          totalCertificados,
          cursosNormalizados: cursosNormalizados.cursosNormalizados,
          cursosPorCategoria: cursosNormalizados.porCategoria,
        },
        matriculasPorStatus: matriculasComStatus.map((item) => ({
          status: item.status,
          total: item._count,
        })),
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching edu data:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to fetch edu data' },
      { status: 500 }
    )
  }
}
