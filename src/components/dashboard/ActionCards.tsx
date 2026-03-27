'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Globe } from 'lucide-react';
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
    } catch {} finally { setCreating(false); }
  };

  const cards = [
    { icon: <Plus size={16} />, label: 'New Blank project', onClick: handleNewBlank, disabled: creating },
    { icon: <FileText size={16} />, label: 'Choose a template', onClick: () => {}, disabled: true },
    { icon: <WebsiteIcon />, label: 'Import a website', onClick: () => setImportModalOpen(true), disabled: false },
    { icon: <OctopusIcon />, label: 'Import from Octopus', onClick: () => {}, disabled: true },
  ];

  return (
    <>
      <div className="flex gap-[12px]">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={card.onClick}
            disabled={card.disabled}
            className="flex-1 border border-[#ebebeb] rounded-[20px] h-[112px] p-[16px] flex flex-col items-start justify-between hover:border-[#d4d4d4] hover:bg-white transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="bg-white flex items-center p-[8px] rounded-[8px]">
              <span className="text-[#34322d]">{card.icon}</span>
            </div>
            <span className="text-[16px] font-medium leading-[16px] tracking-[-0.32px] text-[#34322d]">
              {card.label}
            </span>
          </button>
        ))}
      </div>

      {importModalOpen && <ImportWebsiteModal onClose={() => setImportModalOpen(false)} />}
    </>
  );
}

function WebsiteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5S11.59 1.5 8 1.5zm0 1c.55 0 1.24.56 1.79 1.74.22.47.4 1.02.53 1.63H5.68c.13-.61.31-1.16.53-1.63C6.76 3.06 7.45 2.5 8 2.5zM5.5 5.87H3.08A5.51 5.51 0 0 1 5.5 3.29v2.58zm-2.42 1H5.5V8.5H3.08c-.05-.33-.08-.66-.08-1 0-.22.02-.43.05-.63h.03zM5.5 9.5v2.21A5.51 5.51 0 0 1 3.08 9.5H5.5zm.18 2.76c-.22-.47-.4-1.02-.53-1.63h4.7c-.13.61-.31 1.16-.53 1.63C8.77 12.94 8.08 13.5 7.53 13.5c-.55 0-1.24-.56-1.85-1.24zm5.24-2.76h2.42A5.51 5.51 0 0 1 10.92 12v-.5h-.08zM12.92 8.5H10.5V6.87h2.42c.03.2.05.41.05.63 0 .34-.03.67-.05 1zM10.5 5.87V3.29a5.51 5.51 0 0 1 2.42 2.58H10.5z" fill="#34322d"/>
    </svg>
  );
}

function OctopusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2C5.24 2 3 4.24 3 7c0 1.1.36 2.12.97 2.95-.06.35-.12.73-.18 1.13-.12.79-.24 1.69-.29 2.42h1c.05-.68.16-1.5.27-2.23.06-.37.12-.72.18-1.02A4.97 4.97 0 0 0 8 12a4.97 4.97 0 0 0 3.05-1.75c.06.3.12.65.18 1.02.11.73.22 1.55.27 2.23h1c-.05-.73-.17-1.63-.29-2.42-.06-.4-.12-.78-.18-1.13A4.98 4.98 0 0 0 13 7c0-2.76-2.24-5-5-5zm0 1c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zM6.5 6a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1zm3 0a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1z" fill="#34322d"/>
    </svg>
  );
}
