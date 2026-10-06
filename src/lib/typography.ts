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

  if (customSize) {
    const rawVal = String(customSize).trim();
    if (rawVal.endsWith('%')) {
      const num = parseFloat(rawVal) || 100;
      style.fontSize = `${num / 100}em`;
    } else if (/^\d+$/.test(rawVal)) {
      const num = parseFloat(rawVal) || 100;
      style.fontSize = `${num / 100}em`;
    } else if (rawVal.endsWith('px') || rawVal.endsWith('rem') || rawVal.endsWith('em')) {
      style.fontSize = rawVal;
    }
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
