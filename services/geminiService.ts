import { GoogleGenAI, Type } from "@google/genai";
import { Column } from "../types";

export const parseProjectDataWithAI = async (
  inputText: string, 
  currentColumns: Column[]
): Promise<Record<string, any>> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Mocking response for demo or failing gracefully.");
    throw new Error("Missing API Key");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Dynamically build schema based on current columns
  const properties: Record<string, any> = {};
  const requiredFields: string[] = [];

  currentColumns.forEach(col => {
    properties[col.key] = {
      type: col.type === 'number' ? Type.NUMBER : Type.STRING,
      description: col.label,
    };
    // Let's not make them strictly required in the schema to allow partial matches, 
    // but the prompt will encourage filling them.
  });

  const prompt = `
    You are an engineering project data entry assistant. 
    Analyze the following unstructured text and extract data into a JSON object matching the provided schema.
    
    The text contains information about an engineering project. 
    Map the text content to the closest matching field based on the field description (label).
    
    Text to parse:
    """
    ${inputText}
    """
    
    If a field is not found in the text, leave it null or empty.
    For numbers, strip units (like km, m, m^2) and return just the number.
    For dates, return in YYYY-MM-DD format if possible.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: properties,
          propertyOrdering: currentColumns.map(c => c.key),
        },
      },
    });

    const text = response.text;
    if (!text) return {};
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Parsing Error:", error);
    throw error;
  }
};