/**
 * Agregador de Dados do Lab
 * 
 * Esta camada agrega dados do CSV legado com os dados do banco de dados,
 * SEM alterar o banco original. Toda a compatibilização é feita em memória.
 */

import { prisma } from '@/lib/db'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { join } from 'path'
import { normalizarCurso } from '@/lib/course-normalizer'
import { corrigirNomesCursos } from '@/lib/ai/course-name-fixer'

interface TurmaCSV {
  laboratorioNormalizado: string
  cursoNormalizado: string
  cursoOriginal: string
  dataInicio: Date
  dataEncerramento: Date
  numInscritos: number // Matriculados
  numFormados: number
  taxaEvasao: number
  fonte: 'CSV'
}

interface TurmaBanco {
  id: number
  titulo: string
  laboratorio: string
  dataInicio: Date
  dataEncerramento: Date
  qtdVagasTotal: number
  qtdVagasPreenchidas: number
  numFormados: number
  fonte: 'BANCO'
}

interface TurmaAgregada {
  id?: number // ID do banco se existir
  titulo: string
  cursoNormalizado: string
  laboratorio: string
  dataInicio: Date
  dataEncerramento: Date
  qtdVagasTotal: number
  qtdVagasPreenchidas: number // Matriculados
  numFormados: number
  taxaEvasao?: number
  fontes: ('CSV' | 'BANCO')[]
  prevalencia: 'CSV' | 'BANCO' | 'AMBOS'
}

// Normalizar laboratório
function normalizarLaboratorio(nome: string): string {
  const mapa: Record<string, string> = {
    'maceio - centro de inovação': 'Maceió - Centro de Inovação',
    'maceio - benedito bentes': 'Maceió - Benedito Bentes',
    'santana do ipanema': 'Santana do Ipanema',
    'são miguel dos campos': 'São Miguel dos Campos',
    'sao miguel dos campos': 'São Miguel dos Campos',
    'pão de açucar': 'Pão de Açucar',
    'pao de açucar': 'Pão de Açucar',
    'pão de acucar': 'Pão de Açucar',
    'pao de acucar': 'Pão de Açucar',
  }
  const normalizado = nome.trim().toLowerCase()
  return mapa[normalizado] || nome.trim()
}

// Parse de data brasileira
function parseDataBR(dataStr: string): Date {
  const [dia, mes, ano] = dataStr.split('/').map(Number)
  if (ano < 2000 || ano > 2100) {
    return new Date()
  }
  return new Date(ano, mes - 1, dia)
}

// Comparar datas (tolerância de 30 dias)
function compararDatas(data1: Date, data2: Date, toleranciaDias: number = 30): boolean {
  const diff = Math.abs(data1.getTime() - data2.getTime())
  const diffDias = diff / (1000 * 60 * 60 * 24)
  return diffDias <= toleranciaDias
}

// Verificar se duas turmas são similares
function turmasSimilares(
  turma1: TurmaCSV | TurmaBanco,
  turma2: TurmaCSV | TurmaBanco,
  toleranciaDias: number = 30
): boolean {
  const lab1 = 'laboratorioNormalizado' in turma1 ? turma1.laboratorioNormalizado : turma1.laboratorio
  const lab2 = 'laboratorioNormalizado' in turma2 ? turma2.laboratorioNormalizado : turma2.laboratorio
  const curso1 = 'cursoNormalizado' in turma1 ? turma1.cursoNormalizado : normalizarCurso(turma1.titulo).nomeNormalizado
  const curso2 = 'cursoNormalizado' in turma2 ? turma2.cursoNormalizado : normalizarCurso(turma2.titulo).nomeNormalizado

  return (
    lab1.toLowerCase() === lab2.toLowerCase() &&
    curso1.toLowerCase() === curso2.toLowerCase() &&
    compararDatas(turma1.dataInicio, turma2.dataInicio, toleranciaDias) &&
    compararDatas(turma1.dataEncerramento, turma2.dataEncerramento, toleranciaDias)
  )
}

// Carregar dados do CSV
let cacheCSV: TurmaCSV[] | null = null

