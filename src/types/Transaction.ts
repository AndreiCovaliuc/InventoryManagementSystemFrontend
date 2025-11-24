// src/types/Transaction.ts
export interface Transaction {
    id?: number;
    productId: number;
    productName?: string;
    transactionType: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER';
    quantity: number;
    transactionDate?: string;
    unitPrice?: number;
    totalAmount?: number;
    notes?: string;
    userId?: number;
    userName?: string;
    referenceNumber?: string;
  }