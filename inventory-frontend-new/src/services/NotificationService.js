import axios from 'axios';
import authHeader from './AuthHeader';

const API_URL = 'http://localhost:8080/api/notifications';

class NotificationService {
  getUserNotifications() {
    return axios.get(API_URL, { headers: authHeader() })
      .catch(err => {
        console.error('Error fetching notifications:', err);
        return { data: [] };
      });
  }

  getUnreadNotifications() {
    return axios.get(API_URL + '/unread', { headers: authHeader() })
      .catch(err => {
        console.error('Error fetching unread notifications:', err);
        return { data: [] };
      });
  }

  getUnreadCount() {
    return axios.get(API_URL + '/count-unread', { headers: authHeader() })
      .catch(err => {
        console.error('Error fetching unread count:', err);
        return { data: { count: 0 } };
      });
  }

  markAsRead(id) {
    return axios.put(`${API_URL}/${id}/mark-read`, {}, { headers: authHeader() })
      .catch(err => {
        console.error('Error marking notification as read:', err);
        throw err; // Re-throw for UI to handle
      });
  }

  markAllAsRead() {
    return axios.put(API_URL + '/mark-all-read', {}, { headers: authHeader() })
      .catch(err => {
        console.error('Error marking all notifications as read:', err);
        throw err;
      });
  }

  deleteNotification(id) {
    return axios.delete(`${API_URL}/${id}`, { headers: authHeader() })
      .catch(err => {
        console.error('Error deleting notification:', err);
        throw err;
      });
  }
}

export default new NotificationService();