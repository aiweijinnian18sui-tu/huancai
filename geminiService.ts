
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export async function editImage(base64Data: string, mimeType: string, prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // 确保 base64 数据不包含前缀
  const base64Content = base64Data.split(',')[1] || base64Data;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Content,
              mimeType: mimeType,
            },
          },
          {
            text: `你是一位顶级电商摄影修图专家。请根据以下中文指令对图像进行专业级编辑，保持产品本身不发生变形或质感丢失：${prompt}。仅返回处理后的图像。`,
          },
        ],
      },
    });

    // 遍历响应部分寻找图像数据
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("模型处理成功但未返回可用的图像。可能是指令过于模糊。");
  } catch (error: any) {
    console.error("Gemini 编辑服务异常:", error);
    if (error.message?.includes('API key')) {
      throw new Error("API Key 无效或未设置。");
    }
    throw new Error(error.message || "连接 AI 影棚失败，请稍后重试。");
  }
}
