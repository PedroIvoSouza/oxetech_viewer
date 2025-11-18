/**
 * Script de Compatibilização de Dados Legados do Lab
 * 
 * Este script integra os dados do CSV legado com o banco de dados,
 * evitando duplicações e prevalecendo a turma com maior número de formados.
 */

import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { join } from 'path'
import { normalizarCurso } from '../lib/course-normalizer'

const prisma = new PrismaClient()

interface CSVRow {
  carimboDataHora: string
  laboratorio: string
  curso: string
  dataInicio: string
  dataEncerramento: string
  numAlunosInscritos: number
  numAlunosFormados: number
  taxaEvasao: string
}

interface TurmaNormalizada {
  laboratorioNormalizado: string
  cursoNormalizado: string
  dataInicio: Date
  dataEncerramento: Date
  numInscritos: number
  numFormados: number
  taxaEvasao: number
  fonte: 'CSV' | 'BANCO'
  turmaId?: number // Se existe no banco
  // Dados originais do CSV para referência
  original?: {
    laboratorio: string
    curso: string
    dataInicioStr: string
    dataEncerramentoStr: string
  }
}

// Mapeamento de nomes de laboratórios do CSV para o banco
const normalizarLaboratorio = (nome: string): string => {
  const mapa: Record<string, string> = {
    'maceió - centro de inovação': 'Maceió - Centro de Inovação',
    'maceio - centro de inovação': 'Maceió - Centro de Inovação',
    'maceió - benedito bentes': 'Maceió - Benedito Bentes',
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

// Parse de data brasileira (DD/MM/YYYY)
function parseDataBR(dataStr: string): Date {
  const [dia, mes, ano] = dataStr.split('/').map(Number)
  
  // Corrigir datas inválidas (ex: 03/04/1901)
  if (ano < 2000 || ano > 2100) {
    console.warn(`⚠️  Data inválida detectada: ${dataStr}. Usando data atual.`)
    return new Date()
  }
  
  return new Date(ano, mes - 1, dia)
}

// Comparar duas datas (diferença em dias)
function compararDatas(data1: Date, data2: Date, toleranciaDias: number = 30): boolean {
  const diff = Math.abs(data1.getTime() - data2.getTime())
  const diffDias = diff / (1000 * 60 * 60 * 24)
  return diffDias <= toleranciaDias
}

// Verificar se duas turmas são similares (mesmo laboratório + curso + datas próximas)
function turmasSimilares(
  turma1: TurmaNormalizada,
  turma2: TurmaNormalizada,
  toleranciaDias: number = 30
): boolean {
  return (
    turma1.laboratorioNormalizado.toLowerCase() === turma2.laboratorioNormalizado.toLowerCase() &&
    turma1.cursoNormalizado.toLowerCase() === turma2.cursoNormalizado.toLowerCase() &&
    compararDatas(turma1.dataInicio, turma2.dataInicio, toleranciaDias) &&
    compararDatas(turma1.dataEncerramento, turma2.dataEncerramento, toleranciaDias)
  )
}

// Ler e processar CSV
async function processarCSV(): Promise<TurmaNormalizada[]> {
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

  const turmas: TurmaNormalizada[] = []

  for (const row of records) {
    try {
      // Pular linhas vazias ou inválidas
      const laboratorio = row['Laboratório'] || row.laboratorio || ''
      const curso = row['Curso'] || row.curso || ''
      const dataInicioStr = row['Data de início'] || ''
      const dataEncerramentoStr = row['Data de encerramento'] || ''

      if (!laboratorio || !curso || !dataInicioStr) {
        continue
      }

      const laboratorioNormalizado = normalizarLaboratorio(laboratorio)
      const cursoNormalizadoObj = normalizarCurso(curso)
      const dataInicio = parseDataBR(dataInicioStr)
      const dataEncerramento = parseDataBR(dataEncerramentoStr)

      // Parse de números
      const numInscritosStr = row['Número de alunos inscritos'] || ''
      const numFormadosStr = row['Número de alunos formados (Certificados entregues)'] || ''
      const numInscritos = parseInt(numInscritosStr) || 0
      const numFormados = parseInt(numFormadosStr) || 0
      
      // Parse taxa de evasão (remover %)
      const taxaEvasaoStr = (row['Taxa de Evasão'] || '').replace('%', '').trim() || '0'
      const taxaEvasao = parseFloat(taxaEvasaoStr) || 0

      turmas.push({
        laboratorioNormalizado,
        cursoNormalizado: cursoNormalizadoObj.nomeNormalizado,
        dataInicio,
        dataEncerramento,
        numInscritos,
        numFormados,
        taxaEvasao,
        fonte: 'CSV',
        original: {
          laboratorio,
          curso,
          dataInicioStr,
          dataEncerramentoStr,
        },
      })
    } catch (error) {
      console.error(`Erro ao processar linha:`, row, error)
    }
  }

  return turmas
}

// Buscar turmas existentes no banco
async function buscarTurmasBanco(): Promise<Map<number, TurmaNormalizada>> {
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

  const turmasMap = new Map<number, TurmaNormalizada>()

  for (const turma of turmas) {
    const cursoNormalizadoObj = normalizarCurso(turma.titulo)
    const numFormados = turma.matriculas.length // Matrículas com status TWO

    turmasMap.set(turma.id, {
      laboratorioNormalizado: turma.laboratorios.nome,
      cursoNormalizado: cursoNormalizadoObj.nomeNormalizado,
      dataInicio: turma.data_inicio,
      dataEncerramento: turma.data_encerramento,
      numInscritos: turma.qtd_vagas_preenchidas || 0,
      numFormados,
      taxaEvasao: 0, // Calcular se necessário
      fonte: 'BANCO',
      turmaId: turma.id,
    })
  }

  return turmasMap
}

// Encontrar laboratório no banco
async function encontrarLaboratorio(nomeNormalizado: string): Promise<number | null> {
  const laboratorio = await prisma.laboratorios.findFirst({
    where: {
      nome: {
        contains: nomeNormalizado,
        mode: 'insensitive',
      },
    },
  })

  return laboratorio?.id || null
}

// Compatibilizar dados
async function compatibilizarDados() {
  console.log('🔄 Iniciando compatibilização de dados legados...\n')

  // 1. Processar CSV
  console.log('📄 Processando CSV...')
  const turmasCSV = await processarCSV()
  console.log(`✅ ${turmasCSV.length} turmas encontradas no CSV\n`)

  // 2. Buscar turmas do banco
  console.log('🔍 Buscando turmas no banco de dados...')
  const turmasBanco = await buscarTurmasBanco()
  console.log(`✅ ${turmasBanco.size} turmas encontradas no banco\n`)

  // 3. Comparar e identificar duplicatas
  console.log('🔍 Comparando turmas...')
  const turmasParaImportar: TurmaNormalizada[] = []
  const turmasParaAtualizar: Map<number, TurmaNormalizada> = new Map()
  const turmasDuplicadas: Array<{ csv: TurmaNormalizada; banco: TurmaNormalizada }> = []

  for (const turmaCSV of turmasCSV) {
    let encontrada = false

    // Procurar turma similar no banco
    for (const [turmaId, turmaBanco] of turmasBanco.entries()) {
      if (turmasSimilares(turmaCSV, turmaBanco, 30)) {
        encontrada = true
        turmasDuplicadas.push({ csv: turmaCSV, banco: turmaBanco })

        // Prevalecer a turma com maior número de formados
        if (turmaCSV.numFormados > turmaBanco.numFormados) {
          console.log(
            `⚠️  Duplicata encontrada: ${turmaCSV.laboratorioNormalizado} - ${turmaCSV.cursoNormalizado}\n` +
            `   CSV: ${turmaCSV.numFormados} formados | Banco: ${turmaBanco.numFormados} formados\n` +
            `   → CSV prevalece (mais formados)`
          )
          turmasParaAtualizar.set(turmaId, turmaCSV)
        } else {
          console.log(
            `ℹ️  Duplicata encontrada: ${turmaCSV.laboratorioNormalizado} - ${turmaCSV.cursoNormalizado}\n` +
            `   CSV: ${turmaCSV.numFormados} formados | Banco: ${turmaBanco.numFormados} formados\n` +
            `   → Banco prevalece (mais formados)`
          )
        }
        break
      }
    }

    // Se não encontrou, adicionar para importar
    if (!encontrada) {
      turmasParaImportar.push(turmaCSV)
    }
  }

  console.log(`\n📊 Resumo:`)
  console.log(`   - Turmas no CSV: ${turmasCSV.length}`)
  console.log(`   - Turmas no banco: ${turmasBanco.size}`)
  console.log(`   - Duplicatas encontradas: ${turmasDuplicadas.length}`)
  console.log(`   - Turmas para importar: ${turmasParaImportar.length}`)
  console.log(`   - Turmas para atualizar: ${turmasParaAtualizar.size}\n`)

  // 4. Gerar relatório
  console.log('📝 Gerando relatório...')
  const relatorio = {
    totalCSV: turmasCSV.length,
    totalBanco: turmasBanco.size,
    duplicatas: turmasDuplicadas.length,
    paraImportar: turmasParaImportar.length,
    paraAtualizar: turmasParaAtualizar.size,
    detalhes: {
      duplicatas: turmasDuplicadas.map((d) => ({
        laboratorio: d.csv.laboratorioNormalizado,
        curso: d.csv.cursoNormalizado,
        csvFormados: d.csv.numFormados,
        bancoFormados: d.banco.numFormados,
        prevaleceu: d.csv.numFormados > d.banco.numFormados ? 'CSV' : 'BANCO',
      })),
      paraImportar: turmasParaImportar.map((t) => ({
        laboratorio: t.laboratorioNormalizado,
        curso: t.cursoNormalizado,
        numFormados: t.numFormados,
      })),
    },
  }

  console.log('\n📋 Relatório gerado:')
  console.log(JSON.stringify(relatorio, null, 2))

  return {
    turmasParaImportar,
    turmasParaAtualizar,
    relatorio,
  }
}

// Executar script
async function main() {
  try {
    const resultado = await compatibilizarDados()

    console.log('\n✅ Compatibilização concluída!')
    console.log('\n⚠️  NOTA: Este script apenas identifica diferenças.')
    console.log('   Para importar/atualizar, execute o script de importação.\n')

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Erro:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

export { compatibilizarDados, processarCSV, buscarTurmasBanco }

