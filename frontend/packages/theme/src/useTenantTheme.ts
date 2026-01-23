import { useEffect, useMemo } from 'react';
import type { TenantBranding } from '@fop/types';

/**
 * Generates a color palette from a base hex color.
 * Creates lighter and darker shades for use with Tailwind-style color scales.
 */
function generateColorPalette(baseColor: string): Record<string, string> {
  // Parse hex color
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Generate shades by adjusting lightness
  const shades: Record<string, string> = {};

  // Lighter shades (50-400)
  const lightFactors = [0.95, 0.85, 0.70, 0.55, 0.40];
  const lightKeys = ['50', '100', '200', '300', '400'];
  lightFactors.forEach((factor, i) => {
    const nr = Math.round(r + (255 - r) * factor);
    const ng = Math.round(g + (255 - g) * factor);
    const nb = Math.round(b + (255 - b) * factor);
    shades[lightKeys[i]] = `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  });

  // Base color (500)
  shades['500'] = baseColor;

  // Darker shades (600-900)
  const darkFactors = [0.85, 0.70, 0.55, 0.40];
  const darkKeys = ['600', '700', '800', '900'];
  darkFactors.forEach((factor, i) => {
    const nr = Math.round(r * factor);
    const ng = Math.round(g * factor);
    const nb = Math.round(b * factor);
    shades[darkKeys[i]] = `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  });

  return shades;
}

/**
 * Hook that returns computed theme values based on tenant branding.
 */
export function useTenantTheme(tenant: TenantBranding | null) {
  const theme = useMemo(() => {
    if (!tenant) {
      return null;
    }

    const primaryPalette = generateColorPalette(tenant.primaryColor);
    const secondaryPalette = generateColorPalette(tenant.secondaryColor);

    return {
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      primaryPalette,
      secondaryPalette,
      logoUrl: tenant.logoUrl,
      tenantName: tenant.name,
      tenantCode: tenant.code,
      currency: tenant.currency,
    };
  }, [tenant]);

  // Apply CSS custom properties when theme changes
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    // Apply primary color palette
    (Object.entries(theme.primaryPalette) as [string, string][]).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });

    // Apply secondary color palette
    (Object.entries(theme.secondaryPalette) as [string, string][]).forEach(([shade, color]) => {
      root.style.setProperty(`--color-secondary-${shade}`, color);
    });

    // Store tenant info as CSS variables for potential use
    root.style.setProperty('--tenant-primary', theme.primaryColor);
    root.style.setProperty('--tenant-secondary', theme.secondaryColor);
  }, [theme]);

  return theme;
}

export type TenantTheme = NonNullable<ReturnType<typeof useTenantTheme>>;
