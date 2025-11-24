/**
 * Normalizador de Nomes de Cursos usando IA
 * 
 * Usa OpenAI para corrigir e padronizar nomes de cursos que estão
 * mal formatados, cortados ou com erros de digitação.
 */

import OpenAI from 'openai'

// Verificar se a chave da API está configurada
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY não configurada. Funcionalidade de correção de nomes via IA será desabilitada.')
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

interface CourseFixResult {
  original: string
  fixed: string
  confidence: number
  normalized: string
}

// Cache para evitar múltiplas chamadas para o mesmo curso
const courseCache = new Map<string, CourseFixResult>()

/**
 * Corrige e normaliza o nome de um curso usando IA
 */
export async function corrigirNomeCurso(
  nomeOriginal: string,
  contexto?: {
    laboratorio?: string
    dataInicio?: string
  }
): Promise<CourseFixResult> {
  // Verificar cache
  const cacheKey = nomeOriginal.toLowerCase().trim()
  if (courseCache.has(cacheKey)) {
    return courseCache.get(cacheKey)!
  }

  // Se não houver chave de API, retornar original sem correção
  if (!openai) {
    const fallback: CourseFixResult = {
      original: nomeOriginal,
      fixed: nomeOriginal,
      confidence: 0.1,
      normalized: nomeOriginal,
    }
    courseCache.set(cacheKey, fallback)
    return fallback
  }

  try {
    const prompt = `Você é um especialista em normalização de nomes de cursos de tecnologia e informática.

Tarefa: Corrija e normalize o nome do curso abaixo, que pode estar com:
- Erros de digitação
- Caracteres cortados ou faltando
- Inconsistências de capitalização
- Abreviações incorretas

Nome do curso para corrigir: "${nomeOriginal}"

${contexto?.laboratorio ? `Laboratório: ${contexto.laboratorio}` : ''}
${contexto?.dataInicio ? `Data: ${contexto.dataInicio}` : ''}

Instruções:
1. Corrija erros de digitação (ex: "Prograação" → "Programação", "Pyho" → "Python")
2. Complete nomes cortados (ex: "Infor" → "Informática")
3. Normalize capitalização (ex: "javascript" → "JavaScript")
4. Expanda abreviações comuns (ex: "JS" → "JavaScript")
5. Mantenha o sentido original do curso
6. Retorne APENAS o nome corrigido, sem explicações
7. Se o nome já estiver correto, retorne o mesmo nome

Resposta (apenas o nome corrigido):`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Você é um especialista em normalização de nomes de cursos. Retorne APENAS o nome corrigido, sem explicações ou formatação adicional.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    })

    const nomeCorrigido = response.choices[0]?.message?.content?.trim() || nomeOriginal

    const result: CourseFixResult = {
      original: nomeOriginal,
      fixed: nomeCorrigido,
      confidence: 0.9,
      normalized: nomeCorrigido, // Já vem normalizado da IA
    }

    // Armazenar no cache
    courseCache.set(cacheKey, result)

    return result
  } catch (error) {
    console.warn(`⚠️  Erro ao corrigir nome do curso "${nomeOriginal}" com IA:`, error)
    // Fallback: retornar original sem correção
    const fallback: CourseFixResult = {
      original: nomeOriginal,
      fixed: nomeOriginal,
      confidence: 0.1,
      normalized: nomeOriginal,
    }
    courseCache.set(cacheKey, fallback)
    return fallback
  }
}

/**
 * Corrige múltiplos nomes de cursos em lote
 */
export async function corrigirNomesCursos(
  nomes: string[],
  contexto?: {
    laboratorio?: string
  }
): Promise<Map<string, CourseFixResult>> {
  const resultados = new Map<string, CourseFixResult>()

  // Processar em lotes para evitar rate limit
  const batchSize = 10
  for (let i = 0; i < nomes.length; i += batchSize) {
    const batch = nomes.slice(i, i + batchSize)
    const promises = batch.map((nome) => corrigirNomeCurso(nome, contexto))
    const batchResults = await Promise.all(promises)

    batchResults.forEach((result) => {
      resultados.set(result.original.toLowerCase().trim(), result)
    })

    // Delay entre lotes para evitar rate limit
    if (i + batchSize < nomes.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return resultados
}

/**
 * Limpa o cache de correções
 */
export function limparCache(): void {
  courseCache.clear()
}