async function carregarDadosCSV(usarIA: boolean = true): Promise<TurmaCSV[]> {
  if (cacheCSV) {
    return cacheCSV
  }

  const csvPath = join(process.cwd(), 'docs', 'Dashboard - OxeTech lab - Respostas ao formulário 1.csv')
  const csvContent = readFileSync(csvPath, 'utf-8')

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Record<string, string>[]

  // Coletar cursos únicos para correção com IA
  const cursosUnicos = new Set<string>()
  const dadosLinhas: Array<{
    row: Record<string, string>
    laboratorio: string
    curso: string
    dataInicioStr: string
    dataEncerramentoStr: string
  }> = []

  for (const row of records) {
    const laboratorio = row['Laboratório'] || row.laboratorio || ''
    const curso = row['Curso'] || row.curso || ''
    const dataInicioStr = row['Data de início'] || ''

    if (!laboratorio || !curso || !dataInicioStr) {
      continue
    }

    cursosUnicos.add(curso)
    dadosLinhas.push({
      row,
      laboratorio,
      curso,
      dataInicioStr,
      dataEncerramentoStr: row['Data de encerramento'] || '',
    })
  }

  // Corrigir nomes com IA
  const correcoesMap = usarIA
    ? await corrigirNomesCursos(Array.from(cursosUnicos))
    : new Map<string, any>()

  // Processar linhas
  const turmas: TurmaCSV[] = []

  for (const { row, laboratorio, curso, dataInicioStr, dataEncerramentoStr } of dadosLinhas) {
    try {
      const laboratorioNormalizado = normalizarLaboratorio(laboratorio)
      const cursoCorrigido = correcoesMap.get(curso.toLowerCase().trim())?.fixed || curso
      const cursoNormalizadoObj = normalizarCurso(cursoCorrigido)

      const dataInicio = parseDataBR(dataInicioStr)
      const dataEncerramento = parseDataBR(dataEncerramentoStr)

      const numInscritos = parseInt(row['Número de alunos inscritos'] || '0') || 0
      const numFormados = parseInt(row['Número de alunos formados (Certificados entregues)'] || '0') || 0
      const taxaEvasaoStr = (row['Taxa de Evasão'] || '').replace('%', '').trim() || '0'
      const taxaEvasao = parseFloat(taxaEvasaoStr) || 0

      turmas.push({
        laboratorioNormalizado,
        cursoNormalizado: cursoNormalizadoObj.nomeNormalizado,
        cursoOriginal: cursoCorrigido,
        dataInicio,
        dataEncerramento,
        numInscritos,
        numFormados,
        taxaEvasao,
        fonte: 'CSV',
      })
    } catch (error) {
      console.error(`Erro ao processar linha CSV:`, error)
    }
  }

  cacheCSV = turmas
  return turmas
}

// Carregar dados do banco
async function carregarDadosBanco(): Promise<TurmaBanco[]> {
  const turmas = await prisma.turmas.findMany({
    include: {
      laboratorios: {
        select: {
          nome: true,
        },
      },
      matriculas: {
        where: {
          status: 'TWO', // APROVADO = Certificado
        },
      },
    },
  })

  return turmas.map((turma) => ({
    id: turma.id,
    titulo: turma.titulo,
    laboratorio: turma.laboratorios.nome,
    dataInicio: turma.data_inicio,
    dataEncerramento: turma.data_encerramento,
    qtdVagasTotal: turma.qtd_vagas_total,
    qtdVagasPreenchidas: turma.qtd_vagas_preenchidas,
    numFormados: turma.matriculas.length,
    fonte: 'BANCO',
  }))
}

