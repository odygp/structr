'use client';
import { useEffect } from 'react';
import { useBuilderStore } from '@/lib/store';
import Toolbar from './Toolbar';
import SectionCatalog from './SectionCatalog';
import Canvas from './Canvas';
import ContentEditor from './ContentEditor';

export default function BuilderLayout() {
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const duplicateSection = useBuilderStore((s) => s.duplicateSection);
  const copySection = useBuilderStore((s) => s.copySection);
  const pasteSection = useBuilderStore((s) => s.pasteSection);
  const removeSection = useBuilderStore((s) => s.removeSection);
  const selectedSectionId = useBuilderStore((s) => s.selectedSectionId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (meta && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
      if (meta && e.key === 'd') { e.preventDefault(); if (selectedSectionId) duplicateSection(selectedSectionId); }
      if (meta && e.key === 'c') { if (selectedSectionId) copySection(selectedSectionId); }
      if (meta && e.key === 'v') { pasteSection(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedSectionId && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault(); removeSection(selectedSectionId);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedSectionId, undo, redo, duplicateSection, copySection, pasteSection, removeSection]);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <SectionCatalog />
        <Canvas />
        <ContentEditor />
      </div>
    </div>
  );
}
