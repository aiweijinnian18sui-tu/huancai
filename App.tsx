import React, { useState, useRef } from 'react';
import { ImageState, HistoryItem } from './types.ts';
import { editImage } from './geminiService.ts'; // 删除了 /services/
import { Button } from './Button.tsx'; // 删除了 /components/

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({ original: null, edited: null, mimeType: null });
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageState({ original: ev.target?.result as string, edited: null, mimeType: file.type });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyMagic = async (presetPrompt?: string) => {
    const finalPrompt = presetPrompt || prompt;
    if (!imageState.original || !finalPrompt.trim()) return;

    setIsProcessing(true);
    setError(null);
    try {
      const result = await editImage(imageState.original, imageState.mimeType || 'image/jpeg', finalPrompt);
      setImageState(prev => ({ ...prev, edited: result }));
      setHistory(prev => [{
        id: Date.now().toString(),
        original: imageState.original!,
        edited: result,
        prompt: finalPrompt,
        timestamp: new Date().toISOString()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || '处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">幻彩 AI 影棚</h1>
          <p className="text-slate-400">由 Gemini 提供支持的专业产品修图工具</p>
        </header>

        <section className="glass-panel rounded-3xl p-8 min-h-[400px] flex flex-col items-center justify-center border border-white/10 bg-white/5">
          {!imageState.original ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <Button onClick={() => fileInputRef.current?.click()}>选择产品照片</Button>
              <input type="file" ref={fileInputRef} onChange={onFileUpload} accept="image/*" className="hidden" />
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">原始图片</p>
                  <img src={imageState.original} alt="Original" className="w-full rounded-2xl border border-white/5" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">处理结果</p>
                  <div className="relative aspect-video w-full rounded-2xl border border-indigo-500/30 bg-indigo-500/5 overflow-hidden">
                    {isProcessing ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-900/80 backdrop-blur-sm">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-indigo-300 font-medium animate-pulse">AI 正在调色修图...</p>
                      </div>
                    ) : imageState.edited ? (
                      <img src={imageState.edited} alt="Edited" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-600">等待操作指令...</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="输入修图指令，例如：把背景换成大理石台面，增加高级感光影"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button onClick={() => handleApplyMagic()} isLoading={isProcessing}>开始处理</Button>
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
