export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  income: number;
  expense: number;
  timestamp?: any; // Firestore timestamp
}

export interface TransactionInput {
  date: string;
  description: string;
  income: number;
  expense: number;
}

export enum CollectionNames {
  DailyFinances = 'daily_finances'
}

// Augment window to support the injected variables from the provided legacy HTML environment
declare global {
  interface Window {
    __app_id?: string;
    __firebase_config?: string;
    __initial_auth_token?: string;
  }
}