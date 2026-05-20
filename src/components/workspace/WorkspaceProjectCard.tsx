import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Trash2, Clock } from 'lucide-react';
import { WorkspaceProject } from '../../lib/workspace';

interface ProjectCardProps {
  project: WorkspaceProject;
  onClick: (project: WorkspaceProject) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const WorkspaceProjectCard = memo(({ project, onClick, onDelete }: ProjectCardProps) => {
  return (
    <motion.div
      layoutId={`project-${project.id}`}
      onClick={() => onClick(project)}
      className="glass-card rounded-3xl p-6 group cursor-pointer relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-glow/[0.02] to-holo-violet/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
          <FolderOpen className="w-5 h-5 text-white/60 group-hover:text-cyan-glow transition-colors" strokeWidth={1.5} />
        </div>
        <button onClick={(e) => onDelete(e, project.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-400 rounded-full text-white/30 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <h3 className="text-xl font-display text-white/90 mb-2 truncate relative z-10 group-hover:text-white transition-colors">{project.title}</h3>
      
      <div className="flex items-center gap-2 text-xs text-white/40 mb-6 font-sans relative z-10">
        <Clock className="w-3.5 h-3.5" />
        <span>Modified {new Date(project.updatedAt).toLocaleDateString()}</span>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex justify-between text-xs font-mono tracking-widest uppercase">
          <span className="text-white/40">Sequence Sync</span>
          <span className="text-cyan-glow">{project.completionPercentage}%</span>
        </div>
        <div className="w-full bg-white/[0.03] rounded-full h-1 border border-white/[0.05] overflow-hidden">
          <motion.div 
            className="bg-cyan-glow h-full rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" 
            initial={{ width: 0 }}
            animate={{ width: `${project.completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
});
WorkspaceProjectCard.displayName = 'WorkspaceProjectCard';
