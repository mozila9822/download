"use client";
import { useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';

function hexToHsl(hex: string): string | null {
  try {
    const clean = hex.replace('#', '').trim();
    const bigint = parseInt(clean, 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h = h * 60;
    }
    const hs = `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    return hs;
  } catch {
    return null;
  }
}

function normalizeToHsl(value?: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith('#')) return hexToHsl(v);
  // If already an HSL-like string (contains %), assume HSL tokens
  if (v.includes('%')) {
    // Strip potential wrappers like hsl(...)
    const cleaned = v
      .replace(/hsl\(/i, '')
      .replace(/\)/g, '')
      .replace(/,/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned;
  }
  return null;
}

export default function ThemeVars() {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings?.theme) return;
    const root = document.documentElement;
    const primary = normalizeToHsl(settings.theme.primaryColor);
    const secondary = normalizeToHsl(settings.theme.secondaryColor);
    if (primary) {
      root.style.setProperty('--primary', primary);
      root.style.setProperty('--ring', primary);
    }
    if (secondary) {
      root.style.setProperty('--secondary', secondary);
    }
    if (settings.theme.fontFamily) {
      document.body.style.fontFamily = settings.theme.fontFamily;
    }
  }, [settings?.theme]);

  return null;
}

