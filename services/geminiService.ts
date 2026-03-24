
import { GoogleGenAI } from "@google/genai";
import { QuestVerificationResult, Scheme, WeatherData, Crop, ActivityLog, UserProfile, PeerFarmer, DiseaseAnalysis, ApplicationGuide } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const getLanguageInstruction = (lang: string) => {
  if (lang === 'hi') return "Output ONLY in Hindi (Devanagari script).";
  if (lang === 'mr') return "Output ONLY in Marathi (Devanagari script).";
  return "Output in English.";
};

export const getChatResponse = async (history: string[], message: string, language: string = 'en'): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    let langInstruction = "Reply in English.";
    if (language === 'hi') langInstruction = "Reply in Hindi using Devanagari script (e.g., नमस्ते, आप कैसे हैं?). Do not use Latin script (Hinglish).";
    if (language === 'mr') langInstruction = "Reply in Marathi using Devanagari script (e.g., नमस्कार, तुम्ही कसे आहात?). Do not use Latin script.";

    const prompt = `You are Krishi Sakhi, a helpful and friendly agricultural expert assistant for Indian farmers. 
    
    Current System Language Code: ${language}
    STRICT OUTPUT INSTRUCTION: ${langInstruction}
    
    Conversation History:
    ${history.join('\n')}
    
    User Query: ${message}
    
    Answer simply and concisely (max 3-4 sentences), avoiding complex jargon. If the query is about farming, crops, weather, or government schemes, provide accurate advice.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "I'm sorry, I couldn't process that request. Please try again.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I am currently having trouble connecting to the satellite. Please try again later.";
  }
};

export const searchFarmingQuery = async (query: string, language: string): Promise<{text: string, sources: {title: string, uri: string}[]}> => {
  try {
    let langInstruction = "Answer in English.";
    if (language === 'hi') langInstruction = "Answer in Hindi (Devanagari).";
    if (language === 'mr') langInstruction = "Answer in Marathi (Devanagari).";

    const prompt = `User Question: "${query}"
    
    Instructions:
    1. Search the web for a reliable agricultural answer.
    2. Provide a summary of the solution (approx 50-80 words).
    3. ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const text = response.text || "No results found.";
    
    // Extract grounding chunks if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri && w.title)
      .map((w: any) => ({ title: w.title, uri: w.uri }));

    return { text, sources };

  } catch (error) {
    console.error("Web Search Error:", error);
    return { text: "Unable to search at the moment.", sources: [] };
  }
};

export const analyzePlantDisease = async (base64Image: string, language: string = 'en'): Promise<DiseaseAnalysis | null> => {
  try {
    const mimeType = 'image/jpeg'; 
    const data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    
    const targetLanguage = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          {
            text: `Analyze this plant image efficiently.
            
            Return a pure JSON object (NO markdown, NO \`\`\`json) with this structure:
            {
              "diagnosis": "Name of Disease or Healthy",
              "confidence": "High/Medium/Low",
              "symptoms": ["symptom1", "symptom2"],
              "treatment": {
                "organic": ["step1", "step2"],
                "chemical": ["step1", "step2"]
              },
              "prevention": ["tip1", "tip2"],
              "cureSteps": [
                {
                  "title": "Short Step Title",
                  "description": "Detailed simple instruction",
                  "imagePrompt": "A photorealistic educational illustration of a farmer [performing this specific step] on a [crop name] plant."
                }
              ]
            }
            
            LANGUAGE INSTRUCTION:
            1. The JSON KEYS (e.g., "diagnosis", "symptoms") must remain in English.
            2. The JSON VALUES (e.g., the actual name of the disease, the list of symptoms, the descriptions) MUST be in ${targetLanguage}.
            3. Exception: The 'imagePrompt' value MUST be in English.
            
            Provide 3-4 distinct cure steps. Keep descriptions simple for farmers.`
          }
        ]
      }
    });

    const text = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return null;
  }
};

export const generateReferenceImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

