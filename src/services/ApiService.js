import axios from 'axios';
import authHeader from './AuthHeader';

const API_URL = 'http://localhost:8080/api/';

class ApiService {
  // Products
  getProducts() {
    return axios.get(API_URL + 'products', { headers: authHeader() });
  }

  getProductById(id) {
    return axios.get(API_URL + 'products/' + id, { headers: authHeader() });
  }

  createProduct(product) {
    return axios.post(API_URL + 'products', product, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      } 
    });
  }

  updateProduct(id, product) {
    return axios.put(API_URL + 'products/' + id, product, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      }
    });
  }

  deleteProduct(id) {
    return axios.delete(API_URL + 'products/' + id, { 
      headers: authHeader() 
    });
  }

  // Categories
  getCategories() {
    return axios.get(API_URL + 'categories', { headers: authHeader() });
  }

  getCategoryById(id) {
    return axios.get(API_URL + 'categories/' + id, { headers: authHeader() });
  }

  createCategory(category) {
    return axios.post(API_URL + 'categories', category, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      }
    });
  }

  updateCategory(id, category) {
    return axios.put(API_URL + 'categories/' + id, category, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      }
    });
  }

  deleteCategory(id) {
    return axios.delete(API_URL + 'categories/' + id, { headers: authHeader() });
  }

  // Suppliers
  getSuppliers() {
    return axios.get(API_URL + 'suppliers', { headers: authHeader() });
  }

  getSupplierById(id) {
    return axios.get(API_URL + 'suppliers/' + id, { headers: authHeader() });
  }

  createSupplier(supplier) {
    return axios.post(API_URL + 'suppliers', supplier, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      }
    });
  }

  updateSupplier(id, supplier) {
    return axios.put(API_URL + 'suppliers/' + id, supplier, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      }
    });
  }

  deleteSupplier(id) {
    return axios.delete(API_URL + 'suppliers/' + id, { headers: authHeader() });
  }

  // Inventory
  getInventory() {
    return axios.get(API_URL + 'inventory', { headers: authHeader() });
  }

  getInventoryById(id) {
    return axios.get(API_URL + 'inventory/' + id, { headers: authHeader() });
  }

  createInventory(inventory) {
    return axios.post(API_URL + 'inventory', inventory, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      }
    });
  }

  updateInventory(id, inventory) {
    return axios.put(API_URL + 'inventory/' + id, inventory, { 
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      }
    });
  }

  deleteInventory(id) {
    return axios.delete(API_URL + 'inventory/' + id, { headers: authHeader() });
  }

  getLowStockItems() {
    return axios.get(API_URL + 'inventory/low-stock', { headers: authHeader() });
  }
}

export default new ApiService();