'use client';

import { useEffect, useRef } from 'react';
import BuilderLayout from '@/components/builder/BuilderLayout';
import { useBuilderStore } from '@/lib/store';
import { sectionRegistry } from '@/lib/registry';
import { generateId } from '@/lib/utils';
import { PlacedSection } from '@/lib/types';

export default function ShowcasePage() {
  const populated = useRef(false);

  useEffect(() => {
    if (populated.current) return;
    populated.current = true;

    // Build all pages with all variants offline, then inject into store
    const pages: { id: string; name: string; sections: PlacedSection[] }[] = [];

    for (const cat of sectionRegistry) {
      const sections: PlacedSection[] = [];

      for (const variant of cat.variants) {
        sections.push({
          id: generateId(),
          category: cat.category,
          variantId: variant.variantId,
          content: { ...variant.defaultContent },
          colorMode: 'light',
        });
      }

      pages.push({
        id: generateId(),
        name: cat.categoryLabel,
        sections,
      });
    }

    // Create a new project with all these pages
    const projectId = generateId();
    const store = useBuilderStore.getState();

    // Directly set the store state with our pre-built project
    useBuilderStore.setState({
      projects: [
        {
          id: projectId,
          name: 'All Variants',
          pages,
          activePageId: pages[0].id,
        },
      ],
      activeProjectId: projectId,
      selectedSectionId: null,
      history: [],
      historyIndex: -1,
    });
  }, []);

  return <BuilderLayout />;
}
