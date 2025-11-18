/**
 * Design System do OxeTech Dashboard
 * Paletas de cores e configurações por módulo
 */

export const moduleColors = {
  work: {
    primary: '#0A64C2',
    secondary: '#2E2A87',
    light: '#3B82F6',
    dark: '#1E40AF',
    gradient: 'linear-gradient(135deg, #0A64C2 0%, #2E2A87 100%)',
  },
  edu: {
    primary: '#F7A600',
    secondary: '#FFA83E',
    light: '#FCD34D',
    dark: '#D97706',
    gradient: 'linear-gradient(135deg, #F7A600 0%, #FFA83E 100%)',
  },
  lab: {
    primary: '#FF6A00',
    secondary: '#B30000',
    light: '#FB923C',
    dark: '#C2410C',
    gradient: 'linear-gradient(135deg, #FF6A00 0%, #B30000 100%)',
  },
  trilhas: {
    primary: '#C80000',
    secondary: '#7A0F0F',
    light: '#EF4444',
    dark: '#991B1B',
    gradient: 'linear-gradient(135deg, #C80000 0%, #7A0F0F 100%)',
  },
  din: {
    primary: '#0091EA',
    secondary: '#004E82',
    light: '#60A5FA',
    dark: '#1E3A8A',
    gradient: 'linear-gradient(135deg, #0091EA 0%, #004E82 100%)',
  },
} as const

export type ModuleType = keyof typeof moduleColors

export function getModuleColor(module: ModuleType, variant: 'primary' | 'secondary' | 'light' | 'dark' = 'primary') {
  return moduleColors[module][variant]
}

export function getModuleGradient(module: ModuleType) {
  return moduleColors[module].gradient
}

