import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Monitor,
  Tablet,
  Cloud,
  CloudOff,
  RefreshCw,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Settings,
  Zap,
  Play,
  Video,
  Mic,
  Image as ImageIcon,
  Clapperboard,
  Download,
  Home,
  Search,
  PlusCircle,
  LayoutDashboard,
  User,
  AlignLeft,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../lib/AuthContext";

export const MobileStudio = () => {
  const { user } = useAuth();

  const [isOffline, setIsOffline] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  const [activeMobileTab, setActiveMobileTab] = useState("home");
  const [activeDevice, setActiveDevice] = useState<
    "iphone" | "android" | "tablet"
  >("iphone");

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date().toLocaleTimeString());
    }, 1500);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 neon-glow">
          <Smartphone className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-widest text-center">
          MOBILE & SYNC
        </h2>
        <p className="text-slate-400 text-center max-w-sm">
          Sign in to manage cross-platform synchronization and preview the
          mobile creator workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-[700px] h-full gap-6 w-full max-w-[1600px] mx-auto pb-12 overflow-y-auto custom-scrollbar">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center neon-glow">
            <Smartphone className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Mobile Studio & Sync
            </h1>
            <p className="text-sm text-slate-400">
              Cross-platform workflow and offline draft management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={cn(
              "px-4 py-2 border rounded-xl flex items-center gap-2 text-sm font-semibold transition-all",
              isOffline
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
            )}
          >
            {isOffline ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            {isOffline ? "Offline Mode Active" : "Online & Connected"}
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing || isOffline}
            className={cn(
              "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]",
              (isSyncing || isOffline) &&
                "opacity-50 cursor-not-allowed shadow-none",
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            Sync Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
        {/* Left Side: Sync Settings & Device Manager */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cloud Sync Status */}
            <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {isOffline ? (
                  <CloudOff className="w-24 h-24" />
                ) : (
                  <Cloud className="w-24 h-24" />
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Cloud State
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]",
                    isOffline
                      ? "bg-rose-500 text-rose-400"
                      : isSyncing
                        ? "bg-yellow-500 text-yellow-400 animate-pulse"
                        : "bg-emerald-500 text-emerald-400",
                  )}
                />
                <span className="text-xl font-bold text-white">
                  {isOffline
                    ? "Disconnected"
                    : isSyncing
                      ? "Syncing..."
                      : "All changes saved"}
                </span>
              </div>

              <p className="text-sm text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3 h-3" /> Last synced: {lastSync}
              </p>
            </div>

            {/* Offline Drafts Cache */}
            <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
              <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Local Cache
              </h3>
              <div className="text-xl font-bold text-white mb-2">
                3 Offline Drafts
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-indigo-500 w-[15%]" />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                <span>145 MB Used</span>
                <span>1 GB Limit</span>
              </div>
            </div>
          </div>

          {/* Mobile Features Settings */}
          <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-6 flex-1">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Cross-Platform Features
            </h3>

            <div className="space-y-4">
              {/* Setting Item */}
              <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl hover:bg-black/40 transition-colors">
                <div>
                  <h4 className="font-bold text-white mb-1">
                    Push Notifications
                  </h4>
                  <p className="text-xs text-slate-400">
                    Receive alerts when workflows finish or exports are ready.
                  </p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    notifications ? "bg-indigo-500" : "bg-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      notifications ? "translate-x-6" : "translate-x-1",
                    )}
                  />
                </button>
              </div>

              {/* Setting Item */}
              <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl hover:bg-black/40 transition-colors">
                <div>
                  <h4 className="font-bold text-white mb-1">
                    Background Asset Generation
                  </h4>
                  <p className="text-xs text-slate-400">
                    Mobile app continues generating prompts when minimized.
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-indigo-500">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>

              {/* Setting Item */}
              <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl hover:bg-black/40 transition-colors">
                <div>
                  <h4 className="font-bold text-white mb-1">
                    Offline Draft Mode
                  </h4>
                  <p className="text-xs text-slate-400">
                    Save edits locally and sync automatically when online.
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-indigo-500">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-bold text-white mb-4">
                Preview Device
              </h4>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveDevice("iphone")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                    activeDevice === "iphone"
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                      : "bg-black/30 border-white/10 text-slate-400 hover:text-white",
                  )}
                >
                  iPhone 15 Pro
                </button>
                <button
                  onClick={() => setActiveDevice("android")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                    activeDevice === "android"
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                      : "bg-black/30 border-white/10 text-slate-400 hover:text-white",
                  )}
                >
                  Pixel 8
                </button>
                <button
                  onClick={() => setActiveDevice("tablet")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                    activeDevice === "tablet"
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                      : "bg-black/30 border-white/10 text-slate-400 hover:text-white",
                  )}
                >
                  iPad Pro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Mobile App Simulator */}
        <div className="lg:col-span-5 xl:col-span-4 flex items-center justify-center p-4">
          {/* Phone Frame */}
          <div
            className={cn(
              "relative bg-black rounded-[3rem] border-8 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5),inset_0_0_0_2px_rgba(255,255,255,0.1)] overflow-hidden flex flex-col transition-all duration-500",
              activeDevice === "tablet"
                ? "w-[400px] h-[580px] rounded-[2rem]"
                : "w-[320px] h-[650px]",
            )}
          >
            {/* Dynamic Island / Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-16 h-4 bg-black rounded-full" />
            </div>

            {/* Phone Status Bar */}
            <div className="h-10 w-full flex items-center justify-between px-6 pt-2 text-[10px] font-bold text-white z-40">
              <span>9:41</span>
              <div className="flex gap-1.5 items-center">
                {isOffline ? (
                  <WifiOff className="w-3 h-3 text-rose-500" />
                ) : (
                  <Wifi className="w-3 h-3" />
                )}
                <span className="w-5 h-3 bg-white/20 rounded-sm relative">
                  <span className="absolute left-0.5 top-0.5 bottom-0.5 w-3 bg-white rounded-[1px]" />
                </span>
              </div>
            </div>

            {/* Mobile App Viewport */}
            <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative">
              {/* Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {activeMobileTab === "home" && (
                  <div className="p-4 space-y-6 pb-20">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-black text-white">
                        AI Creator
                      </h2>
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Quick Record/Create */}
                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                        <Video className="w-6 h-6" />
                        <span className="text-xs font-bold font-sans">
                          New Shorts
                        </span>
                      </button>
                      <button className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-fuchsia-400 hover:bg-fuchsia-500/20 transition-all">
                        <AlignLeft className="w-6 h-6" />
                        <span className="text-xs font-bold font-sans">
                          Script
                        </span>
                      </button>
                    </div>

                    {/* Recent Drafts */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Recent Drafts
                      </h3>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex gap-3 bg-black/40 p-3 rounded-2xl border border-white/5"
                          >
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex-shrink-0" />
                            <div>
                              <h4 className="text-xs font-bold text-white mb-1">
                                Quantum Physics Ep {i}
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Edited 2 hrs ago •{" "}
                                {isOffline ? "Local" : "Cloud"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeMobileTab === "timeline" && (
                  <div className="h-full flex flex-col relative bg-[#0a0a0f]">
                    <div className="h-48 bg-black relative flex items-center justify-center border-b border-white/10">
                      <Play className="w-10 h-10 text-white/50" />
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                      <h3 className="text-sm font-bold text-white mb-4">
                        Vertical Timeline
                      </h3>
                      <div className="space-y-2 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                        {[
                          "Intro Hook",
                          "Main Explainer",
                          "B-Roll Sequence",
                          "Outro",
                        ].map((scene, i) => (
                          <div key={i} className="flex gap-4 ml-6 relative">
                            <div className="absolute -left-6 top-2 w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] border-2 border-black" />
                            <div className="flex-1 bg-slate-900/80 p-3 rounded-xl border border-white/5">
                              <p className="text-xs font-bold text-white">
                                {scene}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                4.5s • Auto-synced
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeMobileTab === "search" && (
                  <div className="p-4">
                    <div className="bg-black/50 p-3 rounded-2xl border border-white/10 flex items-center gap-2 mb-6">
                      <Search className="w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search prompts, scripts..."
                        className="bg-transparent border-none text-sm text-white w-full outline-none"
                      />
                    </div>
                    <h3 className="text-sm font-bold text-slate-300 mb-3">
                      Trending Ideas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["#AI", "#Documentary", "#Tech", "#Review"].map(
                        (tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/20"
                          >
                            {tag}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Navigation */}
              <div className="h-16 bg-black/90 backdrop-blur-md border-t border-white/10 flex justify-around items-center px-4 z-40">
                <button
                  onClick={() => setActiveMobileTab("home")}
                  className={cn(
                    "p-2 transition-colors",
                    activeMobileTab === "home"
                      ? "text-indigo-400"
                      : "text-slate-500",
                  )}
                >
                  <Home className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveMobileTab("search")}
                  className={cn(
                    "p-2 transition-colors",
                    activeMobileTab === "search"
                      ? "text-indigo-400"
                      : "text-slate-500",
                  )}
                >
                  <Search className="w-6 h-6" />
                </button>
                <button className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] -mt-6 border-4 border-black">
                  <PlusCircle className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveMobileTab("timeline")}
                  className={cn(
                    "p-2 transition-colors",
                    activeMobileTab === "timeline"
                      ? "text-indigo-400"
                      : "text-slate-500",
                  )}
                >
                  <Clapperboard className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveMobileTab("library")}
                  className={cn(
                    "p-2 transition-colors",
                    activeMobileTab === "library"
                      ? "text-indigo-400"
                      : "text-slate-500",
                  )}
                >
                  <ImageIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Phone bottom indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
