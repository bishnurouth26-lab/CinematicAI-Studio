import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Clapperboard, Image as ImageIcon, Search, Video, Mic, Microscope, FolderOpen, Activity, Link2, Hexagon, Component, Settings, Globe, Smartphone, FolderPlus, Download, TrendingUp, Music, Database, X, ArrowLeft, Sun, Moon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ParticleBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden bg-obsidian">
    {/* Cinematic Bloom/Gradients - Optimized with radial gradients instead of heavy blur filters */}
    <div className="absolute top-[30%] left-[20%] w-[800px] h-[800px] rounded-full mix-blend-screen animate-pulse-glow opacity-30" 
         style={{ background: 'radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, transparent 70%)' }} />
    <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full mix-blend-screen animate-float opacity-30" 
         style={{ animationDelay: '2s', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)' }} />
    <div className="absolute top-[10%] right-[30%] w-[400px] h-[400px] rounded-full mix-blend-screen opacity-20" 
         style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)' }} />
  </div>
);

const navItems = [
  { name: 'Core', path: '/', icon: Hexagon },
  { name: 'Script', path: '/scripts', icon: FileText },
  { name: 'Frames', path: '/scenes', icon: ImageIcon },
  { name: 'Timeline', path: '/timeline', icon: Clapperboard },
  { name: 'Synapse', path: '/workspace', icon: FolderOpen },
  { name: 'Research', path: '/research', icon: Microscope },
];

const MouseFollower = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    let animationFrameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      animationFrameId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      className="hidden lg:block fixed w-[600px] h-[600px] pointer-events-none rounded-full blur-[120px] opacity-[0.2] z-0 transition-opacity duration-1000"
      style={{
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%)',
        transform: `translate3d(${mousePos.x - 300}px, ${mousePos.y - 300}px, 0)`,
        left: 0,
        top: 0,
        willChange: 'transform'
      }}
    />
  );
};

const allModules = [
  { name: 'Dashboard', path: '/', icon: Hexagon, description: 'Neural Workspace Core' },
  { name: 'Workspace', path: '/workspace', icon: FolderOpen, description: 'Project memory array' },
  { name: 'Timeline', path: '/timeline', icon: Clapperboard, description: 'Cinematic editor' },
  { name: 'Export Target', path: '/export', icon: Download, description: 'Render options & outputs' },
  { name: 'Scripts', path: '/scripts', icon: FileText, description: 'Narrative generation' },
  { name: 'Scenes', path: '/scenes', icon: ImageIcon, description: 'Visual prompts' },
  { name: 'Thumbnails', path: '/thumbnails', icon: ImageIcon, description: 'Click-through graphics' },
  { name: 'Audio', path: '/audio', icon: Mic, description: 'Voice and music generation' },
  { name: 'Research', path: '/research', icon: Microscope, description: 'Intelligence gathering' },
  { name: 'SEO Matrix', path: '/seo', icon: Search, description: 'Metadata optimization' },
  { name: 'Shorts Engine', path: '/shorts', icon: Video, description: 'Vertical clip extraction' },
  { name: 'Trending Data', path: '/trending', icon: TrendingUp, description: 'Global algorithm state' },
  { name: 'Asset Library', path: '/library', icon: Database, description: 'Media repository' },
  { name: 'Mobile Link', path: '/mobile-studio', icon: Smartphone, description: 'Portable interface' },
  { name: 'Localization', path: '/localization', icon: Globe, description: 'Global translation routing' },
  { name: 'Automations', path: '/automations', icon: Activity, description: 'Workflow chaining' },
  { name: 'Global Settings', path: '/settings', icon: Settings, description: 'System preferences' },
  { name: 'AI Config', path: '/ai-settings', icon: Settings, description: 'Model parameters' },
  { name: 'Admin Core', path: '/admin', icon: LayoutDashboard, description: 'System overview' }
];

