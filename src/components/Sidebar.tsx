import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FileText, Clapperboard, Image as ImageIcon, Search, 
  Video, Settings, Flame, Mic, Microscope, FolderOpen, Cpu, 
  Archive, Library, Globe, Smartphone, Activity, Link2, Hexagon
} from 'lucide-react';
import { cn } from '../lib/utils';

const navSections = [
  {
    title: 'CORE SYS',
    items: [
      { name: 'Neural Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Timeline VFX', path: '/timeline', icon: Clapperboard },
      { name: 'Workspace Nodes', path: '/workspace', icon: FolderOpen },
      { name: 'Media Vault', path: '/library', icon: Archive },
    ]
  },
  {
    title: 'SYNTHETICS',
    items: [
      { name: 'Script Engine', path: '/scripts', icon: FileText },
      { name: 'Visual Prompts', path: '/scenes', icon: ImageIcon },
      { name: 'Thumbnail Matrix', path: '/thumbnails', icon: ImageIcon },
      { name: 'Audio Studio', path: '/audio', icon: Mic },
      { name: 'Shorts Catalyst', path: '/shorts', icon: Video },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { name: 'Trend Scan', path: '/trending', icon: Flame },
      { name: 'Market SEO', path: '/seo', icon: Search },
      { name: 'Deep Research', path: '/research', icon: Microscope },
      { name: 'Global Localize', path: '/localization', icon: Globe },
    ]
  },
  {
    title: 'INFRASTRUCTURE',
    items: [
      { name: 'Admin Console', path: '/admin', icon: Activity },
      { name: 'Automations', path: '/automations', icon: Settings },
      { name: 'Mobile Link', path: '/mobile-studio', icon: Smartphone },
      { name: 'AI Core Config', path: '/ai-settings', icon: Cpu },
      { name: 'Export Pipeline', path: '/export', icon: Archive },
    ]
  }
];

export const Sidebar = ({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-md"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      <aside className={cn(
        "w-[18rem] flex flex-col h-screen fixed left-0 top-0 bg-[#02050a]/90 backdrop-blur-2xl border-r border-cyan-900/30 z-50 transition-transform duration-500 ease-out will-change-transform lg:translate-x-0 shadow-[10px_0_30px_rgba(0,0,0,0.8)]",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Holographic Header */}
        <div className="h-20 px-6 flex items-center space-x-3 border-b border-cyan-900/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="w-10 h-10 rounded-xl bg-black border border-neon-blue flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] relative">
            <Hexagon className="w-6 h-6 text-neon-blue absolute animate-pulse-glow" />
            <div className="w-2 h-2 bg-white rounded-full z-10 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black font-scifi tracking-widest text-white leading-none">
              NEURAL<span className="text-cyan-500">.OS</span>
            </span>
            <span className="text-[9px] font-mono text-cyan-600 tracking-widest uppercase mt-1">Creator Core v3.1</span>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar relative">
          
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-4 px-2">
                <span className="text-[10px] font-black font-scifi text-cyan-600/70 uppercase tracking-[0.2em]">{section.title}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-cyan-900/30 to-transparent" />
              </div>
              
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden",
                        isActive 
                          ? "bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-cyan-300" 
                          : "text-slate-400 hover:text-white"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute left-0 top-0 bottom-0 w-[2px] bg-neon-blue shadow-[0_0_10px_#00f0ff]"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <item.icon className={cn("w-4 h-4 z-10 transition-colors", isActive ? "text-neon-blue drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" : "text-cyan-800 group-hover:text-cyan-400")} />
                        <span className={cn("font-medium text-sm font-sans z-10 tracking-wide", isActive ? "font-bold" : "")}>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-cyan-900/40 bg-black/50">
          <div className="flex items-center justify-between px-3 py-2 bg-[#050b14] border border-cyan-900/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-mono text-slate-400">SYS_LINK_READY</span>
            </div>
            <Link2 className="w-4 h-4 text-cyan-700" />
          </div>
        </div>
      </aside>
    </>
  );
};
