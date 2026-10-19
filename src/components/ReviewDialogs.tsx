import { Check, X } from 'lucide-react';
import type { ToastMessage } from '../types';

type ManualFieldValues = { field: string; value: string };

type ReviewDialogsProps = {
  editorValue: string | null;
  manualValues: ManualFieldValues;
  showManualDialog: boolean;
  toast: ToastMessage | null;
  onEditorChange: (value: string) => void;
  onSaveEditor: () => void;
  onCloseEditor: () => void;
  onManualValuesChange: (values: ManualFieldValues) => void;
  onSaveManualField: () => void;
  onCloseManualDialog: () => void;
};

// Keeps editing, manual-field entry, and feedback dialogs out of the workflow state code.
export function ReviewDialogs({
  editorValue,
  manualValues,
  showManualDialog,
  toast,
  onEditorChange,
  onSaveEditor,
  onCloseEditor,
  onManualValuesChange,
  onSaveManualField,
  onCloseManualDialog,
}: ReviewDialogsProps) {
  return (
    <>
      {editorValue !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Edit field value</h3>
              <button
                type="button"
                onClick={onCloseEditor}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="mb-4 block text-sm font-medium text-slate-700">
              Value
              <input
                value={editorValue}
                onChange={(event) => onEditorChange(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCloseEditor}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSaveEditor}
                className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showManualDialog && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Add a new field</h3>
              <button
                type="button"
                onClick={onCloseManualDialog}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Field name
                <input
                  value={manualValues.field}
                  onChange={(event) =>
                    onManualValuesChange({ ...manualValues, field: event.target.value })
                  }
                  placeholder="e.g. vatnumber"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Field value
                <input
                  value={manualValues.value}
                  onChange={(event) =>
                    onManualValuesChange({ ...manualValues, value: event.target.value })
                  }
                  placeholder="Enter extracted value"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCloseManualDialog}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSaveManualField}
                className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                Save field
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-5 top-5 z-50 w-[320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-700">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              <p className="text-xs text-slate-600">{toast.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
