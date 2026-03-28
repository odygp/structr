'use client';

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Plus, Loader2 } from 'lucide-react';
import { CATEGORIES, type WizardData } from '@/lib/templates';

const STEPS = ['Category', 'Pages', 'Details', 'Tone'];

interface Props {
  onClose: () => void;
  onComplete: (data: WizardData) => Promise<void>;
}

export default function TemplateWizard({ onClose, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Step 1
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [description, setDescription] = useState('');

  // Step 2
  const [pages, setPages] = useState<string[]>([]);
  const [newPage, setNewPage] = useState('');
  const [showAddPage, setShowAddPage] = useState(false);

  // Step 3
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [products, setProducts] = useState<string[]>([]);
  const [productInput, setProductInput] = useState('');
  const [audience, setAudience] = useState('');

  // Step 4
  const [tone, setTone] = useState({ formality: 50, voice: 50, language: 50, approach: 50 });
  const [extras, setExtras] = useState({ socialProof: false, urgency: false, benefitsFocus: false, jargon: false });

  // When category is selected, set suggested pages
  const selectCategory = (catId: string) => {
    setCategory(catId);
    setShowCustom(false);
    const cat = CATEGORIES.find(c => c.id === catId);
    if (cat) setPages([...cat.suggestedPages]);
  };

  const selectOther = () => {
    setCategory('other');
    setShowCustom(true);
    setPages(['Home', 'About', 'Contact']);
  };

  const togglePage = (page: string) => {
    setPages(prev => prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]);
  };

  const addCustomPage = () => {
    const trimmed = newPage.trim();
    if (trimmed && !pages.includes(trimmed)) {
      setPages(prev => [...prev, trimmed]);
      setNewPage('');
      setShowAddPage(false);
    }
  };

  const addProduct = () => {
    const trimmed = productInput.trim();
    if (trimmed && products.length < 5 && !products.includes(trimmed)) {
      setProducts(prev => [...prev, trimmed]);
      setProductInput('');
    }
  };

  const canProceed = () => {
    if (step === 0) return (category && category !== 'other' && description.trim()) || (category === 'other' && customCategory.trim() && description.trim());
    if (step === 1) return pages.length > 0;
    return true; // Steps 3 and 4 are skippable
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onComplete({
        category,
        customCategory: category === 'other' ? customCategory : undefined,
        description,
        pages,
        businessName: businessName || undefined,
        tagline: tagline || undefined,
        products: products.length ? products : undefined,
        audience: audience || undefined,
        tone,
        extras,
      });
    } catch {
      setGenerating(false);
    }
  };

  // All possible pages for the selected category
  const allPossiblePages = (() => {
    const cat = CATEGORIES.find(c => c.id === category);
    const suggested = cat ? cat.suggestedPages : ['Home', 'About', 'Contact'];
    const allPages = new Set([...suggested, ...pages, 'Home', 'Features', 'Pricing', 'About', 'About Us', 'Contact', 'Blog', 'FAQ', 'Team', 'Services', 'Products', 'Gallery', 'Work', 'Portfolio', 'Testimonials']);
    return Array.from(allPages);
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-[20px] w-[640px] max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-[#ebebeb] flex-shrink-0">
          <div className="flex items-center gap-[16px]">
            <h2 className="text-[18px] font-medium tracking-[-0.36px] text-[#34322d]">Guided Setup</h2>
            {/* Step indicator */}
            <div className="flex items-center gap-[4px]">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-[4px]">
                  <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px] font-medium transition-colors ${
                    i === step ? 'bg-[#34322d] text-white' :
                    i < step ? 'bg-[#34322d] text-white opacity-40' :
                    'bg-[#efefef] text-[#34322d] opacity-40'
                  }`}>
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-[16px] h-[1px] ${i < step ? 'bg-[#34322d]' : 'bg-[#ebebeb]'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-[4px] hover:bg-[#efefef] rounded-[8px] transition-colors">
            <X size={18} className="text-[#34322d]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[24px]">

          {/* Step 1: Category */}
          {step === 0 && (
            <div className="flex flex-col gap-[20px]">
              <div>
                <h3 className="text-[16px] font-medium text-[#34322d] mb-[4px]">What are you building?</h3>
                <p className="text-[13px] text-[#34322d] opacity-50">Pick a category and describe your project</p>
              </div>

              <div className="grid grid-cols-3 gap-[8px]">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className={`flex flex-col items-start gap-[8px] p-[16px] rounded-[16px] border text-left transition-all ${
                      category === cat.id
                        ? 'border-[#34322d] bg-[#fafafa]'
                        : 'border-[#ebebeb] hover:border-[#d4d4d4] hover:bg-[#fafafa]'
                    }`}
                  >
                    <span className="text-[20px]">{cat.emoji}</span>
                    <span className="text-[13px] font-medium text-[#34322d] leading-[1.3]">{cat.label}</span>
                  </button>
                ))}
                {/* Other */}
                <button
                  onClick={selectOther}
                  className={`flex flex-col items-start gap-[8px] p-[16px] rounded-[16px] border text-left transition-all ${
                    category === 'other'
                      ? 'border-[#34322d] bg-[#fafafa]'
                      : 'border-[#ebebeb] hover:border-[#d4d4d4] hover:bg-[#fafafa]'
                  }`}
                >
                  <Plus size={20} className="text-[#34322d] opacity-40" />
                  <span className="text-[13px] font-medium text-[#34322d] leading-[1.3]">Other</span>
                </button>
              </div>

              {showCustom && (
                <input
                  type="text"
                  placeholder="What type of website? (e.g., Veterinary Clinic)"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  className="w-full px-[16px] py-[12px] text-[14px] border border-[#ebebeb] rounded-[12px] bg-white text-[#34322d] placeholder:opacity-40 focus:outline-none focus:border-[#34322d]"
                  autoFocus
                />
              )}

              <textarea
                placeholder="Describe your project in one sentence..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full px-[16px] py-[12px] text-[14px] border border-[#ebebeb] rounded-[12px] bg-white text-[#34322d] placeholder:opacity-40 focus:outline-none focus:border-[#34322d] resize-none"
              />
            </div>
          )}

          {/* Step 2: Pages */}
          {step === 1 && (
            <div className="flex flex-col gap-[20px]">
              <div>
                <h3 className="text-[16px] font-medium text-[#34322d] mb-[4px]">Choose your pages</h3>
                <p className="text-[13px] text-[#34322d] opacity-50">We suggested pages based on your category. Toggle on/off or add custom pages.</p>
              </div>

              <div className="flex flex-col gap-[4px]">
                {allPossiblePages.map(page => {
                  const isSelected = pages.includes(page);
                  return (
                    <button
                      key={page}
                      onClick={() => togglePage(page)}
                      className={`flex items-center gap-[12px] px-[16px] py-[12px] rounded-[12px] text-left transition-colors ${
                        isSelected ? 'bg-[#fafafa]' : 'hover:bg-[#fafafa]'
                      }`}
                    >
                      <div className={`w-[20px] h-[20px] rounded-[6px] border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#34322d] border-[#34322d]' : 'border-[#d4d4d4]'
                      }`}>
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-[14px] font-medium text-[#34322d] ${!isSelected ? 'opacity-50' : ''}`}>{page}</span>
                    </button>
                  );
                })}

                {/* Add custom page */}
                {showAddPage ? (
                  <div className="flex items-center gap-[8px] px-[16px] py-[8px]">
                    <input
                      type="text"
                      placeholder="Page name..."
                      value={newPage}
                      onChange={e => setNewPage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addCustomPage(); if (e.key === 'Escape') setShowAddPage(false); }}
                      className="flex-1 px-[12px] py-[8px] text-[14px] border border-[#ebebeb] rounded-[8px] focus:outline-none focus:border-[#34322d]"
                      autoFocus
                    />
                    <button onClick={addCustomPage} className="text-[13px] font-medium text-[#34322d] px-[12px] py-[8px] bg-[#efefef] rounded-[8px]">Add</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddPage(true)}
                    className="flex items-center gap-[12px] px-[16px] py-[12px] rounded-[12px] text-left hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="w-[20px] h-[20px] rounded-[6px] border border-dashed border-[#d4d4d4] flex items-center justify-center">
                      <Plus size={12} className="text-[#34322d] opacity-40" />
                    </div>
                    <span className="text-[14px] text-[#34322d] opacity-40">Add custom page</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Content hints */}
          {step === 2 && (
            <div className="flex flex-col gap-[20px]">
              <div>
                <h3 className="text-[16px] font-medium text-[#34322d] mb-[4px]">Content details</h3>
                <p className="text-[13px] text-[#34322d] opacity-50">Help us generate more relevant content. All fields are optional.</p>
              </div>

              <div className="flex flex-col gap-[16px]">
                <div>
                  <label className="text-[12px] font-medium text-[#34322d] opacity-60 mb-[6px] block">Business name</label>
                  <input
                    type="text"
                    placeholder="e.g., ChocoCraft"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full px-[16px] py-[12px] text-[14px] border border-[#ebebeb] rounded-[12px] bg-white text-[#34322d] placeholder:opacity-40 focus:outline-none focus:border-[#34322d]"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-[#34322d] opacity-60 mb-[6px] block">Tagline / Value proposition</label>
                  <input
                    type="text"
                    placeholder="e.g., Handcrafted chocolate for every occasion"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="w-full px-[16px] py-[12px] text-[14px] border border-[#ebebeb] rounded-[12px] bg-white text-[#34322d] placeholder:opacity-40 focus:outline-none focus:border-[#34322d]"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-[#34322d] opacity-60 mb-[6px] block">Key products or services (up to 5)</label>
                  <div className="flex flex-wrap gap-[6px] mb-[8px]">
                    {products.map(p => (
                      <span key={p} className="bg-[#efefef] rounded-[8px] px-[10px] py-[6px] text-[13px] text-[#34322d] flex items-center gap-[4px]">
                        {p}
                        <button onClick={() => setProducts(prev => prev.filter(x => x !== p))} className="opacity-40 hover:opacity-100">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  {products.length < 5 && (
                    <div className="flex gap-[8px]">
                      <input
                        type="text"
                        placeholder="Add a product or service..."
                        value={productInput}
                        onChange={e => setProductInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addProduct(); } }}
                        className="flex-1 px-[12px] py-[8px] text-[13px] border border-[#ebebeb] rounded-[8px] focus:outline-none focus:border-[#34322d]"
                      />
                      <button onClick={addProduct} className="text-[12px] font-medium text-[#34322d] px-[12px] py-[8px] bg-[#efefef] rounded-[8px]">Add</button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[12px] font-medium text-[#34322d] opacity-60 mb-[6px] block">Target audience</label>
                  <input
                    type="text"
                    placeholder="e.g., Young professionals aged 25-40"
                    value={audience}
                    onChange={e => setAudience(e.target.value)}
                    className="w-full px-[16px] py-[12px] text-[14px] border border-[#ebebeb] rounded-[12px] bg-white text-[#34322d] placeholder:opacity-40 focus:outline-none focus:border-[#34322d]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Content direction */}
          {step === 3 && (
            <div className="flex flex-col gap-[20px]">
              <div>
                <h3 className="text-[16px] font-medium text-[#34322d] mb-[4px]">Content direction</h3>
                <p className="text-[13px] text-[#34322d] opacity-50">Set the tone for all the text in your wireframe</p>
              </div>

              <div className="flex flex-col gap-[20px]">
                {([
                  { key: 'formality', low: 'Formal', high: 'Casual' },
                  { key: 'voice', low: 'Professional', high: 'Friendly' },
                  { key: 'language', low: 'Technical', high: 'Simple' },
                  { key: 'approach', low: 'Direct', high: 'Storytelling' },
                ] as const).map(({ key, low, high }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-[8px]">
                      <span className={`text-[12px] font-medium ${tone[key] < 40 ? 'text-[#34322d]' : 'text-[#34322d] opacity-40'}`}>{low}</span>
                      <span className={`text-[12px] font-medium ${tone[key] > 60 ? 'text-[#34322d]' : 'text-[#34322d] opacity-40'}`}>{high}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={tone[key]}
                      onChange={e => setTone(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      className="w-full h-[4px] bg-[#ebebeb] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[16px] [&::-webkit-slider-thumb]:h-[16px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#34322d] [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[12px] font-medium text-[#34322d] opacity-60 mb-[10px]">Additional preferences</p>
                <div className="flex flex-col gap-[8px]">
                  {([
                    { key: 'socialProof', label: 'Include social proof (testimonials, stats)' },
                    { key: 'urgency', label: 'Include urgency / scarcity cues' },
                    { key: 'benefitsFocus', label: 'Focus on benefits over features' },
                    { key: 'jargon', label: 'Use industry-specific jargon' },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setExtras(prev => ({ ...prev, [key]: !prev[key] }))}
                      className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[10px] hover:bg-[#fafafa] transition-colors text-left"
                    >
                      <div className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-colors ${
                        extras[key] ? 'bg-[#34322d] border-[#34322d]' : 'border-[#d4d4d4]'
                      }`}>
                        {extras[key] && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px] text-[#34322d]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[#ebebeb] flex-shrink-0">
          <div>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-[4px] text-[14px] text-[#34322d] opacity-60 hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-[8px]">
            {step >= 2 && step < 3 && (
              <button
                onClick={() => setStep(step + 1)}
                className="text-[14px] text-[#34322d] opacity-40 hover:opacity-60 px-[16px] py-[10px]"
              >
                Skip
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-[6px] bg-[#34322d] text-white text-[14px] font-medium px-[24px] py-[10px] rounded-[12px] disabled:opacity-30 hover:bg-[#1c1c1c] transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-[8px]">
                <button
                  onClick={() => { handleGenerate(); }}
                  disabled={generating}
                  className="flex items-center gap-[8px] bg-[#34322d] text-white text-[14px] font-medium px-[24px] py-[10px] rounded-[12px] disabled:opacity-60 hover:bg-[#1c1c1c] transition-colors"
                >
                  {generating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate Wireframe <ChevronRight size={16} /></>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
