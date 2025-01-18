import OpenAIApi from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_API_KEY
});

export async function checkMessageContent(message) {
    try {
      // Call the OpenAI API using the correct method
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', 
            content: 
            `You are an assistant that helps check for harmful or inappropriate content in messages (e.g., curses, offensive words, sexual content).
            Please classify the following message as harmful or safe:
            
            "${message}"
            
            Respond with "safe" if the message is not harmful and "harmful" if it is.`
          }
        ],
        max_tokens: 10,
        n: 1,
        temperature: 0,
      });

      // Extract and trim the content of the response
      const responseContent = response.choices[0].message['content'].trim();
      console.log('API response:', responseContent); 

      // Return true if the response indicates the message is safe, otherwise false
      return responseContent === 'safe';


    } catch (error) {
      console.error('Error checking message content:', error);
      return false; // Consider messages harmful if there's an error
    }
  }