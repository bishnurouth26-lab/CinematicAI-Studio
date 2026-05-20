import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Languages,
  Sparkles,
  ArrowRightLeft,
  FileText,
  CheckCircle2,
  Settings2,
  Download,
  Search,
  LayoutTemplate,
  Volume2,
  FastForward,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../lib/AuthContext";

const LANGUAGES = [
  "English",
  "Hindi",
  "Bengali",
  "Spanish",
  "French",
  "Arabic",
  "Japanese",
  "Korean",
  "German",
  "Portuguese",
  "Russian",
  "Tamil",
  "Telugu",
];

const MODES = [
  "Standard Translation",
  "Indian YouTube style",
  "US documentary style",
  "Japanese cinematic style",
  "Spanish viral style",
  "Arabic educational style",
];

interface ContentBlock {
  id: string;
  type: "Title" | "Description" | "Hashtags" | "Script" | "Subtitle";
  source: string;
  translated?: string;
  status: "pending" | "translating" | "done";
}

const INITIAL_BLOCKS: ContentBlock[] = [
  {
    id: "1",
    type: "Title",
    source: "The Hidden Truth About Quantum Physics",
    status: "pending",
  },
  {
    id: "2",
    type: "Description",
    source:
      "In this documentary, we explore the deepest mysteries of quantum mechanics.",
    status: "pending",
  },
  {
    id: "3",
    type: "Script",
    source:
      "Welcome back. Today, we are going to dive into a topic that has baffled scientists for decades. First, let us look at the double-slit experiment.",
    status: "pending",
  },
  {
    id: "4",
    type: "Hashtags",
    source: "#QuantumPhysics #ScienceDocumentary #Physics",
    status: "pending",
  },
];

