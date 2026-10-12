import React, { useMemo } from 'react';
import { Edit3 } from 'lucide-react';
import { useModerator } from '../contexts/ModeratorContext';
import { getCustomTypographyStyle } from '../lib/typography';

interface EditableTextProps {
  contentKey: string;
  label: string;
  value?: string;
  defaultValue?: string;
  multiline?: boolean;
  allowHtml?: boolean;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  dangerouslySetInnerHTML?: { __html: string };
  inline?: boolean;
}

export function EditableText({
  contentKey,
  label,
  value,
  defaultValue,
  multiline,
  allowHtml,
  as: Component = 'span',
  className = '',
  style,
  children,
  dangerouslySetInnerHTML,
  inline = false
}: EditableTextProps) {
  const { isAuthenticated, isModeratorView, openInlineEdit, storeSettings } = useModerator();

  const customFont = storeSettings?.page_content?.[`${contentKey}_font`];
  const customSize = storeSettings?.page_content?.[`${contentKey}_size`];

  const computedStyle = useMemo(() => {
    const typoStyle = getCustomTypographyStyle(customFont, customSize, contentKey);
    return { ...style, ...typoStyle };
  }, [style, customFont, customSize, contentKey]);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openInlineEdit({
      key: contentKey,
      label,
      value: value ?? defaultValue ?? '',
      defaultValue,
      multiline,
      allowHtml,
      tag: typeof Component === 'string' ? Component : undefined
    });
  };

  // Normal public rendering when not in moderator view
  if (!isAuthenticated || !isModeratorView) {
    if (dangerouslySetInnerHTML) {
      return (
        <Component
          className={className}
          style={computedStyle}
          dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        />
      );
    }
    return (
      <Component className={className} style={computedStyle}>
        {children ?? value ?? defaultValue ?? ''}
      </Component>
    );
  }

  // Moderator view is ACTIVE: show clickable edit trigger & pencil icon
  const containerClass = inline
    ? `relative inline-flex items-center group/edit cursor-pointer rounded px-0.5 transition-all hover:bg-blue-500/10 hover:outline hover:outline-1 hover:outline-dashed hover:outline-[#5170ff] ${className}`
    : `relative group/edit cursor-pointer rounded transition-all hover:bg-blue-500/5 hover:outline hover:outline-1 hover:outline-dashed hover:outline-[#5170ff] ${className}`;

  if (dangerouslySetInnerHTML) {
    return (
      <Component
        onClick={handleEdit}
        className={containerClass}
        style={computedStyle}
        title={`Klik om "${label}" te bewerken`}
      >
        <span dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
        <button
          type="button"
          onClick={handleEdit}
          className="inline-flex items-center justify-center w-5 h-5 ml-1.5 -mt-0.5 align-middle bg-[#5170ff] hover:bg-[#3b5de7] text-white rounded-md shadow-md transition-all hover:scale-110 cursor-pointer shrink-0 z-10"
          title={`Bewerk "${label}"`}
          aria-label={`Bewerk "${label}"`}
        >
          <Edit3 size={11} strokeWidth={2.5} />
        </button>
      </Component>
    );
  }

  return (
    <Component
      onClick={handleEdit}
      className={containerClass}
      style={computedStyle}
      title={`Klik om "${label}" te bewerken`}
    >
      {children ?? value ?? defaultValue ?? ''}
      <button
        type="button"
        onClick={handleEdit}
        className="inline-flex items-center justify-center w-5 h-5 ml-1.5 -mt-0.5 align-middle bg-[#5170ff] hover:bg-[#3b5de7] text-white rounded-md shadow-md transition-all hover:scale-110 cursor-pointer shrink-0 z-10"
        title={`Bewerk "${label}"`}
        aria-label={`Bewerk "${label}"`}
      >
        <Edit3 size={11} strokeWidth={2.5} />
      </button>
    </Component>
  );
}
