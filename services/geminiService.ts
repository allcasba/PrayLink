
import { GoogleGenAI } from "@google/genai";
import { Religion, Language } from '../types';

const getAI = () => {
  // Intentar obtener la clave de diferentes fuentes posibles
  const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
  if (!apiKey) {
    console.warn("PrayLink: API_KEY no configurada. Las funciones de IA estarán limitadas.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateDailyWisdom = async (religion: Religion, language: Language): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "La fe ilumina el camino.";
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Proporciona una reflexión corta, inspiradora y universal (máximo 30 palabras) inspirada en la fe ${religion}. El texto debe estar en ${language}. No incluyas comillas.`,
    });

    return response.text || "La paz sea contigo.";
  } catch (error) {
    console.error("Error generating wisdom:", error);
    return "Encuentra la paz en el momento presente.";
  }
};

export const getDailyInspiration = async (religion: Religion, language: Language): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "Que tu luz brille hoy.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Proporciona un mensaje diario motivador o verso de las tradiciones de ${religion} para hoy. Debe estar en ${language}. Conciso (menos de 50 palabras). Formato: "Mensaje/Verso" - Referencia.`,
    });

    return response.text?.trim() || "Que tu fe te guíe hoy.";
  } catch (error) {
    console.error("Error generating daily inspiration:", error);
    return "Deja que tu luz brille hoy.";
  }
};

export const translateText = async (text: string, targetLanguage: Language): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return text;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Traduce el siguiente texto al idioma ${targetLanguage}. Mantén el tono espiritual. Retorna SOLO el texto traducido: "${text}"`,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

export const chatWithSpiritualGuide = async (
  message: string, 
  religion: Religion, 
  language: Language,
  history: {role: 'user' | 'model', text: string}[]
): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "Estoy teniendo problemas para conectar con el plano espiritual.";

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `Eres un guía espiritual compasivo y sabio de la tradición ${religion}. El usuario habla ${language}. Brinda consuelo y referencias filosóficas. Respuestas de menos de 100 palabras. Sé apoyador y no juzgues.`
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Hablemos más sobre esto.";

  } catch (error) {
    console.error("Spiritual Guide Error:", error);
    return "Tengo problemas para conectar con el plano espiritual ahora mismo.";
  }
};
