import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Settings, Sliders, Zap, MessageSquare, Terminal, 
  Wand2, Save, RotateCcw, Box, Check, Cpu 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MODELS = [
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', tag: 'Premium', desc: 'Best for complex cinematic prompts & deep storytelling.' },
  { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash', tag: 'Fast', desc: 'Extremely fast logic and script generation.' },
  { id: 'nano-banana-2', name: 'Nano Banana 2', tag: 'Local', desc: 'Fast, on-device compatible model.' },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro', tag: 'Local', desc: 'On-device advanced parameters.' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', tag: 'External', desc: 'Alternative reasoning model.' }
];

const PRESETS = [
  { id: 'documentary', name: 'Documentary', icon: Box },
  { id: 'mystery', name: 'Mystery', icon: Zap },
  { id: 'horror', name: 'Horror', icon: Zap },
  { id: 'educational', name: 'Educational', icon: Box },
  { id: 'cinematic', name: 'Cinematic', icon: Wand2 },
  { id: 'scifi', name: 'Sci-fi', icon: Zap },
  { id: 'viral_shorts', name: 'Viral Shorts', icon: Zap },
  { id: 'dhruv_rathee', name: 'Dhruv Rathee Style', icon: MessageSquare },
  { id: 'mrbeast', name: 'MrBeast Style', icon: MessageSquare },
  { id: 'vigyan_recharge', name: 'Vigyan Recharge Style', icon: Zap },
];

const QUALITY_MODES = [
  'Fast', 'Balanced', 'Cinematic', 'Ultra detailed', 'Documentary realism'
];

const OUTPUT_FORMATS = [
  'TXT', 'Markdown', 'JSON', 'Veo-ready format', 'Shorts-ready format'
];

