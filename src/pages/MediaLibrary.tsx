import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Library, Image as ImageIcon, Video, FileText, Mic, Microscope, 
  Search, Plus, Star, Folder, Filter, MoreVertical, Upload,
  Download, Trash2, Edit2, Play, CornerDownRight, X, LayoutGrid, Heart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { subscribeToAssets, MediaAsset, createAsset, deleteAsset, updateAsset } from '../lib/media';

const FOLDERS = [
  { id: 'All', name: 'All Assets', icon: LayoutGrid },
  { id: 'Favorites', name: 'Favorites', icon: Heart },
  { id: 'Projects', name: 'Projects', icon: Folder },
  { id: 'Thumbnails', name: 'Thumbnails', icon: ImageIcon },
  { id: 'Videos', name: 'Videos', icon: Video },
  { id: 'Shorts', name: 'Shorts', icon: Video },
  { id: 'Scripts', name: 'Scripts', icon: FileText },
  { id: 'Audio', name: 'Audio', icon: Mic },
  { id: 'Research', name: 'Research', icon: Microscope },
  { id: 'Prompts', name: 'Saved Prompts', icon: FileText },
];

export const MediaLibrary = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToAssets(user.uid, activeFolder === 'All' || activeFolder === 'Favorites' ? null : activeFolder, (data) => {
      setAssets(data);
    });
    return () => unsub();
  }, [user, activeFolder]);

  const filteredAssets = assets
    .filter(a => activeFolder === 'Favorites' ? a.isFavorite : true)
    .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

  const handleUploadMock = async () => {
    if (!user) return;
    setIsUploading(true);
    // Simulate upload delay
    await new Promise(res => setTimeout(res, 1000));
    const randomType = ['image', 'video', 'audio', 'script', 'prompt'][Math.floor(Math.random() * 5)] as MediaAsset['type'];
    const fakeAsset = {
      name: `New Asset ${Math.floor(Math.random() * 1000)}`,
      type: randomType,
      url: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80',
      tags: ['ai-generated', 'cinematic'],
      isFavorite: false,
      folder: activeFolder === 'All' || activeFolder === 'Favorites' ? 'Thumbnails' : activeFolder,
      sizeBytes: Math.floor(Math.random() * 5000000)
    };
    await createAsset(user.uid, fakeAsset);
    setIsUploading(false);
  };

  const toggleFavorite = async (e: React.MouseEvent, assetId: string, currentStatus: boolean) => {
    e.stopPropagation();
    await updateAsset(assetId, { isFavorite: !currentStatus });
  };

  const handleDelete = async (assetId: string) => {
    await deleteAsset(assetId);
    if (selectedAsset?.id === assetId) setSelectedAsset(null);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 neon-glow">
          <Library className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-widest text-center">AI MEDIA LIBRARY</h2>
        <p className="text-slate-400 text-center max-w-sm">Sign in to manage and organize your creative assets.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-[700px] h-full gap-6 pb-12 w-full max-w-[1600px] mx-auto">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex flex-col gap-6 shrink-0 md:h-full overflow-y-auto custom-scrollbar md:pb-10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <Library className="w-6 h-6 text-blue-400" />
            Library
          </h2>
          <p className="text-slate-400 text-sm">Asset Management</p>
        </div>

        <button 
          onClick={handleUploadMock}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl font-bold text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50"
        >
          {isUploading ? <Upload className="w-5 h-5 animate-bounce" /> : <Plus className="w-5 h-5" />}
          {isUploading ? 'Uploading...' : 'New Asset'}
        </button>

        <div className="space-y-1">
          {FOLDERS.map(folder => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-left",
                activeFolder === folder.id 
                  ? "bg-blue-600/10 text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.1)] border border-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <folder.icon className="w-4 h-4" />
              <span>{folder.name}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-auto glass-card bg-slate-900/50 border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400">Storage Used</span>
            <span className="text-xs text-blue-400 font-bold">1.2 GB</span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[15%]" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden relative">
        {/* Top Bar */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 bg-black/20">
          <div className="flex items-center gap-3 text-lg font-bold text-white">
            {(() => {
              const ActiveIcon = FOLDERS.find(f => f.id === activeFolder)?.icon;
              return ActiveIcon ? <ActiveIcon className="w-5 h-5 text-blue-400" /> : null;
            })()}
            {FOLDERS.find(f => f.id === activeFolder)?.name}
            <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
              {filteredAssets.length} items
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 text-white transition-all"
              />
            </div>
            <button className="p-2 bg-black/40 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {filteredAssets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
              <div className="p-4 bg-white/5 rounded-full">
                <Folder className="w-8 h-8 opacity-50" />
              </div>
              <p>No assets found in this view.</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              <AnimatePresence>
                {filteredAssets.map(asset => {
                  // Simulate different heights for masonry feel if it's an image
                  const isTall = ['image'].includes(asset.type) && asset.id.charCodeAt(0) % 2 === 0;
                  return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={cn(
                      "group relative bg-black/40 border border-white/5 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all shadow-md hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] break-inside-avoid rounded-2xl",
                      ['image', 'video'].includes(asset.type) ? (isTall ? "aspect-[3/4]" : "aspect-[4/3]") : "aspect-square"
                    )}
                  >
                    {/* Visual Preview */}
                    {['image', 'video'].includes(asset.type) ? (
                      <div className="absolute inset-0 bg-slate-800">
                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        {asset.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
                              <Play className="w-4 h-4 text-white ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                        {asset.type === 'audio' ? <Mic className="w-10 h-10 mb-2" /> : <FileText className="w-10 h-10 mb-2" />}
                      </div>
                    )}

                    {/* Top actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button 
                        onClick={(e) => toggleFavorite(e, asset.id, asset.isFavorite)}
                        className="p-2 backdrop-blur-md bg-black/40 rounded-lg hover:bg-black/60 transition-colors text-white"
                      >
                        <Heart className={cn("w-4 h-4", asset.isFavorite ? "fill-rose-500 text-rose-500" : "")} />
                      </button>
                      <button className="p-2 backdrop-blur-md bg-black/40 rounded-lg hover:bg-black/60 transition-colors text-white">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                      <h3 className="font-semibold text-white text-sm truncate">{asset.name}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded">
                          {asset.type}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {asset.sizeBytes ? `${(asset.sizeBytes / 1024 / 1024).toFixed(1)} MB` : ''}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Asset Preview Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-5xl max-h-full bg-slate-950 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              {/* Preview Area */}
              <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px]">
                {['image'].includes(selectedAsset.type) && (
                  <img src={selectedAsset.url} alt={selectedAsset.name} className="max-w-full max-h-full object-contain" />
                )}
                {selectedAsset.type === 'video' && (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 border-4 border-slate-800 rounded-xl m-4">
                     <Play className="w-16 h-16 text-slate-600" />
                  </div>
                )}
                {!['image', 'video'].includes(selectedAsset.type) && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                    <FileText className="w-24 h-24 mb-4 opacity-50" />
                    <span className="text-xl font-bold capitalize">{selectedAsset.type} File preview not available</span>
                  </div>
                )}
                
                <button 
                  onClick={() => setSelectedAsset(null)}
                  className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Info */}
              <div className="w-full md:w-80 bg-slate-900 border-l border-white/5 flex flex-col items-stretch h-full overflow-y-auto">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-xl font-bold text-white mb-2">{selectedAsset.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAsset.tags.map(t => (
                      <span key={t} className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">{t}</span>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 space-y-6 flex-1">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="text-white capitalize">{selectedAsset.type}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Folder</span><span className="text-white">{selectedAsset.folder}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Size</span><span className="text-white">{selectedAsset.sizeBytes ? `${(selectedAsset.sizeBytes / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Added</span><span className="text-white">{new Date(selectedAsset.createdAt).toLocaleDateString()}</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Metadata</h4>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Microscope className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-medium text-slate-300">Generated by Gemini 3.1 Pro</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        This asset was automatically tagged and organized by AI Creator Studio based on its visual and metadata content.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-black/20 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedAsset.id)}
                    className="p-2 border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
