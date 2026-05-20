import React, { useState, useEffect } from 'react';
import { Bell, CreditCard, Menu, Moon, Search, Sun, Zap, Terminal } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Topbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light' || document.body.classList.contains('theme-light');
  });

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('theme-light');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => setIsLightMode(!isLightMode);

  return (
    <header className="h-20 bg-black/40 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between px-6 sticky top-0 z-40 transform-gpu shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center lg:hidden">
        <button onClick={onMenuClick} className="text-cyan-400 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-4 text-lg font-bold font-scifi text-white tracking-widest uppercase">
          Neural<span className="text-neon-blue">OS</span>
        </span>
      </div>

      <div className="hidden lg:flex items-center flex-1 max-w-xl relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur" />
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/70" />
          <input 
            type="text" 
            placeholder="ACCESS TERMINAL..." 
            className="w-full bg-black/60 border border-cyan-500/30 rounded-full py-2.5 pl-12 pr-4 text-sm text-cyan-300 font-mono tracking-wider placeholder-cyan-800/70 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
            <kbd className="bg-black/50 border border-cyan-500/30 rounded-md px-2 py-0.5 text-[10px] font-mono text-cyan-400">⌘</kbd>
            <kbd className="bg-black/50 border border-cyan-500/30 rounded-md px-2 py-0.5 text-[10px] font-mono text-cyan-400">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6 ml-auto">
        {user && (
          <div className="hidden md:flex items-center space-x-3 px-4 py-1.5 bg-black/60 border border-cyan-500/30 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <Zap className="w-3.5 h-3.5 text-neon-orange animate-pulse" />
            <span className="text-[10px] font-bold font-scifi tracking-widest text-slate-400">CREDITS</span>
            <span className="text-sm font-bold font-scifi text-neon-blue tracking-wider">1,452</span>
          </div>
        )}

        <button 
          onClick={toggleTheme}
          className="relative p-2 text-cyan-500/70 hover:text-neon-blue transition-colors group"
          title="Toggle Theme"
        >
          {isLightMode ? (
            <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
          ) : (
            <Sun className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          )}
        </button>

        <button className="relative p-2 text-cyan-500/70 hover:text-neon-blue transition-colors group hidden md:block">
          <Terminal className="w-5 h-5 group-hover:animate-pulse" />
        </button>

        <button className="relative p-2 text-cyan-500/70 hover:text-neon-blue transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-purple rounded-full shadow-[0_0_8px_#b026ff]"></span>
        </button>

        {user ? (
          <div className="flex items-center space-x-3 pl-2 border-l border-cyan-500/30">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-bold font-scifi text-slate-300">OP-{user.displayName?.substring(0, 4) || 'ADMIN'}</span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
              </span>
            </div>
            <button onClick={logout} className="relative group rounded-xl overflow-hidden border border-cyan-500/50 p-[1px] hover:border-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]" title="Log out">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=000&color=00f0ff&font-family=Space+Grotesk`} alt="Profile" className="w-9 h-9 rounded-xl object-cover mix-blend-screen" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/auth')}
            className="ml-4 px-6 py-2 bg-black border border-neon-blue text-neon-blue font-bold font-scifi tracking-wider rounded-xl text-sm hover:bg-neon-blue hover:text-black transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            INITIATE
          </button>
        )}
      </div>
    </header>
  );
};
