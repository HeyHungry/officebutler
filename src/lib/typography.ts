import React from 'react';

export type TypographyType = 'title' | 'subtitle' | 'button' | 'paragraph' | 'heading' | 'bullet';

export type FontOptionKey =
  | 'auto'
  | 'postman_regular'
  | 'postman_bold'
  | 'postman_medium'
  | 'postman_light'
  | 'agrandir_regular'
  | 'agrandir_narrow'
  | 'agrandir_bold';

export const FONT_OPTIONS: { id: FontOptionKey; label: string; group: string }[] = [
  { id: 'auto', label: 'Standaard (Auto)', group: 'Standaard' },
  { id: 'postman_regular', label: "Postman's Serif Regular", group: "Postman's Serif" },
  { id: 'postman_bold', label: "Postman's Serif Bold", group: "Postman's Serif" },
  { id: 'postman_medium', label: "Postman's Serif Medium", group: "Postman's Serif" },
  { id: 'postman_light', label: "Postman's Serif Light", group: "Postman's Serif" },
  { id: 'agrandir_regular', label: 'Agrandir Regular', group: 'Agrandir' },
  { id: 'agrandir_narrow', label: 'Agrandir Narrow', group: 'Agrandir' },
  { id: 'agrandir_bold', label: 'Agrandir Bold', group: 'Agrandir' },
];

export const BASE_REM_BY_TYPE: Record<TypographyType, number> = {
  title: 4.5, // 4.5rem (~72px)
  subtitle: 1.25, // 1.25rem (~20px)
  button: 0.875, // 0.875rem (~14px)
  bullet: 0.875, // 0.875rem (~14px)
  paragraph: 1.0, // 1rem (~16px)
  heading: 1.5, // 1.5rem (~24px)
};

/**
 * Resolves the effective font-size CSS string from custom inputs.
 * - 'auto', 'default', '100%', '100', empty -> returns undefined so responsive CSS/Tailwind classes are preserved.
 * - Percentages (e.g. 120%, 150%) -> calculated from baseRem * (num / 100).
 * - Explicit CSS units like '48px', '64px', '76px', '88px', '2rem' are returned as-is.
 */
export function resolveEffectiveFontSize(
  customSize?: string | number | null,
  type: TypographyType = 'paragraph'
): string | undefined {
  if (customSize === undefined || customSize === null) return undefined;
  const raw = String(customSize).trim().toLowerCase();

  // If auto, default, 100% or empty: return undefined to protect original responsive Tailwind classes
  if (raw === '' || raw === 'auto' || raw === 'default' || raw === '100%' || raw === '100') {
    return undefined;
  }

  // Percentage (e.g. 120%, 150%, 80%)
  if (raw.endsWith('%')) {
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) {
      const baseRem = BASE_REM_BY_TYPE[type] ?? 1.0;
      // Cap percentage for non-titles to avoid layout breakage
      const safePercent = type !== 'title' ? Math.min(num, 180) : Math.min(num, 200);
      const calculatedRem = Number((baseRem * (safePercent / 100)).toFixed(3));
      return `${calculatedRem}rem`;
    }
  }

  // Explicit CSS units (e.g. 48px, 64px, 76px, 88px, 2rem, 1.5em)
  if (/^\d+(\.\d+)?(px|rem|em|vw|vh|pt)$/i.test(raw)) {
    if (raw.endsWith('px')) {
      const pxNum = parseFloat(raw);
      // Safety cap: non-title text should never exceed 48px
      if (type !== 'title' && pxNum > 48) {
        if (pxNum >= 80) {
          // Plain percentage entered previously with px attached or converted
          const baseRem = BASE_REM_BY_TYPE[type] ?? 1.0;
          return `${Number((baseRem * (Math.min(pxNum, 180) / 100)).toFixed(3))}rem`;
        }
        return '24px';
      }
    }
    return raw;
  }

  // Plain number without unit (e.g. '48', '64', '120', '240')
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const num = parseFloat(raw);
    if (num > 0) {
      // If number is >= 80, it was intended as a percentage (e.g. 100, 120, 150, 180, 240)
      if (num >= 80) {
        const baseRem = BASE_REM_BY_TYPE[type] ?? 1.0;
        const safePercent = type !== 'title' ? Math.min(num, 180) : Math.min(num, 200);
        const calculatedRem = Number((baseRem * (safePercent / 100)).toFixed(3));
        return `${calculatedRem}rem`;
      }
      // Safety cap for plain px values on non-titles
      if (type !== 'title' && num > 40) {
        return '24px';
      }
      return `${num}px`;
    }
  }

  return raw;
}

