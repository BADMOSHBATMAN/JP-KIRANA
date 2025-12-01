
import React from 'react';
import { Bot, UserCircle, WifiOff, Moon, Sun, Lock, Settings, Cloud, CloudOff, RefreshCw } from 'lucide-react';

interface HeaderProps {
  userId?: string;
  userName?: string;
  onToggleAI: () => void;
  aiActive: boolean;
  isOnline: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLock: () => void;
  onOpenSettings: () => void;
  syncStatus: 'synced' | 'syncing' | 'local';
}

export const Header: React.FC<HeaderProps> = ({ 
  userId, 
  userName,
  onToggleAI, 
  aiActive, 
  isOnline, 
  theme, 
  onToggleTheme, 
  onLock, 
  onOpenSettings,
  syncStatus
}) => {
  return (
    <header className="flex flex-col gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* Auspicious Text */}
      <div className="w-full text-center pt-2 -mb-2">
        <h1 className="text-lg md:text-xl font-serif font-bold text-orange-600 dark:text-orange-500 tracking-[0.2em] drop-shadow-sm opacity-90">
          || SHREE GANESH ||
        </h1>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Custom JPG Logo (SVG Recreation) */}
          <div className="h-14 w-14 shrink-0 drop-shadow-md hover:scale-105 transition-transform duration-300">
             <svg viewBox="0 0 120 100" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoRed" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#B91C1C" />
                  </linearGradient>
                </defs>
                {/* Red Background Shape */}
                <path d="M5 5 H115 V60 Q60 105 5 60 Z" fill="url(#logoRed)" stroke="#B91C1C" strokeWidth="2" />
                {/* Yellow Swoosh */}
                <path d="M10 70 Q60 110 110 70" stroke="#FBBF24" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.9" />
                {/* JPG Text */}
                <text x="60" y="52" textAnchor="middle" fontSize="42" fontWeight="900" fontFamily="sans-serif" fill="white" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>JPG</text>
             </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="text-teal-600 dark:text-teal-400">J.P. KIRANA</span> LEDGER
              {/* Sync Status Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 ml-2 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                 {syncStatus === 'syncing' && (
                   <>
                     <RefreshCw size={10} className="animate-spin text-indigo-500" /> Syncing...
                   </>
                 )}
                 {syncStatus === 'synced' && (
                   <>
                     <Cloud size={10} className="text-teal-500" /> Synced
                   </>
                 )}
                 {syncStatus === 'local' && (
                   <>
                     <CloudOff size={10} className="text-amber-500" /> Local
                   </>
                 )}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase flex items-center gap-2">
              Daily Cash Flow System
              {!isOnline && (
                  <span className="inline-flex items-center gap-1 text-[9px] text-red-500 font-bold">
                      <WifiOff size={10} /> OFFLINE
                  </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-end">
          {userId && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm transition-colors duration-300">
                  <UserCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300 max-w-[100px] truncate">
                      {userName || userId.substring(0,8)}
                  </span>
              </div>
          )}
          
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
              <button
              onClick={onToggleTheme}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 transition-all duration-200"
              title="Toggle Dark Mode"
              >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <button
              onClick={onOpenSettings}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400 transition-all duration-200"
              title="Settings & Sync"
              >
              <Settings size={18} />
              </button>
              
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <button
              onClick={onLock}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-red-400 transition-all duration-200"
              title="Lock App"
              >
              <Lock size={18} />
              </button>
          </div>

          <button
            onClick={onToggleAI}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${aiActive 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none ring-2 ring-indigo-100 dark:ring-indigo-900 ring-offset-2 dark:ring-offset-slate-950' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-700'
              }
            `}
          >
            <Bot size={18} className={aiActive ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
