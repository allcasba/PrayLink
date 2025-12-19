
import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth.tsx';
import { Layout } from './components/Layout.tsx';
import { PostCard } from './components/PostCard.tsx';
import { SpiritualGuide } from './components/SpiritualGuide.tsx';
import { TithingModal } from './components/TithingModal.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { Button } from './components/Button.tsx';
import { User, Post, PromotionTier, UI_TRANSLATIONS } from './types.ts';
import { mockBackend } from './services/mockBackend.ts';
import { Send, Flame, Zap, ArrowRight, Users, Globe, Info } from 'lucide-react';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [feedFilter, setFeedFilter] = useState<'all' | 'community'>('community');
  const [isMiracleRequest, setIsMiracleRequest] = useState(false);
  const [showTithingModal, setShowTithingModal] = useState(false);
  const [showSpiritualGuide, setShowSpiritualGuide] = useState(false);

  const t = currentUser ? (UI_TRANSLATIONS[currentUser.language] || UI_TRANSLATIONS['Spanish']) : UI_TRANSLATIONS['Spanish'];

  useEffect(() => {
    if (currentUser) loadFeed();
  }, [currentUser]);

  const loadFeed = async () => {
    if (!currentUser) return;
    setLoadingPosts(true);
    try {
      const feed = await mockBackend.getFeed(currentUser);
      setPosts(feed);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !currentUser) return;
    
    try {
      const createdPost = await mockBackend.createPost(newPostContent, currentUser, isMiracleRequest, PromotionTier.NONE);
      setPosts(prev => [createdPost, ...prev]);
      setNewPostContent('');
      setIsMiracleRequest(false);
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (feedFilter === 'community' && currentUser) {
      const isFromCircle = currentUser.circleIds?.includes(post.userId);
      const isSameReligion = post.authorReligion === currentUser.religion;
      const isMine = post.userId === currentUser.id;
      return isSameReligion || isFromCircle || isMine;
    }
    return true;
  });

  if (showLanding && !currentUser) return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <Layout 
      user={currentUser} 
      onLogout={() => { mockBackend.logout(); setCurrentUser(null); }}
      onOpenGuide={() => setShowSpiritualGuide(true)}
      onOpenTithe={() => setShowTithingModal(true)}
      onUpdateUser={setCurrentUser}
    >
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] mb-12 flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-6 relative z-10">
          <div className="bg-indigo-600 p-4 rounded-2xl animate-pulse">
            <Flame className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">{t['global_mantle']}</p>
            <p className="text-3xl font-black tracking-tighter">142,501 <span className="text-xs text-slate-400 ml-2">{t['voices_united']}</span></p>
          </div>
        </div>
        <Button onClick={() => setFeedFilter('all')} variant="ghost" className="text-white text-[10px] font-black uppercase border border-white/10 rounded-2xl px-6">
          {t['global_altar']} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-xl p-12 mb-12 border border-slate-50">
        <form onSubmit={handleCreatePost} className="space-y-8">
          <div className="flex space-x-6">
            <img src={currentUser.avatarUrl} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
            <textarea 
              value={newPostContent} 
              onChange={e => setNewPostContent(e.target.value)}
              placeholder={t['post_placeholder']}
              className="flex-1 border-none focus:ring-0 text-2xl font-medium placeholder-slate-200 resize-none min-h-[100px]"
            />
          </div>
          <div className="flex items-center justify-between pt-8 border-t border-slate-50">
            <button type="button" onClick={() => setIsMiracleRequest(!isMiracleRequest)} className={`flex items-center space-x-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isMiracleRequest ? 'bg-amber-400 text-white shadow-lg shadow-amber-100' : 'bg-slate-50 text-slate-400'}`}>
              <Zap className={`h-4 w-4 ${isMiracleRequest ? 'fill-current' : ''}`} /> <span>{t['miracle_call']}</span>
            </button>
            <Button type="submit" disabled={!newPostContent.trim()} className="px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 bg-indigo-600">
              {t['publish']} <Send className="h-4 w-4 ml-3" />
            </Button>
          </div>
        </form>
      </div>

      <div className="flex bg-slate-100 p-2 rounded-[2.5rem] mb-12 border border-slate-200">
        <button onClick={() => setFeedFilter('community')} className={`flex-1 flex items-center justify-center py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${feedFilter === 'community' ? 'bg-white text-indigo-700 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
          <Users className="h-4 w-4 mr-3" /> {t['my_circle']}
        </button>
        <button onClick={() => setFeedFilter('all')} className={`flex-1 flex items-center justify-center py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${feedFilter === 'all' ? 'bg-white text-indigo-700 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
          <Globe className="h-4 w-4 mr-3" /> {t['global_altar']}
        </button>
      </div>

      {feedFilter === 'community' && filteredPosts.length < 5 && posts.length > 5 && (
        <div className="mb-10 p-6 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-center space-x-4">
          <Info className="h-6 w-6 text-indigo-500" />
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700">{t['explore_global']}</p>
        </div>
      )}

      <div className="space-y-10">
        {loadingPosts ? (
          <div className="text-center py-20 animate-pulse text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">{t['loading_souls']}</div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} userLanguage={currentUser.language} currentUser={currentUser} />
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t['no_posts']}</p>
            <Button onClick={loadFeed} variant="ghost" className="mt-4 text-indigo-600 font-black">{t['retry']}</Button>
          </div>
        )}
      </div>

      {showTithingModal && <TithingModal user={currentUser} onClose={() => setShowTithingModal(false)} onSuccess={() => { setShowTithingModal(false); loadFeed(); }} />}
      {showSpiritualGuide && <SpiritualGuide user={currentUser} onClose={() => setShowSpiritualGuide(false)} onUpgrade={() => { setShowSpiritualGuide(false); setShowTithingModal(true); }} />}
    </Layout>
  );
}
