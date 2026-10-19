import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ChangeLogEntry } from '../types';
import { formatLocalTimestamp } from '../types';

type ChangeLogPanelProps = {
  entries: ChangeLogEntry[];
  isOpen: boolean;
  onToggle: () => void;
};

// Shows edits newest-first, including the values needed to audit each change.
export function ChangeLogPanel({ entries, isOpen, onToggle }: ChangeLogPanelProps) {
  return (
    <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-700"
      >
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Change Log
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3">
          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
              No edits yet. Changes will appear here in real time.
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{entry.field}</p>
                    <p className="text-xs text-slate-500">{formatLocalTimestamp(entry.timestamp)}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                    {entry.fieldId}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-red-50 p-2 text-xs text-red-700">
                    <span className="mb-1 block font-semibold">Previous</span>
                    <span className="font-medium">{entry.oldValue}</span>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700">
                    <span className="mb-1 block font-semibold">Updated</span>
                    <span className="font-medium">{entry.newValue}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
