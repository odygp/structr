'use client';
import { useBuilderStore } from '@/lib/store';
import { getDefinition, getVariant } from '@/lib/registry';
import { FieldSchema, ContentItem } from '@/lib/types';
import { Plus, Trash2, X, Minus } from 'lucide-react';

function FieldEditor({
  field, sectionId, value
}: {
  field: FieldSchema; sectionId: string; value: any;
}) {
  const { updateContent, updateItemField, addItem, removeItem } = useBuilderStore();

  if (field.type === 'text') {
    return (
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => updateContent(sectionId, field.key, e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
        <textarea
          value={(value as string) || ''}
          onChange={(e) => updateContent(sectionId, field.key, e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
      </div>
    );
  }

  if (field.type === 'boolean') {
    return (
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => updateContent(sectionId, field.key, !value)}
          className={`relative w-10 h-6 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'left-5' : 'left-1'}`} />
        </button>
        <label className="text-xs font-medium text-gray-700">{field.label}</label>
      </div>
    );
  }

  if (field.type === 'items' && field.itemFields) {
    const items = (value as ContentItem[]) || [];
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700">{field.label}</label>
          <button
            onClick={() => addItem(sectionId, field.key)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg relative">
              <button
                onClick={() => removeItem(sectionId, field.key, idx)}
                className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
              {field.itemFields!.map(subField => {
                const subValue = item[subField.key] || '';
                if (subField.type === 'boolean') {
                  return (
                    <div key={subField.key} className="mb-2 flex items-center gap-2">
                      <button
                        onClick={() => updateItemField(sectionId, field.key, idx, subField.key, !item[subField.key])}
                        className={`relative w-8 h-5 rounded-full transition-colors ${item[subField.key] ? 'bg-blue-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item[subField.key] ? 'left-3.5' : 'left-0.5'}`} />
                      </button>
                      <span className="text-xs text-gray-600">{subField.label}</span>
                    </div>
                  );
                }
                if (subField.type === 'textarea') {
                  return (
                    <div key={subField.key} className="mb-2">
                      <label className="block text-xs text-gray-500 mb-1">{subField.label}</label>
                      <textarea
                        value={subValue as string}
                        onChange={(e) => updateItemField(sectionId, field.key, idx, subField.key, e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      />
                    </div>
                  );
                }
                return (
                  <div key={subField.key} className="mb-2">
                    <label className="block text-xs text-gray-500 mb-1">{subField.label}</label>
                    <input
                      type="text"
                      value={subValue as string}
                      onChange={(e) => updateItemField(sectionId, field.key, idx, subField.key, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

const gridCategories = ['features', 'pricing', 'team', 'stats', 'gallery', 'blog'];

export default function ContentEditor() {
  const sections = useBuilderStore(s => {
    const proj = s.projects.find(p => p.id === s.activeProjectId);
    const page = proj?.pages.find(pg => pg.id === proj.activePageId);
    return page?.sections || [];
  });
  const { selectedSectionId, changeVariant, toggleColorMode, updateSectionSpacing, updateSectionColumns } = useBuilderStore();
  const selectedSection = sections.find(s => s.id === selectedSectionId);

  if (!selectedSection) {
    return (
      <div className="w-80 border-l border-gray-200 bg-white flex-shrink-0 flex items-center justify-center">
        <p className="text-sm text-gray-400">Select a section to edit</p>
      </div>
    );
  }

  const def = getDefinition(selectedSection.category);
  if (!def) return null;

  const showColumns = gridCategories.includes(selectedSection.category);
  const currentColumns = (Number(selectedSection.content._columns) || 3);

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex-shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">{def.categoryLabel}</h3>
        <div className="mt-2">
          <label className="block text-xs text-gray-500 mb-1">Variant</label>
          <select
            value={selectedSection.variantId}
            onChange={(e) => changeVariant(selectedSection.id, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {def.variants.map(v => (
              <option key={v.variantId} value={v.variantId}>{v.variantName}</option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">Color Mode</label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => selectedSection.colorMode === 'dark' && toggleColorMode(selectedSection.id)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${selectedSection.colorMode === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'bg-gray-50 text-gray-500'}`}
            >
              Light
            </button>
            <button
              onClick={() => selectedSection.colorMode === 'light' && toggleColorMode(selectedSection.id)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${selectedSection.colorMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500'}`}
            >
              Dark
            </button>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">Spacing</label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {(['compact', 'default', 'spacious'] as const).map(sp => (
              <button
                key={sp}
                onClick={() => updateSectionSpacing(selectedSection.id, sp)}
                className={`flex-1 py-2 text-xs font-medium capitalize ${(selectedSection.content._spacing || 'default') === sp ? 'bg-white text-gray-900 shadow-sm' : 'bg-gray-50 text-gray-500'}`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>
        {showColumns && (
          <div className="mt-3">
            <label className="block text-xs text-gray-500 mb-1">Columns</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => currentColumns > 2 && updateSectionColumns(selectedSection.id, currentColumns - 1)}
                disabled={currentColumns <= 2}
                className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-medium text-gray-700 w-6 text-center">{currentColumns}</span>
              <button
                onClick={() => currentColumns < 4 && updateSectionColumns(selectedSection.id, currentColumns + 1)}
                disabled={currentColumns >= 4}
                className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30"
              >
                <Plus className="w-3 h-3" />
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
    </div>
  );
}