// Agregar dados do CSV e banco
export async function agregarDadosLab(usarIA: boolean = true): Promise<TurmaAgregada[]> {
  console.log('🔄 Agregando dados do CSV legado com dados do banco...')

  // Carregar dados
  const [turmasCSV, turmasBanco] = await Promise.all([
    carregarDadosCSV(usarIA),
    carregarDadosBanco(),
  ])

  const turmasAgregadas = new Map<string, TurmaAgregada>()

  // Processar turmas do banco (base)
  for (const turmaBanco of turmasBanco) {
    const cursoNormalizado = normalizarCurso(turmaBanco.titulo).nomeNormalizado
    const key = `${turmaBanco.laboratorio.toLowerCase()}_${cursoNormalizado.toLowerCase()}_${turmaBanco.dataInicio.toISOString()}`

    turmasAgregadas.set(key, {
      id: turmaBanco.id,
      titulo: turmaBanco.titulo,
      cursoNormalizado,
      laboratorio: turmaBanco.laboratorio,
      dataInicio: turmaBanco.dataInicio,
      dataEncerramento: turmaBanco.dataEncerramento,
      qtdVagasTotal: turmaBanco.qtdVagasTotal,
      qtdVagasPreenchidas: turmaBanco.qtdVagasPreenchidas,
      numFormados: turmaBanco.numFormados,
      fontes: ['BANCO'],
      prevalencia: 'BANCO',
    })
  }

  // Processar turmas do CSV e fazer merge
  for (const turmaCSV of turmasCSV) {
    // Procurar turma similar no banco
    let encontrada = false
    let chaveEncontrada: string | null = null

    for (const [key, turmaAgregada] of turmasAgregadas.entries()) {
      const turmaComparar: TurmaBanco = {
        id: turmaAgregada.id || 0,
        titulo: turmaAgregada.titulo,
        laboratorio: turmaAgregada.laboratorio,
        dataInicio: turmaAgregada.dataInicio,
        dataEncerramento: turmaAgregada.dataEncerramento,
        qtdVagasTotal: turmaAgregada.qtdVagasTotal,
        qtdVagasPreenchidas: turmaAgregada.qtdVagasPreenchidas,
        numFormados: turmaAgregada.numFormados,
        fonte: 'BANCO',
      }

      if (turmasSimilares(turmaCSV, turmaComparar)) {
        encontrada = true
        chaveEncontrada = key

        // Prevalência: usar dados da turma com maior número de formados
        const prevalencia = turmaCSV.numFormados > turmaAgregada.numFormados ? 'CSV' : 'BANCO'

        if (prevalencia === 'CSV') {
          // Atualizar com dados do CSV (que tem mais formados)
          turmasAgregadas.set(key, {
            ...turmaAgregada,
            titulo: turmaCSV.cursoOriginal, // Usar nome corrigido do CSV
            qtdVagasTotal: Math.max(turmaCSV.numInscritos, turmaCSV.numFormados),
            qtdVagasPreenchidas: turmaCSV.numInscritos,
            numFormados: turmaCSV.numFormados,
            taxaEvasao: turmaCSV.taxaEvasao,
            fontes: ['BANCO', 'CSV'],
            prevalencia: 'CSV',
          })
        } else {
          // Manter dados do banco, mas adicionar CSV nas fontes
          turmasAgregadas.set(key, {
            ...turmaAgregada,
            fontes: ['BANCO', 'CSV'],
            prevalencia: 'BANCO',
          })
        }
        break
      }
    }

    // Se não encontrou, adicionar como nova turma do CSV
    if (!encontrada) {
      const key = `${turmaCSV.laboratorioNormalizado.toLowerCase()}_${turmaCSV.cursoNormalizado.toLowerCase()}_${turmaCSV.dataInicio.toISOString()}`

      turmasAgregadas.set(key, {
        titulo: turmaCSV.cursoOriginal,
        cursoNormalizado: turmaCSV.cursoNormalizado,
        laboratorio: turmaCSV.laboratorioNormalizado,
        dataInicio: turmaCSV.dataInicio,
        dataEncerramento: turmaCSV.dataEncerramento,
        qtdVagasTotal: Math.max(turmaCSV.numInscritos, turmaCSV.numFormados),
        qtdVagasPreenchidas: turmaCSV.numInscritos,
        numFormados: turmaCSV.numFormados,
        taxaEvasao: turmaCSV.taxaEvasao,
        fontes: ['CSV'],
        prevalencia: 'CSV',
      })
    }
  }

  return Array.from(turmasAgregadas.values())
}

// Limpar cache do CSV
export function limparCacheCSV(): void {
  cacheCSV = null
}

