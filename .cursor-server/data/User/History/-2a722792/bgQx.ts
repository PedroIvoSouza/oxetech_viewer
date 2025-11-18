import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { categorizarCursos, normalizarCurso } from '@/lib/course-normalizer'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // BUSCAR TURMAS ÚNICAS primeiro para calcular vagas corretamente
    const turmas = await prisma.turmas.findMany({
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
        oxetechlab_inscricoes: {
          select: {
            id: true,
            status: true,
            created_at: true,
            aluno_id: true,
            alunos: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    // Inscrições Lab (todas)
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
            telefone: true,
            municipio: true,
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
    const inscricoesPorStatusData = await prisma.oxetechlab_inscricoes.groupBy({
      by: ['status'],
      _count: true,
    })

    const inscricoesAtivas = inscricoesPorStatusData.reduce((acc, item) => {
      const status = String(item.status)
      // Status diferentes de FINALIZADO (2) são considerados ativos
      if (status !== 'TWO' && status !== '2') {
        return acc + item._count
      }
      return acc
    }, 0)

    const inscricoesFinalizadas = inscricoesPorStatusData.reduce((acc, item) => {
      const status = String(item.status)
      if (status === 'TWO' || status === '2') {
        return acc + item._count
      }
      return acc
    }, 0)

    // CORRIGIDO: Calcular vagas usando TURMAS ÚNICAS (não somar por inscrição)
    const turmasUnicas = new Map<number, typeof turmas[0]>()
    turmas.forEach((turma) => {
      if (!turmasUnicas.has(turma.id)) {
        turmasUnicas.set(turma.id, turma)
      }
    })

    // Calcular vagas totais corretamente (sem duplicação)
    const totalVagas = Array.from(turmasUnicas.values()).reduce(
      (acc, turma) => acc + (turma.qtd_vagas_total || 0),
      0
    )
    const totalVagasOcupadas = Array.from(turmasUnicas.values()).reduce(
      (acc, turma) => acc + (turma.qtd_vagas_preenchidas || 0),
      0
    )
    const totalVagasLivres = totalVagas - totalVagasOcupadas

    // Distribuição por curso (via turma) - SEM duplicação
    const cursosMap = new Map<string, number>()
    turmasUnicas.forEach((turma) => {
      const curso = turma.titulo || 'Sem curso'
      cursosMap.set(curso, (cursosMap.get(curso) || 0) + 1)
    })

    const distribuicaoPorCurso = Array.from(cursosMap.entries())
      .map(([curso, total]) => ({
        curso,
        total,
      }))
      .sort((a, b) => b.total - a.total)

    // Normalizar e categorizar cursos
    const cursosCategorizados = categorizarCursos(distribuicaoPorCurso)

    // Distribuição de INSCRIÇÕES por curso (diferente de turmas)
    const inscricoesPorCursoMap = new Map<string, number>()
    inscricoes.forEach((inscricao) => {
      const curso = inscricao.turmas?.titulo || 'Sem curso'
      inscricoesPorCursoMap.set(curso, (inscricoesPorCursoMap.get(curso) || 0) + 1)
    })

    const inscricoesPorCurso = Array.from(inscricoesPorCursoMap.entries())
      .map(([curso, total]) => ({
        curso,
        total,
      }))
      .sort((a, b) => b.total - a.total)

    const inscricoesPorCursoNormalizado = categorizarCursos(inscricoesPorCurso)

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

    // Inscrições por laboratório - CORRIGIDO (usar turmas únicas)
    const laboratoriosMap = new Map<
      string,
      {
        nome: string
        municipio: string
        totalInscricoes: number
        totalTurmas: number
        cursos: Set<string>
        vagasOcupadas: number
        vagasTotal: number
      }
    >()

    // Primeiro, processar turmas únicas por laboratório
    turmasUnicas.forEach((turma) => {
      const labNome = turma.laboratorios?.nome || 'Sem laboratório'
      const municipio = turma.laboratorios?.municipio || 'Sem município'
      const curso = turma.titulo || 'Sem curso'

      if (!laboratoriosMap.has(labNome)) {
        laboratoriosMap.set(labNome, {
          nome: labNome,
          municipio,
          totalInscricoes: 0,
          totalTurmas: 0,
          cursos: new Set(),
          vagasOcupadas: 0,
          vagasTotal: 0,
        })
      }

      const lab = laboratoriosMap.get(labNome)!
      lab.totalTurmas++
      lab.cursos.add(curso)
      lab.vagasOcupadas += turma.qtd_vagas_preenchidas || 0
      lab.vagasTotal += turma.qtd_vagas_total || 0
    })

    // Depois, contar inscrições por laboratório
    inscricoes.forEach((inscricao) => {
      const labNome = inscricao.turmas?.laboratorios?.nome || 'Sem laboratório'
      const lab = laboratoriosMap.get(labNome)
      if (lab) {
        lab.totalInscricoes++
      }
    })

    const inscricoesPorLaboratorioArray = Array.from(laboratoriosMap.values())
      .map((lab) => ({
        laboratorio: lab.nome,
        municipio: lab.municipio,
        totalInscricoes: lab.totalInscricoes,
        totalTurmas: lab.totalTurmas,
        totalCursos: lab.cursos.size,
        vagasOcupadas: lab.vagasOcupadas,
        vagasTotal: lab.vagasTotal,
        vagasLivres: lab.vagasTotal - lab.vagasOcupadas,
        taxaOcupacao: lab.vagasTotal > 0 ? (lab.vagasOcupadas / lab.vagasTotal) * 100 : 0,
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

    // Análise detalhada por curso normalizado (AGRUPADO)
    // Primeiro criar um mapa de turmas normalizadas
    const turmasNormalizadasMap = new Map<string, typeof turmasUnicas[0][]>()
    turmasUnicas.forEach((turma) => {
      const normalizado = normalizarCurso(turma.titulo || 'Sem curso')
      const key = normalizado.nomeNormalizado.toLowerCase().trim()
      if (!turmasNormalizadasMap.has(key)) {
        turmasNormalizadasMap.set(key, [])
      }
      turmasNormalizadasMap.get(key)!.push(turma)
    })

    const analisePorCurso = inscricoesPorCursoNormalizado.cursosNormalizados.map((curso) => {
      // Encontrar turmas deste curso normalizado (todas as variações)
      const key = curso.nomeNormalizado.toLowerCase().trim()
      const turmasDoCurso = turmasNormalizadasMap.get(key) || []
      
      const totalTurmas = turmasDoCurso.length
      const totalVagasCurso = turmasDoCurso.reduce(
        (acc, t) => acc + (t.qtd_vagas_total || 0),
        0
      )
      const vagasOcupadasCurso = turmasDoCurso.reduce(
        (acc, t) => acc + (t.qtd_vagas_preenchidas || 0),
        0
      )
      const vagasLivresCurso = totalVagasCurso - vagasOcupadasCurso
      
      return {
        ...curso,
        totalTurmas,
        totalVagas: totalVagasCurso,
        vagasOcupadas: vagasOcupadasCurso,
        vagasLivres: vagasLivresCurso,
        taxaOcupacao: totalVagasCurso > 0 ? (vagasOcupadasCurso / totalVagasCurso) * 100 : 0,
        totalInscricoes: curso.total,
      }
    })

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
          totalTurmas: turmasUnicas.size,
          // Análise adicional
          explicacao: {
            vagasCalculo: 'As vagas são calculadas usando TURMAS ÚNICAS, não por inscrição. Cada turma conta suas vagas apenas uma vez, evitando duplicação.',
            inscricoesCalculo: 'As inscrições são contadas individualmente. Um aluno pode se inscrever em múltiplas turmas.',
            diferenca: totalInscricoes - turmasUnicas.size > 0 
              ? `${totalInscricoes - turmasUnicas.size} inscrições a mais que turmas (múltiplos alunos por turma)`
              : 'Número de inscrições e turmas balanceados',
          },
        },
        distribuicaoPorCurso: distribuicaoPorCurso,
        cursosNormalizados: cursosCategorizados.cursosNormalizados,
        cursosPorCategoria: cursosCategorizados.porCategoria,
        cursosPorSubcategoria: cursosCategorizados.porSubcategoria,
        inscricoesPorCursoNormalizado: inscricoesPorCursoNormalizado.cursosNormalizados,
        analisePorCurso: analisePorCurso,
        evolucaoTemporal: evolucaoTemporalArray,
        evolucaoSemanal: evolucaoSemanal,
        inscricoesPorLaboratorio: inscricoesPorLaboratorioArray,
        inscricoes: inscricoesDetalhadas,
        // Alunos Certificados do Lab (status = 'TWO') - DADO MAIS VALIOSO
        alunosCertificadosLab,
        totalCertificadosLab: inscricoesFinalizadas,
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
