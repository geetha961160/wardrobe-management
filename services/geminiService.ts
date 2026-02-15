
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Season, Garment } from "../types";

const API_KEY = process.env.API_KEY || '';

export const analyzeGarment = async (base64Image: string): Promise<Partial<Garment>> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-2.5-flash-image';

  const prompt = `Analyze this piece of clothing. Identify the following details and return them as JSON:
  - category: One of [Tops, Bottoms, Outerwear, Dresses, Shoes, Accessories, Other]
  - name: A short descriptive name (e.g., "Navy Wool Sweater")
  - color: The primary color
  - season: The most appropriate season [Spring, Summer, Autumn, Winter, All Seasons]
  - notes: A brief description of the style/material`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            name: { type: Type.STRING },
            color: { type: Type.STRING },
            season: { type: Type.STRING },
            notes: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error analyzing garment:", error);
    throw error;
  }
};

export const getStylingAdvice = async (wardrobe: Garment[], occasion: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-3-flash-preview';

  const wardrobeContext = wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n');

  const prompt = `I am a world-class fashion stylist. 
  Here is my user's wardrobe:
  ${wardrobeContext}

  User wants styling advice for this occasion: "${occasion}"

  Please provide a sophisticated, encouraging styling recommendation. 
  Focus on coordination, color theory, and silhouettes. Use a helpful and elegant tone.
  Keep it concise and practical. Use Markdown for formatting.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "I couldn't generate advice right now. Try being more specific about the occasion!";
  } catch (error) {
    console.error("Error getting styling advice:", error);
    throw error;
  }
};
