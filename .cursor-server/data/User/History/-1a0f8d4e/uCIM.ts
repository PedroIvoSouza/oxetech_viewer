/**
 * Script de Importação/Atualização de Dados Legados do Lab
 * 
 * Este script importa os dados do CSV legado para o banco de dados,
 * criando/atualizando turmas e matrículas conforme necessário.
 * 
 * USO:
 *   npx tsx scripts/importar-csv-lab.ts [--dry-run]
 * 
 * Se --dry-run for passado, apenas simula sem fazer alterações no banco.
 */

import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { join } from 'path'
import { normalizarCurso } from '../lib/course-normalizer'
import { compatibilizarDados, processarCSV, buscarTurmasBanco } from './compatibilizar-csv-lab'

const prisma = new PrismaClient()

interface TurmaNormalizada {
  laboratorioNormalizado: string
  cursoNormalizado: string
  dataInicio: Date
  dataEncerramento: Date
  numInscritos: number
  numFormados: number
  taxaEvasao: number
  fonte: 'CSV' | 'BANCO'
  turmaId?: number
  // Dados originais do CSV para referência
  original?: {
    laboratorio: string
    curso: string
    dataInicioStr: string
    dataEncerramentoStr: string
  }
}

// Encontrar ou criar laboratório
async function encontrarOuCriarLaboratorio(
  nomeNormalizado: string,
  dryRun: boolean = false
): Promise<number> {
  let laboratorio = await prisma.laboratorios.findFirst({
    where: {
      nome: {
        contains: nomeNormalizado,
        mode: 'insensitive',
      },
    },
  })

  if (!laboratorio) {
    console.log(`   ⚠️  Laboratório "${nomeNormalizado}" não encontrado. Criando...`)
    
    if (dryRun) {
      console.log(`   [DRY-RUN] Criaria laboratório: ${nomeNormalizado}`)
      return -1 // ID fictício para dry-run
    }

    // Buscar coordenador padrão (primeiro aluno ou criar placeholder)
    const coordenadorPadrao = await prisma.alunos.findFirst()
    if (!coordenadorPadrao) {
      throw new Error('Nenhum aluno encontrado. É necessário ter pelo menos um aluno no banco.')
    }

    laboratorio = await prisma.laboratorios.create({
      data: {
        nome: nomeNormalizado,
        municipio: nomeNormalizado.includes('Maceió') ? 'Maceió' : nomeNormalizado.split(' - ')[0] || nomeNormalizado,
        rua: 'A definir',
        bairro: 'A definir',
        numero: '0',
        cep: '57000000',
        complemento: '',
        coordenador_id: coordenadorPadrao.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    console.log(`   ✅ Laboratório criado: ${laboratorio.nome} (ID: ${laboratorio.id})`)
  }

  return laboratorio.id
}

// Encontrar ou criar turma
async function encontrarOuCriarTurma(
  turmaCSV: TurmaNormalizada,
  laboratorioId: number,
  dryRun: boolean = false
): Promise<number> {
  // Buscar turma existente similar
  const turmasExistentes = await prisma.turmas.findMany({
    where: {
      laboratorio_id: laboratorioId,
      titulo: {
        contains: turmaCSV.cursoNormalizado,
        mode: 'insensitive',
      },
      data_inicio: {
        gte: new Date(turmaCSV.dataInicio.getTime() - 30 * 24 * 60 * 60 * 1000), // -30 dias
        lte: new Date(turmaCSV.dataInicio.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 dias
      },
    },
    include: {
      matriculas: {
        where: {
          status: 'TWO', // APROVADO
        },
      },
    },
  })

  // Verificar se existe turma similar
  let turmaExistente = turmasExistentes.find((t) => {
    const diffInicio = Math.abs(t.data_inicio.getTime() - turmaCSV.dataInicio.getTime()) / (1000 * 60 * 60 * 24)
    const diffFim = Math.abs(t.data_encerramento.getTime() - turmaCSV.dataEncerramento.getTime()) / (1000 * 60 * 60 * 24)
    return diffInicio <= 30 && diffFim <= 30
  })

  if (turmaExistente) {
    const numFormadosBanco = turmaExistente.matriculas.length

    // Se CSV tem mais formados, precisamos atualizar (mas não atualizamos a turma em si,
    // apenas criamos as matrículas faltantes)
    if (turmaCSV.numFormados > numFormadosBanco) {
      console.log(
        `   ⚠️  Turma existente encontrada (ID: ${turmaExistente.id}), mas CSV tem mais formados.\n` +
        `      Banco: ${numFormadosBanco} | CSV: ${turmaCSV.numFormados}\n` +
        `      → Será necessário criar ${turmaCSV.numFormados - numFormadosBanco} matrículas adicionais.`
      )
      return turmaExistente.id
    }

    console.log(`   ℹ️  Turma existente encontrada (ID: ${turmaExistente.id}) - mantendo dados do banco`)
    return turmaExistente.id
  }

  // Criar nova turma
  console.log(`   ➕ Criando nova turma: ${turmaCSV.cursoNormalizado}`)

  if (dryRun) {
    console.log(`   [DRY-RUN] Criaria turma: ${turmaCSV.cursoNormalizado}`)
    return -1
  }

  const novaTurma = await prisma.turmas.create({
    data: {
      titulo: turmaCSV.original?.curso || turmaCSV.cursoNormalizado,
      descricao: `Turma importada do CSV legado`,
      info_adicionais: `Fonte: CSV legado | Inscritos: ${turmaCSV.numInscritos} | Formados: ${turmaCSV.numFormados}`,
      data_inicio: turmaCSV.dataInicio,
      data_encerramento: turmaCSV.dataEncerramento,
      data_encerramento_inscricoes: turmaCSV.dataEncerramento,
      status: 'ZERO', // Ativa
      qtd_vagas_total: turmaCSV.numInscritos,
      qtd_vagas_preenchidas: turmaCSV.numInscritos,
      qtd_vagas_disponiveis: 0,
      carga_horaria: 40, // Valor padrão - ajustar se necessário
      qtd_aulas: 10, // Valor padrão - ajustar se necessário
      perguntas: [],
      laboratorio_id: laboratorioId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  console.log(`   ✅ Turma criada: ${novaTurma.titulo} (ID: ${novaTurma.id})`)
  return novaTurma.id
}

// Importar/Atualizar dados
async function importarDados(dryRun: boolean = false) {
  console.log('🔄 Iniciando importação de dados legados...\n')
  
  if (dryRun) {
    console.log('⚠️  MODO DRY-RUN: Nenhuma alteração será feita no banco de dados\n')
  }

  // 1. Compatibilizar dados
  const { turmasParaImportar, turmasParaAtualizar, relatorio } = await compatibilizarDados()

  console.log('\n' + '='.repeat(60))
  console.log('📥 INICIANDO IMPORTAÇÃO')
  console.log('='.repeat(60) + '\n')

  let turmasCriadas = 0
  let turmasAtualizadas = 0
  let erros = 0

  // 2. Processar turmas para importar
  console.log(`\n📦 Importando ${turmasParaImportar.length} novas turmas...\n`)

  for (const turmaCSV of turmasParaImportar) {
    try {
      console.log(`\n📝 Processando: ${turmaCSV.laboratorioNormalizado} - ${turmaCSV.cursoNormalizado}`)

      // Encontrar ou criar laboratório
      const laboratorioId = await encontrarOuCriarLaboratorio(
        turmaCSV.laboratorioNormalizado,
        dryRun
      )

      if (laboratorioId === -1 && dryRun) {
        turmasCriadas++
        continue
      }

      // Encontrar ou criar turma
      const turmaId = await encontrarOuCriarTurma(turmaCSV, laboratorioId, dryRun)

      if (turmaId !== -1) {
        turmasCriadas++
      }

      // NOTA: Para criar matrículas, seria necessário ter dados dos alunos no CSV.
      // Como o CSV só tem números agregados, não podemos criar matrículas individuais.
      // Isso precisaria ser feito manualmente ou com outro arquivo CSV com dados de alunos.
      console.log(
        `   ⚠️  NOTA: Matrículas não podem ser criadas automaticamente sem dados dos alunos.\n` +
        `      Turma criada/atualizada com ${turmaCSV.numFormados} formados registrados no CSV.`
      )
    } catch (error) {
      console.error(`   ❌ Erro ao processar turma:`, error)
      erros++
    }
  }

  // 3. Processar turmas para atualizar (já foi feito na compatibilização, apenas logar)
  console.log(`\n📝 Turmas para atualizar: ${turmasParaAtualizar.size}`)
  console.log('   ℹ️  Turmas duplicadas foram analisadas na fase de compatibilização.')
  console.log('   ℹ️  Para criar matrículas adicionais, use dados dos alunos individuais.')

  // Resumo final
  console.log('\n' + '='.repeat(60))
  console.log('✅ IMPORTAÇÃO CONCLUÍDA')
  console.log('='.repeat(60))
  console.log(`   Turmas criadas: ${turmasCriadas}`)
  console.log(`   Turmas atualizadas: ${turmasParaAtualizar.size}`)
  console.log(`   Erros: ${erros}`)
  
  if (dryRun) {
    console.log('\n⚠️  MODO DRY-RUN: Nenhuma alteração foi feita no banco de dados')
    console.log('   Execute sem --dry-run para aplicar as mudanças.')
  }

  console.log('')
}

// Executar script
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  try {
    await importarDados(dryRun)
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

export { importarDados }

