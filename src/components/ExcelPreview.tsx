import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface ExcelPreviewProps {
  date: string;
  sheetName: string;
  debitCreditEbt: number;
  cashMoPayout: number;
  lotteryPayout: number;
  grossSales: number;
  cashDrop: number;
}

export default function ExcelPreview({
  date,
  sheetName,
  debitCreditEbt,
  cashMoPayout,
  lotteryPayout,
  grossSales,
  cashDrop,
}: ExcelPreviewProps) {
  // Keep track of the currently selected cell for the interactive Formula Bar
  const [selectedCell, setSelectedCell] = useState<{ id: string; name: string; formula: string; valStr: string }>({
    id: 'C4',
    name: 'Debit/Credit/EBT Value',
    formula: '',
    valStr: debitCreditEbt.toFixed(2),
  });

  const [showFormulas, setShowFormulas] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  // Intermediate calculations
  const totalCredit = debitCreditEbt + cashMoPayout + lotteryPayout;
  const estimatedDrop = grossSales - totalCredit;
  const overShort = cashDrop - estimatedDrop;

  // Cells structure for the interactive spreadsheet
  const cellsMap: Record<string, { label: string; value: number; valStr: string; formula: string; type: 'value' | 'formula' | 'label' | 'header' | 'empty' }> = {
    // Left side cells
    B3: { label: 'Daily report Header', value: 0, valStr: 'Daily report', formula: '', type: 'header' },
    B4: { label: 'Debit/Credit/EBT Label', value: 0, valStr: 'Debit/Credit/EBT', formula: '', type: 'label' },
    C4: { label: 'Debit/Credit/EBT Cell', value: debitCreditEbt, valStr: formatCurrency(debitCreditEbt), formula: '', type: 'value' },
    
    B5: { label: 'Cash/Mo Payout Label', value: 0, valStr: 'Cash/Mo Payout', formula: '', type: 'label' },
    C5: { label: 'Cash/Mo Payout Cell', value: cashMoPayout, valStr: formatCurrency(cashMoPayout), formula: '', type: 'value' },
    
    B6: { label: 'Lottery payout Label', value: 0, valStr: 'Lottery payout', formula: '', type: 'label' },
    C6: { label: 'Lottery payout Cell', value: lotteryPayout, valStr: formatCurrency(lotteryPayout), formula: '', type: 'value' },
    
    B7: { label: 'Separator Left Label', value: 0, valStr: '', formula: '', type: 'label' },
    C7: { label: 'Separator Left Value', value: 0, valStr: '', formula: '', type: 'empty' },
    
    B8: { label: 'Total Credit Label (Left)', value: 0, valStr: 'Total Credit', formula: '', type: 'label' },
    C8: { label: 'Total Credit Cell (Left)', value: totalCredit, valStr: formatCurrency(totalCredit), formula: '=SUM(C4:C6)', type: 'formula' },

    // Right side cells
    D4: { label: 'Gross Sales Label', value: 0, valStr: 'Gross Sales', formula: '', type: 'label' },
    E4: { label: 'Gross Sales Cell', value: grossSales, valStr: formatCurrency(grossSales), formula: '', type: 'value' },
    
    D5: { label: 'Total Credit Label (Right)', value: 0, valStr: 'Total Credit', formula: '', type: 'label' },
    E5: { label: 'Total Credit Cell (Right)', value: totalCredit, valStr: formatCurrency(totalCredit), formula: '=C8', type: 'formula' },
    
    D6: { label: 'Estimated Drop Label', value: 0, valStr: 'Estimated Drop', formula: '', type: 'label' },
    E6: { label: 'Estimated Drop Cell', value: estimatedDrop, valStr: formatCurrency(estimatedDrop), formula: '=E4-E5', type: 'formula' },
    
    D7: { label: 'Cash Drop Label', value: 0, valStr: 'Cash Drop', formula: '', type: 'label' },
    E7: { label: 'Cash Drop Cell', value: cashDrop, valStr: formatCurrency(cashDrop), formula: '', type: 'value' },
    
    D8: { label: 'Over/Short Label', value: 0, valStr: 'Over/Short', formula: '', type: 'label' },
    E8: { label: 'Over/Short Cell', value: overShort, valStr: formatCurrency(overShort), formula: '=E7-E6', type: 'formula' }
  };

  const handleCellClick = (cellId: string) => {
    const cell = cellsMap[cellId];
    if (cell) {
      setSelectedCell({
        id: cellId,
        name: cell.label,
        formula: cell.formula,
        valStr: cell.type === 'value' ? cell.value.toFixed(2) : cell.valStr
      });
    }
  };

  // Helper trigger cell styling
  const getCellClassName = (cellId: string) => {
    const cell = cellsMap[cellId];
    const isSelected = selectedCell.id === cellId;
    
    let base = "h-9 border-r border-b border-slate-800 text-xs px-2.5 flex items-center transition-all cursor-pointer ";
    
    if (isSelected) {
      base += "ring-2 ring-emerald-500 ring-inset z-10 bg-emerald-500/10 ";
    }

    if (!cell) {
      return base + "bg-slate-900";
    }

    switch (cell.type) {
      case 'header':
        return "h-11 bg-emerald-800 text-slate-100 font-bold text-center justify-center border-r border-b border-slate-700 rounded-t-sm col-span-4 select-none";
      case 'label':
        return base + "bg-slate-800 text-slate-300 font-bold justify-start";
      case 'value':
        return base + "bg-[#141b2d] text-slate-200 justify-end font-mono";
      case 'formula':
        return base + "bg-[#141b2d] text-slate-200 font-semibold justify-end font-mono";
      case 'empty':
        return base + "bg-[#141b2d] justify-end";
      default:
        return base + "bg-[#141b2d]";
    }
  };

  return (
    <div className="bg-[#141b2d] rounded border border-slate-800 overflow-hidden flex flex-col h-full shadow-xs">
      {/* Top Title/Toolbar */}
      <div className="bg-[#101625] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-emerald-600 rounded flex items-center justify-center text-[9px] font-black text-white shadow-sm font-mono">X</div>
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
            Spreadsheet Preview Model
            <span className="text-[10px] font-normal text-slate-400 font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded normal-case">
              Tab: {sheetName || date || 'Active'}
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Select cell to view local formula dependencies</span>
        </div>
      </div>

      {/* Interactive Formula Bar */}
      <div className="bg-[#101625] border-b border-slate-800 px-3 py-1.5 flex items-center gap-2 font-mono text-[11px] select-none">
        {/* Cell Box */}
        <div className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-450 font-black text-center min-w-[45px] shadow-xs">
          {selectedCell.id}
        </div>
        {/* Formula Icon */}
        <div className="text-slate-500 font-bold select-none px-1 italic text-xs leading-none">
          fx
        </div>
        {/* Input Formula */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-0.5 text-slate-305 flex items-center shadow-xs select-all min-h-[22px]">
          {selectedCell.formula ? (
            <span className="text-emerald-400 font-bold text-xs">{selectedCell.formula}</span>
          ) : (
            <span className="text-slate-400 text-xs">{selectedCell.valStr}</span>
          )}
        </div>
      </div>

      {/* Excel Sheet Sheet Component */}
      <div className="flex-1 overflow-auto bg-slate-950 p-6 flex items-center justify-center min-h-[300px]">
        <div className="shadow-lg rounded border border-slate-850 overflow-hidden bg-[#141b2d] max-w-full">
          {/* Excel Header: Column letters */}
          <div className="grid grid-cols-[40px_180px_110px_150px_110px] bg-slate-900 border-b border-slate-800 text-center text-slate-450 font-semibold text-[11px] font-mono select-none">
            <div className="py-1 border-r border-slate-850 bg-slate-950"></div>
            <div className="py-1 border-r border-slate-800">B</div>
            <div className="py-1 border-r border-slate-800">C</div>
            <div className="py-1 border-r border-slate-800">D</div>
            <div className="py-1">E</div>
          </div>

          {/* Row 1 & 2 (Empty padding rows in Excel to centered table nicely) */}
          <div className="grid grid-cols-[40px_180px_110px_150px_110px] border-b border-slate-800 text-[11px] font-mono select-none">
            <div className="bg-slate-900 text-slate-500 flex items-center justify-center border-r border-slate-800 py-1">1</div>
            <div className="bg-[#141b2d] col-span-4 border-slate-800"></div>
          </div>
          <div className="grid grid-cols-[40px_180px_110px_150px_110px] border-b border-slate-800 text-[11px] font-mono select-none">
            <div className="bg-slate-900 text-slate-500 flex items-center justify-center border-r border-slate-800 py-1 font-mono">2</div>
            <div className="bg-[#141b2d] col-span-4"></div>
          </div>

          {/* Row 3: Merged Title Block */}
          <div className="grid grid-cols-[40px_1fr] border-b border-slate-800">
            <div className="bg-slate-900 text-slate-500 border-r border-slate-800 flex items-center justify-center text-[11px] font-mono select-none">3</div>
            <div onClick={() => handleCellClick('B3')} className={getCellClassName('B3')}>
              Daily report
            </div>
          </div>

          {/* Row 4: Debit/Credit/EBT Value & Gross Sales Cell */}
          <div className="grid grid-cols-[40px_180px_110px_150px_110px] border-b border-slate-800">
            <div className="bg-slate-900 text-slate-500 border-r border-slate-800 flex items-center justify-center text-[11px] font-mono select-none">4</div>
            <div onClick={() => handleCellClick('B4')} className={getCellClassName('B4')}>Debit/Credit/EBT</div>
            <div onClick={() => handleCellClick('C4')} className={getCellClassName('C4')}>{formatCurrency(debitCreditEbt)}</div>
            <div onClick={() => handleCellClick('D4')} className={getCellClassName('D4')}>Gross Sales</div>
            <div onClick={() => handleCellClick('E4')} className={getCellClassName('E4')}>{formatCurrency(grossSales)}</div>
          </div>

          {/* Row 5: Cash/Mo Payout & Total Credit (col 2) */}
          <div className="grid grid-cols-[40px_180px_110px_150px_110px] border-b border-slate-800">
            <div className="bg-slate-900 text-slate-500 border-r border-slate-800 flex items-center justify-center text-[11px] font-mono select-none">5</div>
            <div onClick={() => handleCellClick('B5')} className={getCellClassName('B5')}>Cash/Mo Payout</div>
            <div onClick={() => handleCellClick('C5')} className={getCellClassName('C5')}>{formatCurrency(cashMoPayout)}</div>
            <div onClick={() => handleCellClick('D5')} className={getCellClassName('D5')}>Total Credit</div>
            <div onClick={() => handleCellClick('E5')} className={getCellClassName('E5') + " text-blue-400 font-semibold"}>
              {formatCurrency(totalCredit)}
            </div>
          </div>

          {/* Row 6: Lottery payout & Estimated Drop */}
          <div className="grid grid-cols-[40px_180px_110px_150px_110px] border-b border-slate-800">
            <div className="bg-slate-900 text-slate-500 border-r border-slate-800 flex items-center justify-center text-[11px] font-mono select-none">6</div>
            <div onClick={() => handleCellClick('B6')} className={getCellClassName('B6')}>Lottery payout</div>
            <div onClick={() => handleCellClick('C6')} className={getCellClassName('C6')}>{formatCurrency(lotteryPayout)}</div>
            <div onClick={() => handleCellClick('D6')} className={getCellClassName('D6')}>Estimated Drop</div>
            <div onClick={() => handleCellClick('E6')} className={getCellClassName('E6') + " text-emerald-400 font-semibold"}>
              {formatCurrency(estimatedDrop)}
            </div>
          </div>

          {/* Row 7: Blank Spacer Cell & Cash Drop */}
          <div className="grid grid-cols-[40px_180px_110px_150px_110px] border-b border-slate-800">
            <div className="bg-slate-900 text-slate-500 border-r border-slate-800 flex items-center justify-center text-[11px] font-mono select-none">7</div>
            <div onClick={() => handleCellClick('B7')} className={getCellClassName('B7')}></div>
            <div onClick={() => handleCellClick('C7')} className={getCellClassName('C7')}></div>
            <div onClick={() => handleCellClick('D7')} className={getCellClassName('D7')}>Cash Drop</div>
            <div onClick={() => handleCellClick('E7')} className={getCellClassName('E7')}>{formatCurrency(cashDrop)}</div>
          </div>

          {/* Row 8: Total Credit sums & Over/Short calculation */}
          <div className="grid grid-cols-[40px_180px_110px_150px_110px] border-b border-slate-800">
            <div className="bg-slate-900 text-slate-500 border-r border-slate-800 flex items-center justify-center text-[11px] font-mono select-none">8</div>
            <div onClick={() => handleCellClick('B8')} className={getCellClassName('B8')}>Total Credit</div>
            <div onClick={() => handleCellClick('C8')} className={getCellClassName('C8') + " text-blue-400 font-semibold"}>
              {formatCurrency(totalCredit)}
            </div>
            <div onClick={() => handleCellClick('D8')} className={getCellClassName('D8')}>Over/Short</div>
            <div 
              onClick={() => handleCellClick('E8')} 
              className={
                getCellClassName('E8') + " font-bold " + 
                (overShort < 0 ? "text-red-400 bg-red-950/20" : overShort > 0 ? "text-emerald-400 bg-emerald-950/20" : "text-slate-350")
              }
            >
              {formatCurrency(overShort)}
            </div>
          </div>

          {/* Row 9 (Bottom Spacer) */}
          <div className="grid grid-cols-[40px_180px_110px_150px_110px] text-[11px] font-mono select-none">
            <div className="bg-slate-900 text-slate-500 flex items-center justify-center border-r border-slate-800 py-1">9</div>
            <div className="col-span-4 py-1 h-6"></div>
          </div>
        </div>
      </div>

      {/* Collapsible Formula Details Accordion */}
      <div className="bg-[#101625] border-t border-slate-800">
        <button 
          type="button"
          onClick={() => setShowFormulas(!showFormulas)}
          className="w-full px-5 py-3 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-between transition-colors focus:outline-none"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
            Formula Details & References
          </span>
          <span className="text-slate-400 font-mono text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded select-none">
            {showFormulas ? 'Hide Details' : 'Show Details'}
          </span>
        </button>
        
        {showFormulas && (
          <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed max-h-[160px] overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[10px] text-slate-300 bg-slate-950 p-3 rounded border border-slate-800 mt-0.5">
              <div>• First Col Total Credit = Debit/Credit/EBT + Cash Payout + Lottery</div>
              <div>• Second Col Total Credit = Mirror of First Column Total Credit [=C8]</div>
              <div>• Estimated Drop = Gross Sales - Second Col Total Credit [=E4-E5]</div>
              <div>• Over / Short = Actual Cash Drop - Estimated Cash Drop [=E7-E6]</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
