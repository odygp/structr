'use client';
import { useBuilderStore } from '@/lib/store';
import { getDefinition, getVariant } from '@/lib/registry';
import { FieldSchema, ContentItem } from '@/lib/types';
import { Plus, Trash2, X, Minus } from 'lucide-react';
import { useId } from 'react';

function FieldEditor({
  field, sectionId, value
}: {
  field: FieldSchema; sectionId: string; value: any;
}) {
  const { updateContent, updateItemField, addItem, removeItem } = useBuilderStore();
  const fieldId = useId();

  if (field.type === 'text') {
    return (
      <div className="mb-4">
        <label htmlFor={fieldId} className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
        <input
          id={fieldId}
          type="text"
          value={(value as string) || ''}
          onChange={(e) => updateContent(sectionId, field.key, e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="mb-4">
        <label htmlFor={fieldId} className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
        <textarea
          id={fieldId}
          value={(value as string) || ''}
          onChange={(e) => updateContent(sectionId, field.key, e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
      </div>
    );
  }

  if (field.type === 'boolean') {
    return (
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => updateContent(sectionId, field.key, !value)}
          role="switch"
          aria-checked={!!value}
          aria-label={field.label}
          className={`relative w-10 h-6 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'left-5' : 'left-1'}`} />
        </button>
        <span className="text-xs font-medium text-gray-700">{field.label}</span>
      </div>
    );
  }

  if (field.type === 'items' && field.itemFields) {
    const items = (value as ContentItem[]) || [];
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">{field.label}</span>
          <button
            onClick={() => addItem(sectionId, field.key)}
            aria-label={`Add ${field.label.toLowerCase()} item`}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3 h-3" aria-hidden="true" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <fieldset key={idx} className="p-3 bg-gray-50 rounded-lg relative border-0">
              <legend className="sr-only">{field.label} item {idx + 1}</legend>
              <button
                onClick={() => removeItem(sectionId, field.key, idx)}
                aria-label={`Remove ${field.label.toLowerCase()} item ${idx + 1}`}
                className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-500"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
              {field.itemFields!.map(subField => {
                const subValue = item[subField.key] || '';
                if (subField.type === 'boolean') {
                  return (
                    <div key={subField.key} className="mb-2 flex items-center gap-2">
                      <button
                        onClick={() => updateItemField(sectionId, field.key, idx, subField.key, !item[subField.key])}
                        role="switch"
                        aria-checked={!!item[subField.key]}
                        aria-label={subField.label}
                        className={`relative w-8 h-5 rounded-full transition-colors ${item[subField.key] ? 'bg-blue-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item[subField.key] ? 'left-3.5' : 'left-0.5'}`} />
                      </button>
                      <span className="text-xs text-gray-600">{subField.label}</span>
                    </div>
                  );
                }
                if (subField.type === 'textarea') {
                  const subId = `${sectionId}-${field.key}-${idx}-${subField.key}`;
                  return (
                    <div key={subField.key} className="mb-2">
                      <label htmlFor={subId} className="block text-xs text-gray-600 mb-1">{subField.label}</label>
                      <textarea
                        id={subId}
                        value={subValue as string}
                        onChange={(e) => updateItemField(sectionId, field.key, idx, subField.key, e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1.5 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      />
                    </div>
                  );
                }
                const subId = `${sectionId}-${field.key}-${idx}-${subField.key}`;
                return (
                  <div key={subField.key} className="mb-2">
                    <label htmlFor={subId} className="block text-xs text-gray-600 mb-1">{subField.label}</label>
                    <input
                      id={subId}
                      type="text"
                      value={subValue as string}
                      onChange={(e) => updateItemField(sectionId, field.key, idx, subField.key, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
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

const gridCategories = ['features', 'pricing', 'team', 'stats', 'gallery', 'blog'];

export default function ContentEditor() {
  const variantSelectId = useId();
  const sections = useBuilderStore(s => {
    const proj = s.projects.find(p => p.id === s.activeProjectId);
    const page = proj?.pages.find(pg => pg.id === proj.activePageId);
    return page?.sections || [];
  });
  const { selectedSectionId, changeVariant, toggleColorMode, updateSectionSpacing, updateSectionColumns } = useBuilderStore();
  const selectedSection = sections.find(s => s.id === selectedSectionId);

  if (!selectedSection) {
    return (
      <aside aria-label="Content editor" className="w-80 border-l border-gray-200 bg-white flex-shrink-0 flex items-center justify-center">
        <p className="text-sm text-gray-500">Select a section to edit</p>
      </aside>
    );
  }

  const def = getDefinition(selectedSection.category);
  if (!def) return null;

  const showColumns = gridCategories.includes(selectedSection.category);
  const currentColumns = (Number(selectedSection.content._columns) || 3);

  return (
    <aside aria-label="Content editor" className="w-80 border-l border-gray-200 bg-white flex-shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">{def.categoryLabel}</h3>
        <div className="mt-2">
          <label htmlFor={variantSelectId} className="block text-xs text-gray-600 mb-1">Variant</label>
          <select
            id={variantSelectId}
            value={selectedSection.variantId}
            onChange={(e) => changeVariant(selectedSection.id, e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {def.variants.map(v => (
              <option key={v.variantId} value={v.variantId}>{v.variantName}</option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <span className="block text-xs text-gray-600 mb-1" id="color-mode-label">Color Mode</span>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden" role="radiogroup" aria-labelledby="color-mode-label">
            <button
              role="radio"
              aria-checked={selectedSection.colorMode === 'light'}
              onClick={() => selectedSection.colorMode === 'dark' && toggleColorMode(selectedSection.id)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${selectedSection.colorMode === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'bg-gray-100 text-gray-600'}`}
            >
              Light
            </button>
            <button
              role="radio"
              aria-checked={selectedSection.colorMode === 'dark'}
              onClick={() => selectedSection.colorMode === 'light' && toggleColorMode(selectedSection.id)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${selectedSection.colorMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Dark
            </button>
          </div>
        </div>
        <div className="mt-3">
          <span className="block text-xs text-gray-600 mb-1" id="spacing-label">Spacing</span>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden" role="radiogroup" aria-labelledby="spacing-label">
            {(['compact', 'default', 'spacious'] as const).map(sp => (
              <button
                key={sp}
                role="radio"
                aria-checked={(selectedSection.content._spacing || 'default') === sp}
                onClick={() => updateSectionSpacing(selectedSection.id, sp)}
                className={`flex-1 py-2 text-xs font-medium capitalize ${(selectedSection.content._spacing || 'default') === sp ? 'bg-white text-gray-900 shadow-sm' : 'bg-gray-100 text-gray-600'}`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>
        {showColumns && (
          <div className="mt-3">
            <span className="block text-xs text-gray-600 mb-1" id="columns-label">Columns</span>
            <div className="flex items-center gap-2" role="group" aria-labelledby="columns-label">
              <button
                onClick={() => currentColumns > 2 && updateSectionColumns(selectedSection.id, currentColumns - 1)}
                disabled={currentColumns <= 2}
                aria-label="Decrease columns"
                className="p-1.5 border border-gray-400 rounded-lg hover:bg-gray-100 text-gray-700 disabled:opacity-30"
              >
                <Minus className="w-3 h-3" aria-hidden="true" />
              </button>
              <span className="text-sm font-semibold text-gray-900 w-6 text-center" aria-live="polite">{currentColumns}</span>
              <button
                onClick={() => currentColumns < 4 && updateSectionColumns(selectedSection.id, currentColumns + 1)}
                disabled={currentColumns >= 4}
                aria-label="Increase columns"
                className="p-1.5 border border-gray-400 rounded-lg hover:bg-gray-100 text-gray-700 disabled:opacity-30"
              >
                <Plus className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        {def.contentSchema.map(field => (
          <FieldEditor
            key={field.key}
            field={field}
            sectionId={selectedSection.id}
            value={selectedSection.content[field.key]}
          />
        ))}
      </div>
    </aside>
  );
}