/**
 * Returns the effective font style properties based on the configured font key
 * or the default for that element type:
 * - Titels -> Postman's Serif Regular
 * - Ondertitels -> Agrandir Narrow
 * - Bullets (knoppen) -> Agrandir Regular (capslock)
 * - Paragrafen -> Agrandir Narrow
 * - Kopjes -> Agrandir Bold
 */
export function getTypographyStyle(
  type: TypographyType,
  customFont?: string | null,
  customSize?: string | number | null
): React.CSSProperties {
  const effectiveFont = customFont && customFont !== 'auto' ? (customFont as FontOptionKey) : getDefaultFontForType(type);

  const style: React.CSSProperties = {};

  switch (effectiveFont) {
    case 'postman_bold':
      style.fontFamily = '"Postman\'s Serif", "Postmans Serif", "Playfair Display", Georgia, serif';
      style.fontWeight = 700;
      break;
    case 'postman_medium':
      style.fontFamily = '"Postman\'s Serif", "Postmans Serif", "Playfair Display", Georgia, serif';
      style.fontWeight = 500;
      break;
    case 'postman_light':
      style.fontFamily = '"Postman\'s Serif", "Postmans Serif", "Playfair Display", Georgia, serif';
      style.fontWeight = 300;
      break;
    case 'postman_regular':
      style.fontFamily = '"Postman\'s Serif", "Postmans Serif", "Playfair Display", Georgia, serif';
      style.fontWeight = 400;
      break;

    case 'agrandir_bold':
      style.fontFamily = '"Agrandir Bold", "Agrandir", "Plus Jakarta Sans", sans-serif';
      style.fontWeight = 700;
      break;
    case 'agrandir_narrow':
      style.fontFamily = '"Agrandir Narrow", "Agrandir", "Plus Jakarta Sans", sans-serif';
      style.fontWeight = 400;
      break;
    case 'agrandir_regular':
    default:
      style.fontFamily = '"Agrandir Regular", "Agrandir", "Plus Jakarta Sans", sans-serif';
      style.fontWeight = 400;
      break;
  }

  if (type === 'button' || type === 'bullet') {
    style.textTransform = 'uppercase';
    style.letterSpacing = '0.08em';
  }

  const effectiveSize = resolveEffectiveFontSize(customSize, type);
  if (effectiveSize) {
    style.fontSize = effectiveSize;
  }

  return style;
}

export function getDefaultFontForType(type: TypographyType): FontOptionKey {
  switch (type) {
    case 'title':
      return 'postman_regular';
    case 'subtitle':
      return 'agrandir_narrow';
    case 'button':
    case 'bullet':
      return 'agrandir_regular';
    case 'paragraph':
      return 'agrandir_narrow';
    case 'heading':
      return 'agrandir_bold';
    default:
      return 'postman_regular';
  }
}

export function getCustomTypographyStyle(
  customFont?: string | null,
  customSize?: string | number | null,
  type: TypographyType = 'paragraph'
): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (customFont && customFont !== 'auto') {
    switch (customFont) {
      case 'postman_bold':
        style.fontFamily = '"Postman\'s Serif", "Postmans Serif", "Playfair Display", Georgia, serif';
        style.fontWeight = 700;
        break;
      case 'postman_medium':
        style.fontFamily = '"Postman\'s Serif", "Postmans Serif", "Playfair Display", Georgia, serif';
        style.fontWeight = 500;
        break;
      case 'postman_light':
        style.fontFamily = '"Postman\'s Serif", "Postmans Serif", "Playfair Display", Georgia, serif';
        style.fontWeight = 300;
        break;
      case 'postman_regular':
        style.fontFamily = '"Postman\'s Serif", "Postmans Serif", "Playfair Display", Georgia, serif';
        style.fontWeight = 400;
        break;
      case 'agrandir_bold':
        style.fontFamily = '"Agrandir Bold", "Agrandir", "Plus Jakarta Sans", sans-serif';
        style.fontWeight = 700;
        break;
      case 'agrandir_narrow':
        style.fontFamily = '"Agrandir Narrow", "Agrandir", "Plus Jakarta Sans", sans-serif';
        style.fontWeight = 400;
        break;
      case 'agrandir_regular':
        style.fontFamily = '"Agrandir Regular", "Agrandir", "Plus Jakarta Sans", sans-serif';
        style.fontWeight = 400;
        break;
    }
  }

  const effectiveSize = resolveEffectiveFontSize(customSize, type);
  if (effectiveSize) {
    style.fontSize = effectiveSize;
  }

  return style;
}
