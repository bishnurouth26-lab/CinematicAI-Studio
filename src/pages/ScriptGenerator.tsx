import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Wand2, Sparkles, Loader2, Copy, CheckCircle2, Download, Settings2, Clock, Globe } from 'lucide-react';

export const ScriptGenerator = () => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('Viral');
  const [duration, setDuration] = useState(8);
  const [language, setLanguage] = useState('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);

  const styles = [
    'Documentary', 'Cinematic', 'Mystery', 
    'Educational', 'Viral', 'Dhruv Rathee style', 'MrBeast style', 'Vigyan Recharge style'
  ];

  const languages = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Portuguese'];

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    let promptInstruction = `Create a YouTube script about: "${topic}".\nDuration: ${duration} minutes.\nLanguage: ${language}.\nStyle: ${style}.\n\nIMPORTANT REQUIREMENTS:\n- Script pacing must match the ${duration} minute video duration exactly (calculate approx 130-150 words per minute).\n- Include emotional hooks and curiosity gaps every 20-30 seconds to optimize retention.\n- Ensure human, engaging storytelling structure.\n- Auto-create chapters.\n- Highlight important lines with **bold**.\n\nOUTPUT FORMAT REQUIRED:\nHOOK:\n...\n\nINTRO:\n...\n\nMAIN CONTENT:\n...\n\nENDING:\n...\n\nCTA:\n...`;

    if (style === 'Vigyan Recharge style') {
      promptInstruction += `\n\nVIGYAN RECHARGE STYLE REQUIREMENTS:
- Narration: Deep curiosity-driven storytelling, scientific mystery narration.
- Tone: Dramatic educational tone, emotional suspense pacing.
- Explanation: Simple Hindi explanation style (even if prompt language is different, translate to that simple logic).
- Structure: Strong hooks in first 10 seconds, cliffhanger transitions, question-based narration.
- Feel: Cinematic documentary, easy-to-understand, emotional background storytelling, dramatic pauses.`;
    }

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInstruction,
          systemInstruction: "You are an elite YouTube scriptwriter and retention expert. You specialize in crafting high-retention scripts using psychological hooks and engaging storytelling."
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }
      setScript(data.text);
    } catch (error: any) {
      console.error(error);
      setScript(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!script) return;
    const element = document.createElement("a");
    const file = new Blob([script], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `script_${topic.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center neon-glow">
          <FileText className="w-6 h-6 text-neon-blue" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Script Generator</h1>
          <p className="text-slate-400">High-retention storytelling, optimized for watch time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Video Topic or Concept</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The Hidden Economics of the Coffee Industry..."
                className="w-full h-28 bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue/50 transition-all resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Target Duration
                </label>
                <span className="text-xs font-mono text-neon-blue bg-blue-500/10 px-2 py-0.5 rounded">{duration} mins</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="60" 
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full accent-neon-blue h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1 min (Short)</span>
                <span>60 mins (Doc)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" /> Language
                </label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-neon-blue transition-all"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-slate-400" /> Style
                </label>
                <select 
                  value={style} 
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-neon-blue transition-all"
                >
                  {styles.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!topic || isGenerating}
              className="w-full mt-4 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Forging Script...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="glass-card flex flex-col h-full min-h-[500px] rounded-2xl relative overflow-hidden group">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-neon-blue" />
                <span className="font-semibold text-white">Generated Script</span>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleCopy}
                  disabled={!script}
                  className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm font-medium">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={!script}
                  className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-50 border-l border-white/10 pl-4"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Download</span>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-[#020617]/30">
              {script ? (
                <div className="prose prose-invert prose-blue max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-white/5">
                  {script.split('\n').map((line, i) => {
                    if (line.match(/^(HOOK|INTRO|MAIN CONTENT|ENDING|CTA):/)) {
                       return <h3 key={i} className="text-neon-blue mt-8 mb-4 font-black uppercase tracking-widest text-sm border-b border-blue-500/20 pb-2">{line}</h3>;
                    }
                    if (line.startsWith('#')) return <h3 key={i} className="text-white mt-6 mb-3 font-bold text-lg">{line.replace(/#/g, '')}</h3>;
                    if (line.startsWith('[')) return <p key={i} className="text-slate-400/80 italic text-sm my-2 font-mono bg-slate-900/30 p-2 rounded-lg border border-white/5">{line}</p>;
                    
                    const boldParsed = line.split(/(\*\*.*?\*\*)/g).map((part, idx) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <span key={idx} className="text-white font-bold bg-white/5 px-1 rounded">{part.slice(2, -2)}</span>;
                      }
                      return part;
                    });
                    
                    return <p key={i} className="text-slate-300 my-3 leading-relaxed">{boldParsed}</p>;
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center border border-white/5">
                    <FileText className="w-8 h-8 opacity-50" />
                  </div>
                  <p>Your optimized script will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
