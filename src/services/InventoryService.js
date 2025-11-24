import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/inventory';

const InventoryService = {
  // Get all inventory items
  getAllInventory() {
    return axios.get(BASE_URL);
  },

  // Get inventory by product ID
  getInventoryByProduct(productId) {
    return axios.get(`${BASE_URL}/product/${productId}`);
  },

  // Get low stock items
  getLowStockItems() {
    return axios.get(`${BASE_URL}/low-stock`);
  },

  // Check stock availability for a specific quantity
  checkStock(productId, quantity) {
    return axios.get(`${BASE_URL}/check-stock/${productId}`, {
      params: { quantity }
    });
  },

  // Update inventory quantity
  updateQuantity(productId, quantityChange) {
    return axios.put(`${BASE_URL}/update-quantity/${productId}`, {
      quantityChange
    });
  },

  // Create a new inventory entry
  createInventory(inventoryData) {
    return axios.post(BASE_URL, inventoryData);
  },

  // Update an existing inventory entry
  updateInventory(id, inventoryData) {
    return axios.put(`${BASE_URL}/${id}`, inventoryData);
  },

  // Delete an inventory entry
  deleteInventory(id) {
    return axios.delete(`${BASE_URL}/${id}`);
  }
};

export default InventoryService;