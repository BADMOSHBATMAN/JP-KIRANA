import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const analyzeFinances = async (transactions: Transaction[], userQuery: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Prepare context
  const transactionCSV = transactions.slice(0, 50).map(t => 
    `${t.date},${t.description},Income:${t.income},Expense:${t.expense}`
  ).join('\n');

  const prompt = `
    You are a financial assistant for a Kirana store (small grocery).
    Here is a list of recent transactions (Date, Description, Income, Expense):
    
    ${transactionCSV}
    
    User Question: "${userQuery}"
    
    Provide a concise, helpful answer. Format any monetary values with ₹.
    If the user asks for a summary, provide a brief overview of net profit and top expenses.
    Keep the tone professional yet friendly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze finances.");
  }
};