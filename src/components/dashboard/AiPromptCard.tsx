'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AiPromptCard() {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
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
          // Plain text files
          const text = await file.text();
          contents.push(`--- File: ${file.name} ---\n${text.slice(0, 10000)}`);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Excel files — read as base64, send to a parser endpoint
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          // Convert to CSV-like text by reading raw content
          // For xlsx we'll send it as base64 to the API
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

  const handleSubmit = async () => {
    if ((!prompt.trim() && files.length === 0) || generating) return;
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
        body: JSON.stringify({ prompt: fullPrompt }),
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
          onClick={handleSubmit}
          disabled={(!prompt.trim() && files.length === 0) || generating}
          className={`flex items-center p-[8px] rounded-full transition-colors ${
            (prompt.trim() || files.length > 0) && !generating
              ? 'bg-[#34322d] text-white'
              : 'bg-[#34322d] text-white opacity-40'
          }`}
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <img src="/Arrow--up.svg" alt="Send" width={16} height={16} />}
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
