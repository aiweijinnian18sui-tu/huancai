import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-1.5-flash'; // 确保模型名称兼容最新版本

export async function editImage(base64Data: string, mimeType: string, prompt: string): Promise<string> {
  // 关键：Vite 项目应使用 import.meta.env 获取环境变量
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
  const genAI = new GoogleGenAI(apiKey);
  
  const base64Content = base64Data.split(',')[1] || base64Data;

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Content,
          mimeType: mimeType,
        },
      },
      {
        text: `你是一位顶级电商摄影修图专家。请根据以下中文指令对图像进行编辑：${prompt}。仅返回处理后的图像 base64 数据。`,
      },
    ]);

    const response = await result.response;
    // 解析返回的图像部分
    for (const part of response.candidates?.[0].content.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("模型未返回图像数据。");
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || "AI 处理出错");
  }
}
