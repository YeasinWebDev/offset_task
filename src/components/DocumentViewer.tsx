import type { PointerEvent, RefObject } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileImage,
  FileText,
  Loader2,
  Plus,
} from 'lucide-react';
import type {
  BoundingBox,
  ExtractedField,
  LoadedDocument,
  PdfModule,
} from '../types';
import { normalizeBox } from '../types';

type DrawingPoint = { x: number; y: number };
type DraftRectangle = { page: number; box: BoundingBox };

type DocumentViewerProps = {
  documentState: LoadedDocument;
  pdfModule: PdfModule | null;
  documentRef: RefObject<HTMLDivElement | null>;
  pageFields: ExtractedField[];
  selectedFieldId: string | null;
  draftRect: DraftRectangle | null;
  drawingStart: DrawingPoint | null;
  drawingCurrent: DrawingPoint | null;
  drawMode: boolean;
  isLoadingDocument: boolean;
  errorMessage: string | null;
  renderedWidth: number;
  renderedHeight: number;
  onPageChange: (page: number) => void;
  onToggleDraw: () => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onSelectField: (fieldId: string) => void;
  onPageDimensions: (width: number, height: number) => void;
  onPageCount: (pageCount: number) => void;
  onDocumentLoaded: () => void;
  onDocumentError: (message: string) => void;
  onLoadSample: () => void;
};

