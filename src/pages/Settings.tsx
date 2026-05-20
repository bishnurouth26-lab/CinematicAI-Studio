import React, { useState } from 'react';
import { User, CreditCard, Bell, Key, LogOut, Zap, Download, Database, Users } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export const Settings = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'usage' | 'api'>('profile');

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Subscription & Billing', icon: CreditCard },
    { id: 'usage', label: 'Usage & Credits', icon: Database },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Settings</h1>
        <p className="text-slate-400">Manage your account, billing, and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center space-x-3 text-left px-4 py-2.5 rounded-xl font-medium transition-colors",
                activeTab === item.id 
                  ? "bg-blue-600/10 text-neon-blue border-l-[3px] border-neon-blue" 
                  : "text-slate-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
                
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-20 h-20 rounded-full border-2 border-neon-blue overflow-hidden p-0.5">
                     <img 
                       src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || "Creator"}&background=0D8ABC&color=fff`} 
                       alt="Profile" 
                       className="w-full h-full rounded-full object-cover"
                     />
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors text-sm mb-2 border border-white/10">
                      Change Avatar
                    </button>
                    <p className="text-xs text-slate-500">JPG, GIF or PNG. 2MB max.</p>
                  </div>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.displayName || ''}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                      <input 
                        type="text" 
                        defaultValue={user?.displayName?.replace(/\s+/g, '').toLowerCase() || ''}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email || ''}
                      disabled
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Bio</label>
                    <textarea 
                      className="w-full min-h-[100px] bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue resize-none"
                      placeholder="Tell us about your content..."
                    />
                  </div>
                  
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] mt-4">
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 border-red-500/20">
                <h2 className="text-xl font-bold text-red-500 mb-2">Account Actions</h2>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <button 
                    onClick={logout}
                    className="flex items-center gap-2 text-white bg-slate-800 hover:bg-slate-700 border border-white/10 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out everywhere</span>
                  </button>
                  <button className="flex items-center gap-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* BILLING & SUBSCRIPTION TAB */}
          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-[#020617] border border-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
                <h2 className="text-xl font-bold text-white mb-2">Current Plan: Pro</h2>
                <p className="text-slate-400 text-sm mb-6 max-w-lg">You are on the Pro tier. Your subscription will auto-renew on <strong>Dec 24, 2026</strong> for $29.00/month.</p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-white text-black px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10">Manage Subscription</button>
                  <button className="bg-transparent border border-white/20 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors">Compare Plans</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6 border-white/5">
                  <h3 className="text-white font-bold mb-1">Free</h3>
                  <div className="text-3xl font-black text-white mb-4">$0<span className="text-sm font-normal text-slate-500">/mo</span></div>
                  <ul className="text-sm text-slate-400 space-y-2 mb-6">
                    <li>✓ 50 AI credits / month</li>
                    <li>✓ Standard processing</li>
                    <li>✓ 720p exports</li>
                    <li>✗ Watermarked assets</li>
                  </ul>
                </div>
                
                <div className="glass-card rounded-2xl p-6 border-neon-blue bg-blue-900/10 relative transform scale-105 shadow-[0_0_30px_rgba(37,99,235,0.15)] z-10">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Current</div>
                  <h3 className="text-blue-400 font-bold mb-1">Pro</h3>
                  <div className="text-3xl font-black text-white mb-4">$29<span className="text-sm font-normal text-slate-500">/mo</span></div>
                  <ul className="text-sm text-slate-300 space-y-2 mb-6 font-medium">
                    <li>✓ 2000 AI credits / month</li>
                    <li>✓ Priority fast processing</li>
                    <li>✓ Unwatermarked 4K exports</li>
                    <li>✓ Advanced AI models (Gemini 3.1)</li>
                  </ul>
                </div>

                <div className="glass-card rounded-2xl p-6 border-white/5">
                  <h3 className="text-white font-bold mb-1">Team <Users className="w-4 h-4 inline ml-1 text-slate-400" /></h3>
                  <div className="text-3xl font-black text-white mb-4">$99<span className="text-sm font-normal text-slate-500">/mo</span></div>
                  <ul className="text-sm text-slate-400 space-y-2 mb-6">
                    <li>✓ Unlimited AI credits</li>
                    <li>✓ Shared workspace</li>
                    <li>✓ Team collaboration tools</li>
                    <li>✓ Admin controls</li>
                  </ul>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Billing History</h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"><Download className="w-4 h-4" /> Export PDF</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Invoice</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3 rounded-r-lg">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-medium text-slate-300">INV-2026-11</td>
                        <td className="px-4 py-3">Nov 24, 2026</td>
                        <td className="px-4 py-3">$29.00</td>
                        <td className="px-4 py-3"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-semibold">Paid</span></td>
                      </tr>
                      <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-medium text-slate-300">INV-2026-10</td>
                        <td className="px-4 py-3">Oct 24, 2026</td>
                        <td className="px-4 py-3">$29.00</td>
                        <td className="px-4 py-3"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-semibold">Paid</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* USAGE TAB */}
          {activeTab === 'usage' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> Global Credit Usage</h3>
                  <div className="mb-2 flex justify-between items-end">
                    <span className="text-3xl font-black text-white">1,452</span>
                    <span className="text-slate-400 text-sm mb-1">/ 2,000 available</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <p className="text-xs text-slate-500">Credits reset in 12 days on Dec 24, 2026.</p>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-purple-400" /> Storage Used</h3>
                  <div className="mb-2 flex justify-between items-end">
                    <span className="text-3xl font-black text-white">14.2 GB</span>
                    <span className="text-slate-400 text-sm mb-1">/ 50 GB available</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                  <p className="text-xs text-slate-500">Consider cleaning up old workspaces.</p>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Credit Breakdown</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-slate-300">Script & Research Generation (Advanced AI)</span>
                      <span className="text-white">850 credits</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-slate-300">Thumbnail Prompts & Design</span>
                      <span className="text-white">350 credits</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '25%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-slate-300">Audio & Voice Cloning</span>
                      <span className="text-white">252 credits</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '15%' }}></div></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* API KEYS TAB */}
          {activeTab === 'api' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">API Access Options</h3>
                  <p className="text-slate-400 text-sm mt-1">Manage personal access tokens for developers.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl text-sm transition-colors shadow">
                  Create New Key
                </button>
              </div>

              <div className="border border-white/5 rounded-xl bg-slate-900/50 p-6 flex flex-col items-center justify-center text-center space-y-4">
                 <Key className="w-12 h-12 text-slate-600" />
                 <div>
                   <p className="text-white font-semibold">No API keys generated</p>
                   <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">You haven't generated any keys. Create an API key to access our advanced video generation APIs from your backend.</p>
                 </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
