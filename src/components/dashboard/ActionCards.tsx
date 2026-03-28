'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImportWebsiteModal from './ImportWebsiteModal';
import ImportOctopusModal from './ImportOctopusModal';
import TemplateWizard from './TemplateWizard';
import type { WizardData } from '@/lib/templates';

export default function ActionCards() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [octopusModalOpen, setOctopusModalOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

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

  const handleWizardComplete = async (data: WizardData) => {
    // Step 1: Create project + placeholder immediately (fast, no AI call)
    const res = await fetch('/api/ai/generate-from-wizard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create project');
    }

    const { projectId, pages, wizardData } = await res.json();

    // Step 2: Store pages in sessionStorage for background generation
    sessionStorage.setItem(
      `structr-wizard-${projectId}`,
      JSON.stringify({ pages, wizardData })
    );

    // Step 3: Redirect immediately
    router.push(`/builder?project=${projectId}`);
  };

  const cards = [
    { icon: '/Add.svg', label: 'New Blank project', onClick: handleNewBlank, disabled: creating },
    { icon: '/Document--multiple-01.svg', label: 'Guided Setup', onClick: () => setWizardOpen(true), disabled: false },
    { icon: '/Website.svg', label: 'Import a website', onClick: () => setImportModalOpen(true), disabled: false },
    { icon: '/octopus.svg', label: 'Import from Octopus', onClick: () => setOctopusModalOpen(true), disabled: false },
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
              <img src={card.icon} alt="" width={16} height={16} />
            </div>
            <span className="text-[16px] font-medium leading-[16px] tracking-[-0.32px] text-[#34322d]">
              {card.label}
            </span>
          </button>
        ))}
      </div>

      {importModalOpen && <ImportWebsiteModal onClose={() => setImportModalOpen(false)} />}
      {octopusModalOpen && <ImportOctopusModal onClose={() => setOctopusModalOpen(false)} />}
      {wizardOpen && <TemplateWizard onClose={() => setWizardOpen(false)} onComplete={handleWizardComplete} />}
    </>
  );
}
