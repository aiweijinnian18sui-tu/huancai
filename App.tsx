
import React, { useState, useRef, useCallback } from 'react';
import { ImageState, HistoryItem } from './types.ts';
import { editImage } from './services/geminiService.ts';
import { Button } from './components/Button.tsx';

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({ original: null, edited: null, mimeType: null });
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'history'>('edit');
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
      const result = await editImage(imageState.original, imageState.mimeType!, finalPrompt);
      setImageState(prev => ({ ...prev, edited: result }));
      
      const newHistory: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        original: imageState.original,
        edited: result,
        prompt: finalPrompt,
        timestamp: Date.now()
      };
      setHistory(prev => [newHistory, ...prev]);
      if (!presetPrompt) setPrompt('');
    } catch (err: any) {
      setError(err.message || "处理失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const presets = [
    { label: "自动背景移除", icon: "✨", p: "移除背景，仅保留主体产品，背景设为透明或纯白色，边缘平滑。" },
    { label: "清理画面杂物", icon: "🧹", p: "移除产品周围的所有干扰物、电线和污点，保持画面纯净。" },
    { label: "高级大理石台面", icon: "🏛️", p: "将产品放置在高级的灰色大理石纹理台面上，添加自然的柔和投影。" },
    { label: "清晨窗边阳光", icon: "☀️", p: "为照片添加清晨温润的侧方阳光效果，让产品看起来更有温度。" },
    { label: "亚马逊主图标准", icon: "📦", p: "纯白背景，产品居中，增强对比度和锐度，去除反光杂色。" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      {/* 顶部导航 */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-6 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-black">AI</div>
          <span className="font-bold tracking-tight text-white hidden sm:block">幻彩影棚 PRO</span>
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-full" onClick={() => fileInputRef.current?.click()}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            上传产品图
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileUpload} />
        </div>
      </nav>

      <main className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* 左侧边栏 - 控制台 */}
        <aside className="lg:col-span-3 border-r border-white/5 p-6 space-y-8 bg-slate-900/50 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">创意控制台</h2>
            <div className="relative">
              <textarea 
                className="w-full h-32 bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all resize-none placeholder:text-slate-500"
                placeholder="描述您的修图需求... 比如：'换成木质桌面，调亮一些'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button 
                onClick={() => handleApplyMagic()}
                disabled={isProcessing || !imageState.original || !prompt.trim()}
                className="absolute bottom-3 right-3 p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-30 transition-all shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
            {error && <p className="text-rose-400 text-xs mt-2 px-1">⚠️ {error}</p>}
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">智能预设效果</h2>
            <div className="grid grid-cols-1 gap-2">
              {presets.map(p => (
                <button 
                  key={p.label}
                  onClick={() => handleApplyMagic(p.p)}
                  disabled={isProcessing || !imageState.original}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-white/5 hover:bg-slate-800 hover:border-indigo-500/50 transition-all text-left group disabled:opacity-30"
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="pt-6 border-t border-white/5">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">历史版本</h2>
              <div className="grid grid-cols-2 gap-3">
                {history.slice(0, 4).map(h => (
                  <div 
                    key={h.id} 
                    className="aspect-square rounded-lg border border-white/10 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
                    onClick={() => setImageState({ ...imageState, edited: h.edited })}
                  >
                    <img src={h.edited} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* 右侧主视口 - 画布 */}
        <section className="lg:col-span-9 p-4 sm:p-10 flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden">
          {/* 背景光影 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

          {!imageState.original ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="max-w-xl w-full aspect-video border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
            >
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-500 group-hover:scale-110 group-hover:text-indigo-400 transition-all shadow-2xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">开始您的创作</p>
                <p className="text-slate-500 mt-2 text-sm">上传一张产品图，AI 将为您处理一切</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-8">
              <div className="relative w-full max-w-5xl bg-slate-900/40 rounded-[2.5rem] p-4 border border-white/10 shadow-2xl overflow-hidden">
                <div className="relative flex flex-col md:flex-row gap-6 items-center justify-center min-h-[500px]">
                  
                  {isProcessing && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-2xl">
                      <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-8 text-indigo-400 font-bold tracking-[0.2em] animate-pulse uppercase">AI 影棚正在渲染中...</p>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col items-center gap-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                      <img src={imageState.original} className="max-h-[500px] w-auto" alt="原图" />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-md text-[10px] font-bold text-white/50 rounded-full uppercase tracking-widest">原始拍摄</div>
                    </div>
                  </div>

                  {imageState.edited && (
                    <div className="flex-1 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
                      <div className="relative rounded-2xl overflow-hidden shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)] border border-indigo-500/30">
                        <img src={imageState.edited} className="max-h-[500px] w-auto" alt="结果" />
                        <div className="absolute top-3 left-3 px-3 py-1 bg-indigo-600 text-[10px] font-bold text-white rounded-full uppercase tracking-widest shadow-lg">AI 增强版</div>
                        <a 
                          href={imageState.edited} 
                          download="ai-studio-result.png"
                          className="absolute bottom-4 right-4 p-3 bg-white text-black rounded-2xl hover:bg-slate-200 transition-all shadow-xl"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0L8 8m4-4v12"/></svg>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {imageState.edited && (
                <div className="flex gap-4">
                  <button onClick={() => setImageState({ ...imageState, edited: null })} className="px-8 py-3 rounded-full bg-slate-800 text-slate-300 text-sm font-bold hover:bg-slate-700 transition-all">
                    对比原图
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 rounded-full bg-white text-black text-sm font-bold hover:bg-slate-100 transition-all">
                    处理另一张
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="h-12 border-t border-white/5 flex items-center justify-between px-6 bg-slate-950 text-[10px] text-slate-500 uppercase tracking-[0.2em]">
        <div>Powered by Gemini 2.5 Flash Image</div>
        <div>专业级 AI 修图工作台</div>
      </footer>
    </div>
  );
};

export default App;
