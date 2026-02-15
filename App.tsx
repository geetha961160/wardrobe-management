
import React, { useState, useEffect } from 'react';
import { Garment, ViewState, Category, Season } from './types';
import Sidebar from './components/Sidebar';
import GarmentCard from './components/GarmentCard';
import UploadModal from './components/UploadModal';
import { getStylingAdvice } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [wardrobe, setWardrobe] = useState<Garment[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [advice, setAdvice] = useState<string>('');
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [occasion, setOccasion] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vogue-wardrobe');
    if (saved) setWardrobe(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('vogue-wardrobe', JSON.stringify(wardrobe));
  }, [wardrobe]);

  const addGarment = (item: Garment) => {
    setWardrobe(prev => [item, ...prev]);
  };

  const deleteGarment = (id: string) => {
    if (window.confirm("Remove this item from your collection?")) {
      setWardrobe(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleGetAdvice = async () => {
    if (!occasion) return;
    setIsAdviceLoading(true);
    try {
      const result = await getStylingAdvice(wardrobe, occasion);
      setAdvice(result);
    } catch (err) {
      setAdvice("Error getting advice. Please check your connection.");
    } finally {
      setIsAdviceLoading(false);
    }
  };

  // Analytics data
  const categoryStats = Object.values(Category).map(cat => ({
    name: cat,
    count: wardrobe.filter(item => item.category === cat).length
  }));

  const seasonStats = Object.values(Season).map(s => ({
    name: s,
    count: wardrobe.filter(item => item.season === s).length
  }));

  const COLORS = ['#1c1917', '#44403c', '#78716c', '#a8a29e', '#d6d3d1', '#e7e5e4', '#f5f5f4'];

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Total Pieces</p>
          <p className="text-4xl font-bold text-stone-900 serif">{wardrobe.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Newest Addition</p>
          <p className="text-xl font-medium text-stone-900 truncate">
            {wardrobe.length > 0 ? wardrobe[0].name : 'None yet'}
          </p>
        </div>
        <div className="bg-stone-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">AI Assistant</p>
            <p className="text-lg font-medium">Ready to style you.</p>
            <button 
              onClick={() => setView('stylist')}
              className="mt-4 text-sm bg-white text-stone-900 px-4 py-2 rounded-lg font-semibold hover:bg-stone-100 transition-colors"
            >
              Consult Stylist
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-stone-800 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
          <h3 className="serif text-2xl font-bold mb-6">Wardrobe Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#fafaf9'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" fill="#1c1917" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
           <h3 className="serif text-2xl font-bold mb-6">Recent Items</h3>
           <div className="grid grid-cols-2 gap-4">
             {wardrobe.slice(0, 4).map(item => (
               <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-stone-50 rounded-lg transition-colors">
                 <div className="w-12 h-16 rounded overflow-hidden bg-stone-100 flex-shrink-0">
                    <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                 </div>
                 <div className="overflow-hidden">
                   <p className="text-sm font-medium text-stone-900 truncate">{item.name}</p>
                   <p className="text-xs text-stone-400">{item.category}</p>
                 </div>
               </div>
             ))}
             {wardrobe.length === 0 && <p className="text-stone-400 col-span-2 text-center py-10">Empty closet</p>}
           </div>
           {wardrobe.length > 4 && (
             <button onClick={() => setView('wardrobe')} className="w-full mt-6 py-2 text-stone-500 text-sm font-medium hover:text-stone-900 transition-colors">
               View All Items →
             </button>
           )}
        </div>
      </div>
    </div>
  );

  const renderWardrobe = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="serif text-3xl font-bold text-stone-900">Your Collection</h2>
          <p className="text-stone-500">Curate and organize your daily essentials.</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-stone-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-stone-800 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-stone-900/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          <span>Add New Item</span>
        </button>
      </div>

      {wardrobe.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-stone-900">No items found</h3>
          <p className="text-stone-500 max-w-xs mt-2">Start building your digital wardrobe by uploading photos of your favorite pieces.</p>
          <button onClick={() => setIsUploadOpen(true)} className="mt-8 text-stone-900 underline font-semibold">Upload your first item</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wardrobe.map(item => (
            <GarmentCard key={item.id} item={item} onDelete={deleteGarment} />
          ))}
        </div>
      )}
    </div>
  );

  const renderStylist = () => (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h2 className="serif text-4xl font-bold text-stone-900 mb-2">AI Personal Stylist</h2>
        <p className="text-stone-500">Get boutique-level fashion advice powered by Gemini.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
        <div className="p-8">
          <div className="mb-8">
            <label className="block text-sm font-semibold text-stone-900 mb-2">What's the occasion today?</label>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="e.g. A formal wedding in Tuscany, a casual coffee date..."
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="flex-1 px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 text-stone-900 transition-all"
              />
              <button
                disabled={isAdviceLoading || !occasion || wardrobe.length === 0}
                onClick={handleGetAdvice}
                className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-stone-800 disabled:bg-stone-200 disabled:cursor-not-allowed transition-all shadow-lg shadow-stone-900/20 whitespace-nowrap"
              >
                {isAdviceLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : "Get Advice"}
              </button>
            </div>
            {wardrobe.length === 0 && (
              <p className="text-amber-600 text-xs mt-2 font-medium">Please add items to your wardrobe first so the AI can style you!</p>
            )}
          </div>

          <div className="min-h-[400px] bg-stone-50 rounded-2xl p-8 border border-dashed border-stone-200 flex flex-col items-center justify-center text-center">
            {advice ? (
              <div className="w-full text-left animate-in fade-in duration-700">
                <div className="prose prose-stone max-w-none prose-p:text-stone-700 prose-headings:serif prose-headings:text-stone-900">
                  {advice.split('\n').map((line, i) => (
                    <p key={i} className="mb-4 leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                   <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <h4 className="text-stone-900 font-semibold mb-1">Awaiting your prompt</h4>
                <p className="text-stone-400 max-w-xs text-sm">Tell me where you're going and I'll look through your closet to find the perfect ensemble.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="serif text-3xl font-bold text-stone-900">Wardrobe Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
          <h3 className="serif text-xl font-bold mb-6">Seasonal Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={seasonStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {seasonStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
             {seasonStats.map((s, i) => (
               <div key={s.name} className="flex items-center space-x-2">
                 <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                 <span className="text-xs text-stone-500">{s.name}: {s.count}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="serif text-2xl font-bold mb-2">Wardrobe Value</h3>
          <p className="text-stone-500 mb-6">Tracking the utility of your collection.</p>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-stone-50 p-4 rounded-xl">
               <p className="text-[10px] font-semibold text-stone-400 uppercase">Diversity Score</p>
               <p className="text-2xl font-bold text-stone-900">{(wardrobe.length * 0.85).toFixed(1)}</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-xl">
               <p className="text-[10px] font-semibold text-stone-400 uppercase">Style Depth</p>
               <p className="text-2xl font-bold text-stone-900">High</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar currentView={view} setView={setView} />
      
      <main className="flex-1 bg-stone-50 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 md:py-12">
          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between mb-8">
            <h1 className="serif text-2xl font-bold text-stone-900">VogueVault</h1>
            <button className="p-2 text-stone-500">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          </div>

          {view === 'dashboard' && renderDashboard()}
          {view === 'wardrobe' && renderWardrobe()}
          {view === 'stylist' && renderStylist()}
          {view === 'analytics' && renderAnalytics()}
        </div>
      </main>

      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onAdd={addGarment} 
        />
      )}
    </div>
  );
};

export default App;
