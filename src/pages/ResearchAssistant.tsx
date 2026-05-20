import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Microscope, Search, Download, Loader2, BookOpen, ShieldCheck, 
  Clock, AlertTriangle, CheckCircle2, FileText, Image as ImageIcon,
  ExternalLink, Copy, Scale
} from 'lucide-react';
import { cn, ensureAbsoluteUrl } from '../lib/utils';

interface TimelineEvent {
  date: string;
  event: string;
}

interface ResourceLink {
  title: string;
  url: string;
  type: string;
}

interface VisualReference {
  description: string;
  sourceHint: string;
}

interface ResearchReport {
  topic: string;
  summary: string;
  keyFacts: string[];
  timeline: TimelineEvent[];
  scientificExplanation: string;
  factCheck: 'Verified' | 'Partially Verified' | 'Unverified' | 'Speculation';
  sourceCredibility: number;
  researchSources: ResourceLink[];
  visualReferences: VisualReference[];
  controversies: string[];
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

export const ResearchAssistant = () => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState('Deep Dive (Documentary)');
  const [language, setLanguage] = useState('English');
  const [category, setCategory] = useState('Science');
  const [timePeriod, setTimePeriod] = useState('Last 5 Years');
  const [region, setRegion] = useState('Global');
  
  const [explainLikeYT, setExplainLikeYT] = useState(true);
  const [detectMisinfo, setDetectMisinfo] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    setReport(null);
    setError(null);

    const advancedOpts = [
      explainLikeYT ? 'Explain Like YouTube Mode' : '',
      detectMisinfo ? 'AI Misinformation Detection' : '',
    ].filter(Boolean).join(', ');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an elite Documentary Researcher and Expert Fact Checker. Conduct deep research on the following topic.

INPUTS:
- Topic: ${topic}
- Research Depth: ${depth}
- Language: ${language}
- Category: ${category}
- Time Period Focus: ${timePeriod}
- Region: ${region}

ADVANCED FEATURES:
${advancedOpts}

RULES:
- Return ONLY a valid JSON object. 
- Do NOT wrap the JSON in Markdown formatting like \`\`\`json.
- Separate facts from theories/speculation.
- Highlight any controversial claims.
- If Explain Like YouTube is on, simplify complex information for a broad audience.
- Provide real, credible sources (NASA, NOAA, arXiv, Reuters, etc.) with plausible search links.

JSON STRUCTURE:
{
  "topic": "String (Title case)",
  "summary": "String",
  "keyFacts": ["String"],
  "timeline": [
    { "date": "String", "event": "String" }
  ],
  "scientificExplanation": "String",
  "factCheck": "Verified|Partially Verified|Unverified|Speculation",
  "sourceCredibility": Number (1-100),
  "researchSources": [
    { "title": "String", "url": "String", "type": "Paper|Article|Report" }
  ],
  "visualReferences": [
    { "description": "String", "sourceHint": "String" }
  ],
  "controversies": ["String"]
}
`,
          systemInstruction: "You are an expert fact-checker and documentary researcher. Output strictly raw JSON object without markdown blocks."
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate research report');
      
