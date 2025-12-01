
import React, { useState, useEffect } from 'react';
import { X, Lock, Users, Smartphone, RefreshCw, KeyRound, Save, AlertCircle, Cloud, ArrowUp, User } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  userId?: string;
  userName?: string;
  onUpdateUserName?: (name: string) => void;
  currentLedgerId?: string;
  onManualSync?: () => Promise<void>;
  isOnline?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    onClose, 
    userId, 
    userName, 
    onUpdateUserName,
    currentLedgerId, 
    onManualSync, 
    isOnline 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sync'>('profile');
  
  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // Security State
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [securityMsg, setSecurityMsg] = useState({ text: '', type: '' });

  // Sync State
  const [linkId, setLinkId] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const storedLink = localStorage.getItem('jp_kirana_linked_ledger_id');
    if (storedLink) setIsLinked(true);
    if (userName) setDisplayName(userName);
  }, [userName]);

  // --- HANDLERS ---

  const handleUpdateProfile = (e: React.FormEvent) => {
      e.preventDefault();
      if(onUpdateUserName) {
          onUpdateUserName(displayName);
          setProfileMsg({ text: 'Profile name updated!', type: 'success' });
          setTimeout(() => setProfileMsg({ text: '', type: '' }), 3000);
      }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg({ text: '', type: '' });

    const storedPin = localStorage.getItem('jp_kirana_app_pin');
    
    // Validate Old PIN
    if (storedPin && oldPin !== storedPin) {
        setSecurityMsg({ text: 'Incorrect current PIN', type: 'error' });
        return;
    }

    // Validate New PIN
    if (newPin.length < 4) {
        setSecurityMsg({ text: 'New PIN must be at least 4 digits', type: 'error' });
        return;
    }

    if (newPin !== confirmPin) {
        setSecurityMsg({ text: 'New PINs do not match', type: 'error' });
        return;
    }

    localStorage.setItem('jp_kirana_app_pin', newPin);
    setSecurityMsg({ text: 'PIN updated successfully!', type: 'success' });
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleLinkLedger = (e: React.FormEvent) => {
      e.preventDefault();
      if (!linkId.trim()) return;

      if (window.confirm(`Are you sure you want to sync with Ledger ID: ${linkId}? This will replace your current view.`)) {
          localStorage.setItem('jp_kirana_linked_ledger_id', linkId.trim());
          window.location.reload(); // Reload to refresh firebase hooks
      }
  };

  const handleUnlink = () => {
      if (window.confirm("Disconnect from linked ledger and return to your own private ledger?")) {
          localStorage.removeItem('jp_kirana_linked_ledger_id');
          window.location.reload();
      }
  };

  const handleSyncClick = async () => {
      if (!onManualSync) return;
      setSyncing(true);
      await onManualSync();
      // Artificial delay for feedback if sync was too fast
      setTimeout(() => setSyncing(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
             <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
                ${activeTab === 'profile' ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900' : 'text-slate-500 bg-slate-50/50 dark:bg-slate-950/30 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'}
                `}
            >
                <User size={16} />
                Profile
                {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
                ${activeTab === 'security' ? 'text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900' : 'text-slate-500 bg-slate-50/50 dark:bg-slate-950/30 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'}
                `}
            >
                <Lock size={16} />
                Security
                {activeTab === 'security' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('sync')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
                ${activeTab === 'sync' ? 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900' : 'text-slate-500 bg-slate-50/50 dark:bg-slate-950/30 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'}
                `}
            >
                <Users size={16} />
                Sync
                {activeTab === 'sync' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
                 <form onSubmit={handleUpdateProfile} className="space-y-4">
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex items-start gap-3">
                        <User className="text-blue-600 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">Store Profile</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Set a display name for your store or yourself (e.g. "Dad's Shop", "Rahul").
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Display Name</label>
                        <input 
                            type="text" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                            placeholder="Enter name..."
                        />
                    </div>

                    {profileMsg.text && (
                        <p className={`text-sm font-medium ${profileMsg.type === 'error' ? 'text-red-500' : 'text-green-600'} flex items-center gap-1`}>
                           {profileMsg.text}
                        </p>
                    )}

                    <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
                        <Save size={18} /> Save Profile
                    </button>
                 </form>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
                <form onSubmit={handleChangePin} className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex items-start gap-3">
                        <KeyRound className="text-teal-600 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">Change Access PIN</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Update the PIN used to unlock this app on this device.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Current PIN</label>
                            <input 
                                type="password" 
                                inputMode="numeric"
                                value={oldPin}
                                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                                placeholder="Enter current PIN"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">New PIN</label>
                            <input 
                                type="password" 
                                inputMode="numeric"
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                                placeholder="Enter new PIN"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Confirm New PIN</label>
                            <input 
                                type="password" 
                                inputMode="numeric"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                                placeholder="Repeat new PIN"
                            />
                        </div>
                    </div>

                    {securityMsg.text && (
                        <p className={`text-sm font-medium ${securityMsg.type === 'error' ? 'text-red-500' : 'text-green-600'} flex items-center gap-1`}>
                           {securityMsg.type === 'error' && <AlertCircle size={14} />} 
                           {securityMsg.text}
                        </p>
                    )}

                    <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2">
                        <Save size={18} /> Update PIN
                    </button>
                </form>
            )}

            {/* SYNC TAB */}
            {activeTab === 'sync' && (
                <div className="space-y-6">
                    {/* Manual Sync Control */}
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 p-4 rounded-lg border border-teal-100 dark:border-teal-900/30">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                               <Cloud className="text-teal-600 dark:text-teal-400" size={20} />
                               <h3 className="font-semibold text-slate-800 dark:text-slate-100">Cloud Status</h3>
                           </div>
                           <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${isOnline ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                               {isOnline ? 'Online' : 'Offline'}
                           </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                            Ensure your local data is safely backed up to the cloud.
                        </p>
                        <button 
                            onClick={handleSyncClick}
                            disabled={!isOnline || syncing}
                            className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {syncing ? (
                                <><RefreshCw size={16} className="animate-spin" /> Syncing Data...</>
                            ) : (
                                <><ArrowUp size={16} /> Sync Local Data Now</>
                            )}
                        </button>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900">
                        <div className="flex items-center gap-2 mb-2">
                            <Smartphone className="text-indigo-600 dark:text-indigo-400" size={20} />
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Your Ledger ID</h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                            Share this ID with family members to let them view and add to your ledger.
                        </p>
                        <div className="bg-white dark:bg-slate-950 p-3 rounded border border-indigo-200 dark:border-indigo-800 font-mono text-center text-lg font-bold text-slate-700 dark:text-indigo-300 select-all tracking-wider">
                            {userId || "Offline User"}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
                            <RefreshCw size={18} className="text-slate-400" />
                            Link Another Ledger
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            Enter a family member's Ledger ID below to sync with their device.
                        </p>

                        {isLinked ? (
                             <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-900/30 text-center">
                                 <p className="text-green-700 dark:text-green-400 font-medium text-sm mb-2">
                                     Currently synced to external ledger
                                 </p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-4 break-all">
                                     {currentLedgerId}
                                 </p>
                                 <button 
                                    onClick={handleUnlink}
                                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-red-500 text-sm font-medium rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                 >
                                     Disconnect (Use My Own)
                                 </button>
                             </div>
                        ) : (
                            <form onSubmit={handleLinkLedger} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={linkId}
                                    onChange={(e) => setLinkId(e.target.value)}
                                    placeholder="Paste Ledger ID here..."
                                    className="flex-1 p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button type="submit" className="px-4 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition">
                                    Link
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
