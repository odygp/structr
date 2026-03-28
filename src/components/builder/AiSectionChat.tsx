'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, X, ChevronDown, Loader2, Plus } from 'lucide-react';

export interface ChatMessage {
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
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
  width?: number;
}

export default function AiSectionChat({
  sectionName, sectionId, category, variantId, content, projectId,
  onClose, onApply, generating, onSetGenerating,
  initialMessages = [], onMessagesChange, width = 240,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'auto' | 'plan'>('auto');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync initial messages when sectionId changes
  useEffect(() => {
    setMessages(initialMessages);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]);

  // Notify parent of message changes
  useEffect(() => {
    onMessagesChange?.(messages);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
  };

  const handleSend = async () => {
    if (!input.trim() || generating) return;
    const instruction = input.trim();
    setInput('');
    const updated = [...messages, { role: 'user' as const, content: instruction }];
    updateMessages(updated);
    onSetGenerating(true);

    try {
      const res = await fetch('/api/ai/edit-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, projectId, category, variantId, content, instruction, mode }),
      });

      const data = await res.json();

      if (data.error) {
        updateMessages([...updated, { role: 'assistant', content: data.error, type: 'error' }]);
      } else if (data.mode === 'plan') {
        setPendingSuggestion(data.suggestion);
        updateMessages([...updated, { role: 'assistant', content: data.suggestion, type: 'suggestion' }]);
      } else {
        onApply(data.content);
        updateMessages([...updated, { role: 'assistant', content: 'Changes applied.', type: 'applied' }]);
      }
    } catch (e) {
      updateMessages([...updated, { role: 'assistant', content: e instanceof Error ? e.message : 'Something went wrong', type: 'error' }]);
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
        body: JSON.stringify({ sectionId, projectId, category, variantId, content, instruction: `Apply these exact changes:\n${pendingSuggestion}`, mode: 'auto' }),
      });
      const data = await res.json();
      if (data.content) {
        onApply(data.content);
        updateMessages([...messages, { role: 'assistant', content: 'Changes applied.', type: 'applied' }]);
      }
    } catch {
      updateMessages([...messages, { role: 'assistant', content: 'Failed to apply changes.', type: 'error' }]);
    } finally {
      onSetGenerating(false);
      setPendingSuggestion(null);
    }
  };

  const innerWidth = width - 16; // 8px padding each side

  return (
    <aside style={{ width }} className="bg-white border-l border-[#ebebeb] flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-[12px] pt-[12px] pb-[12px]">
        <span className="text-[14px] font-medium text-[#1c1c1c]">AI Support</span>
        <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[8px] hover:bg-[#f5f5f5]">
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
                <button onClick={handleApplySuggestion} className="mt-[8px] w-full py-[6px] text-[12px] font-medium text-white bg-[#1c1c1c] rounded-[8px] hover:bg-[#333]">
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

      {/* Bottom input area — pixel-perfect from Figma */}
      <div className="p-[8px]">
        <div style={{ width: innerWidth }} className="border border-dashed border-[#d4d4d4] rounded-[16px] p-[8px]">
          {/* Section pill */}
          <div className="flex items-center justify-between h-[24px]">
            <span className="text-[13px] text-[#1c1c1c] pl-[8px]">{sectionName}</span>
            <button onClick={onClose} className="text-[#808080] hover:text-[#1c1c1c]">
              <X size={16} />
            </button>
          </div>

          {/* Text input area */}
          <div className="mt-[8px] border border-[#ebebeb] rounded-[8px] p-[8px]">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type here.."
              rows={2}
              style={{ width: innerWidth - 32 }}
              className="w-full resize-none bg-transparent text-[13px] text-[#1c1c1c] placeholder:text-[#808080] focus:outline-none"
              disabled={generating}
            />

            {/* Bottom controls */}
            <div className="flex items-center justify-between mt-[8px]">
              <button className="w-[24px] h-[24px] flex items-center justify-center text-[#808080] hover:text-[#1c1c1c]">
                <Plus size={16} />
              </button>

              <div className="flex items-center gap-[8px]">
                {/* Mode selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowModeDropdown(!showModeDropdown)}
                    className="flex items-center gap-[4px] text-[14px] text-[#1c1c1c]"
                  >
                    {mode === 'auto' ? 'Auto Edit' : 'Plan'}
                    <ChevronDown size={16} />
                  </button>
                  {showModeDropdown && (
                    <div className="absolute bottom-[28px] right-0 bg-white border border-[#ebebeb] rounded-[8px] shadow-lg py-[4px] z-10 min-w-[100px]">
                      <button onClick={() => { setMode('auto'); setShowModeDropdown(false); }} className={`w-full text-left px-[12px] py-[6px] text-[13px] hover:bg-[#f5f5f5] ${mode === 'auto' ? 'font-medium' : ''}`}>
                        Auto Edit
                      </button>
                      <button onClick={() => { setMode('plan'); setShowModeDropdown(false); }} className={`w-full text-left px-[12px] py-[6px] text-[13px] hover:bg-[#f5f5f5] ${mode === 'plan' ? 'font-medium' : ''}`}>
                        Plan
                      </button>
                    </div>
                  )}
                </div>

                {/* Send button — square with rounded corners per Figma */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || generating}
                  className="w-[24px] h-[24px] rounded-[6px] bg-[#1c1c1c] flex items-center justify-center disabled:opacity-40"
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
      </div>
    </aside>
  );
}
