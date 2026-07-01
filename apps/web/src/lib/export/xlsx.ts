// Dependency-light wrapper around SheetJS (xlsx) for client-side Excel exports.
//
// Framework-agnostic (no React). Intended for use from `'use client'` pages.
// Provides a typed column schema, a single-sheet downloader, and a multi-sheet
// workbook downloader. Numbers stay numeric so Excel treats them as numbers;
// ISO date strings are formatted to a readable `YYYY-MM-DD HH:mm`.

import * as XLSX from 'xlsx'

export type CellValue = string | number | null

export interface Column<T> {
  /** Property key on the row, or any string label when using `map`. */
  key: keyof T | string
  /** Header label shown in the first row of the sheet. */
  header: string
  /** Optional value extractor. Falls back to `row[key]` (with date auto-format). */
  map?: (row: T) => CellValue
}

export interface SheetSpec {
  name: string
  rows: any[]
  columns: Column<any>[]
}

// Matches ISO 8601 timestamps like 2026-06-30T12:34:56.789Z or 2026-06-30T12:34:56+05:30
const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/

/**
 * Format an ISO date string to `YYYY-MM-DD HH:mm`. Returns the input unchanged
 * if it is not a parseable ISO timestamp.
 */
export function formatDate(value: string): string {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) return value
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

function resolveCell<T>(row: T, column: Column<T>): CellValue {
  if (column.map) {
    const mapped = column.map(row)
    return mapped == null ? '' : mapped
  }
  const raw = (row as any)[column.key as string]
  if (raw == null) return ''
  if (typeof raw === 'string') return formatDate(raw)
  if (typeof raw === 'number') return raw
  if (typeof raw === 'boolean') return raw ? 'Yes' : 'No'
  return String(raw)
}

/**
 * Convert rows + columns into an array-of-arrays with a leading header row.
 */
export function rowsToAOA<T>(rows: T[], columns: Column<T>[]): CellValue[][] {
  const header = columns.map((c) => c.header)
  const body = (rows || []).map((row) => columns.map((col) => resolveCell(row, col)))
  return [header, ...body]
}

/** Compute reasonable column widths from header + content length. */
function computeColWidths(aoa: CellValue[][]): { wch: number }[] {
  if (aoa.length === 0) return []
  const colCount = aoa[0].length
  const widths: number[] = new Array(colCount).fill(10)
  for (const row of aoa) {
    for (let c = 0; c < colCount; c++) {
      const len = row[c] == null ? 0 : String(row[c]).length
      if (len > widths[c]) widths[c] = len
    }
  }
  // Cap to avoid absurdly wide columns; add a little padding.
  return widths.map((w) => ({ wch: Math.min(Math.max(w + 2, 10), 60) }))
}

function buildSheet(spec: SheetSpec): XLSX.WorkSheet {
  const aoa = rowsToAOA(spec.rows, spec.columns)
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = computeColWidths(aoa)
  return ws
}

function ensureXlsx(filename: string): string {
  return filename.toLowerCase().endsWith('.xlsx') ? filename : `${filename}.xlsx`
}

// Excel sheet names: max 31 chars, no : \ / ? * [ ]
function safeSheetName(name: string): string {
  return (name || 'Sheet')
    .replace(/[:\\/?*[\]]/g, ' ')
    .trim()
    .slice(0, 31) || 'Sheet'
}

/**
 * Build a single-sheet workbook from rows/columns and trigger a browser download.
 */
export function downloadSheet<T>(
  filename: string,
  sheetName: string,
  rows: T[],
  columns: Column<T>[]
): void {
  const wb = XLSX.utils.book_new()
  const ws = buildSheet({ name: sheetName, rows, columns })
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName(sheetName))
  XLSX.writeFile(wb, ensureXlsx(filename))
}

/**
 * Build a multi-sheet workbook and trigger a browser download. Sheet names are
 * de-duplicated to satisfy Excel's uniqueness constraint.
 */
export function downloadWorkbook(filename: string, sheets: SheetSpec[]): void {
  const wb = XLSX.utils.book_new()
  const used = new Set<string>()
  sheets.forEach((spec, idx) => {
    let name = safeSheetName(spec.name || `Sheet${idx + 1}`)
    let suffix = 1
    while (used.has(name.toLowerCase())) {
      name = safeSheetName(`${spec.name} ${++suffix}`)
    }
    used.add(name.toLowerCase())
    XLSX.utils.book_append_sheet(wb, buildSheet(spec), name)
  })
  XLSX.writeFile(wb, ensureXlsx(filename))
}
