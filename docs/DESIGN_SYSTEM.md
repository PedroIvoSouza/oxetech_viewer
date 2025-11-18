# Design System OxeTech Dashboard

## 🎨 Visão Geral

Sistema de design completo e padronizado para o Dashboard Analítico OxeTech, garantindo consistência visual em todas as páginas e componentes.

---

## 🎨 Paleta de Cores

### Cores por Módulo

#### 💼 Work (Azul)
```typescript
work: {
  primary: '#0A64C2',      // Azul principal
  secondary: '#2E2A87',    // Roxo escuro
  light: '#3B82F6',        // Azul claro
  dark: '#1E40AF',         // Azul escuro
  gradient: 'linear-gradient(135deg, #0A64C2 0%, #2E2A87 100%)'
}
```

#### 🎓 Edu (Amarelo)
```typescript
edu: {
  primary: '#F7A600',      // Amarelo principal
  secondary: '#FFA83E',    // Laranja claro
  light: '#FCD34D',        // Amarelo claro
  dark: '#D97706',         // Laranja escuro
  gradient: 'linear-gradient(135deg, #F7A600 0%, #FFA83E 100%)'
}
```

#### 🧪 Lab (Laranja)
```typescript
lab: {
  primary: '#FF6A00',      // Laranja principal
  secondary: '#B30000',    // Vermelho
  light: '#FB923C',        // Laranja claro
  dark: '#C2410C',         // Laranja escuro
  gradient: 'linear-gradient(135deg, #FF6A00 0%, #B30000 100%)'
}
```

#### 📚 Trilhas (Vermelho)
```typescript
trilhas: {
  primary: '#C80000',      // Vermelho principal
  secondary: '#7A0F0F',    // Vinho
  light: '#EF4444',        // Vermelho claro
  dark: '#991B1B',         // Vermelho escuro
  gradient: 'linear-gradient(135deg, #C80000 0%, #7A0F0F 100%)'
}
```

#### 🚀 Din (Azul Ciano)
```typescript
din: {
  primary: '#0091EA',      // Azul ciano
  secondary: '#004E82',    // Azul escuro
  light: '#60A5FA',        // Azul claro
  dark: '#1E3A8A',         // Azul marinho
  gradient: 'linear-gradient(135deg, #0091EA 0%, #004E82 100%)'
}
```

### Cores Base (shadcn/ui)

```css
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--primary: 221.2 83.2% 53.3%
--secondary: 210 40% 96.1%
--muted: 210 40% 96.1%
--accent: 210 40% 96.1%
--destructive: 0 84.2% 60.2%
--border: 214.3 31.8% 91.4%
--ring: 221.2 83.2% 53.3%
```

---

## 📝 Tipografia

### Fontes

- **Corpo**: Inter (300, 400, 500, 600, 700, 800)
- **Títulos**: Manrope (400, 500, 600, 700, 800)

### Escala Tipográfica

```typescript
// Títulos
h1: text-4xl font-bold (36px, Manrope, 700)
h2: text-3xl font-bold (30px, Manrope, 700)
h3: text-2xl font-bold (24px, Manrope, 700)
h4: text-xl font-bold (20px, Manrope, 700)

// Corpo
body: text-base (16px, Inter, 400)
small: text-sm (14px, Inter, 400)
tiny: text-xs (12px, Inter, 400)

// Subtítulos
subtitle: text-sm text-muted-foreground (14px, Inter, 400, #6B7280)
```

### Pesos

- **700** (Bold): Títulos principais
- **500** (Medium): Títulos secundários e labels
- **400** (Regular): Corpo de texto
- **300** (Light): Texto suave

---

## 📐 Espaçamento

### Sistema de Grid

```typescript
gap-2: 8px   // Muito pequeno
gap-4: 16px  // Pequeno
gap-6: 24px  // Médio (padrão)
gap-8: 32px  // Grande
gap-12: 48px // Muito grande
```

### Padding Padrão

```typescript
Cards: p-6 (24px)
Sections: p-8 (32px)
Containers: px-6 py-8
```

---

## 🔲 Bordas e Raios

### Border Radius

```typescript
sm: 8px      // Pequeno
md: 12px     // Médio
lg: 16px     // Grande
xl: 22px     // Extra grande (padrão premium)
2xl: 24px    // Muito grande
```

### Uso por Componente

- **Cards**: 22px
- **Botões**: 12px
- **Inputs**: 12px
- **Badges**: 9999px (circular)
- **Sidebar**: 24px (arredondado no topo)

---

## 🌑 Sombras

### Níveis de Sombra

```typescript
soft: 0 2px 8px rgba(0, 0, 0, 0.04)    // Cards padrão
medium: 0 4px 16px rgba(0, 0, 0, 0.08) // Cards hover
large: 0 8px 32px rgba(0, 0, 0, 0.12)  // Modais
```

### Uso

- **Cards estáticos**: `shadow-soft`
- **Cards hover**: `shadow-medium`
- **Modais/Dialogs**: `shadow-large`

---

## ✨ Animações

### Framer Motion

#### Fade In
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

#### Slide In
```typescript
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.4 }}
```

#### Pulse Slow
```typescript
className="animate-pulse-slow" // 3s ease-in-out infinite
```

### Transições CSS

```typescript
// Hover suave
transition-all duration-300

// Scale no hover
hover:scale-105
hover:scale-110

// Translate no hover
hover:-translate-y-1
```

### Durações Padrão

