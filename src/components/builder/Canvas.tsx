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
import { GripVertical, Copy, Trash2, ChevronUp, ChevronDown, Clipboard } from 'lucide-react';

function SortableSection({ section, index, total }: { section: PlacedSection; index: number; total: number }) {
  const { selectSection, selectedSectionId, removeSection, duplicateSection, moveSection, copySection } = useBuilderStore();
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
      data-section-id={section.id}
      tabIndex={0}
      role="article"
      aria-label={`${def?.categoryLabel || 'Section'} — ${section.variantId.split('-').slice(1).join(' ')}, position ${index + 1} of ${total}`}
      onClick={() => selectSection(section.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectSection(section.id);
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          selectSection(null);
        }
      }}
      className={`relative group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'}`}
    >
      {/* Controls bar */}
      <div
        role="toolbar"
        aria-label={`Controls for ${def?.categoryLabel || 'section'}`}
        className={`absolute top-0 left-0 right-0 z-10 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm border-b border-gray-200 text-xs ${isSelected || 'opacity-0 group-hover:opacity-100'} transition-opacity`}
      >
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          aria-roledescription="sortable"
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="w-3 h-3 text-gray-500" aria-hidden="true" />
        </button>
        <span className="text-gray-600 font-medium">{def?.categoryLabel} — {section.variantId.split('-').slice(1).join(' ')}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); if (index > 0) moveSection(index, index - 1); }}
            disabled={index === 0}
            aria-label="Move section up"
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            <ChevronUp className="w-3 h-3" aria-hidden="true" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (index < total - 1) moveSection(index, index + 1); }}
            disabled={index === total - 1}
            aria-label="Move section down"
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            <ChevronDown className="w-3 h-3" aria-hidden="true" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); copySection(section.id); }}
            aria-label="Copy section to clipboard"
            className="p-1.5 hover:bg-gray-100 rounded min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            <Clipboard className="w-3 h-3" aria-hidden="true" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}
            aria-label="Duplicate section"
            className="p-1.5 hover:bg-gray-100 rounded min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            <Copy className="w-3 h-3" aria-hidden="true" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
            aria-label="Delete section"
            className="p-1 hover:bg-red-50 rounded text-red-500"
          >
            <Trash2 className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>
      <Component content={section.content} colorMode={section.colorMode || 'light'} />
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

  // Track section count for live announcements
  const prevCountRef = useRef(sections.length);
  useEffect(() => {
    if (setLiveMessage && sections.length !== prevCountRef.current) {
      if (sections.length > prevCountRef.current) {
        setLiveMessage(`Section added. ${sections.length} sections total.`);
      } else if (sections.length < prevCountRef.current) {
        setLiveMessage(`Section removed. ${sections.length} sections total.`);
      }
      prevCountRef.current = sections.length;
    }
  }, [sections.length, setLiveMessage]);

  useEffect(() => {
    if (selectedSectionId && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-section-id="${selectedSectionId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedSectionId]);

  const viewportClass = viewport === 'tablet' ? 'max-w-[768px]' : viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-[1440px]';

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
    if (setLiveMessage) {
      setLiveMessage(`Section moved from position ${oldIndex + 1} to position ${newIndex + 1}.`);
    }
  };

  if (sections.length === 0) {
    return (
      <main id="canvas" aria-label="Canvas" className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center" aria-hidden="true">
            <span className="text-2xl text-gray-500">+</span>
          </div>
          <p className="text-gray-600 font-medium">No sections yet</p>
          <p className="text-gray-500 text-sm mt-1">Click a section from the left panel to add it</p>
        </div>
      </main>
    );
  }

  return (
    <main
      id="canvas"
      aria-label="Canvas"
      ref={scrollRef}
      className="flex-1 overflow-y-auto bg-gray-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) selectSection(null);
      }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className={`${viewportClass} mx-auto bg-white shadow-sm my-4 transition-all`}>
            {sections.map((section, i) => (
              <SortableSection key={section.id} section={section} index={i} total={sections.length} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  );
}
