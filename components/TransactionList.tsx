
import React from 'react';
import { Transaction } from '../types';
import { Trash2, AlertCircle, Database, Loader2 } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  loading: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, loading }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year.slice(2)}`;
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '-';
    return `₹${amount.toFixed(2)}`;
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this transaction?")) {
        // The parent onDelete is now fully optimistic.
        // We trigger it and the row will vanish immediately from the 'transactions' prop.
        onDelete(id);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors duration-300">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 dark:border-slate-700 border-t-teal-600 dark:border-t-teal-500 mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors duration-300">
        <div className="bg-slate-50 dark:bg-slate-800 inline-flex p-4 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-slate-900 dark:text-slate-100 font-medium text-lg">No Transactions Yet</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Start by recording your first income or expense above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Income</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Expense</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {formatDate(t.date)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100 max-w-xs truncate" title={t.description}>
                  <div className="flex items-center gap-2">
                    {t.id.startsWith('local_') && (
                       <Database size={12} className="text-slate-400" title="Saved locally" />
                    )}
                    {t.description || <span className="text-slate-300 dark:text-slate-600 italic">No description</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400 font-mono font-medium">
                  {t.income > 0 ? formatCurrency(t.income) : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400 font-mono font-medium">
                  {t.expense > 0 ? formatCurrency(t.expense) : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, t.id)}
                    className="relative text-slate-400 hover:text-red-600 dark:text-slate-600 dark:hover:text-red-400 transition-all p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95"
                    title="Delete Transaction"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 text-center">
        Showing {transactions.length} entries
      </div>
    </div>
  );
};
