export interface DailyReportData {
  id: string;
  date: string; // YYYY-MM-DD
  sheetName: string; // e.g. "2026-06-10"
  debitCreditEbt: number;
  lotteryPayout: number;
  cashMoPayout: number;
  grossSales: number;
  cashDrop: number;
  updatedAt?: number;
}

export interface SummaryStats {
  totalGrossSales: number;
  totalDebitCreditEbt: number;
  totalLotteryPayout: number;
  totalCashMoPayout: number;
  totalCredit: number;
  totalEstimatedDrop: number;
  totalCashDrop: number;
  totalOverShort: number;
}
