/**
 * Design System do OxeTech Dashboard
 * Paletas de cores e configurações por módulo
 */

// USAspending.gov Color System - Todas as cores usam o sistema azul institucional
export const moduleColors = {
  work: {
    primary: '#005ea2', // USWDS Primary
    secondary: '#1a4480', // USWDS Primary Base
    light: '#28a0cb', // Accent Cool
    dark: '#1E40AF',
    gradient: 'linear-gradient(135deg, #005ea2 0%, #1a4480 100%)',
  },
  edu: {
    primary: '#005ea2', // USWDS Primary (azul institucional)
    secondary: '#1a4480', // USWDS Primary Base
    light: '#28a0cb', // Accent Cool
    dark: '#1E40AF',
    gradient: 'linear-gradient(135deg, #005ea2 0%, #1a4480 100%)',
  },
  lab: {
    primary: '#005ea2', // USWDS Primary (azul institucional)
    secondary: '#1a4480', // USWDS Primary Base
    light: '#28a0cb', // Accent Cool
    dark: '#1E40AF',
    gradient: 'linear-gradient(135deg, #005ea2 0%, #1a4480 100%)',
  },
  trilhas: {
    primary: '#005ea2', // USWDS Primary (azul institucional)
    secondary: '#1a4480', // USWDS Primary Base
    light: '#28a0cb', // Accent Cool
    dark: '#1E40AF',
    gradient: 'linear-gradient(135deg, #005ea2 0%, #1a4480 100%)',
  },
  din: {
    primary: '#005ea2', // USWDS Primary (azul institucional)
    secondary: '#1a4480', // USWDS Primary Base
    light: '#28a0cb', // Accent Cool
    dark: '#1E40AF',
    gradient: 'linear-gradient(135deg, #005ea2 0%, #1a4480 100%)',
  },
} as const

export type ModuleType = keyof typeof moduleColors

export function getModuleColor(module: ModuleType, variant: 'primary' | 'secondary' | 'light' | 'dark' = 'primary') {
  return moduleColors[module][variant]
}

export function getModuleGradient(module: ModuleType) {
  return moduleColors[module].gradient
}

