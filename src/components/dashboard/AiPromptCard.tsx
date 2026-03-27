'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, Plus, Loader2 } from 'lucide-react';

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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const data = await res.json();
      router.push(`/builder?project=${data.projectId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  return (
    <div className="mb-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">What are we building today?</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        {/* Attached files preview */}
        {files.length > 0 && (
          <div className="flex gap-2 mb-3">
            {files.map((f, i) => (
              <div key={i} className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-500 relative group">
                {f.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  f.name.slice(0, 6)
                )}
                <button
                  onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type here.."
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          disabled={generating}
        />

        {/* Bottom row: attachment + send */}
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={handleFileSelect}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
          >
            <Plus size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFilesChanged}
          />

          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || generating}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-white disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            {generating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ArrowUp size={14} />
            )}
          </button>
        </div>

        {error && (
          <div className="mt-2 text-xs text-red-500">{error}</div>
        )}
      </div>
    </div>
  );
}
