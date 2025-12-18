
import React, { useState, useEffect } from 'react';
import { Post, Religion, Language, User, PromotionTier, Comment } from '../types';
import { translateText } from '../services/geminiService';
import { Heart, MessageCircle, Hand, Flame, Globe, Sun, Send, Zap, Crown, Sparkles } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';

interface PostCardProps {
  post: Post;
  userLanguage: Language;
  currentUser: User;
}

const getReligionColor = (religion: Religion) => {
  switch (religion) {
    case Religion.CHRISTIANITY: return 'bg-blue-100 text-blue-800';
    case Religion.ISLAM: return 'bg-green-100 text-green-800';
    case Religion.JUDAISM: return 'bg-blue-50 text-blue-900';
    case Religion.HINDUISM: return 'bg-orange-100 text-orange-800';
    case Religion.BUDDHISM: return 'bg-amber-100 text-amber-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};

export const PostCard: React.FC<PostCardProps> = ({ post, userLanguage, currentUser }) => {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  const [interactionCount, setInteractionCount] = useState(post.isMiracle ? post.prayers : post.likes);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAnswered, setIsAnswered] = useState(post.isAnswered || false);
  const [markingAnswered, setMarkingAnswered] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // El post promocionado tiene un "multiplicador" visual de fe
  const isPromoted = post.promotionTier !== PromotionTier.NONE;
  const prayerPower = Math.min(100, (interactionCount / (isPromoted ? 200 : 50)) * 100);

  useEffect(() => {
    const shouldTranslate = post.language && post.language !== userLanguage;
    if (shouldTranslate) {
      const fetchTranslation = async () => {
        setIsTranslating(true);
        try {
          const result = await translateText(post.content, userLanguage);
          setTranslatedContent(result);
        } catch (err) {
          setTranslatedContent(null);
        } finally {
          setIsTranslating(false);
        }
      };
      fetchTranslation();
    }
  }, [post.id, userLanguage]);

  const handleInteraction = async () => {
    if (hasInteracted) return;
    setHasInteracted(true);
    setInteractionCount(prev => prev + 1);
    await mockBackend.interactPost(post.id, post.isMiracle ? 'pray' : 'like');
  };

  const handleMarkAsAnswered = async () => {
    setMarkingAnswered(true);
    try {
      await mockBackend.markAsAnswered(post.id);
      setIsAnswered(true);
    } finally {
      setMarkingAnswered(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const addedComment = await mockBackend.addComment(post.id, newComment, currentUser);
      setComments(prev => [...prev, addedComment]);
      setNewComment('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const displayContent = (translatedContent && !showOriginal) ? translatedContent : post.content;

  return (
    <div className={`
      relative rounded-[2.5rem] border p-8 mb-8 transition-all duration-500
      ${isPromoted ? 'bg-gradient-to-br from-white to-amber-50/30 border-amber-200 shadow-xl shadow-amber-100/50 scale-[1.02]' : 'bg-white shadow-sm border-slate-100'}
      ${isAnswered ? 'ring-8 ring-emerald-50 border-emerald-200' : ''}
    `}>
      {isPromoted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center space-x-2 uppercase tracking-widest z-10">
          <Sparkles className="h-3 w-3" />
          <span>Intención Prioritaria: Altar Global</span>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img src={post.authorAvatarUrl} className="h-14 w-14 rounded-2xl object-cover shadow-md" alt="" />
            {isPromoted && <Crown className="absolute -top-2 -right-2 h-6 w-6 text-amber-500 drop-shadow-md" fill="currentColor" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-slate-900">{post.authorName}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getReligionColor(post.authorReligion)}`}>
                {post.authorReligion}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              {new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {post.language}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           {isAnswered && <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center"><Sun className="h-3 w-3 mr-1" /> Testimonio</div>}
           <Globe className="h-4 w-4 text-slate-300" />
        </div>
      </div>
      
      <div className="mt-6">
        <p className={`text-slate-800 font-medium leading-tight whitespace-pre-wrap ${isPromoted ? 'text-2xl' : 'text-xl'}`}>
          {isTranslating ? <span className="animate-pulse text-slate-300">Uniendo lenguajes...</span> : displayContent}
        </p>
      </div>

      {post.isMiracle && !isAnswered && (
        <div className={`mt-8 p-5 rounded-3xl border ${isPromoted ? 'bg-amber-100/50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
              <Flame className={`h-4 w-4 mr-2 ${isPromoted ? 'text-orange-600 animate-pulse' : 'text-orange-400'}`} /> 
              {isPromoted ? 'Fuerza Colectiva Amplificada' : 'Poder de la Oración'}
            </span>
            <div className="text-right">
              <span className="text-sm font-black text-indigo-700 block">{interactionCount} Almas</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold">Unidas en fe</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden p-1">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isPromoted ? 'bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'bg-indigo-500'}`}
              style={{ width: `${Math.max(15, prayerPower)}%` }}
            ></div>
          </div>
          {isPromoted && <p className="text-[10px] text-amber-700 mt-3 font-bold text-center italic">"Donde hay muchos corazones, el milagro es inminente"</p>}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
        <button 
          onClick={handleInteraction} 
          disabled={hasInteracted}
          className={`
            flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest
            ${hasInteracted 
              ? 'bg-indigo-50 text-indigo-600' 
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95'}
          `}
        >
          {post.isMiracle ? <Hand className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
          <span>{hasInteracted ? 'Orando' : post.isMiracle ? 'Unirme a Oración' : 'Me inspira'}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-lg ml-2">{interactionCount}</span>
        </button>
        
        <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-3 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors">
          <MessageCircle className="h-5 w-5" />
          <span>{comments.length}</span>
        </button>

        {currentUser.id === post.userId && post.isMiracle && !isAnswered && (
          <button onClick={handleMarkAsAnswered} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center hover:bg-emerald-50 px-3 py-2 rounded-xl transition-all">
            <Sun className="h-4 w-4 mr-2" /> Cumplido
          </button>
        )}
      </div>

      {showComments && (
        <div className="mt-8 space-y-4 animate-fade-in border-t border-slate-50 pt-6">
           {comments.map(c => (
             <div key={c.id} className="flex space-x-4 items-start">
               <img src={c.authorAvatarUrl} className="h-10 w-10 rounded-2xl shadow-sm" alt="" />
               <div className="bg-slate-50 rounded-3xl px-5 py-3 flex-1 border border-slate-100">
                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">{c.authorName}</p>
                 <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
               </div>
             </div>
           ))}
           <form onSubmit={handleSubmitComment} className="flex gap-3 bg-white p-3 rounded-3xl border border-slate-200 mt-4 focus-within:border-indigo-400 transition-all shadow-inner">
             <input 
               type="text" 
               value={newComment} 
               onChange={(e) => setNewComment(e.target.value)} 
               placeholder="Deja una palabra de bendición..." 
               className="flex-1 text-sm bg-transparent border-none focus:ring-0 px-2" 
             />
             <button type="submit" disabled={!newComment.trim() || submittingComment} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-90">
               <Send className="h-4 w-4" />
             </button>
           </form>
        </div>
      )}
    </div>
  );
};
