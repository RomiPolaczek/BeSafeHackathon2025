import OpenAIApi from 'openai';
import dotenv from 'dotenv';
import fs from 'fs'; 
import FormData from 'form-data';
import path from 'path';
import axios from 'axios';
import vision from '@google-cloud/vision';

dotenv.config();

// mock AI
// export async function checkMessageContent(message) {
//   try {
//     if (message == "1") {
//       return 1
//     } else {
//       return 0
//     }
//   } catch (error) {
//     console.error('Error checking message content:', error);
//     return 0; // Consider messages harmful if there's an error
//   }
// }

const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_API_KEY
});

export async function checkContentSafety( input, type ) {
  if (type === 'text') {
    try {
      // Define the message to be passed to the OpenAI API
      const promptMessage = `Please analyze the following message for any offensive language, explicit sexual content, harmful language, or inappropriate material. If any such content is found, flag the message as "inappropriate". If the message is clean and suitable for children, respond with "safe."
  
      Message: "${input.content}"`;
  
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
  
      // Return true if the response indicates the message is safe, otherwise false
      if (responseContent.toLowerCase() === 'safe') {
        console.log('API response:', responseContent);
        return 1;
      } else if (responseContent.toLowerCase() === 'inappropriate') {
        console.log('API response:', responseContent);
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
  else if (type === 'image') {  
    try{
      const url = new URL(input.content); // Parse the URL
      const relativePath = url.pathname.replace(/^\/+/, ''); // Remove leading slashes
      const imagePath = path.resolve(relativePath); // Ensure the path is absolute
      const imageData = fs.readFileSync(imagePath);

      // Convert the binary data to a Base64 string
      const base64Image = imageData.toString('base64');

      // Call the OpenAI API for image moderation
      const response = await openai.moderations.create({
        input: base64Image,
        model: "text-moderation-latest"
      });

      // Creates a client
      const client = new vision.ImageAnnotatorClient();

      // Detects labels in the image file
      async function detectLabels(imagePath) {
        const [result] = await client.labelDetection(imagePath);
        const labels = result.labelAnnotations;
        return labels;
      }

      // Analyze the labels to detect swimsuits or beach-related terms
      async function isSwimsuit(imagePath) {
        const labels = await detectLabels(imagePath);
        const swimsuitKeywords = ['swimsuit', 'bikini', 'beach', 'swimming', 'pool', 'summer', 'water'];
        
        for (let label of labels) {
          if (swimsuitKeywords.includes(label.description.toLowerCase())) {
            return true; // Likely a swimsuit or related image
          }
        }
        return false; // No swimsuit or beach-related content
      }


      const result = response.results[0]; // Access the first moderation result

      const isInappropriate = (result.categories.nudity && result.categories.nudity.score >= 0.5) ||
                          (result.categories.sexual && result.categories.sexual.score >= 0.5);
      console.log('isInappropriate: ',  isInappropriate);

      const isSafe = !Object.values(result.categories).some(category => category.score >= 0.5);
      console.log('isSafe: ',  isSafe);

      const isSwimsuitImage = await isSwimsuit(imagePath); 
      console.log('isSwimsuitImage: ',  isSwimsuitImage);


      if (isInappropriate ||  !isSafe  || isSwimsuitImage) {
        console.log('Image contains nudity or a swimsuit.');
        return 0;  // Image is inappropriate
      } else {
        console.log('Image is safe.');
        return 1;  // Image is safe
      }
  
    } catch (error) {
      console.error('Error checking image content:', error);
      return 0; // Consider images harmful if there's an error
    }
  }
}


