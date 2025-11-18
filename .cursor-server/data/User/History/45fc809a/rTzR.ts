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
        oxetechwork_inscricao_alunos: {
          select: {
            id: true,
          },
        },
      },
    })

    const funilPorEdital = editais.map((edital) => {
      const inscricoes = prisma.oxetechwork_inscricao_alunos.count({
        where: { edital_id: edital.id },
      })

      return {
        edital: edital.title,
        inscricoes: edital.oxetechwork_inscricao_alunos.length,
        candidaturas: 0, // Será calculado depois
        contratacoes: 0, // Será calculado depois
      }
    })

    // Empresas com KPIs
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
      take: 50,
    })

    const empresasData = empresasComKPIs.map((empresa) => ({
      id: empresa.id,
      razao_social: empresa.razao_social,
      email: empresa.email,
      totalVagas: empresa.vagas.length,
      totalCandidaturas: empresa.vagas.reduce(
        (acc, vaga) => acc + vaga.candidaturas.length,
        0
      ),
      totalInscricoes: empresa.oxetechwork_inscricao_empresas.length,
    }))

    // Vagas por status
    const vagasPorStatus = await prisma.vagas.groupBy({
      by: ['status'],
      _count: true,
    })

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error fetching work data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work data' },
      { status: 500 }
    )
  }
}

