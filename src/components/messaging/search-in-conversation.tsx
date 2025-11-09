'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SearchInConversationProps {
  messages: Message[];
  onClose: () => void;
  onNavigateToMessage: (messageId: string) => void;
}

export function SearchInConversation({
  messages,
  onClose,
  onNavigateToMessage,
}: SearchInConversationProps) {
  const t = useTranslations('messaging');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Search messages
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setCurrentIndex(0);
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = messages.filter((message) =>
      message.content.toLowerCase().includes(searchLower)
    );

    setResults(filtered);
    setCurrentIndex(filtered.length > 0 ? 0 : -1);
  }, [query, messages]);

  // Navigate to next result
  const handleNext = () => {
    if (results.length === 0) return;
    const nextIndex = (currentIndex + 1) % results.length;
    setCurrentIndex(nextIndex);
    onNavigateToMessage(results[nextIndex].id);
  };

  // Navigate to previous result
  const handlePrevious = () => {
    if (results.length === 0) return;
    const prevIndex = currentIndex === 0 ? results.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    onNavigateToMessage(results[prevIndex].id);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        handlePrevious();
      } else {
        handleNext();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="bg-background border-b shadow-lg p-3">
      <div className="flex items-center gap-2 max-w-2xl mx-auto">
        {/* Search icon */}
        <Search className="w-5 h-5 text-muted-foreground" />

        {/* Search input */}
        <Input
          type="text"
          placeholder={t('searchInConversation')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          autoFocus
        />

        {/* Results counter */}
        {query && (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {results.length > 0 ? (
              <>
                {currentIndex + 1} / {results.length}
              </>
            ) : (
              <span>{t('noResults')}</span>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        {results.length > 0 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="h-8 w-8"
              title={t('previousResult')}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8"
              title={t('nextResult')}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Help text */}
      <p className="text-xs text-center text-muted-foreground mt-2">
        {t('searchHelpText')}
      </p>
    </div>
  );
}

// Highlight search term in message
interface HighlightedTextProps {
  text: string;
  highlight: string;
  className?: string;
}

export function HighlightedText({ text, highlight, className }: HighlightedTextProps) {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-700 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}
