import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Archive, FileText, Image as ImageIcon, Search, Mic, 
  Video, Microscope, CheckCircle2, FileJson, Cloud, Youtube,
  PlaySquare, Settings2, FolderDown, Copy
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { subscribeToProjects, WorkspaceProject } from '../lib/workspace';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from '../lib/utils';

export const ExportStudio = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const [exportSettings, setExportSettings] = useState({
    format: 'ZIP',
    includeScripts: true,
    includePrompts: true,
    includeThumbnails: true,
    includeSeo: true,
    includeShorts: true,
    includeAudio: true,
    includeResearch: true,
    cloudBackup: false,
    autoFormatPacing: true
  });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToProjects(user.uid, (data) => {
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleExport = async () => {
    if (!selectedProject) return;
    setIsExporting(true);
    setExportProgress(0);

    const zip = new JSZip();
    const safeTitle = selectedProject.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    const folderName = `${safeTitle}_${date}_v1`;
    const folder = zip.folder(folderName);
    
    if (!folder) return;

    const content = selectedProject.content || {};

    const simulateProgress = (progress: number) => new Promise(res => setTimeout(() => { setExportProgress(progress); res(null); }, 300));

    // Scripts
    if (exportSettings.includeScripts && content.script?.text) {
      folder.folder('Scripts')?.file('main_script.txt', content.script.text);
      folder.folder('Scripts')?.file('main_script.md', `# ${selectedProject.title}\n\n${content.script.text}`);
      await simulateProgress(15);
    }

    // Prompts
    if (exportSettings.includePrompts && content.prompts?.scenes) {
      folder.folder('Scene Prompts')?.file('prompts.txt', JSON.stringify(content.prompts.scenes, null, 2));
      await simulateProgress(30);
    }

    // Thumbnails
    if (exportSettings.includeThumbnails && content.thumbnails?.ideas) {
      folder.folder('Thumbnails')?.file('thumbnail_prompts.txt', JSON.stringify(content.thumbnails.ideas, null, 2));
      await simulateProgress(45);
    }

    // SEO
    if (exportSettings.includeSeo && content.seo?.tags) {
      const seoData = `Title: ${selectedProject.title}\nTags: ${content.seo.tags.join(', ')}\nDescription: ${content.seo.description || ''}`;
      folder.folder('SEO')?.file('youtube_metadata.txt', seoData);
      await simulateProgress(60);
    }

    // Shorts
    if (exportSettings.includeShorts && content.shorts?.scenes) {
      folder.folder('Shorts')?.file('shorts_kit.json', JSON.stringify(content.shorts.scenes, null, 2));
      await simulateProgress(75);
    }

    // Audio & Research & Resources
    if (exportSettings.includeAudio && content.audio?.url) {
      folder.folder('Audio')?.file('voice_metadata.txt', `Voice URL: ${content.audio.url}`);
    }
    
    if (exportSettings.includeResearch && content.research?.report) {
      folder.folder('Research')?.file('fact_check_report.md', content.research.report);
    }

    folder.folder('Resources')?.file('info.txt', 'Put additional resources here.');
    
    await simulateProgress(90);

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}.zip`);
      await simulateProgress(100);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 neon-glow">
          <Archive className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-widest text-center">AI EXPORT STUDIO</h2>
        <p className="text-slate-400 text-center max-w-sm">Sign in to package your generated content for production workflows.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto h-full min-h-[500px] pb-12 w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center neon-glow shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <Archive className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Production Package Export</h1>
            <p className="text-slate-400">Organize and download your AI generations for YouTube editing.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Projects & Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Select Project</h2>
            {projects.length === 0 ? (
              <p className="text-slate-500 text-sm">No projects found. Create one in Workspace first.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border transition-all",
                      selectedProjectId === project.id 
                        ? "bg-rose-500/20 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                        : "bg-black/40 border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/10"
                    )}
                  >
                    <h3 className="font-bold text-sm truncate">{project.title}</h3>
                    <p className="text-xs opacity-70 mt-1 flex items-center gap-2">
                       <span>{project.completionPercentage}% Complete</span>
                       <span>•</span>
                       <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card bg-slate-900/50 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px]" />
             <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Youtube className="w-5 h-5 text-emerald-400" /> Workflow Presets</h2>
             <div className="space-y-3">
               <button className="w-full flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/50 transition-colors group">
                 <div className="flex flex-col text-left">
                   <span className="text-sm font-bold text-slate-200 group-hover:text-emerald-400">Full Production Package</span>
                   <span className="text-xs text-slate-500">Everything organized in folders</span>
                 </div>
                 <FolderDown className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
               </button>
               <button className="w-full flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/50 transition-colors group">
                 <div className="flex flex-col text-left">
                   <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400">Shorts Kit Only</span>
                   <span className="text-xs text-slate-500">Vertical format, captions, hooks</span>
                 </div>
                 <Video className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
               </button>
             </div>
          </div>
        </div>

        {/* Right Column: Export Configuration */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-rose-400" />
                Package Configuration
              </h2>
              
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                {['ZIP', 'JSON'].map(fmt => (
                  <button 
                    key={fmt}
                    onClick={() => setExportSettings({ ...exportSettings, format: fmt })}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                      exportSettings.format === fmt ? "bg-slate-700 text-white shadow" : "text-slate-500 hover:text-white"
                    )}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {[
                { id: 'includeScripts', label: 'Scripts', icon: FileText },
                { id: 'includePrompts', label: 'Prompts', icon: PlaySquare },
                { id: 'includeThumbnails', label: 'Thumbnails', icon: ImageIcon },
                { id: 'includeSeo', label: 'SEO Data', icon: Search },
                { id: 'includeShorts', label: 'Shorts Kit', icon: Video },
                { id: 'includeAudio', label: 'Voice/Audio', icon: Mic },
                { id: 'includeResearch', label: 'Research', icon: Microscope },
              ].map(item => {
                const isSelected = (exportSettings as any)[item.id];
                return (
                  <div 
                    key={item.id}
                    onClick={() => setExportSettings({ ...exportSettings, [item.id]: !isSelected })}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border cursor-pointer transition-all gap-3 text-center",
                      isSelected 
                        ? "bg-rose-500/10 border-rose-500/50 text-white shadow-inner shadow-rose-500/10" 
                        : "bg-black/30 border-white/5 text-slate-500 hover:bg-white/5 hover:border-white/10 hover:text-slate-300"
                    )}
                  >
                    <item.icon className={cn("w-6 h-6", isSelected && "text-rose-400")} />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Advanced Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5">
                   <input type="checkbox" checked={exportSettings.cloudBackup} onChange={(e) => setExportSettings({ ...exportSettings, cloudBackup: e.target.checked })} className="rounded bg-slate-800 border-white/10 text-rose-500 focus:ring-rose-500" />
                   <div>
                     <span className="text-sm font-medium text-white block">Cloud Drive Backup</span>
                     <span className="text-xs text-slate-500">Auto-sync to Google Drive</span>
                   </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5">
                   <input type="checkbox" checked={exportSettings.autoFormatPacing} onChange={(e) => setExportSettings({ ...exportSettings, autoFormatPacing: e.target.checked })} className="rounded bg-slate-800 border-white/10 text-rose-500 focus:ring-rose-500" />
                   <div>
                     <span className="text-sm font-medium text-white block">Auto-Format Pacing</span>
                     <span className="text-xs text-slate-500">Insert pause makers for TTS</span>
                   </div>
                </label>
              </div>
            </div>

          </div>

          <div className="glass-card bg-slate-900/50 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-white mb-2">Ready to Export</h3>
              {selectedProject ? (
                <p className="text-sm text-slate-400">Packaging <span className="text-rose-400 font-semibold">{selectedProject.title}</span>.</p>
              ) : (
                <p className="text-sm text-amber-500">Please select a project first.</p>
              )}
            </div>

            <div className="flex-1 w-full md:max-w-xs relative">
              {isExporting && (
                 <div className="absolute -top-6 left-0 right-0 flex justify-between text-xs font-semibold text-rose-400 mb-2">
                   <span>Packaging...</span>
                   <span>{exportProgress}%</span>
                 </div>
              )}
              {isExporting && (
                <div className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${exportProgress}%` }}
                    className="bg-gradient-to-r from-rose-600 to-rose-400 h-2 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                  />
                </div>
              )}
            </div>

            <button 
              onClick={handleExport}
              disabled={isExporting || !selectedProject}
              className="flex items-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
            >
              {exportProgress === 100 ? (
                <><CheckCircle2 className="w-5 h-5" /> Packaged!</>
              ) : isExporting ? (
                <><Archive className="w-5 h-5 animate-bounce" /> Compressing</>
              ) : (
                <><Download className="w-5 h-5" /> Generate Package</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
