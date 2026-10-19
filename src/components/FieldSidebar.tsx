import { Check, PencilLine, Search } from 'lucide-react';
import type { ExtractedField } from '../types';
import { getStatusClasses, getStatusLabel } from '../types';

type FieldSidebarProps = {
  fields: ExtractedField[];
  searchTerm: string;
  selectedFieldId: string | null;
  onSearch: (value: string) => void;
  onSelect: (field: ExtractedField) => void;
  onEdit: (fieldId: string) => void;
  onApprove: (fieldId: string) => void;
};

// Field selection and review actions live here; the parent owns and updates field data.
export function FieldSidebar({
  fields,
  searchTerm,
  selectedFieldId,
  onSearch,
  onSelect,
  onEdit,
  onApprove,
}: FieldSidebarProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          value={searchTerm}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search fields"
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
            No matching extracted fields.
          </div>
        ) : (
          fields.map((field) => {
            const isSelected = selectedFieldId === field.id;
            return (
              <div
                key={field.id}
                className={`rounded-xl border p-3 transition ${
                  isSelected
                    ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button type="button" onClick={() => onSelect(field)} className="w-full text-left">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {field.field}
                    </p>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-medium ${getStatusClasses(field.status)}`}
                    >
                      {getStatusLabel(field.status)}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">{field.value}</p>
                </button>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(field.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <PencilLine className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onApprove(field.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
