import axios from 'axios';
import authHeader from './AuthHeader';

const API_URL = 'http://localhost:8080/api/chats';

class ChatService {
  getAvailableUsers() {
    return axios.get(`${API_URL}/users`, { headers: authHeader() })
      .catch(err => {
        console.error('Error fetching available users:', err);
        return { data: [] };
      });
  }

  getAllChats() {
    return axios.get(API_URL, { headers: authHeader() })
      .catch(err => {
        console.error('Error fetching all chats:', err);
        return { data: [] };
      });
  }

  getRecentChats() {
    return axios.get(`${API_URL}/recent`, { headers: authHeader() })
      .catch(err => {
        console.error('Error fetching recent chats:', err);
        return { data: [] };
      });
  }

  getUnreadCount() {
    return axios.get(`${API_URL}/unread-count`, { headers: authHeader() })
      .catch(err => {
        console.error('Error fetching unread count:', err);
        return { data: { count: 0 } };
      });
  }

  getChatInfo(chatId) {
    return axios.get(`${API_URL}/${chatId}`, { headers: authHeader() })
      .catch(err => {
        console.error('Error fetching chat info:', err);
        return { data: null };
      });
  }

  getMessages(chatId) {
    return axios.get(`${API_URL}/${chatId}/messages`, { headers: authHeader() })
      .catch(err => {
        console.error('Error fetching messages:', err);
        return { data: [] };
      });
  }

  sendMessage(chatId, content) {
    return axios.post(
      `${API_URL}/${chatId}/messages`, 
      { content },
      { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
    ).catch(err => {
      console.error('Error sending message:', err);
      throw err;
    });
  }

  markChatAsRead(chatId) {
    return axios.put(
      `${API_URL}/${chatId}/read`,
      {},
      { headers: authHeader() }
    ).catch(err => {
      console.error('Error marking chat as read:', err);
      throw err;
    });
  }

  createChat(userId) {
    return axios.post(
      API_URL,
      { participantId: userId },
      { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
    ).catch(err => {
      console.error('Error creating chat:', err);
      throw err;
    });
  }
}

export default new ChatService();