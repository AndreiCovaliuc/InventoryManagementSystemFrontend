import axios from 'axios';
import authHeader from './AuthHeader';

const API_URL = 'http://localhost:8080/api/ai/';

class AIService {
  /**
   * Send a question to the AI assistant
   * @param {string} question - The question to ask
   * @returns {Promise} - Response with question, answer, and timestamp
   */
  askQuestion(question) {
    return axios.post(
      API_URL + 'ask',
      { question },
      {
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        }
      }
    );
  }

  /**
   * Check if the AI service is available
   * @returns {Promise} - Health check response
   */
  checkHealth() {
    return axios.get(API_URL + 'health', { headers: authHeader() });
  }
}

const aiServiceInstance = new AIService();
export default aiServiceInstance;
