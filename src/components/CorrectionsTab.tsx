import React, { useState } from 'react';
import { DailyReportData } from '../types';
import { 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  FileText, 
  Save, 
  X, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface CorrectionsTabProps {
  reports: DailyReportData[];
  onUpdateReport: (updatedReport: DailyReportData) => void;
  onSelectTab: (sheetName: string) => void;
}

export default function CorrectionsTab({
  reports,
  onUpdateReport,
  onSelectTab
}: CorrectionsTabProps) {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    reports.length > 0 ? reports[0].id : null
  );
  
  // Local active report copy for edits
  const [editedReport, setEditedReport] = useState<DailyReportData | null>(null);
  
  // Filter settings
  const [filterType, setFilterType] = useState<'discrepancy' | 'all' | 'reconciled' | 'unreconciled'>('discrepancy');
  const [searchQuery, setSearchQuery] = useState('');
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  // Helper calculations for a report
  const getDiscrepancyStats = (r: DailyReportData) => {
    const totalCredit = r.debitCreditEbt + r.cashMoPayout + r.lotteryPayout;
    const estDrop = r.grossSales - totalCredit;
    const overShort = r.cashDrop - estDrop;
    return {
      totalCredit,
      estDrop,
      overShort
    };
  };

  // Process reports matching query & filter
  const processedReports = reports.filter(r => {
    const stats = getDiscrepancyStats(r);
    
    // Search query matching (date or notes)
    const matchesSearch = r.date.includes(searchQuery) || 
      (r.correctionNote && r.correctionNote.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    // Filter Type matching
    const hasDiscrepancy = Math.abs(stats.overShort) > 0.01;
    const isReconciled = r.isCorrected === true;

    if (filterType === 'discrepancy') {
      return hasDiscrepancy;
    } else if (filterType === 'reconciled') {
      return isReconciled;
    } else if (filterType === 'unreconciled') {
      return hasDiscrepancy && !isReconciled;
    }
    return true; // 'all'
  }).sort((a, b) => b.date.localeCompare(a.date)); // Chronological reverse (most recent first)

  // When selecting a report from the list
  const selectReportForCorrection = (report: DailyReportData) => {
    setSelectedReportId(report.id);
    setEditedReport({
      ...report,
      correctionNote: report.correctionNote || '',
      correctionAmount: report.correctionAmount !== undefined ? report.correctionAmount : 0,
      isCorrected: report.isCorrected || false
    });
  };

  // If reports are loaded but none is active, pick the first processed or first report overall
  React.useEffect(() => {
    if (reports.length > 0) {
      const activeExists = reports.some(r => r.id === selectedReportId);
      if (!activeExists || !selectedReportId) {
        const next = processedReports.length > 0 ? processedReports[0] : reports[0];
        selectReportForCorrection(next);
      } else if (!editedReport || editedReport.id !== selectedReportId) {
        const activeItem = reports.find(r => r.id === selectedReportId);
        if (activeItem) {
          selectReportForCorrection(activeItem);
        }
      }
    }
  }, [selectedReportId, reports]);

  // Handle number input changes with validation
  const handleNumberChange = (field: keyof DailyReportData, valStr: string) => {
    if (!editedReport) return;
    const val = parseFloat(valStr) || 0;
    setEditedReport({
      ...editedReport,
      [field]: val
    });
  };

  // Handle saving the correction back to store
  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedReport) return;
    
    const stats = getDiscrepancyStats(editedReport);
    const resolved = Math.abs(stats.overShort) === 0 || editedReport.isCorrected;

    const toSave: DailyReportData = {
      ...editedReport,
      isCorrected: resolved ? true : editedReport.isCorrected,
      updatedAt: Date.now()
    };

    onUpdateReport(toSave);
    
    // Visual indicator of save
    alert(`Correction saved successfully for ${editedReport.date}!`);
  };

  // Handle quick clearing/resetting correction
  const handleResetCorrection = () => {
    if (!editedReport) return;
    const original = reports.find(r => r.id === editedReport.id);
    if (original) {
      setEditedReport({
        ...original,
        correctionNote: '',
        correctionAmount: 0,
        isCorrected: false
      });
    }
  };

  const activeStats = editedReport ? getDiscrepancyStats(editedReport) : null;

  return (
    <div className="flex flex-col h-full bg-[#141b2d] text-slate-100 select-none">
      
      {/* Title bar and filters list */}
      <div className="bg-[#101625] border-b border-slate-800 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-xs shadow-sm font-mono leading-none">C</div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              Corrections & Reconciliations Safe-Audit
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Reconcile cash overages/shortages with explanation logging & formula override</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-transparent border-none text-slate-200 py-0 pr-6 text-xs focus:ring-0 cursor-pointer"
            >
              <option value="discrepancy" className="bg-[#141b2d]">Discrepant Sheets Only</option>
              <option value="unreconciled" className="bg-[#141b2d]">Unresolved Variances</option>
              <option value="reconciled" className="bg-[#141b2d]">Reconciled Sheets</option>
              <option value="all" className="bg-[#141b2d]">All Daily Sheets</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-2.5 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 w-28 md:w-36 transition"
          />
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500">
          <HelpCircle className="w-12 h-12 text-slate-700 mb-2 stroke-1 animate-pulse" />
          <p className="text-sm font-medium">No workbook sheets available</p>
          <p className="text-xs text-slate-550 mt-1">Please populate or import standard sheets first.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[290px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
          
          {/* LEFT COLUMN: List of matching reports */}
          <div className="flex flex-col min-w-0 bg-slate-950/30 overflow-y-auto h-full max-h-[300px] lg:max-h-none">
            <div className="p-3 bg-slate-950/50 border-b border-slate-850/80 sticky top-0 z-10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Select Sheet ({processedReports.length})
              </span>
              <span className="text-[9px] text-[#4f6b9c] font-mono font-medium">Descending Chrono</span>
            </div>

            {processedReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1.5">
                <CheckCircle className="w-6 h-6 text-emerald-500/40" />
                <span>All sheets investigated!</span>
                <p className="text-[9px] text-slate-500">No active discrepant transactions match selected filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-900/60">
                {processedReports.map((r) => {
                  const stats = getDiscrepancyStats(r);
                  const isSelected = r.id === selectedReportId;
                  const isZero = Math.abs(stats.overShort) < 0.01;
                  const isReconciled = r.isCorrected;

                  return (
                    <div
                      key={r.id}
                      onClick={() => selectReportForCorrection(r)}
                      className={`group p-3 transition-all cursor-pointer flex flex-col relative ${
                        isSelected 
                          ? 'bg-[#1e2a42] border-l-2 border-orange-500 text-slate-200' 
                          : 'hover:bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-200 flex-shrink-0">{r.date}</span>
                        <span className={`text-[10px] truncate max-w-[170px] font-medium ${
                          r.correctionNote ? 'text-slate-300' : 'text-orange-400 italic font-mono'
                        }`}>
                          {r.correctionNote || '...'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[10px]">
                        <div>
                          <span className="text-slate-500 font-mono">Short/Over: </span>
                          <span className={`font-mono font-bold ${
                            stats.overShort < 0 
                              ? 'text-red-400' 
                              : stats.overShort > 0 
                                ? 'text-emerald-400' 
                                : 'text-slate-400'
                          }`}>
                            {stats.overShort < 0 ? 'Short' : stats.overShort > 0 ? 'Over' : ''} {formatCurrency(Math.abs(stats.overShort))}
                          </span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {r.correctionNote && (
                        <p className="text-[9px] italic text-slate-400 mt-1.5 line-clamp-1 border-t border-slate-800/50 pt-1">
                          "{r.correctionNote}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Active report Correction Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            {editedReport ? (
              <form onSubmit={handleSaveCorrection} className="max-w-2xl space-y-6">
                
                {/* Audit Context Bar */}
                <div className="bg-slate-900/80 rounded border border-slate-800/80 p-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Auditing Workpaper Date</h4>
                    <span className="text-lg font-black text-slate-100 tracking-tight font-sans block mt-1">
                      {editedReport.date} Store Closeout Sheet
                    </span>
                    <button 
                      type="button"
                      onClick={() => onSelectTab(editedReport.sheetName)}
                      className="text-[10px] text-blue-400 hover:underline font-semibold mt-1 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" /> View original interactive spreadsheet template
                    </button>
                  </div>

                  {/* Variance Callout */}
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Variance Amount</span>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className={`text-2xl font-black font-mono leading-none ${
                        (activeStats?.overShort ?? 0) < 0 
                          ? 'text-red-400' 
                          : (activeStats?.overShort ?? 0) > 0 
                            ? 'text-emerald-400' 
                            : 'text-slate-300'
                      }`}>
                        {formatCurrency(activeStats?.overShort ?? 0)}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
                      (activeStats?.overShort ?? 0) < 0 
                        ? 'bg-red-955 text-red-410 border border-red-900/30' 
                        : (activeStats?.overShort ?? 0) > 0 
                          ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/20' 
                          : 'bg-slate-900 text-slate-500'
                    }`}>
                      {(activeStats?.overShort ?? 0) < 0 ? 'SHORT (Need Cash Correction)' : (activeStats?.overShort ?? 0) > 0 ? 'OVER (Cash Excess)' : 'PERFECTLY BALANCED'}
                    </span>
                  </div>
                </div>

                {/* Grid Inputs for original Ledger values modification */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-orange-400" />
                    Modify Worksheet Core Values for Reconciliation
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded border border-slate-800/60">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1 font-sans">
                        Gross Ticket/Register Sales
                      </label>
                      <div className="relative rounded bg-slate-900 border border-slate-800 shadow-inner">
                        <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs font-semibold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editedReport.grossSales}
                          onChange={(e) => handleNumberChange('grossSales', e.target.value)}
                          className="w-full bg-transparent pl-6 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1 font-sans">
                        Actual Physical Cash Drop
                      </label>
                      <div className="relative rounded bg-slate-900 border border-slate-800 shadow-inner">
                        <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs font-semibold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editedReport.cashDrop}
                          onChange={(e) => handleNumberChange('cashDrop', e.target.value)}
                          className="w-full bg-transparent pl-6 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1 font-sans">
                        Debit / Credit / EBT POS Sum
                      </label>
                      <div className="relative rounded bg-slate-900 border border-slate-800 shadow-inner">
                        <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs font-semibold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editedReport.debitCreditEbt}
                          onChange={(e) => handleNumberChange('debitCreditEbt', e.target.value)}
                          className="w-full bg-transparent pl-6 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1 font-sans">
                        Cash Payouts / Safe Payouts
                      </label>
                      <div className="relative rounded bg-slate-900 border border-slate-800 shadow-inner">
                        <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs font-semibold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editedReport.cashMoPayout}
                          onChange={(e) => handleNumberChange('cashMoPayout', e.target.value)}
                          className="w-full bg-transparent pl-6 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1 font-sans">
                        Lottery Direct Payouts
                      </label>
                      <div className="relative rounded bg-slate-900 border border-slate-800 shadow-inner">
                        <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs font-semibold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editedReport.lotteryPayout}
                          onChange={(e) => handleNumberChange('lotteryPayout', e.target.value)}
                          className="w-full bg-transparent pl-6 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1 font-sans">
                        Reconciled / Corrected Checkbox
                      </label>
                      <div className="flex items-center h-10 px-1 select-none">
                        <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={editedReport.isCorrected || false}
                            onChange={(e) => setEditedReport({
                              ...editedReport,
                              isCorrected: e.target.checked
                            })}
                            className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                          />
                          <span className="text-xs font-bold font-sans">Mark as Reconciled</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Explanation Logs and correction Notes */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-orange-400" />
                    Correction Explanation & Safe-Discrepancy Log
                  </h4>
                  
                  <div className="space-y-4 bg-slate-950/40 p-4 rounded border border-slate-800/60">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1.5">
                        Correction Explanation / Audit Trial Note
                      </label>
                      <textarea
                        rows={3}
                        value={editedReport.correctionNote || ''}
                        onChange={(e) => setEditedReport({
                          ...editedReport,
                          correctionNote: e.target.value
                        })}
                        placeholder="Write why there was an over or short here (e.g. 'Register 2 counted incorrectly, safe was audited and the other $10 cash was located', 'Found an offline visa ticket not registered on POS for $45.50')..."
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-sans leading-relaxed resize-none"
                      />
                    </div>

                    {/* Quick suggestion tags for store owners */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase mr-1 select-none">Suggestions:</span>
                      {[
                        'Safe was audited & cash found',
                        'Forgot lottery ticket payout log',
                        'POS double charge corrected',
                        'Discrepancy off by $10 till count',
                        'Credit slip was scanned as cash drop'
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setEditedReport({
                            ...editedReport,
                            correctionNote: tag
                          })}
                          className="px-2 py-0.5 rounded-full text-[9px] bg-slate-900 hover:bg-[#1a233a] border border-slate-800 text-slate-400 hover:text-emerald-400 transition"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-5">
                  <button
                    type="button"
                    onClick={handleResetCorrection}
                    className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800/80 text-xs font-semibold text-slate-400 transition"
                  >
                    Reset Changes
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-md flex items-center gap-2 transition"
                    >
                      <Save className="w-4 h-4" />
                      Save Logged Correction
                    </button>
                  </div>
                </div>

                {/* Safe audit details info */}
                <div className="bg-[#101c25] border border-[#162a37] rounded p-4 text-xs text-slate-400 leading-relaxed font-sans mt-4 flex gap-3">
                  <Clock className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200 block mb-1">Reconciliation standard operating procedure</span>
                    When a daily report sheet produces a high shortage, you can modify the core values inside this controller or record reasons for safe auditing. When a sheet is edited here, the corrections instantly recalculate the total workbook sums.
                  </div>
                </div>

              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-slate-600">
                <Wrench className="w-12 h-12 text-slate-700 mb-2 stroke-1 animate-spin" />
                <p className="text-sm font-medium">Select a daily sheet and audit here</p>
                <p className="text-xs text-slate-550">Use the left menu to select a sheet with discrepancy.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
