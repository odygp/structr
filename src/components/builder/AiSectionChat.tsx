'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, X, ChevronDown, Loader2, Plus } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'suggestion' | 'applied' | 'error';
}

interface Props {
  sectionName: string;
  sectionId: string;
  category: string;
  variantId: string;
  content: Record<string, unknown>;
  projectId?: string;
  onClose: () => void;
  onApply: (updatedContent: Record<string, unknown>) => void;
  generating: boolean;
  onSetGenerating: (v: boolean) => void;
}

export default function AiSectionChat({
  sectionName, sectionId, category, variantId, content, projectId,
  onClose, onApply, generating, onSetGenerating,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'auto' | 'plan'>('auto');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || generating) return;
    const instruction = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: instruction }]);
    onSetGenerating(true);

    try {
      const res = await fetch('/api/ai/edit-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId, projectId, category, variantId, content, instruction, mode,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error, type: 'error' }]);
      } else if (data.mode === 'plan') {
        setPendingSuggestion(data.suggestion);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.suggestion,
          type: 'suggestion',
        }]);
      } else {
        // Auto mode — apply directly
        onApply(data.content);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Changes applied.',
          type: 'applied',
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: e instanceof Error ? e.message : 'Something went wrong',
        type: 'error',
      }]);
    } finally {
      onSetGenerating(false);
    }
  };

  const handleApplySuggestion = async () => {
    if (!pendingSuggestion) return;
    onSetGenerating(true);

    try {
      const res = await fetch('/api/ai/edit-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId, projectId, category, variantId, content,
          instruction: `Apply these exact changes:\n${pendingSuggestion}`,
          mode: 'auto',
        }),
      });

      const data = await res.json();
      if (data.content) {
        onApply(data.content);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Changes applied.', type: 'applied' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to apply changes.', type: 'error' }]);
    } finally {
      onSetGenerating(false);
      setPendingSuggestion(null);
    }
  };

  return (
    <aside className="w-[240px] bg-white border-l border-[#ebebeb] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-[12px] pt-[12px] pb-[12px]">
        <span className="text-[14px] font-medium text-[#1c1c1c]">AI Support</span>
        <button onClick={onClose} className="w-[28px] h-[28px] flex items-center justify-center rounded-[8px] hover:bg-[#f5f5f5]">
          <MoreHorizontal size={16} className="text-[#808080]" />
        </button>
      </div>
      <div className="mx-[12px] h-px bg-[#ebebeb]" />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-[12px] py-[12px] flex flex-col gap-[8px]">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[12px] text-[#808080] text-center">Ask AI to edit this section&apos;s content</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[200px] rounded-[12px] px-[12px] py-[8px] text-[13px] leading-[1.4] ${
              msg.role === 'user'
                ? 'bg-[#f5f5f5] text-[#1c1c1c]'
                : msg.type === 'error'
                  ? 'bg-red-50 text-red-600'
                  : msg.type === 'applied'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-[#f5f5f5] text-[#1c1c1c]'
            }`}>
              {msg.content}
              {msg.type === 'suggestion' && pendingSuggestion && (
                <button
                  onClick={handleApplySuggestion}
                  className="mt-[8px] w-full py-[6px] text-[12px] font-medium text-white bg-[#1c1c1c] rounded-[8px] hover:bg-[#333]"
                >
                  Apply Changes
                </button>
              )}
            </div>
          </div>
        ))}
        {generating && (
          <div className="flex justify-start">
            <div className="bg-[#f5f5f5] rounded-[12px] px-[12px] py-[8px] flex items-center gap-[6px]">
              <Loader2 size={12} className="animate-spin text-[#808080]" />
              <span className="text-[12px] text-[#808080]">Generating...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom input area */}
      <div className="p-[8px]">
        <div className="bg-[#f5f5f5] rounded-[16px] p-[8px]">
          {/* Section pill */}
          <div className="flex items-center justify-between mb-[8px]">
            <span className="text-[13px] text-[#1c1c1c]">{sectionName}</span>
            <button onClick={onClose} className="text-[#808080] hover:text-[#1c1c1c]">
              <X size={16} />
            </button>
          </div>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type here.."
            rows={2}
            className="w-full resize-none bg-transparent text-[13px] text-[#1c1c1c] placeholder:text-[#808080] focus:outline-none mb-[8px]"
            disabled={generating}
          />

          {/* Bottom controls */}
          <div className="flex items-center justify-between">
            <button className="w-[24px] h-[24px] flex items-center justify-center text-[#808080] hover:text-[#1c1c1c]">
              <Plus size={16} />
            </button>

            <div className="flex items-center gap-[8px]">
              {/* Mode selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModeDropdown(!showModeDropdown)}
                  className="flex items-center gap-[4px] text-[13px] text-[#1c1c1c]"
                >
                  {mode === 'auto' ? 'Auto Edit' : 'Plan'}
                  <ChevronDown size={14} />
                </button>
                {showModeDropdown && (
                  <div className="absolute bottom-[28px] right-0 bg-white border border-[#ebebeb] rounded-[8px] shadow-lg py-[4px] z-10 min-w-[100px]">
                    <button
                      onClick={() => { setMode('auto'); setShowModeDropdown(false); }}
                      className={`w-full text-left px-[12px] py-[6px] text-[13px] hover:bg-[#f5f5f5] ${mode === 'auto' ? 'font-medium' : ''}`}
                    >
                      Auto Edit
                    </button>
                    <button
                      onClick={() => { setMode('plan'); setShowModeDropdown(false); }}
                      className={`w-full text-left px-[12px] py-[6px] text-[13px] hover:bg-[#f5f5f5] ${mode === 'plan' ? 'font-medium' : ''}`}
                    >
                      Plan
                    </button>
                  </div>
                )}
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || generating}
                className="w-[24px] h-[24px] rounded-full bg-[#1c1c1c] flex items-center justify-center disabled:opacity-40"
              >
                {generating ? (
                  <Loader2 size={12} className="animate-spin text-white" />
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 10V2M6 2L2 6M6 2L10 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
