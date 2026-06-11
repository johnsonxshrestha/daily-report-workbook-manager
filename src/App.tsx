import React, { useState, useEffect, useRef } from 'react';
import { DailyReportData } from './types';
import ReportForm from './components/ReportForm';
import ExcelPreview from './components/ExcelPreview';
import SummaryDashboardPreview from './components/SummaryDashboardPreview';
import CorrectionsTab from './components/CorrectionsTab';
import { 
  downloadWorkbook, 
  loadWorkbookFromFile 
} from './utils/excel';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Trash2, 
  Database, 
  Info, 
  Calendar, 
  FileCode, 
  Settings, 
  RefreshCw, 
  AlertCircle,
  FilePlus,
  ArrowRight,
  TrendingUp,
  Plus,
  Wrench
} from 'lucide-react';

const SAMPLE_REPORTS: DailyReportData[] = [
  {
    id: 'sample-1',
    date: '2026-06-07',
    sheetName: '2026-06-07',
    debitCreditEbt: 2450.75,
    cashMoPayout: 120.00,
    lotteryPayout: 450.00,
    grossSales: 4500.00,
    cashDrop: 1475.00,
    updatedAt: 1
  },
  {
    id: 'sample-2',
    date: '2026-06-08',
    sheetName: '2026-06-08',
    debitCreditEbt: 2890.50,
    cashMoPayout: 85.50,
    lotteryPayout: 320.00,
    grossSales: 5200.00,
    cashDrop: 1910.00,
    updatedAt: 2
  },
  {
    id: 'sample-3',
    date: '2026-06-09',
    sheetName: '2026-06-09',
    debitCreditEbt: 2110.20,
    cashMoPayout: 150.00,
    lotteryPayout: 580.00,
    grossSales: 3950.00,
    cashDrop: 1100.00,
    updatedAt: 3
  },
  {
    id: 'sample-4',
    date: '2026-06-10',
    sheetName: '2026-06-10',
    debitCreditEbt: 3120.00,
    cashMoPayout: 110.00,
    lotteryPayout: 250.00,
    grossSales: 5800.00,
    cashDrop: 2325.00,
    updatedAt: 4
  }
];

