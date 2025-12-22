import { GoogleGenAI } from "@google/genai";
import { UploadedFile } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSmartMessage = async (files: UploadedFile[], senderName: string): Promise<string> => {
  try {
    const parts: any[] = [];
    
    // Add text prompt
    const prompt = `
      I am ${senderName || 'a user'}. I am sending these files to someone via a file transfer service.
      Based on the images provided (if any) and the file names, write a short, professional, and friendly email message describing what I am sending.
      Keep it under 50 words. Do not include a subject line.
      
      Files: ${files.map(f => f.name).join(', ')}.
    `;
    parts.push({ text: prompt });

    // Add image parts (limit to first 3 images to save bandwidth/tokens for this demo)
    const imageFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 3);
    for (const fileObj of imageFiles) {
      if (fileObj.data) {
        // fileObj.data is a Data URL (e.g., "data:image/png;base64,..."). 
        // We need to extract just the base64 part.
        const base64Data = fileObj.data.split(',')[1];
        if (base64Data) {
            parts.push({
                inlineData: {
                  data: base64Data,
                  mimeType: fileObj.type,
                },
              });
        }
      }
    }

    // Use gemini-2.5-flash-image for multimodal capabilities
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
    });

    return response.text || "Here are the files I promised.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Here are the files you requested.";
  }
};