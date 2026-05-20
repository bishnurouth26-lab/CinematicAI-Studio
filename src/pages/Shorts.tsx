import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Video, Loader2, Wand2, Copy, CheckCircle2, 
  Settings2, Download, Flame, Eye, Music, Mic, FileText, Smartphone, TrendingUp, Link as LinkIcon, Clapperboard, AlertCircle, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ShortScene {
  time: string;
  verticalVisualPrompt: string;
  caption: string;
  camera: string;
  sfx: string;
  bgm: string;
}

interface ViralShort {
  id: string;
  shortTitle: string;
  hook: string;
  duration: string;
  engagementScore: number;
  viralPrediction: string;
  scenes: ShortScene[];
}

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["1.5deg", "-1.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-1.5deg", "1.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(10px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

export const ShortsConverter = () => {
  const [script, setScript] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [shortsDuration, setShortsDuration] = useState('30-45s');
  const [platform, setPlatform] = useState('YouTube Shorts');
  const [contentStyle, setContentStyle] = useState('Fast-paced viral');
  const [captionStyle, setCaptionStyle] = useState('Bold Yellow Outline');

  const [autoSubtitleAnimation, setAutoSubtitleAnimation] = useState(true);
  const [emojiCaptionMode, setEmojiCaptionMode] = useState(true);
  const [viralPacing, setViralPacing] = useState(true);
  const [autoLoopEnding, setAutoLoopEnding] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [shorts, setShorts] = useState<ViralShort[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [videoGenerations, setVideoGenerations] = useState<Record<string, { status: 'generating' | 'done' | 'error', url?: string, error?: string }>>({});
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateVideoForScene = async (shortId: string, sceneIndex: number, prompt: string) => {
    const key = `${shortId}-${sceneIndex}`;
    setVideoGenerations(prev => ({ ...prev, [key]: { status: 'generating' } }));
    
    try {
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!startRes.ok) throw new Error('Failed to start generation');
      const { operationName } = await startRes.json();
      
      const poll = async () => {
        try {
          const pollRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName })
          });
          if (!pollRes.ok) throw new Error('Polling failed');
          const pollData = await pollRes.json();
          
          if (pollData.done) {
             const downloadRes = await fetch('/api/video-download', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ operationName })
             });
             
             if (!downloadRes.ok) throw new Error((await downloadRes.json()).error || 'Download failed');
             const blob = await downloadRes.blob();
             const url = URL.createObjectURL(blob);
             
             setVideoGenerations(prev => ({ ...prev, [key]: { status: 'done', url } }));
          } else {
             setTimeout(poll, 15000);
          }
        } catch (err: any) {
          setVideoGenerations(prev => ({ ...prev, [key]: { status: 'error', error: err.message } }));
        }
      };
      
      poll();

    } catch (err: any) {
      setVideoGenerations(prev => ({ ...prev, [key]: { status: 'error', error: err.message } }));
    }
  };

  const handleGenerate = async () => {
    if (!script.trim() && !videoUrl.trim()) return;
    setIsGenerating(true);
    setShorts([]);
    setError(null);

    const advancedOpts = [
      autoSubtitleAnimation ? 'Auto subtitle animation' : '',
      emojiCaptionMode ? 'Emoji caption mode' : '',
      viralPacing ? 'Viral pacing AI (scene change every 2-4s)' : '',
      autoLoopEnding ? 'Auto loop ending generation' : '',
    ].filter(Boolean).join(', ');

    const sourceContext = videoUrl ? `Source Video URL: ${videoUrl}\nSource Script: ${script || 'Extract context from URL/Title'}` : `Source Script: ${script}`;

    let styleConstraints = '';
    if (contentStyle === 'Vigyan Recharge style') {
      styleConstraints = `
VIGYAN RECHARGE SHORTS STYLE RULES:
- Fast curiosity hooks that question reality or introduce a deep mystery.
- High-retention pacing with big reveal moments.
- Dramatic zoom transitions.
- Voice over should be simple (educational) with emotional gravity.
- Viral educational storytelling pattern.
`;
    }

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an elite short-form content producer. Create highly engaging viral Shorts/Reels/TikToks from the provided context.

INPUTS:
${sourceContext}
- Platform: ${platform}
- Target Duration: ${shortsDuration}
- Content Style: ${contentStyle}
- Caption Style: ${captionStyle}
- Advanced Features: ${advancedOpts}

${styleConstraints}
RULES:
- Return ONLY a valid JSON array of objects. 
- Do NOT wrap the JSON in Markdown formatting like \`\`\`json.
- Generate EXACTLY 2 distinct short concepts.
- Every short must start with a strong hook within the first 2 seconds.
- Pacing must be extremely fast to retain attention.

JSON STRUCTURE:
[
  {
    "id": "short-1",
    "shortTitle": "Title",
    "hook": "Hook text",
    "duration": "String",
    "engagementScore": Number (1-100),
    "viralPrediction": "High|Medium|Viral",
    "scenes": [
      {
        "time": "0:00-0:03",
        "verticalVisualPrompt": "String",
        "caption": "String",
        "camera": "String",
        "sfx": "String",
        "bgm": "String"
      }
    ]
  }
]
`,
          systemInstruction: "You are an expert short-form content creator and viral strategist. Output strictly raw JSON array without markdown blocks."
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate shorts context');
      
      let text = data.text.trim();
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setShorts(parsed);
      } else {
        throw new Error("Invalid output format returned by AI.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportText = () => {
    if (!shorts.length) return;
    const txt = shorts.map(s => `SHORT TITLE:\n${s.shortTitle}\n\nHOOK:\n${s.hook}\n\nDURATION: ${s.duration}\n\nVIRAL SCORE: ${s.engagementScore}/100 (${s.viralPrediction})\n\n` + s.scenes.map((scene, i) => `SCENE ${i+1}\nTIME: ${scene.time}\nVERTICAL VISUAL PROMPT:\n${scene.verticalVisualPrompt}\n\nCAPTION:\n${scene.caption}\n\nCAMERA:\n${scene.camera}\n\nSFX:\n${scene.sfx}\n\nBGM:\n${scene.bgm}`).join('\n\n----------------------------\n\n')).join('\n\n============================\n\n');
    downloadBlob(txt, 'text/plain', 'viral_shorts_pack.txt');
  };

  const downloadBlob = (content: string, type: string, filename: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto h-full min-h-[500px] pb-12 w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center neon-glow shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <Smartphone className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">AI Shorts & Reels Maker</h1>
            <p className="text-slate-400">Convert long videos into perfectly paced viral short-form clips.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExportText} disabled={!shorts.length} className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50 text-slate-300">
             <Download className="w-4 h-4" /> Export Pack
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" style={{ perspective: "1200px" }}>
        
        {/* Left Config Panel */}
        <div className="lg:col-span-4 space-y-6">
          <TiltCard className="h-full">
            <div className="glass-card p-6 rounded-2xl space-y-5 h-full flex flex-col bg-slate-900/40 border border-rose-500/10 shadow-[0_0_40px_rgba(244,63,94,0.03)] backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50"></div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Original Script (or notes)</label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Paste your long-form script/transcript here..."
                  className="w-full min-h-[120px] bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 transition-all resize-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5" /> Source Video URL (Optional)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-rose-500 transition-colors text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Target Platform</label>
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-rose-500 transition-colors">
                    <option value="YouTube Shorts">YouTube Shorts</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="Facebook Reels">Facebook Reels</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Duration</label>
                  <select value={shortsDuration} onChange={(e) => setShortsDuration(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-rose-500 transition-colors">
                    <option value="Under 15s (Trending)">Under 15s (Trending)</option>
                    <option value="15-30s">15-30s</option>
                    <option value="30-45s">30-45s</option>
                    <option value="45-60s">45-60s</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Content Style</label>
                  <select value={contentStyle} onChange={(e) => setContentStyle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-rose-500 transition-colors">
                    <option value="Fast-paced viral">Fast-paced viral</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Cinematic">Cinematic</option>
                    <option value="Horror mystery">Horror mystery</option>
                    <option value="Educational">Educational</option>
                    <option value="Motivational">Motivational</option>
                    <option value="AI facts">AI facts</option>
                    <option value="Space/science">Space/science</option>
                    <option value="Vigyan Recharge style">Vigyan Recharge style</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Caption Style</label>
                  <select value={captionStyle} onChange={(e) => setCaptionStyle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-rose-500 transition-colors">
                    <option value="Bold Yellow Outline">Bold Yellow</option>
                    <option value="MrBeast Style">MrBeast Style</option>
                    <option value="Hormozi Style (Dynamic)">Hormozi Style</option>
                    <option value="Neon Glow">Neon Glow</option>
                    <option value="Minimalist White">Minimalist White</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5 mt-auto">
                <label className="block text-sm font-medium text-rose-400 mb-2 flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> AI Behaviors
                </label>
                {[
                  { label: 'Viral pacing AI (Fast Cuts)', state: viralPacing, setter: setViralPacing },
                  { label: 'Emoji Caption Mode', state: emojiCaptionMode, setter: setEmojiCaptionMode },
                  { label: 'Auto Subtitle Animation', state: autoSubtitleAnimation, setter: setAutoSubtitleAnimation },
                  { label: 'Looping Endings (Seamless loop)', state: autoLoopEnding, setter: setAutoLoopEnding },
                ].map((toggle, i) => (
                  <label key={i} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={cn(
                      "w-5 h-5 rounded flex items-center justify-center border transition-all",
                      toggle.state ? "bg-rose-600 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : "bg-black/40 border-white/10 group-hover:border-white/20"
                    )}>
                      {toggle.state && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{toggle.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={(!script.trim() && !videoUrl.trim()) || isGenerating}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.7)] z-10"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Slicing & Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Viral Shorts</span>
                  </>
                )}
              </button>
            </div>
          </TiltCard>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                 <span className="text-red-400 font-bold text-xl">!</span>
               </div>
               <div>
                 <h3 className="text-red-400 font-bold mb-1">Generation Failed</h3>
                 <p className="text-red-300/80 text-sm">{error}</p>
               </div>
            </div>
          )}

          {!isGenerating && !shorts.length && !error && (
            <div className="h-[600px] glass-card rounded-2xl flex flex-col items-center justify-center text-slate-500 space-y-6 bg-slate-900/20 border-dashed border-2 border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.05)_0%,transparent_70%)]"></div>
               <div className="w-24 h-24 rounded-3xl bg-slate-900/50 flex items-center justify-center border border-white/5 shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500">
                 <Video className="w-10 h-10 text-rose-500/50" />
               </div>
               <div className="text-center z-10">
                 <p className="text-xl font-bold text-slate-300 mb-2">Ready to Chop</p>
                 <p className="text-sm max-w-sm mx-auto text-slate-500">Import your script and let AI identify engagement spikes, craft vertical visuals, and generate fast-paced captions.</p>
               </div>
            </div>
          )}

          {isGenerating && (
            <div className="h-[600px] glass-card rounded-2xl flex flex-col items-center justify-center space-y-8 bg-slate-900/40 relative overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250px_250px] animate-[shimmer_2s_linear_infinite]" />
               
               <div className="relative w-[150px] h-[300px] rounded-xl border-4 border-rose-500 overflow-hidden flex items-center justify-center">
                  <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: "-100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-rose-500/50 to-transparent"
                  />
                  <Smartphone className="w-16 h-16 text-rose-500/20" />
               </div>

               <p className="text-rose-400 font-mono tracking-widest text-sm animate-pulse z-10">SEARCHING FOR HIGH-RETENTION HOOKS...</p>
            </div>
          )}

          {shorts.length > 0 && (
            <div className="grid grid-cols-1 gap-8">
              {shorts.map((short, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  key={short.id || idx}
                  className="glass-card rounded-2xl p-0 overflow-hidden bg-slate-900/60 border border-rose-500/20 shadow-2xl flex flex-col relative"
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-b from-rose-500/20 to-transparent w-full h-32 pointer-events-none" />
                  
                  <div className="p-6 border-b border-rose-500/10 flex flex-col md:flex-row gap-6 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-1 rounded tracking-wide uppercase">CONCEPT {idx + 1}</span>
                         <span className="text-slate-400 text-xs font-mono">{short.duration}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">{short.shortTitle}</h2>
                      <div className="bg-black/40 border border-rose-500/20 p-4 rounded-xl">
                        <span className="text-[10px] font-bold tracking-wider text-rose-400 block mb-1">VIRAL HOOK</span>
                        <p className="text-white/90 font-serif italic text-lg leading-tight">"{short.hook}"</p>
                      </div>
                    </div>

                    <div className="flex gap-4 shrink-0 justify-center">
                       {/* Engagement Meter */}
                       <div className="w-32 flex flex-col items-center justify-center bg-black/30 rounded-xl border border-white/5 p-4">
                         <div className="relative">
                           <TrendingUp className="w-6 h-6 text-rose-500 mb-1" />
                           {short.engagementScore >= 90 && (
                             <motion.div 
                               animate={{ scale: [1, 1.2, 1] }} 
                               transition={{ repeat: Infinity, duration: 1 }}
                               className="absolute -top-1 -right-2 bg-red-500 w-2 h-2 rounded-full"
                             />
                           )}
                         </div>
                         <span className="text-3xl font-black text-white">{short.engagementScore}</span>
                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center mt-1">Engagement<br/>Score</span>
                         <span className={cn(
                           "text-[9px] font-bold px-2 py-0.5 rounded mt-2 border",
                           short.viralPrediction === 'High' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                         )}>
                           {short.viralPrediction}
                         </span>
                       </div>
                    </div>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                       <FileText className="w-3 h-3"/> SCENE SEQUENCING (TIMELINE)
                    </h3>
                    
                    <div className="flex gap-4 min-w-max pb-4">
                      {short.scenes.map((scene, sIdx) => (
                        <div key={sIdx} className="w-[280px] bg-black/40 border border-white/5 rounded-xl shrink-0 flex flex-col overflow-hidden relative group">
                          {/* Time Header */}
                          <div className="bg-rose-500/10 border-b border-rose-500/20 px-3 py-2 flex items-center justify-between text-xs">
                            <span className="font-mono text-rose-400 font-bold">{scene.time}</span>
                            <span className="text-slate-500 uppercase text-[9px] font-bold">Scene {sIdx+1}</span>
                          </div>
                          
                          <div className="p-4 flex-1 flex flex-col gap-4">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 mb-1"><Eye className="w-3 h-3 text-cyan-400" /> Visual Prompt</span>
                              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all mb-2">{scene.verticalVisualPrompt}</p>
                              
                              {(() => {
                                const key = `${short.id || idx}-${sIdx}`;
                                const genState = videoGenerations[key];
                                return (
                                  <div className="mt-2 text-xs">
                                    {!genState ? (
                                      <button 
                                        onClick={() => generateVideoForScene(short.id || idx.toString(), sIdx, scene.verticalVisualPrompt)}
                                        className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 rounded-lg text-cyan-300 transition-colors font-bold tracking-wide shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                                      >
                                        <Sparkles className="w-3.5 h-3.5" /> Generate Video (Veo)
                                      </button>
                                    ) : genState.status === 'generating' ? (
                                      <div className="w-full flex flex-col items-center justify-center gap-2 py-4 bg-black/40 border border-cyan-500/20 rounded-lg text-cyan-400">
                                        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mb-1" />
                                        <span className="text-[10px] font-mono tracking-widest uppercase animate-pulse">Rendering via Veo...</span>
                                      </div>
                                    ) : genState.status === 'error' ? (
                                      <div className="w-full flex flex-col items-center justify-center gap-1 py-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-[10px] uppercase">{genState.error || 'Failed'}</span>
                                      </div>
                                    ) : genState.url ? (
                                      <div className="w-full rounded-lg overflow-hidden border border-cyan-500/40 relative group aspect-[9/16] bg-black">
                                        <video src={genState.url} controls autoPlay loop muted className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-cyan-500/50 text-[9px] font-bold tracking-widest text-cyan-400 font-mono">
                                          VEO ACTIVE
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })()}
                            </div>

                            <div className="relative">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 mb-1">Caption</span>
                              <div className={cn(
                                "p-2 rounded bg-slate-900 border text-center font-bold text-xs uppercase shadow-lg",
                                captionStyle.includes('Yellow') ? "border-yellow-500/30 text-yellow-500 drop-shadow-md" :
                                captionStyle.includes('Neon') ? "border-fuchsia-500/30 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" :
                                "border-white/10 text-white"
                              )}>
                                {scene.caption}
                              </div>
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                              <div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1 mb-1"><Video className="w-2.5 h-2.5 text-blue-400" /> Camera</span>
                                <span className="text-[10px] text-slate-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/10 inline-block">{scene.camera}</span>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1 mb-1"><Music className="w-2.5 h-2.5 text-rose-400" /> SFX/Audio</span>
                                <span className="text-[10px] text-slate-300 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/10 inline-block truncate w-full" title={scene.sfx}>{scene.sfx}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

