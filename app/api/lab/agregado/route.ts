/**
 * API de Dados Agregados do Lab
 * 
 * Retorna dados agregados do CSV legado + banco de dados,
 * SEM alterar o banco original.
 */

import { NextResponse } from 'next/server'
import { agregarDadosLab } from '@/lib/data-aggregator/lab-aggregator'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        stats: {
          totalTurmas: 0,
          totalInscritos: 0,
          totalFormados: 0,
          totalVagas: 0,
        },
        porLaboratorio: {},
        porCurso: {},
        turmas: [],
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const usarIA = searchParams.get('sem-ia') !== 'true'

    const turmasAgregadas = await agregarDadosLab(usarIA)

    // Calcular estatísticas agregadas
    const totalTurmas = turmasAgregadas.length
    const totalInscritos = turmasAgregadas.reduce((acc, t) => acc + t.qtdVagasPreenchidas, 0)
    const totalFormados = turmasAgregadas.reduce((acc, t) => acc + t.numFormados, 0)
    const totalVagas = turmasAgregadas.reduce((acc, t) => acc + t.qtdVagasTotal, 0)

    // Agrupar por laboratório
    const porLaboratorio = turmasAgregadas.reduce((acc, turma) => {
      const lab = turma.laboratorio
      if (!acc[lab]) {
        acc[lab] = {
          laboratorio: lab,
          totalTurmas: 0,
          totalInscritos: 0,
          totalFormados: 0,
          totalVagas: 0,
          turmas: [],
        }
      }
      acc[lab].totalTurmas++
      acc[lab].totalInscritos += turma.qtdVagasPreenchidas
      acc[lab].totalFormados += turma.numFormados
      acc[lab].totalVagas += turma.qtdVagasTotal
      acc[lab].turmas.push(turma)
      return acc
    }, {} as Record<string, any>)

    // Agrupar por curso
    const porCurso = turmasAgregadas.reduce((acc, turma) => {
      const curso = turma.cursoNormalizado
      if (!acc[curso]) {
        acc[curso] = {
          curso,
          totalTurmas: 0,
          totalInscritos: 0,
          totalFormados: 0,
          totalVagas: 0,
          turmas: [],
        }
      }
      acc[curso].totalTurmas++
      acc[curso].totalInscritos += turma.qtdVagasPreenchidas
      acc[curso].totalFormados += turma.numFormados
      acc[curso].totalVagas += turma.qtdVagasTotal
      acc[curso].turmas.push(turma)
      return acc
    }, {} as Record<string, any>)

    // Estatísticas de fontes
    const turmasApenasBanco = turmasAgregadas.filter((t) => t.fontes.length === 1 && t.fontes[0] === 'BANCO').length
    const turmasApenasCSV = turmasAgregadas.filter((t) => t.fontes.length === 1 && t.fontes[0] === 'CSV').length
    const turmasAmbas = turmasAgregadas.filter((t) => t.fontes.length === 2).length

    return NextResponse.json({
      data: {
        estatisticas: {
          totalTurmas,
          totalInscritos,
          totalFormados,
          totalVagas,
          taxaEvasao: totalInscritos > 0 ? ((totalInscritos - totalFormados) / totalInscritos) * 100 : 0,
          porFonte: {
            apenasBanco: turmasApenasBanco,
            apenasCSV: turmasApenasCSV,
            ambas: turmasAmbas,
          },
        },
        turmas: turmasAgregadas,
        porLaboratorio: Object.values(porLaboratorio),
        porCurso: Object.values(porCurso),
      },
      error: null,
    })
  } catch (error: any) {
    console.error('Error aggregating lab data:', error)
    return NextResponse.json({
      data: {
        estatisticas: {
          totalTurmas: 0,
          totalInscritos: 0,
          totalFormados: 0,
          totalVagas: 0,
          taxaEvasao: 0,
          porFonte: {
            apenasBanco: 0,
            apenasCSV: 0,
            ambas: 0,
          },
        },
        turmas: [],
        porLaboratorio: [],
        porCurso: [],
      },
      error: error?.message || 'Failed to aggregate lab data',
    }, { status: 200 })
  }
}

