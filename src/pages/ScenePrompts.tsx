import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Clapperboard, Wand2, Loader2, Play, Copy, CheckCircle2, Video, Settings2, Clock, Tv, Film, Download, FileJson, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface Scene {
  id: string;
  time: string;
  duration: string;
  narration: string;
  visualPrompt: string;
  camera: string;
  lighting: string;
  bgm: string;
  sfx: string;
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

export const ScenePrompts = () => {
  const [script, setScript] = useState('');
  const [duration, setDuration] = useState(1);
  const [style, setStyle] = useState('Cinematic Realism');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [visualQuality, setVisualQuality] = useState('8k, ultra-realistic, highly detailed');
  const [aiModel, setAiModel] = useState('Veo / Sora');

  const [consistentCharacters, setConsistentCharacters] = useState(false);
  const [cinematicBoost, setCinematicBoost] = useState(true);
  const [fastCut, setFastCut] = useState(false);
  const [transitions, setTransitions] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!script) return;
    setIsGenerating(true);
    setError(null);
    try {
      const advancedOpts = [
        consistentCharacters ? '- Consistent Character Mode' : '',
        cinematicBoost ? '- Cinematic Realism Boost' : '',
        fastCut ? '- Fast-cut Shorts Mode' : '',
        transitions ? '- Automatic Transition Suggestions' : '',
      ].filter(Boolean).join('\n');

      let styleConstraints = '';
      if (style === 'Vigyan Recharge style') {
        styleConstraints = `
VIGYAN RECHARGE SCENE PROMPT RULES:
- Cinematic documentary visuals.
- Dark blue/orange lighting, atmospheric environments.
- Slow dramatic camera movement.
- Realistic textures, high-detail scientific visuals.
- Space/mystery aesthetics.
`;
      }

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Convert the following YouTube script into a sequence of cinematic AI video scenes.

INPUTS:
- Video duration: ${duration} minutes
- Style: ${style}
- Aspect Ratio: ${aspectRatio}
- Visual Quality: ${visualQuality}
- Target AI Model: ${aiModel}

ADVANCED MODES ACTIVE:
${advancedOpts}
${styleConstraints}
RULES:
- EVERY scene duration MUST be between 4 to 8 seconds.
- Total duration MUST EXACTLY match the requested video duration.
- AI must auto-calculate sequential timestamps (e.g., 0:00 - 0:06).
- Cinematic pacing required.
- Prompts must be highly detailed and realistic, tailored for ${aiModel}.

SCRIPT:
${script}

REQUIRED OUTPUT FORMAT EXACTLY LIKE THIS FOR EACH SCENE:
SCENE [number]
TIME: [timeline e.g. 0:00 - 0:06]
DURATION: [seconds e.g. 6s]
NARRATION:
[Narration exactly from the script for this chunk]
VISUAL PROMPT:
[Detailed visual prompt ending in aspect ratio and quality terms]
CAMERA:
[Camera movement]
LIGHTING:
[Lighting description]
BGM:
[BGM mood]
SFX:
[Sound effects]`,
          systemInstruction: "You are an expert AI video director. You meticulously break down scripts into timestamped, highly detailed scene prompts. Always follow the EXACT format requested, separating blocks closely."
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content (Quota exceeded or server error).');
      }
      
      const text = data.text.replace(/\*\*/g, '');
      
      // Parsing
      const sceneBlocks = text.split(/SCEN(?:E|ES)?\s*\d+/i).filter((b: string) => b.trim().length > 10);
      
      const parsedScenes = sceneBlocks.map((block: string, index: number) => {
        const extract = (label: string, nextLabel?: string) => {
          const regex = nextLabel 
            ? new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n${nextLabel}:|$)`, 'i')
            : new RegExp(`${label}:\\s*([\\s\\S]*)`, 'i');
          const m = block.match(regex);
          return m ? m[1].trim() : '';
        };

        return {
          id: `scene-${index + 1}`,
          time: extract('TIME', 'DURATION') || '0:00',
          duration: extract('DURATION', 'NARRATION') || '5s',
          narration: extract('NARRATION', 'VISUAL PROMPT'),
          visualPrompt: extract('VISUAL PROMPT', 'CAMERA'),
          camera: extract('CAMERA', 'LIGHTING'),
          lighting: extract('LIGHTING', 'BGM'),
          bgm: extract('BGM', 'SFX'),
          sfx: extract('SFX')
        };
      });

      if (parsedScenes.length > 0) {
        setScenes(parsedScenes);
      } else {
        console.error("Failed to parse blocks:", text);
        setError("Failed to parse AI response. The format was unrecognized.");
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
    if (!scenes.length) return;
    const txt = scenes.map(s => `SCENE: ${s.time} (${s.duration})\nNARRATION: ${s.narration}\nVISUAL PROMPT: ${s.visualPrompt}\nCAMERA: ${s.camera}`).join('\n\n');
    downloadBlob(txt, 'text/plain', 'scene_prompts.txt');
  };

  const handleExportJson = () => {
    if (!scenes.length) return;
    const json = JSON.stringify(scenes, null, 2);
    downloadBlob(json, 'application/json', 'scene_prompts.json');
  };

  const handleExportVeo = () => {
    if (!scenes.length) return;
    const veoPrompts = scenes.map(s => `${s.visualPrompt} --ar ${aspectRatio.replace(':', '-')} --v 6.0`).join('\n\n--- \n\n');
    downloadBlob(veoPrompts, 'text/plain', 'veo_ready_prompts.txt');
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
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center neon-glow">
          <Clapperboard className="w-6 h-6 text-fuchsia-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Scene-by-Scene Prompt Generator</h1>
          <p className="text-slate-400">Convert scripts into cinematic AI video sequences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" style={{ perspective: "1200px" }}>
        {/* Left Config Panel */}
        <div className="lg:col-span-4 space-y-6">
          <TiltCard className="h-full">
            <div className="glass-card p-6 rounded-2xl space-y-6 h-full flex flex-col">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Script</label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your full YouTube script here..."
                className="w-full min-h-[200px] bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500/50 transition-all resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Duration (min)
                </label>
                <input 
                  type="number" 
                  min="0.5" 
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-fuchsia-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-slate-400" /> Aspect Ratio
                </label>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-fuchsia-500 transition-all"
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Shorts/TikTok)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:3">4:3 (Classic)</option>
                  <option value="21:9">21:9 (Cinematic)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-slate-400" /> AI Model
                </label>
                <select 
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-fuchsia-500 transition-all"
                >
                  <option value="Veo / Sora">Veo / Sora</option>
                  <option value="Runway Gen-3">Runway Gen-3</option>
                  <option value="Pika Labs">Pika Labs</option>
                  <option value="Kling">Kling</option>
                  <option value="Midjourney + Luma">Midjourney + Luma</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Film className="w-4 h-4 text-slate-400" /> Style
                </label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-fuchsia-500 transition-all"
                >
                  <option value="Cinematic Realism">Cinematic Realism</option>
                  <option value="Anime / Ghibli">Anime / Ghibli</option>
                  <option value="Pixar 3D">Pixar 3D</option>
                  <option value="Documentary">Documentary</option>
                  <option value="Cyberpunk">Cyberpunk</option>
                  <option value="Vigyan Recharge style">Vigyan Recharge style</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-slate-400" /> Advanced Directives
              </label>
              {[
                { label: 'Consistent Character Mode', state: consistentCharacters, setter: setConsistentCharacters },
                { label: 'Cinematic Realism Boost', state: cinematicBoost, setter: setCinematicBoost },
                { label: 'Fast-cut Shorts Mode', state: fastCut, setter: setFastCut },
                { label: 'Auto Transitions', state: transitions, setter: setTransitions },
              ].map((toggle, i) => (
                <label key={i} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center border transition-all",
                    toggle.state ? "bg-fuchsia-600 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.3)]" : "bg-white/5 border-white/10 group-hover:border-white/20"
                  )}>
                    {toggle.state && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{toggle.label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!script || isGenerating}
              className="w-full flex items-center justify-center space-x-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-5 py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:shadow-[0_0_25px_rgba(217,70,239,0.6)]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Timeline...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate AI Scenes</span>
                </>
              )}
            </button>
            {isGenerating && (
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-fuchsia-500 transition-all duration-1000 ease-in-out w-full animate-pulse origin-left scale-x-100"></div>
              </div>
            )}
            </div>
          </TiltCard>
        </div>

        {/* Right Timeline Panel */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
          <TiltCard className="h-full">
            <div className="glass-card rounded-2xl flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Video className="w-5 h-5 text-fuchsia-400" />
                <h2 className="text-xl font-bold text-white tracking-tight">Timeline & Scene Prompts</h2>
                {scenes.length > 0 && <span className="text-xs font-mono bg-fuchsia-500/10 text-fuchsia-400 px-2 py-1 rounded-md">{scenes.length} Scenes</span>}
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={handleExportJson} disabled={!scenes.length} title="Export JSON" className="p-2 text-slate-400 hover:text-fuchsia-400 transition-colors disabled:opacity-50 bg-white/5 rounded-lg hover:bg-white/10">
                  <FileJson className="w-4 h-4" />
                </button>
                <button onClick={handleExportText} disabled={!scenes.length} title="Export TXT" className="p-2 text-slate-400 hover:text-fuchsia-400 transition-colors disabled:opacity-50 bg-white/5 rounded-lg hover:bg-white/10">
                  <FileText className="w-4 h-4" />
                </button>
                <button onClick={handleExportVeo} disabled={!scenes.length} className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50 bg-gradient-to-r from-fuchsia-600/20 to-purple-600/20 border border-fuchsia-500/20 px-3 py-2 rounded-lg hover:border-fuchsia-500/40">
                  <Download className="w-4 h-4" />
                  <span>Veo Format</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-[#020617]/40 relative">
              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4">
                    <span className="text-red-400 text-2xl font-bold">!</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Generation Failed</h3>
                  <p className="text-sm text-red-300/80 max-w-md bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>
                </div>
              ) : scenes.length > 0 ? (
                <div className="relative pl-6 space-y-12 before:absolute before:inset-0 before:ml-[31px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                  {scenes.map((scene, i) => (
                    <motion.div 
                      key={scene.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                      className="relative z-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr] items-start group"
                    >
                      {/* Timeline Dot & Time Indicator */}
                      <div className="absolute left-[-42px] top-4 w-10 flex flex-col items-center z-20">
                         <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)] group-hover:scale-125 transition-transform duration-300" />
                         <div className="mt-2 bg-slate-900 text-fuchsia-400 text-xs font-mono px-2 py-0.5 rounded border border-white/5 whitespace-nowrap shadow-xl">
                           {scene.time}
                         </div>
                      </div>

                      {/* Main Scene Card */}
                      <div className="lg:col-span-3 ml-2 lg:ml-8 relative">
                        <div className="bg-slate-900/60 border border-white/5 hover:border-fuchsia-500/30 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 group-hover:bg-slate-900/80 shadow-xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                          
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-black/30 px-2 py-1 rounded inline-block">
                              DURATION: {scene.duration}
                            </span>
                            <button 
                              onClick={() => handleCopy(scene.visualPrompt, scene.id)}
                              className="text-slate-500 hover:text-fuchsia-400 transition-colors flex items-center space-x-1 p-1 bg-white/[0.03] rounded hover:bg-white/10"
                            >
                              {copiedId === scene.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              <span className="text-xs">Copy Prompt</span>
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="grid lg:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><FileText className="w-3 h-3"/> Narration</h4>
                                <p className="text-sm text-slate-300 italic border-l-2 border-slate-700 pl-3 py-1 font-serif">"{scene.narration}"</p>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1.5"><Wand2 className="w-3 h-3"/> AI Visual Prompt</h4>
                                <p className="text-sm text-white font-medium bg-fuchsia-500/[0.05] p-3 rounded-lg border border-fuchsia-500/10 leading-relaxed shadow-inner">
                                  {scene.visualPrompt}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-white/5">
                              <div className="bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Camera</span>
                                <span className="text-xs text-slate-300">{scene.camera || 'Static'}</span>
                              </div>
                              <div className="bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Lighting</span>
                                <span className="text-xs text-slate-300">{scene.lighting || 'Natural'}</span>
                              </div>
                              <div className="bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">BGM</span>
                                <span className="text-xs text-slate-300">{scene.bgm || 'Cinematic'}</span>
                              </div>
                              <div className="bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">SFX</span>
                                <span className="text-xs text-slate-300">{scene.sfx || 'None'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <motion.div 
                    animate={isGenerating ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl relative overflow-hidden",
                      isGenerating ? "bg-fuchsia-500/10 border-fuchsia-500/30" : "bg-slate-900/50"
                    )}
                  >
                    {isGenerating && <div className="absolute inset-0 bg-fuchsia-500/20 blur-xl animate-pulse" />}
                    <Clapperboard className={cn("w-10 h-10 relative z-10", isGenerating ? "text-fuchsia-400" : "opacity-50")} />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-slate-300 mb-1">{isGenerating ? "Directing Scenes..." : "Ready to Extract Scenes"}</p>
                    <p className="max-w-xs mx-auto text-sm">Paste your script on the left and our AI will break it down into specialized video prompts.</p>
                  </div>
                </div>
              )}
            </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
};