export const verifyQuestSubmission = async (base64Image: string, questTitle: string, questDescription: string, language: string = 'en'): Promise<QuestVerificationResult> => {
  try {
    const mimeType = 'image/jpeg';
    const data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const langInstr = getLanguageInstruction(language);

    const prompt = `You are an Agricultural Sustainability Auditor. 
    A farmer has uploaded this image as proof for the quest: "${questTitle}".
    Quest Description: "${questDescription}".

    Analyze the image. Does it visually confirm that the user has performed this action? 
    (e.g., if the quest is "Drip Irrigation", do you see drip lines? If "Organic Compost", do you see compost/manure?)

    Return ONLY a JSON object with this structure:
    {
      "verified": boolean,
      "confidence": number, 
      "feedback": "string"
    }
    
    INSTRUCTION: The 'feedback' field MUST be in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.

    Confidence should be between 0 and 100. If verified is true, feedback should be celebratory. If false, be helpful.
    DO NOT use markdown formatting (no \`\`\`json). Just return the raw JSON string.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt }
        ]
      }
    });

    let text = response.text || '{}';
    // Clean up potential markdown formatting just in case
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(text);
    return {
      verified: result.verified || false,
      confidence: result.confidence || 0,
      feedback: result.feedback || "Unable to verify. Please try again."
    };

  } catch (error) {
    console.error("Quest Verification Error:", error);
    return {
      verified: false,
      confidence: 0,
      feedback: "AI Verification failed. Please ensure the image is clear."
    };
  }
};

export interface SchemeRecommendation {
  schemeId: string;
  matchScore: number;
  reason: string;
}

export const getSchemeRecommendations = async (userProfile: any, availableSchemes: Scheme[], language: string = 'en'): Promise<SchemeRecommendation[]> => {
  try {
    const prompt = `You are an expert Government Scheme Consultant for farmers in India.
    
    User Profile:
    - State: ${userProfile.state}
    - Land Area: ${userProfile.landArea} acres
    - Farmer Category: ${userProfile.category}
    - Crops: ${userProfile.crops}
    - Specific Needs: ${userProfile.needs || 'General welfare'}

    Available Schemes (JSON):
    ${JSON.stringify(availableSchemes.map(s => ({ id: s.id, name: s.name, eligibility: s.eligibility, description: s.description })))}

    Task:
    Analyze the user profile against the eligibility criteria of the available schemes.
    Select the Top 3-5 most relevant schemes.
    
    Return a JSON array with this structure:
    [
      {
        "schemeId": "string (id from input)",
        "matchScore": number (0-100),
        "reason": "string"
      }
    ]
    
    INSTRUCTION: The 'reason' field MUST be in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Scheme Recommendation Error:", error);
    return [];
  }
};

export const generateSchemeApplicationGuide = async (schemeName: string, language: string = 'en'): Promise<ApplicationGuide> => {
  try {
    const prompt = `You are a Government Scheme Application Assistant.
    
    Provide a step-by-step guide on how to apply for the scheme: "${schemeName}" on the official Indian government website.
    
    Return a strict JSON object with the following structure:
    {
      "steps": ["Step 1...", "Step 2..."],
      "documents": ["Document 1", "Document 2"],
      "tips": "One short paragraph of crucial advice for filling the form correctly."
    }

    LANGUAGE INSTRUCTION: The content of the arrays and strings MUST be in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
    Do not use markdown. Just raw JSON.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
      console.error("Guide Gen Error:", error);
      return {
          steps: ["Visit the official website.", "Look for the registration link.", "Fill in your details."],
          documents: ["Aadhar Card", "Land Documents", "Bank Passbook"],
          tips: "Please consult your local agriculture office for more help."
      };
  }
};

export interface SmartAdvisoryResponse {
  pestForecast: {
    riskLevel: 'High' | 'Medium' | 'Low';
    condition: string;
    description: string;
    action: string;
  };
  cropManagement: Array<{
    cropName: string;
    stage: string;
    advice: string;
  }>;
}

export const generateSmartAdvisory = async (weather: WeatherData, crops: Crop[], language: string = 'en'): Promise<SmartAdvisoryResponse> => {
  try {
    const prompt = `You are an expert agricultural advisor for Indian farmers.
    
    Current Weather in ${weather.location}:
    - Temperature: ${weather.current.temp}°C
    - Humidity: ${weather.current.humidity}%
    - Wind Speed: ${weather.current.windSpeed} km/h
    - Condition: ${weather.current.conditionCode} (WMO Code)
    
    Farmers Crops:
    ${crops.length > 0 ? JSON.stringify(crops.map(c => ({ name: c.name, stage: c.stage, health: c.health }))) : "No specific crops added yet. Assume typical seasonal crops for the region (e.g., Rice, Coconut)."}
    
    Analyze the weather and crop data. 
    1. Predict pest/disease risks based on weather (e.g., high humidity -> fungal risk, high temp -> pest proliferation).
    2. Provide specific management advice for the specific crops listed.
    
    Return a valid JSON object with this exact structure:
    {
      "pestForecast": {
        "riskLevel": "High" (or "Medium", "Low"),
        "condition": "Name of potential threat",
        "description": "Short explanation",
        "action": "One key preventive action"
      },
      "cropManagement": [
        { "cropName": "Crop Name", "stage": "Stage", "advice": "Specific short advice regarding water/fertilizer/care" }
      ]
    }
    
    INSTRUCTION: Output the values for 'condition', 'description', 'action', and 'advice' in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Advisory Gen Error", error);
    // Return safe default
    return {
        pestForecast: { riskLevel: 'Low', condition: 'Stable Conditions', description: 'Weather is favorable for most crops.', action: 'Continue regular monitoring.' },
        cropManagement: []
    };
  }
};

