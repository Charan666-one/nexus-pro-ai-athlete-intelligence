import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeMedicalReport(fileBase64: string, mimeType: string, athleteHistory: any[]) {
  const model = ai.models.generateContent({
    model: "gemini-2.5-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: fileBase64.split(',')[1],
              mimeType: mimeType
            }
          },
          {
            text: `You are a sports medicine specialist and anti-doping analyst.
            Extract the following metrics from this medical report:
            - Heart Rate (bpm)
            - Hematocrit (%)
            - Testosterone (ng/dL)
            - Oxygen Levels (%)
            - Blood Pressure (string like "120/80")
            - Type of test (Blood test, ECG, etc.)
            
            Also, analyze the data considering the athlete's history provided below:
            ${JSON.stringify(athleteHistory)}
            
            Analyze:
            - Sudden changes vs baseline
            - Abnormal biomarker relationships
            - Possible physiological vs artificial causes
            
            Return the data in JSON format with the following structure:
            {
              "metrics": {
                "heart_rate": number,
                "hematocrit": number,
                "testosterone": number,
                "oxygen_level": number,
                "blood_pressure": "string",
                "test_type": "string"
              },
              "analysis": {
                "key_anomalies": ["string"],
                "risk_interpretation": "string",
                "doping_suspicion": "Normal" | "Physiological Stress" | "Possible Doping Pattern",
                "recommended_action": "string",
                "confidence_score": number (0-100),
                "risk_score": number (0-100),
                "final_decision": "Cleared" | "Needs Review" | "High Risk Flag"
              }
            }`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
}