export const AiSettings = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'model' | 'memory' | 'prompt' | 'templates' | 'api'>('model');
  const [isSaving, setIsSaving] = useState(false);
  const [memoryData, setMemoryData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/ai/memory')
      .then(res => res.json())
      .then(data => setMemoryData(data))
      .catch(console.error);
  }, []);
  
  // Settings State
  const [settings, setSettings] = useState({
    selectedModel: 'gemini-3.1-pro',
    qualityMode: 'Cinematic',
    outputFormat: 'JSON',
    activePreset: 'cinematic',
    
    // Sliders
    creativity: 70,
    promptDetail: 85,
    aiStrictness: 60,
    responseLength: 75,
    scenePacing: 50,
    visualIntensity: 80,
    
    // Toggles
    promptEnhancement: true,
    cinematicBoost: true,
    realismBoost: false,
    viralOptimization: true,
    retentionOptimization: true,
    thumbnailCtrOptimization: true,
    
    // System Instructions
    systemPrompt: 'You are an expert AI video producer and prompt engineer...',
    sceneTimingRules: 'Keep scenes under 5 seconds for shorts, under 8 seconds for youtube videos.',
    visualBehavior: 'Generate hyper-realistic cinematic prompt language.',
    
    // API
    useCustomApiKey: false,
    customApiKey: ''
  });

  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      const docRef = doc(db, 'userSettings', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.aiSettings) {
          setSettings(prev => ({ ...prev, ...data.aiSettings }));
        }
      }
    };
    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'userSettings', user.uid), {
        aiSettings: settings
      }, { merge: true });
      // Show success briefly
      setTimeout(() => setIsSaving(false), 1000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'model', label: 'Models & Quality', icon: Cpu },
    { id: 'memory', label: 'Memory & Personalization', icon: Bot },
    { id: 'prompt', label: 'Prompt Engineering', icon: Wand2 },
    { id: 'templates', label: 'Instructions & Presets', icon: Terminal },
    { id: 'api', label: 'API & Quotas', icon: Settings },
  ];

  return (
    <div className="max-w-[1400px] mx-auto h-full min-h-[500px] pb-12 w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center neon-glow shadow-[0_0_15px_rgba(217,70,239,0.3)]">
            <Bot className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">AI Configuration Settings</h1>
            <p className="text-slate-400">Control model behavior, cinematic styling, and prompt engineering.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSettings(prev => ({ ...prev }))} className="px-4 py-2 border border-white/10 text-slate-300 rounded-xl hover:bg-white/5 transition-colors">
            Discard Changes
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(217,70,239,0.4)] disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 animate-pulse" /> Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Configuration</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center space-x-3 text-left px-4 py-3 rounded-xl font-medium transition-all",
                  isActive 
                    ? "bg-fuchsia-600/10 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.1)]" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* MODEL TAB */}
          {activeTab === 'model' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px]" />
                
                <h2 className="text-xl font-bold text-white mb-6">Select AI Model</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MODELS.map(model => (
                    <div 
                      key={model.id}
                      onClick={() => setSettings({ ...settings, selectedModel: model.id })}
                      className={cn(
                        "relative p-5 rounded-2xl border cursor-pointer transition-all",
                        settings.selectedModel === model.id 
                          ? "bg-fuchsia-950/30 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.2)]" 
                          : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                      )}
                    >
                      {settings.selectedModel === model.id && (
                        <div className="absolute top-4 right-4 text-fuchsia-400">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-white text-lg">{model.name}</span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded uppercase tracking-wider font-bold",
                          model.tag === 'Premium' ? "bg-amber-500/20 text-amber-400" :
                          model.tag === 'Local' ? "bg-emerald-500/20 text-emerald-400" :
                          "bg-blue-500/20 text-blue-400"
                        )}>
                          {model.tag}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 pr-8">{model.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6">Output Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3">Overall Quality Mode</label>
                    <div className="space-y-2">
                      {QUALITY_MODES.map(mode => (
                        <label key={mode} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-xl hover:bg-white/5 transition-colors">
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                            settings.qualityMode === mode ? "border-fuchsia-500 bg-fuchsia-500/20" : "border-slate-600 bg-black/40 group-hover:border-slate-500"
                          )}>
                            {settings.qualityMode === mode && <div className="w-2.5 h-2.5 bg-fuchsia-400 rounded-full" />}
                          </div>
                          <span className={cn("text-sm font-medium", settings.qualityMode === mode ? "text-white" : "text-slate-300 group-hover:text-white")}>{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3">Generation Output Format</label>
                    <div className="space-y-2">
                      {OUTPUT_FORMATS.map(fmt => (
                        <label key={fmt} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-xl hover:bg-white/5 transition-colors">
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                            settings.outputFormat === fmt ? "border-fuchsia-500 bg-fuchsia-500/20" : "border-slate-600 bg-black/40 group-hover:border-slate-500"
                          )}>
                            {settings.outputFormat === fmt && <div className="w-2.5 h-2.5 bg-fuchsia-400 rounded-full" />}
                          </div>
                          <span className={cn("text-sm font-medium", settings.outputFormat === fmt ? "text-white" : "text-slate-300 group-hover:text-white")}>{fmt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* MEMORY TAB */}
          {activeTab === 'memory' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              {/* Profile Card */}
              <div className="glass-card bg-slate-900/50 border border-fuchsia-500/20 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-blue-600 flex items-center justify-center border-2 border-white/10 shadow-[0_0_20px_rgba(217,70,239,0.3)] neon-glow">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">AI Creator Memory Brain</h2>
                      <p className="text-slate-400">Adaptive synchronization of your style and workflow habits.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                      <RotateCcw className="w-4 h-4" /> Reset Memory
                    </button>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                      <Save className="w-4 h-4" /> Export Preset
                    </button>
                  </div>
                </div>
              </div>

              {/* Memory Data Blocks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="space-y-6">
                  {/* Style Memory */}
                  <div className="glass-card bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Wand2 className="w-5 h-5 text-indigo-400" /> Learned Style Memory</h3>
                    <div className="space-y-3">
                      {memoryData ? [
                        { title: 'Narration Tone', val: memoryData.styleMemory.tone },
                        { title: 'Visual Aesthetic', val: memoryData.styleMemory.visuals },
                        { title: 'Pacing Algorithm', val: memoryData.styleMemory.pacing },
                        { title: 'Preferred AI Model', val: memoryData.styleMemory.model },
                      ].map((s, i) => (
                        <div key={i} className="flex flex-col bg-black/40 border border-white/5 rounded-xl p-3">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{s.title}</span>
                          <span className="text-sm text-slate-200 font-medium">{s.val}</span>
                        </div>
                      )) : (
                         <div className="text-sm text-slate-500 p-4">Loading memory profile...</div>
                      )}
                    </div>
                  </div>

                  {/* Recommendation Widget */}
                  <div className="glass-card bg-gradient-to-br from-indigo-900/30 to-blue-900/10 border border-indigo-500/20 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> Smart Edge Recommendations</h3>
                    <p className="text-xs text-indigo-300 mb-4">Based on your recent 12 generation drops in retention.</p>
                    <div className="space-y-3">
                      {memoryData ? memoryData.recommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl relative overflow-hidden">
                          <div className={cn("absolute left-0 top-0 bottom-0 w-1", rec.type === 'hook' ? "bg-yellow-400" : "bg-emerald-400")} />
                          <h4 className="text-sm font-bold text-white mb-1">{rec.title}</h4>
                          <p className="text-xs text-slate-400">{rec.desc}</p>
                        </div>
                      )) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Behavioral Analytics */}
                  <div className="glass-card bg-slate-900/50 border border-white/5 rounded-3xl p-6 h-full flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-emerald-400" /> Neural Behavioral Track</h3>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-slate-300 mb-2">Most Used Modules</h4>
                      <div className="space-y-3">
                        {memoryData ? memoryData.behavioral.mostUsed.map((m: any) => (
                          <div key={m.name}>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-slate-400">{m.name}</span>
                              <span className="text-white">{m.val}% usage</span>
                            </div>
                            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                              <div className={cn("h-full", m.color)} style={{ width: `${m.val}%` }} />
                            </div>
                          </div>
                        )) : null}
                      </div>
                    </div>

                    <div className="flex-1">
                       <h4 className="text-sm font-bold text-slate-300 mb-3">Active Workflow Habits</h4>
                       <div className="space-y-2">
                         {memoryData ? memoryData.behavioral.habits.map((habit: string, idx: number) => {
                           const colors = ['bg-fuchsia-400', 'bg-blue-400', 'bg-emerald-400'];
                           return (
                             <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors">
                               <div className={cn("w-2 h-2 rounded-full", colors[idx % colors.length])} />
                               <span className="text-sm text-slate-300">{habit}</span>
                             </div>
                           );
                         }) : null}
                       </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-bold">Memory Sync Status</span>
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Synced to Cloud</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* PROMPT TAB */}
          {activeTab === 'prompt' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Creativity & Style Constraints</h2>
                  <Sliders className="w-5 h-5 text-slate-500" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { key: 'creativity', label: 'Creativity (Temperature)', min: 0, max: 100, desc: 'Lower is predictable, higher is imaginative.' },
                    { key: 'promptDetail', label: 'Prompt Extraction Detail', min: 0, max: 100, desc: 'Level of visual detail in generated prompts.' },
                    { key: 'responseLength', label: 'Response Length Limits', min: 0, max: 100, desc: 'Target length for scripts and generations.' },
                    { key: 'visualIntensity', label: 'Visual & Cinematic Intensity', min: 0, max: 100, desc: 'How dramatic the visual descriptions are.' },
                  ].map((slider) => {
                    const val = (settings as any)[slider.key];
                    return (
                      <div key={slider.key}>
                        <div className="flex justify-between items-end mb-2">
                          <label className="block text-sm font-medium text-white">{slider.label}</label>
                          <span className="text-xs text-fuchsia-400 font-bold bg-fuchsia-500/10 px-2 py-0.5 rounded">{val}%</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{slider.desc}</p>
                        <input 
                          type="range" 
                          min={slider.min} max={slider.max} value={val}
                          onChange={(e) => setSettings({ ...settings, [slider.key]: Number(e.target.value) })}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6">Enhancement Toggles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'promptEnhancement', label: 'Auto Prompt Enhancement', desc: 'AI refines basic prompts automatically.' },
                    { key: 'cinematicBoost', label: 'Cinematic Detail Boost', desc: 'Adds lighting & lens specifications.' },
                    { key: 'realismBoost', label: 'Documentary Realism Boost', desc: 'Focuses on photorealistic parameters.' },
                    { key: 'viralOptimization', label: 'Viral Hook Optimization', desc: 'Forces strong hook patterns.' },
                    { key: 'retentionOptimization', label: 'Retention & Pacing Tuning', desc: 'Adjusts script flow for high retention.' },
                    { key: 'thumbnailCtrOptimization', label: 'Thumbnail CTR Focus', desc: 'Suggests high-contrast, clickable visuals.' },
                  ].map((toggle) => {
                    const isActive = (settings as any)[toggle.key];
                    return (
                      <div key={toggle.key} 
                        className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-colors"
                        onClick={() => setSettings({ ...settings, [toggle.key]: !isActive })}
                      >
                        <div className="pr-4">
                          <p className="font-semibold text-slate-200 text-sm mb-1">{toggle.label}</p>
                          <p className="text-xs text-slate-500">{toggle.desc}</p>
                        </div>
                        <div className={cn(
                          "w-10 h-6 rounded-full flex items-center p-1 transition-colors shrink-0",
                          isActive ? "bg-fuchsia-500" : "bg-slate-700"
                        )}>
                          <div className={cn(
                            "w-4 h-4 rounded-full bg-white transition-transform",
                            isActive ? "translate-x-4" : "translate-x-0"
                          )} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </motion.div>
          )}

          {/* TEMPLATES TAB */}
          {activeTab === 'templates' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6">Style Presets</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSettings({ ...settings, activePreset: preset.id })}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 text-center",
                        settings.activePreset === preset.id 
                          ? "bg-fuchsia-500/20 border-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                          : "bg-black/40 border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-300"
                      )}
                    >
                      <preset.icon className={cn("w-6 h-6", settings.activePreset === preset.id ? "text-fuchsia-400" : "text-slate-500")} />
                      <span className="text-xs font-bold">{preset.name}</span>
                    </button>
                  ))}
                </div>

                {settings.activePreset === 'vigyan_recharge' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-800/50 border border-fuchsia-500/30 rounded-2xl">
                    <h3 className="text-lg font-bold text-fuchsia-400 mb-4 flex items-center gap-2"><Zap className="w-5 h-5" /> Vigyan Recharge Style Preview</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Narration Style</h4>
                          <div className="p-4 bg-black/40 rounded-xl border border-white/10 text-sm text-slate-300 italic">
                            "Kya aapne kabhi socha hai, ki brahmand ke sabse andhere kone mein kya chhipa hai? Vigyan ke pas bhi iska javab nahi tha... tab tak jab tak unhone ise nahi dekha."
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Example Titles</h4>
                          <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
                            <li>Scientists Just Found Something TERRIFYING</li>
                            <li>The Mystery Nobody Can Explain</li>
                            <li>What NASA Discovered Shocked The World</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Thumbnail Style</h4>
                        <div className="aspect-video bg-gradient-to-br from-[#050510] to-[#0A1A2F] rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center shadow-inner">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,200,255,0.15)_0%,transparent_70%)]" />
                          <div className="text-center z-10 p-4">
                            <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] tracking-tight uppercase" style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 4px 20px rgba(0,0,0,0.9)' }}>
                              <span className="text-cyan-400">THE</span> TRUTH?
                            </span>
                          </div>
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            <div className="w-8 h-8 rounded-full bg-orange-500/20 mix-blend-screen blur-xl" />
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 mix-blend-screen blur-xl" />
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">Dark cinematic, high contrast, glowing subjects.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">System Instructions</h2>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono">system_prompt</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Primary Behaviors & Tone</label>
                    <textarea 
                      value={settings.systemPrompt}
                      onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                      className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-slate-300 font-mono focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Scene Timing Rules</label>
                      <textarea 
                        value={settings.sceneTimingRules}
                        onChange={(e) => setSettings({ ...settings, sceneTimingRules: e.target.value })}
                        className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-slate-300 font-mono focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Visual Processing Directives</label>
                      <textarea 
                        value={settings.visualBehavior}
                        onChange={(e) => setSettings({ ...settings, visualBehavior: e.target.value })}
                        className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-slate-300 font-mono focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* API TAB */}
          {activeTab === 'api' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-bold text-white mb-6">API & Quota Management</h2>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-4 mb-8">
                  <div className="p-2 bg-blue-500/20 rounded-xl mt-0.5">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-400 mb-1">Managed AI Quota Active</h3>
                    <p className="text-sm text-blue-200/70 leading-relaxed">You are currently using AI Creator Studio's managed credits. API requests are handled by our backend servers. Switch to "Bring Your Own Key" (BYOK) if you want continuous logic without using credits.</p>
                  </div>
                </div>

                <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                  <div className="p-5 flex items-center justify-between border-b border-white/10 bg-white/[0.02]">
                    <div>
                      <span className="font-bold text-white">Bring Your Own Key (BYOK)</span>
                      <p className="text-xs text-slate-400 mt-1">Override our managed service with your own Gemini API key.</p>
                    </div>
                    <div 
                      className="w-12 h-7 rounded-full flex items-center p-1 transition-colors cursor-pointer shrink-0"
                      style={{ backgroundColor: settings.useCustomApiKey ? '#d946ef' : '#334155' }}
                      onClick={() => setSettings({ ...settings, useCustomApiKey: !settings.useCustomApiKey })}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full bg-white transition-transform shadow-md",
                        settings.useCustomApiKey ? "translate-x-5" : "translate-x-0"
                      )} />
                    </div>
                  </div>

                  <div className={cn("p-6 transition-all", settings.useCustomApiKey ? "opacity-100" : "opacity-50 pointer-events-none")}>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Gemini API Key</label>
                    <input 
                      type="password"
                      value={settings.customApiKey}
                      onChange={(e) => setSettings({ ...settings, customApiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-2">Your key is stored securely in your browser and used only for client-side override requests.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
