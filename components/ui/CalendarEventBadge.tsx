'use client';

import { useState } from 'react';
import { CalendarCheck, CalendarPlus, Loader2, ExternalLink } from 'lucide-react';

interface Props {
  /** If already synced, pass the Google Calendar event link */
  eventLink?: string | null;
  /** Called when user clicks "Add to Calendar" — should POST to /api/calendar and return the link */
  onAdd?: () => Promise<string | null>;
  size?: 'sm' | 'md';
}

/**
 * Shows a "Add to Calendar" button or a "Synced" badge with a link to the event.
 * Handles its own loading state.
 */
export default function CalendarEventBadge({ eventLink, onAdd, size = 'md' }: Props) {
  const [loading, setLoading]   = useState(false);
  const [link, setLink]         = useState<string | null>(eventLink ?? null);
  const [error, setError]       = useState<string | null>(null);

  const sm = size === 'sm';

  const handleAdd = async () => {
    if (!onAdd) return;
    setLoading(true);
    setError(null);
    try {
      const result = await onAdd();
      if (result) setLink(result);
      else setError('Could not create event. Sign in with Google first.');
    } catch {
      setError('Failed to add to calendar.');
    } finally {
      setLoading(false);
    }
  };

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 font-semibold rounded-xl transition-colors
          ${sm
            ? 'px-2.5 py-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            : 'px-4 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
          }`}
        title="View in Google Calendar"
      >
        <CalendarCheck className={sm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        Calendar
        <ExternalLink className={sm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </a>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleAdd}
        disabled={loading || !onAdd}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-xl transition-all
          ${sm
            ? 'px-2.5 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 disabled:opacity-50'
            : 'px-4 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 disabled:opacity-50'
          }`}
        title="Add to Google Calendar"
      >
        {loading
          ? <Loader2 className={`${sm ? 'w-3.5 h-3.5' : 'w-4 h-4'} animate-spin`} />
          : <CalendarPlus className={sm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        }
        {loading ? 'Adding…' : 'Add to Calendar'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