// Renders the page and its overlays on the same scaled surface so boxes stay aligned.
export function DocumentViewer({
  documentState,
  pdfModule,
  documentRef,
  pageFields,
  selectedFieldId,
  draftRect,
  drawingStart,
  drawingCurrent,
  drawMode,
  isLoadingDocument,
  errorMessage,
  renderedWidth,
  renderedHeight,
  onPageChange,
  onToggleDraw,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onSelectField,
  onPageDimensions,
  onPageCount,
  onDocumentLoaded,
  onDocumentError,
  onLoadSample,
}: DocumentViewerProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={documentState.kind !== 'pdf' || documentState.pageNumber <= 1}
            onClick={() => onPageChange(Math.max(1, documentState.pageNumber - 1))}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700">
            {documentState.kind === 'pdf'
              ? `Page ${documentState.pageNumber} of ${documentState.pageCount}`
              : 'Page 1'}
          </div>
          <button
            type="button"
            disabled={documentState.kind !== 'pdf' || documentState.pageNumber >= documentState.pageCount}
            onClick={() =>
              onPageChange(Math.min(documentState.pageCount, documentState.pageNumber + 1))
            }
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleDraw}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            drawMode
              ? 'bg-blue-600 text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Plus className="h-4 w-4" />
          Add Field
        </button>
      </div>

      <div className="p-4">
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isLoadingDocument ? (
          <div className="flex min-h-[560px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading document...
            </div>
          </div>
        ) : documentState.url ? (
          <div
            className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4"
            style={{ maxHeight: 'calc(100vh - 16rem)' }}
          >
            <div className="flex min-h-[500px] w-max min-w-full items-start justify-center">
              <div
                ref={documentRef}
                className={`relative shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${drawMode ? 'cursor-crosshair' : 'cursor-default'}`}
                style={{ width: `${renderedWidth + 2}px`, height: `${renderedHeight + 2}px` }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                {documentState.kind === 'pdf' ? (
                  pdfModule ? (
                    <pdfModule.Document
                      file={documentState.url}
                      onLoadSuccess={({ numPages }) => {
                        onPageCount(numPages);
                        onDocumentLoaded();
                      }}
                      onLoadError={() =>
                        onDocumentError('The PDF could not be rendered. Please try a different file.')
                      }
                      loading={null}
                      error={
                        <div className="flex h-full items-center justify-center text-red-600">
                          Unable to render PDF.
                        </div>
                      }
                    >
                      <pdfModule.Page
                        pageNumber={documentState.pageNumber}
                        width={renderedWidth}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        onLoadSuccess={(page) => {
                          const { width, height } = page.getViewport({ scale: 1 });
                          onPageDimensions(width, height);
                        }}
                      />
                    </pdfModule.Document>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-600">
                      Loading PDF viewer...
                    </div>
                  )
                ) : (
                  <img
                    src={documentState.url}
                    alt={documentState.fileName}
                    className="block h-full w-full select-none object-contain"
                    draggable={false}
                    onLoad={(event) => {
                      const target = event.currentTarget;
                      onPageDimensions(target.naturalWidth, target.naturalHeight);
                      onDocumentLoaded();
                    }}
                  />
                )}

                <div className="absolute inset-0" style={{ pointerEvents: drawMode ? 'auto' : 'none' }}>
                  {drawingStart && drawingCurrent && (
                    <div
                      className="absolute border-2 border-dashed border-blue-500 bg-blue-200/20"
                      style={{
                        left: `${Math.min(drawingStart.x, drawingCurrent.x) * (renderedWidth / Math.max(documentState.sourceWidth, 1))}px`,
                        top: `${Math.min(drawingStart.y, drawingCurrent.y) * (renderedHeight / Math.max(documentState.sourceHeight, 1))}px`,
                        width: `${Math.abs(drawingCurrent.x - drawingStart.x) * (renderedWidth / Math.max(documentState.sourceWidth, 1))}px`,
                        height: `${Math.abs(drawingCurrent.y - drawingStart.y) * (renderedHeight / Math.max(documentState.sourceHeight, 1))}px`,
                      }}
                    />
                  )}
                </div>

                <div className="absolute inset-0" style={{ pointerEvents: drawMode ? 'none' : 'auto' }}>
                  {pageFields.map((field) => {
                    const [x1, y1, x2, y2] = normalizeBox(field.bbox);
                    const isSelected = selectedFieldId === field.id;
                    const scaleX = renderedWidth / Math.max(documentState.sourceWidth, 1);
                    const scaleY = renderedHeight / Math.max(documentState.sourceHeight, 1);
                    const boxStyle = {
                      left: `${x1 * scaleX}px`,
                      top: `${y1 * scaleY}px`,
                      width: `${(x2 - x1) * scaleX}px`,
                      height: `${(y2 - y1) * scaleY}px`,
                    };

                    return (
                      <button
                        key={field.id}
                        type="button"
                        data-field-id={field.id}
                        onClick={() => onSelectField(field.id)}
                        className={`absolute overflow-visible rounded-md border-2 transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-500/20 shadow-[0_0_0_2px_rgba(59,130,246,0.15)]'
                            : 'border-sky-500 bg-sky-400/15 hover:border-blue-500'
                        }`}
                        style={{ ...boxStyle, opacity: isSelected ? 1 : 0.75 }}
                        aria-label={`${field.field} bounding box`}
                      >
                        {isSelected && (
                          <span className="absolute left-0 top-0 -translate-y-full whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white shadow-lg">
                            {field.field}: {field.value}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {draftRect && (
                    <div
                      className="absolute border-2 border-emerald-500 bg-emerald-500/15"
                      style={{
                        left: `${draftRect.box[0] * (renderedWidth / Math.max(documentState.sourceWidth, 1))}px`,
                        top: `${draftRect.box[1] * (renderedHeight / Math.max(documentState.sourceHeight, 1))}px`,
                        width: `${(draftRect.box[2] - draftRect.box[0]) * (renderedWidth / Math.max(documentState.sourceWidth, 1))}px`,
                        height: `${(draftRect.box[3] - draftRect.box[1]) * (renderedHeight / Math.max(documentState.sourceHeight, 1))}px`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[560px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FileImage className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Upload an invoice to review</h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Choose a PDF or image. The sample invoice is already loaded for testing the extraction review workflow.
            </p>
            <button
              type="button"
              onClick={onLoadSample}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              <FileText className="h-4 w-4" />
              Load sample invoice
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
