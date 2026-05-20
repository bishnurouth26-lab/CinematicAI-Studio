import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut,
  Image as ImageIcon, Music, Mic, Type, Sparkles, Wand2,
  Scissors, Save, RotateCcw, RotateCw, Video, Settings,
  AlignLeft, Download, Film, Layers, MonitorPlay, Activity, Focus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { subscribeToProjects, WorkspaceProject, updateProject } from '../lib/workspace';

interface TimelineBlock {
  id: string;
  type: 'video' | 'narration' | 'music' | 'sfx' | 'subtitle' | 'transition';
  start: number; // in seconds
  duration: number; // in seconds
  content: string;
  metadata?: any;
  color?: string;
  trackId: string;
}

interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'transition';
  icon: any;
  color: string;
  blocks: TimelineBlock[];
}

export const TimelineEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 10px per second, etc.
  const [duration, setDuration] = useState(60); // total timeline duration
  const [tracks, setTracks] = useState<TimelineTrack[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadInterval = useRef<any>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToProjects(user.uid, (data) => {
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
        loadProjectIntoTimeline(data[0]);
      } else if (selectedProjectId) {
         const proj = data.find(p => p.id === selectedProjectId);
         if (proj) loadProjectIntoTimeline(proj);
      }
    });
    return () => unsub();
  }, [user]);

  const loadProjectIntoTimeline = (project: WorkspaceProject) => {
    // Generate some mock blocks based on project content
    const baseDuration = 60;
    setDuration(baseDuration);

    const videoBlocks: TimelineBlock[] = [];
    const narrationBlocks: TimelineBlock[] = [];
    const subtitleBlocks: TimelineBlock[] = [];
    
    let currentStart = 0;
    const scenes = project.content?.prompts?.scenes || [];
    const scriptSections = project.content?.script?.text ? project.content.script.text.split('\n\n') : [];

    if (scenes.length > 0) {
      scenes.forEach((scene: any, index: number) => {
        const sceneDuration = index === scenes.length -1 ? baseDuration - currentStart : 5;
        videoBlocks.push({
          id: `v_${index}`,
          type: 'video',
          start: currentStart,
          duration: sceneDuration,
          content: scene.visual || `Scene ${index + 1}`,
          color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
          trackId: 'track_video'
        });
        currentStart += sceneDuration;
      });
    } else {
      videoBlocks.push({
        id: `v_0`, type: 'video', start: 0, duration: 15, content: 'Intro Scene - Dark Space', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300', trackId: 'track_video'
      });
      videoBlocks.push({
        id: `v_1`, type: 'video', start: 15, duration: 25, content: 'Main Graphic - Quantum Core', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300', trackId: 'track_video'
      });
      videoBlocks.push({
        id: `v_2`, type: 'video', start: 40, duration: 20, content: 'Outro - Logo Reveal', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300', trackId: 'track_video'
      });
    }

    narrationBlocks.push({
      id: `n_0`, type: 'narration', start: 1, duration: 12, content: 'Welcome to this AI documentary...', color: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300', trackId: 'track_narration'
    });
    narrationBlocks.push({
      id: `n_1`, type: 'narration', start: 16, duration: 20, content: 'Today we explore the depths of the universe...', color: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300', trackId: 'track_narration'
    });
    narrationBlocks.push({
      id: `n_2`, type: 'narration', start: 42, duration: 15, content: 'Subscribe for more.', color: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300', trackId: 'track_narration'
    });
    
    subtitleBlocks.push({
      id: `s_0`, type: 'subtitle', start: 1, duration: 5, content: 'Welcome to this AI documentary', color: 'bg-amber-500/20 border-amber-500/50 text-amber-300', trackId: 'track_subtitle'
    });

    setTracks([
      { id: 'track_video', name: 'Scenes', type: 'video', icon: Video, color: 'text-emerald-400', blocks: videoBlocks },
      { id: 'track_narration', name: 'Narration', type: 'audio', icon: Mic, color: 'text-indigo-400', blocks: narrationBlocks },
      { id: 'track_music', name: 'Music & SFX', type: 'audio', icon: Music, color: 'text-rose-400', blocks: [
        { id: 'm_0', type: 'music', start: 0, duration: 60, content: 'Cinematic Ambient Background (Loop)', color: 'bg-rose-500/20 border-rose-500/50 text-rose-300', trackId: 'track_music' }
      ] },
      { id: 'track_subtitle', name: 'Subtitles', type: 'text', icon: Type, color: 'text-amber-400', blocks: subtitleBlocks },
    ]);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      loadProjectIntoTimeline(proj);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playheadInterval.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      clearInterval(playheadInterval.current);
    }
    return () => clearInterval(playheadInterval.current);
  }, [isPlaying, duration]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const pixelsPerSecond = 20 * zoomLevel;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const clickTime = Math.max(0, Math.min(x / pixelsPerSecond, duration));
    setCurrentTime(clickTime);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 neon-glow">
          <Film className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-widest text-center">AI TIMELINE EDITOR</h2>
        <p className="text-slate-400 text-center max-w-sm">Sign in to sequence and synchronize your AI-generated media.</p>
      </div>
    );
  }

  const selectedProj = projects.find(p => p.id === selectedProjectId);
  const selectedBlock = tracks.flatMap(t => t.blocks).find(b => b.id === selectedBlockId);

  return (
    <div className="flex flex-col flex-1 min-h-[700px] h-full gap-4 pb-12 w-full max-w-[2000px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center neon-glow">
            <Film className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Cinematic Timeline Editor
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Auto-sync</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Visual sequence building and multi-track pacing</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedProjectId || ''}
            onChange={(e) => handleProjectSelect(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm font-medium text-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
          >
            <option value="" disabled>Select Project...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-black/40 hover:bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold transition-all whitespace-nowrap">
               <Wand2 className="w-4 h-4 text-fuchsia-400" /> AI Optimize
             </button>
             <button onClick={() => navigate('/export')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] whitespace-nowrap">
               <Download className="w-4 h-4" /> Export
             </button>
          </div>
        </div>
      </div>

      {/* Main Interface Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        
        {/* Left/Top: Preview & Video Context */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 min-h-[300px] lg:min-h-0">
          {/* Visual Preview Screen */}
          <div className="bg-black rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-inner relative aspect-video flex-shrink-0">
            <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
               <span className="text-xs font-mono bg-black/50 text-white px-2 py-1 rounded backdrop-blur-md border border-white/10">{formatTime(currentTime)}</span>
               <div className="flex gap-2">
                 <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">Rec</span>
               </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 bg-slate-900/50 p-6 text-center relative isolate">
               {selectedBlock?.type === 'video' ? (
                 <div className="absolute inset-0 p-8 flex items-center justify-center text-white/80 font-medium">
                   <ImageIcon className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" />
                   <p className="text-lg md:text-xl drop-shadow-lg z-10 bg-black/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">{selectedBlock.content}</p>
                 </div>
               ) : (
                 <>
                   <MonitorPlay className="w-12 h-12 mb-4 opacity-30" />
                   <p className="text-sm max-w-[80%]">Timeline preview will display visual contents of the current scene here.</p>
                 </>
               )}
            </div>
            
            {/* Playback Controls Bar */}
             <div className="h-14 bg-slate-950 border-t border-white/5 flex items-center justify-center gap-6 px-4">
               <button onClick={() => setCurrentTime(0)} className="text-slate-400 hover:text-white transition-colors" title="Go to Beginning"><SkipBack className="w-5 h-5" /></button>
               <button 
                 onClick={togglePlay}
                 className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-400 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.5)]"
               >
                 {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
               </button>
               <button onClick={() => setCurrentTime(duration)} className="text-slate-400 hover:text-white transition-colors" title="Go to End"><SkipForward className="w-5 h-5" /></button>
             </div>
          </div>

          {/* Properties Panel */}
          <div className="flex-1 glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-5 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              Inspector
            </h3>
            
            {selectedBlock ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Block Type</label>
                  <div className="flex items-center gap-2 text-sm text-white capitalize bg-black/30 p-2 rounded-lg border border-white/5">
                    {selectedBlock.type === 'video' && <ImageIcon className="w-4 h-4 text-emerald-400" />}
                    {selectedBlock.type === 'narration' && <Mic className="w-4 h-4 text-indigo-400" />}
                    {selectedBlock.type === 'music' && <Music className="w-4 h-4 text-rose-400" />}
                    {selectedBlock.type === 'subtitle' && <Type className="w-4 h-4 text-amber-400" />}
                    {selectedBlock.type}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Start Time (sec)</label>
                     <input 
                       type="number" step="0.1" 
                       value={selectedBlock.start} 
                       onChange={(e) => {
                         const val = parseFloat(e.target.value);
                         if (!isNaN(val)) {
                           setTracks(prev => prev.map(t => ({
                             ...t,
                             blocks: t.blocks.map(b => b.id === selectedBlock.id ? { ...b, start: val } : b)
                           })));
                         }
                       }}
                       className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 font-mono outline-none focus:ring-1 focus:ring-indigo-500" 
                     />
                   </div>
                   <div>
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Duration (sec)</label>
                     <input 
                       type="number" step="0.1" 
                       value={selectedBlock.duration} 
                       onChange={(e) => {
                         const val = parseFloat(e.target.value);
                         if (!isNaN(val) && val > 0) {
                           setTracks(prev => prev.map(t => ({
                             ...t,
                             blocks: t.blocks.map(b => b.id === selectedBlock.id ? { ...b, duration: val } : b)
                           })));
                         }
                       }}
                       className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 font-mono outline-none focus:ring-1 focus:ring-indigo-500" 
                     />
                   </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Content</label>
                  <textarea 
                    value={selectedBlock.content}
                    onChange={(e) => {
                      setTracks(prev => prev.map(t => ({
                        ...t,
                        blocks: t.blocks.map(b => b.id === selectedBlock.id ? { ...b, content: e.target.value } : b)
                      })));
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-slate-300 h-28 resize-none custom-scrollbar outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                   <button 
                     onClick={() => {
                        setTracks(prev => prev.map(t => ({
                          ...t,
                          blocks: t.blocks.filter(b => b.id !== selectedBlock.id)
                        })));
                        setSelectedBlockId(null);
                     }}
                     className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold transition-colors border border-rose-500/20"
                   >
                     Remove Block
                   </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                <Focus className="w-8 h-8 mb-3" />
                <p className="text-sm text-center">Select a block on the timeline<br/>to edit its properties</p>
              </div>
            )}
          </div>
        </div>

        {/* Right/Bottom: Multi-track Timeline */}
        <div className="flex-1 glass-card bg-slate-900/50 border border-white/10 rounded-3xl flex flex-col overflow-hidden relative">
          
          {/* Timeline Toolbar */}
          <div className="h-12 border-b border-white/10 bg-slate-950 flex items-center justify-between px-4">
             <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
               <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {tracks.length} Tracks</span>
               <span className="flex items-center gap-1 bg-white/5 py-1 px-2 rounded"><Play className="w-3 h-3" /> {formatTime(duration)}</span>
             </div>
             <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/5">
                <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.5))} className="p-1 text-slate-400 hover:text-white transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                <span className="text-[10px] w-12 text-center font-mono">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={() => setZoomLevel(Math.min(5, zoomLevel + 0.5))} className="p-1 text-slate-400 hover:text-white transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
             </div>
          </div>

          {/* Timeline Tracks Area */}
          <div className="flex-1 flex overflow-hidden relative bg-[#0a0a0f]">
            
            {/* Track Headers (Left Pane) */}
            <div className="w-40 border-r border-white/10 bg-slate-950 flex flex-col z-20 shadow-[5px_0_15px_rgba(0,0,0,0.5)] flex-shrink-0 pt-8 relative">
               {tracks.map(track => (
                 <div key={track.id} className="h-24 border-b border-white/5 flex flex-col justify-center px-4 relative overflow-hidden group">
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-current opacity-50", track.color)} />
                    <div className="flex items-center gap-2 mb-1">
                      <track.icon className={cn("w-4 h-4", track.color)} />
                      <span className="text-xs font-bold text-white truncate">{track.name}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-[10px] text-slate-500 hover:text-white bg-white/5 px-1.5 py-0.5 rounded">Mute</button>
                      <button className="text-[10px] text-slate-500 hover:text-white bg-white/5 px-1.5 py-0.5 rounded">Solo</button>
                    </div>
                 </div>
               ))}
            </div>

            {/* Timeline Canvas (Right Pane with scroll) */}
            <div 
              ref={timelineRef}
              className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar relative pt-8"
              onClick={handleTimelineClick}
            >
               {/* Time ruler */}
               <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900 border-b border-white/10 flex z-10 sticky top-0" style={{ width: Math.max(800, duration * pixelsPerSecond) + 'px' }}>
                 {Array.from({ length: Math.ceil(duration / 5) + 1 }).map((_, i) => (
                   <div key={i} className="absolute h-full border-l border-white/10 flex flex-col justify-end pb-1 pl-1" style={{ left: `${i * 5 * pixelsPerSecond}px` }}>
                     <span className="text-[9px] text-slate-500 font-mono select-none">{formatTime(i * 5)}</span>
                   </div>
                 ))}
               </div>

               {/* Track Lanes */}
               <div className="relative" style={{ width: Math.max(800, duration * pixelsPerSecond) + 'px' }}>
                 {tracks.map(track => (
                   <div key={track.id} className="h-24 border-b border-white/5 relative bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                     {/* Background grid lines */}
                     {Array.from({ length: Math.ceil(duration / 5) }).map((_, i) => (
                       <div key={i} className="absolute top-0 bottom-0 border-l border-white/[0.03]" style={{ left: `${i * 5 * pixelsPerSecond}px` }} />
                     ))}

                     {/* Render Blocks */}
                     {track.blocks.map(block => {
                       const isSelected = selectedBlockId === block.id;
                       return (
                         <div
                           key={block.id}
                           onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); }}
                           className={cn(
                             "absolute top-2 bottom-2 rounded-lg border backdrop-blur-sm p-2 overflow-hidden cursor-pointer transition-shadow shadow-md flex items-center select-none",
                             block.color,
                             isSelected ? "shadow-[0_0_0_2px_#fff,0_0_20px_rgba(255,255,255,0.2)] z-10 scale-[1.02]" : "hover:border-white/40 z-0",
                           )}
                           style={{
                             left: `${block.start * pixelsPerSecond}px`,
                             width: `${block.duration * pixelsPerSecond}px`,
                           }}
                         >
                            <span className="text-[10px] font-semibold truncate leading-tight w-full drop-shadow-md">
                              {block.content}
                            </span>
                            
                            {/* Grip Handles (visual only in this simple version) */}
                            {isSelected && (
                              <>
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-white/20 cursor-ew-resize opacity-0 hover:opacity-100 backdrop-blur" />
                                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20 cursor-ew-resize opacity-0 hover:opacity-100 backdrop-blur" />
                              </>
                            )}
                         </div>
                       );
                     })}
                   </div>
                 ))}

                 {/* Playhead Scrubber */}
                 <div 
                   className="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-none"
                   style={{ left: `${currentTime * pixelsPerSecond}px` }}
                 >
                   <div className="absolute top-0 -translate-x-1/2 -mt-7 w-3 h-3 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.8)] before:content-[''] before:absolute before:top-full before:left-1/2 before:-ml-1.5 before:border-[6px] before:border-transparent before:border-t-red-500" />
                 </div>

               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
