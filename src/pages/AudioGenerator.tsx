import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Mic, Music, Settings2, Download, Loader2, FileText, CheckCircle2, Copy, Play, Volume2, Activity, PlayCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AudioAnalysis {
  voiceAnalysis: {
    voiceStyle: string;
    narrationSpeed: string;
    emotionalTone: string;
    pauseSuggestions: string[];
    formattedScript: string;
  };
  musicAnalysis: {
    bgmStyle: string;
    mood: string;
    bpm: string;
    instruments: string;
    aiMusicPrompt: string;
    sfxSuggestions: string[];
  };
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

export const AudioGenerator = () => {
  const [script, setScript] = useState('');
  const [language, setLanguage] = useState('English');
  const [gender, setGender] = useState('Male');
  const [emotionType, setEmotionType] = useState('Serious');
  const [narrationSpeed, setNarrationSpeed] = useState('1.0x');
  const [voiceStyle, setVoiceStyle] = useState('Documentary');
  const [musicMood, setMusicMood] = useState('Dark cinematic');
  
  const [autoPause, setAutoPause] = useState(true);
  const [shortsMode, setShortsMode] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AudioAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!script.trim() || isGenerating) return;
    setIsGenerating(true);
    setResult(null);
    setError(null);

    const advancedOpts = [
      autoPause ? 'Auto pause generation & emphasis tags' : '',
      shortsMode ? 'Shorts narration mode (high energy, fast paced)' : '',
    ].filter(Boolean).join(', ');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate AI Voice & Background Music instructions for the following script.

INPUTS:
- Script: ${script}
- Voice Language: ${language}
- Voice Gender: ${gender}
- Emotion Type: ${emotionType}
- Narration Speed target: ${narrationSpeed}
- Voice Style: ${voiceStyle}
- Music Mood: ${musicMood}

ADVANCED:
${advancedOpts}

RULES:
- Return ONLY a valid JSON object. 
- Do NOT wrap the JSON in Markdown formatting like \`\`\`json.
- Format the script with inline pause markers like [Pause 1.5s], [Emphasize], [Slow], [Fast].

JSON STRUCTURE:
{
  "voiceAnalysis": {
    "voiceStyle": "String",
    "narrationSpeed": "String",
    "emotionalTone": "String",
    "pauseSuggestions": ["String"],
    "formattedScript": "String (the full script modified with inline tags like [Pause 1s])"
  },
  "musicAnalysis": {
    "bgmStyle": "String",
    "mood": "String",
    "bpm": "String",
    "instruments": "String",
    "aiMusicPrompt": "String (highly descriptive prompt tailored for Suno/Udio/etc)",
    "sfxSuggestions": ["String"]
  }
}
`,
          systemInstruction: "You are an expert audio engineer and YouTube AI prompt specialist. Output strictly raw JSON object without markdown blocks."
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate audio parameters');
      
      let text = data.text.trim();
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(text);
      if (parsed.voiceAnalysis && parsed.musicAnalysis) {
        setResult(parsed);
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

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExportText = () => {
    if (!result) return;
    const txt = `VOICE STYLE:
${result.voiceAnalysis.voiceStyle}

NARRATION SPEED:
${result.voiceAnalysis.narrationSpeed}

EMOTIONAL TONE:
${result.voiceAnalysis.emotionalTone}

PAUSE SUGGESTIONS:
${result.voiceAnalysis.pauseSuggestions.join('\n')}

FORMATTED SCRIPT:
${result.voiceAnalysis.formattedScript}

=======================================

BGM STYLE:
${result.musicAnalysis.bgmStyle}

MOOD:
${result.musicAnalysis.mood}

BPM:
${result.musicAnalysis.bpm}

INSTRUMENTS:
${result.musicAnalysis.instruments}

AI MUSIC PROMPT:
${result.musicAnalysis.aiMusicPrompt}

SFX SUGGESTIONS:
${result.musicAnalysis.sfxSuggestions.map(s => '- ' + s).join('\n')}
`;
    downloadBlob(txt, 'text/plain', 'audio_generation_prompts.txt');
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
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center neon-glow shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Mic className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Voice & Audio Studio</h1>
            <p className="text-slate-400">Generate AI voice scripts and cinematic background music prompts.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExportText} disabled={!result} className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50 text-slate-300">
             <Download className="w-4 h-4" /> Export Config
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" style={{ perspective: "1200px" }}>
        
        {/* Left Config Panel */}
        <div className="lg:col-span-4 space-y-6">
          <TiltCard className="h-full">
            <div className="glass-card p-6 rounded-2xl space-y-5 h-full flex flex-col bg-slate-900/40 border border-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.03)] backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Original Script</label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Paste your script here..."
                  className="w-full min-h-[120px] bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/50 transition-all resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 transition-colors">
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Arabic">Arabic</option>
                    <option value="French">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Voice Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 transition-colors">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Any">Any</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Voice Style</label>
                  <select value={voiceStyle} onChange={(e) => setVoiceStyle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 transition-colors">
                    <option value="Documentary">Documentary</option>
                    <option value="Cinematic">Cinematic</option>
                    <option value="Emotional">Emotional</option>
                    <option value="Horror">Horror</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Educational">Educational</option>
                    <option value="Motivational">Motivational</option>
                    <option value="Deep cinematic narrator">Deep cinematic narrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Emotion</label>
                  <select value={emotionType} onChange={(e) => setEmotionType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 transition-colors">
                    <option value="Serious">Serious</option>
                    <option value="Dramatic">Dramatic</option>
                    <option value="Excited">Excited</option>
                    <option value="Calm">Calm</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Sad/Emotional">Sad / Emotional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Speed</label>
                  <select value={narrationSpeed} onChange={(e) => setNarrationSpeed(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 transition-colors">
                    <option value="0.8x (Slow, Dramatic)">0.8x (Slow)</option>
                    <option value="0.95x (Cinematic)">0.95x (Cinematic)</option>
                    <option value="1.0x (Normal)">1.0x (Normal)</option>
                    <option value="1.15x (Fast)">1.15x (Fast)</option>
                    <option value="1.25x (Shorts)">1.25x (Shorts)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Music Mood</label>
                  <select value={musicMood} onChange={(e) => setMusicMood(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 transition-colors">
                    <option value="Dark cinematic">Dark cinematic</option>
                    <option value="Emotional piano">Emotional piano</option>
                    <option value="Sci-fi ambient">Sci-fi ambient</option>
                    <option value="Mystery tension">Mystery tension</option>
                    <option value="Epic trailer">Epic trailer</option>
                    <option value="Horror atmosphere">Horror atmosphere</option>
                    <option value="Documentary ambient">Documentary ambient</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5 mt-auto">
                <label className="block text-sm font-medium text-indigo-400 mb-2 flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Advanced Features
                </label>
                {[
                  { label: 'Auto Pause & Emphasis Tags', state: autoPause, setter: setAutoPause },
                  { label: 'Shorts Narration Mode', state: shortsMode, setter: setShortsMode },
                ].map((toggle, i) => (
                  <label key={i} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={cn(
                      "w-5 h-5 rounded flex items-center justify-center border transition-all",
                      toggle.state ? "bg-indigo-600 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]" : "bg-black/40 border-white/10 group-hover:border-white/20"
                    )}>
                      {toggle.state && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{toggle.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!script.trim() || isGenerating}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.7)] z-10"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Audio Profile...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    <span>Generate Audio Prompts</span>
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
                 <h3 className="text-red-400 font-bold mb-1">Analysis Failed</h3>
                 <p className="text-red-300/80 text-sm">{error}</p>
               </div>
            </div>
          )}

          {!isGenerating && !result && !error && (
            <div className="h-[600px] glass-card rounded-2xl flex flex-col items-center justify-center text-slate-500 space-y-6 bg-slate-900/20 border-dashed border-2 border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]"></div>
               <div className="w-24 h-24 rounded-3xl bg-slate-900/50 flex items-center justify-center border border-white/5 shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500">
                 <Activity className="w-10 h-10 text-indigo-500/50" />
               </div>
               <div className="text-center z-10">
                 <p className="text-xl font-bold text-slate-300 mb-2">Ready to Synthesize</p>
                 <p className="text-sm max-w-sm mx-auto text-slate-500">Paste your script and let AI generate perfectly timed voice tags, emotional cues, and high-fidelity music prompts.</p>
               </div>
            </div>
          )}

          {isGenerating && (
            <div className="h-[600px] glass-card rounded-2xl flex flex-col items-center justify-center space-y-8 bg-slate-900/40 relative overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250px_250px] animate-[shimmer_2s_linear_infinite]" />
               <motion.div 
                 animate={{ scale: [1, 1.2, 1] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                 className="flex items-center justify-center space-x-2 relative z-10"
               >
                 {[...Array(5)].map((_, i) => (
                   <motion.div
                     key={i}
                     animate={{ height: ["20px", "60px", "20px"] }}
                     transition={{ repeat: Infinity, duration: 1, delay: i * 0.1, ease: "easeInOut" }}
                     className="w-2 bg-indigo-500 rounded-full"
                   />
                 ))}
               </motion.div>
               <p className="text-indigo-400 font-mono tracking-widest text-sm animate-pulse z-10">ANALYZING FREQUENCY DOMAINS...</p>
            </div>
          )}

          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              
              {/* VOICE PANEL */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-card rounded-2xl p-6 bg-slate-900/60 border border-indigo-500/20 shadow-2xl flex flex-col h-full"
              >
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4 mb-5">
                   <div className="flex items-center gap-3">
                     <div className="bg-indigo-500/20 p-2 rounded-lg">
                       <Mic className="w-5 h-5 text-indigo-400" />
                     </div>
                     <h2 className="text-xl font-bold text-white">Voice Profile</h2>
                   </div>
                   <button 
                     onClick={() => handleCopy(result.voiceAnalysis.formattedScript, 'script')}
                     className="text-slate-400 hover:text-indigo-400 transition-colors p-2 bg-black/20 rounded-lg"
                     title="Copy Formatted Script"
                   >
                     {copiedSection === 'script' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center justify-center flex-col text-center shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Style</span>
                    <span className="text-indigo-300 text-xs font-semibold">{result.voiceAnalysis.voiceStyle}</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center justify-center flex-col text-center shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Speed</span>
                    <span className="text-indigo-300 text-xs font-semibold">{result.voiceAnalysis.narrationSpeed}</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center justify-center flex-col text-center shadow-inner col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Emotional Tone</span>
                    <span className="text-indigo-300 text-xs font-semibold">{result.voiceAnalysis.emotionalTone}</span>
                  </div>
                </div>

                <div className="mb-6 flex-1 flex flex-col">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FileText className="w-3 h-3"/> Formatted AI Script</label>
                  <div className="bg-black/40 border border-indigo-500/10 p-4 rounded-xl flex-1 overflow-y-auto max-h-[250px] shadow-inner relative group">
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="bg-indigo-600 hover:bg-indigo-500 p-1.5 rounded-md text-white transition-colors" title="Simulate Voice (Mock)"><PlayCircle className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-serif" 
                       dangerouslySetInnerHTML={{ 
                         __html: result.voiceAnalysis.formattedScript.replace(/(\[.*?\])/g, '<span class="text-indigo-400 font-mono text-xs bg-indigo-500/10 px-1 py-0.5 rounded border border-indigo-500/20 mx-1">$1</span>') 
                       }} 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Pause & Rhythm Elements</label>
                  <div className="flex flex-wrap gap-2">
                    {result.voiceAnalysis.pauseSuggestions.map((tag, i) => (
                      <span key={i} className="text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded-full flex items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-400" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* MUSIC PANEL */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-card rounded-2xl p-6 bg-slate-900/60 border border-fuchsia-500/20 shadow-2xl flex flex-col h-full"
              >
                <div className="flex items-center justify-between border-b border-fuchsia-500/20 pb-4 mb-5">
                   <div className="flex items-center gap-3">
                     <div className="bg-fuchsia-500/20 p-2 rounded-lg">
                       <Music className="w-5 h-5 text-fuchsia-400" />
                     </div>
                     <h2 className="text-xl font-bold text-white">Music & SFX</h2>
                   </div>
                   <button 
                     onClick={() => handleCopy(result.musicAnalysis.aiMusicPrompt, 'music')}
                     className="text-slate-400 hover:text-fuchsia-400 transition-colors p-2 bg-black/20 rounded-lg"
                     title="Copy Music Prompt"
                   >
                     {copiedSection === 'music' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center justify-center flex-col text-center shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">BGM Style</span>
                    <span className="text-fuchsia-300 text-xs font-semibold">{result.musicAnalysis.bgmStyle}</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center justify-center flex-col text-center shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Tempo</span>
                    <span className="text-fuchsia-300 text-xs font-semibold">{result.musicAnalysis.bpm}</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center justify-center flex-col text-center shadow-inner col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Instrumentation</span>
                    <span className="text-fuchsia-300 text-[11px] font-semibold">{result.musicAnalysis.instruments}</span>
                  </div>
                </div>

                <div className="mb-6 flex-1 flex flex-col">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Activity className="w-3 h-3"/> AI Music Generation Prompt</label>
                  <div className="bg-black/40 border border-fuchsia-500/10 p-4 rounded-xl flex-1 shadow-inner relative group">
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleCopy(result.musicAnalysis.aiMusicPrompt, 'musicPromptBtn')} className="bg-fuchsia-600/50 hover:bg-fuchsia-500 p-1.5 rounded-md text-white transition-colors" title="Copy for Udio/Suno">{copiedSection === 'musicPromptBtn' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}</button>
                    </div>
                    <p className="text-sm text-slate-300 font-mono leading-relaxed">
                      {result.musicAnalysis.aiMusicPrompt}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">SFX Stack</label>
                  <div className="flex flex-wrap gap-2">
                    {result.musicAnalysis.sfxSuggestions.map((sfx, i) => (
                      <span key={i} className="text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded-full flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-cyan-400" /> {sfx}
                      </span>
                    ))}
                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
