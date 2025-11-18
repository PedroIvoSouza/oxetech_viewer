/**
 * Normalizador e Categorizador de Cursos
 * 
 * Este módulo padroniza os nomes dos cursos e os categoriza para análise mais precisa
 */

export interface CursoNormalizado {
  nomeOriginal: string
  nomeNormalizado: string
  categoria: string
  subcategoria?: string
}

// Mapeamento de padrões para normalização
const padroesNormalizacao: Array<{
  pattern: RegExp
  normalizado: string
  categoria: string
  subcategoria?: string
}> = [
  // Informática Básica (deve vir primeiro para evitar match parcial)
  { pattern: /informatica\s*basica|informática\s*básica|informatica|pacote\s*office/i, normalizado: 'Informática Básica', categoria: 'Outros' },
  
  // Programação e Desenvolvimento
  { pattern: /javascript|js|node/i, normalizado: 'JavaScript/Node.js', categoria: 'Programação', subcategoria: 'Frontend' },
  { pattern: /react|reactjs/i, normalizado: 'React', categoria: 'Programação', subcategoria: 'Frontend' },
  { pattern: /python|django|flask/i, normalizado: 'Python', categoria: 'Programação', subcategoria: 'Backend' },
  { pattern: /java|spring/i, normalizado: 'Java', categoria: 'Programação', subcategoria: 'Backend' },
  { pattern: /html|css|web design/i, normalizado: 'HTML/CSS/Web Design', categoria: 'Programação', subcategoria: 'Frontend' },
  { pattern: /php|laravel/i, normalizado: 'PHP', categoria: 'Programação', subcategoria: 'Backend' },
  { pattern: /c#|\.net|dotnet/i, normalizado: 'C#/.NET', categoria: 'Programação', subcategoria: 'Backend' },
  { pattern: /ruby|rails/i, normalizado: 'Ruby/Rails', categoria: 'Programação', subcategoria: 'Backend' },
  { pattern: /go|golang/i, normalizado: 'Go', categoria: 'Programação', subcategoria: 'Backend' },
  { pattern: /mobile|android|ios|flutter|react native/i, normalizado: 'Mobile', categoria: 'Programação', subcategoria: 'Mobile' },
  { pattern: /full.?stack|fullstack/i, normalizado: 'Full Stack', categoria: 'Programação', subcategoria: 'Full Stack' },
  
  // Banco de Dados
  { pattern: /sql|mysql|postgresql|database|banco de dados/i, normalizado: 'Banco de Dados/SQL', categoria: 'Banco de Dados' },
  { pattern: /mongodb|nosql/i, normalizado: 'MongoDB/NoSQL', categoria: 'Banco de Dados' },
  
  // DevOps e Infraestrutura
  { pattern: /devops|docker|kubernetes|ci\/cd/i, normalizado: 'DevOps', categoria: 'Infraestrutura', subcategoria: 'DevOps' },
  { pattern: /cloud|aws|azure|gcp/i, normalizado: 'Cloud Computing', categoria: 'Infraestrutura', subcategoria: 'Cloud' },
  { pattern: /linux|sysadmin|redes/i, normalizado: 'Linux/Redes', categoria: 'Infraestrutura', subcategoria: 'Sistemas' },
  
  // Design e UX/UI
  { pattern: /design|ui|ux|figma|adobe/i, normalizado: 'Design/UX/UI', categoria: 'Design' },
  { pattern: /photoshop|illustrator|indesign/i, normalizado: 'Adobe Creative Suite', categoria: 'Design', subcategoria: 'Design Gráfico' },
  
  // Marketing Digital
  { pattern: /marketing digital|seo|sem|redes sociais|social media/i, normalizado: 'Marketing Digital', categoria: 'Marketing' },
  { pattern: /google ads|facebook ads|anúncios/i, normalizado: 'Marketing Pago', categoria: 'Marketing', subcategoria: 'Publicidade' },
  { pattern: /content marketing|conteúdo/i, normalizado: 'Marketing de Conteúdo', categoria: 'Marketing', subcategoria: 'Conteúdo' },
  
  // Análise de Dados
  { pattern: /data science|ciência de dados|python.*data|machine learning|ml|ia|inteligência artificial/i, normalizado: 'Data Science/IA', categoria: 'Análise de Dados', subcategoria: 'IA/ML' },
  { pattern: /excel|power bi|tableau|analytics|análise/i, normalizado: 'Análise de Dados/Business Intelligence', categoria: 'Análise de Dados', subcategoria: 'BI' },
  
  // Empreendedorismo e Negócios
  { pattern: /empreendedorismo|startup|negócios|business/i, normalizado: 'Empreendedorismo', categoria: 'Negócios' },
  { pattern: /gestão|management|administração/i, normalizado: 'Gestão', categoria: 'Negócios', subcategoria: 'Administração' },
  
  // E-commerce
  { pattern: /e.?commerce|vendas online|shopify|woocommerce/i, normalizado: 'E-commerce', categoria: 'Comércio Digital' },
  
  // Segurança
  { pattern: /cybersecurity|segurança|hacking|ethical hack/i, normalizado: 'Cybersecurity', categoria: 'Segurança' },
  
  // Game Development
  { pattern: /games|unity|unreal|desenvolvimento de jogos/i, normalizado: 'Desenvolvimento de Jogos', categoria: 'Game Development' },
]

/**
 * Remove informações desnecessárias do nome do curso (horários, dias, turnos, etc.)
 * Versão mais agressiva que agrupa variações do mesmo curso
 */
function limparNomeCurso(nome: string): string {
  let limpo = nome.trim()
  
  // Converter para minúsculas para normalização
  limpo = limpo.toLowerCase()
  
  // Remover horários (ex: "09:00", "14:30", "09h", "14h30")
  limpo = limpo.replace(/\b\d{1,2}[:h]\d{0,2}\s*(?:h(?:oras?)?|am|pm)?\b/gi, '')
  
  // Remover dias da semana (ex: "Segunda", "Terça-feira", "D25", "T25", "A25", "G25", "C25")
  limpo = limpo.replace(/\b(d|t|s|a|g|c|segunda|terça|quarta|quinta|sexta|sábado|domingo)[\s\-\.]*\d{1,3}\b/gi, '')
  
  // Remover códigos alfanuméricos com letra e número (ex: "D25", "T30", "A25", "G25", "C25", "LAB01")
  limpo = limpo.replace(/\s*[-\.]?\s*[a-z]?\d{1,3}\s*$/i, '')
  limpo = limpo.replace(/\s*[-\.]?\s*[a-z]\d{1,3}\s*/gi, ' ')
  
  // Remover turnos e variações (ex: "Manhã", "Tarde", "Noite", "M", "T", "N", "Matutino", "Vespertino")
  // IMPORTANTE: Remover variações como "- Tarde", "(tarde)", " - Manhã", etc.
  limpo = limpo.replace(/\s*[-\(\)\.]?\s*(manhã|manha|tarde|noite|vespertino|matutino|diurno|noturno|m|t|n|mat|vesp|not)\s*[-\(\)\.]?/gi, '')
  
  // Remover palavras comuns que não fazem parte do nome do curso
  limpo = limpo.replace(/\b(turma|curso|classe|aula|módulo|modulo|basico|basica)\s*\d*\b/gi, '')
  
  // Normalizar variações comuns
  // "informática básica" -> "informatica basica"
  limpo = limpo.replace(/informática/gi, 'informatica')
  limpo = limpo.replace(/programação/gi, 'programacao')
  
  // Remover múltiplos espaços, hífens e separadores
  limpo = limpo.replace(/[-–—\(\)]+/g, ' ')
  limpo = limpo.replace(/\s{2,}/g, ' ')
  
  // Remover espaços no início e fim
  limpo = limpo.trim()
  
  // Se ainda tiver separadores/hífens, remover tudo após o primeiro hífen
  // Ex: "informatica basica - tarde" -> "informatica basica"
  if (limpo.includes(' - ')) {
    limpo = limpo.split(' - ')[0].trim()
  }
  
  return limpo || nome // Se ficar vazio, retornar o original (capitalizado)
}

export function normalizarCurso(nomeOriginal: string): CursoNormalizado {
  // Primeiro limpar o nome (remover horários, dias, turnos, etc.)
  const nomeLimpo = limparNomeCurso(nomeOriginal)
  
  // Procurar padrão correspondente
  for (const padrao of padroesNormalizacao) {
    if (padrao.pattern.test(nomeLimpo)) {
      return {
        nomeOriginal: nomeOriginal,
        nomeNormalizado: padrao.normalizado,
        categoria: padrao.categoria,
        subcategoria: padrao.subcategoria,
      }
    }
  }
  
  // Se não encontrar padrão, retornar normalizado (primeira letra maiúscula)
  const palavras = nomeLimpo.toLowerCase().split(' ')
  const nomeCapitalizado = palavras
    .filter(p => p.length > 0) // Remover strings vazias
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ')
  
  return {
    nomeOriginal: nomeOriginal,
    nomeNormalizado: nomeCapitalizado || nomeOriginal,
    categoria: 'Outros',
  }
}

export function categorizarCursos(
  cursos: Array<{ curso: string; total: number }>
): {
  cursosNormalizados: Array<CursoNormalizado & { total: number }>
  porCategoria: Record<string, { total: number; cursos: string[] }>
  porSubcategoria: Record<string, { total: number; cursos: string[] }>
} {
  // MAPA para AGRUPAR cursos normalizados iguais
  const cursosAgrupados = new Map<string, CursoNormalizado & { total: number }>()
  const porCategoria: Record<string, { total: number; cursos: string[] }> = {}
  const porSubcategoria: Record<string, { total: number; cursos: string[] }> = {}
  
  // Primeiro passo: normalizar e agrupar cursos com mesmo nome normalizado
  cursos.forEach(({ curso, total }) => {
    const normalizado = normalizarCurso(curso)
    const key = normalizado.nomeNormalizado.toLowerCase().trim()
    
    // Se já existe curso com mesmo nome normalizado, SOMAR os totais
    if (cursosAgrupados.has(key)) {
      const existente = cursosAgrupados.get(key)!
      existente.total += total
      // Manter o nome original mais completo (se houver)
      if (curso.length > existente.nomeOriginal.length) {
        existente.nomeOriginal = curso
      }
    } else {
      // Criar novo curso agrupado
      cursosAgrupados.set(key, {
        ...normalizado,
        total,
      })
    }
  })
  
  // Converter mapa para array
  const cursosNormalizados = Array.from(cursosAgrupados.values())
  
  // Agrupar por categoria e subcategoria
  cursosNormalizados.forEach((curso) => {
    // Agrupar por categoria
    if (!porCategoria[curso.categoria]) {
      porCategoria[curso.categoria] = {
        total: 0,
        cursos: [],
      }
    }
    porCategoria[curso.categoria].total += curso.total
    if (!porCategoria[curso.categoria].cursos.includes(curso.nomeNormalizado)) {
      porCategoria[curso.categoria].cursos.push(curso.nomeNormalizado)
    }
    
    // Agrupar por subcategoria se existir
    if (curso.subcategoria) {
      const key = `${curso.categoria} - ${curso.subcategoria}`
      if (!porSubcategoria[key]) {
        porSubcategoria[key] = {
          total: 0,
          cursos: [],
        }
      }
      porSubcategoria[key].total += curso.total
      if (!porSubcategoria[key].cursos.includes(curso.nomeNormalizado)) {
        porSubcategoria[key].cursos.push(curso.nomeNormalizado)
      }
    }
  })
  
  return {
    cursosNormalizados: cursosNormalizados.sort((a, b) => b.total - a.total),
    porCategoria,
    porSubcategoria,
  }
}

