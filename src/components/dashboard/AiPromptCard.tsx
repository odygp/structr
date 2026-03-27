'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowUp, Loader2 } from 'lucide-react';

export default function AiPromptCard() {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Generation failed'); }
      const data = await res.json();
      router.push(`/builder?project=${data.projectId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

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
          disabled={generating}
        />
      </div>

      {/* Bottom row */}
      <div className="flex items-start justify-between">
        {/* Add attachment */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="border border-[rgba(52,50,45,0.2)] flex items-center p-[8px] rounded-full hover:border-[rgba(52,50,45,0.4)] transition-colors"
        >
          <Plus size={16} className="text-[#34322d]" />
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
          onClick={handleSubmit}
          disabled={!prompt.trim() || generating}
          className={`flex items-center p-[8px] rounded-full transition-colors ${
            prompt.trim() && !generating
              ? 'bg-[#34322d] text-white'
              : 'bg-[#34322d] text-white opacity-40'
          }`}
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
        </button>
      </div>

      {error && <div className="text-[12px] text-red-500 -mt-2">{error}</div>}

      {/* Files preview (hidden for now, shown when files attached) */}
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
