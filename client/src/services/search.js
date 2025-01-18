import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const searchMessages = httpsCallable(functions, 'searchMessages');

export const performSearch = async (query, chatId) => {
  try {
    const result = await searchMessages({ query, chatId });
    return result.data;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

