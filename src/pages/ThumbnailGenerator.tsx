import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ImageIcon, Wand2, Loader2, Copy, CheckCircle2, 
  Settings2, Download, FileJson, FileText, 
  MousePointer2, Eye, Zap, Camera, Move, LayoutPanelLeft, User
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CTRAnalysis {
  curiosityScore: number;
  emotionalImpact: string;
  visualContrast: string;
}

interface ThumbnailConcept {
  id: string;
  titleIdea: string;
  thumbnailConcept: string;
  mainSubject: string;
  background: string;
  textPlacement: string;
  facialExpression: string;
  lighting: string;
  aiImagePrompt: string;
  ctrAnalysis: CTRAnalysis;
}

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["2deg", "-2deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-2deg", "2deg"]);

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
      <div style={{ transform: "translateZ(20px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

export const ThumbnailGenerator = () => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('MrBeast style');
  const [emotionType, setEmotionType] = useState('Shocked');
  const [textStyle, setTextStyle] = useState('Bold Yellow Outline');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [colorMood, setColorMood] = useState('High Contrast');
  const [targetAi, setTargetAi] = useState('Midjourney');

  const [faceFocus, setFaceFocus] = useState(true);
  const [highCtr, setHighCtr] = useState(true);
  const [autoText, setAutoText] = useState(true);
  const [targetVariations, setTargetVariations] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [concepts, setConcepts] = useState<ThumbnailConcept[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setConcepts([]);
    setError(null);

    const advancedOpts = [
      faceFocus ? 'Face Focus Mode' : '',
      highCtr ? 'High CTR Optimization' : '',
      autoText ? 'Auto Text Suggestions' : '',
      targetVariations ? 'Provide 2 A/B Variations' : 'Provide 1 Concept',
    ].filter(Boolean).join(', ');

    let styleConstraints = '';
    if (style === 'Vigyan Recharge style') {
      styleConstraints = `
VIGYAN RECHARGE THUMBNAIL STYLE RULES:
- Vibe: Dark cinematic atmosphere, mystery-focused visuals, realistic scientific visuals.
- Lighting: High contrast lighting, glowing elements in the dark.
- Subject: Big emotional subjects, clearly visible despite dark atmosphere.
- Text: Viral curiosity text that asks a question or hints at a secret.
`;
    }

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate highly optimized YouTube thumbnail concepts and AI image prompts for the given video topic.

INPUTS:
- Video Topic: ${topic}
- Style: ${style}
- Emotion: ${emotionType}
- Text Style: ${textStyle}
- Aspect Ratio: ${aspectRatio}
- Color Mood: ${colorMood}
- Target AI Model: ${targetAi}

ADVANCED:
${advancedOpts}
${styleConstraints}
RULES:
- Return ONLY a valid JSON array of objects. 
- Do NOT wrap the JSON in Markdown formatting like \`\`\`json.
- Each object MUST represent a thumbnail concept.
- Prompts must be highly optimized specifically for ${targetAi}.
- Number of objects in the array: ${targetVariations ? 2 : 1}.

JSON STRUCTURE:
[
  {
    "id": "concept-1",
    "titleIdea": "String",
    "thumbnailConcept": "String",
    "mainSubject": "String",
    "background": "String",
    "textPlacement": "String",
    "facialExpression": "String",
    "lighting": "String",
    "aiImagePrompt": "String",
    "ctrAnalysis": {
      "curiosityScore": Number (1-100),
      "emotionalImpact": "String",
      "visualContrast": "String"
    }
  }
]
`,
          systemInstruction: "You are an expert YouTube strategist and AI prompt engineer. Output strictly raw JSON array without markdown blocks."
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate content');
      
      let text = data.text.trim();
      if (text.startsWith('\`\`\`json')) {
        text = text.replace(/^\`\`\`json\n?/, '').replace(/\n?\`\`\`$/, '');
      } else if (text.startsWith('\`\`\`')) {
        text = text.replace(/^\`\`\`\n?/, '').replace(/\n?\`\`\`$/, '');
      }

      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setConcepts(parsed);
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
    if (!concepts.length) return;
    const txt = concepts.map(c => `TITLE IDEA:\n${c.titleIdea}\n\nTHUMBNAIL CONCEPT:\n${c.thumbnailConcept}\n\nMAIN SUBJECT:\n${c.mainSubject}\n\nBACKGROUND:\n${c.background}\n\nTEXT PLACEMENT:\n${c.textPlacement}\n\nFACIAL EXPRESSION:\n${c.facialExpression}\n\nLIGHTING:\n${c.lighting}\n\nAI IMAGE PROMPT:\n${c.aiImagePrompt}\n\nCTR ANALYSIS:\n- Curiosity Score: ${c.ctrAnalysis.curiosityScore}/100\n- Emotional Impact: ${c.ctrAnalysis.emotionalImpact}\n- Visual Contrast: ${c.ctrAnalysis.visualContrast}`).join('\n\n============================\n\n');
    downloadBlob(txt, 'text/plain', 'thumbnail_prompts.txt');
  };

  const handleExportJson = () => {
    if (!concepts.length) return;
    downloadBlob(JSON.stringify(concepts, null, 2), 'application/json', 'thumbnail_prompts.json');
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
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center neon-glow">
            <ImageIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Thumbnail Concepts</h1>
            <p className="text-slate-400">Generate high-CTR thumbnail ideas and AI prompts.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExportJson} disabled={!concepts.length} className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50 text-slate-300">
             <FileJson className="w-4 h-4" /> JSON
           </button>
           <button onClick={handleExportText} disabled={!concepts.length} className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50 text-slate-300">
             <FileText className="w-4 h-4" /> TXT
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" style={{ perspective: "1200px" }}>
        
        {/* Left Config Panel */}
        <div className="lg:col-span-4 space-y-6">
          <TiltCard className="h-full">
            <div className="glass-card p-6 rounded-2xl space-y-6 h-full flex flex-col bg-slate-900/40 border border-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.05)] backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Video Topic / Title</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. I Spent 50 Hours In Antarctica"
                  className="w-full min-h-[100px] bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50 transition-all resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Style</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-cyan-500">
                    <option value="MrBeast style">MrBeast style</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Cinematic">Cinematic</option>
                    <option value="Educational">Educational</option>
                    <option value="Horror">Horror</option>
                    <option value="Viral">Viral</option>
                    <option value="Futuristic">Futuristic</option>
                    <option value="Dhruv Rathee style">Dhruv Rathee style</option>
                    <option value="Vigyan Recharge style">Vigyan Recharge style</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Target AI</label>
                  <select value={targetAi} onChange={(e) => setTargetAi(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-cyan-500">
                    <option value="Midjourney">Midjourney</option>
                    <option value="Nano Banana">Nano Banana</option>
                    <option value="Flux">Flux</option>
                    <option value="DALL·E">DALL·E</option>
                    <option value="Leonardo AI">Leonardo AI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Emotion</label>
                  <select value={emotionType} onChange={(e) => setEmotionType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-cyan-500">
                    <option value="Shocked">Shocked</option>
                    <option value="Curious">Curious</option>
                    <option value="Angry">Angry</option>
                    <option value="Happy">Happy</option>
                    <option value="Desperate">Desperate</option>
                    <option value="Fearful">Fearful</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Aspect Ratio</label>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-cyan-500">
                    <option value="16:9">16:9 (Desktop/Standard)</option>
                    <option value="9:16">9:16 (Shorts/Mobile)</option>
                    <option value="1:1">1:1 (Square)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Text Style</label>
                  <select value={textStyle} onChange={(e) => setTextStyle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-cyan-500">
                    <option value="Bold Yellow Outline">Bold Yellow</option>
                    <option value="Minimalist White">Minimalist</option>
                    <option value="Neon Glow">Neon Glow</option>
                    <option value="3D Block">3D Block</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Color Mood</label>
                  <select value={colorMood} onChange={(e) => setColorMood(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-cyan-500">
                    <option value="High Contrast">High Contrast</option>
                    <option value="Dark/Moody">Dark/Moody</option>
                    <option value="Bright/Colorful">Bright/Colorful</option>
                    <option value="Cinematic Teal/Orange">Teal/Orange</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <label className="block text-sm font-medium text-cyan-400 mb-3 flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Advanced Features
                </label>
                {[
                  { label: 'Face Focus Mode', state: faceFocus, setter: setFaceFocus },
                  { label: 'High CTR Optimization', state: highCtr, setter: setHighCtr },
                  { label: 'Auto Text Suggestions', state: autoText, setter: setAutoText },
                  { label: 'Generate A/B Variations', state: targetVariations, setter: setTargetVariations },
                ].map((toggle, i) => (
                  <label key={i} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={cn(
                      "w-5 h-5 rounded flex items-center justify-center border transition-all",
                      toggle.state ? "bg-cyan-600 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]" : "bg-black/40 border-white/10 group-hover:border-white/20"
                    )}>
                      {toggle.state && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{toggle.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!topic || isGenerating}
                className="w-full mt-auto flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] z-10"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Concepts</span>
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

          {!isGenerating && concepts.length === 0 && !error && (
            <div className="h-[600px] glass-card rounded-2xl flex flex-col items-center justify-center text-slate-500 space-y-6 bg-slate-900/20 border-dashed border-2 border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]"></div>
               <div className="w-24 h-24 rounded-3xl bg-slate-900/50 flex items-center justify-center border border-white/5 shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500">
                 <ImageIcon className="w-10 h-10 text-cyan-500/50" />
               </div>
               <div className="text-center z-10">
                 <p className="text-xl font-bold text-slate-300 mb-2">Ready to Design</p>
                 <p className="text-sm max-w-sm mx-auto text-slate-500">Define your topic and style on the left, and let AI generate highly clickable thumbnail Prompts & psychological analysis.</p>
               </div>
            </div>
          )}

          {isGenerating && (
            <div className="h-[600px] glass-card rounded-2xl flex flex-col items-center justify-center space-y-8 bg-slate-900/40 relative overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250px_250px] animate-[shimmer_2s_linear_infinite]" />
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                 className="w-24 h-24 rounded-full border-b-2 border-cyan-500 relative z-10"
               />
               <p className="text-cyan-400 font-mono tracking-widest text-sm animate-pulse z-10">SYNTHESIZING VIRAL CONCEPTS...</p>
            </div>
          )}

          {concepts.length > 0 && (
            <div className="space-y-8">
              {concepts.map((concept, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  key={concept.id || idx} 
                  className="glass-card rounded-2xl p-0 overflow-hidden bg-slate-900/60 border border-cyan-500/20 shadow-2xl flex flex-col"
                >
                  <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 border-b border-cyan-500/20 p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                     <div>
                       <div className="flex items-center gap-3 mb-2">
                         <span className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2 py-1 rounded tracking-wide">OPTION {idx + 1}</span>
                         <h2 className="text-xl font-bold text-white">{concept.titleIdea}</h2>
                       </div>
                       <p className="text-sm text-slate-400">{concept.thumbnailConcept}</p>
                     </div>
                     <button 
                       onClick={() => handleCopy(concept.aiImagePrompt, `prompt-${idx}`)}
                       className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] shrink-0"
                     >
                       {copiedId === `prompt-${idx}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                       <span>Copy Prompt</span>
                     </button>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Visual Breakdown */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold tracking-widest text-slate-500 border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-cyan-500" /> VISUAL BREAKDOWN
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-cyan-500 block mb-1">MAIN SUBJECT & EXPRESSION</span>
                          <p className="text-sm text-white/90 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                             {concept.mainSubject} — <span className="text-cyan-300 italic">{concept.facialExpression}</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-cyan-500 block mb-1">BACKGROUND & LIGHTING</span>
                          <p className="text-sm text-white/90 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                             {concept.background} — <span className="text-yellow-200/80 italic">{concept.lighting}</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-cyan-500 block mb-1 flex items-center gap-1.5"><LayoutPanelLeft className="w-3 h-3" /> TEXT PLACEMENT</span>
                          <p className="text-sm text-fuchsia-300/90 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5 font-medium">
                             {concept.textPlacement}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 flex flex-col">
                      <h3 className="text-xs font-bold tracking-widest text-slate-500 border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" /> PERFORMANCE ANALYSIS
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-3 mb-6">
                         <div className="bg-black/30 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                           <span className="text-2xl font-bold text-cyan-400 mb-1">{concept.ctrAnalysis.curiosityScore}</span>
                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Curiosity</span>
                         </div>
                         <div className="bg-black/30 border border-white/5 p-3 rounded-xl flex flex-col items-center flex-1 col-span-2 justify-center text-center">
                           <span className="text-sm font-bold text-slate-300 mb-1">{concept.ctrAnalysis.emotionalImpact}</span>
                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Emotion</span>
                         </div>
                      </div>

                      <div className="mt-auto">
                        <span className="text-[10px] font-bold tracking-wider text-cyan-500 block mb-2 flex items-center gap-1.5"><Wand2 className="w-3 h-3"/> RAW AI PROMPT ({targetAi})</span>
                        <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/20 relative group">
                          <p className="text-sm text-slate-300 font-mono leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all">
                            {concept.aiImagePrompt}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                  
                  {/* Interactive Drag & Drop Layout Mockup */}
                  <div className="bg-black/40 border-t border-white/5 p-6" ref={containerRef}>
                    <h3 className="text-xs font-bold tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                      <Move className="w-4 h-4 text-slate-400" /> LIVE LAYOUT PREVIEW (DRAGGABLE)
                    </h3>
                    
                    <div 
                      className={cn(
                        "relative bg-slate-900 border-2 border-dashed border-slate-700 rounded-lg overflow-hidden mx-auto transition-all",
                        aspectRatio === '16:9' ? 'aspect-video w-full max-w-[600px]' : 
                        aspectRatio === '9:16' ? 'aspect-[9/16] h-[500px] w-auto' : 
                        'aspect-square h-[400px] w-auto'
                      )}
                    >
                      {/* Background Layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-50 flex items-center justify-center p-8 text-center pointer-events-none">
                         <span className="text-slate-600 font-serif italic text-sm">{concept.background}</span>
                      </div>
                      
                      {/* Emotion Overlay (Simulated Lighting) */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {/* Main Subject Mockup */}
                      <motion.div 
                        drag 
                        dragConstraints={containerRef}
                        whileHover={{ scale: 1.05 }}
                        whileDrag={{ scale: 1.1, zIndex: 50 }}
                        className="absolute bottom-4 right-4 w-1/3 aspect-[3/4] bg-cyan-900/40 border border-cyan-500/30 rounded-xl backdrop-blur-sm flex flex-col items-center justify-center cursor-move p-2 shadow-2xl text-center"
                      >
                         <User className="w-8 h-8 text-cyan-400 mb-2 opacity-50" />
                         <span className="text-[10px] font-bold text-cyan-200 uppercase">{concept.facialExpression}</span>
                      </motion.div>

                      {/* Text Mockup */}
                      <motion.div 
                        drag 
                        dragConstraints={containerRef}
                        whileHover={{ scale: 1.05 }}
                        whileDrag={{ scale: 1.1, zIndex: 50 }}
                        className="absolute top-8 left-8 max-w-[60%] cursor-move rotate-[-2deg]"
                      >
                        <h2 
                          className={cn(
                            "font-black text-3xl leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]",
                            textStyle.includes('Yellow') ? "text-yellow-400 uppercase tracking-tighter" : 
                            textStyle.includes('Neon') ? "text-fuchsia-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]" : 
                            "text-white uppercase tracking-tight"
                          )}
                          dangerouslySetInnerHTML={{ __html: concept.titleIdea.split(' ').map((w, i) => i > 0 && i % 2 === 0 ? `<br/>${w}` : w).join(' ') }}
                        />
                      </motion.div>

                    </div>
                    <p className="text-center text-[10px] text-slate-500 mt-3 font-mono">DRAG ELEMENTS TO PLAN YOUR COMPOSITION</p>
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

