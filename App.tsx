import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth, useTransactions, syncLocalDataToFirestore } from './services/firebase';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { FinancialChart } from './components/FinancialChart';
import { AIAssistant } from './components/AIAssistant';
import { PinLogin } from './components/PinLogin';
import { SettingsModal } from './components/SettingsModal';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { user, isAuthReady, signIn } = useAuth();
  const { transactions, addTransaction, deleteTransaction, loading: transactionsLoading, ledgerId } = useTransactions(user);
  const [showAI, setShowAI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isOnline, setIsOnline] = useState(true); // Default to true, update in effect
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'local'>('synced');
  
  // App Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // User Name State (Display Name)
  const [userName, setUserName] = useState('');

  // Initial Data Load
  useEffect(() => {
      if (typeof window !== 'undefined') {
          setIsOnline(navigator.onLine);
          setUserName(localStorage.getItem('jp_kirana_user_name') || '');
      }
  }, []);

  const handleUpdateUserName = (name: string) => {
      setUserName(name);
      localStorage.setItem('jp_kirana_user_name', name);
  };
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (storedTheme) {
        setTheme(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }
  }, []);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync Logic
  const triggerSync = useCallback(async () => {
    if (isOnline && user && !user.isAnonymous && ledgerId) {
        setSyncStatus('syncing');
        try {
            await syncLocalDataToFirestore(user, ledgerId);
            setSyncStatus('synced');
        } catch (e) {
            console.error("Sync failed:", e);
            setSyncStatus('local'); 
        }
    } else if (!isOnline) {
        setSyncStatus('local');
    }
  }, [isOnline, user, ledgerId]);

  // Handle Online Transition
  useEffect(() => {
    if (isOnline) {
       if (user?.uid === 'offline-user') {
           signIn();
       }
       triggerSync();
    } else {
        setSyncStatus('local');
    }
  }, [isOnline, user?.uid, signIn, triggerSync]);

  useEffect(() => {
    if (isAuthReady && !user) {
       signIn();
    }
  }, [isAuthReady, user, signIn]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      income += t.income || 0;
      expense += t.expense || 0;
    });
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  if (!isUnlocked) {
    return <PinLogin onUnlock={() => setIsUnlocked(true)} />;
  }

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Initializing Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        <Header 
          userId={user?.uid} 
          userName={userName}
          onToggleAI={() => setShowAI(!showAI)} 
          aiActive={showAI} 
          isOnline={isOnline}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLock={() => setIsUnlocked(false)}
          onOpenSettings={() => setShowSettings(true)}
          syncStatus={syncStatus}
        />

        {showSettings && (
          <SettingsModal 
            onClose={() => setShowSettings(false)} 
            userId={user?.uid}
            userName={userName}
            onUpdateUserName={handleUpdateUserName}
            currentLedgerId={ledgerId || undefined}
            onManualSync={triggerSync}
            isOnline={isOnline}
          />
        )}

        {showAI && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <AIAssistant transactions={transactions} onClose={() => setShowAI(false)} />
          </div>
        )}

        <BalanceCard 
          balance={stats.balance} 
          income={stats.income} 
          expense={stats.expense} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <TransactionForm onAdd={addTransaction} disabled={!user} />
             <TransactionList 
               transactions={transactions} 
               onDelete={deleteTransaction} 
               loading={transactionsLoading}
             />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <FinancialChart transactions={transactions} />
            
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-slate-800 dark:to-slate-950 dark:border dark:border-slate-800 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-indigo-500/20 p-1 rounded">💡</span> 
                Sync & Share
              </h3>
              <p className="text-indigo-100 text-sm leading-relaxed mb-3">
                Want to manage this store with family? Go to Settings ⚙️ and share your Ledger ID, or link their ID here.
              </p>
              {ledgerId && ledgerId !== user?.uid && (
                  <div className="bg-indigo-500/20 border border-indigo-400/30 p-2 rounded text-xs text-indigo-200">
                      Currently viewing Linked Ledger
                  </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;