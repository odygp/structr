'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useBuilderStore } from '@/lib/store';
import { getDefinition } from '@/lib/registry';
import { componentRegistry } from '@/components/sections';
import { PlacedSection, SectionCategory } from '@/lib/types';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableSection({ section, index, total }: { section: PlacedSection; index: number; total: number }) {
  const { selectSection, selectedSectionId } = useBuilderStore();
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
      <div className={`bg-white rounded-[12px] overflow-hidden transition-all ${
        isSelected ? 'border-2 border-black border-dashed' : 'border-2 border-transparent hover:border-[#e6e6e6]'
      }`}>
        <Component content={section.content} colorMode={section.colorMode || 'light'} sectionId={section.id} />
      </div>
    </div>
  );
}

interface CanvasProps {
  liveMessage?: string;
  setLiveMessage?: (msg: string) => void;
}

export default function Canvas({ liveMessage, setLiveMessage }: CanvasProps) {
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
    return (
      <main
        id="canvas"
        aria-label="Canvas"
        className={`flex-1 flex items-center justify-center bg-[#f2f2f2] transition-colors ${isDraggingOver ? 'bg-[#e8e8e8]' : ''}`}
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
      className="flex-1 overflow-y-auto bg-[#f2f2f2]"
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
                <SortableSection section={section} index={i} total={sections.length} />
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
