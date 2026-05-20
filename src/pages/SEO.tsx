import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Sparkles, Hash, AlignLeft, Tag } from 'lucide-react';

export const SEO = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [seoData, setSeoData] = useState<{ keywords: string[], description: string, tags: string[] } | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate an SEO optimization package for a YouTube video about: "${topic}". \n\nFormat exactly as a JSON string with nothing else:\n{"keywords": ["keyword1", "keyword2", "..."], "description": "A highly engaging and SEO rich 2-paragraph youtube description with timestamps placeholder...", "tags": ["tag1", "tag2"...]}`,
          systemInstruction: "You are an expert YouTube SEO specialist. Output exactly valid JSON string."
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }
      try {
        const textToParse = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(textToParse);
        setSeoData(parsed);
      } catch (e) {
        console.error("Failed to parse JSON", e, data.text);
        setSeoData({ keywords: [], description: `Error parsing API response. Response was: ${data.text}`, tags: [] });
      }
    } catch (error: any) {
      console.error(error);
      setSeoData({ keywords: [], description: `Error: ${error.message}`, tags: [] });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Search className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">SEO Generator</h1>
          <p className="text-slate-400">Rank higher on YouTube with AI-optimized descriptions and tags.</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <label className="block text-sm font-medium text-white mb-3">Video Title or Core Topic</label>
        <div className="flex flex-col md:flex-row gap-4 mb-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., MacBook Pro M3 Max Review"
            className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={!topic || isGenerating}
            className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 transition-all whitespace-nowrap shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            <span>Optimize SEO</span>
          </button>
        </div>
      </div>

      {seoData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-8">
            <div className="glass-card rounded-2xl p-6 h-full">
              <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-white/5">
                <AlignLeft className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Smart Description</h2>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-5 border border-white/5">
                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{seoData.description}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-white/5">
                <Hash className="w-4 h-4 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Target Keywords</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {seoData.keywords?.map((kw, i) => (
                  <span key={i} className="bg-[#020617] text-emerald-400 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-white/5">
                <Tag className="w-4 h-4 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">YouTube Tags</h2>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                <p className="text-slate-400 text-sm leading-relaxed">
                  {seoData.tags?.join(', ')}
                </p>
                <button 
                  className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white font-medium transition-colors"
                  onClick={() => navigator.clipboard.writeText(seoData.tags?.join(', '))}
                >
                  Copy All Tags
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
