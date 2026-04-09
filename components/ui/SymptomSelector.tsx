'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SYMPTOMS, type Symptom } from '@/lib/symptomList';

interface SymptomSelectorProps {
  selected: Symptom[];
  onChange: (symptoms: Symptom[]) => void;
  placeholder?: string;
}

export default function SymptomSelector({
  selected,
  onChange,
  placeholder = 'Search symptoms...',
}: SymptomSelectorProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // All unselected symptoms, filtered by query
  const suggestions = SYMPTOMS.filter(
    (s) =>
      (!query.trim() || s.display.toLowerCase().includes(query.toLowerCase())) &&
      !selected.find((sel) => sel.key === s.key)
  );

  const add = useCallback(
    (s: Symptom) => {
      onChange([...selected, s]);
      setQuery('');
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [selected, onChange]
  );

  const remove = (key: string) => onChange(selected.filter((s) => s.key !== key));

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          add(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setActiveIndex(-1);
        break;
      case 'Backspace':
        if (!query && selected.length > 0) {
          remove(selected[selected.length - 1].key);
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className="w-full space-y-2">
      {/* ── Search bar ── */}
      <div
        className={`flex items-center gap-2 px-4 py-3 bg-white border-2 rounded-xl cursor-text transition-colors ${
          open
            ? 'border-blue-500 ring-2 ring-blue-100'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-controls="symptom-listbox"
          aria-activedescendant={activeIndex >= 0 ? `symptom-opt-${activeIndex}` : undefined}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(0); }}
          onFocus={() => { setOpen(true); if (activeIndex < 0) setActiveIndex(0); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
        {selected.length > 0 && (
          <span className="text-xs text-gray-400 font-medium flex-shrink-0 bg-gray-100 px-2 py-0.5 rounded-full">
            {selected.length} selected
          </span>
        )}
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o); inputRef.current?.focus(); }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={open ? 'Close suggestions' : 'Open suggestions'}
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div
          ref={listRef}
          id="symptom-listbox"
          role="listbox"
          aria-label="Symptom suggestions"
          className="w-full max-h-56 overflow-y-auto bg-white border-2 border-gray-200 rounded-xl shadow-xl"
        >
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 text-center">
              {query ? 'No matching symptoms found' : 'All symptoms already selected'}
            </p>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={s.key}
                id={`symptom-opt-${i}`}
                role="option"
                aria-selected="true"
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(s); }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors border-b border-gray-50 last:border-0 ${
                  i === activeIndex
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    i === activeIndex ? 'bg-white' : 'bg-blue-400'
                  }`}
                />
                {s.display}
              </button>
            ))
          )}
        </div>
      )}

      {/* ── Selected chips box ── */}
      {selected.length > 0 && (
        <div className="p-3 bg-blue-50 border-2 border-blue-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Selected Symptoms ({selected.length})
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((s) => (
              <span
                key={s.key}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs font-medium rounded-full shadow-sm"
              >
                {s.display}
                <button
                  type="button"
                  onClick={() => remove(s.key)}
                  aria-label={`Remove ${s.display}`}
                  className="hover:bg-white/25 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
