import OpenAIApi from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_API_KEY
});

export async function checkMessageContent(message) {
  try {
    // Define the message to be passed to the OpenAI API
    const promptMessage = `Please analyze the following message for any offensive language, explicit sexual content, harmful language, or inappropriate material. If any such content is found, flag the message as "inappropriate". If the message is clean and suitable for children, respond with "safe."
    
    Message: "${message}"`;

    // Call the OpenAI API using the correct method
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: promptMessage }
      ],
      max_tokens: 10,
      n: 1,
      temperature: 0.3,
    });

    // Extract the message content correctly from the response
    const responseContent = response.choices[0].message.content.trim();
    console.log('API response:', responseContent); 

    // Return true if the response indicates the message is safe, otherwise false
    if (responseContent.toLowerCase() === 'safe') {
      return 1;
    } else if (responseContent.toLowerCase() === 'inappropriate') {
      return 0;
    } else {
      console.error('Unexpected response:', responseContent);
      return 0;
    }
  } catch (error) {
    console.error('Error checking message content:', error);
    return 0; // Consider messages harmful if there's an error
  }
}
