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

export function normalizarCurso(nomeOriginal: string): CursoNormalizado {
  // Limpar espaços extras e caracteres especiais
  const nomeLimpo = nomeOriginal.trim().replace(/\s+/g, ' ')
  
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
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ')
  
  return {
    nomeOriginal: nomeOriginal,
    nomeNormalizado: nomeCapitalizado,
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
  const cursosNormalizados: Array<CursoNormalizado & { total: number }> = []
  const porCategoria: Record<string, { total: number; cursos: string[] }> = {}
  const porSubcategoria: Record<string, { total: number; cursos: string[] }> = {}
  
  cursos.forEach(({ curso, total }) => {
    const normalizado = normalizarCurso(curso)
    
    cursosNormalizados.push({
      ...normalizado,
      total,
    })
    
    // Agrupar por categoria
    if (!porCategoria[normalizado.categoria]) {
      porCategoria[normalizado.categoria] = {
        total: 0,
        cursos: [],
      }
    }
    porCategoria[normalizado.categoria].total += total
    if (!porCategoria[normalizado.categoria].cursos.includes(normalizado.nomeNormalizado)) {
      porCategoria[normalizado.categoria].cursos.push(normalizado.nomeNormalizado)
    }
    
    // Agrupar por subcategoria se existir
    if (normalizado.subcategoria) {
      const key = `${normalizado.categoria} - ${normalizado.subcategoria}`
      if (!porSubcategoria[key]) {
        porSubcategoria[key] = {
          total: 0,
          cursos: [],
        }
      }
      porSubcategoria[key].total += total
      if (!porSubcategoria[key].cursos.includes(normalizado.nomeNormalizado)) {
        porSubcategoria[key].cursos.push(normalizado.nomeNormalizado)
      }
    }
  })
  
  return {
    cursosNormalizados: cursosNormalizados.sort((a, b) => b.total - a.total),
    porCategoria,
    porSubcategoria,
  }
}

