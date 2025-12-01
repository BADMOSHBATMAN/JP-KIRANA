
import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, income, expense }) => {
  const isPositive = balance >= 0;

  const formatCurrency = (val: number) => 
    `₹${Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-xl transition-all duration-500
      ${isPositive ? 'bg-slate-900 dark:bg-slate-900 dark:border dark:border-slate-800' : 'bg-red-700 dark:bg-red-800 dark:border dark:border-red-900'}
    `}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-slate-300 text-sm font-medium mb-1 uppercase tracking-wider opacity-80">Net Balance</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono">
            {balance < 0 && '-'}{formatCurrency(balance)}
          </h2>
          <p className="mt-2 text-sm opacity-60">
            {isPositive ? 'You are in profit' : 'Warning: Negative Balance'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
            <div className={`
                flex-1 p-4 rounded-xl border backdrop-blur-sm
                ${isPositive ? 'bg-slate-800/50 border-slate-700' : 'bg-red-800/50 border-red-600'}
            `}>
                <div className="flex items-center gap-2 mb-1 text-green-400">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold uppercase">Total Income</span>
                </div>
                <p className="text-xl font-bold font-mono text-green-100">{formatCurrency(income)}</p>
            </div>

            <div className={`
                flex-1 p-4 rounded-xl border backdrop-blur-sm
                ${isPositive ? 'bg-slate-800/50 border-slate-700' : 'bg-red-800/50 border-red-600'}
            `}>
                <div className="flex items-center gap-2 mb-1 text-red-300">
                    <TrendingDown size={16} />
                    <span className="text-xs font-bold uppercase">Total Expense</span>
                </div>
                <p className="text-xl font-bold font-mono text-red-100">{formatCurrency(expense)}</p>
            </div>
        </div>
      </div>
    </div>
  );
};
