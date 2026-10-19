import type { ChangeEvent, RefObject } from 'react';
import {
  FileText,
  RefreshCcw,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

type DashboardHeaderProps = {
  documentName: string;
  reviewStatus: string;
  reviewedCount: number;
  fieldCount: number;
  zoomLevel: number;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onZoomChange: (nextZoom: number) => void;
  onFit: () => void;
  onResetZoom: () => void;
};

// Keeps document controls and review progress together; state remains in App.
export function DashboardHeader({
  documentName,
  reviewStatus,
  reviewedCount,
  fieldCount,
  zoomLevel,
  fileInputRef,
  onFileChange,
  onZoomChange,
  onFit,
  onResetZoom,
}: DashboardHeaderProps) {
  return (
    <header className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-semibold tracking-tight text-slate-900">InvoiceLens</p>
            <p className="text-sm text-slate-500">Invoice Extraction Review</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 flex-wrap">
          <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left xl:max-w-[220px]">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Document</p>
            <p className="truncate text-sm font-medium text-slate-800">{documentName}</p>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              reviewStatus === 'Approved'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                : reviewStatus === 'In Review'
                  ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                  : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
            }`}
          >
            {reviewStatus}
          </span>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Upload className="h-4 w-4" />
            Upload New Document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-40 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${Math.round((reviewedCount / Math.max(fieldCount, 1)) * 100)}%` }}
            />
          </div>
          <p className="text-sm font-medium text-slate-700">
            {reviewedCount} / {fieldCount} fields reviewed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onZoomChange(zoomLevel - 0.1)}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-14 text-center text-sm font-medium text-slate-700">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(zoomLevel + 0.1)}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onFit}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Fit
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
