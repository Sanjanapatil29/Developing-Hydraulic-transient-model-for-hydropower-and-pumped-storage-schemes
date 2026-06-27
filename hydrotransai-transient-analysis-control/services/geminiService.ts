import { GoogleGenAI } from "@google/genai";
import { SystemState, AIAnalysisResult, OperationMode } from '../types';

export const analyzeSystemWithGemini = async (
  history: SystemState[],
  mode: OperationMode
): Promise<AIAnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // We send the last 10 data points to give context
    const recentHistory = history.slice(-10);
    const currentState = recentHistory[recentHistory.length - 1];

    const prompt = `
      You are an expert Control Engineer for a Hydropower Plant. 
      Analyze the following telemetry data from a transient simulation.
      
      Current Operation Mode: ${mode}
      
      Recent Telemetry (Last 10 seconds):
      ${JSON.stringify(recentHistory, null, 2)}
      
      Task:
      1. Assess the stability of the system (Safe, Warning, Critical).
      2. Identify any transient phenomena (Water Hammer, Mass Oscillation, Cavitation, Overspeed).
      3. Provide 3 specific control recommendations.
      4. Predict peak pressure if current trend continues.

      Return ONLY a JSON object with this structure (no markdown):
      {
        "status": "safe" | "warning" | "critical",
        "message": "Short summary of situation",
        "recommendations": ["rec1", "rec2", "rec3"],
        "predictedPeakPressure": number
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);

    return {
      status: result.status || 'warning',
      message: result.message || 'Analysis unavailable',
      recommendations: result.recommendations || ['Check sensors'],
      predictedPeakPressure: result.predictedPeakPressure || currentState.penstockPressure
    };

  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    return {
      status: 'warning',
      message: 'AI Analysis currently unavailable. Connection error.',
      recommendations: ['Switch to manual control', 'Monitor gauges manually'],
      predictedPeakPressure: 0
    };
  }
};