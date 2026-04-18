import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface RecipeIngredient {
  name: string;
  have: boolean; // True if identified in fridge, false if missing
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prepTime: number;
  calories: number;
  dietaryLabels: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
}

export async function analyzeFridge(
  imageBase64: string,
  mimeType: string,
  dietaryPreferences: string[]
): Promise<Recipe[]> {
  const prompt = `Analyze this image of an open fridge/pantry. 
Identify the visible ingredients. 
Then, suggest 4-5 creative recipes that primarily use these ingredients.
${dietaryPreferences.length > 0 ? `The recipes MUST adhere to these dietary restrictions: ${dietaryPreferences.join(", ")}.` : ""}
For each recipe, indicate which ingredients are present in the image and which essential ingredients are missing.
Return the result strictly as a JSON array matching the requested schema.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: {
              type: Type.STRING,
              description: "Must be 'Easy', 'Medium', or 'Hard'",
            },
            prepTime: { type: Type.NUMBER, description: "Prep time in minutes" },
            calories: { type: Type.NUMBER },
            dietaryLabels: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "E.g., Vegetarian, Keto, Gluten-Free, Vegan, etc.",
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  have: {
                    type: Type.BOOLEAN,
                    description: "True if seen in the image, false if missing",
                  },
                },
                required: ["name", "have"],
              },
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step cooking instructions",
            },
          },
          required: [
            "id",
            "title",
            "description",
            "difficulty",
            "prepTime",
            "calories",
            "dietaryLabels",
            "ingredients",
            "steps",
          ],
        },
      },
    },
  });

  const text = response.text?.trim() || "[]";
  try {
    return JSON.parse(text) as Recipe[];
  } catch (e) {
    console.error("Failed to parse recipes JSON", e);
    return [];
  }
}
