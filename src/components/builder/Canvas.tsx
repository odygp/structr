'use client';
import { useEffect, useRef } from 'react';
import { useBuilderStore } from '@/lib/store';
import { getDefinition } from '@/lib/registry';
import { componentRegistry } from '@/components/sections';
import { PlacedSection } from '@/lib/types';
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
      className="p-[6px] outline-none cursor-pointer"
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
  const selectSection = useBuilderStore(s => s.selectSection);
  const selectedSectionId = useBuilderStore(s => s.selectedSectionId);
  const viewport = useBuilderStore(s => s.viewport);

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

  const viewportClass = viewport === 'tablet' ? 'max-w-[768px]' : viewport === 'mobile' ? 'max-w-[375px]' : 'w-[820px]';

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
      <main id="canvas" aria-label="Canvas" className="flex-1 flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#e6e6e6] rounded-[12px] mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-[#808080]">+</span>
          </div>
          <p className="text-[14px] font-medium text-[#1c1c1c]">No sections yet</p>
          <p className="text-[12px] text-[#808080] mt-1">Click a section from the left panel to add it</p>
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
      onClick={(e) => { if (e.target === e.currentTarget) selectSection(null); }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className={`${viewportClass} mx-auto flex flex-col mt-[48px] mb-[48px] transition-all @container`}>
            {sections.map((section, i) => (
              <SortableSection key={section.id} section={section} index={i} total={sections.length} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  );
}
