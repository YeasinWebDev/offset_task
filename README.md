# InvoiceLens

InvoiceLens is a React + TypeScript invoice review dashboard for validating extracted invoice data, editing values, approving fields, tracking changes, and manually drawing bounding boxes for new fields.

## Features

- Upload PDF, PNG, JPG, and JPEG invoice files
- Preview PDFs with page navigation and image previews
- Zoom in, zoom out, fit, and reset controls
- Highlight extracted field bounding boxes on the document
- Search, select, edit, and approve fields from the review sidebar
- Maintain a visible change log with timestamps and old/new values
- Add new fields by drawing a bounding box over the document
- Includes a sample invoice that matches the mock coordinates

## Local setup

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Then open the local Vite URL in the browser.

## Build

```bash
npm run build
```

## Notes

- The app uses mock extracted data for the review workflow.
- Manual field additions are stored in frontend state only.
- File upload validation handles unsupported formats and oversized files gracefully.
