
import React, { useState } from 'react';
import { PlusCircle, Calendar, FileText, ArrowDownCircle, ArrowUpCircle, Loader2 } from 'lucide-react';
import { TransactionInput } from '../types';

interface TransactionFormProps {
  onAdd: (t: TransactionInput) => Promise<void>;
  disabled?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, disabled }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const incVal = parseFloat(income) || 0;
    const expVal = parseFloat(expense) || 0;

    if (incVal === 0 && expVal === 0) return;

    setSubmitting(true);
    try {
      await onAdd({
        date,
        description: description.trim(),
        income: incVal,
        expense: expVal
      });
      // Reset
      setDescription('');
      setIncome('');
      setExpense('');
      // Keep date as is for convenience
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Only disable if explicitly told to AND we are not just submitting
  // The 'disabled' prop comes from !user. 
  // If user is null, we show loading.
  const isFormLocked = disabled || submitting;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300 relative">
      {/* Overlay for initialization only */}
      {disabled && !submitting && (
         <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 z-20 rounded-xl flex items-center justify-center backdrop-blur-[1px] transition-all duration-300">
            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm animate-pulse">
               <Loader2 className="animate-spin h-4 w-4" />
               <span>Connecting to Ledger...</span>
            </div>
         </div>
      )}

      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
        <PlusCircle className="text-teal-600 dark:text-teal-400" size={20} />
        New Entry
      </h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Date */}
        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <input 
              type="date" 
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isFormLocked}
              className="relative z-10 w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm text-slate-700 dark:text-slate-200 [color-scheme:light] dark:[color-scheme:dark] disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-5">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Description</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="e.g. Milk sales, Electric bill"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isFormLocked}
              className="relative z-10 w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Income */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-green-600 dark:text-green-400 mb-1.5 ml-1">Income (₹)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <ArrowDownCircle className="h-4 w-4 text-green-500" />
            </div>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              placeholder="0.00"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              disabled={isFormLocked}
              className="relative z-10 w-full pl-9 pr-2 py-2.5 bg-green-50/30 dark:bg-green-900/10 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm text-slate-700 dark:text-slate-200 font-mono placeholder-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Expense */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-red-600 dark:text-red-400 mb-1.5 ml-1">Expense (₹)</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <ArrowUpCircle className="h-4 w-4 text-red-500" />
             </div>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              placeholder="0.00"
              value={expense}
              onChange={(e) => setExpense(e.target.value)}
              disabled={isFormLocked}
              className="relative z-10 w-full pl-9 pr-2 py-2.5 bg-red-50/30 dark:bg-red-900/10 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-sm text-slate-700 dark:text-slate-200 font-mono placeholder-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="md:col-span-12 flex justify-end">
            <button 
                type="submit" 
                disabled={isFormLocked || (!income && !expense)}
                className={`
                    w-full md:w-auto px-6 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all duration-200
                    ${(isFormLocked || (!income && !expense)) 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
                        : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg active:scale-95 dark:bg-teal-600 dark:hover:bg-teal-500'
                    }
                `}
            >
                {submitting ? 'Saving...' : 'Record Transaction'}
            </button>
        </div>

      </form>
    </div>
  );
};
