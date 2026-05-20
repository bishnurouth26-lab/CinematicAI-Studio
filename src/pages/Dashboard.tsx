import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ImageIcon, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SystemStatus = ({ title, status, value }: { title: string, status: string, value: string }) => (
  <div className="glass-card p-4 md:p-5 rounded-2xl w-full max-w-[16rem] flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">{title}</span>
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-cyan-glow animate-pulse' : 'bg-holo-violet'}`} />
      </div>
    </div>
    <span className="font-display text-xl md:text-2xl font-medium tracking-wide text-white/90">{value}</span>
  </div>
);

export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-x-hidden flex-col pb-12 px-4 md:px-8">
      
      {/* Background Ambient Text */}
      <h1 className="absolute text-[12vw] md:text-[15vw] font-display font-black text-white/[0.015] select-none pointer-events-none tracking-tighter mix-blend-overlay z-0 whitespace-nowrap top-1/2 -translate-y-1/2">
        CREATOR OS
      </h1>

      <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-12 w-full place-items-center">
          
          {/* Left Column (Desktop) */}
          <div className="hidden md:flex flex-col gap-8 lg:gap-16 items-end w-full">
             <motion.div 
               initial={{ x: -50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
               className="w-full flex justify-end"
             >
               <SystemStatus title="Neural Synapse" status="active" value="99.9% SYNC" />
             </motion.div>
             <motion.div 
               initial={{ x: -50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
               className="w-full flex justify-end"
             >
                <div className="glass-card p-5 lg:p-6 rounded-3xl w-full max-w-[16rem] lg:max-w-xs group cursor-pointer" onClick={() => navigate('/scripts')}>
                  <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4 lg:mb-6 group-hover:bg-white/[0.05] transition-colors">
                    <FileText className="w-4 h-4 text-white/70" />
                  </div>
                  <h3 className="font-display text-lg lg:text-xl text-white/90 mb-2">Script Engine</h3>
                  <p className="text-xs lg:text-sm text-white/40 leading-relaxed">Initialize narrative architectures via natural language models.</p>
                </div>
             </motion.div>
          </div>

          {/* Central Creative Core */}
          <div className="flex items-center justify-center w-full py-8 md:py-0">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="relative flex items-center justify-center shrink-0"
            >
              {/* Outer Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="absolute w-[280px] h-[280px] md:w-[320px] md:h-[320px] lg:w-[400px] lg:h-[400px] border border-white/[0.03] rounded-full border-t-cyan-glow/20 border-b-holo-violet/20"
              />
              {/* Middle Ring */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute w-[220px] h-[220px] md:w-[240px] md:h-[240px] lg:w-[300px] lg:h-[300px] border border-white/[0.05] rounded-full border-l-cyan-glow/30"
              />
              
              {/* The Orb */}
              <div 
                className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-midnight border border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_60px_rgba(56,189,248,0.1)] hover:shadow-[0_0_100px_rgba(56,189,248,0.2)] transition-all duration-1000 ease-out cursor-pointer hover:border-cyan-glow/30 group" 
                onClick={() => navigate('/workspace')}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05)0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-glow/10 to-holo-violet/10 opacity-50 mix-blend-overlay animate-pulse-glow" />
                <Power className="w-8 h-8 lg:w-10 lg:h-10 text-white/30 group-hover:text-white/80 transition-colors duration-500" strokeWidth={1} />
              </div>
            </motion.div>
          </div>

          {/* Right Column (Desktop) */}
          <div className="hidden md:flex flex-col gap-8 lg:gap-16 items-start w-full">
             <motion.div 
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
               className="w-full flex justify-start"
             >
               <SystemStatus title="Rendering Queue" status="standby" value="0 ACTIVE" />
             </motion.div>
             <motion.div 
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
               className="w-full flex justify-start"
             >
                <div className="glass-card p-5 lg:p-6 rounded-3xl w-full max-w-[16rem] lg:max-w-xs group cursor-pointer" onClick={() => navigate('/scenes')}>
                  <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4 lg:mb-6 group-hover:bg-white/[0.05] transition-colors">
                    <ImageIcon className="w-4 h-4 text-white/70" />
                  </div>
                  <h3 className="font-display text-lg lg:text-xl text-white/90 mb-2">Visual Composer</h3>
                  <p className="text-xs lg:text-sm text-white/40 leading-relaxed">Generate cinematic concept frames utilizing spatial diffusion.</p>
                </div>
             </motion.div>
          </div>

        </div>

        {/* Mobile-Only Module Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex md:hidden flex-col gap-3 w-full max-w-sm mt-8 relative z-30"
        >
          <div className="glass-card p-4 rounded-2xl w-full flex items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-95 transition-all" onClick={() => navigate('/scripts')}>
             <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-white/70" />
             </div>
             <div>
                <h3 className="font-display text-sm text-white/90">Script Engine</h3>
                <p className="text-xs text-white/40">Narrative architecture</p>
             </div>
          </div>
          
          <div className="glass-card p-4 rounded-2xl w-full flex items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-95 transition-all" onClick={() => navigate('/scenes')}>
             <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 text-white/70" />
             </div>
             <div>
                <h3 className="font-display text-sm text-white/90">Visual Composer</h3>
                <p className="text-xs text-white/40">Cinematic frames</p>
             </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};