export const AppLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
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
    <div className="flex flex-col bg-obsidian text-slate-200 overflow-x-hidden font-sans relative min-h-screen min-h-[100dvh] w-full max-w-[100vw]">
      <ParticleBackground />
      <MouseFollower />
      
      {/* Top Intelligence Indicator */}
      <header className="fixed top-0 left-0 right-0 h-20 z-40 flex items-start justify-between px-6 md:px-10 pt-6 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => navigate(-1)}
            className={cn(
              "p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors group",
              location.pathname === '/' && "opacity-0 pointer-events-none"
            )}
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="relative flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
            <div className="absolute inset-0 border border-white/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-silver-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" />
          </div>
          <span className="font-display font-medium tracking-[0.2em] text-[10px] md:text-xs text-white/50 uppercase">Creator OS Matrix</span>
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
           <div className="flex items-center gap-2">
             <span className="font-sans text-[8px] md:text-[10px] text-white/30 uppercase tracking-[0.1em] hidden sm:block">Core Temp</span>
             <span className="font-mono text-[10px] md:text-xs text-cyan-glow/80">32.4°</span>
           </div>
           
           <button 
             onClick={toggleTheme}
             className="relative p-2 text-cyan-500/70 hover:text-neon-blue transition-colors group bg-white/5 rounded-full hover:bg-white/10"
             title="Toggle Theme"
           >
             {isLightMode ? (
               <Moon className="w-4 h-4 md:w-5 md:h-5 group-hover:-rotate-12 transition-transform" />
             ) : (
               <Sun className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
             )}
           </button>
        </div>
      </header>

      {/* Main Content Spatial Area */}
      <main className="flex-1 w-full relative z-10 flex flex-col pt-20 pb-28 md:pt-24 md:pb-32">
        <div className="flex-1 w-full h-full max-w-[1920px] mx-auto relative px-4 md:px-12 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex-1 flex flex-col relative h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Cinematic Dock */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto glass-panel rounded-full px-2 py-2 flex items-center gap-1 md:gap-2 max-w-full overflow-x-auto no-scrollbar"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "relative group px-3 py-2.5 md:px-4 md:py-3 rounded-full transition-all duration-500 ease-out flex items-center justify-center shrink-0",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="dock-indicator"
                      className="absolute inset-0 bg-white/5 rounded-full border border-white/10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-4 h-4 md:w-5 md:h-5 relative z-10" strokeWidth={isActive ? 2 : 1.5} />
                  
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-midnight/80 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap hidden md:block">
                      {item.name}
                    </div>
                  </div>
                </>
              )}
            </NavLink>
          ))}
          
          <div className="w-px h-6 md:h-8 bg-white/10 mx-1 md:mx-2 shrink-0" />
          
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="relative group px-3 py-2.5 md:px-4 md:py-3 rounded-full transition-all duration-500 ease-out text-white/40 hover:text-white/80 hover:bg-white/5 shrink-0"
          >
             <Component className="w-4 h-4 md:w-5 md:h-5" />
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-midnight/80 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap hidden md:block">
                  All Modules
                </div>
              </div>
          </button>
        </motion.div>
      </div>

      {/* Cinematic Full Screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-obsidian/80 md:bg-obsidian/60 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-10 shrink-0">
              <div className="flex items-center gap-3">
                <Component className="w-5 h-5 md:w-6 md:h-6 text-cyan-glow" />
                <h2 className="font-display text-xl md:text-2xl font-light text-white tracking-wide">System Modules</h2>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 text-white/50 hover:text-white transition-all"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Matrix Grid */}
            <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-24 md:pb-20">
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {allModules.map((mod, idx) => (
                  <motion.div
                    key={mod.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(idx * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => {
                      navigate(mod.path);
                      setIsMenuOpen(false);
                    }}
                    className="glass-card p-5 md:p-6 rounded-2xl md:rounded-3xl cursor-pointer group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-glow/[0.02] to-holo-violet/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="flex items-center gap-4 mb-2 md:mb-6 md:block">
                      <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shrink-0">
                        <mod.icon className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-display text-base md:text-lg text-white/90 relative z-10 md:hidden">{mod.name}</h3>
                    </div>
                    
                    <h3 className="font-display text-lg text-white/90 mb-2 relative z-10 hidden md:block">{mod.name}</h3>
                    <p className="text-xs text-white/40 font-sans tracking-wide leading-relaxed relative z-10 hidden md:block">{mod.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


