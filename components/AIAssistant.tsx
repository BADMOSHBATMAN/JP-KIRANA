
import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../types';
import { analyzeFinances } from '../services/geminiService';
import { Send, Bot, X, Sparkles, WifiOff } from 'lucide-react';

interface AIAssistantProps {
  transactions: Transaction[];
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ transactions, onClose }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if key is available in env
    if (process.env.API_KEY) {
        setHasKey(true);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!navigator.onLine) {
      setError("You are currently offline. Please reconnect to internet to use AI features.");
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');
    
    try {
      const result = await analyzeFinances(transactions, query);
      setResponse(result || 'No response generated.');
    } catch (err) {
      setError("Unable to process request. Ensure API Key is configured and internet is available.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-lg border border-indigo-100 dark:border-slate-700 p-6 mb-8 relative overflow-hidden transition-colors duration-300">
       {/* Close Button */}
       <button 
         onClick={onClose}
         className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-slate-300 transition"
       >
         <X size={20} />
       </button>

       <div className="flex items-start gap-4 mb-6">
         <div className="bg-indigo-600 p-3 rounded-lg shadow-md shadow-indigo-200 dark:shadow-none">
           <Sparkles className="text-white h-6 w-6" />
         </div>
         <div>
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">Ledger AI Insights</h3>
            <p className="text-sm text-indigo-600/80 dark:text-indigo-300/80">
              Ask questions about your finances, like "What is my total expense this week?"
            </p>
         </div>
       </div>

       {/* Response Area */}
       {(response || loading || error) && (
         <div className="bg-white dark:bg-slate-950 rounded-lg border border-indigo-50 dark:border-slate-800 p-4 mb-4 min-h-[100px] shadow-sm animate-in fade-in duration-300">
            {loading ? (
                <div className="flex items-center gap-3 text-indigo-400 dark:text-indigo-300">
                    <div className="h-2 w-2 bg-indigo-400 dark:bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-indigo-400 dark:bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-indigo-400 dark:bg-indigo-300 rounded-full animate-bounce"></div>
                    <span className="text-sm font-medium">Analyzing ledger...</span>
                </div>
            ) : error ? (
                <div className="flex items-start gap-2 text-red-500 text-sm">
                   {error.includes("offline") && <WifiOff size={16} className="mt-0.5" />}
                   <p>{error}</p>
                </div>
            ) : (
                <div className="prose prose-indigo prose-sm max-w-none text-slate-700 dark:text-slate-200 leading-relaxed">
                   {/* Simple rendering of text, preserving newlines */}
                   {response.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
                </div>
            )}
         </div>
       )}

       {/* Input Area */}
       <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={hasKey ? "Ask about your spending..." : "API Key Required for AI features"}
            disabled={!hasKey || loading}
            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-950 border border-indigo-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition placeholder-indigo-200 dark:placeholder-slate-600 text-indigo-900 dark:text-indigo-100 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400"
          />
          <button
            type="submit"
            disabled={!hasKey || loading || !query.trim()}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed transition shadow-sm"
          >
            <Send size={18} />
          </button>
       </form>
       {!hasKey && (
           <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
               Configure <code>process.env.API_KEY</code> to enable AI features.
           </p>
       )}
    </div>
  );
};
