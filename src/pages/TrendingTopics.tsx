import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Flame, TrendingUp, Search, Download, Loader2, FileText, CheckCircle2, Copy, BarChart2, Video, ImageIcon as IconImage, Library, LayoutPanelLeft
} from 'lucide-react';
import { cn, ensureAbsoluteUrl } from '../lib/utils';

interface Resource {
  type: 'video' | 'image' | 'research';
  title: string;
  url?: string;
  description?: string;
}

interface ResourceLink {
  title: string;
  url: string;
}

interface TopicTrend {
  id: string;
  topicTitle: string;
  viralScore: number;
  competition: string;
  estimatedViews: string;
  suggestedHook: string;
  suggestedThumbnail: string;
  originalVideoResources: ResourceLink[];
  originalImageResources: ResourceLink[];
  researchSources: ResourceLink[];
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

export const TrendingTopics = () => {
  const [category, setCategory] = useState('AI');
  const [region, setRegion] = useState('Global');
  const [topicTheme, setTopicTheme] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [trends, setTrends] = useState<TopicTrend[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setTrends([]);
    setError(null);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate 3 Highly Viral YouTube Trending Topics with Resources.

INPUTS:
- Category: ${category}
- Region: ${region}
- Specific niche/theme (optional): ${topicTheme || 'General Trending'}

RULES:
- Return ONLY a valid JSON array of objects. 
- Do NOT wrap the JSON in Markdown formatting like \`\`\`json.
- Generate EXACTLY 3 distinct trending topics.
- For resources, provide ACTUAL VALID URLs to official websites (e.g., https://www.pexels.com, https://pixabay.com, https://mixkit.co, https://coverr.co, https://images.nasa.gov, https://archive.org, https://arxiv.org, https://pubmed.ncbi.nlm.nih.gov, https://scholar.google.com, https://www.reuters.com, https://www.bbc.com, https://apnews.com). If a specific link isn't known, provide a direct search URL for that site.
- Focus on original copyright-safe sources and trending news.

JSON STRUCTURE:
[
  {
    "id": "trend-1",
    "topicTitle": "String",
    "viralScore": Number (1-100),
    "competition": "Low|Medium|High",
    "estimatedViews": "String (e.g. 500K-1M)",
    "suggestedHook": "String",
    "suggestedThumbnail": "String",
    "originalVideoResources": [
      {
        "title": "String (Describe the NASA/Pexels/Archive footage)",
        "url": "String (e.g., https://www.pexels.com/search/... or https://images.nasa.gov/...)"
      }
    ],
    "originalImageResources": [
      {
        "title": "String (Describe Hubble/Unsplash/public domain image)",
        "url": "String (e.g., https://pixabay.com/images/search/... or https://unsplash.com/s/...)"
      }
    ],
    "researchSources": [
      {
        "title": "String (Scientific paper, news article, or official report)",
        "url": "String (e.g., https://arxiv.org/search/... or https://www.reuters.com/...)"
      }
    ]
  }
]
`,
          systemInstruction: "You are an expert YouTube analyst and research assistant. Output strictly raw JSON array without markdown blocks."
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate metrics');
      
      let text = data.text.trim();
      if (text.startsWith('\`\`\`json')) {
        text = text.replace(/^\`\`\`json\n?/, '').replace(/\n?\`\`\`$/, '');
      } else if (text.startsWith('\`\`\`')) {
        text = text.replace(/^\`\`\`\n?/, '').replace(/\n?\`\`\`$/, '');
      }

      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setTrends(parsed);
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
    if (!trends.length) return;
    const txt = trends.map(t => `TOPIC:\n${t.topicTitle}\n\nVIRAL SCORE:\n${t.viralScore}/100\n\nCOMPETITION:\n${t.competition}\n\nSUGGESTED HOOK:\n${t.suggestedHook}\n\nTHUMBNAIL ANGLE:\n${t.suggestedThumbnail}\n\nORIGINAL VIDEO RESOURCES:\n${t.originalVideoResources.map(x => '- ' + x.title + '\n  Link: ' + x.url).join('\n')}\n\nORIGINAL IMAGE RESOURCES:\n${t.originalImageResources.map(x => '- ' + x.title + '\n  Link: ' + x.url).join('\n')}\n\nRESEARCH SOURCES:\n${t.researchSources.map(x => '- ' + x.title + '\n  Link: ' + x.url).join('\n')}`).join('\n\n============================\n\n');
    downloadBlob(txt, 'text/plain', 'trending_topics.txt');
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
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center neon-glow shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Trending Topics & Resources</h1>
            <p className="text-slate-400">Discover viral concepts and original, copyright-safe materials.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExportText} disabled={!trends.length} className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50 text-slate-300">
             <Download className="w-4 h-4" /> Export Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" style={{ perspective: "1200px" }}>
        
        {/* Left Config Panel */}
        <div className="lg:col-span-4 space-y-6">
          <TiltCard className="h-full">
            <div className="glass-card p-6 rounded-2xl space-y-6 h-full flex flex-col bg-slate-900/40 border border-orange-500/10 shadow-[0_0_40px_rgba(249,115,22,0.03)] backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Topic Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-orange-500 transition-colors">
                  <option value="Science">Science & Technology</option>
                  <option value="Space">Space & Universe</option>
                  <option value="Mystery">Mystery & Unsolved</option>
                  <option value="AI">Artificial Intelligence</option>
                  <option value="Geopolitics">Geopolitics & News</option>
                  <option value="History">History & Lore</option>
                  <option value="Documentary">Documentary</option>
                  <option value="Educational">Educational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Region Focus</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-orange-500 transition-colors">
                  <option value="Global">Global Trends</option>
                  <option value="India">India Trends</option>
                  <option value="US">United States</option>
                  <option value="Europe">Europe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Specific Niche (Optional)</label>
                <input
                  type="text"
                  value={topicTheme}
                  onChange={(e) => setTopicTheme(e.target.value)}
                  placeholder="e.g. Quantum Physics, Cyber Security"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-orange-500 transition-colors text-sm"
                />
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5 mt-auto">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-3.5 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.7)] z-10"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing Trends...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Find Trending Topics</span>
                    </>
                  )}
                </button>
              </div>
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

          {!isGenerating && trends.length === 0 && !error && (
            <div className="h-[600px] glass-card rounded-2xl flex flex-col items-center justify-center text-slate-500 space-y-6 bg-slate-900/20 border-dashed border-2 border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.05)_0%,transparent_70%)]"></div>
               <div className="w-24 h-24 rounded-3xl bg-slate-900/50 flex items-center justify-center border border-white/5 shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500">
                 <TrendingUp className="w-10 h-10 text-orange-500/50" />
               </div>
               <div className="text-center z-10">
                 <p className="text-xl font-bold text-slate-300 mb-2">Ready to Discover Trends</p>
                 <p className="text-sm max-w-sm mx-auto text-slate-500">Select a category on the left, and AI will deeply analyze search volume, virality, and fetch original resources to use.</p>
               </div>
            </div>
          )}

          {isGenerating && (
            <div className="h-[600px] glass-card rounded-2xl flex flex-col items-center justify-center space-y-8 bg-slate-900/40 relative overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250px_250px] animate-[shimmer_2s_linear_infinite]" />
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                 className="w-24 h-24 rounded-full border-b-2 border-orange-500 relative z-10"
               />
               <p className="text-orange-400 font-mono tracking-widest text-sm animate-pulse z-10">FETCHING DATAPOINTS & MEDIA REFERENCES...</p>
            </div>
          )}

          {trends.length > 0 && (
            <div className="space-y-8">
              {trends.map((trend, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={trend.id || idx} 
                  className="glass-card rounded-2xl overflow-hidden bg-slate-900/60 border border-orange-500/20 shadow-2xl flex flex-col"
                >
                  <div className="bg-gradient-to-r from-orange-950/40 to-slate-900 border-b border-orange-500/20 p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                     <div className="flex-1">
                       <div className="flex flex-wrap items-center gap-3 mb-2">
                         <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                           <Flame className="w-3 h-3" /> TREND {idx + 1}
                         </span>
                         <span className={cn(
                           "text-xs font-bold px-2 py-1 rounded uppercase tracking-wider",
                           trend.competition === 'Low' ? "bg-emerald-500/20 text-emerald-400" :
                           trend.competition === 'Medium' ? "bg-yellow-500/20 text-yellow-400" :
                           "bg-red-500/20 text-red-400"
                         )}>
                           {trend.competition} Comp
                         </span>
                         <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                           <BarChart2 className="w-3 h-3" /> ~{trend.estimatedViews}
                         </span>
                       </div>
                       <h2 className="text-2xl font-bold text-white text-pretty pr-4">{trend.topicTitle}</h2>
                     </div>
                     <div className="flex flex-col items-center bg-black/40 border border-white/5 rounded-xl p-3 shrink-0">
                       <span className="text-3xl font-black text-orange-500 px-2 leading-none">{trend.viralScore}</span>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Viral Score</span>
                     </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Concept Breakdown */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-orange-400 block mb-1">SUGGESTED HOOK</span>
                          <p className="text-sm text-white/90 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5 font-serif italic text-pretty">
                             "{trend.suggestedHook}"
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-orange-400 block mb-1">THUMBNAIL CONCEPT</span>
                          <p className="text-sm text-slate-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                             {trend.suggestedThumbnail}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-bold tracking-widest text-slate-400 border-b border-white/5 pb-2 flex items-center gap-2">
                          <Library className="w-4 h-4 text-slate-300" /> RESEARCH MATERIALS
                        </h3>
                        {trend.researchSources.map((src, i) => (
                           <a 
                             key={i} 
                             href={ensureAbsoluteUrl(src.url)} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             onClick={(e) => {
                               e.preventDefault();
                               window.open(ensureAbsoluteUrl(src.url), '_blank', 'noopener,noreferrer');
                             }}
                             className="flex gap-2 items-start text-sm text-slate-300 bg-white/[0.02] p-2 rounded border border-white/[0.02] hover:bg-white/[0.05] transition-colors group"
                           >
                             <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                             <span className="group-hover:text-emerald-300 transition-colors">{src.title}</span>
                           </a>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xs font-bold tracking-widest text-slate-400 border-b border-white/5 pb-2 flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-400" /> ORIGINAL VIDEO RESOURCES
                      </h3>
                      <div className="space-y-2">
                        {trend.originalVideoResources.map((src, i) => (
                           <a 
                             key={i} 
                             href={ensureAbsoluteUrl(src.url)} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             onClick={(e) => {
                               e.preventDefault();
                               window.open(ensureAbsoluteUrl(src.url), '_blank', 'noopener,noreferrer');
                             }}
                             className="flex gap-2 items-start text-sm text-slate-300 bg-blue-950/20 p-2 rounded-lg border border-blue-500/10 hover:bg-blue-900/30 transition-colors group">
                             <Video className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                             <span className="group-hover:text-blue-300 transition-colors">{src.title}</span>
                           </a>
                        ))}
                      </div>

                      <h3 className="text-xs font-bold tracking-widest text-slate-400 border-b border-white/5 pb-2 pt-4 flex items-center gap-2">
                        <IconImage className="w-4 h-4 text-purple-400" /> PUBLIC IMAGE ASSETS
                      </h3>
                      <div className="space-y-2">
                        {trend.originalImageResources.map((src, i) => (
                           <a 
                             key={i} 
                             href={ensureAbsoluteUrl(src.url)} 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             onClick={(e) => {
                               e.preventDefault();
                               window.open(ensureAbsoluteUrl(src.url), '_blank', 'noopener,noreferrer');
                             }}
                             className="flex gap-2 items-start text-sm text-slate-300 bg-purple-950/20 p-2 rounded-lg border border-purple-500/10 hover:bg-purple-900/30 transition-colors group">
                             <IconImage className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                             <span className="group-hover:text-purple-300 transition-colors">{src.title}</span>
                           </a>
                        ))}
                      </div>
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
