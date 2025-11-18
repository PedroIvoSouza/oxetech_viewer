import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Frequência por escola
    const escolas = await prisma.escolas_oxetech_edu.findMany({
      select: {
        id: true,
        nome: true,
        matriculas_oxetech_edu: {
          select: {
            id: true,
            faltas: true,
            inscricoes_turmas_oxetech_edu: {
              select: {
                presente: true,
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
        frequencia:
          totalAulas > 0 ? (totalPresencas / totalAulas) * 100 : 0,
        totalPresencas,
        totalAulas,
      }
    })

    // Aulas por instrutor (via turmas)
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
      },
    })

    // Matrículas por curso (via turmas)
    const matriculasPorCurso = turmasEdu.map((turma) => {
      return {
        curso: turma.titulo,
        escola: turma.escolas_oxetech_edu?.nome || 'Sem escola',
        totalMatriculas: 0, // Será calculado
      }
    })

    // Estatísticas gerais
    const [totalEscolas, totalMatriculas, totalTurmas] = await Promise.all([
      prisma.escolas_oxetech_edu.count(),
      prisma.matriculas_oxetech_edu.count(),
      prisma.turmas_oxetech_edu.count(),
    ])

    // Matrículas com status
    const matriculasComStatus = await prisma.matriculas_oxetech_edu.groupBy({
      by: ['status'],
      _count: true,
    })

    return NextResponse.json({
      frequenciaPorEscola,
      matriculasPorCurso,
      stats: {
        totalEscolas,
        totalMatriculas,
        totalTurmas,
      },
      matriculasPorStatus: matriculasComStatus.map((item) => ({
        status: item.status,
        total: item._count,
      })),
    })
  } catch (error) {
    console.error('Error fetching edu data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch edu data' },
      { status: 500 }
    )
  }
}

