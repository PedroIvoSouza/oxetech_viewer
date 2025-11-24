import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { normalizarNomeMunicipio, obterCoordenadas } from '@/lib/geographic-analytics'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        work: [],
        edu: [],
        lab: [],
        trilhas: [],
        total: 0,
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    // WORK: Distribuição por município
    const alunosWork = await prisma.oxetechwork_inscricao_alunos.findMany({
      select: {
        alunos: {
          select: {
            municipio: true,
          },
        },
      },
    })

    // EDU: Distribuição por município (via escola)
    const matriculasEdu = await prisma.matriculas_oxetech_edu.findMany({
      select: {
        escolas_oxetech_edu: {
          select: {
            municipio: true,
          },
        },
        alunos: {
          select: {
            municipio: true,
          },
        },
      },
    })

    // LAB: Distribuição por município (via laboratório)
    const inscricoesLab = await prisma.oxetechlab_inscricoes.findMany({
      select: {
        turmas: {
          select: {
            laboratorios: {
              select: {
                municipio: true,
              },
            },
          },
        },
        alunos: {
          select: {
            municipio: true,
          },
        },
      },
    })

    // TRILHAS: Distribuição por município
    const inscricoesTrilhas = await prisma.inscricoes_trilhas_alunos.findMany({
      select: {
        alunos: {
          select: {
            municipio: true,
          },
        },
      },
    })

    // Agrupar por município
    const municipiosMap = new Map<
      string,
      {
        work: number
        edu: number
        lab: number
        trilhas: number
      }
    >()

    // Work
    alunosWork.forEach((item) => {
      const municipio = normalizarNomeMunicipio(item.alunos?.municipio || 'Desconhecido')
      const atual = municipiosMap.get(municipio) || { work: 0, edu: 0, lab: 0, trilhas: 0 }
      atual.work++
      municipiosMap.set(municipio, atual)
    })

    // Edu
    matriculasEdu.forEach((matricula) => {
      const municipio = normalizarNomeMunicipio(
        matricula.escolas_oxetech_edu?.municipio ||
          matricula.alunos?.municipio ||
          'Desconhecido'
      )
      const atual = municipiosMap.get(municipio) || { work: 0, edu: 0, lab: 0, trilhas: 0 }
      atual.edu++
      municipiosMap.set(municipio, atual)
    })

    // Lab
    inscricoesLab.forEach((inscricao) => {
      const municipio = normalizarNomeMunicipio(
        inscricao.turmas?.laboratorios?.municipio ||
          inscricao.alunos?.municipio ||
          'Desconhecido'
      )
      const atual = municipiosMap.get(municipio) || { work: 0, edu: 0, lab: 0, trilhas: 0 }
      atual.lab++
      municipiosMap.set(municipio, atual)
    })

    // Trilhas
    inscricoesTrilhas.forEach((inscricao) => {
      const municipio = normalizarNomeMunicipio(
        inscricao.alunos?.municipio || 'Desconhecido'
      )
      const atual = municipiosMap.get(municipio) || { work: 0, edu: 0, lab: 0, trilhas: 0 }
      atual.trilhas++
      municipiosMap.set(municipio, atual)
    })

    // Converter para array com coordenadas
    const distribuicao = Array.from(municipiosMap.entries())
      .map(([municipio, dados]) => {
        const coordenadas = obterCoordenadas(municipio)
        return {
          municipio,
          work: dados.work,
          edu: dados.edu,
          lab: dados.lab,
          trilhas: dados.trilhas,
          total: dados.work + dados.edu + dados.lab + dados.trilhas,
          coordenadas: coordenadas || undefined,
        }
      })
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({
      data: {
        distribuicao,
        totalMunicipios: distribuicao.length,
        maxTotal: distribuicao.length > 0 ? distribuicao[0].total : 0,
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching geographic data:', error)
    return NextResponse.json({
      data: {
        distribuicao: [],
        totalMunicipios: 0,
        maxTotal: 0,
      },
      error: error instanceof Error ? error.message : 'Failed to fetch geographic data',
    }, { status: 200 })
  }
}

