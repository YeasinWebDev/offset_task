import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, PointerEvent } from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { DocumentViewer } from './components/DocumentViewer';
import { FieldSidebar } from './components/FieldSidebar';
import { ChangeLogPanel } from './components/ChangeLogPanel';
import { ReviewDialogs } from './components/ReviewDialogs';
import type {
  BoundingBox,
  ChangeLogEntry,
  ExtractedField,
  LoadedDocument,
  PdfModule,
  ToastMessage,
} from './types';
import { normalizeBox } from './types';

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.4;

const initialFields: ExtractedField[] = [
  {
    id: 'field-1',
    field: 'invoicenumber',
    value: 'INV-2041',
    page: 1,
    bbox: [708, 126, 850, 155],
    status: 'pending',
  },
  {
    id: 'field-2',
    field: 'date',
    value: '2026-09-14',
    page: 1,
    bbox: [708, 161, 882, 184],
    status: 'pending',
  },
  {
    id: 'field-3',
    field: 'totalamount',
    value: '48,250.00',
    page: 1,
    bbox: [798, 910, 990, 956],
    status: 'pending',
  },
];

const initialDocument: LoadedDocument = {
  fileName: 'sample-invoice.svg',
  url: '/sample-invoice.svg',
  kind: 'image',
  pageCount: 1,
  pageNumber: 1,
  sourceWidth: 1000,
  sourceHeight: 1400,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const makeLogId = () => `change-${Math.random().toString(36).slice(2, 10)}`;

// App owns review state and passes small, explicit props to the UI components.
function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const documentRef = useRef<HTMLDivElement | null>(null);

  const [fields, setFields] = useState<ExtractedField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>('field-1');
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [documentState, setDocumentState] = useState<LoadedDocument>(initialDocument);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [editorState, setEditorState] = useState<{ fieldId: string; value: string } | null>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [draftRect, setDraftRect] = useState<{ page: number; box: BoundingBox } | null>(null);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [drawingCurrent, setDrawingCurrent] = useState<{ x: number; y: number } | null>(null);
  const [manualValues, setManualValues] = useState({ field: '', value: '' });
  const [showLog, setShowLog] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pdfModule, setPdfModule] = useState<PdfModule | null>(null);

  const selectedField = fields.find((field) => field.id === selectedFieldId) ?? null;

  const filteredFields = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return fields;

    return fields.filter((field) =>
      `${field.field} ${field.value}`.toLowerCase().includes(normalized),
    );
  }, [fields, searchTerm]);

  const reviewedCount = fields.filter((field) => field.status !== 'pending').length;
  const reviewStatus = useMemo(() => {
    if (!fields.length) return 'Pending Review';
    if (fields.every((field) => field.status === 'approved')) return 'Approved';
    if (fields.some((field) => field.status === 'edited' || field.status === 'approved')) {
      return 'In Review';
    }
    return 'Pending Review';
  }, [fields]);

  const renderedWidth = documentState.sourceWidth ? documentState.sourceWidth * zoomLevel : 760;
  const renderedHeight = documentState.sourceHeight ? documentState.sourceHeight * zoomLevel : 1000;
  const pageFields = fields.filter((field) => field.page === documentState.pageNumber);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEditorState(null);
        setDrawMode(false);
        setDrawingStart(null);
        setDrawingCurrent(null);
        setDraftRect(null);
        setManualValues({ field: '', value: '' });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!selectedField) return;
    const box = document.querySelector(`[data-field-id="${selectedField.id}"]`) as HTMLElement | null;
    box?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [selectedField, documentState.pageNumber, zoomLevel]);

  useEffect(() => {
    return () => {
      if (documentState.objectUrl && documentState.url.startsWith('blob:')) {
        URL.revokeObjectURL(documentState.url);
      }
    };
  }, [documentState.objectUrl, documentState.url]);

  const showToast = (title: string, description: string) => {
    setToast({ title, description });
  };

  const applyZoom = (nextZoom: number) => {
    setZoomLevel(clamp(Number(nextZoom.toFixed(2)), MIN_ZOOM, MAX_ZOOM));
  };

  const resetReviewState = (
    nextFields: ExtractedField[] = [],
    nextDocument: LoadedDocument = initialDocument,
  ) => {
    setFields(nextFields);
    setSelectedFieldId(nextFields[0]?.id ?? null);
    setSearchTerm('');
    setChangeLog([]);
    setEditorState(null);
    setDrawMode(false);
    setDraftRect(null);
    setDrawingStart(null);
    setDrawingCurrent(null);
    setManualValues({ field: '', value: '' });
    setPdfModule(null);
    setDocumentState(nextDocument);
    setZoomLevel(1);
    setErrorMessage(null);
  };

  const handleApprove = (fieldId: string) => {
    setFields((current) =>
      current.map((item) => (item.id === fieldId ? { ...item, status: 'approved' } : item)),
    );
    const field = fields.find((item) => item.id === fieldId);
    if (field) showToast('Field approved', `${field.field} has been approved.`);
  };

  const openEditor = (fieldId: string) => {
    const field = fields.find((item) => item.id === fieldId);
    if (field) setEditorState({ fieldId, value: field.value });
  };

  const saveEditor = () => {
    if (!editorState) return;

    const field = fields.find((item) => item.id === editorState.fieldId);
    if (!field) {
      setEditorState(null);
      return;
    }

    if (editorState.value !== field.value) {
      const entry: ChangeLogEntry = {
        id: makeLogId(),
        fieldId: field.id,
        field: field.field,
        oldValue: field.value,
        newValue: editorState.value,
        timestamp: new Date().toISOString(),
      };

      setChangeLog((current) => [entry, ...current]);
      setFields((current) =>
        current.map((item) =>
          item.id === field.id ? { ...item, value: editorState.value, status: 'edited' } : item,
        ),
      );
      showToast('Field updated', `${field.field} was edited.`);
    }

    setEditorState(null);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('File size must be 15 MB or less.');
      showToast('Upload failed', 'File size must be 15 MB or less.');
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage =
      file.type.startsWith('image/') ||
      ['.png', '.jpg', '.jpeg'].some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isPdf && !isImage) {
      setErrorMessage('Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG invoice.');
      showToast('Unsupported file', 'Choose a PDF, PNG, JPG, or JPEG invoice.');
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setIsLoadingDocument(true);
    setErrorMessage(null);
    setFields([]);
    setSelectedFieldId(null);
    setSearchTerm('');
    setChangeLog([]);
    setEditorState(null);
    setDrawMode(false);
    setDraftRect(null);
    setDrawingStart(null);
    setDrawingCurrent(null);
    setManualValues({ field: '', value: '' });
    setDocumentState((current) => {
      if (current.objectUrl && current.url.startsWith('blob:')) {
        URL.revokeObjectURL(current.url);
      }

      return {
        fileName: file.name,
        url: nextUrl,
        kind: isPdf ? 'pdf' : 'image',
        pageCount: 1,
        pageNumber: 1,
        sourceWidth: 1000,
        sourceHeight: 1400,
        objectUrl: true,
      };
    });

    if (isPdf) {
      import('react-pdf')
        .then((module) => {
          module.pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
          ).toString();
          setPdfModule(module);
        })
        .catch(() => {
          setErrorMessage('The PDF viewer could not be loaded. Please try a different file.');
        })
        .finally(() => {
          setIsLoadingDocument(false);
        });
    } else {
      setPdfModule(null);
      setTimeout(() => setIsLoadingDocument(false), 350);
    }

    setZoomLevel(1);
    event.target.value = '';
  };

  const handleFitToScreen = () => {
    const viewport = documentRef.current?.parentElement?.parentElement;
    if (!viewport || !documentState.sourceWidth || !documentState.sourceHeight) {
      setZoomLevel(1);
      return;
    }

    const availableWidth = Math.max(viewport.clientWidth - 34, 1);
    const availableHeight = Math.max(viewport.clientHeight - 34, 1);
    const fitZoom = Math.min(
      availableWidth / documentState.sourceWidth,
      availableHeight / documentState.sourceHeight,
    );

    applyZoom(clamp(fitZoom, MIN_ZOOM, MAX_ZOOM));
  };

  // Convert screen pointer positions back into the document's unscaled coordinates.
  const getDocumentPoint = (event: PointerEvent<HTMLDivElement>) => {
    if (!documentRef.current) return null;

    const rect = documentRef.current.getBoundingClientRect();
    const { clientLeft, clientTop } = documentRef.current;
    const contentWidth = rect.width - clientLeft * 2;
    const contentHeight = rect.height - clientTop * 2;
    return {
      x: clamp(
        ((event.clientX - rect.left - clientLeft) / contentWidth) * documentState.sourceWidth,
        0,
        documentState.sourceWidth,
      ),
      y: clamp(
        ((event.clientY - rect.top - clientTop) / contentHeight) * documentState.sourceHeight,
        0,
        documentState.sourceHeight,
      ),
    };
  };

  const beginDraw = (event: PointerEvent<HTMLDivElement>) => {
    if (!drawMode) return;
    event.preventDefault();
    const point = getDocumentPoint(event);
    if (!point) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setDrawingStart(point);
    setDrawingCurrent(point);
  };

  const updateDraw = (event: PointerEvent<HTMLDivElement>) => {
    if (!drawMode || !drawingStart) return;
    event.preventDefault();
    const point = getDocumentPoint(event);
    if (point) setDrawingCurrent(point);
  };

  const finishDraw = (event: PointerEvent<HTMLDivElement>) => {
    if (!drawMode || !drawingStart) return;

    const point = getDocumentPoint(event);
    if (point) {
      const box = normalizeBox([drawingStart.x, drawingStart.y, point.x, point.y]);
      if (Math.abs(box[2] - box[0]) > 8 && Math.abs(box[3] - box[1]) > 8) {
        setDraftRect({ page: documentState.pageNumber, box });
        setManualValues({ field: '', value: '' });
      }
    }

    setDrawMode(false);
    setDrawingStart(null);
    setDrawingCurrent(null);
  };

  const saveManualField = () => {
    const fieldName = manualValues.field.trim();
    const fieldValue = manualValues.value.trim();

    if (!draftRect || !fieldName || !fieldValue) {
      showToast('Missing field details', 'Please provide both a field name and a value.');
      return;
    }

    if (fields.some((item) => item.field.toLowerCase() === fieldName.toLowerCase())) {
      showToast('Duplicate field', `A field named "${fieldName}" already exists.`);
      return;
    }

    const newField: ExtractedField = {
      id: `field-${Date.now()}`,
      field: fieldName,
      value: fieldValue,
      page: draftRect.page,
      bbox: draftRect.box,
      status: 'pending',
    };

    setFields((current) => [...current, newField]);
    setSelectedFieldId(newField.id);
    setDocumentState((current) => ({ ...current, pageNumber: newField.page }));
    setDraftRect(null);
    setManualValues({ field: '', value: '' });
    showToast('Field added', `${newField.field} was added to the review board.`);
  };

  const updatePageDimensions = (width: number, height: number) => {
    setDocumentState((current) =>
      current.sourceWidth === width && current.sourceHeight === height
        ? current
        : { ...current, sourceWidth: width, sourceHeight: height },
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1700px] px-4 py-6 sm:px-6 lg:px-8">
        <DashboardHeader
          documentName={documentState.fileName}
          reviewStatus={reviewStatus}
          reviewedCount={reviewedCount}
          fieldCount={fields.length}
          zoomLevel={zoomLevel}
          fileInputRef={fileInputRef}
          onFileChange={handleFileUpload}
          onZoomChange={applyZoom}
          onFit={handleFitToScreen}
          onResetZoom={() => setZoomLevel(1)}
        />

        <main className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-5">
            <DocumentViewer
              documentState={documentState}
              pdfModule={pdfModule}
              documentRef={documentRef}
              pageFields={pageFields}
              selectedFieldId={selectedFieldId}
              draftRect={draftRect}
              drawingStart={drawingStart}
              drawingCurrent={drawingCurrent}
              drawMode={drawMode}
              isLoadingDocument={isLoadingDocument}
              errorMessage={errorMessage}
              renderedWidth={renderedWidth}
              renderedHeight={renderedHeight}
              onPageChange={(pageNumber) =>
                setDocumentState((current) => ({ ...current, pageNumber }))
              }
              onToggleDraw={() => setDrawMode((current) => !current)}
              onPointerDown={beginDraw}
              onPointerMove={updateDraw}
              onPointerUp={finishDraw}
              onSelectField={setSelectedFieldId}
              onPageDimensions={updatePageDimensions}
              onPageCount={(pageCount) =>
                setDocumentState((current) => ({ ...current, pageCount }))
              }
              onDocumentLoaded={() => setIsLoadingDocument(false)}
              onDocumentError={setErrorMessage}
              onLoadSample={() => resetReviewState(initialFields, initialDocument)}
            />
            <ChangeLogPanel
              entries={changeLog}
              isOpen={showLog}
              onToggle={() => setShowLog((current) => !current)}
            />
          </div>

          <FieldSidebar
            fields={filteredFields}
            searchTerm={searchTerm}
            selectedFieldId={selectedFieldId}
            onSearch={setSearchTerm}
            onSelect={(field) => {
              setSelectedFieldId(field.id);
              setDocumentState((current) => ({ ...current, pageNumber: field.page }));
            }}
            onEdit={openEditor}
            onApprove={handleApprove}
          />
        </main>
      </div>

      <ReviewDialogs
        editorValue={editorState?.value ?? null}
        manualValues={manualValues}
        showManualDialog={draftRect !== null}
        toast={toast}
        onEditorChange={(value) =>
          setEditorState((current) => (current ? { ...current, value } : current))
        }
        onSaveEditor={saveEditor}
        onCloseEditor={() => setEditorState(null)}
        onManualValuesChange={setManualValues}
        onSaveManualField={saveManualField}
        onCloseManualDialog={() => setDraftRect(null)}
      />
    </div>
  );
}

export default App;
