
import React, { useState, useEffect } from 'react';
import { Post, Religion, Language, User, PromotionTier, UI_TRANSLATIONS } from '../types';
import { translateText } from '../services/geminiService';
import { Heart, MessageCircle, Hand, Flame, Globe, Sun, Send, Zap, Crown, Sparkles, UserPlus, CheckCircle2 } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';

interface PostCardProps {
  post: Post;
  userLanguage: Language;
  currentUser: User;
}

const getReligionColor = (religion: Religion) => {
  switch (religion) {
    case Religion.CHRISTIANITY: return 'bg-blue-50 text-blue-700';
    case Religion.ISLAM: return 'bg-emerald-50 text-emerald-700';
    case Religion.JUDAISM: return 'bg-indigo-50 text-indigo-700';
    case Religion.HINDUISM: return 'bg-orange-50 text-orange-700';
    case Religion.BUDDHISM: return 'bg-amber-50 text-amber-700';
    default: return 'bg-slate-50 text-slate-700';
  }
};

export const PostCard: React.FC<PostCardProps> = ({ post, userLanguage, currentUser }) => {
  const t = UI_TRANSLATIONS[userLanguage] || UI_TRANSLATIONS['Spanish'];
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [interactionCount, setInteractionCount] = useState(post.isMiracle ? post.prayers : post.likes);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAnswered, setIsAnswered] = useState(post.isAnswered || false);
  const [isInCircle, setIsInCircle] = useState(currentUser.circleIds?.includes(post.userId) || false);
  const [togglingCircle, setTogglingCircle] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');

  const isPromoted = post.promotionTier !== PromotionTier.NONE;

  useEffect(() => {
    if (post.language !== userLanguage) {
      const fetchTranslation = async () => {
        setIsTranslating(true);
        try {
          const result = await translateText(post.content, userLanguage);
          setTranslatedContent(result);
        } finally {
          setIsTranslating(false);
        }
      };
      fetchTranslation();
    }
  }, [post.id, userLanguage]);

  const handleToggleCircle = async () => {
    if (post.userId === currentUser.id) return;
    setTogglingCircle(true);
    try {
      const newCircle = await mockBackend.toggleCircle(post.userId);
      setIsInCircle(newCircle.includes(post.userId));
    } finally {
      setTogglingCircle(false);
    }
  };

  const handleInteraction = async () => {
    if (hasInteracted) return;
    setHasInteracted(true);
    setInteractionCount(prev => prev + 1);
    await mockBackend.interactPost(post.id, post.isMiracle ? 'pray' : 'like');
  };

  return (
    <div className={`relative rounded-[2.5rem] border p-10 mb-10 transition-all duration-500 ${isPromoted ? 'bg-gradient-to-br from-white to-amber-50/20 border-amber-200 shadow-2xl shadow-amber-100/50 scale-[1.01]' : 'bg-white shadow-sm border-slate-100'}`}>
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-5">
          <div className="relative">
            <img src={post.authorAvatarUrl} className="h-16 w-16 rounded-[1.5rem] object-cover shadow-lg" alt="" />
            {isPromoted && <Crown className="absolute -top-3 -right-3 h-7 w-7 text-amber-500" fill="currentColor" />}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-base font-black text-slate-900 tracking-tight">{post.authorName}</h3>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getReligionColor(post.authorReligion)}`}>
                {post.authorReligion}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {post.language}
            </p>
          </div>
        </div>
        
        {currentUser.id !== post.userId && (
          <button 
            onClick={handleToggleCircle} 
            disabled={togglingCircle}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isInCircle ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'}`}
          >
            {isInCircle ? <CheckCircle2 className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            <span>{isInCircle ? t['in_circle'] : t['add_circle']}</span>
          </button>
        )}
      </div>

      <div className="mb-8">
        <p className={`text-slate-800 font-medium leading-tight whitespace-pre-wrap ${isPromoted ? 'text-3xl' : 'text-2xl'}`}>
          {isTranslating ? <span className="animate-pulse text-slate-200 italic">Traduciendo milagro...</span> : (translatedContent || post.content)}
        </p>
        {translatedContent && <p className="text-[10px] text-indigo-400 mt-4 font-black uppercase tracking-widest">Traducción IA al {userLanguage}</p>}
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-slate-50">
        <button 
          onClick={handleInteraction} 
          disabled={hasInteracted}
          className={`flex items-center space-x-4 px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${hasInteracted ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'}`}
        >
          {post.isMiracle ? <Hand className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
          <span>{hasInteracted ? t['praying'] : t['publish']}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-lg ml-2">{interactionCount}</span>
        </button>

        <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-3 text-slate-300 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-colors">
          <MessageCircle className="h-5 w-5" />
          <span>{comments.length}</span>
        </button>
      </div>
    </div>
  );
};
