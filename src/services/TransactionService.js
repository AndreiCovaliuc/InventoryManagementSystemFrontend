import axios from 'axios';
import authHeader from './AuthHeader';

const API_URL = 'http://localhost:8080/api/';

class TransactionService {
  getAllTransactions() {
    return axios.get(API_URL + 'transactions', { headers: authHeader() });
  }

  getTransactionById(id) {
    return axios.get(API_URL + 'transactions/' + id, { headers: authHeader() });
  }

  createTransaction(transaction) {
    return axios.post(API_URL + 'transactions', transaction, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      } 
    });
  }

  updateTransaction(id, transaction) {
    return axios.put(API_URL + 'transactions/' + id, transaction, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      }
    });
  }

  deleteTransaction(id) {
    return axios.delete(API_URL + 'transactions/' + id, { 
      headers: authHeader() 
    });
  }

  getTransactionsByType(type) {
    return axios.get(API_URL + 'transactions/type/' + type, { headers: authHeader() });
  }

  getTransactionsByDateRange(startDate, endDate) {
    return axios.get(API_URL + 'transactions/date-range', { 
      headers: authHeader(),
      params: { startDate, endDate }
    });
  }

  getTransactionsByProduct(productId) {
    return axios.get(API_URL + 'transactions/product/' + productId, { headers: authHeader() });
  }
}

export default new TransactionService();