import ExcelJS from 'exceljs';
import { DailyReportData } from '../types';

export async function loadWorkbookFromFile(file: File): Promise<DailyReportData[]> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);
  
  const reports: DailyReportData[] = [];
  
  workbook.eachSheet((sheet) => {
    // Skip summary or dashboard sheets
    if (
      sheet.name.toLowerCase().includes('summary') || 
      sheet.name.toLowerCase().includes('dashboard') ||
      sheet.name.toLowerCase() === 'sheet1'
    ) {
      return;
    }
    
    try {
      // Cell references:
      // B4: "Debit/Credit/EBT", C4: Value
      // B5: "Cash/Mo Payout", C5: Value
      // B6: "Lottery payout", C6: Value
      // D4: "Gross Sales", E4: Value
      // D7: "Cash Drop", E7: Value
      
      const b4 = sheet.getCell('B4').value;
      const d4 = sheet.getCell('D4').value;
      
      if (!b4 || !d4) return;
      
      const labelB4 = getCellValueText(b4);
      const labelD4 = getCellValueText(d4);
      
      if (
        labelB4.toLowerCase().includes('debit') || 
        labelD4.toLowerCase().includes('gross')
      ) {
        const getNum = (cellValue: any): number => {
          if (cellValue === null || cellValue === undefined) return 0;
          if (typeof cellValue === 'number') return cellValue;
          if (typeof cellValue === 'object') {
            if ('result' in cellValue) {
              return typeof cellValue.result === 'number' ? cellValue.result : 0;
            }
            if ('value' in cellValue) {
              return typeof cellValue.value === 'number' ? cellValue.value : 0;
            }
          }
          const parsed = parseFloat(cellValue.toString());
          return isNaN(parsed) ? 0 : parsed;
        };
        
        const debitCreditEbt = getNum(sheet.getCell('C4').value);
        const cashMoPayout = getNum(sheet.getCell('C5').value);
        const lotteryPayout = getNum(sheet.getCell('C6').value);
        const grossSales = getNum(sheet.getCell('E4').value);
        const cashDrop = getNum(sheet.getCell('E7').value);
        
        // Formulate date from sheet name
        let dateStr = '';
        const sheetName = sheet.name;
        
        // Look for YYYY-MM-DD
        const dateMatch = sheetName.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
        } else {
          // Fallback to sheet name or current date
          dateStr = parseHumanReadableDate(sheetName);
        }
        
        reports.push({
          id: Math.random().toString(36).substring(2, 11),
          date: dateStr,
          sheetName: sheetName,
          debitCreditEbt,
          cashMoPayout,
          lotteryPayout,
          grossSales,
          cashDrop,
        });
      }
    } catch (e) {
      console.error(`Error parsing worksheet "${sheet.name}":`, e);
    }
  });
  
  return reports;
}

function getCellValueText(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if ('richText' in value) {
      return value.richText.map((t: any) => t.text).join('');
    }
    if ('text' in value) {
      return value.text.toString();
    }
    if ('result' in value) {
      return value.result?.toString() || '';
    }
  }
  return value.toString();
}

