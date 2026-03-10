import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDir } from '@/hooks/use-dir';
import { Send } from 'lucide-react';
import Markdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';
import { SectionTitle } from '@/components/section-title';
import { useChatPane } from './use-chat-pane';

export function ChatPane() {
  const { t } = useTranslation();
  const { messages, input, isLoading, isThinking, setInput, handleSubmit, handleClear } =
    useChatPane();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between p-4 pb-0">
        <SectionTitle>{t('practice.planChat')}</SectionTitle>
        <button
          className="font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          onClick={handleClear}
        >
          {t('practice.clear')}
        </button>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {messages.map((message) => {
          const text = message.parts
            .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map((p) => p.text)
            .join('');
          if (!text) return null;
          return (
            <ChatMessage
              key={message.id}
              role={message.role as 'user' | 'assistant'}
              content={text}
            />
          );
        })}
        {isThinking && <ThinkingIndicator />}
      </div>

      <form onSubmit={handleSubmit} className="flex shrink-0 items-start gap-3 border-t border-border p-4">
        <Textarea
          className="max-h-32 min-h-10 flex-1 resize-none font-mono text-[13px] placeholder:text-muted-foreground/60"
          placeholder={t('practice.chatPlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-green text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function detectDir(text: string): 'rtl' | 'ltr' {
  const firstStrong = text.match(/[\p{Script=Arabic}\p{Script=Hebrew}]|[a-zA-Z]/u);
  if (!firstStrong) return 'ltr';
  return /[\p{Script=Arabic}\p{Script=Hebrew}]/u.test(firstStrong[0]) ? 'rtl' : 'ltr';
}

function ChatMessage({
  role,
  content,
}: {
  role: 'user' | 'assistant';
  content: string;
}) {
  const { t } = useTranslation();
  const isUser = role === 'user';
  const appDir = useDir();
  const contentDir = detectDir(content);

  return (
    <div
      className={`flex flex-col gap-1 ${isUser ? 'rounded bg-muted p-3' : ''}`}
      dir={appDir}
    >
      <span className="font-mono text-[11px] font-medium text-accent-green">
        {isUser ? t('practice.you') : t('practice.assistant')}
      </span>
      <div
        dir={contentDir}
        className="max-w-none space-y-2 font-mono text-[13px] leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_a]:text-accent-green [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground"
      >
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[11px] font-medium text-accent-green">
        {t('practice.assistant')}
      </span>
      <p className="animate-pulse font-mono text-[13px] text-muted-foreground">...</p>
    </div>
  );
}
