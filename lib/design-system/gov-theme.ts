/**
 * Design System Governamental - USWDS Inspired
 * Baseado em USAspending.gov e U.S. Web Design System
 */

export const govTheme = {
  colors: {
    primary: {
      base: '#1a4480', // Azul Institucional SECTI/Gov
      vivid: '#005ea2', // Botões e Ações
      foreground: '#ffffff',
    },
    accent: {
      cool: '#28a0cb', // Destaques secundários/Gráficos
      foreground: '#ffffff',
    },
    background: {
      light: '#f8f9fa', // Não usar branco puro
      dark: '#121212', // Surface Base
      elevated: '#1E1E1E', // Cards no dark mode
    },
    alert: {
      success: '#00a91c',
      error: '#d54309',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#6b7280',
      muted: '#9ca3af',
      inverse: '#ffffff',
    },
  },
  typography: {
    heading: {
      fontFamily: "'Source Sans Pro', 'Inter', sans-serif",
      weights: [400, 600, 700],
    },
    body: {
      fontFamily: "'Public Sans', 'Inter', sans-serif",
      weights: [400, 500, 600, 700],
    },
    mono: {
      fontFamily: "'Roboto Mono', 'JetBrains Mono', monospace",
      weights: [400, 500, 600],
    },
  },
  spacing: {
    container: '24px', // Padding global Bento Grid
    cardGap: '20px', // Gap entre cards
    cardPadding: '24px',
  },
  borderRadius: {
    card: '12px', // Bento Grid standard
    button: '8px',
    input: '6px',
  },
  shadows: {
    bento: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    hover: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.2)',
    dark: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
  },
} as const

export type GovTheme = typeof govTheme

