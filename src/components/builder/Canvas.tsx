'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useBuilderStore } from '@/lib/store';
import { getDefinition } from '@/lib/registry';
import { componentRegistry } from '@/components/sections';

// Error boundary to catch section rendering crashes
class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; sectionId: string; variantId: string },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode; sectionId: string; variantId: string }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-[12px] p-6 text-center">
          <p className="text-[13px] font-medium text-red-700 mb-1">Section render error</p>
          <p className="text-[11px] text-red-500">{this.props.variantId}: {this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
import { PlacedSection, SectionCategory } from '@/lib/types';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SectionActions from './SectionActions';

function SortableSection({ section, index, total, onEditWithAi, isAiGenerating, isAiChanged }: {
  section: PlacedSection; index: number; total: number;
  onEditWithAi?: () => void; isAiGenerating?: boolean; isAiChanged?: boolean;
}) {
  const { selectSection, selectedSectionId, duplicateSection, removeSection } = useBuilderStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Component = componentRegistry[section.variantId];
  const isSelected = selectedSectionId === section.id;
  const def = getDefinition(section.category);

  if (!Component) return null;

  const handleSaveReusable = async () => {
    try {
      const res = await fetch('/api/reusable-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: section.variantId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          category: section.category,
          variantId: section.variantId,
          content: section.content,
          colorMode: section.colorMode || 'light',
        }),
      });
      if (res.ok) {
        const { showToast } = await import('@/lib/hooks/useToast');
        showToast('Section saved as reusable', 'success');
        window.dispatchEvent(new Event('reusable-sections-changed'));
      } else {
        const data = await res.json().catch(() => ({}));
        const { showToast } = await import('@/lib/hooks/useToast');
        showToast(data.error || 'Failed to save section', 'error');
      }
    } catch {
      const { showToast } = await import('@/lib/hooks/useToast');
      showToast('Failed to save section', 'error');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-section-id={section.id}
      aria-label={`${def?.categoryLabel || 'Section'} — ${section.variantId.split('-').slice(1).join(' ')}, position ${index + 1} of ${total}`}
      onClick={() => selectSection(section.id)}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement)?.isContentEditable) return;
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectSection(section.id); }
        if (e.key === 'Escape') { e.preventDefault(); selectSection(null); }
      }}
      className="p-[6px] outline-none cursor-grab active:cursor-grabbing"
    >
      <div className={`relative bg-white rounded-[12px] overflow-visible transition-all ${
        isAiGenerating
          ? 'border-2 border-dashed ai-generating-border'
          : isSelected
            ? 'border-2 border-black border-dashed'
            : 'border-2 border-transparent hover:border-[#e6e6e6]'
      }`}>
        <div className="overflow-hidden rounded-[10px]" {...(isAiChanged ? { 'data-ai-changed': 'true' } : {})}>
          <SectionErrorBoundary sectionId={section.id} variantId={section.variantId}>
            <div className={isAiGenerating ? 'animate-pulse' : ''}>
              <Component content={section.content} colorMode={section.colorMode || 'light'} sectionId={section.id} />
            </div>
          </SectionErrorBoundary>
        </div>

        {/* Floating action buttons */}
        {isSelected && !isAiGenerating && (
          <SectionActions
            onDuplicate={() => duplicateSection(section.id)}
            onEditWithAi={() => { selectSection(section.id); onEditWithAi?.(); }}
            onSaveReusable={handleSaveReusable}
            onDelete={() => removeSection(section.id)}
          />
        )}
      </div>
    </div>
  );
}

interface CanvasProps {
  liveMessage?: string;
  setLiveMessage?: (msg: string) => void;
  isImporting?: boolean;
  backgroundColor?: string;
  onEditWithAi?: () => void;
  aiGeneratingSectionId?: string | null;
  aiChangedSectionId?: string | null;
}

