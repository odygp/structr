'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import PageSelector, { type PageItem } from './PageSelector';

export default function AiPromptCard() {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'prompt' | 'pages'>('prompt');
  const [pageItems, setPageItems] = useState<PageItem[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Extract text content from files
  const extractFileContents = async (): Promise<string> => {
    if (files.length === 0) return '';
    const contents: string[] = [];

    for (const file of files) {
      try {
        if (file.name.endsWith('.csv') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          const text = await file.text();
          contents.push(`--- File: ${file.name} ---\n${text.slice(0, 10000)}`);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.length; i += 8192) {
            binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 8192)));
          }
          const base64 = btoa(binary);
          contents.push(`--- File: ${file.name} (Excel, base64) ---\n${base64.slice(0, 20000)}`);
        } else if (file.type === 'application/pdf') {
          contents.push(`--- File: ${file.name} (PDF attached, ${(file.size / 1024).toFixed(0)}KB) ---`);
        } else if (file.type.startsWith('image/')) {
          contents.push(`--- File: ${file.name} (Image attached, ${(file.size / 1024).toFixed(0)}KB) ---`);
        } else {
          const text = await file.text();
          contents.push(`--- File: ${file.name} ---\n${text.slice(0, 10000)}`);
        }
      } catch {
        contents.push(`--- File: ${file.name} (could not read) ---`);
      }
    }
    return contents.join('\n\n');
  };

  const handleSuggestPages = async () => {
    if ((!prompt.trim() && files.length === 0) || suggesting) return;
    setSuggesting(true);
    setError('');

    try {
      const res = await fetch('/api/ai/suggest-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();
      const suggested: string[] = data.pages || ['Home', 'About', 'Services', 'Contact'];

      setPageItems(suggested.map(name => ({ name, checked: true })));
      setStep('pages');
    } catch {
      setPageItems(['Home', 'About', 'Services', 'Contact'].map(name => ({ name, checked: true })));
      setStep('pages');
    } finally {
      setSuggesting(false);
    }
  };

  const handleGenerate = async () => {
    const selectedPages = pageItems.filter(p => p.checked).map(p => p.name);
    if (selectedPages.length === 0) return;
    setGenerating(true);
    setError('');

    try {
      const fileContents = await extractFileContents();
      const fullPrompt = fileContents
        ? `${prompt.trim()}\n\nAttached files:\n${fileContents}`
        : prompt.trim();

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt, selectedPages }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch {
        throw new Error(res.ok ? 'Invalid server response' : `Server error (${res.status}): ${text.slice(0, 200)}`);
      }

      if (!res.ok) throw new Error(data.error || 'Generation failed');
      router.push(`/builder?project=${data.projectId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSuggestPages(); }
  };

  const togglePage = (index: number) => {
    setPageItems(prev => prev.map((p, i) => i === index ? { ...p, checked: !p.checked } : p));
  };

  const addCustomPage = (name: string) => {
    setPageItems(prev => [...prev, { name, checked: true }]);
  };

  const selectedCount = pageItems.filter(p => p.checked).length;

  // Page selection step
  if (step === 'pages') {
    return (
      <div className="bg-white border border-[#ebebeb] rounded-[20px] p-[16px] flex flex-col gap-[12px]">
        <div className="flex items-center gap-[8px]">
          <button onClick={() => setStep('prompt')} className="text-[#808080] hover:text-[#1c1c1c]">
            <ArrowLeft size={16} />
          </button>
          <span className="text-[14px] font-medium text-[#34322d]">Select pages to generate</span>
        </div>

        <p className="text-[12px] text-[#808080]">
          AI suggested these pages based on your prompt. Toggle on/off or add custom pages.
        </p>

        <PageSelector
          pages={pageItems}
          onToggle={togglePage}
          onAddCustom={addCustomPage}
          maxHeight="220px"
        />

        {error && <div className="text-[12px] text-red-500">{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={selectedCount === 0 || generating}
          className="w-full py-[10px] text-[14px] font-medium text-white bg-[#34322d] rounded-[12px] hover:bg-[#1c1c1c] transition-colors disabled:opacity-40 flex items-center justify-center gap-[8px]"
        >
          {generating ? (
            <><Loader2 size={14} className="animate-spin" /> Generating...</>
          ) : (
            `Generate ${selectedCount} Pages`
          )}
        </button>
      </div>
    );
  }

  // Prompt input step
  return (
    <div className="bg-white border border-[#ebebeb] rounded-[20px] h-[180px] p-[16px] flex flex-col gap-[16px]">
      {/* Text area */}
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type here.."
          className="w-full h-full resize-none bg-transparent text-[16px] leading-[16px] tracking-[-0.32px] text-[#34322d] placeholder:text-[#34322d] placeholder:opacity-50 focus:outline-none"
          disabled={suggesting}
        />
      </div>

      {/* Bottom row */}
      <div className="flex items-start justify-between">
        {/* Add attachment */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="border border-[rgba(52,50,45,0.2)] flex items-center p-[8px] rounded-full hover:border-[rgba(52,50,45,0.4)] transition-colors"
        >
          <img src="/Add-1.svg" alt="Add" width={16} height={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => { if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]); }}
        />

        {/* Send button */}
        <button
          onClick={handleSuggestPages}
          disabled={(!prompt.trim() && files.length === 0) || suggesting}
          className={`flex items-center p-[8px] rounded-full transition-colors ${
            (prompt.trim() || files.length > 0) && !suggesting
              ? 'bg-[#34322d] text-white'
              : 'bg-[#34322d] text-white opacity-40'
          }`}
        >
          {suggesting ? <Loader2 size={16} className="animate-spin" /> : <img src="/Arrow--up.svg" alt="Send" width={16} height={16} />}
        </button>
      </div>

      {error && <div className="text-[12px] text-red-500 -mt-2">{error}</div>}

      {/* Files preview */}
      {files.length > 0 && (
        <div className="flex gap-2 -mt-2">
          {files.map((f, i) => (
            <div key={i} className="bg-[#efefef] rounded-[8px] px-[8px] py-[4px] text-[11px] text-[#34322d] flex items-center gap-1">
              {f.name.slice(0, 15)}
              <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-[#34322d] opacity-40 hover:opacity-100">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
