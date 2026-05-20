import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderPlus, FolderOpen, MoreVertical, Search as SearchIcon, 
  Clock, CheckCircle, Save, Cloud, CloudOff, UserPlus, FileText, 
  Clapperboard, ImageIcon, Search, Mic, Video, Microscope, Trash2, 
  Copy, Share2, Archive, Users, LayoutDashboard, CornerDownRight
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { 
  WorkspaceProject, 
  createProject, 
  updateProject, 
  deleteProject, 
  subscribeToProjects 
} from '../lib/workspace';
import { WorkspaceProjectCard } from '../components/workspace/WorkspaceProjectCard';

const tabs = [
  { id: 'script', label: 'Script', icon: FileText },
  { id: 'prompts', label: 'Frames', icon: Clapperboard },
  { id: 'thumbnails', label: 'Thumbnails', icon: ImageIcon },
  { id: 'seo', label: 'Matrix', icon: Search },
  { id: 'audio', label: 'Audio', icon: Mic },
  { id: 'shorts', label: 'Shorts', icon: Video },
  { id: 'research', label: 'Research', icon: Microscope },
];

export const Workspace = () => {
  const { user, login } = useAuth();
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [activeProject, setActiveProject] = useState<WorkspaceProject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  
  // Auto-save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [localContent, setLocalContent] = useState<any>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToProjects(user.uid, (data) => {
      setProjects(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleOpenProject = (project: WorkspaceProject) => {
    setActiveProject(project);
    setLocalContent(project.content || {});
    setLastSaved(new Date(project.updatedAt));
  };

  const handleCreateProject = async () => {
    if (!user) {
      await login();
      return;
    }
    const newProj = await createProject(user.uid, 'New Synapse Project');
    handleOpenProject(newProj);
  };

  useEffect(() => {
    if (!activeProject) return;

    const timeoutId = setTimeout(() => {
      if (JSON.stringify(localContent) !== JSON.stringify(activeProject.content)) {
        setIsSaving(true);
        updateProject(activeProject.id, { content: localContent, completionPercentage: calculateCompletion(localContent) })
          .then(() => {
            setLastSaved(new Date());
            setIsSaving(false);
          })
          .catch(err => {
            console.error("Failed to auto-save:", err);
            setIsSaving(false);
          });
      }
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [localContent, activeProject]);

  const calculateCompletion = (content: any) => {
    const totalTabs = tabs.length;
    let completed = 0;
    if (content.script?.text) completed++;
    if (content.prompts?.scenes) completed++;
    if (content.thumbnails?.ideas) completed++;
    if (content.seo?.tags) completed++;
    if (content.audio?.url) completed++;
    if (content.shorts?.scenes) completed++;
    if (content.research?.report) completed++;
    return Math.round((completed / totalTabs) * 100);
  };

  const handleContentChange = (tabId: string, value: any) => {
    setLocalContent((prev: any) => ({
      ...prev,
      [tabId]: value
    }));
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id);
      if (activeProject?.id === id) setActiveProject(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="w-24 h-24 bg-white/[0.02] border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.1)] relative">
          <div className="absolute inset-0 rounded-full border-t border-cyan-glow/40 animate-spin" style={{ animationDuration: '3s' }} />
          <FolderOpen className="w-8 h-8 text-cyan-glow" strokeWidth={1} />
        </div>
        <div className="text-center">
            <h2 className="text-3xl font-display text-white tracking-[0.2em] mb-2 uppercase">Synapse Workspace</h2>
            <p className="text-white/40 max-w-sm font-sans mx-auto mb-8">Initialize secure spatial memory link to manage your creative neural projects.</p>
        </div>
        <button onClick={() => navigate('/auth')} className="px-8 py-3 bg-white hover:bg-white/90 text-obsidian rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] tracking-wide">
          Authenticate Link
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[2000px] mx-auto h-full min-h-[500px] pb-12 w-full">
      {!activeProject ? (
        <div className="space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
            <div>
              <h1 className="text-4xl font-display font-light text-white mb-2 tracking-wide">Neural Workspace</h1>
              <p className="text-white/40 tracking-wide font-sans text-sm">Spatial memory array and asset synchronization.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 glass-panel rounded-full overflow-hidden">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Query index..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:ring-1 focus:ring-cyan-glow/50 outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleCreateProject}
                className="flex items-center gap-2 px-6 py-3 bg-white text-obsidian rounded-full hover:bg-white/90 font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)] whitespace-nowrap"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Initialize Core</span>
              </button>
            </div>
          </div>

          {/* Project List */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <WorkspaceProjectCard
                key={project.id}
                project={project}
                onClick={handleOpenProject}
                onDelete={handleDeleteProject}
              />
            ))}

            {filteredProjects.length === 0 && (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-white/30 glass-panel rounded-3xl border border-dashed border-white/10">
                <Archive className="w-12 h-12 mb-4 opacity-50" strokeWidth={1} />
                <p className="font-display tracking-widest text-sm uppercase">No active nodes located</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Spatial Editor View */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 w-full max-w-[1800px] mx-auto flex flex-col cyber-panel overflow-hidden relative shadow-lg min-h-[600px] h-full mt-2 md:mt-4"
        >
          {/* Top Control Array */}
          <div className="h-16 md:h-20 border-b border-white/[0.05] bg-obsidian/40 backdrop-blur-2xl flex items-center justify-between px-4 md:px-8 shrink-0 relative z-20">
            <div className="flex items-center gap-2 md:gap-6">
              <button 
                onClick={() => {
                  updateProject(activeProject.id, { content: localContent, completionPercentage: calculateCompletion(localContent) });
                  setActiveProject(null);
                }} 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors shrink-0"
                title="Return to Array"
              >
                <CornerDownRight className="w-4 h-4 rotate-90" />
              </button>
              
              <input 
                type="text" 
                value={activeProject.title}
                onChange={(e) => {
                  setActiveProject({ ...activeProject, title: e.target.value });
                  updateProject(activeProject.id, { title: e.target.value });
                }}
                className="bg-transparent text-lg md:text-2xl font-display font-medium text-white border-none outline-none focus:ring-0 placeholder-white/30 w-full min-w-0 md:w-80 hover:bg-white/[0.02] px-2 py-1.5 md:px-3 rounded-lg transition-colors border border-transparent hover:border-white/10"
                placeholder="Project Identity"
              />
            </div>
            
            <div className="flex items-center gap-4 md:gap-8 shrink-0 pl-2">
              {/* Sync Status */}
              <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-white/40">
                {isSaving ? (
                  <>
                    <Cloud className="w-3 h-3 md:w-4 md:h-4 text-cyan-glow animate-pulse" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-holo-violet" />
                    <span>Synced</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2 md:gap-3">
                <button className="hidden sm:flex w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                  <Users className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white text-xs md:text-sm font-medium transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                  Link
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-1 min-h-0 relative z-10 flex-col md:flex-row border-t-0">
            {/* Navillary Sub-System */}
            <div className="w-full h-14 md:h-auto md:w-64 border-b md:border-b-0 md:border-r border-white/[0.05] bg-obsidian/30 md:p-6 space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-y-auto flex md:flex-col items-center md:items-stretch px-4 md:px-0 shrink-0 no-scrollbar">
              <span className="hidden md:block text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mb-4 px-2">Sub-Modules</span>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const hasData = !!localContent[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center justify-center md:justify-between px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all font-sans text-xs md:text-sm whitespace-nowrap md:whitespace-normal shrink-0",
                      isActive 
                        ? "bg-white/[0.08] border border-white/[0.1] text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)] md:shadow-[0_4px_20px_rgba(0,0,0,0.2)]" 
                        : "text-white/40 hover:bg-white/[0.04] hover:text-white/80 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <tab.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4", isActive ? "text-cyan-glow" : "text-white/30")} strokeWidth={isActive ? 2 : 1.5} />
                      <span className="font-medium tracking-wide">{tab.label}</span>
                    </div>
                    {hasData && (
                      <div className={cn("hidden md:block w-1.5 h-1.5 rounded-full", isActive ? "bg-cyan-glow shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "bg-white/20")} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Spatial Editor Canvas */}
            <div className="flex-1 bg-obsidian relative overflow-y-auto flex flex-col min-h-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(167,139,250,0.05)_0%,transparent_60%)] pointer-events-none" />
              
              <div className="p-4 md:p-10 max-w-5xl mx-auto w-full flex-1 flex flex-col relative z-10 min-h-0">
                <div className="mb-4 md:mb-8 flex flex-col sm:flex-row justify-between sm:items-end border-b border-white/[0.05] pb-4 md:pb-6 gap-4">
                  <div>
                    <h2 className="text-xl md:text-3xl font-display font-light text-white capitalize flex items-center gap-3 md:gap-4">
                      {(() => {
                        const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon;
                        return ActiveIcon ? <ActiveIcon className="w-6 h-6 md:w-8 md:h-8 text-cyan-glow/80" strokeWidth={1} /> : null;
                      })()}
                      {activeTab} Interface
                    </h2>
                    <p className="text-white/40 mt-1 md:mt-3 font-sans text-xs md:text-sm tracking-wide">Spatial editing field. Auto-sync active.</p>
                  </div>
                  
                  {/* The requested Copy Button */}
                  <button 
                    onClick={() => {
                      if (localContent[activeTab]?.text) {
                        navigator.clipboard.writeText(localContent[activeTab]?.text);
                        setCopiedId(activeTab);
                        setTimeout(() => setCopiedId(null), 2000);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all border",
                      copiedId === activeTab 
                        ? "bg-holo-violet/20 text-holo-violet border-holo-violet/30" 
                        : "bg-white/[0.03] hover:bg-white/[0.08] text-white/70 border-white/[0.05] hover:border-white/[0.15]"
                    )}
                  >
                    {copiedId === activeTab ? (
                      <><CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Sequence Copied</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5 md:w-4 md:h-4" /> Extract {activeTab}</>
                    )}
                  </button>
                </div>

                <textarea 
                  value={localContent[activeTab]?.text || ''}
                  onChange={(e) => handleContentChange(activeTab, { text: e.target.value })}
                  placeholder={`Input ${activeTab} parameters...`}
                  className="flex-1 w-full bg-black/40 border border-white/[0.05] rounded-2xl md:rounded-3xl p-4 md:p-8 text-white/80 font-mono text-[11px] md:text-[13px] leading-loose resize-none focus:outline-none focus:ring-1 focus:ring-holo-violet/50 transition-all shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] min-h-[300px]"
                  style={{ backdropFilter: 'blur(20px)' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