export const LocalizationStudio = () => {
  const { user } = useAuth();

  const [sourceLang, setSourceLang] = useState("English");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [mode, setMode] = useState(MODES[1]);
  const [blocks, setBlocks] = useState<ContentBlock[]>(INITIAL_BLOCKS);
  const [isTranslating, setIsTranslating] = useState(false);

  const mockTranslate = async (text: string, type: string) => {
    // In a real app, you'd call Gemini API here
    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 1000),
    );

    if (targetLang === "Hindi") {
      if (type === "Title") return "क्वांटम भौतिकी के बारे में छिपी सच्चाई";
      if (type === "Description")
        return "इस वृत्तचित्र में, हम क्वांटम यांत्रिकी के सबसे गहरे रहस्यों का पता लगाते हैं।";
      if (type === "Hashtags")
        return "#QuantumPhysics #ScienceHindi #PhysicsFacts";
      return "वापसी पर आपका स्वागत है। आज, हम एक ऐसे विषय पर गोता लगाने जा रहे हैं जिसने दशकों से वैज्ञानिकों को चौंका दिया है। सबसे पहले, आइए डबल-स्लिट प्रयोग को देखें।";
    } else if (targetLang === "Spanish") {
      if (type === "Title") return "La verdad oculta sobre la física cuántica";
      if (type === "Description")
        return "En este documental exploramos los misterios más profundos de la mecánica cuántica.";
      if (type === "Hashtags") return "#FísicaCuántica #DocumentalCiencia";
      return "Bienvenidos de nuevo. Hoy vamos a sumergirnos en un tema que ha desconcertado a los científicos durante décadas...";
    }

    // Generic fallback for simulation
    return `[Translated into ${targetLang}] ${text}`;
  };

  const handleTranslateAll = async () => {
    setIsTranslating(true);

    // Reset statuses
    setBlocks((prev) =>
      prev.map((b) => ({ ...b, status: "pending", translated: "" })),
    );

    for (let i = 0; i < blocks.length; i++) {
      setBlocks((prev) =>
        prev.map((b, idx) => (idx === i ? { ...b, status: "translating" } : b)),
      );
      const translated = await mockTranslate(blocks[i].source, blocks[i].type);
      setBlocks((prev) =>
        prev.map((b, idx) =>
          idx === i ? { ...b, status: "done", translated } : b,
        ),
      );
    }

    setIsTranslating(false);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 neon-glow">
          <Globe className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-widest text-center">
          LOCALIZATION STUDIO
        </h2>
        <p className="text-slate-400 text-center max-w-sm">
          Sign in to adapt and translate your content for global audiences.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-[700px] h-full gap-4 pb-12 w-full max-w-[1600px] mx-auto">
      {/* Left Sidebar - Settings */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-6">
        <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-5 mb-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-blue-400" />
            Localization
          </h1>
          <p className="text-xs text-slate-400">
            Adapt tone and translate content internationally.
          </p>
        </div>

        <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-5 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
              Target Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l} disabled={l === sourceLang}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
              Regional Adaptation Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-500 mb-2">
              Smart Features
            </h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <span className="text-sm text-slate-300">
                  Preserve cinematic pacing
                </span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-black/50"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <span className="text-sm text-slate-300">
                  Adapt humor/context
                </span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-black/50"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <span className="text-sm text-slate-300">
                  Regional SEO Opt.
                </span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 bg-black/50"
                />
              </label>
            </div>
          </div>

          <button
            onClick={handleTranslateAll}
            disabled={isTranslating}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all mt-4",
              isTranslating
                ? "bg-blue-600/50 text-white/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]",
            )}
          >
            {isTranslating ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" /> Adapting...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-5 h-5" /> Translate All
              </>
            )}
          </button>
        </div>

        <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-5">
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-semibold transition-colors">
            <Download className="w-4 h-4" /> Export Package
          </button>
          <p className="text-[10px] text-slate-500 text-center mt-3">
            Includes JSON, translated subtitles (.srt), and TTS scripts.
          </p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 glass-card bg-slate-900/50 border border-white/10 rounded-3xl flex flex-col overflow-hidden relative">
        <div className="flex bg-black/40 border-b border-white/10">
          <div className="flex-1 p-4 flex items-center justify-between border-r border-white/10">
            <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500" /> SOURCE (
              {sourceLang})
            </span>
          </div>
          <div className="w-10 bg-black flex items-center justify-center text-slate-600 border-r border-white/10">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div className="flex-1 p-4 flex items-center justify-between">
            <span className="text-sm font-bold text-blue-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />{" "}
              TARGET ({targetLang})
            </span>
            {mode && (
              <span className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md uppercase font-bold tracking-wider">
                {mode}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {blocks.map((block) => (
            <div key={block.id} className="relative">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <LayoutTemplate className="w-3 h-3" /> {block.type}
              </h4>

              <div className="flex items-stretch rounded-xl overflow-hidden border border-white/10 shadow-lg">
                {/* Source Side */}
                <div className="flex-1 bg-black/30 p-0">
                  <textarea
                    value={block.source}
                    onChange={(e) => {
                      setBlocks((prev) =>
                        prev.map((b) =>
                          b.id === block.id
                            ? {
                                ...b,
                                source: e.target.value,
                                status: "pending",
                                translated: "",
                              }
                            : b,
                        ),
                      );
                    }}
                    className={cn(
                      "w-full h-full min-h-[100px] bg-transparent block border-0 focus:ring-0 resize-y outline-none p-4",
                      block.type === "Title"
                        ? "text-lg font-bold text-white"
                        : "text-sm text-slate-300 leading-relaxed font-medium",
                    )}
                    placeholder={`Enter ${block.type.toLowerCase()} here...`}
                  />
                </div>

                {/* Middle border */}
                <div className="w-px bg-white/5 shrink-0" />

                {/* Target Side */}
                <div
                  className={cn(
                    "flex-1 p-4 transition-all duration-300 relative",
                    block.status === "translating"
                      ? "bg-blue-900/10"
                      : block.status === "done"
                        ? "bg-blue-950/20"
                        : "bg-slate-900/50",
                  )}
                >
                  {block.status === "translating" ? (
                    <div className="flex items-center gap-3 text-blue-400 h-full">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-semibold animate-pulse">
                        Adapting context and tone...
                      </span>
                    </div>
                  ) : block.status === "done" && block.translated ? (
                    <div className="h-full flex flex-col">
                      <textarea
                        value={block.translated}
                        onChange={(e) => {
                          setBlocks((prev) =>
                            prev.map((b) =>
                              b.id === block.id
                                ? { ...b, translated: e.target.value }
                                : b
                            )
                          );
                        }}
                        className={cn(
                          "w-full h-full min-h-[100px] bg-transparent block border-0 focus:ring-0 resize-y outline-none p-0 text-blue-100 leading-relaxed transition-colors flex-1",
                          block.type === "Title"
                            ? "text-lg font-bold"
                            : "text-sm font-medium"
                        )}
                        dir={["Arabic"].includes(targetLang) ? "rtl" : "ltr"}
                      />
                      <div className="flex items-center justify-end gap-2 mt-4 opacity-0 hover:opacity-100 transition-opacity">
                        <Volume2 className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                        <Settings2 className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-slate-600 h-full text-sm font-medium italic">
                      Waiting for translation...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Generic loader icon
const Loader2 = (props: any) => (
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
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