      let text = data.text.trim();
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(text);
      if (parsed.topic && parsed.keyFacts) {
        setReport(parsed);
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

  const handleExportText = () => {
    if (!report) return;
    const txt = `TOPIC: ${report.topic}

SUMMARY:
${report.summary}

KEY FACTS:
${report.keyFacts.map((f: string) => '- ' + f).join('\n')}

TIMELINE:
${report.timeline.map((t: TimelineEvent) => `[${t.date}] ${t.event}`).join('\n')}

SCIENTIFIC/DETAILED EXPLANATION:
${report.scientificExplanation}

FACT CHECK: ${report.factCheck}
CREDIBILITY SCORE: ${report.sourceCredibility}/100

CONTROVERSIES / MISINFORMATION:
${report.controversies.length > 0 ? report.controversies.map((c: string) => '- ' + c).join('\n') : 'None detected.'}

RESEARCH SOURCES:
${report.researchSources.map((s: ResourceLink) => `- [${s.type}] ${s.title}\n  Link: ${s.url}`).join('\n\n')}

VISUAL REFERENCES:
${report.visualReferences.map((v: VisualReference) => `- ${v.description}\n  Source idea: ${v.sourceHint}`).join('\n\n')}
`;
    downloadBlob(txt, 'text/plain', 'research_report.txt');
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
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center neon-glow shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Microscope className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">AI Research Assistant</h1>
            <p className="text-slate-400">Deep documentary research and authoritative fact-checking.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExportText} disabled={!report} className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50 text-slate-300">
             <Download className="w-4 h-4" /> Export Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" style={{ perspective: "1200px" }}>
        
        {/* Left Config Panel */}
        <div className="lg:col-span-4 space-y-6">
          <TiltCard className="h-full">
            <div className="glass-card p-6 rounded-2xl space-y-5 h-full flex flex-col bg-slate-900/40 border border-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.03)] backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Research Topic or Claim</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Super El Nino 2026 predictions..."
                  className="w-full min-h-[100px] bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50 transition-all resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-cyan-500 transition-colors">
                    <option value="Science">Science</option>
                    <option value="Space">Space</option>
                    <option value="Technology">Technology</option>
                    <option value="AI">AI</option>
                    <option value="History">History</option>
                    <option value="Geopolitics">Geopolitics</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Documentary">Documentary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Research Depth</label>
                  <select value={depth} onChange={(e) => setDepth(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-cyan-500 transition-colors">
                    <option value="Quick Check">Quick Fact Check</option>
                    <option value="Standard Summary">Standard</option>
                    <option value="Deep Dive (Documentary)">Deep Dive</option>
                    <option value="Academic Level">Academic Level</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Time Period</label>
                  <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-cyan-500 transition-colors">
                    <option value="All Time">All Time</option>
                    <option value="Last 1 Year">Last 1 Year</option>
                    <option value="Last 5 Years">Last 5 Years</option>
                    <option value="Historical Context">Historical Context</option>
                    <option value="Future Predictions">Future Predictions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Region Focus</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-1 focus:ring-cyan-500 transition-colors">
                    <option value="Global">Global</option>
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5 mt-auto">
                <label className="block text-sm font-medium text-cyan-400 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> AI Analysis Mode
                </label>
                {[
                  { label: '"Explain Like YouTube" Mode', state: explainLikeYT, setter: setExplainLikeYT },
                  { label: 'Misinformation & Bias Detection', state: detectMisinfo, setter: setDetectMisinfo },
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
                disabled={!topic.trim() || isGenerating}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] z-10"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Sources...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Begin Deep Research</span>
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

          {!isGenerating && !report && !error && (
            <div className="h-[600px] glass-card rounded-2xl flex flex-col items-center justify-center text-slate-500 space-y-6 bg-slate-900/20 border-dashed border-2 border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]"></div>
               <div className="w-24 h-24 rounded-3xl bg-slate-900/50 flex items-center justify-center border border-white/5 shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500">
                 <BookOpen className="w-10 h-10 text-cyan-500/50" />
               </div>
               <div className="text-center z-10">
                 <p className="text-xl font-bold text-slate-300 mb-2">Fact-Checking Workspace</p>
                 <p className="text-sm max-w-sm mx-auto text-slate-500">Enter a topic or claim to perform a deep documentary-style dive across verified sources and scientific papers.</p>
               </div>
            </div>
          )}

          {isGenerating && (
            <div className="h-[600px] glass-card rounded-2xl flex flex-col items-center justify-center space-y-8 bg-slate-900/40 relative overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250px_250px] animate-[shimmer_2s_linear_infinite]" />
               <motion.div 
                 animate={{ rotateY: 360 }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="w-20 h-20 bg-cyan-500/20 rounded-xl border border-cyan-500/50 flex items-center justify-center relative z-10"
               >
                 <ShieldCheck className="w-10 h-10 text-cyan-400" />
               </motion.div>
               <p className="text-cyan-400 font-mono tracking-widest text-sm animate-pulse z-10">CROSS-REFERENCING DOCUMENTS...</p>
            </div>
          )}

          {report && (
            <div className="space-y-6">
              
              {/* Header Card */}
              <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="glass-card rounded-2xl overflow-hidden bg-slate-900/60 border border-cyan-500/20 shadow-2xl"
              >
                <div className="p-6 bg-gradient-to-r from-cyan-950/40 to-slate-900 border-b border-cyan-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{report.topic}</h2>
                    <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">{report.summary}</p>
                  </div>
                  
                  <div className="shrink-0 flex gap-3">
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center min-w-[120px]">
                      <span className={cn(
                        "text-sm font-bold px-2 py-1 rounded shadow-inner text-center w-full mb-1 border",
                        report.factCheck === 'Verified' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                        report.factCheck === 'Partially Verified' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                        report.factCheck === 'Speculation' ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                        "bg-red-500/20 text-red-400 border-red-500/30"
                      )}>
                        {report.factCheck}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Status</span>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center min-w-[100px] relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-500/5" style={{ height: `${report.sourceCredibility}%`, bottom: 0, top: 'auto' }}></div>
                      <span className="text-2xl font-black text-white relative z-10">{report.sourceCredibility}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold relative z-10 text-center leading-tight">Source<br/>Score</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-cyan-400 mb-3 flex items-center gap-2 uppercase">
                        <FileText className="w-4 h-4" /> Hard Facts
                      </h3>
                      <ul className="space-y-2">
                        {report.keyFacts.map((fact, idx) => (
                           <li key={idx} className="flex gap-2 items-start text-sm text-slate-300 bg-cyan-950/10 p-3 rounded-lg border border-cyan-500/5">
                             <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                             <span className="leading-relaxed">{fact}</span>
                           </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-cyan-400 mb-3 flex items-center gap-2 uppercase">
                        <BookOpen className="w-4 h-4" /> Explanation
                      </h3>
                      <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-sm text-slate-300 leading-relaxed font-serif">
                        {report.scientificExplanation}
                      </div>
                    </div>

                    {report.controversies.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold tracking-widest text-red-400 mb-3 flex items-center gap-2 uppercase">
                          <AlertTriangle className="w-4 h-4" /> Misinformation & Bias Watch
                        </h3>
                        <ul className="space-y-2">
                          {report.controversies.map((cont, idx) => (
                             <li key={idx} className="flex gap-2 items-start text-sm text-rose-200 bg-rose-950/20 p-3 rounded-lg border border-rose-500/20">
                               <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                               <span className="leading-relaxed">{cont}</span>
                             </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-cyan-400 mb-3 flex items-center gap-2 uppercase">
                        <Clock className="w-4 h-4" /> Context Timeline
                      </h3>
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-cyan-500/20 before:to-transparent">
                        {report.timeline.map((item, idx) => (
                           <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                             {/* Icon */}
                             <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white/10 bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative ml-3 md:ml-0 translate-y-0.5">
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                             </div>
                             {/* Content */}
                             <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-black/40 p-3 rounded-lg border border-white/5 ml-3 md:ml-0 shadow">
                               <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">{item.date}</span>
                               <span className="text-sm text-slate-300">{item.event}</span>
                             </div>
                           </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-cyan-400 mb-3 flex items-center gap-2 uppercase">
                        <Scale className="w-4 h-4" /> Trusted Sources
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {report.researchSources.map((src, i) => (
                           <a 
                             key={i} 
                             href={ensureAbsoluteUrl(src.url)} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             onClick={(e) => {
                               e.preventDefault();
                               window.open(ensureAbsoluteUrl(src.url), '_blank', 'noopener,noreferrer');
                             }}
                             className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-lg border border-white/5 hover:bg-slate-700/50 transition-colors group"
                           >
                               <div className="bg-slate-950 p-2 rounded-md shrink-0">
                                 <ExternalLink className="w-4 h-4 text-cyan-500" />
                               </div>
                               <div className="min-w-0 flex-1">
                                 <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">{src.title}</p>
                                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5 block truncate max-w-full">{src.type} • {src.url}</p>
                               </div>
                           </a>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-xs font-bold tracking-widest text-cyan-400 mb-3 flex items-center gap-2 uppercase">
                        <ImageIcon className="w-4 h-4" /> Visual Requirements
                      </h3>
                      <div className="space-y-2">
                        {report.visualReferences.map((vis, i) => (
                           <div key={i} className="flex flex-col gap-1 bg-white/[0.02] p-3 rounded border border-white/[0.05]">
                             <span className="text-sm font-medium text-slate-200 leading-snug">{vis.description}</span>
                             <span className="text-xs text-slate-500 flex items-center gap-1">
                               <Search className="w-3 h-3" /> {vis.sourceHint}
                             </span>
                           </div>
                        ))}
                      </div>
                    </div>

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
