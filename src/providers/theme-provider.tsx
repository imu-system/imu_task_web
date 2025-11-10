'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * Theme Provider Component
 * 
 * Wraps the application with next-themes provider for dark mode support.
 * Features:
 * - System preference detection
 * - LocalStorage persistence
 * - No flash on page load
 * - Supports light, dark, and system modes
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
