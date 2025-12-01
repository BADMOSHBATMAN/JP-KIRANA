import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  User, 
  Auth,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  Firestore,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, TransactionInput, CollectionNames } from '../types';

// --- CONFIGURATION ---
const getFirebaseConfig = () => {
  // 1. Check for Environment Variables
  if (process.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID
    };
  }

  // 2. Fallback to Window injection (Legacy/HTML only)
  if (typeof window !== 'undefined' && window.__firebase_config) {
    try {
      return JSON.parse(window.__firebase_config);
    } catch (e) {
      console.error("Failed to parse firebase config from window", e);
    }
  }
  
  return null;
};

const getAppId = () => {
  if (process.env.VITE_APP_NAME) {
      return process.env.VITE_APP_NAME;
  }
  if (typeof window !== 'undefined' && window.__app_id) {
    return window.__app_id;
  }
  return 'default-app-id';
};

// --- INITIALIZATION ---
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  const config = getFirebaseConfig();
  if (config) {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);

    enableIndexedDbPersistence(db).catch((err) => {
      // Code implemented means it's likely already enabled in another tab, which is fine
      if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
          console.warn('Firestore persistence warning:', err.code);
      }
    });
  } else {
    console.warn("Firebase config missing. App will run in Local Mode.");
  }
} catch (e) {
  console.error("Firebase Initialization Error:", e);
}

// Path helper
const getCollectionPath = (uid: string) => `artifacts/${getAppId()}/users/${uid}/${CollectionNames.DailyFinances}`;

// --- SYNC HELPERS ---

export const isCloudAvailable = () => {
    return !!auth && !!db;
};

export const syncLocalDataToFirestore = async (user: User, ledgerId: string): Promise<number> => {
    if (!db || !user || !ledgerId || (user.isAnonymous && (user.uid === 'local-user' || user.uid === 'offline-user'))) {
        return 0;
    }

    const localDataStr = localStorage.getItem('jp_kirana_local_transactions');
    if (!localDataStr) return 0;

    let localTransactions: Transaction[] = [];
    try {
        localTransactions = JSON.parse(localDataStr);
    } catch (e) { 
        return 0; 
    }

    if (localTransactions.length === 0) return 0;

    const itemsToSync = localTransactions.filter(t => t.id.startsWith('local_'));
    
    if (itemsToSync.length === 0) return 0;

    const colRef = collection(db, getCollectionPath(ledgerId));
    
    const promises = itemsToSync.map(async (t) => {
        const { id, ...data } = t;
        const cleanData = {
            date: data.date,
            description: data.description,
            income: Number(data.income),
            expense: Number(data.expense),
            timestamp: serverTimestamp()
        };
        await addDoc(colRef, cleanData);
    });

    await Promise.all(promises);

    localStorage.removeItem('jp_kirana_local_transactions');
    
    return itemsToSync.length;
};

// --- HOOKS ---

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!auth) {
      setUser({ uid: 'local-user', isAnonymous: true } as User);
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    if (!auth) {
      if (!user) {
        setUser({ uid: 'local-user', isAnonymous: true } as User);
      }
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.__initial_auth_token) {
        await signInWithCustomToken(auth, window.__initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    } catch (e) {
      console.error("Sign in failed, falling back to local user", e);
      setUser({ uid: 'offline-user', isAnonymous: true } as User);
    }
  }, [user]);

  return { user, isAuthReady, signIn };
};

export const useTransactions = (user: User | null) => {
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [ledgerId, setLedgerId] = useState<string | null>(null);

  const loadLocalTransactions = (): Transaction[] => {
    try {
      const stored = localStorage.getItem('jp_kirana_local_transactions');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Local load error", e);
      return [];
    }
  };

  const saveLocalTransactions = (txs: Transaction[]) => {
    try {
      localStorage.setItem('jp_kirana_local_transactions', JSON.stringify(txs));
    } catch (e) {
      console.error("Local save error", e);
    }
  };

  useEffect(() => {
    if (!user) {
      setRawTransactions([]);
      return;
    }

    const linkedId = localStorage.getItem('jp_kirana_linked_ledger_id');
    const activeLedgerId = linkedId || user.uid;
    setLedgerId(activeLedgerId);

    setLoading(true);

    if (db && user.uid !== 'local-user' && user.uid !== 'offline-user') {
      const colRef = collection(db, getCollectionPath(activeLedgerId));
      const q = query(colRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: Transaction[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          data.push({
            id: doc.id,
            date: d.date,
            description: d.description,
            income: d.income,
            expense: d.expense,
            timestamp: d.timestamp
          });
        });

        data.sort((a, b) => {
          if (a.date > b.date) return -1;
          if (a.date < b.date) return 1;
          const aSec = a.timestamp?.seconds || 0;
          const bSec = b.timestamp?.seconds || 0;
          return bSec - aSec;
        });

        setRawTransactions(data);
        setLoading(false);
      }, (err) => {
        console.error("Firestore Error, switching to local view:", err);
        const localData = loadLocalTransactions();
        localData.sort((a, b) => a.date > b.date ? -1 : 1);
        setRawTransactions(localData);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      const localData = loadLocalTransactions();
      localData.sort((a, b) => a.date > b.date ? -1 : 1);
      setRawTransactions(localData);
      setLoading(false);
    }
  }, [user]);

  const transactions = useMemo(() => {
    return rawTransactions.filter(t => !deletedIds.has(t.id));
  }, [rawTransactions, deletedIds]);

  const addTransaction = async (input: TransactionInput) => {
    if (!user || !ledgerId) return;

    if (db && user.uid !== 'local-user' && user.uid !== 'offline-user') {
      try {
        const colRef = collection(db, getCollectionPath(ledgerId));
        await addDoc(colRef, {
          ...input,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.error("Add Transaction Error:", e);
        throw e;
      }
    } else {
      const newTx: Transaction = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...input,
        timestamp: { seconds: Date.now() / 1000 }
      };
      const updated = [newTx, ...rawTransactions];
      updated.sort((a, b) => a.date > b.date ? -1 : 1);
      setRawTransactions(updated);
      saveLocalTransactions(updated);
    }
  };

  const deleteTransaction = async (id: string) => {
    setDeletedIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
    });

    const isLocal = id.startsWith('local_') || !db || user?.uid === 'local-user' || user?.uid === 'offline-user';

    if (isLocal) {
        const updatedLocal = rawTransactions.filter(t => t.id !== id);
        setRawTransactions(updatedLocal);
        saveLocalTransactions(updatedLocal);
        return;
    }

    if (db && user && ledgerId) {
      try {
        const docRef = doc(db, getCollectionPath(ledgerId), id);
        await deleteDoc(docRef);
      } catch (e) {
        console.error("Cloud Delete Failed:", e);
      }
    }
  };

  return { transactions, addTransaction, deleteTransaction, loading, ledgerId };
};