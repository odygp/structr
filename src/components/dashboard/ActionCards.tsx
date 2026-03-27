'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Globe, Shapes } from 'lucide-react';
import ImportWebsiteModal from './ImportWebsiteModal';

export default function ActionCards() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const handleNewBlank = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Project' }),
      });
      if (res.ok) {
        const project = await res.json();
        router.push(`/builder?project=${project.id}`);
      }
    } catch (e) {
      console.error('Failed to create project:', e);
    } finally {
      setCreating(false);
    }
  };

  const cards = [
    {
      icon: <Plus size={18} />,
      label: 'New Blank project',
      onClick: handleNewBlank,
      disabled: creating,
    },
    {
      icon: <FileText size={18} />,
      label: 'Choose a template',
      onClick: () => {},
      disabled: true,
    },
    {
      icon: <Globe size={18} />,
      label: 'Import a website',
      onClick: () => setImportModalOpen(true),
      disabled: false,
    },
    {
      icon: <Shapes size={18} />,
      label: 'Import from Octopus',
      onClick: () => {},
      disabled: true,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-4 gap-3 mb-10">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={card.onClick}
            disabled={card.disabled}
            className="flex flex-col items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-gray-500">{card.icon}</span>
            <span className="text-sm font-medium text-gray-900">{card.label}</span>
          </button>
        ))}
      </div>

      {importModalOpen && (
        <ImportWebsiteModal onClose={() => setImportModalOpen(false)} />
      )}
    </>
  );
}
