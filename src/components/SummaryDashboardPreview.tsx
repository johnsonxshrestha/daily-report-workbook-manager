import React, { useState } from 'react';
import { DailyReportData } from '../types';
import { Sparkles, TrendingDown, TrendingUp, DollarSign, Calculator, Coins } from 'lucide-react';

interface SummaryDashboardPreviewProps {
  reports: DailyReportData[];
  onSelectTab: (sheetName: string) => void;
}

export default function SummaryDashboardPreview({
  reports,
  onSelectTab
}: SummaryDashboardPreviewProps) {
  const [selectedCell, setSelectedCell] = useState<{ id: string; formula: string; valStr: string }>({
    id: 'C5',
    formula: "='2026-06-10'!E4",
    valStr: '$0.00'
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  // Sort reports chronologically for rendering
  const sortedReports = [...reports].sort((a, b) => a.date.localeCompare(b.date));

  // Compute total sums across all sheets for visual validation
  const totals = sortedReports.reduce((acc, r) => {
    const totalCredit = r.debitCreditEbt + r.cashMoPayout + r.lotteryPayout;
    const estDrop = r.grossSales - totalCredit;
    const overShort = r.cashDrop - estDrop;

    return {
      grossSales: acc.grossSales + r.grossSales,
      debitCreditEbt: acc.debitCreditEbt + r.debitCreditEbt,
      cashMoPayout: acc.cashMoPayout + r.cashMoPayout,
      lotteryPayout: acc.lotteryPayout + r.lotteryPayout,
      totalCredit: acc.totalCredit + totalCredit,
      estimatedDrop: acc.estimatedDrop + estDrop,
      cashDrop: acc.cashDrop + r.cashDrop,
      overShort: acc.overShort + overShort
    };
  }, {
    grossSales: 0,
    debitCreditEbt: 0,
    cashMoPayout: 0,
    lotteryPayout: 0,
    totalCredit: 0,
    estimatedDrop: 0,
    cashDrop: 0,
    overShort: 0
  });

  const handleCellClick = (cellRef: string, formula: string, value: any) => {
    setSelectedCell({
      id: cellRef,
      formula,
      valStr: typeof value === 'number' ? formatCurrency(value) : value.toString()
    });
  };

  return (
    <div className="bg-[#141b2d] rounded border border-slate-800 overflow-hidden flex flex-col h-full shadow-xs">
      {/* Excel Title Bar */}
      <div className="bg-[#101625] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between flex-shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-emerald-600 rounded flex items-center justify-center text-[9px] font-black text-white shadow-sm font-mono">S</div>
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide font-sans">
            Consolidated Summary Model
            <span className="text-[10px] font-normal text-slate-400 font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded normal-case">
              Tab: Summary Dashboard
            </span>
          </h3>
        </div>
        <div className="bg-[#0f2d20] text-emerald-350 border border-emerald-900/40 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>3D Cell Array Rules</span>
        </div>
      </div>

      {/* Excel Formula Bar */}
      <div className="bg-[#101625] border-b border-slate-800 px-3 py-1.5 flex items-center gap-2 font-mono text-[11px] flex-shrink-0 select-none">
        {/* Cell Box */}
        <div className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-350 font-black text-center min-w-[45px] shadow-xs">
          {selectedCell.id}
        </div>
        {/* Formula Icon */}
        <div className="text-slate-500 font-bold select-none px-1 italic text-xs leading-none">
          fx
        </div>
        {/* Input Formula */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-0.5 text-slate-300 flex items-center shadow-xs select-all min-h-[22px]">
          <span className="text-emerald-400 font-bold text-xs">{selectedCell.formula}</span>
        </div>
      </div>

      {/* Spreadsheet Workspace Wrapper */}
      <div className="flex-1 overflow-auto bg-slate-950 p-4 md:p-6 min-h-[350px]">
        {reports.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
            <Calculator className="w-12 h-12 text-slate-700 mb-2 stroke-1" />
            <p className="text-sm font-medium">Add daily reports to view the Summary Dashboard</p>
            <p className="text-xs text-slate-550 mt-1 max-w-sm text-center">
              Each daily report you log is placed onto its own sheet tab, and this Summary compiles all sheets dynamically.
            </p>
          </div>
        ) : (
          <div className="shadow-lg rounded border border-slate-850 bg-[#141b2d] min-w-[900px]">
            {/* Column alphabetic coordinates */}
            <div className="grid grid-cols-[40px_110px_100px_100px_100px_100px_100px_110px_100px_105px] bg-slate-900 border-b border-slate-800 text-center text-slate-450 font-semibold text-[10px] font-mono select-none">
              <div className="py-1 border-r border-slate-850 bg-slate-950"></div>
              <div className="py-1 border-r border-slate-800">B</div>
              <div className="py-1 border-r border-slate-800">C</div>
              <div className="py-1 border-r border-slate-800">D</div>
              <div className="py-1 border-r border-slate-800">E</div>
              <div className="py-1 border-r border-slate-800">F</div>
              <div className="py-1 border-r border-slate-800">G</div>
              <div className="py-1 border-r border-slate-800">H</div>
              <div className="py-1 border-r border-slate-800">I</div>
              <div className="py-1">J</div>
            </div>

            {/* Row 1 Padding */}
            <div className="grid grid-cols-[40px_1fr] border-b border-slate-800 text-[10px] font-mono select-none">
              <div className="bg-slate-900 text-slate-500 flex items-center justify-center border-r border-slate-800 py-0.5">1</div>
              <div className="bg-[#141b2d] py-0.5 h-4"></div>
            </div>

            {/* Row 2: Merged Page Title Card */}
            <div className="grid grid-cols-[40px_1fr] border-b border-slate-850">
              <div className="bg-slate-900 text-slate-500 border-r border-slate-800 flex items-center justify-center text-[10px] font-mono select-none">2</div>
              <div className="bg-emerald-800 text-white font-bold py-2 text-center text-xs tracking-wider uppercase">
                Retail Daily Sales & Cash Drop Summary
              </div>
            </div>

            {/* Row 3 Padding */}
            <div className="grid grid-cols-[40px_1fr] border-b border-slate-800 text-[10px] font-mono select-none">
              <div className="bg-slate-900 text-slate-500 flex items-center justify-center border-r border-slate-800 py-0.5 font-mono">3</div>
              <div className="bg-[#141b2d] py-0.5 h-4"></div>
            </div>

            {/* Row 4: Merged Header labels */}
            <div className="grid grid-cols-[40px_110px_100px_100px_100px_100px_100px_110px_100px_105px] border-b border-slate-800 bg-slate-800 text-slate-100 text-[10px] font-black uppercase text-center select-none font-sans">
              <div className="bg-slate-900 text-slate-500 border-r border-slate-800 py-1.5 flex items-center justify-center text-[10px] font-mono">4</div>
              <div className="border-r border-slate-700 py-1.5 flex items-center justify-center">Date</div>
              <div className="border-r border-slate-700 py-1.5 flex items-center justify-center">Gross Sales</div>
              <div className="border-r border-slate-700 py-1.5 flex items-center justify-center">Debit/Credit/EBT</div>
              <div className="border-r border-slate-700 py-1.5 flex items-center justify-center">Cash/Mo Payout</div>
              <div className="border-r border-slate-700 py-1.5 flex items-center justify-center">Lottery Payout</div>
              <div className="border-r border-slate-700 py-1.5 flex items-center justify-center">Total Credit</div>
              <div className="border-r border-slate-700 py-1.5 flex items-center justify-center">Estimated Drop</div>
              <div className="border-r border-slate-700 py-1.5 flex items-center justify-center">Cash Drop</div>
              <div className="py-1.5 flex items-center justify-center">Over/Short</div>
            </div>

            {/* Row 5 and following: Reports lines mapped with cell numbers */}
            {sortedReports.map((report, idx) => {
              const rowNum = 5 + idx;
              const sheetRef = `'${report.sheetName}'`;
              const repTotalCredit = report.debitCreditEbt + report.cashMoPayout + report.lotteryPayout;
              const repEstimatedDrop = report.grossSales - repTotalCredit;
              const repOverShort = report.cashDrop - repEstimatedDrop;

              const isSelB = selectedCell.id === `B${rowNum}`;
              const isSelC = selectedCell.id === `C${rowNum}`;
              const isSelD = selectedCell.id === `D${rowNum}`;
              const isSelE = selectedCell.id === `E${rowNum}`;
              const isSelF = selectedCell.id === `F${rowNum}`;
              const isSelG = selectedCell.id === `G${rowNum}`;
              const isSelH = selectedCell.id === `H${rowNum}`;
              const isSelI = selectedCell.id === `I${rowNum}`;
              const isSelJ = selectedCell.id === `J${rowNum}`;

              return (
                <div 
                  key={report.id}
                  className="grid grid-cols-[40px_110px_100px_100px_100px_100px_100px_110px_100px_105px] border-b border-slate-800 text-xs font-mono select-none"
                >
                  {/* Row marker index */}
                  <div className="bg-slate-900 text-slate-500 flex items-center justify-center border-r border-slate-800 py-1 text-[10px]">
                    {rowNum}
                  </div>

                  {/* Date tab link */}
                  <div 
                    onClick={() => {
                      handleCellClick(`B${rowNum}`, `Sheet Name Reference: ${report.sheetName}`, report.date);
                      onSelectTab(report.sheetName);
                    }}
                    className={`border-r border-slate-800 py-1 text-center font-bold text-blue-400 hover:bg-slate-800/60 cursor-pointer flex items-center justify-center transition-colors ${isSelB ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/10' : ''}`}
                    title={`Click to jump to Daily Sheet tab "${report.sheetName}"`}
                  >
                    {report.date}
                  </div>

                  {/* Gross Sales Row Field (E4 on daily sheet) */}
                  <div 
                    onClick={() => handleCellClick(`C${rowNum}`, `=${sheetRef}!E4`, report.grossSales)}
                    className={`border-r border-slate-800 py-1 text-right pr-2.5 flex items-center justify-end cursor-pointer hover:bg-slate-800/40 transition-colors text-slate-200 ${isSelC ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/10 font-bold' : ''}`}
                  >
                    {formatCurrency(report.grossSales)}
                  </div>

                  {/* Debit/Credit/EBT (C4 on daily sheet) */}
                  <div 
                    onClick={() => handleCellClick(`D${rowNum}`, `=${sheetRef}!C4`, report.debitCreditEbt)}
                    className={`border-r border-slate-800 py-1 text-right pr-2.5 flex items-center justify-end cursor-pointer hover:bg-slate-800/40 transition-colors text-slate-200 ${isSelD ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/10 font-bold' : ''}`}
                  >
                    {formatCurrency(report.debitCreditEbt)}
                  </div>

                  {/* Cash/Mo Payout (C5 on daily) */}
                  <div 
                    onClick={() => handleCellClick(`E${rowNum}`, `=${sheetRef}!C5`, report.cashMoPayout)}
                    className={`border-r border-slate-800 py-1 text-right pr-2.5 flex items-center justify-end cursor-pointer hover:bg-slate-800/40 transition-colors text-slate-200 ${isSelE ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/10 font-bold' : ''}`}
                  >
                    {formatCurrency(report.cashMoPayout)}
                  </div>

                  {/* Lottery payout (C6 on daily) */}
                  <div 
                    onClick={() => handleCellClick(`F${rowNum}`, `=${sheetRef}!C6`, report.lotteryPayout)}
                    className={`border-r border-slate-800 py-1 text-right pr-2.5 flex items-center justify-end cursor-pointer hover:bg-slate-800/40 transition-colors text-slate-200 ${isSelF ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/10 font-bold' : ''}`}
                  >
                    {formatCurrency(report.lotteryPayout)}
                  </div>

                  {/* Total Credit Row (E5 on daily sheet linked to C8) */}
                  <div 
                    onClick={() => handleCellClick(`G${rowNum}`, `=${sheetRef}!E5`, repTotalCredit)}
                    className={`border-r border-slate-800 py-1 text-right pr-2.5 text-blue-400 font-semibold flex items-center justify-end cursor-pointer hover:bg-slate-800/40 transition-colors ${isSelG ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/10 font-bold' : ''}`}
                  >
                    {formatCurrency(repTotalCredit)}
                  </div>

                  {/* Estimated Drop (E6 on daily) */}
                  <div 
                    onClick={() => handleCellClick(`H${rowNum}`, `=${sheetRef}!E6`, repEstimatedDrop)}
                    className={`border-r border-slate-800 py-1 text-right pr-2.5 text-slate-200 flex items-center justify-end cursor-pointer hover:bg-slate-800/40 transition-colors ${isSelH ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/10 font-bold' : ''}`}
                  >
                    {formatCurrency(repEstimatedDrop)}
                  </div>

                  {/* Cash Drop (E7 on daily) */}
                  <div 
                    onClick={() => handleCellClick(`I${rowNum}`, `=${sheetRef}!E7`, report.cashDrop)}
                    className={`border-r border-slate-800 py-1 text-right pr-2.5 flex items-center justify-end cursor-pointer hover:bg-slate-800/40 transition-colors text-slate-200 ${isSelI ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/10 shadow-inner' : ''}`}
                  >
                    {formatCurrency(report.cashDrop)}
                  </div>

                  {/* Over/Short (E8 on daily) */}
                  <div 
                    onClick={() => handleCellClick(`J${rowNum}`, `=${sheetRef}!E8`, repOverShort)}
                    className={`py-1 text-right pr-2.5 flex items-center justify-end font-semibold cursor-pointer hover:bg-slate-800/40 transition-colors ${isSelJ ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/10 font-bold' : ''} ${repOverShort < 0 ? 'text-red-400 bg-red-950/20' : repOverShort > 0 ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-300'}`}
                  >
                    {formatCurrency(repOverShort)}
                  </div>
                </div>
              );
            })}

            {/* Totals summation row at the bottom */}
            {(() => {
              const totalRowIdx = 5 + sortedReports.length;
              const colSumFormula = (col: string) => `=SUM(${col}5:${col}${totalRowIdx - 1})`;
              
              const isSelTotalsLabel = selectedCell.id === `B${totalRowIdx}`;
              const isSelC = selectedCell.id === `C${totalRowIdx}`;
              const isSelD = selectedCell.id === `D${totalRowIdx}`;
              const isSelE = selectedCell.id === `E${totalRowIdx}`;
              const isSelF = selectedCell.id === `F${totalRowIdx}`;
              const isSelG = selectedCell.id === `G${totalRowIdx}`;
              const isSelH = selectedCell.id === `H${totalRowIdx}`;
              const isSelI = selectedCell.id === `I${totalRowIdx}`;
              const isSelJ = selectedCell.id === `J${totalRowIdx}`;

              return (
                <div className="grid grid-cols-[40px_110px_100px_100px_100px_100px_100px_110px_100px_105px] border-b border-double border-b-4 border-slate-700 bg-slate-900 text-xs font-mono font-bold select-none">
                  {/* Row marker index */}
                  <div className="bg-slate-950 text-slate-500 flex items-center justify-center border-r border-slate-800 py-2 text-[10px]">
                    {totalRowIdx}
                  </div>

                  {/* Totals Label */}
                  <div 
                    onClick={() => handleCellClick(`B${totalRowIdx}`, 'Label cell', 'Totals')}
                    className={`border-r border-slate-800 py-2 text-center text-slate-100 select-none cursor-pointer flex items-center justify-center hover:bg-slate-800/40 transition-colors ${isSelTotalsLabel ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/20' : ''}`}
                  >
                    Totals
                  </div>

                  {/* Sums columns */}
                  <div 
                    onClick={() => handleCellClick(`C${totalRowIdx}`, colSumFormula('C'), totals.grossSales)}
                    className={`border-r border-slate-800 py-2 text-right pr-2.5 bg-slate-950/20 font-bold flex items-center justify-end cursor-pointer hover:bg-slate-800/40 text-slate-100 ${isSelC ? 'ring-2 ring-emerald-500/80 ring-inset bg-emerald-500/10' : ''}`}
                  >
                    {formatCurrency(totals.grossSales)}
                  </div>

                  <div 
                    onClick={() => handleCellClick(`D${totalRowIdx}`, colSumFormula('D'), totals.debitCreditEbt)}
                    className={`border-r border-slate-800 py-2 text-right pr-2.5 bg-slate-950/20 font-bold flex items-center justify-end cursor-pointer hover:bg-slate-800/40 text-slate-100 ${isSelD ? 'ring-2 ring-emerald-500/80 ring-inset bg-emerald-500/10' : ''}`}
                  >
                    {formatCurrency(totals.debitCreditEbt)}
                  </div>

                  <div 
                    onClick={() => handleCellClick(`E${totalRowIdx}`, colSumFormula('E'), totals.cashMoPayout)}
                    className={`border-r border-slate-800 py-2 text-right pr-2.5 bg-slate-950/20 font-bold flex items-center justify-end cursor-pointer hover:bg-slate-800/40 text-slate-100 ${isSelE ? 'ring-2 ring-emerald-500/80 ring-inset bg-emerald-500/10' : ''}`}
                  >
                    {formatCurrency(totals.cashMoPayout)}
                  </div>

                  <div 
                    onClick={() => handleCellClick(`F${totalRowIdx}`, colSumFormula('F'), totals.lotteryPayout)}
                    className={`border-r border-slate-800 py-2 text-right pr-2.5 bg-slate-950/20 font-bold flex items-center justify-end cursor-pointer hover:bg-slate-800/40 text-slate-100 ${isSelF ? 'ring-2 ring-emerald-500/80 ring-inset bg-emerald-500/10' : ''}`}
                  >
                    {formatCurrency(totals.lotteryPayout)}
                  </div>

                  <div 
                    onClick={() => handleCellClick(`G${totalRowIdx}`, colSumFormula('G'), totals.totalCredit)}
                    className={`border-r border-slate-800 py-2 text-right pr-2.5 bg-slate-950/20 text-blue-400 font-bold flex items-center justify-end cursor-pointer hover:bg-slate-800/40 ${isSelG ? 'ring-2 ring-emerald-500/80 ring-inset bg-emerald-500/10' : ''}`}
                  >
                    {formatCurrency(totals.totalCredit)}
                  </div>

                  <div 
                    onClick={() => handleCellClick(`H${totalRowIdx}`, colSumFormula('H'), totals.estimatedDrop)}
                    className={`border-r border-slate-800 py-2 text-right pr-2.5 bg-slate-950/20 text-slate-100 font-bold flex items-center justify-end cursor-pointer hover:bg-slate-800/40 ${isSelH ? 'ring-2 ring-emerald-500/80 ring-inset bg-emerald-500/10' : ''}`}
                  >
                    {formatCurrency(totals.estimatedDrop)}
                  </div>

                  <div 
                    onClick={() => handleCellClick(`I${totalRowIdx}`, colSumFormula('I'), totals.cashDrop)}
                    className={`border-r border-slate-800 py-2 text-right pr-2.5 bg-slate-950/20 font-bold flex items-center justify-end cursor-pointer hover:bg-slate-800/40 text-slate-100 ${isSelI ? 'ring-2 ring-emerald-500/80 ring-inset bg-emerald-500/10' : ''}`}
                  >
                    {formatCurrency(totals.cashDrop)}
                  </div>

                  <div 
                    onClick={() => handleCellClick(`J${totalRowIdx}`, colSumFormula('J'), totals.overShort)}
                    className={`py-2 text-right pr-2.5 bg-slate-950/20 font-bold flex items-center justify-end cursor-pointer hover:bg-slate-800/40 ${isSelJ ? 'ring-2 ring-emerald-500/80 ring-inset bg-emerald-500/10' : ''} ${totals.overShort < 0 ? 'text-red-400' : totals.overShort > 0 ? 'text-emerald-400' : 'text-slate-300'}`}
                  >
                    {formatCurrency(totals.overShort)}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Summary KPI Panel footer */}
      {reports.length > 0 && (
        <div className="bg-[#101625] border-t border-slate-800 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 flex-shrink-0">
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-3 shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-950/50 text-blue-400 border border-blue-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Monthly Total Gross</div>
              <div className="text-sm font-bold text-slate-200">{formatCurrency(totals.grossSales)}</div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg border border-slate-800 p-3 shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-950/50 text-indigo-400 border border-indigo-900/30 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Monthly Total Cash Drop</div>
              <div className="text-sm font-bold text-slate-200">{formatCurrency(totals.cashDrop)}</div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg border border-slate-800 p-3 shadow-xs flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${totals.overShort < 0 ? 'bg-red-950/50 text-red-400 border border-red-900/30' : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30'}`}>
              {totals.overShort < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Over/Short (No-Reset)</div>
              <div className={`text-sm font-bold ${totals.overShort < 0 ? 'text-red-400' : 'text-emerald-400'} flex items-center gap-1.5 flex-wrap`}>
                <span>{formatCurrency(totals.overShort)}</span>
                <span className="text-[10px] font-bold bg-slate-950/70 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  {(totals.overShort >= 0 ? '+' : '') + (totals.grossSales !== 0 ? (totals.overShort / totals.grossSales) * 100 : 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
