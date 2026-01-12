import React, { useState, useRef } from 'react';
import { editImage } from './geminiService.ts';
import { Button } from './Button.tsx';

// 在当前文件直接定义接口，避免引用缺失的 types.ts
interface ImageState {
  original: string | null;
  edited: string | null;
  mimeType: string | null;
}

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({ original: null, edited: null, mimeType: null });
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleApplyMagic = async () => {
    if (!imageState.original || !prompt.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await editImage(imageState.original, imageState.mimeType || 'image/jpeg', prompt);
      setImageState(prev => ({ ...prev, edited: result }));
    } catch (err: any) {
      setError(err.message || '处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <main className="max-w-4xl mx-auto space-y-8 text-center">
        <header className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">幻彩 AI 影棚</h1>
          <p className="text-slate-400">由 Gemini 提供支持的专业产品修图工具</p>
        </header>

        <section className="glass-panel rounded-3xl p-8 border border-white/10 bg-white/5">
          {!imageState.original ? (
            <div className="py-20">
              <Button onClick={() => fileInputRef.current?.click()}>选择产品照片</Button>
              <input type="file" ref={fileInputRef} onChange={onFileUpload} accept="image/*" className="hidden" />
            </div>
          ) : (
            <div className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">原始图片</p>
                  <img src={imageState.original} alt="Original" className="w-full rounded-xl" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-400 mb-2">处理结果</p>
                  <div className="relative aspect-video rounded-xl border border-indigo-500/30 bg-indigo-500/5 flex items-center justify-center overflow-hidden">
                    {isProcessing ? <p className="animate-pulse">AI 处理中...</p> : 
                     imageState.edited ? <img src={imageState.edited} alt="Edited" className="w-full h-full object-contain" /> : 
                     <p className="text-slate-600">等待指令...</p>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="输入修图指令..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                />
                <Button onClick={handleApplyMagic} isLoading={isProcessing}>开始</Button>
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
