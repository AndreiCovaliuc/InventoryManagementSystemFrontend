import axios from 'axios';
import authHeader from './AuthHeader';

const API_URL = 'http://localhost:8080/api/';

class ProductService {
  getAllProducts() {
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

  getProductsByCategory(categoryId) {
    return axios.get(API_URL + 'products/category/' + categoryId, { headers: authHeader() });
  }

  getProductsBySupplier(supplierId) {
    return axios.get(API_URL + 'products/supplier/' + supplierId, { headers: authHeader() });
  }

  searchProducts(query) {
    return axios.get(API_URL + 'products/search', { 
      headers: authHeader(),
      params: { name: query }
    });
  }

  getProductsByMaxPrice(maxPrice) {
    return axios.get(API_URL + 'products/price', { 
      headers: authHeader(),
      params: { maxPrice }
    });
  }
}

export default new ProductService();