- **Rápido**: 200ms
- **Médio**: 300-400ms
- **Lento**: 500ms

---

## 📦 Componentes Base

### KPICard

```typescript
// Props
{
  title: string
  value: string | number
  icon: LucideIcon
  module?: 'work' | 'edu' | 'lab' | 'trilhas'
  delay?: number
  description?: string
  trend?: { value: number; isPositive: boolean }
}

// Estilo
- Border radius: 22px
- Shadow: soft (padrão), medium (hover)
- Hover: scale e translate
- Animação: fade-in com delay
```

### Cards

```typescript
// Padrão
className="border-0 shadow-soft"
style={{ borderRadius: '22px' }}

// Com header
<CardHeader>
  <CardTitle className="text-xl font-bold">
  <CardDescription className="text-sm mt-1">
</CardHeader>
```

### Botões

```typescript
// Variantes
default: bg-primary text-primary-foreground
outline: border border-input bg-background
ghost: hover:bg-accent
destructive: bg-destructive text-destructive-foreground

// Tamanhos
sm: h-9 px-3
default: h-10 px-4
lg: h-11 px-8
```

### Inputs

```typescript
// Padrão
className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
style={{ borderRadius: '12px' }}

// Com ícone
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Input className="pl-10" />
</div>
```

### Tabelas

```typescript
// Header
<thead>
  <tr className="border-b">
    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
    
// Body
<tbody>
  <tr className="border-b hover:bg-muted/50 transition-colors">
    <td className="p-3">
```

---

## 📊 Gráficos (Recharts)

### Estilo Padrão

```typescript
// Cores
- Módulo primary para primeira série
- Cores default para séries adicionais
- Gradientes em áreas e barras

// Tooltip
contentStyle={{
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  padding: '12px'
}}

// Grid
strokeDasharray="3 3"
stroke="#e5e7eb"
opacity={0.3}
```

### Animações

- **Duração**: 1000ms
- **Delay**: Sequencial (index * 100ms)
- **Tipo**: ease-out

---

## 🎯 Estados

### Loading (Skeleton)

```typescript
<Skeleton className="h-40" />
// Gradiente suave
bg-gradient-to-r from-muted via-muted/50 to-muted
```

### Error

```typescript
<div className="flex h-96 items-center justify-center rounded-2xl bg-destructive/10">
  <p className="text-lg font-semibold text-destructive">
  <p className="text-sm text-muted-foreground">
</div>
```

### Empty State

```typescript
<div className="flex flex-col items-center justify-center py-12">
  <Icon className="h-12 w-12 text-muted-foreground mb-4" />
  <p className="text-muted-foreground">Nenhum dado encontrado</p>
</div>
```

---

## 📱 Responsividade

### Breakpoints

```typescript
sm: 640px   // Mobile
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1400px // Extra large
```

### Grid Responsivo

```typescript
// KPIs
grid gap-6 md:grid-cols-2 lg:grid-cols-4

// Gráficos
grid gap-6 md:grid-cols-2

// Conteúdo
container mx-auto px-6
```

---

## 🎨 Gradientes

### Aplicação

```typescript
// Background cards
background: moduleGradient || undefined

// Sidebar ativo
background: getModuleGradient(module)

// Gráficos
linearGradient com stops em 5% e 95%
```

---

## 🔤 Status Colors

### Alunos/Usuários

- **VALIDADO**: `bg-green-100 text-green-800`
- **AGUARDANDO VALIDAÇÃO**: `bg-yellow-100 text-yellow-800`
- **INATIVO**: `bg-gray-100 text-gray-800`

### Vagas

- **ABERTA**: `bg-green-100 text-green-800`
- **FECHADA**: `bg-red-100 text-red-800`
- **EM ANDAMENTO**: `bg-yellow-100 text-yellow-800`

### Progresso

- **≥ 70%**: `text-green-600`
- **40-69%**: `text-yellow-600`
- **< 40%**: `text-red-600`

---

## 📏 Layout

### Estrutura

```typescript
// Sidebar
width: 72 (288px) ou 20 (80px) quando colapsada
height: full

// Header
height: 20 (80px)

// Main
flex-1 overflow-y-auto bg-muted/40
container mx-auto p-6
```

---

## 🎭 Interações

### Hover

- **Cards**: `hover:shadow-medium hover:-translate-y-1`
- **Botões**: `hover:bg-primary/90`
- **Links**: `hover:text-accent-foreground`
- **Ícones**: `hover:scale-110 hover:rotate-3`

### Focus

- **Inputs**: `focus-visible:ring-2 focus-visible:ring-ring`
- **Botões**: `focus-visible:outline-none focus-visible:ring-2`

---

## 📐 Componentes Específicos

### Sidebar Menu Item

```typescript
// Ativo
background: getModuleGradient(module)
text-white
borderRadius: 16px

// Inativo
text-muted-foreground
hover:bg-accent hover:text-accent-foreground
```

### Header Breadcrumb

```typescript
// Indicador de módulo
<div 
  className="h-12 w-1 rounded-r-full animate-pulse-slow"
  style={{ backgroundColor: moduleColor }}
/>
```

### Progress Bar (Trilhas)

```typescript
// Verde: >= 70%
// Amarelo: 40-69%
// Vermelho: < 40%
```

---

## 🎨 Acessibilidade

- Contraste adequado (WCAG AA)
- Focus visible em todos os elementos interativos
- Labels descritivos
- Textos alternativos em ícones

---

**Design System Version**: 1.0.0
**Última Atualização**: 2025

