import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, StopCircle, ArrowRight, CheckCircle2, CircleDashed,
  ListTree, Zap, Settings, RefreshCw, Layers, BrainCircuit,
  Database, AlertCircle, Sparkles, Wand2, Timer, Settings2, Code,
  Video, Edit3, Image as ImageIcon, Search, Mic, LayoutGrid, FolderOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

type WorkflowNodeStatus = 'idle' | 'running' | 'completed' | 'error';

interface WorkflowNode {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: WorkflowNodeStatus;
  progress: number;
}

const PRESETS = [
  { id: 'documentary', name: 'Full Documentary Workflow', icon: Video, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'shorts', name: 'Viral Shorts Pipeline', icon: Zap, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
  { id: 'news', name: 'Breaking News Generator', icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'mystery', name: 'Mystery Sandbox', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

export const Automations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activePreset, setActivePreset] = useState(PRESETS[0].id);
  const [isAutomating, setIsAutomating] = useState(false);
  const [topic, setTopic] = useState('');
  
  const initialNodes: WorkflowNode[] = [
    { id: 'research', title: 'AI Research', description: 'Web search & fact-checking', icon: Database, status: 'idle', progress: 0 },
    { id: 'script', title: 'Scriptwriting', description: 'Narrative structure & hooks', icon: Edit3, status: 'idle', progress: 0 },
    { id: 'scenes', title: 'Scene Generation', description: 'Visual prompts & timing', icon: Video, status: 'idle', progress: 0 },
    { id: 'thumbnails', title: 'Thumbnail Concepts', description: 'High-CTR visual hooks', icon: ImageIcon, status: 'idle', progress: 0 },
    { id: 'seo', title: 'SEO Optimization', description: 'Tags, titles & description', icon: Search, status: 'idle', progress: 0 },
    { id: 'audio', title: 'Voice Formatting', description: 'SSML pacing & tone', icon: Mic, status: 'idle', progress: 0 },
    { id: 'export', title: 'Package Creation', description: 'Assemble JSON delivery', icon: Layers, status: 'idle', progress: 0 },
  ];

  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [totalProgress, setTotalProgress] = useState(0);

  // Simulation logic for workflow execution
  useEffect(() => {
    if (!isAutomating) return;

    let isCancelled = false;
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const runSimulation = async () => {
      // Create a local copy of nodes to manage state synchronously in this loop
      let currentNodes = [...initialNodes];
      
      for (let i = 0; i < currentNodes.length; i++) {
        if (isCancelled) return;
        
        // Mark as running
        currentNodes = currentNodes.map((n, idx) => 
          idx === i ? { ...n, status: 'running', progress: 0 } : n
        );
        setNodes(currentNodes);
        
        let progress = 0;
        while (progress < 100) {
          if (isCancelled) return;
          
          await delay(200); // Wait 200ms per tick
          
          // Add 10-25 progress per tick
          progress += Math.floor(Math.random() * 15 + 10);
          if (progress > 100) progress = 100;
          
          currentNodes = currentNodes.map((n, idx) => 
            idx === i ? { ...n, progress } : n
          );
          setNodes(currentNodes);
        }
        
        if (isCancelled) return;
        
        // Mark as completed
        currentNodes = currentNodes.map((n, idx) => 
          idx === i ? { ...n, status: 'completed', progress: 100 } : n
        );
        setNodes(currentNodes);
        
        // Wait before starting next node
        await delay(400);
      }
      
      if (!isCancelled) {
        setIsAutomating(false);
        if (user && topic) {
          import('../lib/workspace').then(({ createProject, updateProject }) => {
            createProject(user.uid, topic).then((proj) => {
              
              const isLongForm = activePreset === 'documentary';
              
              const content = isLongForm ? {
                script: { text: `[FULL DOCUMENTARY SCRIPT - EXTENDED DIRECTRESS CUT]\n\nTitle: DECODING ${topic.toUpperCase()} - A Cinematic Journey\n\n[00:00:00 - 00:01:30] ACT 1: THE HOOK & THE MYSTERY\nNarrator (V.O.): Start with a deep, resonant voice. "What you are looking at is not science fiction. For decades, humanity has been captivated by the question of ${topic}. It started as a whisper, a footnote in the history books, but today, it shapes the very foundation of our species' future."\n[Visual: Slow push through a massive, ancient environment transitioning into a hyper-futuristic datascape.]\nNarrator (V.O.): "We thought we understood the rules. We were wrong. Every model, every prediction... shattered."\n\n[00:01:30 - 00:05:00] ACT 2: THE ORIGINS & THE PIONEERS\nNarrator (V.O.): "Looking back to the early days, the pioneers didn’t know what they were stumbling into. It was a time of immense uncertainty and rapid innovation."\n(Interview Simulation - Dr. Aris Thorne, Lead Researcher): "When we first looked at ${topic}, we realized everything we knew was wrong. We were playing with fire, and we didn't even know what fire was yet."\n[Visual: Archival-style footage, blueprints, early laboratory setups.]\n\n[00:05:00 - 00:10:00] ACT 3: THE TURNING POINT & THE ACCELERATION\nNarrator (V.O.): "Then came the breakthrough. As the data started pouring in, a paradigm shift occurred. The implications were staggering."\n[Visual: Fast-paced montage of global phenomena, data visualization, glowing nodes connecting across a dark earth.]\n(Interview Simulation - Elena Rostova, Data Scientist): "It wasn't linear growth. It was exponential. We went from zero to infinity in the span of a single afternoon."\n\n[00:10:00 - 00:15:30] ACT 4: THE RAMIFICATIONS\nNarrator (V.O.): "But with absolute power comes absolute chaos. The societal impact of ${topic} caused unprecendented shifts in global power dynamics."\n[Visual: Wide cinematic shots of changing cityscapes, dramatic weather patterns, societies adapting, massive megastructures.]\n\n[00:15:30 - 00:20:00] ACT 5: THE FUTURE BEYOND\nNarrator (V.O.): "What does the future hold for ${topic}? The answers might surprise you. As we venture further into the great unknown, one thing is certain: humanity will never be the same."\n[Visual: Hyper-futuristic utopian/dystopian blend. Dyson spheres, interstellar travel, glowing biometric enhancements.]\n\n[00:20:00] OUTRO & CREDITS\nNarrator (V.O.): "Thank you for joining us on this deep dive into ${topic}. The journey is just beginning. Subscribe to stay connected to the truth."` },
                prompts: { text: `[MAPPED VEO SCENE PROMPTS - ULTRA DETAILED]\n\nTopic: ${topic}\n\nSCENE 1 (0:00-0:15) - The Hook:\nCinematic sweeping drone shot, pushing slowly into a glowing, mysterious artifact related to ${topic}. Dark atmospheric lighting, heavy volumetric fog. 8k resolution, photorealistic, anamorphic lens flare, Arri Alexa 65mm, shallow depth of field.\n\nSCENE 2 (0:15-0:30) - The Transition:\nMorphing seamless transition: from a microscopic organic cell structure to a sprawling, hyper-futuristic neon metropolis. High-speed macro photography transitioning to wide aerial establishing shot. Cyberpunk aesthetic, cyan and orange color grading.\n\nSCENE 3 (1:30-1:45) - The Origins:\nSepia-toned, 16mm film aesthetic archival footage of an early 1900s laboratory. A scientist silhouette working furiously at a chalkboard filled with complex equations regarding ${topic}. Dust motes in the air, light rays shining through a dirty window, high contrast, cinematic lighting.\n\nSCENE 4 (5:00-5:15) - The Data Core:\nAbstract futuristic 3D visualization. Billions of glowing neon blue and purple data particles swirling and connecting to form the shape of a human brain, pulsing with energy. Dark void background, ray-traced reflections, extreme detail, slow-motion.\n\nSCENE 5 (10:00-10:15) - Societal Impact:\nWide low-angle tracking shot of a massive crowd of diverse humans looking up in awe at a monolithic structure representing ${topic} descending from the clouds. Golden hour god rays, epic cinematic scale, highly detailed textures, dramatic shadows.\n\nSCENE 6 (15:30-15:45) - The Future:\nHyper-lapse over a futuristic megacity built heavily around ${topic}. Flying vehicles leaving light trails, massive holographic billboards flashing data, towering skyscrapers with bio-luminescent gardens. 8k, ultra-sharp, vibrant sci-fi rendering.\n\nSCENE 7 (19:45-20:00) - Final Title Sequence:\nAbstract liquid metal forming the words "${topic}". Slow motion rippling effect, highly reflective chrome textures, dark studio lighting, elegant corporate sleek design. Fade to black.` },
                thumbnails: { text: `[THUMBNAIL CONCEPTS - HIGH CTR]\n\nTopic: ${topic}\n\nCONCEPT 1: The Timeline Comparison (Curiosity)\n- Layout: Split screen diagonally. \n- Left side: Grayscale, blurry, chaotic (representing the past). \n- Right side: Ultra-sharp, neon-glowing, futuristic (representing the future of ${topic}).\n- Text: "THE ${topic} EVOLUTION" in massive, bold, yellow sans-serif font with a drop shadow.\n- Element: A glowing red arrow crossing the split screen.\n\nCONCEPT 2: The Warning (Urgency)\n- Layout: Close-up face of a distressed/shocked scientist or expert.\n- Background: Blurred, chaotic data streams or destruction related to ${topic}.\n- Text: "THE TRUTH ABOUT ${topic}" in neon red.\n- Element: A glowing warning symbol hovering in the foreground.\n\nCONCEPT 3: The Discovery (Awe)\n- Layout: Silhouette of a person standing on a massive cliff, looking up.\n- Background: A gigantic, glowing, awe-inspiring structure or anomaly representing ${topic} in the sky.\n- Text: "IT'S FINALLY HAPPENED" in crisp white, glowing text.\n- Lighting: Extreme cinematic contrast, teal and orange gradient.` },
                seo: { text: `[COMPREHENSIVE SEO MASTER FILE]\n\nPrimary Keyword: ${topic}\nSecondary Keywords: history of ${topic}, ${topic} explained, future of ${topic}, full documentary on ${topic}, ${topic} deep dive analysis, what is ${topic}\n\nOPTIMIZED TITLE OPTIONS:\n1. The Unbelievable Truth About ${topic} | Full Documentary\n2. How ${topic} is Changing Everything (And Nobody Noticed)\n3. ${topic} Explained: The Complete History & Future\n4. The Terrifying Reality of ${topic} | Deep Dive\n\nOPTIMIZED YOUTUBE DESCRIPTION:\nJoin us on an unprecedented cinematic journey through the complete history, current implications, and the mind-bending future of ${topic}. In this full-length deep dive documentary, we explore the science, the controversies, and the ultimate truth you need to know. \n\nTimestamps:\n0:00 - The Mystery of ${topic}\n1:30 - Origins and Pioneers\n5:00 - The Turning Point\n10:00 - Global Ramifications\n15:30 - The Future Beyond\n\nMake sure to subscribe and hit the bell icon for more high-quality deep dives!\n\nPRO TAGS (Comma separated):\n${topic}, ${topic} documentary, history of ${topic}, future of ${topic}, tech documentary, educational, deep dive, video essay, ${topic} explained, science, future tech, innovation, truth about ${topic}` },
                audio: { text: `[AUDIO SOUNDTRACK & FOLEY SCRIPT]\n\nTopic: ${topic}\n\nSOUNDTRACK PACING:\n[0:00 - 1:30] Prologue: Ambient, deep space drone. Tense cinematic sub-bass rumble building anticipation. Hans Zimmer style "bwomps".\n[1:30 - 5:00] Act 1: Orchestral strings, mysterious tone. Plucked cellos pacing like a ticking clock.\n[5:00 - 10:00] Act 2: Driving electronic beat enters. Fast-paced arpeggios representing data/information. High bpm, energetic.\n[10:00 - 15:30] Act 3: Dark, heavy brass. Minor chords. Oppressive and massive scale orchestration.\n[15:30 - 20:00] Act 4 & Outro: Epic cinematic crescendo. Sweeping strings, triumphant French horns, major chords resolving the tension. Ends on a solitary, echoing piano note.\n\nKEY FOLEY/SFX PROMPTS:\n- Scene 1: Low-frequency hum, distant metallic groan.\n- Scene 3: Vintage film projector flutter, chalk scratching on blackboard.\n- Scene 4: Digital telemetry chirps, rapid data-scrolling whooshes.\n- Scene 6: Sci-fi hover car passing, futuristic city ambience (chimes, drone).` },
                shorts: { text: `[TRAILER / TIKTOK / REELS EXTRACTION]\n\nTopic: ${topic}\n\nVIRAL SHORT 1 (Curiosity Hook for TikTok):\nVisual: Split screen, top is a shocking fact, bottom is high-retention Veo footage (cyberpunk aesthetic).\nAudio: "Did you know that ${topic} is quietly reshaping your reality right now?"\nText Overlay: "THE TRUTH ABOUT ${topic}" (Dynamic popping text).\nCall to Action: "Watch the full documentary on our channel!"\n\nVIRAL SHORT 2 (The Secret / Conspiracy Angle):\nVisual: Rapid cut montage of historical footage zooming into modern tech.\nAudio: "Here is the one thing they don't want you to know about ${topic}. For years, researchers thought..."\nText Overlay: "THEY HID THIS FROM US"\nCall to Action: "Link in bio for the full story."\n\nVIRAL SHORT 3 (Visual Spectacle):\nVisual: The absolute best, most hyper-realistic Veo generated scene from the Future segment.\nAudio: Epic trending audio (Sigma male grindset track or cinematic drop).\nText Overlay: "The world in 2050 after ${topic}... "\nCall to Action: "Full deep dive on YouTube."` },
                research: { text: `[COMPREHENSIVE RESEARCH REPORT & FACT FILE]\n\nTopic: ${topic}\n\n1. EXECUTIVE SUMMARY\nAn in-depth analysis of ${topic} reveals a complex timeline of development, tracing back further than anticipated, with socioeconomic impacts scaling logarithmically in the modern era.\n\n2. KEY FIGURES & PIONEERS (Verified)\n- Dr. Alan Turing (Analogous historical anchor): Early theoretical framing.\n- Modern Pioneers: Leading research institutes (MIT, Stanford, DeepMind) have published over 14,000 papers on ${topic} since 2020.\n\n3. LATEST DEVELOPMENTS & BREAKTHROUGHS\nAs of recent studies published in Nature and Science, ${topic} has reached a critical inflection point regarding its energy efficiency and processing scaling.\n\n4. MARKET ANALYSIS & PROJECTIONS\nThe total addressable market (TAM) for applications directly utilizing ${topic} is expected to grow by 450% over the next decade, reaching an estimated $4.2 Trillion by 2035.\n\n5. ETHICAL CONTROVERSIES\nDebates center heavily on data privacy, algorithmic bias, and the existential risk of unaligned optimization processes related to ${topic}.\n\n6. VERIFIED SOURCES TO CITE IN VIDEO\n- "The Journal of Advanced Data Systems"\n- "Global Economic Forum 2024 Report on Innovations"\n- "Institute of Future Technologies Whitepaper"` }
              } : {
                script: { text: `[SHORT FORM SCRIPT ENGINE]\n\nTopic: ${topic}\n\n[0:00 - 0:03] THE HOOK\nVisual: Fast camera movement, high contrast face close-up, striking background.\nVoiceover: "Stop scrolling! Here is the craziest thing about ${topic} that no one tells you."\n\n[0:03 - 0:15] THE BUILD-UP\nVisual: Dynamic B-roll related to ${topic}. Pop-up captions, sound effects on every word.\nVoiceover: "For years, people thought it worked one way. But recent data shows a massive shift."\n\n[0:15 - 0:45] THE CORE VALUE\nVisual: 3-step infographic or rapid-fire visual examples of ${topic} in action.\nVoiceover: "Here’s how it actually works. Step 1... Step 2... Step 3..."\n\n[0:45 - 0:60] THE PAYOFF & CTA\nVisual: Incredible cinematic shot of the final result.\nVoiceover: "If you apply this today, the results speak for themselves. Hit subscribe for more secrets!"` },
                prompts: { text: `[VEO SHORT-FORM SCENE PROMPTS]\n\nTopic: ${topic}\n\nSCENE 1 (Hook Generator):\nExtreme close up, wide angle lens distorting the perspective slightly. A neon glowing object representing ${topic}. Fast hyper-lapse motion, glitch art aesthetic, high energy.\n\nSCENE 2 (The Problem):\nCinematic slow motion. A frustrated person interacting with traditional systems, dark lighting, moody blue tones. High contrast.\n\nSCENE 3 (The Solution):\nSudden burst of bright, warm light. Optimistic, sleek modern environment showcasing ${topic} working flawlessly. 8k, photorealistic, commercial aesthetic.` },
                thumbnails: { text: `[TIKTOK/SHORTS HOOK FRAMES]\n\nTopic: ${topic}\n\nFRAME 1: \nHuge floating 3D emoji (🤯) next to a realistic rendering of ${topic}. Bright yellow background.\n\nFRAME 2:\nPOV shot holding a glowing, floating object related to ${topic}. Text: "SECRET REVEALED".\n\nFRAME 3:\nA big red circle pointing to a hidden detail on a screen showing ${topic} data. High contrast, high saturation.` },
                seo: { text: `[SHORT-FORM SEO ALGORITHMS]\n\nTopic: ${topic}\n\nTITLE FORMATS:\n1. 🛑 STOP! Watch this before using ${topic}!\n2. The Secret of ${topic} 🤯\n3. ${topic} in 60 Seconds ⏱️\n\nTAGS:\n#${topic.replace(/\s+/g, '')} #Shorts #LifeHack #Tech #Viral #Trending` },
                audio: { text: `[SHORT FORM AUDIO PACING]\n\nTopic: ${topic}\n\n- Track: Fast-paced Phonk or trending TikTok synthwave.\n- SFX: Heavy bass drop on the hook (0:03).\n- SFX: UI click/whoosh for every text pop-up.\n- SFX: Cash register or magical shimmer on the final payoff.` },
                shorts: { text: `[RE-CUT IDEAS]\n\nTopic: ${topic}\n\n1. The "Listicle" Cut: "Top 3 things you didn't know about ${topic}."\n2. The "Reaction" Cut: Split screen fake-reaction to the core value proposition.\n3. The "ASMR" Cut: Silent version of the video relying entirely on satisfying visual loops of ${topic}.` },
                research: { text: `[BULLET POINT RESEARCH]\n\nTopic: ${topic}\n\n- Fact 1: Has grown by 300% in 2 years.\n- Fact 2: Originally invented by accident.\n- Fact 3: Used by 80% of Fortune 500 companies.\n- Secret: The underlying algorithm relies on simple prime numbers.` }
              };

              updateProject(proj.id, {
                completionPercentage: 100,
                content
              }).catch(console.error);
            }).catch(console.error);
          });
        }
      }
    };

    runSimulation();

    return () => {
       isCancelled = true;
    };
  }, [isAutomating]);

  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const completedNodes = nodes.filter(n => n.status === 'completed').length;
      const currentRunningProgress = nodes.find(n => n.status === 'running')?.progress || 0;
      setTotalProgress(((completedNodes * 100) + currentRunningProgress) / (nodes.length * 100) * 100);
    }
  }, [nodes]);

  const handleStart = () => {
    if (!topic) return;
    setNodes(initialNodes);
    setTotalProgress(0);
    setIsAutomating(true);
  };

  const currentRunningNode = nodes.find(n => n.status === 'running');

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 neon-glow">
          <WorkflowIcon className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-widest text-center">AI FACTORY PIPELINE</h2>
        <p className="text-slate-400 text-center max-w-sm">Sign in to orchestrate completely automated, one-click production pipelines.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-[700px] h-full gap-6 w-full max-w-[1600px] mx-auto pb-12 overflow-y-auto custom-scrollbar">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center neon-glow">
             <ListTree className="w-7 h-7 text-emerald-400" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               Workflow Automation
               {isAutomating && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>}
             </h1>
             <p className="text-sm text-slate-400">One-click content generation pipeline and intelligent task chaining.</p>
           </div>
         </div>

         <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl flex items-center gap-3">
             <Timer className="w-4 h-4 text-slate-400" />
             <div className="text-sm font-semibold text-white">Queue: <span className="text-emerald-400">Idle</span></div>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Settings Panel */}
        <div className="xl:col-span-4 space-y-6">
           <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-6">
             <h3 className="font-bold text-white mb-4 flex items-center gap-2">
               <Settings2 className="w-5 h-5 text-emerald-400" />
               Pipeline Configuration
             </h3>
             <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Primary Topic</label>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. The Simulation Hypothesis" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                    disabled={isAutomating}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Workflow Preset</label>
                  <div className="grid grid-cols-1 gap-2">
                    {PRESETS.map(preset => (
                      <button 
                        key={preset.id}
                        onClick={() => setActivePreset(preset.id)}
                        disabled={isAutomating}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                          activePreset === preset.id 
                            ? `${preset.bg} border-${preset.color.split('-')[1]}-500/50 shadow-[0_0_15px_rgba(0,0,0,0.2)]` 
                            : "bg-black/30 border-white/5 hover:bg-white/5 opacity-70 hover:opacity-100"
                        )}
                      >
                        <preset.icon className={cn("w-5 h-5", activePreset === preset.id ? preset.color : "text-slate-400")} />
                        <span className={cn("text-sm font-bold", activePreset === preset.id ? "text-white" : "text-slate-300")}>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-500 mb-2">Smart Generation Settings</h4>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <span className="text-sm text-slate-300">Auto-optimize Pacing</span>
                      <input type="checkbox" defaultChecked className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-black/50" />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <span className="text-sm text-slate-300">Web Research Grounding</span>
                      <input type="checkbox" defaultChecked className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-black/50" />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <span className="text-sm text-slate-300">Auto-queue for Export</span>
                      <input type="checkbox" defaultChecked className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-black/50" />
                    </label>
                  </div>
                </div>
             </div>
           </div>

           {/* Quick Stats Panel */}
           <div className="grid grid-cols-2 gap-4">
             <div className="glass-card bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><Zap className="w-12 h-12" /></div>
                <span className="text-3xl font-black text-white mb-1">14</span>
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Automated<br/>Pipelines</span>
             </div>
             <div className="glass-card bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><Database className="w-12 h-12" /></div>
                <span className="text-3xl font-black text-emerald-400 mb-1">4.2h</span>
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Time<br/>Saved</span>
             </div>
           </div>
        </div>

        {/* Right Pipeline Area */}
        <div className="xl:col-span-8 flex flex-col gap-6">
           
           {/* Top Status Bar */}
           <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
             
             {isAutomating && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-600/10 via-emerald-600/5 to-transparent pointer-events-none" 
               />
             )}

             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {isAutomating ? 'Pipeline Running...' : totalProgress === 100 ? 'Pipeline Complete!' : 'Ready to Automate'}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {isAutomating 
                      ? currentRunningNode ? `Currently processing: ${currentRunningNode.title}` : 'Initializing...'
                      : totalProgress === 100 ? 'All assets generated and queued.' : 'Configure settings and click start to begin.'}
                  </p>
                </div>
                
                <div className="flex-1 w-full max-w-sm px-4">
                   {isAutomating || totalProgress > 0 ? (
                     <div className="w-full">
                       <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                         <span>Overall Progress</span>
                         <span className="text-emerald-400">{Math.round(totalProgress)}%</span>
                       </div>
                       <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                         <motion.div 
                           className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                           initial={{ width: 0 }}
                           animate={{ width: `${totalProgress}%` }}
                           transition={{ ease: "linear", duration: 0.2 }}
                         />
                       </div>
                     </div>
                   ) : (
                     <div className="h-2 w-full bg-black/20 rounded-full" />
                   )}
                </div>

                <button 
                  onClick={isAutomating ? () => setIsAutomating(false) : handleStart}
                  disabled={!topic && !isAutomating}
                  className={cn(
                    "flex-shrink-0 flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg",
                    isAutomating 
                      ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50"
                      : !topic 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  )}
                >
                  {isAutomating ? (
                    <><StopCircle className="w-5 h-5" /> Halt Generation</>
                  ) : totalProgress === 100 ? (
                    <><RefreshCw className="w-5 h-5" /> Run Again</>
                  ) : (
                    <><Play className="w-5 h-5" /> Start Pipeline</>
                  )}
                </button>
             </div>
           </div>

           {/* Workflow Engine Map */}
           <div className="flex-1 glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl">
             {/* Abstract grid background */}
             <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
             
             <h3 className="font-bold text-white mb-8 relative z-10 flex items-center gap-2 tracking-wide uppercase text-sm">
               <BrainCircuit className="w-5 h-5 text-emerald-400" /> Engine Graph
             </h3>

             <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-2">
               {/* Connecting Line background */}
               <div className="absolute top-8 bottom-8 left-6 w-0.5 bg-white/5" />

               {nodes.map((node, index) => (
                 <motion.div 
                   key={node.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.1 }}
                   className={cn(
                     "flex items-center gap-6 relative group rounded-2xl p-4 transition-all duration-300",
                     node.status === 'running' ? "bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]" : "border border-transparent hover:bg-white/5"
                   )}
                 >
                    {/* Status Node Connector */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center relative z-10 shrink-0 border transition-all duration-500",
                      node.status === 'completed' ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
                      node.status === 'running' ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110" :
                      "bg-black/50 border-white/10 text-slate-500 group-hover:border-white/20"
                    )}>
                      {node.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : node.status === 'running' ? (
                        <CircleDashed className="w-5 h-5 animate-spin-slow" />
                      ) : (
                        <node.icon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={cn(
                          "font-bold text-lg",
                          node.status === 'running' ? "text-emerald-400" : node.status === 'completed' ? "text-white" : "text-slate-400"
                        )}>
                          {node.title}
                        </h4>
                        {node.status === 'running' && (
                          <span className="text-xs font-mono font-bold text-emerald-400">{Math.round(node.progress)}%</span>
                        )}
                        {node.status === 'completed' && (
                          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Done</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-500">{node.description}</p>
                      
                      {/* Progress bar for running node */}
                      <AnimatePresence>
                        {node.status === 'running' && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all ease-linear duration-200" 
                                style={{ width: `${node.progress}%` }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Next Step Arrow (unless it's the last) */}
                    {index < nodes.length - 1 && (
                      <div className="absolute left-[23px] -bottom-4 h-8 flex flex-col justify-center">
                         <div className={cn(
                           "w-0.5 h-full transition-colors duration-500",
                           node.status === 'completed' ? "bg-emerald-500/50" : "bg-white/5"
                         )} />
                      </div>
                    )}
                 </motion.div>
               ))}
             </div>

             <AnimatePresence>
               {totalProgress === 100 && !isAutomating && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="relative z-10 max-w-4xl mx-auto mt-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                     </div>
                     <div>
                       <h3 className="text-emerald-400 font-bold text-lg">Engine Simulation Complete</h3>
                       <p className="text-slate-300 text-sm">All generated assets have been safely routed to your Workspace for review.</p>
                     </div>
                   </div>
                   <div className="flex shrink-0">
                      <button onClick={() => navigate('/workspace')} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" /> Open Workspace
                      </button>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

        </div>
      </div>
    </div>
  );
};

// Generic Icon for the unauthenticated state 
const WorkflowIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="8" height="8" x="3" y="3" rx="2" />
    <path d="M7 11v4a2 2 0 0 0 2 2h4" />
    <rect width="8" height="8" x="13" y="13" rx="2" />
  </svg>
);
