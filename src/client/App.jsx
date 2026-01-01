import React, { useState } from 'react';
import { ShieldCheck, BarChart3, Zap, Power, Package, Search } from 'lucide-react';

const OmniLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="128" fill="#020617"/>
    <circle cx="256" cy="256" r="160" stroke="#6366f1" strokeWidth="24" strokeLinecap="round" />
    <path d="M140 256H200L225 160L285 352L310 256H372" stroke="#10b981" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function App() {
  const [isSetAndForget, setIsSetAndForget] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex flex-col md:flex-row overflow-hidden">
      <aside className="w-full md:w-64 bg-slate-900/30 border-r border-white/5 p-6 flex flex-col gap-10 backdrop-blur-3xl shrink-0">
        <div className="flex items-center gap-3"><OmniLogo size={32} /><h1 className="text-lg font-black tracking-tighter uppercase leading-none italic text-white">Apex™ <span className="text-indigo-400 not-italic">Pulse</span></h1></div>
        <nav className="space-y-1 flex-1">
          <button onClick={() => setActiveTab('pro')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all border bg-indigo-600/10 text-indigo-400 border-indigo-600/30 shadow-lg"><BarChart3 size={16} /> Console</button>
        </nav>
      </aside>
      <main className="flex-1 p-8 max-w-7xl mx-auto space-y-12">
        <div className={`p-10 rounded-[3rem] border-2 transition-all duration-1000 ${isSetAndForget ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-white/5'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl"><h3 className="text-2xl font-black mb-2 uppercase tracking-tight text-white">Autopilot Mode</h3><p className="text-slate-400 text-sm leading-relaxed">DSI Protocol is currently bypassing theme conflicts.</p></div>
            <button onClick={() => setIsSetAndForget(!isSetAndForget)} className={`px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${isSetAndForget ? 'bg-emerald-600' : 'bg-indigo-600'} text-white shadow-2xl`}><Power size={18} /> {isSetAndForget ? 'Active' : 'Activate'}</button>
          </div>
        </div>
      </main>
    </div>
  );
}
