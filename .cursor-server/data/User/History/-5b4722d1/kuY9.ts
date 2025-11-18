'use client'

import { useMemo } from 'react'
import { ModuleType, getModuleColor, getModuleGradient } from '@/lib/design-system'

export function useModuleColor(module: ModuleType) {
  return useMemo(
    () => ({
      primary: getModuleColor(module, 'primary'),
      secondary: getModuleColor(module, 'secondary'),
      light: getModuleColor(module, 'light'),
      dark: getModuleColor(module, 'dark'),
      gradient: getModuleGradient(module),
    }),
    [module]
  )
}

