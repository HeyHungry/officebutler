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

/**
 * Base font sizes in rem for standard elements:
 * - Titels -> ~4.5rem (72px desktop)
 * - Kopjes -> ~1.5rem (24px)
 * - Ondertitels -> ~1.25rem (20px)
 * - Paragrafen -> ~1.0rem (16px)
 * - Knoppen & bullets -> ~0.875rem (14px)
 */
export const BASE_REM_BY_TYPE: Record<TypographyType, number> = {
  title: 4.5,
  heading: 1.5,
  subtitle: 1.25,
  paragraph: 1.0,
  button: 0.875,
  bullet: 0.875,
};

export function inferTypographyType(key?: string): TypographyType {
  if (!key) return 'paragraph';
  const lower = key.toLowerCase();
  if (lower.includes('title') && !lower.includes('sub') && !lower.includes('pre')) return 'title';
  if (lower.includes('subtitle') || lower.includes('desc') || lower.includes('intro')) return 'subtitle';
  if (lower.includes('btn') || lower.includes('button') || lower.includes('link') || lower.includes('badge')) return 'button';
  if (lower.includes('pre_title') || lower.includes('head') || lower.includes('step') || lower.includes('q') || lower.includes('point')) return 'heading';
  return 'paragraph';
}

export function resolveEffectiveFontSize(
  customSize?: string | number | null,
  type?: TypographyType
): string | undefined {
  if (customSize === undefined || customSize === null) return undefined;
  const rawVal = String(customSize).trim();
  if (!rawVal || rawVal === 'auto' || rawVal === 'default' || rawVal === 'normal' || rawVal === 'inherit') {
    return undefined;
  }

  // 100% means standard/original design size - never override with an inline font size
  if (rawVal === '100%' || rawVal === '100') {
    return undefined;
  }

  const effectiveType = type || 'paragraph';
  const baseRem = BASE_REM_BY_TYPE[effectiveType] || 1.0;

  // 1. Explicit CSS units (px, rem, em, pt, vh, vw)
  if (rawVal.endsWith('px') || rawVal.endsWith('rem') || rawVal.endsWith('em') || rawVal.endsWith('pt') || rawVal.endsWith('vw')) {
    return rawVal;
  }

  // 2. Percentage scaling (e.g. "120%", "150%", "80%")
  if (rawVal.endsWith('%')) {
    const num = parseFloat(rawVal);
    if (!num || num === 100) return undefined;
    const ratio = num / 100;
    const computedRem = baseRem * ratio;
    return `${Number(computedRem.toFixed(3))}rem`;
  }

  // 3. Raw numbers
  if (/^\d+(\.\d+)?$/.test(rawVal)) {
    const num = parseFloat(rawVal);
    if (num === 100) return undefined;
    // Values between 50 and 300 are treated as percentage scale (e.g. 120 -> 120%)
    if (num >= 50 && num <= 300) {
      const ratio = num / 100;
      const computedRem = baseRem * ratio;
      return `${Number(computedRem.toFixed(3))}rem`;
    }
    // Values >= 8 and < 50 are treated as pixel values (e.g. 18 -> 18px)
    if (num >= 8 && num < 50) {
      return `${num}px`;
    }
    // Default fallback to px
    return `${num}px`;
  }

  return undefined;
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

  const computedFontSize = resolveEffectiveFontSize(customSize, type);
  if (computedFontSize) {
    style.fontSize = computedFontSize;
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
  typeOrKey?: TypographyType | string
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

  const effectiveType: TypographyType = 
    typeOrKey && (typeOrKey in BASE_REM_BY_TYPE)
      ? (typeOrKey as TypographyType)
      : inferTypographyType(typeOrKey);

  const computedFontSize = resolveEffectiveFontSize(customSize, effectiveType);
  if (computedFontSize) {
    style.fontSize = computedFontSize;
  }

  return style;
}
