
import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth.tsx';
import { Layout } from './components/Layout.tsx';
import { PostCard } from './components/PostCard.tsx';
import { SpiritualGuide } from './components/SpiritualGuide.tsx';
import { TithingModal } from './components/TithingModal.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { Button } from './components/Button.tsx';
import { User, Post, PromotionTier } from './types.ts';
import { mockBackend } from './services/mockBackend.ts';
import { getDailyInspiration } from './services/geminiService.ts';
import { Send, Sparkles, X, Hand, Globe, Users, Flame, Zap, Crown, ArrowRight } from 'lucide-react';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'community'>('community');
  
  const [isMiracleRequest, setIsMiracleRequest] = useState(false);
  const [promotionTier, setPromotionTier] = useState<PromotionTier>(PromotionTier.NONE);
  const [showPromotionOptions, setShowPromotionOptions] = useState(false);

  const [dailyInspiration, setDailyInspiration] = useState<string | null>(null);
  const [showInspiration, setShowInspiration] = useState(true);

  const [showSpiritualGuide, setShowSpiritualGuide] = useState(false);
  const [showTithingModal, setShowTithingModal] = useState(false);

  const [globalPrayers, setGlobalPrayers] = useState(140283);

  useEffect(() => {
    if (currentUser) {
      loadFeed();
      loadDailyInspiration();
      const interval = setInterval(() => {
        setGlobalPrayers(p => p + Math.floor(Math.random() * 3));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadFeed = async () => {
    if (!currentUser) return;
    setLoadingPosts(true);
    try {
      const feed = await mockBackend.getFeed(currentUser);
      setPosts(feed);
    } catch (error) {
      console.error("Error al cargar feed", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadDailyInspiration = async () => {
    if (!currentUser) return;
    try {
      const inspiration = await getDailyInspiration(currentUser.religion, currentUser.language);
      setDailyInspiration(inspiration);
    } catch (e) {}
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !currentUser) return;
    
    if (promotionTier === PromotionTier.NONE && !showPromotionOptions && isMiracleRequest) {
      setShowPromotionOptions(true);
      return;
    }

    setPosting(true);
    try {
      await mockBackend.createPost(newPostContent, currentUser, isMiracleRequest, promotionTier);
      setNewPostContent('');
      setIsMiracleRequest(false);
      setPromotionTier(PromotionTier.NONE);
      setShowPromotionOptions(false);
      await loadFeed();
    } finally {
      setPosting(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (feedFilter === 'community' && currentUser) {
      return post.authorReligion === currentUser.religion;
    }
    return true;
  });

  if (showLanding && !currentUser) return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <>
      <Layout 
        user={currentUser} 
        onLogout={() => { mockBackend.logout(); setCurrentUser(null); setShowLanding(true); }}
        onOpenGuide={() => setShowSpiritualGuide(true)}
        onOpenTithe={() => setShowTithingModal(true)}
      >
        
        <div className="bg-slate-900 text-white p-6 rounded-[3rem] mb-12 flex flex-col sm:flex-row items-center justify-between shadow-2xl shadow-indigo-200 relative overflow-hidden group">
           <div className="absolute top-0 left-0 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           <div className="flex items-center space-x-6 relative z-10 mb-4 sm:mb-0">
              <div className="bg-indigo-600 p-4 rounded-2xl animate-pulse shadow-xl shadow-indigo-900/50">
                <Flame className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 mb-1">Manto de Oración Global</p>
                <p className="text-3xl font-black tracking-tighter">{globalPrayers.toLocaleString()} <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Voces Unidas</span></p>
              </div>
           </div>
           <Button onClick={() => setFeedFilter('all')} variant="ghost" className="text-white hover:bg-white/10 rounded-2xl py-4 px-8 text-[10px] font-black uppercase tracking-widest relative z-10 border border-white/10">
             Cadena Mundial <ArrowRight className="ml-3 h-4 w-4" />
           </Button>
        </div>

        {showInspiration && dailyInspiration && (
          <div className="bg-white border-4 border-indigo-50 rounded-[3rem] p-10 mb-12 relative shadow-sm overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
              <Sparkles className="h-48 w-48 text-indigo-600" />
            </div>
            <button onClick={() => setShowInspiration(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-500 transition-colors p-2">
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-1 w-12 bg-indigo-200 rounded-full"></div>
              <h3 className="font-black text-[10px] uppercase tracking-[0.5em] text-slate-400">Palabra Diaria • {currentUser.religion}</h3>
            </div>
            <p className="text-3xl font-medium text-slate-900 leading-tight italic max-w-2xl">"{dailyInspiration}"</p>
          </div>
        )}

        <div className="bg-white rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-12 mb-12 transform transition-all">
          <form onSubmit={handleCreatePost}>
            {!showPromotionOptions ? (
              <div className="space-y-8">
                <div className="flex space-x-8">
                  <img src={currentUser.avatarUrl} alt="" className="h-20 w-20 rounded-[2rem] object-cover shadow-2xl ring-1 ring-slate-100" />
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={`¿Qué milagro declaramos hoy, ${currentUser.firstName}?`}
                    className="flex-1 border-none focus:ring-0 resize-none text-slate-900 placeholder-slate-200 text-3xl font-medium min-h-[140px] p-0 pt-3 leading-tight"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-50 pt-10 gap-6">
                  <button
                    type="button"
                    onClick={() => setIsMiracleRequest(!isMiracleRequest)}
                    className={`flex items-center space-x-4 px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${isMiracleRequest ? 'bg-amber-400 text-white shadow-2xl shadow-amber-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    <Zap className={`h-5 w-5 ${isMiracleRequest ? 'fill-current' : ''}`} />
                    <span>Llamado a Milagro</span>
                  </button>
                  <Button type="submit" disabled={!newPostContent.trim()} isLoading={posting} className="w-full sm:w-auto px-16 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_rgba(79,70,229,0.3)] bg-indigo-600">
                    PUBLICAR <Send className="h-4 w-4 ml-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in text-center space-y-10 py-6">
                <div className="bg-amber-100/50 h-24 w-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-4 border-amber-200 shadow-xl shadow-amber-50">
                   <Crown className="h-12 w-12 text-amber-500" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Eleva tu Clamor</h3>
                <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed">Multiplica el poder de tu oración. Las Ofrendas de Luz colocan tu petición en el altar de toda la red.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   {[
                     { tier: PromotionTier.NONE, name: 'Normal', price: 'Gratis', desc: 'Tu círculo cercano.', color: 'slate' },
                     { tier: PromotionTier.GOLD, name: 'Luz Oro', price: '$4.99', desc: '+5,000 oradores.', color: 'amber' },
                     { tier: PromotionTier.PLATINUM, name: 'Altar Global', price: '$12.99', desc: 'Toda la red PrayLink.', color: 'indigo' }
                   ].map((item) => (
                     <button 
                       key={item.tier}
                       type="button"
                       onClick={() => setPromotionTier(item.tier)}
                       className={`p-8 rounded-[2.5rem] border-4 transition-all text-left relative overflow-hidden active:scale-95 ${
                         promotionTier === item.tier 
                         ? item.tier === PromotionTier.PLATINUM ? 'bg-slate-900 text-white border-indigo-600' : `border-${item.color}-400 bg-${item.color}-50` 
                         : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'
                       }`}
                     >
                       <p className={`font-black uppercase text-[10px] mb-3 tracking-widest ${promotionTier === item.tier && item.tier === PromotionTier.PLATINUM ? 'text-indigo-400' : `text-${item.color}-600`}`}>{item.name}</p>
                       <p className="text-2xl font-black mb-1">{item.price}</p>
                       <p className={`text-[11px] font-medium leading-tight ${promotionTier === item.tier && item.tier === PromotionTier.PLATINUM ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                     </button>
                   ))}
                </div>

                <div className="flex gap-6 pt-10 border-t border-slate-50">
                  <button type="button" onClick={() => setShowPromotionOptions(false)} className="flex-1 py-5 text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                  <Button type="submit" isLoading={posting} className="flex-[2] py-6 rounded-3xl bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-100">Confirmar Ofrenda</Button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="flex bg-slate-200/30 p-2.5 rounded-[2.5rem] mb-14 border border-slate-100 backdrop-blur-sm">
           <button 
             onClick={() => setFeedFilter('community')}
             className={`flex-1 flex items-center justify-center py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 ${feedFilter === 'community' ? 'bg-white text-indigo-700 shadow-2xl' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Users className="h-5 w-5 mr-4" /> Mi Círculo
           </button>
           <button 
             onClick={() => setFeedFilter('all')}
             className={`flex-1 flex items-center justify-center py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 ${feedFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xl' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Globe className="h-5 w-5 mr-4" /> Red PrayLink
           </button>
        </div>

        <div className="space-y-12">
          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-10">
               <div className="relative h-24 w-24">
                 <div className="absolute inset-0 animate-ping rounded-full bg-indigo-100 opacity-75"></div>
                 <div className="relative animate-spin rounded-full h-24 w-24 border-[8px] border-indigo-600 border-t-transparent shadow-2xl"></div>
               </div>
               <p className="text-slate-300 font-black text-xs uppercase tracking-[0.5em] animate-pulse">Sintonizando almas...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <PostCard key={post.id} post={post} userLanguage={currentUser.language} currentUser={currentUser} />
            ))
          ) : (
            <div className="text-center py-48 bg-white rounded-[4rem] border-4 border-dashed border-slate-50 shadow-inner">
              <div className="bg-slate-50 h-32 w-32 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-slate-100">
                <Users className="h-16 w-16 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">El Altar está en silencio.</p>
              <p className="text-slate-300 text-lg mt-6 px-24 font-medium leading-relaxed">Eleva la primera intención de este círculo y enciende la cadena de fe.</p>
            </div>
          )}
        </div>
      </Layout>
      
      {showSpiritualGuide && (
        <SpiritualGuide user={currentUser} onClose={() => setShowSpiritualGuide(false)} onUpgrade={() => {}} />
      )}
      
      {showTithingModal && currentUser && (
        <TithingModal user={currentUser} onClose={() => setShowTithingModal(false)} />
      )}
    </>
  );
}
