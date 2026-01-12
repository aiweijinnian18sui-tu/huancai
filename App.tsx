import React, { useState, useRef } from 'react';
import { editImage } from './geminiService.ts';
import { Button } from './Button.tsx';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [edited, setEdited] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ padding: '40px', background: '#0f172a', minHeight: '100vh', color: 'white', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '30px' }}>幻彩 AI 影棚</h1>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '20px' }}>
        {!image ? (
          <Button onClick={() => fileInputRef.current?.click()}>选择图片上传</Button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <img src={image} style={{ width: '100%', borderRadius: '10px' }} alt="原图" />
              {edited ? <img src={edited} style={{ width: '100%', borderRadius: '10px' }} alt="效果图" /> : <div style={{ background: '#1e293b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>等待处理</div>}
            </div>
            <input 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              placeholder="输入修图指令，如：换成大理石背景" 
              style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#334155', color: 'white' }}
            />
            <Button 
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await editImage(image, 'image/jpeg', prompt);
                  setEdited(res);
                } catch (e) { alert('失败'); }
                setLoading(false);
              }} 
              isLoading={loading}
            >开始 AI 修复</Button>
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={handleUpload} style={{ display: 'none' }} accept="image/*" />
      </div>
    </div>
  );
};

export default App;
