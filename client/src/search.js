import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseInit';

export const performSearch = async (query, chatId) => {
  try {
    const searchMessages = httpsCallable(functions, 'searchMessages');
    const result = await searchMessages({ query, chatId });
    return result.data;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

