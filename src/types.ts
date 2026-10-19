import { format } from 'date-fns';

export type PdfModule = typeof import('react-pdf');
export type BoundingBox = [number, number, number, number];
export type FieldStatus = 'pending' | 'approved' | 'edited';

export type ExtractedField = {
  id: string;
  field: string;
  value: string;
  page: number;
  bbox: BoundingBox;
  status: FieldStatus;
};

export type ChangeLogEntry = {
  id: string;
  fieldId: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
};

export type LoadedDocument = {
  fileName: string;
  url: string;
  kind: 'image' | 'pdf';
  pageCount: number;
  pageNumber: number;
  sourceWidth: number;
  sourceHeight: number;
  objectUrl?: boolean;
};

export type ToastMessage = {
  title: string;
  description: string;
};

export const normalizeBox = (bbox: BoundingBox): BoundingBox => {
  const [x1, y1, x2, y2] = bbox;
  return [
    Math.min(x1, x2),
    Math.min(y1, y2),
    Math.max(x1, x2),
    Math.max(y1, y2),
  ];
};

export const formatLocalTimestamp = (timestamp: string) =>
  format(new Date(timestamp), 'MMM d, yyyy h:mm a');

export const getStatusClasses = (status: FieldStatus) => {
  switch (status) {
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200';
    case 'edited':
      return 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200';
    default:
      return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200';
  }
};

export const getStatusLabel = (status: FieldStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);
