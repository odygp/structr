'use client';

import { useEffect, useRef } from 'react';
import BuilderLayout from '@/components/builder/BuilderLayout';
import { useBuilderStore } from '@/lib/store';
import { sectionRegistry } from '@/lib/registry';

export default function ShowcasePage() {
  const populated = useRef(false);

  useEffect(() => {
    if (populated.current) return;
    populated.current = true;

    const state = useBuilderStore.getState();
    const proj = state.projects.find(p => p.id === state.activeProjectId);
    if (!proj) return;

    const categories = sectionRegistry;

    for (let ci = 0; ci < categories.length; ci++) {
      const cat = categories[ci];

      if (ci === 0) {
        // Use existing first page
        const firstPage = proj.pages[0];
        if (firstPage) {
          useBuilderStore.getState().renamePage(firstPage.id, cat.categoryLabel);
          useBuilderStore.getState().switchPage(firstPage.id);

          // Clear existing sections
          const currentSections = useBuilderStore.getState().projects
            .find(p => p.id === state.activeProjectId)?.pages
            .find(pg => pg.id === firstPage.id)?.sections || [];
          for (const s of [...currentSections]) {
            useBuilderStore.getState().removeSection(s.id);
          }

          // Add all variants
          for (const variant of cat.variants) {
            useBuilderStore.getState().addSection(cat.category, variant.variantId);
          }
        }
      } else {
        // Create new page
        useBuilderStore.getState().addPage(cat.categoryLabel);

        // Find last page
        const updatedProj = useBuilderStore.getState().projects.find(p => p.id === state.activeProjectId);
        const newPage = updatedProj?.pages[updatedProj.pages.length - 1];
        if (newPage) {
          useBuilderStore.getState().switchPage(newPage.id);

          for (const variant of cat.variants) {
            useBuilderStore.getState().addSection(cat.category, variant.variantId);
          }
        }
      }
    }

    // Switch to first page
    const finalProj = useBuilderStore.getState().projects.find(p => p.id === state.activeProjectId);
    if (finalProj?.pages[0]) {
      useBuilderStore.getState().switchPage(finalProj.pages[0].id);
    }
  }, []);

  return <BuilderLayout />;
}
