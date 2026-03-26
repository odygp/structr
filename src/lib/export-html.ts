import { PlacedSection, SectionContent, ContentItem } from './types';
import { escapeHtml } from './utils';

type HtmlRenderer = (content: SectionContent) => string;

function renderItems(items: ContentItem[] | undefined, fallback: ContentItem[] = []): ContentItem[] {
  return Array.isArray(items) ? items : fallback;
}

function str(val: unknown): string {
  return typeof val === 'string' ? val : '';
}

const htmlRenderers: Record<string, HtmlRenderer> = {
  // ── Header ──
  'header-simple': (c) => {
    const links = renderItems(c.links as ContentItem[]);
    return `<header class="bg-white border-b border-gray-200 px-8 py-4">
  <div class="max-w-7xl mx-auto flex items-center justify-between">
    <div class="text-xl font-bold text-gray-900">${escapeHtml(str(c.logo))}</div>
    <nav class="flex items-center gap-8">
      ${links.map(l => `<span class="text-sm text-gray-600">${escapeHtml(str(l.label))}</span>`).join('\n      ')}
    </nav>
    <button class="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg">${escapeHtml(str(c.ctaText))}</button>
  </div>
</header>`;
  },

  'header-centered': (c) => {
    const links = renderItems(c.links as ContentItem[]);
    return `<header class="bg-white border-b border-gray-200 py-4">
  <div class="max-w-7xl mx-auto text-center">
    <div class="text-xl font-bold text-gray-900 mb-3">${escapeHtml(str(c.logo))}</div>
    <nav class="flex items-center justify-center gap-8">
      ${links.map(l => `<span class="text-sm text-gray-600">${escapeHtml(str(l.label))}</span>`).join('\n      ')}
      <button class="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg">${escapeHtml(str(c.ctaText))}</button>
    </nav>
  </div>
</header>`;
  },

  // ── Hero ──
  'hero-centered': (c) => `<section class="bg-gray-50 py-24 px-8">
  <div class="max-w-4xl mx-auto text-center">
    <h1 class="text-5xl font-bold text-gray-900 mb-6">${escapeHtml(str(c.title))}</h1>
    <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">${escapeHtml(str(c.subtitle))}</p>
    <div class="flex gap-4 justify-center">
      <button class="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium">${escapeHtml(str(c.ctaText))}</button>
      ${str(c.ctaSecondaryText) ? `<button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">${escapeHtml(str(c.ctaSecondaryText))}</button>` : ''}
    </div>
  </div>
</section>`,

  'hero-split': (c) => `<section class="py-24 px-8">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <h1 class="text-5xl font-bold text-gray-900 mb-6">${escapeHtml(str(c.title))}</h1>
      <p class="text-xl text-gray-600 mb-8">${escapeHtml(str(c.subtitle))}</p>
      <div class="flex gap-4">
        <button class="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium">${escapeHtml(str(c.ctaText))}</button>
        ${str(c.ctaSecondaryText) ? `<button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">${escapeHtml(str(c.ctaSecondaryText))}</button>` : ''}
      </div>
    </div>
    <div class="bg-gray-200 rounded-2xl h-80"></div>
  </div>
</section>`,

  // ── Features ──
  'features-grid': (c) => {
    const features = renderItems(c.features as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      ${features.map(f => `<div class="bg-gray-50 rounded-xl p-6">
        <div class="w-10 h-10 bg-gray-200 rounded-lg mb-4"></div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">${escapeHtml(str(f.title))}</h3>
        <p class="text-gray-600">${escapeHtml(str(f.description))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'features-alternating': (c) => {
    const features = renderItems(c.features as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="space-y-20">
      ${features.map((f, i) => `<div class="grid lg:grid-cols-2 gap-12 items-center">
        <div class="${i % 2 === 1 ? 'lg:order-2' : ''}">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">${escapeHtml(str(f.title))}</h3>
          <p class="text-gray-600 text-lg">${escapeHtml(str(f.description))}</p>
        </div>
        <div class="bg-gray-200 rounded-2xl h-64 ${i % 2 === 1 ? 'lg:order-1' : ''}"></div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  // ── Stats ──
  'stats-row': (c) => {
    const stats = renderItems(c.stats as ContentItem[]);
    return `<section class="py-16 px-8">
  <div class="max-w-7xl mx-auto text-center">
    <h2 class="text-3xl font-bold text-gray-900 mb-12">${escapeHtml(str(c.title))}</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      ${stats.map(s => `<div>
        <div class="text-4xl font-bold text-gray-900">${escapeHtml(str(s.value))}</div>
        <div class="text-sm text-gray-500 mt-1">${escapeHtml(str(s.label))}</div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'stats-with-description': (c) => {
    const stats = renderItems(c.stats as ContentItem[]);
    return `<section class="py-16 px-8 bg-gray-50">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">${escapeHtml(str(c.title))}</h2>
    <div class="bg-gray-100 rounded-2xl p-12">
      <div class="grid md:grid-cols-3 gap-12 text-center">
        ${stats.map(s => `<div>
          <div class="text-4xl font-bold text-gray-900">${escapeHtml(str(s.value))}</div>
          <div class="text-sm text-gray-500 mt-2">${escapeHtml(str(s.label))}</div>
        </div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>`;
  },

  // ── Pricing ──
  'pricing-3col': (c) => {
    const plans = renderItems(c.plans as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      ${plans.map(p => {
        const hl = p.highlighted === true || p.highlighted === 'true';
        const features = str(p.features).split(',').map(f => f.trim()).filter(Boolean);
        return `<div class="${hl ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-8">
        <h3 class="text-lg font-semibold ${hl ? '' : 'text-gray-900'}">${escapeHtml(str(p.name))}</h3>
        <p class="text-sm ${hl ? 'text-gray-300' : 'text-gray-500'} mt-1">${escapeHtml(str(p.description))}</p>
        <div class="mt-4 mb-6">
          <span class="text-4xl font-bold">${escapeHtml(str(p.price))}</span>
          <span class="text-sm ${hl ? 'text-gray-300' : 'text-gray-500'}">${escapeHtml(str(p.period))}</span>
        </div>
        <ul class="space-y-3 mb-8">
          ${features.map(f => `<li class="flex items-center gap-2 text-sm ${hl ? 'text-gray-200' : 'text-gray-600'}">
            <span>✓</span> ${escapeHtml(f)}
          </li>`).join('\n          ')}
        </ul>
        <button class="w-full py-3 rounded-lg font-medium ${hl ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}">${escapeHtml(str(p.ctaText))}</button>
      </div>`;
      }).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'pricing-2col': (c) => {
    const plans = renderItems(c.plans as ContentItem[]).slice(0, 2);
    return `<section class="py-20 px-8">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid md:grid-cols-2 gap-8">
      ${plans.map(p => {
        const hl = p.highlighted === true || p.highlighted === 'true';
        const features = str(p.features).split(',').map(f => f.trim()).filter(Boolean);
        return `<div class="${hl ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-10">
        <h3 class="text-xl font-semibold ${hl ? '' : 'text-gray-900'}">${escapeHtml(str(p.name))}</h3>
        <div class="mt-4 mb-6">
          <span class="text-4xl font-bold">${escapeHtml(str(p.price))}</span>
          <span class="${hl ? 'text-gray-300' : 'text-gray-500'}">${escapeHtml(str(p.period))}</span>
        </div>
        <ul class="space-y-3 mb-8">
          ${features.map(f => `<li class="text-sm ${hl ? 'text-gray-200' : 'text-gray-600'}">✓ ${escapeHtml(f)}</li>`).join('\n          ')}
        </ul>
        <button class="w-full py-3 rounded-lg font-medium ${hl ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}">${escapeHtml(str(p.ctaText))}</button>
      </div>`;
      }).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  // ── Testimonials ──
  'testimonials-cards': (c) => {
    const testimonials = renderItems(c.testimonials as ContentItem[]);
    return `<section class="py-20 px-8 bg-gray-50">
  <div class="max-w-7xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">${escapeHtml(str(c.title))}</h2>
    <div class="grid md:grid-cols-3 gap-8">
      ${testimonials.map(t => `<div class="bg-white rounded-xl p-6 shadow-sm">
        <p class="text-gray-600 mb-6">"${escapeHtml(str(t.quote))}"</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div>
            <div class="font-medium text-gray-900 text-sm">${escapeHtml(str(t.author))}</div>
            <div class="text-gray-500 text-xs">${escapeHtml(str(t.role))}</div>
          </div>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'testimonials-single': (c) => {
    const testimonials = renderItems(c.testimonials as ContentItem[]);
    const t = testimonials[0] || { quote: '', author: '', role: '' };
    return `<section class="py-20 px-8">
  <div class="max-w-3xl mx-auto text-center">
    <h2 class="text-3xl font-bold text-gray-900 mb-12">${escapeHtml(str(c.title))}</h2>
    <p class="text-2xl text-gray-700 mb-8 italic">"${escapeHtml(str(t.quote))}"</p>
    <div class="flex items-center justify-center gap-3">
      <div class="w-14 h-14 bg-gray-300 rounded-full"></div>
      <div class="text-left">
        <div class="font-medium text-gray-900">${escapeHtml(str(t.author))}</div>
        <div class="text-gray-500 text-sm">${escapeHtml(str(t.role))}</div>
      </div>
    </div>
  </div>
</section>`;
  },

  // ── FAQ ──
  'faq-accordion': (c) => {
    const questions = renderItems(c.questions as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="divide-y divide-gray-200">
      ${questions.map(q => `<div class="py-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">${escapeHtml(str(q.question))}</h3>
        <p class="text-gray-600">${escapeHtml(str(q.answer))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'faq-two-column': (c) => {
    const questions = renderItems(c.questions as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid md:grid-cols-2 gap-8">
      ${questions.map(q => `<div>
        <h3 class="font-medium text-gray-900 mb-2">${escapeHtml(str(q.question))}</h3>
        <p class="text-gray-600 text-sm">${escapeHtml(str(q.answer))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  // ── CTA ──
  'cta-centered': (c) => `<section class="py-20 px-8 bg-gray-900">
  <div class="max-w-3xl mx-auto text-center">
    <h2 class="text-3xl font-bold text-white mb-4">${escapeHtml(str(c.title))}</h2>
    <p class="text-lg text-gray-300 mb-8">${escapeHtml(str(c.subtitle))}</p>
    <div class="flex gap-4 justify-center">
      <button class="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium">${escapeHtml(str(c.ctaText))}</button>
      ${str(c.ctaSecondaryText) ? `<button class="px-6 py-3 border border-gray-600 text-white rounded-lg font-medium">${escapeHtml(str(c.ctaSecondaryText))}</button>` : ''}
    </div>
  </div>
</section>`,

  'cta-banner': (c) => `<section class="py-12 px-8 bg-gray-900">
  <div class="max-w-7xl mx-auto flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-white mb-2">${escapeHtml(str(c.title))}</h2>
      <p class="text-gray-300">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <button class="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium flex-shrink-0">${escapeHtml(str(c.ctaText))}</button>
  </div>
</section>`,

  // ── About ──
  'about-split': (c) => `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 mb-6">${escapeHtml(str(c.title))}</h2>
      <p class="text-gray-600 text-lg mb-6">${escapeHtml(str(c.description))}</p>
      <div class="border-l-4 border-gray-300 pl-4">
        <p class="text-gray-700 italic">${escapeHtml(str(c.mission))}</p>
      </div>
    </div>
    <div class="bg-gray-200 rounded-2xl h-80"></div>
  </div>
</section>`,

  'about-centered': (c) => `<section class="py-20 px-8">
  <div class="max-w-3xl mx-auto text-center">
    <h2 class="text-3xl font-bold text-gray-900 mb-6">${escapeHtml(str(c.title))}</h2>
    <p class="text-gray-600 text-lg mb-8">${escapeHtml(str(c.description))}</p>
    <blockquote class="text-gray-700 italic text-lg border-t border-b border-gray-200 py-6">${escapeHtml(str(c.mission))}</blockquote>
  </div>
</section>`,

  // ── Team ──
  'team-grid': (c) => {
    const members = renderItems(c.members as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      ${members.map(m => `<div class="text-center">
        <div class="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div class="font-medium text-gray-900">${escapeHtml(str(m.name))}</div>
        <div class="text-sm text-gray-500">${escapeHtml(str(m.role))}</div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'team-list': (c) => {
    const members = renderItems(c.members as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="flex flex-wrap justify-center gap-12">
      ${members.map(m => `<div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div>
          <div class="font-medium text-gray-900">${escapeHtml(str(m.name))}</div>
          <div class="text-sm text-gray-500">${escapeHtml(str(m.role))}</div>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  // ── Contact ──
  'contact-split': (c) => `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-gray-600 mb-8">${escapeHtml(str(c.subtitle))}</p>
      <div class="space-y-4 text-gray-600">
        <p>${escapeHtml(str(c.email))}</p>
        <p>${escapeHtml(str(c.phone))}</p>
        <p>${escapeHtml(str(c.address))}</p>
      </div>
    </div>
    <div class="space-y-4">
      <input type="text" placeholder="Your name" class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
      <input type="email" placeholder="Your email" class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
      <textarea placeholder="Your message" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea>
      <button class="w-full py-3 bg-gray-900 text-white rounded-lg font-medium">Send Message</button>
    </div>
  </div>
</section>`,

  'contact-centered': (c) => `<section class="py-20 px-8">
  <div class="max-w-2xl mx-auto text-center">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
    <p class="text-gray-600 mb-4">${escapeHtml(str(c.subtitle))}</p>
    <div class="flex justify-center gap-8 text-sm text-gray-500 mb-8">
      <span>${escapeHtml(str(c.email))}</span>
      <span>${escapeHtml(str(c.phone))}</span>
    </div>
    <div class="space-y-4 text-left">
      <input type="text" placeholder="Your name" class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
      <input type="email" placeholder="Your email" class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
      <textarea placeholder="Your message" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea>
      <button class="w-full py-3 bg-gray-900 text-white rounded-lg font-medium">Send Message</button>
    </div>
  </div>
</section>`,

  // ── Footer ──
  'footer-4col': (c) => {
    const columns = renderItems(c.columns as ContentItem[]);
    return `<footer class="bg-gray-900 text-white py-16 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="grid md:grid-cols-5 gap-8 mb-12">
      <div class="md:col-span-1">
        <div class="text-xl font-bold mb-4">${escapeHtml(str(c.logo))}</div>
        <p class="text-gray-400 text-sm">${escapeHtml(str(c.description))}</p>
      </div>
      ${columns.map(col => `<div>
        <h4 class="font-semibold text-sm mb-4">${escapeHtml(str(col.title))}</h4>
        <ul class="space-y-2">
          ${str(col.links).split(',').map(l => l.trim()).filter(Boolean).map(l => `<li class="text-gray-400 text-sm">${escapeHtml(l)}</li>`).join('\n          ')}
        </ul>
      </div>`).join('\n      ')}
    </div>
    <div class="border-t border-gray-800 pt-8 text-gray-400 text-sm">${escapeHtml(str(c.copyright))}</div>
  </div>
</footer>`;
  },

  'footer-simple': (c) => {
    const columns = renderItems(c.columns as ContentItem[]);
    const allLinks = columns.flatMap(col => str(col.links).split(',').map(l => l.trim()).filter(Boolean));
    return `<footer class="bg-gray-900 text-white py-12 px-8">
  <div class="max-w-7xl mx-auto text-center">
    <div class="text-xl font-bold mb-4">${escapeHtml(str(c.logo))}</div>
    <div class="flex justify-center gap-6 mb-8">
      ${allLinks.map(l => `<span class="text-gray-400 text-sm">${escapeHtml(l)}</span>`).join('\n      ')}
    </div>
    <p class="text-gray-500 text-sm">${escapeHtml(str(c.copyright))}</p>
  </div>
</footer>`;
  },

  'footer-centered': (c) => {
    const columns = renderItems(c.columns as ContentItem[]);
    const allLinks = columns.flatMap(col => str(col.links).split(',').map(l => l.trim()).filter(Boolean));
    return `<footer class="bg-gray-900 text-white py-16 px-8">
  <div class="max-w-4xl mx-auto text-center">
    <div class="text-xl font-bold mb-3">${escapeHtml(str(c.logo))}</div>
    <p class="text-gray-400 text-sm mb-6">${escapeHtml(str(c.description))}</p>
    <div class="flex flex-wrap justify-center gap-6 mb-8">
      ${allLinks.map(l => `<span class="text-gray-400 text-sm">${escapeHtml(l)}</span>`).join('\n      ')}
    </div>
    <p class="text-gray-500 text-xs">${escapeHtml(str(c.copyright))}</p>
  </div>
</footer>`;
  },

  'footer-minimal': (c) => `<footer class="bg-gray-50 py-8 px-8 border-t border-gray-200">
  <p class="text-center text-gray-500 text-sm">${escapeHtml(str(c.copyright))}</p>
</footer>`,

  // ── New Header variants ──
  'header-with-cta': (c) => {
    const links = renderItems(c.links as ContentItem[]);
    return `<header class="bg-white border-b border-gray-200 px-8 py-4">
  <div class="max-w-7xl mx-auto flex items-center justify-between">
    <div class="text-xl font-bold text-gray-900">${escapeHtml(str(c.logo))}</div>
    <nav class="flex items-center gap-8">
      ${links.map(l => `<span class="text-sm text-gray-600">${escapeHtml(str(l.label))}</span>`).join('\n      ')}
    </nav>
    <div class="flex items-center gap-3">
      <button class="text-sm text-gray-600 px-4 py-2">Log in</button>
      <button class="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg">${escapeHtml(str(c.ctaText))}</button>
    </div>
  </div>
</header>`;
  },

  // ── New Hero variants ──
  'hero-with-image': (c) => `<section class="bg-gray-50 py-24 px-8">
  <div class="max-w-4xl mx-auto text-center">
    <h1 class="text-5xl font-bold text-gray-900 mb-6">${escapeHtml(str(c.title))}</h1>
    <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">${escapeHtml(str(c.subtitle))}</p>
    <div class="flex gap-4 justify-center mb-12">
      <button class="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium">${escapeHtml(str(c.ctaText))}</button>
      ${str(c.ctaSecondaryText) ? `<button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">${escapeHtml(str(c.ctaSecondaryText))}</button>` : ''}
    </div>
    <div class="bg-gray-200 rounded-2xl h-80 max-w-5xl mx-auto"></div>
  </div>
</section>`,

  // ── New Features variants ──
  'features-2column': (c) => {
    const features = renderItems(c.features as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid md:grid-cols-2 gap-8">
      ${features.map(f => `<div class="flex gap-4">
        <div class="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div>
          <h3 class="font-semibold text-gray-900 mb-2">${escapeHtml(str(f.title))}</h3>
          <p class="text-gray-600 text-sm">${escapeHtml(str(f.description))}</p>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'features-with-image': (c) => {
    const features = renderItems(c.features as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
    <div class="bg-gray-200 rounded-2xl h-96"></div>
    <div>
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-gray-600 mb-8">${escapeHtml(str(c.subtitle))}</p>
      <div class="space-y-6">
        ${features.map(f => `<div class="flex gap-4">
          <div class="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">${escapeHtml(str(f.title))}</h3>
            <p class="text-gray-600 text-sm">${escapeHtml(str(f.description))}</p>
          </div>
        </div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>`;
  },

  // ── New Stats variants ──
  'stats-cards': (c) => {
    const stats = renderItems(c.stats as ContentItem[]);
    return `<section class="py-16 px-8">
  <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">${escapeHtml(str(c.title))}</h2>
  <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
    ${stats.map(s => `<div class="border border-gray-200 rounded-xl p-6 text-center">
      <div class="text-3xl font-bold text-gray-900">${escapeHtml(str(s.value))}</div>
      <div class="text-sm text-gray-500 mt-2">${escapeHtml(str(s.label))}</div>
    </div>`).join('\n    ')}
  </div>
</section>`;
  },

  // ── New Pricing variants ──
  'pricing-simple': (c) => {
    const plans = renderItems(c.plans as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="divide-y divide-gray-200">
      ${plans.map(p => `<div class="py-6 flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-gray-900">${escapeHtml(str(p.name))}</h3>
          <p class="text-sm text-gray-500">${escapeHtml(str(p.description))}</p>
        </div>
        <div class="flex items-center gap-6">
          <span class="text-2xl font-bold text-gray-900">${escapeHtml(str(p.price))}<span class="text-sm text-gray-500">${escapeHtml(str(p.period))}</span></span>
          <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">${escapeHtml(str(p.ctaText))}</button>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'pricing-toggle': (c) => {
    const plans = renderItems(c.plans as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-4">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600 mb-6">${escapeHtml(str(c.subtitle))}</p>
      <div class="inline-flex bg-gray-100 rounded-lg p-1 text-sm">
        <span class="px-4 py-2 bg-white rounded-md shadow-sm font-medium">Monthly</span>
        <span class="px-4 py-2 text-gray-500">Annual</span>
      </div>
    </div>
    <div class="grid md:grid-cols-3 gap-8 mt-12">
      ${plans.map(p => {
        const hl = p.highlighted === true || p.highlighted === 'true';
        const features = str(p.features).split(',').map(f => f.trim()).filter(Boolean);
        return `<div class="${hl ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-8">
        <h3 class="text-lg font-semibold">${escapeHtml(str(p.name))}</h3>
        <div class="mt-4 mb-6"><span class="text-4xl font-bold">${escapeHtml(str(p.price))}</span><span class="text-sm ${hl ? 'text-gray-300' : 'text-gray-500'}">${escapeHtml(str(p.period))}</span></div>
        <ul class="space-y-3 mb-8">${features.map(f => `<li class="text-sm ${hl ? 'text-gray-200' : 'text-gray-600'}">✓ ${escapeHtml(f)}</li>`).join('')}</ul>
        <button class="w-full py-3 rounded-lg font-medium ${hl ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}">${escapeHtml(str(p.ctaText))}</button>
      </div>`;
      }).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  // ── New Testimonials variants ──
  'testimonials-minimal': (c) => {
    const testimonials = renderItems(c.testimonials as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-3xl mx-auto text-center">
    <h2 class="text-3xl font-bold text-gray-900 mb-12">${escapeHtml(str(c.title))}</h2>
    <div class="space-y-12">
      ${testimonials.map(t => `<div>
        <p class="text-lg text-gray-700 italic mb-4">"${escapeHtml(str(t.quote))}"</p>
        <p class="text-sm text-gray-500">— ${escapeHtml(str(t.author))}, ${escapeHtml(str(t.role))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'testimonials-grid': (c) => {
    const testimonials = renderItems(c.testimonials as ContentItem[]);
    return `<section class="py-20 px-8 bg-gray-50">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">${escapeHtml(str(c.title))}</h2>
    <div class="grid md:grid-cols-2 gap-8">
      ${testimonials.map(t => `<div class="bg-white rounded-xl p-6 shadow-sm">
        <p class="text-gray-600 mb-4">"${escapeHtml(str(t.quote))}"</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div>
            <div class="font-medium text-gray-900 text-sm">${escapeHtml(str(t.author))}</div>
            <div class="text-gray-500 text-xs">${escapeHtml(str(t.role))}</div>
          </div>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  // ── New FAQ variants ──
  'faq-centered': (c) => {
    const questions = renderItems(c.questions as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="space-y-4">
      ${questions.map(q => `<div class="bg-gray-50 rounded-xl p-6">
        <h3 class="font-medium text-gray-900 mb-2">${escapeHtml(str(q.question))}</h3>
        <p class="text-gray-600 text-sm">${escapeHtml(str(q.answer))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'faq-side-title': (c) => {
    const questions = renderItems(c.questions as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="lg:col-span-2 divide-y divide-gray-200">
      ${questions.map(q => `<div class="py-6">
        <h3 class="font-medium text-gray-900 mb-2">${escapeHtml(str(q.question))}</h3>
        <p class="text-gray-600">${escapeHtml(str(q.answer))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  // ── New CTA variants ──
  'cta-with-image': (c) => `<section class="py-20 px-8 bg-gray-50">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600 mb-8">${escapeHtml(str(c.subtitle))}</p>
      <div class="flex gap-4">
        <button class="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium">${escapeHtml(str(c.ctaText))}</button>
        ${str(c.ctaSecondaryText) ? `<button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">${escapeHtml(str(c.ctaSecondaryText))}</button>` : ''}
      </div>
    </div>
    <div class="bg-gray-200 rounded-2xl h-64"></div>
  </div>
</section>`,

  'cta-simple': (c) => `<section class="py-16 px-8 border-t border-b border-gray-200">
  <div class="max-w-2xl mx-auto text-center">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
    <p class="text-gray-600 mb-6">${escapeHtml(str(c.subtitle))}</p>
    <button class="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium">${escapeHtml(str(c.ctaText))}</button>
  </div>
</section>`,

  // ── New About variants ──
  'about-with-stats': (c) => `<section class="py-20 px-8">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-3xl font-bold text-gray-900 mb-6">${escapeHtml(str(c.title))}</h2>
    <p class="text-gray-600 text-lg mb-12">${escapeHtml(str(c.description))}</p>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div><div class="text-3xl font-bold text-gray-900">10K+</div><div class="text-sm text-gray-500">Users</div></div>
      <div><div class="text-3xl font-bold text-gray-900">50+</div><div class="text-sm text-gray-500">Countries</div></div>
      <div><div class="text-3xl font-bold text-gray-900">99%</div><div class="text-sm text-gray-500">Satisfaction</div></div>
      <div><div class="text-3xl font-bold text-gray-900">24/7</div><div class="text-sm text-gray-500">Support</div></div>
    </div>
  </div>
</section>`,

  'about-timeline': (c) => `<section class="py-20 px-8">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-4 text-center">${escapeHtml(str(c.title))}</h2>
    <p class="text-gray-600 text-lg mb-12 text-center">${escapeHtml(str(c.description))}</p>
    <div class="border-l-2 border-gray-200 pl-8 space-y-8">
      ${str(c.mission).split('.').filter(Boolean).map(item => `<div class="relative">
        <div class="absolute -left-10 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
        <p class="text-gray-700">${escapeHtml(item.trim())}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`,

  // ── New Team variants ──
  'team-cards': (c) => {
    const members = renderItems(c.members as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      ${members.map(m => `<div class="bg-gray-50 rounded-xl p-6 text-center">
        <div class="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div class="font-medium text-gray-900">${escapeHtml(str(m.name))}</div>
        <div class="text-sm text-gray-500">${escapeHtml(str(m.role))}</div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'team-compact': (c) => {
    const members = renderItems(c.members as ContentItem[]);
    return `<section class="py-16 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">${escapeHtml(str(c.title))}</h2>
      <p class="text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid grid-cols-3 md:grid-cols-6 gap-6">
      ${members.map(m => `<div class="text-center">
        <div class="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
        <div class="font-medium text-gray-900 text-sm">${escapeHtml(str(m.name))}</div>
        <div class="text-xs text-gray-500">${escapeHtml(str(m.role))}</div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  // ── New Contact variants ──
  'contact-minimal': (c) => `<section class="py-16 px-8">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">${escapeHtml(str(c.title))}</h2>
    <div class="flex flex-wrap justify-center gap-12 text-gray-600">
      <span>${escapeHtml(str(c.email))}</span>
      <span>${escapeHtml(str(c.phone))}</span>
      <span>${escapeHtml(str(c.address))}</span>
    </div>
  </div>
</section>`,

  'contact-cards': (c) => `<section class="py-20 px-8">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="border border-gray-200 rounded-xl p-6 text-center">
        <div class="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4"></div>
        <h3 class="font-medium text-gray-900 mb-1">Email</h3>
        <p class="text-gray-600 text-sm">${escapeHtml(str(c.email))}</p>
      </div>
      <div class="border border-gray-200 rounded-xl p-6 text-center">
        <div class="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4"></div>
        <h3 class="font-medium text-gray-900 mb-1">Phone</h3>
        <p class="text-gray-600 text-sm">${escapeHtml(str(c.phone))}</p>
      </div>
      <div class="border border-gray-200 rounded-xl p-6 text-center">
        <div class="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4"></div>
        <h3 class="font-medium text-gray-900 mb-1">Address</h3>
        <p class="text-gray-600 text-sm">${escapeHtml(str(c.address))}</p>
      </div>
    </div>
  </div>
</section>`,

  // ── Logo Cloud ──
  'logos-simple': (c) => {
    const logos = renderItems(c.logos as ContentItem[]);
    return `<section class="py-16 px-8">
  <p class="text-center text-sm text-gray-500 mb-8">${escapeHtml(str(c.title))}</p>
  <div class="flex flex-wrap justify-center gap-12 items-center max-w-5xl mx-auto">
    ${logos.map(l => `<div class="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">${escapeHtml(str(l.name))}</div>`).join('\n    ')}
  </div>
</section>`;
  },

  'logos-with-title': (c) => {
    const logos = renderItems(c.logos as ContentItem[]);
    return `<section class="py-16 px-8">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 items-center">
    <h2 class="text-2xl font-bold text-gray-900">${escapeHtml(str(c.title))}</h2>
    <div class="lg:col-span-2 grid grid-cols-3 gap-8">
      ${logos.map(l => `<div class="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">${escapeHtml(str(l.name))}</div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'logos-grid': (c) => {
    const logos = renderItems(c.logos as ContentItem[]);
    return `<section class="py-16 px-8">
  <h2 class="text-2xl font-bold text-gray-900 text-center mb-8">${escapeHtml(str(c.title))}</h2>
  <div class="max-w-4xl mx-auto grid grid-cols-3 gap-4">
    ${logos.map(l => `<div class="border border-gray-200 rounded-xl p-6 flex items-center justify-center">
      <div class="w-20 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">${escapeHtml(str(l.name))}</div>
    </div>`).join('\n    ')}
  </div>
</section>`;
  },

  // ── Blog ──
  'blog-grid': (c) => {
    const posts = renderItems(c.posts as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      ${posts.map(p => `<div>
        <div class="bg-gray-200 rounded-xl h-48 mb-4"></div>
        <h3 class="font-semibold text-gray-900 mb-2">${escapeHtml(str(p.title))}</h3>
        <p class="text-gray-600 text-sm mb-3">${escapeHtml(str(p.excerpt))}</p>
        <p class="text-xs text-gray-400">${escapeHtml(str(p.author))} · ${escapeHtml(str(p.date))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'blog-list': (c) => {
    const posts = renderItems(c.posts as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-12">${escapeHtml(str(c.title))}</h2>
    <div class="space-y-8">
      ${posts.map(p => `<div class="flex gap-6">
        <div class="bg-gray-200 rounded-xl w-56 h-40 flex-shrink-0"></div>
        <div>
          <h3 class="font-semibold text-gray-900 text-lg mb-2">${escapeHtml(str(p.title))}</h3>
          <p class="text-gray-600 mb-3">${escapeHtml(str(p.excerpt))}</p>
          <p class="text-xs text-gray-400">${escapeHtml(str(p.author))} · ${escapeHtml(str(p.date))}</p>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'blog-featured': (c) => {
    const posts = renderItems(c.posts as ContentItem[]);
    const featured = posts[0] || { title: '', excerpt: '', author: '', date: '' };
    const rest = posts.slice(1);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-12">${escapeHtml(str(c.title))}</h2>
    <div class="bg-gray-200 rounded-2xl h-72 mb-6"></div>
    <h3 class="text-2xl font-bold text-gray-900 mb-2">${escapeHtml(str(featured.title))}</h3>
    <p class="text-gray-600 mb-8">${escapeHtml(str(featured.excerpt))}</p>
    <div class="grid md:grid-cols-2 gap-8">
      ${rest.map(p => `<div>
        <div class="bg-gray-200 rounded-xl h-40 mb-4"></div>
        <h3 class="font-semibold text-gray-900 mb-2">${escapeHtml(str(p.title))}</h3>
        <p class="text-gray-600 text-sm">${escapeHtml(str(p.excerpt))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'blog-minimal': (c) => {
    const posts = renderItems(c.posts as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-2xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">${escapeHtml(str(c.title))}</h2>
    <div class="divide-y divide-gray-200">
      ${posts.map(p => `<div class="py-4 flex justify-between items-center">
        <h3 class="font-medium text-gray-900">${escapeHtml(str(p.title))}</h3>
        <span class="text-sm text-gray-400 flex-shrink-0 ml-4">${escapeHtml(str(p.date))}</span>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  // ── Gallery ──
  'gallery-grid': (c) => {
    const images = renderItems(c.images as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      ${images.map(img => `<div>
        <div class="bg-gray-200 rounded-xl aspect-video"></div>
        <p class="text-sm text-gray-500 mt-2">${escapeHtml(str(img.caption))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'gallery-masonry': (c) => {
    const images = renderItems(c.images as ContentItem[]);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">${escapeHtml(str(c.title))}</h2>
      <p class="text-lg text-gray-600">${escapeHtml(str(c.subtitle))}</p>
    </div>
    <div class="columns-2 md:columns-3 gap-4">
      ${images.map((img, i) => `<div class="break-inside-avoid mb-4">
        <div class="bg-gray-200 rounded-xl ${i % 2 === 0 ? 'h-48' : 'h-64'}"></div>
        <p class="text-sm text-gray-500 mt-2">${escapeHtml(str(img.caption))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  'gallery-carousel': (c) => {
    const images = renderItems(c.images as ContentItem[]).slice(0, 3);
    return `<section class="py-20 px-8">
  <div class="max-w-7xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">${escapeHtml(str(c.title))}</h2>
    <div class="flex gap-4 overflow-hidden">
      ${images.map(img => `<div class="flex-1 min-w-0">
        <div class="bg-gray-200 rounded-xl h-64"></div>
        <p class="text-sm text-gray-500 mt-2 text-center">${escapeHtml(str(img.caption))}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;
  },

  // ── Banner ──
  'banner-top': (c) => `<div class="bg-gray-900 text-white py-3 px-4">
  <div class="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm">
    <span>${escapeHtml(str(c.text))}</span>
    ${str(c.ctaText) ? `<a href="#" class="underline font-medium">${escapeHtml(str(c.ctaText))}</a>` : ''}
  </div>
</div>`,

  'banner-floating': (c) => `<div class="py-4 px-8">
  <div class="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-md p-4 flex items-center justify-between">
    <span class="text-sm text-gray-700">${escapeHtml(str(c.text))}</span>
    ${str(c.ctaText) ? `<button class="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg flex-shrink-0">${escapeHtml(str(c.ctaText))}</button>` : ''}
  </div>
</div>`,

  'banner-minimal': (c) => `<div class="bg-gray-50 border-t border-b border-gray-200 py-3">
  <p class="text-center text-sm text-gray-600">${escapeHtml(str(c.text))}</p>
</div>`,
};

export function exportPageToHTML(title: string, sections: PlacedSection[]): string {
  const sectionsHtml = sections
    .map(section => {
      const renderer = htmlRenderers[section.variantId];
      if (!renderer) return `<!-- Unknown section: ${section.variantId} -->`;
      return renderer(section.content);
    })
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-white text-gray-900">
${sectionsHtml}
</body>
</html>`;
}