export default function App() {
  const [reports, setReports] = useState<DailyReportData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('Summary Dashboard');
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  
  // Track state of current form input as a live draft for instant spreadsheet preview updates
  const [liveFormDraft, setLiveFormDraft] = useState({
    date: new Date().toISOString().split('T')[0],
    debitCreditEbt: 0,
    cashMoPayout: 0,
    lotteryPayout: 0,
    grossSales: 0,
    cashDrop: 0
  });

  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize reports list from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('store_reports_workbook');
      if (stored) {
        const parsed = JSON.parse(stored) as DailyReportData[];
        setReports(parsed);
        if (parsed.length > 0) {
          setActiveTab('Summary Dashboard');
        } else {
          setActiveTab('Unsaved Draft');
        }
      } else {
        // Safe standard initialization: set active to Draft
        setActiveTab('Unsaved Draft');
      }
    } catch (e) {
      console.error('Error reading index storage:', e);
      setActiveTab('Unsaved Draft');
    }
  }, []);

  // Save to LocalStorage on changes
  const saveReportsToStorage = (newReports: DailyReportData[]) => {
    localStorage.setItem('store_reports_workbook', JSON.stringify(newReports));
    setReports(newReports);
  };

  // Handle Form input edits
  const handleFormDraftChange = React.useCallback((data: typeof liveFormDraft) => {
    setLiveFormDraft(prev => {
      if (
        prev.date === data.date &&
        prev.debitCreditEbt === data.debitCreditEbt &&
        prev.cashMoPayout === data.cashMoPayout &&
        prev.lotteryPayout === data.lotteryPayout &&
        prev.grossSales === data.grossSales &&
        prev.cashDrop === data.cashDrop
      ) {
        return prev;
      }
      return data;
    });
  }, []);

  // Handle adding a new daily sheet or saving edited card
  const handleSaveReport = (data: Omit<DailyReportData, 'id' | 'sheetName'>) => {
    const sheetName = data.date; // Use the raw date as sheet tab name (clean sorting format)

    if (editingReportId) {
      // Edit existing sheet
      const updated = reports.map(r => {
        if (r.id === editingReportId) {
          return {
            ...r,
            ...data,
            sheetName,
            updatedAt: Date.now()
          };
        }
        return r;
      });
      saveReportsToStorage(updated);
      setEditingReportId(null);
      setActiveTab(sheetName);
    } else {
      // Add fresh sheet
      const newReport: DailyReportData = {
        id: Math.random().toString(36).substring(2, 11),
        ...data,
        sheetName,
        updatedAt: Date.now()
      };
      
      const newReportsList = [...reports, newReport];
      saveReportsToStorage(newReportsList);
      setActiveTab('Summary Dashboard');
    }
  };

  // Import active report properties into form inputs for editing
  const handleStartEdit = (report: DailyReportData) => {
    setEditingReportId(report.id);
    setLiveFormDraft({
      date: report.date,
      debitCreditEbt: report.debitCreditEbt,
      cashMoPayout: report.cashMoPayout,
      lotteryPayout: report.lotteryPayout,
      grossSales: report.grossSales,
      cashDrop: report.cashDrop
    });
    // Jump to the Unsaved Draft screen, which serves as the editing workspace
    setActiveTab('Unsaved Draft');
  };

  // Remove sheet run from active workbook
  const handleDeleteReport = (id: string, sheetName: string) => {
    const updated = reports.filter(r => r.id !== id);
    saveReportsToStorage(updated);
    setSelectedReportIds(prev => prev.filter(selectedId => selectedId !== id));
    
    if (activeTab === sheetName) {
      if (updated.length > 0) {
        setActiveTab('Summary Dashboard');
      } else {
        setActiveTab('Unsaved Draft');
      }
    }
  };

  // Update specific report values and save
  const handleUpdateReport = (updatedReport: DailyReportData) => {
    const updated = reports.map(r => r.id === updatedReport.id ? updatedReport : r);
    saveReportsToStorage(updated);
  };

  // Bulk delete selected reports
  const handleDeleteMultipleReports = () => {
    if (selectedReportIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete the ${selectedReportIds.length} selected daily sheets?`)) {
      const updated = reports.filter(r => !selectedReportIds.includes(r.id));
      saveReportsToStorage(updated);
      setSelectedReportIds([]);
      
      const stillExists = updated.some(r => r.sheetName === activeTab);
      if (activeTab !== 'Summary Dashboard' && activeTab !== 'Unsaved Draft' && !stillExists) {
        if (updated.length > 0) {
          setActiveTab('Summary Dashboard');
        } else {
          setActiveTab('Unsaved Draft');
        }
      }
    }
  };

  // Wipe workbook state
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to completely clear this workbook? This will delete all sheets permanently.")) {
      saveReportsToStorage([]);
      setEditingReportId(null);
      setActiveTab('Unsaved Draft');
    }
  };

  // Populate mock data for instant walkthrough
  const handleLoadSampleData = () => {
    saveReportsToStorage(SAMPLE_REPORTS);
    setEditingReportId(null);
    setActiveTab('Summary Dashboard');
  };

  // Excel (.xlsx) file upload importer
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    try {
      const parsedReports = await loadWorkbookFromFile(file);
      if (parsedReports.length === 0) {
        setImportError("No standard daily report sheets found or parsed successfully. Please upload a spreadsheet created by this app.");
        return;
      }

      // Merge or overwrite with existing sheets depending on dates
      // Let's replace reports that have the exact same date, and add the others
      const mergedReports = [...reports];
      
      parsedReports.forEach((parsed, idx) => {
        const duplicateIndex = mergedReports.findIndex(r => r.date === parsed.date);
        const updatedParsed = {
          ...parsed,
          updatedAt: parsed.updatedAt || (Date.now() + idx)
        };
        if (duplicateIndex >= 0) {
          mergedReports[duplicateIndex] = updatedParsed; // overwrite duplicate
        } else {
          mergedReports.push(updatedParsed); // add fresh sheet
        }
      });

      saveReportsToStorage(mergedReports);
      setImportSuccess(true);
      setActiveTab('Summary Dashboard');
      setTimeout(() => setImportSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setImportError(`Failed to parse Excel file: ${err.message || 'Error occurred'}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // reset file input element
      }
    }
  };

  const handleDownloadExcel = async () => {
    if (reports.length === 0) {
      alert("Please add at least one daily report sheet before downloading the workbook.");
      return;
    }
    await downloadWorkbook(reports);
  };

  const getActiveReportData = (): Omit<DailyReportData, 'id' | 'sheetName'> => {
    if (activeTab === 'Unsaved Draft') {
      return liveFormDraft;
    }
    const found = reports.find(r => r.sheetName === activeTab);
    return found ? found : liveFormDraft;
  };

  const activeData = getActiveReportData();
  const existingDates = reports.map(r => r.date);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col antialiased">
      {/* App Header */}
      <header className="h-14 border-b border-slate-800 bg-[#141b2d] flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-black text-sm shadow-sm select-none">XL</div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-105 flex items-center gap-2">
              Retail Ledger Pro <span className="text-slate-500 font-normal text-[10px] italic">v2.4.0</span>
            </h1>
            <p className="text-[10px] text-slate-400 leading-none">Consolidated Excel sheets & cash-flow formula compiler</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end border-r border-slate-850 pr-4">
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Active Workbook</span>
            <span className="text-xs font-semibold text-slate-300">Daily_Store_Reports.xlsx</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Import Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded bg-[#1a233a] hover:bg-[#253254] text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold border border-slate-800"
              title="Upload previous Excel file to continue adding sheets"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Import Workbook</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImportExcel}
              accept=".xlsx"
              className="hidden" 
            />

            {/* Clear All / Reset */}
            {reports.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1.5 rounded bg-[#1a233a] hover:bg-red-950/40 text-red-400 hover:border-red-900 border border-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Wipe workbook state and reset"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Seed Mock Sample Button */}
            <button
              onClick={handleLoadSampleData}
              className="px-2.5 py-1.5 rounded bg-[#1a233a] hover:bg-[#253254] border border-slate-800 text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Populate workbook with 4 days of store report logs"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Load Samples</span>
            </button>

            {/* Compile Download Deck */}
            <button
              onClick={handleDownloadExcel}
              disabled={reports.length === 0}
              className={`px-3 py-1.5 rounded font-bold text-xs shadow-sm transition flex items-center gap-1.5 border ${
                reports.length > 0 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent cursor-pointer' 
                  : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.xlsx)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Primary Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:grid lg:grid-cols-[360px_1fr] gap-6">
        
        {/* Left Hand: Controller Tower & Inputs Form */}
        <div className="space-y-6 flex flex-col">
          
          {/* File Upload alerts & info prompts */}
          {importError && (
            <div className="bg-red-950/30 text-red-200 p-4 rounded-xl border border-red-900 text-xs flex gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">Import Failed</p>
                <p className="leading-relaxed">{importError}</p>
              </div>
            </div>
          )}

          {importSuccess && (
            <div className="bg-emerald-950/20 text-emerald-305 p-4 rounded-xl border border-emerald-900 text-xs flex gap-2.5 shadow-sm">
              <TrendingUp className="w-4 h-4 flex-shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">Import Succeeded</p>
                <p className="leading-relaxed">Workbook parsed correctly and active sheets were merged successfully!</p>
              </div>
            </div>
          )}

          {/* Form Area */}
          <div className="flex-shrink-0">
            <ReportForm 
              onSubmit={handleSaveReport}
              editingReport={editingReportId ? (reports.find(r => r.id === editingReportId) || null) : null}
              onCancelEdit={() => {
                setEditingReportId(null);
                setLiveFormDraft({
                  date: new Date().toISOString().split('T')[0],
                  debitCreditEbt: 0,
                  cashMoPayout: 0,
                  lotteryPayout: 0,
                  grossSales: 0,
                  cashDrop: 0
                });
                if (reports.length > 0) {
                  setActiveTab('Summary Dashboard');
                } else {
                  setActiveTab('Unsaved Draft');
                }
              }}
              existingDates={existingDates}
              onDraftChange={handleFormDraftChange}
            />
          </div>

          {/* Persistent workbook sheets inventory manager */}
          <div className="bg-[#141b2d] rounded border border-slate-800 p-4 flex-1 flex flex-col min-h-[250px] shadow-sm">
            <div className="flex flex-col gap-2 mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center justify-between select-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Sheets</span>
                <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono font-bold px-1.5 py-0.5 rounded-full">
                  {reports.length} SHEETS
                </span>
              </div>
              
              {reports.length > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 transition">
                    <input 
                      type="checkbox"
                      checked={reports.length > 0 && selectedReportIds.length === reports.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReportIds(reports.map(r => r.id));
                        } else {
                          setSelectedReportIds([]);
                        }
                      }}
                      className="h-3 w-3 rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                    />
                    <span>Select All</span>
                  </label>
                  
                  {selectedReportIds.length > 0 && (
                    <button
                      onClick={handleDeleteMultipleReports}
                      className="text-red-455 hover:text-red-350 transition flex items-center gap-1 font-bold text-[10px] uppercase bg-red-950/20 px-2 py-1 rounded border border-red-900/40"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete ({selectedReportIds.length})
                    </button>
                  )}
                </div>
              )}
            </div>

            {reports.length === 0 ? (
              <div className="flex-1 border border-dashed border-slate-800 bg-slate-950/30 rounded p-6 flex flex-col items-center justify-center text-center text-slate-500">
                <FileCode className="w-10 h-10 text-slate-600 mb-1.5 stroke-1" />
                <p className="text-xs font-semibold text-slate-400">Workbook is empty</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                  Add your first daily sheet to build the workbook report list.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[300px] pr-1 no-scrollbar">
                {/* Sorted list of sheets with direct active status highlight */}
                {[...reports].sort((a, b) => {
                  const valA = a.updatedAt || 0;
                  const valB = b.updatedAt || 0;
                  if (valB !== valA) {
                    return valB - valA;
                  }
                  return b.date.localeCompare(a.date);
                }).map(report => {
                  const isActive = activeTab === report.sheetName;
                  const isSelected = selectedReportIds.includes(report.id);
                  const totalCreditVal = report.debitCreditEbt + report.cashMoPayout + report.lotteryPayout;
                  const estDropVal = report.grossSales - totalCreditVal;
                  const varianceVal = report.cashDrop - estDropVal;

                  return (
                    <div 
                      key={report.id}
                      className={`group p-2.5 rounded border text-xs transition flex items-center justify-between gap-3 cursor-pointer ${
                        isActive 
                          ? 'bg-slate-900 border-slate-700 shadow-sm border-l-4 border-l-emerald-500 text-slate-100' 
                          : 'bg-slate-950/50 hover:bg-[#1a233a] border-slate-800/85 text-slate-350'
                      }`}
                      onClick={() => {
                        setActiveTab(report.sheetName);
                        // If editing another report, prompt cancel
                        if (editingReportId && editingReportId !== report.id) {
                          setEditingReportId(null);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedReportIds(prev => [...prev, report.id]);
                            } else {
                              setSelectedReportIds(prev => prev.filter(id => id !== report.id));
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-slate-800 bg-slate-950 text-emerald-605 focus:ring-emerald-500 cursor-pointer accent-emerald-500 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-slate-500 font-mono">SHEET_{report.date}</div>
                          <div className="text-xs font-bold text-slate-200 leading-tight mt-0.5 flex items-center gap-1">
                            <Calendar className={`w-3 h-3 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span className="truncate">{report.date} Closeout</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 mt-1 text-[10px] text-slate-400 font-mono">
                            <div>Sales: <span className="font-semibold text-slate-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(report.grossSales)}</span></div>
                            <div>Var: <span className={`font-semibold ${varianceVal < 0 ? 'text-red-400' : varianceVal > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(varianceVal)}</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Small sheet controls actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(report);
                          }}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                          title="Edit values on this sheet"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReport(report.id, report.sheetName);
                          }}
                          className="p-1 hover:bg-red-950/40 hover:text-red-400 rounded text-slate-500 transition"
                          title="Delete sheet tab"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Hand: Sheet preview console container */}
        <div className="flex flex-col min-w-0">
          
          {/* Tabs header selector - looks like bottom workbook navigation */}
          {reports.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-t border-t border-x border-slate-855 overflow-x-auto select-none no-scrollbar">
              {/* Summary dashboard Tab */}
              <button
                onClick={() => {
                  setActiveTab('Summary Dashboard');
                  setEditingReportId(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'Summary Dashboard'
                    ? 'bg-slate-950 text-slate-100 border border-slate-800 shadow-xs'
                    : 'bg-[#151c2e] hover:bg-[#1d273f] text-slate-400 border border-transparent'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Summary Dashboard</span>
              </button>

              {/* Corrections Tab */}
              <button
                onClick={() => {
                  setActiveTab('Corrections Tab');
                  setEditingReportId(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'Corrections Tab'
                    ? 'bg-slate-950 text-orange-400 border border-slate-800 shadow-xs'
                    : 'bg-[#151c2e] hover:bg-[#1d273f] text-slate-400 border border-transparent'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Corrections Tab</span>
              </button>

              {/* Space divider */}
              <div className="h-4 w-[1px] bg-slate-800 mx-1 flex-shrink-0"></div>

              {/* Dynamic list of individual daily report tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[...reports].sort((a,b) => a.date.localeCompare(b.date)).map(report => (
                  <button
                    key={report.id}
                    onClick={() => {
                      setActiveTab(report.sheetName);
                      setEditingReportId(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded transition whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                      activeTab === report.sheetName
                        ? 'bg-slate-950 text-emerald-400 border-slate-800 shadow-xs font-bold'
                        : 'bg-[#151c2e] hover:bg-[#1d273f] text-slate-400 border-transparent'
                    }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${activeTab === report.sheetName ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span>{report.sheetName}</span>
                  </button>
                ))}
              </div>

              {/* Draft Tab */}
              <div className="h-4 w-[1px] bg-slate-800 mx-1 flex-shrink-0"></div>
              <button
                onClick={() => setActiveTab('Unsaved Draft')}
                className={`px-3 py-1.5 text-xs font-bold rounded transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'Unsaved Draft'
                    ? 'bg-emerald-700 text-white shadow-xs border border-emerald-850'
                    : 'bg-[#151c2e] hover:bg-[#1d273f] text-slate-400'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingReportId ? 'Active Editing' : 'New Sheet Draft'}</span>
              </button>
            </div>
          )}

          {/* Unified Preview Display */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#141b2d] border border-slate-800 rounded-b overflow-hidden shadow-xs">
            {activeTab === 'Summary Dashboard' && reports.length > 0 ? (
              <SummaryDashboardPreview 
                reports={reports} 
                onSelectTab={(name) => setActiveTab(name)}
              />
            ) : activeTab === 'Corrections Tab' && reports.length > 0 ? (
              <CorrectionsTab 
                reports={reports}
                onUpdateReport={handleUpdateReport}
                onSelectTab={(name) => setActiveTab(name)}
              />
            ) : (
              <div className="flex-1 flex flex-col h-full">
                {/* Live Sheet Render */}
                <div className="flex-1 min-h-0">
                  <ExcelPreview 
                    date={activeData.date}
                    sheetName={activeTab === 'Unsaved Draft' ? (editingReportId ? 'Editing Sheet' : 'Sheet Draft') : activeTab}
                    debitCreditEbt={activeData.debitCreditEbt}
                    cashMoPayout={activeData.cashMoPayout}
                    lotteryPayout={activeData.lotteryPayout}
                    grossSales={activeData.grossSales}
                    cashDrop={activeData.cashDrop}
                  />
                </div>

                {/* Status indicator context banner */}
                {activeTab === 'Unsaved Draft' && (
                  <div className="bg-[#101c25] border-t border-slate-800 px-5 py-3 text-xs text-slate-300 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      {editingReportId ? (
                        <span>You are currently making changes to the sheet for <strong>{activeData.date}</strong>. Click "Save Changes" in the form to apply.</span>
                      ) : (
                        <span>This is a live preview of your unsaved sheet. Click <strong>"Add Sheet Tab"</strong> on the left to save it inside the active workbook.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer Bar */}
      <footer className="h-8 bg-[#101625] border-t border-slate-800 flex items-center px-4 justify-between shrink-0 select-none">
        <div className="flex items-center gap-4 text-[10px] text-slate-405 font-medium uppercase">
          <div className="flex items-center gap-1 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Connected to Excel Runtime
          </div>
          <div>Sheet Count: {reports.length}</div>
          <div className="hidden sm:block">Last Sync: Just now</div>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          ZONGSHRONG | WORKSTATION_01 | LOCALHOST:3000
        </div>
      </footer>
    </div>
  );
}
