# Daily Report Workbook Manager

A React + TypeScript web app that generates dynamic, styled Excel workbooks for retail daily reports — complete with automated cash-flow formulas, multi-sheet summaries, and live previews before export.

> Built with [Google AI Studio](https://ai.studio) and Gemini, then refined as a portfolio sample.

## Features

- **Data entry form** for daily retail figures with validation
- **Live Excel preview** — see the workbook before you download it
- **Automated formulas** for cash flow and daily totals (generated with [ExcelJS](https://github.com/exceljs/exceljs))
- **Multi-sheet summary dashboard** rolling up individual reports
- **Styled output** — formatted, color-coded `.xlsx` files ready to share
- Smooth UI animations via [Motion](https://motion.dev) and icons from [Lucide](https://lucide.dev)

## Tech Stack

| Area      | Tools |
|-----------|-------|
| Frontend  | React 19, TypeScript, Tailwind CSS v4 |
| Build     | Vite 6 |
| Excel     | ExcelJS |
| AI        | `@google/genai` (Gemini) |
| Server    | Express |

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and set your `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env.local
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The app runs at http://localhost:3000.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — type-check with `tsc --noEmit`

## Project Structure

```
src/
  App.tsx                          # main app / state
  components/
    ReportForm.tsx                 # daily report data entry
    ExcelPreview.tsx               # live workbook preview
    SummaryDashboardPreview.tsx    # multi-sheet summary
  utils/excel.ts                   # ExcelJS workbook generation
  types.ts
```
