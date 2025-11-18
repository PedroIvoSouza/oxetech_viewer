/**
 * API de Dados do Lab
 * 
 * Retorna dados agregados do CSV legado + banco de dados,
 * apresentando como uma coisa só, sem diferenciar fontes.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { categorizarCursos, normalizarCurso } from '@/lib/course-normalizer'
import { agregarDadosLab } from '@/lib/data-aggregator/lab-aggregator'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Carregar dados agregados (CSV + Banco) - apresentado como uma coisa só
    const turmasAgregadas = await agregarDadosLab(true) // Usar IA para corrigir nomes

    // Buscar inscrições do banco para dados detalhados de alunos
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

    // Estatísticas gerais baseadas em dados agregados
    const totalTurmas = turmasAgregadas.length
    const totalVagas = turmasAgregadas.reduce((acc, t) => acc + t.qtdVagasTotal, 0)
    const vagasOcupadas = turmasAgregadas.reduce((acc, t) => acc + t.qtdVagasPreenchidas, 0)
    const vagasLivres = totalVagas - vagasOcupadas
    const totalInscricoes = inscricoes.length
    const totalCertificadosLab = turmasAgregadas.reduce((acc, t) => acc + t.numFormados, 0)

    // Status de inscrições (do banco)
    const inscricoesPorStatusData = await prisma.oxetechlab_inscricoes.groupBy({
      by: ['status'],
      _count: true,
    })

    const inscricoesAtivas = inscricoesPorStatusData.reduce((acc, item) => {
      const status = String(item.status)
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

    // Distribuição por curso (usando turmas agregadas)
    const cursosMap = new Map<string, number>()
    turmasAgregadas.forEach((turma) => {
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

    // Distribuição de INSCRIÇÕES por curso (do banco)
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

    // Evolução temporal mensal (inscrições do banco)
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

    // Inscrições por laboratório (usando turmas agregadas)
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

    // Processar turmas agregadas por laboratório
    turmasAgregadas.forEach((turma) => {
      const labNome = turma.laboratorio || 'Sem laboratório'
      const curso = turma.titulo || 'Sem curso'

      if (!laboratoriosMap.has(labNome)) {
        laboratoriosMap.set(labNome, {
          nome: labNome,
          municipio: '', // Buscar do banco se necessário
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
      lab.vagasOcupadas += turma.qtdVagasPreenchidas
      lab.vagasTotal += turma.qtdVagasTotal
    })

    // Buscar municípios dos laboratórios do banco
    const laboratoriosBanco = await prisma.laboratorios.findMany({
      select: {
        nome: true,
        municipio: true,
      },
    })

    laboratoriosBanco.forEach((labBanco) => {
      const lab = laboratoriosMap.get(labBanco.nome)
      if (lab) {
        lab.municipio = labBanco.municipio
      }
    })

    // Contar inscrições por laboratório (do banco)
    inscricoes.forEach((inscricao) => {
      const labNome = inscricao.turmas?.laboratorios?.nome || 'Sem laboratório'
      const lab = laboratoriosMap.get(labNome)
      if (lab) {
        lab.totalInscricoes++
      } else {
        // Criar entrada se não existir
        laboratoriosMap.set(labNome, {
          nome: labNome,
          municipio: inscricao.turmas?.laboratorios?.municipio || '',
          totalInscricoes: 1,
          totalTurmas: 0,
          cursos: new Set(),
          vagasOcupadas: 0,
          vagasTotal: 0,
        })
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

    // Análise detalhada por curso normalizado (usando turmas agregadas)
    interface TurmaAgregada {
      titulo: string
      cursoNormalizado: string
      laboratorio: string
      qtdVagasTotal: number
      qtdVagasPreenchidas: number
      numFormados: number
    }
    const turmasNormalizadasMap = new Map<string, TurmaAgregada[]>()
    turmasAgregadas.forEach((turma) => {
      const normalizado = turma.cursoNormalizado.toLowerCase().trim()
      if (!turmasNormalizadasMap.has(normalizado)) {
        turmasNormalizadasMap.set(normalizado, [])
      }
      turmasNormalizadasMap.get(normalizado)!.push(turma)
    })

    const analisePorCurso = inscricoesPorCursoNormalizado.cursosNormalizados.map((curso) => {
      const key = curso.nomeNormalizado.toLowerCase().trim()
      const turmasDoCurso = turmasNormalizadasMap.get(key) || []

      const totalTurmas = turmasDoCurso.length
      const totalVagasCurso = turmasDoCurso.reduce((acc, t) => acc + t.qtdVagasTotal, 0)
      const vagasOcupadasCurso = turmasDoCurso.reduce((acc, t) => acc + t.qtdVagasPreenchidas, 0)
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

    // Lista detalhada de inscrições (do banco)
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

    // Alunos Certificados do Lab (usando dados agregados + banco)
    // Buscar do banco para dados detalhados, mas usar total de formados agregados
    const matriculasCertificadas = await prisma.matriculas.findMany({
      where: {
        status: 'TWO', // APROVADO = Certificado
      },
      select: {
        id: true,
        aluno_id: true,
        turma_id: true,
        inscricao_id: true,
        updated_at: true,
        created_at: true,
        status: true,
        media: true,
        percentual_faltas: true,
        certificado_id: true,
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
            laboratorios: {
              select: {
                nome: true,
              },
            },
          },
        },
        oxetechlab_inscricoes: {
          select: {
            id: true,
            status: true,
            created_at: true,
          },
        },
      },
    })

    const alunosCertificadosLab = matriculasCertificadas.map((matricula) => ({
      id: matricula.alunos?.id || null,
      aluno: matricula.alunos?.name || 'Sem nome',
      email: matricula.alunos?.email || '',
      telefone: matricula.alunos?.telefone || '',
      municipio: matricula.alunos?.municipio || '',
      curso: matricula.turmas?.titulo || 'Sem curso',
      cursoNormalizado: normalizarCurso(matricula.turmas?.titulo || 'Sem curso').nomeNormalizado,
      laboratorio: matricula.turmas?.laboratorios?.nome || 'Sem laboratório',
      dataConclusao: matricula.updated_at || matricula.created_at,
      status: String(matricula.status),
      media: matricula.media,
      percentualFaltas: matricula.percentual_faltas,
      temCertificado: !!matricula.certificado_id,
    }))

    return NextResponse.json({
      data: {
        stats: {
          totalInscricoes,
          inscricoesAtivas,
          inscricoesFinalizadas,
          inscricoesPorStatus: inscricoesPorStatusData.map((item) => ({
            status: item.status,
            total: item._count,
          })),
          mediaPorLaboratorio: Math.round(mediaPorLaboratorio),
          totalVagas,
          vagasOcupadas,
          vagasLivres,
          totalTurmas,
          // Explicação sobre cálculo (sem mencionar CSV/Banco)
          explicacao: {
            vagasCalculo: 'As vagas são calculadas usando turmas únicas, evitando duplicação.',
            inscricoesCalculo: 'As inscrições são contadas individualmente. Um aluno pode se inscrever em múltiplas turmas.',
            diferenca: totalInscricoes - totalTurmas > 0
              ? `${totalInscricoes - totalTurmas} inscrições a mais que turmas (múltiplos alunos por turma)`
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
        // Total de certificados usa dados agregados (mais completo)
        alunosCertificadosLab,
        totalCertificadosLab: totalCertificadosLab, // Total agregado (CSV + Banco)
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
