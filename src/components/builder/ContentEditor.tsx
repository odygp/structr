'use client';
import { useBuilderStore } from '@/lib/store';
import { getDefinition } from '@/lib/registry';
import { FieldSchema, ContentItem } from '@/lib/types';
import { Plus, X, Minus, Recycle, Trash2, ChevronDown } from 'lucide-react';
import { showToast } from '@/lib/hooks/useToast';
import { useId } from 'react';

/* ── Custom Switch (Figma spec) ── */
function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <div className="flex items-center gap-[10px]">
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`relative w-[32.4px] h-[18px] rounded-[90px] transition-colors flex-shrink-0 ${checked ? 'bg-[#1c1c1c]' : 'bg-[#d2d5da]'}`}
      >
        <div
          className={`absolute top-[1.8px] w-[14.4px] h-[14.4px] bg-white rounded-[90px] shadow-[0px_1.8px_3.6px_0px_rgba(39,39,39,0.1)] transition-all ${
            checked ? 'left-[16.2px]' : 'left-[1.8px]'
          }`}
        />
      </button>
      <span className="text-[12px] font-normal text-[#1c1c1c]">{label}</span>
    </div>
  );
}

/* ── Segmented Toggle ── */
function SegmentedToggle({ options, value, onChange, label }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <span className="text-[11px] font-normal text-[#808080]">{label}</span>
      <div className="bg-[#f5f5f5] flex items-center h-[32px] rounded-[8px] p-[2px]" role="radiogroup">
        {options.map(opt => (
          <button
            key={opt.value}
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 h-full flex items-center justify-center rounded-[6px] text-[11px] whitespace-nowrap transition-colors ${
              value === opt.value
                ? 'bg-white font-medium text-[#1c1c1c]'
                : 'font-normal text-[#808080]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FieldEditor({ field, sectionId, value }: { field: FieldSchema; sectionId: string; value: any }) {
  const { updateContent, updateItemField, addItem, removeItem } = useBuilderStore();

  if (field.type === 'text' || field.type === 'textarea') return null;

  if (field.type === 'boolean') {
    return (
      <Switch
        checked={!!value}
        onChange={() => updateContent(sectionId, field.key, !value)}
        label={field.label}
      />
    );
  }

  if (field.type === 'items' && field.itemFields) {
    const items = (value as ContentItem[]) || [];
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-normal text-[#808080]">{field.label}</span>
          <button
            onClick={() => addItem(sectionId, field.key)}
            aria-label={`Add ${field.label.toLowerCase()} item`}
            className="flex items-center gap-1 text-[11px] text-[#1c1c1c] hover:text-[#808080]"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <fieldset key={idx} className="p-3 bg-[#f5f5f5] rounded-[8px] relative border-0">
              <legend className="sr-only">{field.label} item {idx + 1}</legend>
              <button
                onClick={() => removeItem(sectionId, field.key, idx)}
                aria-label={`Remove item ${idx + 1}`}
                className="absolute top-2 right-2 p-1 hover:bg-[#e6e6e6] rounded text-[#808080] hover:text-[#1c1c1c]"
              >
                <X className="w-3 h-3" />
              </button>
              {field.itemFields!.map(subField => {
                const subValue = item[subField.key] || '';
                if (subField.type === 'boolean') {
                  return (
                    <div key={subField.key} className="mb-2">
                      <Switch
                        checked={!!item[subField.key]}
                        onChange={() => updateItemField(sectionId, field.key, idx, subField.key, !item[subField.key])}
                        label={subField.label}
                      />
                    </div>
                  );
                }
                const subId = `${sectionId}-${field.key}-${idx}-${subField.key}`;
                return (
                  <div key={subField.key} className="mb-2">
                    <label htmlFor={subId} className="block text-[11px] text-[#808080] mb-1">{subField.label}</label>
                    {subField.type === 'textarea' ? (
                      <textarea
                        id={subId}
                        value={subValue as string}
                        onChange={(e) => updateItemField(sectionId, field.key, idx, subField.key, e.target.value)}
                        rows={2}
                        className="w-full px-[12px] py-[8px] text-[12px] text-[#1c1c1c] bg-white border border-[#e6e6e6] rounded-[8px] outline-none resize-none focus:border-[#1c1c1c]"
                      />
                    ) : (
                      <input
                        id={subId}
                        type="text"
                        value={subValue as string}
                        onChange={(e) => updateItemField(sectionId, field.key, idx, subField.key, e.target.value)}
                        className="w-full px-[12px] py-[8px] text-[12px] text-[#1c1c1c] bg-white border border-[#e6e6e6] rounded-[8px] outline-none focus:border-[#1c1c1c]"
                      />
                    )}
                  </div>
                );
              })}
            </fieldset>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

const gridCategories = ['features', 'pricing', 'team', 'stats', 'gallery', 'blog', 'store', 'showcase', 'testimonials'];

export default function ContentEditor({ onEditWithAi }: { onEditWithAi?: () => void }) {
  const variantSelectId = useId();
  const sections = useBuilderStore(s => {
    const proj = s.projects.find(p => p.id === s.activeProjectId);
    const page = proj?.pages.find(pg => pg.id === proj.activePageId);
    return page?.sections || [];
  });
  const { selectedSectionId, changeVariant, toggleColorMode, updateSectionSpacing, updateSectionColumns, removeSection, duplicateSection } = useBuilderStore();
  const selectedSection = sections.find(s => s.id === selectedSectionId);

  if (!selectedSection) {
    return (
      <aside aria-label="Content editor" className="w-[240px] border-l border-[#e6e6e6] bg-white flex-shrink-0 flex items-center justify-center">
        <p className="text-[12px] text-[#808080]">Select a section to edit</p>
      </aside>
    );
  }

  const def = getDefinition(selectedSection.category);
  if (!def) return null;

  const showColumns = gridCategories.includes(selectedSection.category);
  const currentColumns = Number(selectedSection.content._columns) || 3;

  return (
    <aside aria-label="Content editor" className="w-[240px] border-l border-[#e6e6e6] bg-white flex-shrink-0 overflow-y-auto flex flex-col h-full">
      {/* Top: Settings */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[16px] p-[12px]">
          {/* Section title */}
          <h3 className="text-[14px] font-medium leading-[14px] tracking-[-0.28px] text-[#1c1c1c]">
            {def.categoryLabel}
          </h3>

          {/* Divider */}
          <div className="bg-[#e6e6e6] h-px opacity-60 w-full" />

          {/* Variant dropdown */}
          <div className="flex flex-col gap-[8px]">
            <span className="text-[11px] font-normal text-[#808080]">Variant</span>
            <div className="relative">
              <select
                id={variantSelectId}
                value={selectedSection.variantId}
                onChange={(e) => changeVariant(selectedSection.id, e.target.value)}
                className="w-full bg-[#f5f5f5] h-[36px] rounded-[8px] px-[12px] text-[12px] text-[#1c1c1c] appearance-none outline-none cursor-pointer"
              >
                {def.variants.map(v => (
                  <option key={v.variantId} value={v.variantId}>{v.variantName}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#1c1c1c] pointer-events-none" />
            </div>
          </div>

          {/* Divider */}
          <div className="bg-[#e6e6e6] h-px opacity-60 w-full" />

          {/* Color Mode */}
          <SegmentedToggle
            label="Color Mode"
            options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
            value={selectedSection.colorMode || 'light'}
            onChange={(v) => {
              if ((selectedSection.colorMode || 'light') !== v) toggleColorMode(selectedSection.id);
            }}
          />

          {/* Divider */}
          <div className="bg-[#e6e6e6] h-px opacity-60 w-full" />

          {/* Switches + controls */}
          <div className="flex flex-col gap-[16px]">
            {def.contentSchema
              .filter(f => f.type === 'boolean')
              .map(field => (
                <FieldEditor key={field.key} field={field} sectionId={selectedSection.id} value={selectedSection.content[field.key]} />
              ))}
          </div>

          {/* Items editors */}
          {def.contentSchema
            .filter(f => f.type === 'items')
            .map(field => (
              <FieldEditor key={field.key} field={field} sectionId={selectedSection.id} value={selectedSection.content[field.key]} />
            ))}
        </div>
      </div>

      {/* Bottom: Actions (sticky) — Figma: 224x32 rows, 4px gap, 8px container padding */}
      <div className="p-[8px] flex-shrink-0">
        <div className="flex flex-col gap-[4px]">
          <button
            onClick={() => duplicateSection(selectedSection.id)}
            className="h-[32px] flex items-center justify-between px-[10px] rounded-[8px] w-full hover:bg-[#f5f5f5] transition-colors"
          >
            <span className="text-[14px] text-[#1c1c1c]">Duplicate Section</span>
            <Plus className="w-[16px] h-[16px] text-[#1c1c1c]" />
          </button>
          <button
            onClick={onEditWithAi}
            className="h-[32px] flex items-center justify-between px-[10px] rounded-[8px] w-full hover:bg-[#f5f5f5] transition-colors"
          >
            <span className="text-[14px] text-[#1c1c1c]">Edit with AI</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11l-1.5-3.5L3 6l3.5-1.5L8 1zM3 11l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" stroke="#1c1c1c" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/reusable-sections', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: selectedSection.variantId.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    category: selectedSection.category,
                    variantId: selectedSection.variantId,
                    content: selectedSection.content,
                    colorMode: selectedSection.colorMode || 'light',
                  }),
                });
                if (res.ok) {
                  showToast('Section saved as reusable', 'success');
                  window.dispatchEvent(new Event('reusable-sections-changed'));
                } else showToast('Failed to save section', 'error');
              } catch { showToast('Failed to save section', 'error'); }
            }}
            className="h-[32px] flex items-center justify-between px-[10px] rounded-[8px] w-full hover:bg-[#f5f5f5] transition-colors"
          >
            <span className="text-[14px] text-[#1c1c1c]">Save as reusable</span>
            <Recycle className="w-[16px] h-[16px] text-[#1c1c1c]" />
          </button>
          <button
            onClick={() => removeSection(selectedSection.id)}
            className="h-[32px] flex items-center justify-between px-[10px] rounded-[8px] w-full hover:bg-[#f5f5f5] transition-colors opacity-70 hover:opacity-100"
          >
            <span className="text-[14px] text-[#1c1c1c]">Delete Section</span>
            <Trash2 className="w-[16px] h-[16px] text-[#1c1c1c]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
