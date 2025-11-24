# 📦 Guia de Dependências

Este documento lista todas as dependências do projeto e suas finalidades.

## ✅ Dependências Já Instaladas

### Core
- **next**: 16.0.3 - Framework React
- **react**: 19.2.0 - Biblioteca React
- **react-dom**: 19.2.0 - React DOM
- **typescript**: ^5 - TypeScript

### UI Components
- **@radix-ui/*** - Componentes UI acessíveis
- **lucide-react**: ^0.454.0 - Ícones
- **framer-motion**: ^12.23.24 - Animações
- **tailwindcss**: ^4.1.9 - CSS Framework
- **recharts**: 2.15.4 - Gráficos

### Data & State
- **@tanstack/react-query**: ^5.0.0 - Gerenciamento de estado servidor
- **zod**: 3.25.76 - Validação de schemas
- **@prisma/client**: ^5.0.0 - ORM

### Utilitários
- **xlsx**: ^0.18.0 - Exportação Excel
- **date-fns**: 4.1.0 - Manipulação de datas
- **clsx**: ^2.1.1 - Utilitário de classes CSS
- **jose**: ^5.0.0 - JWT

### Exportação (Opcional - já instaladas)
- **html2canvas**: ^1.4.1 - Conversão HTML para Canvas
- **jspdf**: ^3.0.4 - Geração de PDFs
- **playwright**: ^1.40.0 - Automação de navegador (para PDFs)

### Desenvolvimento
- **@tanstack/react-query-devtools**: ^5.91.0 - DevTools do React Query

## ⚠️ Dependências Opcionais (Tipos TypeScript)

Para melhor experiência de desenvolvimento com TypeScript, você pode instalar:

```bash
npm install --save-dev @types/html2canvas @types/jspdf
```

**Nota**: Esses tipos são opcionais. O código funciona sem eles usando `@ts-ignore`.

## 🔧 Dependências por Funcionalidade

### Exportação de Dados
- ✅ `xlsx` - Exportação para Excel (já instalado)
- ✅ `html2canvas` - Exportação de gráficos para PNG (já instalado)
- ✅ `jspdf` - Exportação de gráficos para PDF (já instalado)
- ✅ `playwright` - Geração de PDFs via navegador (já instalado)

### Autenticação
- ✅ `jose` - JWT (já instalado)

### IA e Processamento
- ✅ `openai` - API OpenAI (já instalado)
- ✅ `csv-parse` - Parsing de CSV (já instalado)

### Desenvolvimento
- ✅ `@tanstack/react-query-devtools` - DevTools (já instalado, apenas dev)

## 📝 Status Atual

**Todas as dependências necessárias já estão instaladas!**

O projeto está configurado para funcionar sem dependências adicionais. As dependências opcionais (`html2canvas`, `jspdf`) já estão no `package.json` e funcionam corretamente.

## 🚀 Instalação

Se você precisar reinstalar todas as dependências:

```bash
npm install
```

## 🔍 Verificar Dependências Instaladas

```bash
# Verificar se todas estão instaladas
npm list html2canvas jspdf @tanstack/react-query-devtools playwright

# Verificar dependências faltantes
npm audit
```

## 💡 Notas Importantes

1. **html2canvas e jspdf**: Já estão instalados e funcionando. Não são mais opcionais no código atual.

2. **@tanstack/react-query-devtools**: Está em `devDependencies`, mas foi removido do código de produção para evitar erros de build.

3. **playwright**: Usado apenas no servidor para geração de PDFs. Requer instalação dos binários do navegador na primeira execução.

4. **Tipos TypeScript**: Os tipos para `html2canvas` e `jspdf` são opcionais. O código usa `@ts-ignore` para funcionar sem eles.

