import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldCheck, BarChart3, Settings, Save, Zap, Globe, 
  Activity, Users, Sparkles, BrainCircuit, Search, 
  Loader2, AlertTriangle, Power, CheckCircle2, Terminal,
  Package, DollarSign, LayoutGrid, List, Maximize2, MoreVertical, X, RefreshCw
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

// ===========================================================================
// NATE: PASTE YOUR FIREBASE CONFIGURATION BELOW.
// Go to Firebase Console -> Project Settings -> General -> "Your apps" -> SDK Setup/Config
// Copy the values inside the quotes. Do not delete the quotes or commas.
// ===========================================================================
const firebaseConfig = {
  apiKey: "PASTE_API_KEY_HERE",
  authDomain: "PASTE_AUTH_DOMAIN_HERE",
  projectId: "PASTE_PROJECT_ID_HERE",
  storageBucket: "PASTE_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_SENDER_ID_HERE",
  appId: "PASTE_APP_ID_HERE"
};
// ===========================================================================

// Initialize Firebase
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.error("Firebase Initialization Failed. Did you paste your keys?", err);
}

const appId = 'omnigraph-apex-v1';

// --- SHARED COMPONENTS ---
const OmniLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="128" fill="#020617"/>
    <circle cx="256" cy="256" r="160" stroke="#6366f1" strokeWidth="24" strokeLinecap="round" strokeDasharray="800 200"/>
    <path d="M140 256H200L225 160L285 352L310 256H372" stroke="#10b981" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pro');
  const [isSetAndForget, setIsSetAndForget] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [configError, setConfigError] = useState(false);

  // 1. AUTHENTICATION
  useEffect(() => {
    // Check if keys are still placeholders
    if (firebaseConfig.apiKey === "PASTE_API_KEY_HERE") {
      setConfigError(true);
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { 
        console.error("Auth Failure:", err); 
        // If auth fails, it's usually bad keys
        setConfigError(true);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. PERSISTENT STATE SYNC
  useEffect(() => {
    if (!user || !db) return;
    const configDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'reactor');
    const unsubscribe = onSnapshot(configDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setIsSetAndForget(data.isSetAndForget || false);
        setViewMode(data.viewMode || 'list');
      } else {
        setDoc(configDoc, { isSetAndForget: false, viewMode: 'list' });
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user]);

  // 3. INVENTORY ENGINE
  const fetchInventory = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);
    setTimeout(() => {
      setInventory([
        { id: 1, title: "Obsidian Runner", sku: "SKU-AO-1", price: "185.00", stock: 42, status: "Verified" },
        { id: 2, title: "Indigo Mesh Tee", sku: "SKU-IM-2", price: "45.00", stock: 12, status: "Active" },
        { id: 3, title: "Semantic Cap", sku: "SKU-SC-3", price: "32.00", stock: 0, status: "Out of Stock" }
      ]);
      setIsSyncing(false);
    }, 1200);
  }, [user]);

  useEffect(() => { if (user) fetchInventory(); }, [user, fetchInventory]);

  // 4. ACTION HANDLERS
  const toggleAutopilot = async () => {
    if (!user || !db) return;
    const newState = !isSetAndForget;
    setIsSetAndForget(newState);
    const configDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'reactor');
    await updateDoc(configDoc, { isSetAndForget: newState });
  };

  // 5. ANTI-SCROLL FILTERING
  const filteredData = useMemo(() => {
    return inventory.filter(i => 
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.stock === 0 ? -1 : 1);
  }, [inventory, searchTerm]);

  // --- ERROR STATE (If Keys Missing) ---
  if (configError) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
      <h1 className="text-2xl font-black text-white uppercase tracking-tight">Configuration Error</h1>
      <p className="text-slate-400 mt-2 font-mono text-sm">The app cannot connect to Firebase.</p>
      <div className="bg-slate-900 p-6 rounded-xl mt-8 text-left border border-white/10 max-w-md w-full">
        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">You must paste ALL keys:</p>
        <code className="text-xs text-slate-300 font-mono block bg-black/50 p-4 rounded mb-4">
          apiKey: "..."<br/>
          authDomain: "..."<br/>
          projectId: "..."<br/>
          storageBucket: "..."<br/>
          messagingSenderId: "..."<br/>
          appId: "..."
        </code>
        <p className="text-xs text-rose-400 font-mono">Current Status: KEYS MISSING or INVALID</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <OmniLogo size={80} className="animate-pulse" />
      <p className="mt-8 text-indigo-400 font-mono text-[10px] uppercase tracking-[0.4em]">Initializing Apex...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex flex-col md:flex-row overflow-hidden">
      <aside className="w-full md:w-64 bg-slate-900/40 border-r border-white/5 p-6 flex flex-col gap-10 backdrop-blur-3xl shrink-0">
        <div className="flex items-center gap-3">
          <OmniLogo size={32} />
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none italic">Apex™ <span className="text-indigo-400 not-italic">Pulse</span></h1>
            <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Infrastructure</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <SidebarLink icon={BarChart3} label="Verified Console" active={activeTab === 'pro'} onClick={() => setActiveTab('pro')} />
          <SidebarLink icon={BrainCircuit} label="AI Strategy Lab" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          <SidebarLink icon={Globe} label="System Admin" active={activeTab === 'founder'} onClick={() => setActiveTab('founder')} />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto space-y-12">
          {activeTab === 'pro' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
               <header className="flex flex-col lg:flex-row justify-between items-center gap-6">
                 <div className="relative w-full max-w-2xl group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400" size={18} />
                   <input 
                    type="text" 
                    placeholder="Search by Product or SKU..." 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                   />
                 </div>
                 <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
                    <ViewIconButton icon={List} active={viewMode === 'list'} onClick={() => setViewMode('list')} />
                    <ViewIconButton icon={LayoutGrid} active={viewMode === 'tile'} onClick={() => setViewMode('tile')} />
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <button onClick={fetchInventory} className="p-3 text-slate-500 hover:text-white transition-all">
                      <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
                    </button>
                 </div>
               </header>

               <div className={`p-10 rounded-[3rem] border-2 transition-all duration-1000 relative overflow-hidden ${isSetAndForget ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-white/5'}`}>
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                   <div className="max-w-xl">
                      <h3 className={`text-2xl font-black mb-2 uppercase tracking-tight ${isSetAndForget ? 'text-emerald-400' : 'text-white'}`}>
                        {isSetAndForget ? "✨ Autopilot Mode Active" : "Set & Forget Architecture"}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        OmniGraph Apex is managing your semantic fabric. Duplicate theme code suppressed. SEO fidelity 100%.
                      </p>
                   </div>
                   <button 
                    onClick={toggleAutopilot}
                    className={`px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all transform active:scale-95 ${isSetAndForget ? 'bg-emerald-600 text-white shadow-2xl' : 'bg-indigo-600 text-white shadow-2xl hover:bg-indigo-500'}`}
                   >
                     {isSetAndForget ? <CheckCircle2 size={18} /> : <Power size={18} />}
                     {isSetAndForget ? "Active" : "Activate"}
                   </button>
                 </div>
               </div>

               <div className={`${viewMode === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
                  {isSyncing && inventory.length === 0 ? (
                    <div className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                  ) : filteredData.map(item => (
                    <ProductCard key={item.id} item={item} mode={viewMode} />
                  ))}
               </div>
            </div>
          )}
          {activeTab === 'ai' && <AILab />}
          {activeTab === 'founder' && <FounderConsole />}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function ProductCard({ item, mode }) {
  const isOutOfStock = item.stock === 0;
  return (
    <div className={`bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between group transition-all ${isOutOfStock ? 'border-rose-500/20 opacity-80' : 'hover:border-indigo-500/30'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOutOfStock ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-500 group-hover:text-indigo-400'}`}>
          <Package size={20} />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">{item.title}</h4>
          <p className="text-[10px] font-mono text-slate-500 uppercase">{item.sku}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-black text-white">${item.price}</p>
        <span className={`text-[8px] font-black uppercase tracking-widest ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>{item.status}</span>
      </div>
    </div>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all border ${active ? 'bg-indigo-600/10 text-indigo-400 border-indigo-600/30 shadow-lg' : 'text-slate-600 hover:text-slate-300 hover:bg-white/5 border-transparent'}`}>
      <Icon size={16} /> {label}
    </button>
  );
}

function ViewIconButton({ icon: Icon, active, onClick }) {
  return (
    <button onClick={onClick} className={`p-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
      <Icon size={18} />
    </button>
  );
}

function AILab() { return <div className="py-20 text-center"><BrainCircuit size={48} className="mx-auto text-indigo-500 mb-4" /><h2 className="text-2xl font-bold italic tracking-tighter uppercase">AI Strategy Lab</h2><p className="text-slate-500 text-sm italic">Consulting Gemini for niche dominance patterns...</p></div>; }
function FounderConsole() { return <div className="p-10 border border-white/5 bg-slate-900/20 rounded-[4rem] text-center"><Terminal size={40} className="mx-auto text-slate-700 mb-4" /><p className="text-xs font-mono text-slate-500 tracking-[0.4em] uppercase">Founders Only</p></div>; }
