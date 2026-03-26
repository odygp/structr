'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useBuilderStore } from '@/lib/store';

interface EditableTextProps {
  sectionId: string;
  fieldKey: string;
  value: string;
  className?: string;
  placeholder?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  // For items array fields
  arrayKey?: string;
  itemIndex?: number;
  itemFieldKey?: string;
}

export default function EditableText({
  sectionId,
  fieldKey,
  value,
  className = '',
  placeholder = 'Click to edit...',
  tag: Tag = 'span',
  arrayKey,
  itemIndex,
  itemFieldKey,
}: EditableTextProps) {
  const updateContent = useBuilderStore((s) => s.updateContent);
  const updateItemField = useBuilderStore((s) => s.updateItemField);
  const selectSection = useBuilderStore((s) => s.selectSection);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);

  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const isSelected = selectedSectionId === sectionId;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected) {
      selectSection(sectionId);
      return;
    }
    setIsEditing(true);
  }, [isSelected, sectionId, selectSection]);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (!ref.current) return;
    const newValue = ref.current.innerText;
    if (arrayKey !== undefined && itemIndex !== undefined && itemFieldKey) {
      updateItemField(sectionId, arrayKey, itemIndex, itemFieldKey, newValue);
    } else {
      updateContent(sectionId, fieldKey, newValue);
    }
  }, [sectionId, fieldKey, arrayKey, itemIndex, itemFieldKey, updateContent, updateItemField]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      if (ref.current) ref.current.innerText = value || '';
    }
  }, [value]);

  const displayValue = value || '';
  const isEmpty = !displayValue.trim();

  return (
    <Tag
      ref={ref as any}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onClick={handleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} ${
        isSelected && !isEditing
          ? 'cursor-text hover:outline hover:outline-2 hover:outline-blue-300 hover:outline-offset-2 rounded'
          : ''
      } ${
        isEditing
          ? 'outline outline-2 outline-blue-500 outline-offset-2 rounded bg-blue-50/10'
          : ''
      } ${isEmpty && !isEditing ? 'opacity-50' : ''}`}
      style={{ minWidth: '1em' }}
    >
      {isEmpty && !isEditing ? placeholder : displayValue}
    </Tag>
  );
}