function parseHumanReadableDate(name: string): string {
  const parsed = Date.parse(name);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

export function addDailyReportSheet(workbook: ExcelJS.Workbook, report: DailyReportData) {
  const sheet = workbook.addWorksheet(report.sheetName);
  
  // Enable grid lines visible
  sheet.views = [{ showGridLines: true }];
  
  // Set Column widths
  sheet.getColumn(1).width = 4;   // A: Spacing margin
  sheet.getColumn(2).width = 24;  // B: Label Col 1
  sheet.getColumn(3).width = 16;  // C: Value Col 1
  sheet.getColumn(4).width = 20;  // D: Label Col 2
  sheet.getColumn(5).width = 16;  // E: Value Col 2
  
  // Header spanning Column B to E on Row 3
  sheet.mergeCells('B3:E3');
  const headerCell = sheet.getCell('B3');
  headerCell.value = "Daily report";
  headerCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFF' } };
  headerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '305496' } // Navy blue
  };
  headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(3).height = 26;
  
  // Helper to style a Label cell
  const styleLabel = (cellRef: string, text: string) => {
    const cell = sheet.getCell(cellRef);
    cell.value = text;
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: '000000' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D9E1F2' } // Lavender Blue
    };
    cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    cell.border = {
      top: { style: 'thin', color: { argb: 'A6A6A6' } },
      left: { style: 'thin', color: { argb: 'A6A6A6' } },
      bottom: { style: 'thin', color: { argb: 'A6A6A6' } },
      right: { style: 'thin', color: { argb: 'A6A6A6' } }
    };
  };
  
  // Helper to style active values or formula outcomes
  const styleValue = (cellRef: string, val: any, isFormula: boolean = false) => {
    const cell = sheet.getCell(cellRef);
    if (isFormula) {
      cell.value = { formula: val };
    } else {
      cell.value = val;
    }
    cell.font = { name: 'Arial', size: 11, color: { argb: '000000' } };
    cell.numFmt = '$#,##0.00';
    cell.alignment = { horizontal: 'right', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF' }
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'A6A6A6' } },
      left: { style: 'thin', color: { argb: 'A6A6A6' } },
      bottom: { style: 'thin', color: { argb: 'A6A6A6' } },
      right: { style: 'thin', color: { argb: 'A6A6A6' } }
    };
  };
  
  // Configure row heights
  for (let i = 4; i <= 8; i++) {
    sheet.getRow(i).height = 20;
  }
  
  // Populate labels and values
  // Row 4
  styleLabel('B4', 'Debit/Credit/EBT');
  styleValue('C4', report.debitCreditEbt);
  styleLabel('D4', 'Gross Sales');
  styleValue('E4', report.grossSales);
  
  // Row 5
  styleLabel('B5', 'Cash/Mo Payout');
  styleValue('C5', report.cashMoPayout);
  styleLabel('D5', 'Total Credit');
  styleValue('E5', 'C8', true); // Cell links directly to Total Credit (C8)
  
  // Row 6
  styleLabel('B6', 'Lottery payout');
  styleValue('C6', report.lotteryPayout);
  styleLabel('D6', 'Estimated Drop');
  styleValue('E6', 'E4-E5', true); // Formula: Gross Sales - Total Credit
  
  // Row 7 (Empty left, cash drop right)
  styleLabel('B7', '');
  styleValue('C7', null);
  styleLabel('D7', 'Cash Drop');
  styleValue('E7', report.cashDrop);
  
  // Row 8 (Total Credit sum, Over/Short difference)
  styleLabel('B8', 'Total Credit');
  styleValue('C8', 'SUM(C4:C6)', true); // Formula sum of debit/credit/ebt + cash payout + lottery payout
  styleLabel('D8', 'Over/Short');
  styleValue('E8', 'E6-E7', true); // Formula: Estimated Drop - Cash Drop
}

