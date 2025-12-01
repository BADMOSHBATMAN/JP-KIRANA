
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Transaction } from '../types';
import { BarChart3 } from 'lucide-react';

interface FinancialChartProps {
  transactions: Transaction[];
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
  const data = useMemo(() => {
    // Group by date, take last 7 active days or simply last 7 days from list
    const grouped: Record<string, { date: string; income: number; expense: number }> = {};
    
    // Process in reverse to get chronological if list is desc, but our list is desc.
    transactions.forEach(t => {
      if (!grouped[t.date]) {
        grouped[t.date] = { date: t.date, income: 0, expense: 0 };
      }
      grouped[t.date].income += t.income || 0;
      grouped[t.date].expense += t.expense || 0;
    });

    // Convert to array and sort by date ascending
    const arr = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    
    // Slice last 7 entries for cleaner view on small screens
    return arr.slice(-7);
  }, [transactions]);

  if (data.length === 0) {
    return null;
  }

  // Helper to format date label
  const formatXAxis = (dateStr: string) => {
     const [year, month, day] = dateStr.split('-');
     return `${day}/${month}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={20} />
        Weekly Overview
      </h3>
      
      {/* 
         Fix for "width(-1) and height(-1)" error: 
         We use a div with explicit style height/width to ensure ResponsiveContainer 
         can calculate dimensions immediately on render. 
      */}
      <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis} 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                dy={10}
            />
            <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                  backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                  color: '#f1f5f9' 
                }}
                itemStyle={{ color: '#f1f5f9' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#94a3b8' }} />
            <Bar dataKey="income" name="Income" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
