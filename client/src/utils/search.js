import axios from 'axios';

export const performSearch = async (query, chatId) => {
  try {
    const response = await axios.get(`http://localhost:3001/search`, {
      params: { query, chatId },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