export function addSummarySheet(workbook: ExcelJS.Workbook, reports: DailyReportData[]) {
  const sheet = workbook.addWorksheet('Summary Dashboard');
  sheet.views = [{ showGridLines: true }];
  
  // Configure column widths
  sheet.getColumn(1).width = 4;   // A
  sheet.getColumn(2).width = 16;  // B: Date / Sheet Name
  sheet.getColumn(3).width = 16;  // C: Gross Sales
  sheet.getColumn(4).width = 18;  // D: Debit/Credit/EBT
  sheet.getColumn(5).width = 16;  // E: Cash/Mo Payout
  sheet.getColumn(6).width = 16;  // F: Lottery Payout
  sheet.getColumn(7).width = 16;  // G: Total Credit
  sheet.getColumn(8).width = 18;  // H: Estimated Drop
  sheet.getColumn(9).width = 16;  // I: Cash Drop
  sheet.getColumn(10).width = 16; // J: Over/Short
  
  // Merged Title Header
  sheet.mergeCells('B2:J2');
  const titleCell = sheet.getCell('B2');
  titleCell.value = "Retail Daily Sales & Cash Drop Summary";
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1F4E79' } // Deep teal slate
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(2).height = 32;
  
  // Table Headers
  const headers = [
    { cell: 'B4', text: 'Date' },
    { cell: 'C4', text: 'Gross Sales' },
    { cell: 'D4', text: 'Debit/Credit/EBT' },
    { cell: 'E4', text: 'Cash/Mo Payout' },
    { cell: 'F4', text: 'Lottery Payout' },
    { cell: 'G4', text: 'Total Credit' },
    { cell: 'H4', text: 'Estimated Drop' },
    { cell: 'I4', text: 'Cash Drop' },
    { cell: 'J4', text: 'Over/Short' }
  ];
  
  headers.forEach(h => {
    const cell = sheet.getCell(h.cell);
    cell.value = h.text;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '000000' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D9E1F2' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: '000000' } },
      bottom: { style: 'medium', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: 'A6A6A6' } },
      right: { style: 'thin', color: { argb: 'A6A6A6' } }
    };
  });
  sheet.getRow(4).height = 24;
  
  let currentRow = 5;
  reports.forEach((report, index) => {
    const rowNum = currentRow + index;
    sheet.getRow(rowNum).height = 20;
    
    // Date
    const cellB = sheet.getCell(`B${rowNum}`);
    cellB.value = report.date;
    cellB.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Ensure sheet name is quoted safely for spaces or dashes in excel formulations
    const sheetRef = `'${report.sheetName}'`;
    
    const fields = [
      { col: 'C', formula: `${sheetRef}!E4` }, // Gross Sales
      { col: 'D', formula: `${sheetRef}!C4` }, // Debit/Credit/EBT
      { col: 'E', formula: `${sheetRef}!C5` }, // Cash/Mo Payout
      { col: 'F', formula: `${sheetRef}!C6` }, // Lottery Payout
      { col: 'G', formula: `${sheetRef}!E5` }, // Total Credit
      { col: 'H', formula: `${sheetRef}!E6` }, // Estimated Drop
      { col: 'I', formula: `${sheetRef}!E7` }, // Cash Drop
      { col: 'J', formula: `${sheetRef}!E8` }  // Over/Short
    ];
    
    fields.forEach(f => {
      const cell = sheet.getCell(`${f.col}${rowNum}`);
      cell.value = { formula: f.formula };
      cell.numFmt = '$#,##0.00';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    });
    
    // Borders for cells
    for (let c = 2; c <= 10; c++) {
      const cell = sheet.getRow(rowNum).getCell(c);
      cell.font = { name: 'Arial', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'D3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
        left: { style: 'thin', color: { argb: 'D3D3D3' } },
        right: { style: 'thin', color: { argb: 'D3D3D3' } }
      };
    }
  });
  
  // Total Accumulation row
  const totalRowNum = 5 + reports.length;
  sheet.getRow(totalRowNum).height = 24;
  
  const totalLabelCell = sheet.getCell(`B${totalRowNum}`);
  totalLabelCell.value = "Totals";
  totalLabelCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '000000' } };
  totalLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  const sumCols = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  sumCols.forEach(col => {
    const cell = sheet.getCell(`${col}${totalRowNum}`);
    cell.value = { formula: `SUM(${col}5:${col}${totalRowNum - 1})` };
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '000000' } };
    cell.numFmt = '$#,##0.00';
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F2F2F2' }
    };
    cell.alignment = { horizontal: 'right', vertical: 'middle' };
  });
  
  for (let c = 2; c <= 10; c++) {
    const cell = sheet.getRow(totalRowNum).getCell(c);
    cell.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'double', color: { argb: '000000' } }, // Classic ledger double bottom underline
      left: { style: 'thin', color: { argb: 'A6A6A6' } },
      right: { style: 'thin', color: { argb: 'A6A6A6' } }
    };
  }
}

export async function downloadWorkbook(reports: DailyReportData[]) {
  const workbook = new ExcelJS.Workbook();
  
  // Sort reports ascendingly by date
  const sortedReports = [...reports].sort((a, b) => a.date.localeCompare(b.date));
  
  if (sortedReports.length > 0) {
    addSummarySheet(workbook, sortedReports);
  }
  
  sortedReports.forEach(report => {
    addDailyReportSheet(workbook, report);
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `Retail_Daily_Reports_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
