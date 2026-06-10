import React, { useState, useEffect } from 'react';
import { DailyReportData } from '../types';
import { Calendar, Percent, Plus, Save, Trash2, X, Info, ChevronUp, ChevronDown } from 'lucide-react';

interface ReportFormProps {
  onSubmit: (data: {
    date: string;
    debitCreditEbt: number;
    cashMoPayout: number;
    lotteryPayout: number;
    grossSales: number;
    cashDrop: number;
  }) => void;
  editingReport: DailyReportData | null;
  onCancelEdit: () => void;
  existingDates: string[];
  onDraftChange?: (data: {
    date: string;
    debitCreditEbt: number;
    cashMoPayout: number;
    lotteryPayout: number;
    grossSales: number;
    cashDrop: number;
  }) => void;
}

export default function ReportForm({
  onSubmit,
  editingReport,
  onCancelEdit,
  existingDates,
  onDraftChange
}: ReportFormProps) {
  const [date, setDate] = useState('');
  const [debitCreditEbt, setDebitCreditEbt] = useState('');
  const [cashMoPayout, setCashMoPayout] = useState('');
  const [lotteryPayout, setLotteryPayout] = useState('');
  const [grossSales, setGrossSales] = useState('');
  const [cashDrop, setCashDrop] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | null }>({});

  const stepDate = (offset: number) => {
    if (!date) return;
    try {
      const parts = date.split('-');
      if (parts.length !== 3) return;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      
      const newDStr = new Date(year, month, day + offset);
      const yyyy = newDStr.getFullYear();
      const mm = String(newDStr.getMonth() + 1).padStart(2, '0');
      const dd = String(newDStr.getDate()).padStart(2, '0');
      
      setDate(`${yyyy}-${mm}-${dd}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleIncrementDate = () => stepDate(1);
  const handleDecrementDate = () => stepDate(-1);

  // Sync state if editing
  useEffect(() => {
    if (editingReport) {
      setDate(editingReport.date);
      setDebitCreditEbt(editingReport.debitCreditEbt.toString());
      setCashMoPayout(editingReport.cashMoPayout.toString());
      setLotteryPayout(editingReport.lotteryPayout.toString());
      setGrossSales(editingReport.grossSales.toString());
      setCashDrop(editingReport.cashDrop.toString());
      setError('');
      setFieldErrors({});
    } else {
      // Set to today
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setDebitCreditEbt('');
      setCashMoPayout('');
      setLotteryPayout('');
      setGrossSales('');
      setCashDrop('');
      setError('');
      setFieldErrors({});
    }
  }, [editingReport]);

  const parseNum = (val: string) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Push updates back to the parent live Form Draft state
  useEffect(() => {
    if (onDraftChange) {
      onDraftChange({
        date,
        debitCreditEbt: parseNum(debitCreditEbt),
        cashMoPayout: parseNum(cashMoPayout),
        lotteryPayout: parseNum(lotteryPayout),
        grossSales: parseNum(grossSales),
        cashDrop: parseNum(cashDrop),
      });
    }
  }, [date, debitCreditEbt, cashMoPayout, lotteryPayout, grossSales, cashDrop, onDraftChange]);

  const validateNumberInRealTime = (val: string, fieldLabel: string) => {
    if (val === '') return null;
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return `${fieldLabel} must be a valid number`;
    if (parsed < 0) return `${fieldLabel} cannot be negative`;
    return null;
  };

  const handleDebitCreditChange = (val: string) => {
    setDebitCreditEbt(val);
    setFieldErrors(prev => ({
      ...prev,
      debitCreditEbt: validateNumberInRealTime(val, 'Debit/Credit/EBT')
    }));
  };

  const handleCashMoChange = (val: string) => {
    setCashMoPayout(val);
    setFieldErrors(prev => ({
      ...prev,
      cashMoPayout: validateNumberInRealTime(val, 'Cash/MO Payout')
    }));
  };

  const handleLotteryChange = (val: string) => {
    setLotteryPayout(val);
    setFieldErrors(prev => ({
      ...prev,
      lotteryPayout: validateNumberInRealTime(val, 'Lottery Payout')
    }));
  };

  const handleGrossSalesChange = (val: string) => {
    setGrossSales(val);
    setFieldErrors(prev => ({
      ...prev,
      grossSales: validateNumberInRealTime(val, 'Gross Sales')
    }));
  };

  const handleCashDropChange = (val: string) => {
    setCashDrop(val);
    setFieldErrors(prev => ({
      ...prev,
      cashDrop: validateNumberInRealTime(val, 'Cash Drop')
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('Please select a date');
      return;
    }

    // Check if duplicate date when NOT editing
    if (!editingReport && existingDates.includes(date)) {
      setError(`A daily report sheet for ${date} already exists in the workbook. Please select another date or edit the existing one.`);
      return;
    }

    // Perform ultimate sweep validation on all numeric inputs
    const cleanNum = (val: string) => {
      if (val === '') return 0;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    };

    const parsedEbt = cleanNum(debitCreditEbt);
    const parsedCashMo = cleanNum(cashMoPayout);
    const parsedLottery = cleanNum(lotteryPayout);
    const parsedGross = cleanNum(grossSales);
    const parsedDrop = cleanNum(cashDrop);

    const checkNegative = (num: number | null, label: string) => {
      if (num === null) return `${label} must be a valid number.`;
      if (num < 0) return `${label} cannot be a negative amount.`;
      return null;
    };

    const errMessage = 
      checkNegative(parsedEbt, 'Debit/Credit/EBT') ||
      checkNegative(parsedCashMo, 'Cash/Money Order Payout') ||
      checkNegative(parsedLottery, 'Lottery Payout') ||
      checkNegative(parsedGross, 'Gross Store Sales') ||
      checkNegative(parsedDrop, 'Actual Cash Drop');

    if (errMessage) {
      setError(errMessage);
      return;
    }

    // Ensure we don't submit if there are still field-level errors
    const hasFieldErrors = Object.values(fieldErrors).some(err => err !== null);
    if (hasFieldErrors) {
      setError('Please fix the errors in the fields below before saving.');
      return;
    }

    onSubmit({
      date,
      debitCreditEbt: parseNum(debitCreditEbt),
      cashMoPayout: parseNum(cashMoPayout),
      lotteryPayout: parseNum(lotteryPayout),
      grossSales: parseNum(grossSales),
      cashDrop: parseNum(cashDrop),
    });

    if (!editingReport) {
      // Clear inputs except date
      setDebitCreditEbt('');
      setCashMoPayout('');
      setLotteryPayout('');
      setGrossSales('');
      setCashDrop('');
      setFieldErrors({});
    }
  };

  const handleClear = () => {
    if (editingReport) {
      onCancelEdit();
    } else {
      setDebitCreditEbt('');
      setCashMoPayout('');
      setLotteryPayout('');
      setGrossSales('');
      setCashDrop('');
      setError('');
      setFieldErrors({});
    }
  };

  return (
    <div className="bg-[#141b2d] rounded border border-slate-800 p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-100 tracking-tight uppercase select-none">
          {editingReport ? 'Register Update' : 'Register Entry'}
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          {editingReport ? 'Modify cell values to compile this Excel sheet.' : 'Enter daily totals to append a new sheet.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5 select-none">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Report Date <span className="text-slate-500 font-normal font-mono normal-case">(tab/sheet label)</span>
          </label>
          <div className="flex bg-[#0d1320] border border-slate-755 rounded focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-slate-850 transition items-stretch overflow-hidden">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-slate-100 font-mono text-sm focus:outline-none px-3 py-1.5 flex-1 min-w-0 pointer-events-auto [color-scheme:dark]"
              required
            />
            <div className="flex border-l border-slate-800 bg-[#162035]/20 select-none">
              <button
                type="button"
                onClick={handleDecrementDate}
                className="hover:bg-slate-800 text-slate-400 hover:text-emerald-400 px-2.5 flex items-center justify-center transition active:scale-90"
                title="Previous Day (-1 Day)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="w-[1px] bg-slate-800/80 my-1.5"></div>
              <button
                type="button"
                onClick={handleIncrementDate}
                className="hover:bg-slate-800 text-slate-400 hover:text-emerald-400 px-2.5 flex items-center justify-center transition active:scale-90"
                title="Next Day (+1 Day)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 select-none">
            Formula Variables
          </span>

          <div className="space-y-3">
            {/* Debit/Credit/EBT */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex justify-between items-center select-none">
                <span>Debit / Credit / EBT</span>
                <span className="text-[9px] text-slate-500 font-mono">CELL C4</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-xs font-semibold">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={debitCreditEbt}
                  onChange={(e) => handleDebitCreditChange(e.target.value)}
                  className={`w-full bg-slate-900 border rounded pl-7 pr-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:bg-slate-850 transition text-slate-200 ${
                    fieldErrors.debitCreditEbt ? 'border-red-500 focus:ring-red-550' : 'border-slate-750 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {fieldErrors.debitCreditEbt && (
                <p className="text-[10px] text-red-400 font-bold mt-1 select-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-550 animate-pulse"></span>
                  {fieldErrors.debitCreditEbt}
                </p>
              )}
            </div>

            {/* Cash/Mo Payout */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex justify-between items-center select-none">
                <span>Cash / Money Order Payout</span>
                <span className="text-[9px] text-slate-500 font-mono">CELL C5</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-xs font-semibold">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashMoPayout}
                  onChange={(e) => handleCashMoChange(e.target.value)}
                  className={`w-full bg-slate-900 border rounded pl-7 pr-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:bg-slate-850 transition text-slate-200 ${
                    fieldErrors.cashMoPayout ? 'border-red-500 focus:ring-red-550' : 'border-slate-750 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {fieldErrors.cashMoPayout && (
                <p className="text-[10px] text-red-400 font-bold mt-1 select-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-550 animate-pulse"></span>
                  {fieldErrors.cashMoPayout}
                </p>
              )}
            </div>

            {/* Lottery Payout */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex justify-between items-center select-none">
                <span>Lottery Payout</span>
                <span className="text-[9px] text-slate-500 font-mono">CELL C6</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-xs font-semibold">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={lotteryPayout}
                  onChange={(e) => handleLotteryChange(e.target.value)}
                  className={`w-full bg-slate-900 border rounded pl-7 pr-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:bg-slate-850 transition text-slate-200 ${
                    fieldErrors.lotteryPayout ? 'border-red-500 focus:ring-red-550' : 'border-slate-750 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {fieldErrors.lotteryPayout && (
                <p className="text-[10px] text-red-400 font-bold mt-1 select-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-550 animate-pulse"></span>
                  {fieldErrors.lotteryPayout}
                </p>
              )}
            </div>

            {/* Gross Sales */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex justify-between items-center select-none">
                <span>Gross Store Sales</span>
                <span className="text-[9px] text-slate-500 font-mono">CELL E4</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-xs font-semibold">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={grossSales}
                  onChange={(e) => handleGrossSalesChange(e.target.value)}
                  className={`w-full bg-slate-900 border rounded pl-7 pr-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:bg-slate-850 transition text-slate-100 font-bold ${
                    fieldErrors.grossSales ? 'border-red-500 focus:ring-red-550' : 'border-slate-750 focus:ring-emerald-500'
                  }`}
                  required
                />
              </div>
              {fieldErrors.grossSales && (
                <p className="text-[10px] text-red-400 font-bold mt-1 select-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-550 animate-pulse"></span>
                  {fieldErrors.grossSales}
                </p>
              )}
            </div>

            {/* Cash Drop */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex justify-between items-center select-none">
                <span>Actual Cash Drop</span>
                <span className="text-[9px] text-slate-500 font-mono">CELL E7</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-xs font-semibold">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashDrop}
                  onChange={(e) => handleCashDropChange(e.target.value)}
                  className={`w-full bg-slate-900 border rounded pl-7 pr-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:bg-slate-850 transition text-slate-200 ${
                    fieldErrors.cashDrop ? 'border-red-500 focus:ring-red-550' : 'border-slate-750 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {fieldErrors.cashDrop && (
                <p className="text-[10px] text-red-400 font-bold mt-1 select-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-550 animate-pulse"></span>
                  {fieldErrors.cashDrop}
                </p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/30 text-red-200 p-2.5 rounded border border-red-900 text-[11px] leading-snug flex gap-2">
            <Info className="w-4 h-4 flex-shrink-0 text-red-400" />
            <div>{error}</div>
          </div>
        )}

        {/* Buttons Action */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded transition flex items-center justify-center gap-1.5 text-xs uppercase tracking-wide shadow-sm"
          >
            {editingReport ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {editingReport ? 'Save Sheet' : 'Add Sheet'}
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            className="bg-slate-900 hover:bg-slate-800 text-slate-350 font-bold py-2 px-3 rounded border border-slate-750 transition text-xs uppercase tracking-wide"
          >
            {editingReport ? 'Cancel' : 'Clear'}
          </button>
        </div>
      </form>
    </div>
  );
}