export default function Canvas({ liveMessage, setLiveMessage, isImporting, backgroundColor, onEditWithAi, aiGeneratingSectionId, aiChangedSectionId }: CanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sections = useBuilderStore(s => {
    const proj = s.projects.find(p => p.id === s.activeProjectId);
    const page = proj?.pages.find(pg => pg.id === proj.activePageId);
    return page?.sections || [];
  });
  const moveSection = useBuilderStore(s => s.moveSection);
  const addSectionAt = useBuilderStore(s => s.addSection);
  const insertSectionAt = useBuilderStore(s => s.insertSectionAt);
  const selectSection = useBuilderStore(s => s.selectSection);
  const selectedSectionId = useBuilderStore(s => s.selectedSectionId);
  const viewport = useBuilderStore(s => s.viewport);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const getDropIndex = useCallback((y: number) => {
    if (!scrollRef.current) return sections.length;
    const sectionEls = scrollRef.current.querySelectorAll('[data-section-id]');
    for (let i = 0; i < sectionEls.length; i++) {
      const rect = sectionEls[i].getBoundingClientRect();
      if (y < rect.top + rect.height / 2) return i;
    }
    return sections.length;
  }, [sections.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('application/structr-section')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
    setDropIndex(getDropIndex(e.clientY));
  }, [getDropIndex]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only reset if actually leaving the canvas
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
    setDropIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setDropIndex(null);
    const data = e.dataTransfer.getData('application/structr-section');
    if (!data) return;
    try {
      const { category, variantId } = JSON.parse(data);
      const idx = getDropIndex(e.clientY);
      if (insertSectionAt) {
        insertSectionAt(category as SectionCategory, variantId, idx);
      } else {
        addSectionAt(category as SectionCategory, variantId);
      }
    } catch {}
  }, [getDropIndex, insertSectionAt, addSectionAt]);

  const prevCountRef = useRef(sections.length);
  useEffect(() => {
    if (setLiveMessage && sections.length !== prevCountRef.current) {
      if (sections.length > prevCountRef.current) setLiveMessage(`Section added. ${sections.length} sections total.`);
      else if (sections.length < prevCountRef.current) setLiveMessage(`Section removed. ${sections.length} sections total.`);
      prevCountRef.current = sections.length;
    }
  }, [sections.length, setLiveMessage]);

  useEffect(() => {
    if (selectedSectionId && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-section-id="${selectedSectionId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedSectionId]);

  const viewportClass = viewport === 'tablet' ? 'max-w-[768px] mx-auto' : viewport === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full px-[64px]';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);
    moveSection(oldIndex, newIndex);
    if (setLiveMessage) setLiveMessage(`Section moved from position ${oldIndex + 1} to position ${newIndex + 1}.`);
  };

  if (sections.length === 0) {
    // Importing skeleton
    if (isImporting) {
      return (
        <main id="canvas" aria-label="Canvas" className="flex-1 overflow-y-auto" style={{ backgroundColor: backgroundColor || '#f2f2f2' }}>
          <div className="w-full px-[64px] flex flex-col mt-[48px] mb-[48px]">
            {/* Skeleton sections */}
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-[6px]">
                <div className="bg-white rounded-[12px] overflow-hidden animate-pulse">
                  <div className={`p-8 ${i === 1 ? 'h-[60px]' : i === 2 ? 'h-[200px]' : i === 3 ? 'h-[80px]' : 'h-[160px]'}`}>
                    <div className="flex flex-col items-center gap-3">
                      {i === 1 && (
                        <div className="flex items-center justify-between w-full">
                          <div className="bg-[#e6e6e6] h-4 w-24 rounded" />
                          <div className="flex gap-4">
                            <div className="bg-[#e6e6e6] h-3 w-14 rounded" />
                            <div className="bg-[#e6e6e6] h-3 w-14 rounded" />
                            <div className="bg-[#e6e6e6] h-3 w-14 rounded" />
                          </div>
                          <div className="bg-[#1c1c1c] h-7 w-20 rounded-[6px] opacity-20" />
                        </div>
                      )}
                      {i === 2 && (
                        <>
                          <div className="bg-[#e6e6e6] h-8 w-80 rounded mt-8" />
                          <div className="bg-[#e6e6e6] h-4 w-64 rounded" />
                          <div className="flex gap-3 mt-4">
                            <div className="bg-[#1c1c1c] h-8 w-24 rounded-[6px] opacity-20" />
                            <div className="bg-[#e6e6e6] h-8 w-24 rounded-[6px]" />
                          </div>
                        </>
                      )}
                      {i === 3 && (
                        <div className="flex gap-4 w-full justify-center">
                          {[1,2,3,4,5].map(j => <div key={j} className="bg-[#e6e6e6] h-6 w-16 rounded" />)}
                        </div>
                      )}
                      {i === 4 && (
                        <>
                          <div className="bg-[#e6e6e6] h-6 w-48 rounded mt-4" />
                          <div className="bg-[#e6e6e6] h-3 w-64 rounded" />
                          <div className="flex gap-4 w-full mt-4">
                            {[1,2,3].map(j => (
                              <div key={j} className="flex-1 bg-[#f5f5f5] rounded-[8px] p-4 h-24">
                                <div className="bg-[#e6e6e6] h-4 w-4 rounded mb-3" />
                                <div className="bg-[#e6e6e6] h-3 w-20 rounded mb-2" />
                                <div className="bg-[#e6e6e6] h-2 w-full rounded" />
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-2 py-4">
              <svg width="16" height="16" viewBox="0 0 16 16" className="animate-spin">
                <circle cx="8" cy="8" r="6" fill="none" stroke="#e6e6e6" strokeWidth="2" />
                <circle cx="8" cy="8" r="6" fill="none" stroke="#1c1c1c" strokeWidth="2"
                  strokeDasharray="37.7" strokeDashoffset="28" strokeLinecap="round" />
              </svg>
              <span className="text-[12px] text-[#808080]">Importing homepage...</span>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main
        id="canvas"
        aria-label="Canvas"
        className={`flex-1 flex items-center justify-center transition-colors ${isDraggingOver ? 'bg-[#e8e8e8]' : ''}`}
        style={{ backgroundColor: isDraggingOver ? undefined : (backgroundColor || '#f2f2f2') }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className={`w-16 h-16 rounded-[12px] mx-auto mb-4 flex items-center justify-center transition-colors ${isDraggingOver ? 'bg-[#1c1c1c] text-white' : 'bg-[#e6e6e6]'}`}>
            <span className="text-2xl">{isDraggingOver ? '↓' : '+'}</span>
          </div>
          <p className="text-[14px] font-medium text-[#1c1c1c]">
            {isDraggingOver ? 'Drop here to add' : 'No sections yet'}
          </p>
          <p className="text-[12px] text-[#808080] mt-1">
            {isDraggingOver ? '' : 'Drag a section from the left panel or click to add'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      id="canvas"
      aria-label="Canvas"
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: backgroundColor || '#f2f2f2' }}
      onClick={(e) => {
        // Deselect when clicking canvas background (not on a section)
        const target = e.target as HTMLElement;
        if (target === e.currentTarget || !target.closest('[data-section-id]')) {
          selectSection(null);
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className={`${viewportClass} flex flex-col mt-[48px] mb-[48px] transition-all @container`}>
            {sections.map((section, i) => (
              <div key={section.id}>
                {/* Drop indicator line */}
                {isDraggingOver && dropIndex === i && (
                  <div className="mx-[6px] h-[3px] bg-[#1c1c1c] rounded-full my-[2px] transition-all" />
                )}
                <SortableSection
                  section={section}
                  index={i}
                  total={sections.length}
                  onEditWithAi={onEditWithAi}
                  isAiGenerating={aiGeneratingSectionId === section.id}
                  isAiChanged={aiChangedSectionId === section.id}
                />
              </div>
            ))}
            {/* Drop indicator at end */}
            {isDraggingOver && dropIndex === sections.length && (
              <div className="mx-[6px] h-[3px] bg-[#1c1c1c] rounded-full my-[2px] transition-all" />
            )}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  );
}
