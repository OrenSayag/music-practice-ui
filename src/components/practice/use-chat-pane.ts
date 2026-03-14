import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/api-client';

export function useChatPane() {
  const [input, setInput] = useState('');
  const queryClient = useQueryClient();
  const prevStatusRef = useRef<string>('');

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat/stream',
        credentials: 'include',
      }),
    []
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onError: (error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  // Load chat history on mount
  useEffect(() => {
    apiClient.get<Array<{ id: string; role: string; content: string }>>('/chat/history').then((history) => {
      if (history.length > 0) {
        setMessages(history.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          parts: [{ type: 'text' as const, text: m.content }],
        })));
      }
    }).catch(() => {
      // Silent fail — chat history is non-critical
    });
  }, [setMessages]);

  const isLoading = status === 'streaming' || status === 'submitted';

  // Show thinking dots while loading and no final text has appeared yet
  const isThinking = isLoading && (() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) return true;
    const hasText = lastAssistant.parts.some(
      (p) => p.type === 'text' && 'text' in p && (p as { text: string }).text.length > 0
    );
    return !hasText;
  })();

  // Refetch plan only when AI used tools to modify it
  useEffect(() => {
    const wasLoading = prevStatusRef.current === 'streaming' || prevStatusRef.current === 'submitted';
    if (wasLoading && status === 'ready') {
      const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
      const hadToolCalls = lastAssistant?.parts.some(
        (p) => p.type === 'dynamic-tool' || p.type.startsWith('tool-')
      );
      if (hadToolCalls) {
        queryClient.invalidateQueries({ queryKey: ['plans', 'active'] });
      }
    }
    prevStatusRef.current = status;
  }, [status, queryClient, messages]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;
      sendMessage({ text: trimmed });
      setInput('');
    },
    [input, isLoading, sendMessage]
  );

  const handleClear = async () => {
    setMessages([]);
    try {
      await apiClient.delete('/chat/history');
    } catch {
      toast.error('Failed to clear chat history');
    }
  };

  return {
    messages,
    input,
    isLoading,
    isThinking,
    setInput,
    handleSubmit,
    handleClear,
  };
}
