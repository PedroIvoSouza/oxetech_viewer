import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { categorizarCursos } from '@/lib/course-normalizer'
import { normalizarNomeMunicipio } from '@/lib/geographic-analytics'
import { isPrismaAvailable } from '@/lib/utils/prisma-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Verificar se Prisma está disponível
  if (!isPrismaAvailable()) {
    return NextResponse.json({
      data: {
        stats: {
          totalCertificadosWork: 0,
          totalCertificadosEdu: 0,
          totalCertificadosTrilhas: 0,
          totalCertificadosLab: 0,
          totalCertificados: 0,
          totalAlunosCertificados: 0,
          alunosComMultiplosCertificados: 0,
        },
        alunosCertificados: [],
        distribuicaoMunicipio: [],
        distribuicaoPrograma: {},
        detalhesPorPrograma: {
          Work: [],
          Edu: [],
          Trilhas: [],
          Lab: [],
        },
      },
      error: 'DATABASE_URL não configurada',
    }, { status: 200 })
  }

  try {
    // WORK: Alunos contratados (certificados)
    const contratados = await prisma.contratacoes.findMany({
      select: {
        id: true,
        created_at: true,
        candidaturas: {
          select: {
            aluno_id: true,
            alunos: {
              select: {
                id: true,
                name: true,
                email: true,
                telefone: true,
                municipio: true,
              },
            },
          },
        },
      },
    })

    const alunosCertificadosWork = contratados.map((c) => ({
      id: c.candidaturas?.aluno_id,
      aluno: c.candidaturas?.alunos?.name || 'Sem nome',
      email: c.candidaturas?.alunos?.email || '',
      telefone: c.candidaturas?.alunos?.telefone || '',
      municipio: normalizarNomeMunicipio(c.candidaturas?.alunos?.municipio || ''),
      programa: 'Work',
      certificacao: c.created_at,
      detalhes: `Contratação realizada`,
    }))

    // EDU: Alunos com status de conclusão (considerar status diferente de inicial)
    const matriculasEdu = await prisma.matriculas_oxetech_edu.findMany({
      where: {
        status: {
          not: 'ZERO', // Status diferente de inicial pode indicar conclusão
        },
      },
      select: {
        id: true,
        status: true,
        alunos: {
          select: {
            id: true,
            name: true,
            email: true,
            telefone: true,
            municipio: true,
          },
        },
        escolas_oxetech_edu: {
          select: {
            nome: true,
            municipio: true,
          },
        },
        inscricoes_turmas_oxetech_edu: {
          select: {
            turmas_oxetech_edu: {
              select: {
                titulo: true,
              },
            },
          },
          take: 1,
        },
      },
    })

    const alunosCertificadosEdu = matriculasEdu.map((m) => ({
      id: m.alunos?.id,
      aluno: m.alunos?.name || 'Sem nome',
      email: m.alunos?.email || '',
      telefone: m.alunos?.telefone || '',
      municipio: normalizarNomeMunicipio(m.alunos?.municipio || ''),
      programa: 'Edu',
      certificacao: new Date(), // Usar created_at se disponível
      detalhes: `Curso: ${m.inscricoes_turmas_oxetech_edu[0]?.turmas_oxetech_edu?.titulo || 'N/A'} | Escola: ${m.escolas_oxetech_edu?.nome || 'N/A'}`,
    }))

    // TRILHAS: Alunos que concluíram trilhas
    const trilhasConcluidas = await prisma.inscricoes_trilhas_alunos.findMany({
      where: {
        concluido: true,
      },
      select: {
        id: true,
        aluno_id: true,
        concluido: true,
        alunos: {
          select: {
            id: true,
            name: true,
            email: true,
            telefone: true,
            municipio: true,
          },
        },
        trilhas_de_conhecimento: {
          select: {
            titulo: true,
          },
        },
      },
    })

    const alunosCertificadosTrilhas = trilhasConcluidas.map((t) => ({
      id: t.aluno_id,
      aluno: t.alunos?.name || 'Sem nome',
      email: t.alunos?.email || '',
      telefone: t.alunos?.telefone || '',
      municipio: normalizarNomeMunicipio(t.alunos?.municipio || ''),
      programa: 'Trilhas',
      certificacao: new Date(), // Usar created_at se disponível
      detalhes: `Trilha: ${t.trilhas_de_conhecimento?.titulo || 'N/A'}`,
    }))

    // LAB: Alunos certificados (status TWO = APROVADO na tabela matriculas)
    // CORRIGIDO: Certificados Lab vêm da tabela matriculas (status TWO = APROVADO)
    const matriculasCertificadasLab = await prisma.matriculas.findMany({
      where: {
        status: 'TWO', // APROVADO = Certificado
      },
      select: {
        id: true,
        aluno_id: true,
        updated_at: true,
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
            titulo: true,
            laboratorios: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    })

    const alunosCertificadosLab = matriculasCertificadasLab.map((m) => ({
      id: m.aluno_id,
      aluno: m.alunos?.name || 'Sem nome',
      email: m.alunos?.email || '',
      telefone: m.alunos?.telefone || '',
      municipio: normalizarNomeMunicipio(m.alunos?.municipio || ''),
      programa: 'Lab',
      certificacao: m.updated_at || new Date(),
      detalhes: `Curso: ${m.turmas?.titulo || 'N/A'} | Laboratório: ${m.turmas?.laboratorios?.nome || 'N/A'}${m.media ? ` | Média: ${m.media.toFixed(1)}` : ''}${m.certificado_id ? ' | Certificado gerado' : ''}`,
    }))

    // Consolidar todos os certificados
    const todosCertificados = [
      ...alunosCertificadosWork,
      ...alunosCertificadosEdu,
      ...alunosCertificadosTrilhas,
      ...alunosCertificadosLab,
    ]

    // Agrupar por aluno (um aluno pode ter múltiplos certificados)
    const alunosUnicosMap = new Map<number, {
      id: number | undefined | null
      aluno: string
      email: string
      telefone: string
      municipio: string
      programas: string[]
      totalCertificados: number
      certificacoes: Array<{
        programa: string
        detalhes: string
        data: Date
      }>
    }>()

    todosCertificados.forEach((cert) => {
      const alunoId = cert.id || 0
      if (!alunosUnicosMap.has(alunoId)) {
        alunosUnicosMap.set(alunoId, {
          id: cert.id || undefined,
          aluno: cert.aluno,
          email: cert.email,
          telefone: cert.telefone,
          municipio: cert.municipio,
          programas: [],
          totalCertificados: 0,
          certificacoes: [],
        })
      }
      const aluno = alunosUnicosMap.get(alunoId)!
      if (!aluno.programas.includes(cert.programa)) {
        aluno.programas.push(cert.programa)
      }
      aluno.totalCertificados++
      aluno.certificacoes.push({
        programa: cert.programa,
        detalhes: cert.detalhes,
        data: cert.certificacao,
      })
    })

    const alunosUnicos = Array.from(alunosUnicosMap.values())
      .sort((a, b) => b.totalCertificados - a.totalCertificados)

    // Estatísticas gerais
    const stats = {
      totalCertificadosWork: alunosCertificadosWork.length,
      totalCertificadosEdu: alunosCertificadosEdu.length,
      totalCertificadosTrilhas: alunosCertificadosTrilhas.length,
      totalCertificadosLab: alunosCertificadosLab.length,
      totalCertificados: todosCertificados.length,
      totalAlunosCertificados: alunosUnicos.length,
      alunosComMultiplosCertificados: alunosUnicos.filter(a => a.totalCertificados > 1).length,
    }

    // Distribuição por município
    const porMunicipio = alunosUnicos.reduce((acc, aluno) => {
      const municipio = aluno.municipio || 'Desconhecido'
      acc[municipio] = (acc[municipio] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const distribuicaoMunicipio = Object.entries(porMunicipio)
      .map(([municipio, total]) => ({ municipio, total }))
      .sort((a, b) => b.total - a.total)

    // Distribuição por programa
    const distribuicaoPrograma = {
      Work: stats.totalCertificadosWork,
      Edu: stats.totalCertificadosEdu,
      Trilhas: stats.totalCertificadosTrilhas,
      Lab: stats.totalCertificadosLab,
    }

    return NextResponse.json({
      data: {
        stats,
        alunosCertificados: alunosUnicos,
        distribuicaoMunicipio,
        distribuicaoPrograma,
        detalhesPorPrograma: {
          Work: alunosCertificadosWork,
          Edu: alunosCertificadosEdu,
          Trilhas: alunosCertificadosTrilhas,
          Lab: alunosCertificadosLab,
        },
      },
      error: null,
    })
  } catch (error) {
    console.error('Error fetching certificados data:', error)
    return NextResponse.json({
      data: {
        stats: {
          totalCertificadosWork: 0,
          totalCertificadosEdu: 0,
          totalCertificadosTrilhas: 0,
          totalCertificadosLab: 0,
          totalCertificados: 0,
          totalAlunosCertificados: 0,
          alunosComMultiplosCertificados: 0,
        },
        alunosCertificados: [],
        distribuicaoMunicipio: [],
        distribuicaoPrograma: {},
        detalhesPorPrograma: {
          Work: [],
          Edu: [],
          Trilhas: [],
          Lab: [],
        },
      },
      error: error instanceof Error ? error.message : 'Failed to fetch certificados data',
    }, { status: 200 })
  }
}