export const getSuggestedActivities = async (weather: WeatherData, crops: Crop[], language: string = 'en'): Promise<ActivityLog[]> => {
  try {
    const prompt = `You are a smart Farm Manager AI.
    
    Current Weather: 
    - Temp: ${weather.current.temp}°C
    - Humidity: ${weather.current.humidity}%
    - Condition Code: ${weather.current.conditionCode}
    
    My Crops:
    ${JSON.stringify(crops.map(c => ({ name: c.name, stage: c.stage })))}

    Based on this, generate 3 specific, high-priority farming tasks for TODAY.
    Focus on immediate needs like irrigation (if hot/dry), drainage (if raining), fertilizer application (if stage appropriate), or pest checks.

    Return a JSON array where each object matches:
    {
      "title": "string (Short action title)",
      "description": "string (Specific details on why and how much)",
      "type": "fertilizer" | "water" | "harvest" | "planting" | "other"
    }
    
    INSTRUCTION: Output the 'title' and 'description' in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
    
    Do NOT include ids or dates, I will handle that.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    const raw: any[] = JSON.parse(response.text || '[]');
    return raw.map((item, index) => ({
        id: Date.now().toString() + index,
        date: new Date().toISOString().split('T')[0], // Today's date
        title: item.title,
        description: item.description,
        type: item.type || 'other',
        status: 'pending'
    }));

  } catch (error) {
      console.error("Activity Generation Error", error);
      return [];
  }
};

export const findSimilarFarmers = async (profile: UserProfile, language: string = 'en'): Promise<PeerFarmer[]> => {
  try {
    const prompt = `You are a Global Agricultural Network AI.
    
    I will provide you with an Indian farmer's profile.
    
    User Profile:
    - Name: ${profile.name}
    - Location: ${profile.district}, ${profile.state}, India
    - Main Crop: ${profile.mainCrop}
    - Soil Type: ${profile.soilType}
    - Land Size: ${profile.totalLandArea} ${profile.landUnit}
    - Farming Method: ${profile.irrigationMethods.join(', ')}

    Your task is to generate 5 FICTIONAL profiles of peer farmers who share similarities with this farmer.
    
    LANGUAGE INSTRUCTION: Output the 'reason', 'location', 'country' and 'crops' fields in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
    
    PRIORITY MATCHING RULES:
    1. The first 2-3 matches MUST be from the SAME STATE (${profile.state}) or neighboring states in India (Nearby).
    2. The remaining matches should be from DIFFERENT COUNTRIES (International) with similar agricultural conditions (e.g. Vietnam, Brazil, Thailand).
    3. If there are no good local matches (unlikely), provide global ones.

    Return a JSON array with this structure:
    [
      {
        "id": "1",
        "name": "string",
        "location": "string (District, State for India / City, Region for Int'l)",
        "country": "string (Use 'India' for nearby)",
        "crops": ["string", "string"],
        "similarity": number (Score 0-100),
        "reason": "string (1 sentence explaining why they are a match)"
      }
    ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '[]');

  } catch (error) {
    console.error("Farmer Match Error", error);
    return [];
  }
};