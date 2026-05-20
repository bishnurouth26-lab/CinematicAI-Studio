import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, Zap, Server, ShieldAlert, Cpu, 
  LineChart, Database, HardDrive, Clock, Film, 
  Settings, Bot, TrendingUp, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart as RechartsLineChart, Line
} from 'recharts';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

const MOCK_DATA = {
  usageData: [
    { name: 'Mon', api: 4000, users: 2400, generations: 1200 },
    { name: 'Tue', api: 3000, users: 1398, generations: 800 },
    { name: 'Wed', api: 2000, users: 4800, generations: 3200 },
    { name: 'Thu', api: 2780, users: 3908, generations: 2300 },
    { name: 'Fri', api: 1890, users: 4800, generations: 2100 },
    { name: 'Sat', api: 2390, users: 3800, generations: 1500 },
    { name: 'Sun', api: 3490, users: 4300, generations: 2100 },
  ],
  modulesData: [
    { name: 'Scripts', value: 400 },
    { name: 'Shorts', value: 300 },
    { name: 'Thumbnails', value: 300 },
    { name: 'SEO', value: 200 },
  ],
  errorData: [
    { name: 'Mon', errors: 24 },
    { name: 'Tue', errors: 13 },
    { name: 'Wed', errors: 45 },
    { name: 'Thu', errors: 18 },
    { name: 'Fri', errors: 8 },
    { name: 'Sat', errors: 30 },
    { name: 'Sun', errors: 15 },
  ]
};

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'trends' | 'errors'>('overview');

  // Simple unauthenticated placeholder if needed, though admin would require special check in real app
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 neon-glow">
          <ShieldAlert className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-widest text-center">ADMIN ACCESS STRICTLY RESTRICTED</h2>
        <p className="text-slate-400 text-center max-w-sm">Please sign in with administrator credentials.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto h-full min-h-[500px] pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.3)]">
            <Activity className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">System Intelligence Command</h1>
            <p className="text-slate-400">Global performance, AI analytics, and platform health monitoring.</p>
          </div>
        </div>
        
        <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/5">
           {['overview', 'ai', 'trends', 'errors'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={cn(
                 "px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all",
                 activeTab === tab ? "bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30" : "text-slate-500 hover:text-slate-300"
               )}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card bg-slate-900/50 p-6 rounded-2xl border-l-4 border-l-blue-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[30px]" />
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Active Users</h3>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-white">45,231</span>
                  <span className="text-emerald-400 text-sm font-bold flex items-center">+12% <TrendingUp className="w-3 h-3 ml-1" /></span>
                </div>
              </div>
              <div className="glass-card bg-slate-900/50 p-6 rounded-2xl border-l-4 border-l-fuchsia-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-[30px]" />
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">AI Generations (24h)</h3>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-white">128.4K</span>
                  <span className="text-emerald-400 text-sm font-bold flex items-center">+5.2% <TrendingUp className="w-3 h-3 ml-1" /></span>
                </div>
              </div>
              <div className="glass-card bg-slate-900/50 p-6 rounded-2xl border-l-4 border-l-emerald-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[30px]" />
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">System Health</h3>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-white">99.98%</span>
                  <span className="text-slate-400 text-sm font-bold">Uptime</span>
                </div>
              </div>
              <div className="glass-card bg-slate-900/50 p-6 rounded-2xl border-l-4 border-l-yellow-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-[30px]" />
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">API Rate Limit Use</h3>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-white">64%</span>
                  <span className="text-yellow-400 text-sm font-bold flex items-center">Optimal</span>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6">Traffic & Generations Overlay</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_DATA.usageData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorGens" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} />
                      <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="generations" stroke="#d946ef" fillOpacity={1} fill="url(#colorGens)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card bg-slate-900/50 p-6 rounded-3xl border border-white/5 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-6">Module Distribution</h3>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_DATA.modulesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {MOCK_DATA.modulesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {MOCK_DATA.modulesData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: PIE_COLORS[i]}} />
                      <span className="text-xs text-slate-400 font-bold">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Server Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Server className="w-5 h-5 text-indigo-400"/> Resources</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400 font-bold">Cloud Server CPU Allocation</span>
                      <span className="text-white">78%</span>
                    </div>
                    <div className="h-2 w-full bg-black rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[78%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400 font-bold">Memory Usage (Firestore Sync)</span>
                      <span className="text-white">45%</span>
                    </div>
                    <div className="h-2 w-full bg-black rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[45%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400 font-bold">Cold Storage (Media Assets)</span>
                      <span className="text-white">8.4 TB / 10 TB</span>
                    </div>
                    <div className="h-2 w-full bg-black rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[84%]" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-card bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-400"/> Creator Retention (Week 4)</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'W1', retain: 100 },
                      { name: 'W2', retain: 82 },
                      { name: 'W3', retain: 76 },
                      { name: 'W4', retain: 68 },
                      { name: 'W5', retain: 65 },
                      { name: 'W6', retain: 62 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} />
                      <Bar dataKey="retain" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {activeTab === 'ai' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-card bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Average Response Time</h3>
                <p className="text-3xl font-bold text-white flex items-end gap-2">
                  1.2s <span className="text-sm font-bold text-emerald-400">-0.3s</span>
                </p>
                <div className="h-16 mt-4">
                   <ResponsiveContainer width="100%" height="100%">
                     <RechartsLineChart data={[ {v: 1.5}, {v: 1.4}, {v: 1.6}, {v: 1.3}, {v: 1.2} ]}>
                       <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={3} dot={false} />
                     </RechartsLineChart>
                   </ResponsiveContainer>
                </div>
              </div>
              
              <div className="glass-card bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Model Fallbacks</h3>
                <p className="text-3xl font-bold text-white">0.05%</p>
                <p className="text-xs text-slate-500 mt-2">Requests that dropped to secondary models.</p>
              </div>

              <div className="glass-card bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Prompt Token Average</h3>
                <p className="text-3xl font-bold text-white">2,450</p>
                <p className="text-xs text-slate-500 mt-2">Tokens per generation request.</p>
              </div>
            </div>

            <div className="glass-card bg-slate-900/50 p-6 rounded-3xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-6">AI Output Quality Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-300">Hook Effectiveness Score</span>
                     <span className="text-sm font-bold text-emerald-400">92/100</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-300">Narrative Cohesion</span>
                     <span className="text-sm font-bold text-emerald-400">88/100</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-300">Thumbnail CTR Prediction Accuracy</span>
                     <span className="text-sm font-bold text-yellow-400">76/100</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-300">SEO Keyword Density Alignment</span>
                     <span className="text-sm font-bold text-emerald-400">95/100</span>
                   </div>
                </div>
                
                <div className="bg-black/30 rounded-2xl p-6 border border-white/5 flex flex-col justify-center items-center text-center">
                  <Bot className="w-12 h-12 text-blue-500 mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2">Generative Insights</h4>
                  <p className="text-sm text-slate-400">
                    The Gemini 3.1 Pro model is currently performing optimally for standard script generation tasks. 
                    However, we've noted a slight latency (approx 200ms) increase when generating multi-scene prompt JSON arrays with high strictness.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'errors' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="glass-card bg-rose-950/20 p-6 rounded-3xl border border-rose-500/20">
                 <h3 className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Global Error Rate</h3>
                 <p className="text-4xl font-black text-rose-500">1.2%</p>
               </div>
               <div className="lg:col-span-2 glass-card bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                 <h3 className="text-lg font-bold text-white mb-4">Error Trajectory</h3>
                 <div className="h-[150px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={MOCK_DATA.errorData}>
                       <defs>
                         <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <XAxis dataKey="name" hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)'}} />
                       <Area type="step" dataKey="errors" stroke="#f43f5e" fill="url(#colorErrors)" />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
               </div>
            </div>

            <div className="glass-card bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden">
               <div className="p-6 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-white">Live Error Log</h3>
                 <button className="text-xs font-bold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors">Export Logs</button>
               </div>
               <div className="divide-y divide-white/5">
                  {[
                    { id: 'ERR-3921', type: 'API Timeout', source: 'Gemini Generative API', desc: 'Request hung on generating 15+ scene prompts.', time: '2 mins ago', severity: 'high' },
                    { id: 'ERR-3920', type: 'Auth Token', source: 'Firebase Auth', desc: 'Refresh token expired silently in background.', time: '14 mins ago', severity: 'medium' },
                    { id: 'ERR-3919', type: 'File Upload', source: 'Storage Bucket', desc: 'User exceeded maximum thumbnail size (10MB).', time: '1 hr ago', severity: 'low' },
                    { id: 'ERR-3918', type: 'State Sync', source: 'Firestore', desc: 'Offline queue failed to merge resolve remote deletions.', time: '2 hrs ago', severity: 'medium' },
                  ].map(err => (
                    <div key={err.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                      <div className="flex gap-4 items-start md:items-center">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2 md:mt-0",
                          err.severity === 'high' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 
                          err.severity === 'medium' ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 
                          'bg-blue-500 shadow-[0_0_8px_#3b82f6]'
                        )} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-slate-400">{err.id}</span>
                            <span className="text-sm font-bold text-white">{err.type}</span>
                          </div>
                          <p className="text-xs text-slate-500">{err.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <span>{err.source}</span>
                        <span>{err.time}</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'trends' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6">Trending Video Sub-Niches</h3>
                  <div className="space-y-4">
                    {[
                      { topic: 'AI Productivity Tips', change: '+24%', vol: 'High' },
                      { topic: 'Faceless True Crime', change: '+18%', vol: 'Very High' },
                      { topic: 'Budget Tech Reviews', change: '+12%', vol: 'Medium' },
                      { topic: 'Micro-Documentaries', change: '+8%', vol: 'High' },
                    ].map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
                        <span className="font-bold text-sm text-slate-200">{t.topic}</span>
                        <div className="flex gap-4">
                          <span className="text-xs font-bold text-emerald-400">{t.change}</span>
                          <span className="text-xs font-bold text-slate-400 uppercase">{t.vol}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card bg-slate-900/50 p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-900/20 to-blue-900/20">
                  <h3 className="text-lg font-bold text-white mb-6">Predictive Analysis</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-blue-300 mb-1">Incoming Trend Shift detected</h4>
                      <p className="text-sm text-slate-300">Long-form essay style content showing 15% lower retention average compared to fast-paced tutorial formats this week.</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-300 mb-1">API Optimization Opportunity</h4>
                      <p className="text-sm text-slate-300">Grouping localization translations into single batch requests could save approx. 18% of tokens per user session.</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-sm font-bold transition-colors">Apply Optimizations</button>
                  </div>
                </div>
             </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
