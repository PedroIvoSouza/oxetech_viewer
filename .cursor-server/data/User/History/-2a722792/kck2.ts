import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Inscrições Lab
    const inscricoes = await prisma.oxetechlab_inscricoes.findMany({
      select: {
        id: true,
        status: true,
        created_at: true,
        aluno_id: true,
        turma_id: true,
        alunos: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        turmas: {
          select: {
            id: true,
            titulo: true,
            qtd_vagas_total: true,
            qtd_vagas_preenchidas: true,
            laboratorios: {
              select: {
                id: true,
                nome: true,
                municipio: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Estatísticas gerais
    const [totalInscricoes, totalInscricoesPorStatus] = await Promise.all([
      prisma.oxetechlab_inscricoes.count(),
      prisma.oxetechlab_inscricoes.groupBy({
        by: ['status'],
        _count: true,
      }),
    ])

    // Status específicos
    const inscricoesAtivas = await prisma.oxetechlab_inscricoes.count({
      where: {
        status: {
          not: 'FINALIZADO',
        },
      },
    })

    const inscricoesFinalizadas = await prisma.oxetechlab_inscricoes.count({
      where: {
        status: 'FINALIZADO',
      },
    })

    // Distribuição por curso (via turma)
    const distribuicaoPorCurso = inscricoes.reduce((acc, inscricao) => {
      const curso = inscricao.turmas?.titulo || 'Sem curso'
      acc[curso] = (acc[curso] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const distribuicaoPorCursoArray = Object.entries(distribuicaoPorCurso)
      .map(([curso, total]) => ({
        curso,
        total,
      }))
      .sort((a, b) => b.total - a.total)

    // Evolução temporal mensal
    const evolucaoTemporal = inscricoes.reduce((acc, inscricao) => {
      const month = new Date(inscricao.created_at).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const evolucaoTemporalArray = Object.entries(evolucaoTemporal)
      .sort((a, b) => {
        const dateA = new Date(a[0].split(' de ').reverse().join('-'))
        const dateB = new Date(b[0].split(' de ').reverse().join('-'))
        return dateA.getTime() - dateB.getTime()
      })
      .slice(-12)
      .map(([mes, total]) => ({
        mes,
        inscricoes: total,
      }))

    // Evolução semanal (últimas 8 semanas)
    const oitoSemanasAtras = new Date()
    oitoSemanasAtras.setDate(oitoSemanasAtras.getDate() - 56)

    const inscricoesRecentes = inscricoes.filter(
      (i) => new Date(i.created_at) >= oitoSemanasAtras
    )

    const evolucaoSemanal = []
    for (let i = 7; i >= 0; i--) {
      const semana = new Date()
      semana.setDate(semana.getDate() - i * 7)
      const inicioSemana = new Date(semana)
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
      const fimSemana = new Date(inicioSemana)
      fimSemana.setDate(fimSemana.getDate() + 6)

      const total = inscricoesRecentes.filter((insc) => {
        const data = new Date(insc.created_at)
        return data >= inicioSemana && data <= fimSemana
      }).length

      evolucaoSemanal.push({
        semana: `Sem ${8 - i}`,
        inscricoes: total,
      })
    }

    // Inscrições por laboratório
    const laboratoriosMap = new Map<
      string,
      {
        nome: string
        municipio: string
        totalInscricoes: number
        cursos: Set<string>
        vagasOcupadas: number
        vagasTotal: number
      }
    >()

    inscricoes.forEach((inscricao) => {
      const labNome = inscricao.turmas?.laboratorios?.nome || 'Sem laboratório'
      const municipio =
        inscricao.turmas?.laboratorios?.municipio || 'Sem município'
      const curso = inscricao.turmas?.titulo || 'Sem curso'

      if (!laboratoriosMap.has(labNome)) {
        laboratoriosMap.set(labNome, {
          nome: labNome,
          municipio,
          totalInscricoes: 0,
          cursos: new Set(),
          vagasOcupadas: 0,
          vagasTotal: 0,
        })
      }

      const lab = laboratoriosMap.get(labNome)!
      lab.totalInscricoes++
      lab.cursos.add(curso)
      lab.vagasOcupadas += inscricao.turmas?.qtd_vagas_preenchidas || 0
      lab.vagasTotal += inscricao.turmas?.qtd_vagas_total || 0
    })

    const inscricoesPorLaboratorioArray = Array.from(laboratoriosMap.values())
      .map((lab) => ({
        laboratorio: lab.nome,
        municipio: lab.municipio,
        totalInscricoes: lab.totalInscricoes,
        totalCursos: lab.cursos.size,
        vagasOcupadas: lab.vagasOcupadas,
        vagasTotal: lab.vagasTotal,
        vagasLivres: lab.vagasTotal - lab.vagasOcupadas,
      }))
      .sort((a, b) => b.totalInscricoes - a.totalInscricoes)

    // Média por laboratório
    const mediaPorLaboratorio =
      inscricoesPorLaboratorioArray.length > 0
        ? inscricoesPorLaboratorioArray.reduce(
            (acc, lab) => acc + lab.totalInscricoes,
            0
          ) / inscricoesPorLaboratorioArray.length
        : 0

    // Slots ocupados vs livres
    const totalVagasOcupadas = inscricoesPorLaboratorioArray.reduce(
      (acc, lab) => acc + lab.vagasOcupadas,
      0
    )
    const totalVagasLivres = inscricoesPorLaboratorioArray.reduce(
      (acc, lab) => acc + lab.vagasLivres,
      0
    )
    const totalVagas = totalVagasOcupadas + totalVagasLivres

    // Lista detalhada de inscrições
    const inscricoesDetalhadas = inscricoes.slice(0, 100).map((insc) => ({
      id: insc.id,
      aluno: insc.alunos?.name || 'Sem nome',
      email: insc.alunos?.email || 'Sem email',
      curso: insc.turmas?.titulo || 'Sem curso',
      laboratorio: insc.turmas?.laboratorios?.nome || 'Sem laboratório',
      municipio: insc.turmas?.laboratorios?.municipio || 'Sem município',
      status: insc.status,
      dataInscricao: insc.created_at,
    }))

    return NextResponse.json({
      data: {
        stats: {
          totalInscricoes,
          inscricoesAtivas,
          inscricoesFinalizadas,
          inscricoesPorStatus: totalInscricoesPorStatus.map((item) => ({
            status: item.status,
            total: item._count,
          })),
          mediaPorLaboratorio: Math.round(mediaPorLaboratorio),
          totalVagas,
          vagasOcupadas: totalVagasOcupadas,
          vagasLivres: totalVagasLivres,
        },
        distribuicaoPorCurso: distribuicaoPorCursoArray,
        evolucaoTemporal: evolucaoTemporalArray,
        evolucaoSemanal: evolucaoSemanal,
        inscricoesPorLaboratorio: inscricoesPorLaboratorioArray,
        inscricoes: inscricoesDetalhadas,
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching lab data:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to fetch lab data' },
      { status: 500 }
    )
  }
}
