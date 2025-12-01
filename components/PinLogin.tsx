
import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PinLoginProps {
  onUnlock: () => void;
}

export const PinLogin: React.FC<PinLoginProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [error, setError] = useState('');
  const [storedPin, setStoredPin] = useState<string | null>(null);

  useEffect(() => {
    const existingPin = localStorage.getItem('jp_kirana_app_pin');
    if (existingPin) {
      setStoredPin(existingPin);
      setIsSetupMode(false);
    } else {
      setIsSetupMode(true);
    }
  }, []);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and max 6 digits
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setError('');
    
    if (isSetupMode && confirmPin) {
        // If editing primary pin during setup, clear confirm
        if (confirmPin.length > 0) setConfirmPin('');
    }
    
    setPin(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSetupMode) {
      if (pin.length < 4) {
        setError('PIN must be at least 4 digits');
        return;
      }
      if (!confirmPin) {
        // Move to confirmation step logic if implemented, 
        // but here we rely on the second input field being filled
        setError('Please confirm your PIN');
        return;
      }
      if (pin !== confirmPin) {
        setError('PINs do not match');
        return;
      }
      
      // Save PIN
      localStorage.setItem('jp_kirana_app_pin', pin);
      onUnlock();
    } else {
      // Login Mode
      if (pin === storedPin) {
        onUnlock();
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    }
  };

  const handleReset = () => {
      if(window.confirm("WARNING: This will reset your PIN. If you have local data that isn't synced, you might lose access if we implement encryption later. For now, it just resets the lock. Continue?")) {
          localStorage.removeItem('jp_kirana_app_pin');
          setIsSetupMode(true);
          setPin('');
          setConfirmPin('');
          setError('');
          setStoredPin(null);
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        
        <div className="text-center mb-8">
          <div className="mx-auto bg-teal-100 dark:bg-teal-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            {isSetupMode ? (
              <ShieldCheck className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            ) : (
              <Lock className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isSetupMode ? 'Set Ledger PIN' : 'Unlock Ledger'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            {isSetupMode 
              ? 'Create a numeric PIN to secure your daily transactions.' 
              : 'Enter your PIN to access your dashboard.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">
              {isSetupMode ? 'Enter New PIN' : 'Enter PIN'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={handlePinChange}
              className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-teal-500 focus:ring-0 outline-none transition-colors text-slate-800 dark:text-slate-100 placeholder-slate-300"
              placeholder="••••"
              autoFocus
            />
          </div>

          {isSetupMode && (
             <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 ml-1 uppercase tracking-wider">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-teal-500 focus:ring-0 outline-none transition-colors text-slate-800 dark:text-slate-100 placeholder-slate-300"
                  placeholder="••••"
                />
             </div>
          )}

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-medium animate-pulse">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-200 dark:shadow-none transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isSetupMode ? 'Set PIN & Continue' : 'Unlock'}
            <ArrowRight size={20} />
          </button>
        </form>

        {!isSetupMode && (
            <button 
                onClick={handleReset}
                className="w-full mt-6 text-xs text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
            >
                Forgot PIN? Reset App Lock
            </button>
        )}
      </div>
    </div>
  );
};
