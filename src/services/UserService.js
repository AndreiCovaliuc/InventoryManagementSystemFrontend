import { API_BASE_URL } from '../config';
import axios from 'axios';
import authHeader from './AuthHeader';

const API_URL = `${API_BASE_URL}/api/admin/users/`;

class UserService {
  getAllUsers() {
    return axios.get(API_URL, { headers: authHeader() });
  }

  getUserById(id) {
    return axios.get(API_URL + id, { headers: authHeader() });
  }

  createUser(user) {
    return axios.post(API_URL, user, { headers: authHeader() });
  }

  updateUser(id, user) {
    return axios.put(API_URL + id, user, { headers: authHeader() });
  }

  deleteUser(id) {
    return axios.delete(API_URL + id, { headers: authHeader() });
  }
}

export default new UserService();