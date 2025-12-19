
import React, { useState } from 'react';
import { User, UI_TRANSLATIONS } from '../types';
import { Button } from './Button';
import { LogOut, Sun, Crown, Sparkles, Heart, Hand, Camera, X } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  onOpenGuide: () => void;
  onOpenTithe: () => void;
  onUpdateUser: (user: User) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, onOpenGuide, onOpenTithe, onUpdateUser, children }) => {
  const t = UI_TRANSLATIONS[user.language] || UI_TRANSLATIONS['Spanish'];
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(user.avatarUrl);

  const handleSaveAvatar = async () => {
    try {
      const updatedUser = await mockBackend.updateProfile(user.id, { avatarUrl: newAvatarUrl });
      onUpdateUser(updatedUser);
      setIsChangingAvatar(false);
    } catch (err) {
      console.error("Failed to update avatar", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-10 w-full flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
              <Hand className="h-6 w-6 text-white" />
            </div>
            <span className="ml-4 text-2xl font-black text-slate-900 tracking-tighter">PrayLink</span>
            {user.isPremium && (
              <span className="ml-4 bg-amber-400 text-white text-[9px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                SERAFÍN
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 px-4 py-2 bg-slate-50 rounded-2xl">
              <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-xl object-cover" />
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{user.firstName}</p>
            </div>
            <button onClick={onLogout} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-10 py-12">
        <div className="grid grid-cols-12 gap-10">
          <aside className="col-span-3">
             <div className="bg-white rounded-[3rem] shadow-xl p-10 text-center border border-slate-100 sticky top-32">
                <div className="relative group mx-auto mb-6 h-24 w-24">
                  <img src={user.avatarUrl} alt="" className="h-full w-full rounded-[2rem] object-cover shadow-2xl" />
                  <button 
                    onClick={() => setIsChangingAvatar(true)}
                    className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                </div>
                
                {isChangingAvatar && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-sm">
                      <div className="flex justify-between mb-4">
                        <h4 className="font-black uppercase text-xs tracking-widest">{t['change_avatar']}</h4>
                        <button onClick={() => setIsChangingAvatar(false)}><X className="h-4 w-4"/></button>
                      </div>
                      <input 
                        type="text" 
                        value={newAvatarUrl} 
                        onChange={e => setNewAvatarUrl(e.target.value)} 
                        placeholder={t['avatar_url_label']}
                        className="w-full p-4 bg-slate-100 rounded-xl mb-4 text-xs font-bold"
                      />
                      <Button onClick={handleSaveAvatar} className="w-full rounded-xl py-4 uppercase text-[10px] font-black tracking-widest">
                        {t['save']}
                      </Button>
                    </div>
                  </div>
                )}

                <h3 className="font-black text-xl text-slate-900 mb-1">{user.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-8">{user.religion}</p>
                
                <div className="space-y-4">
                  <button onClick={onOpenTithe} className="w-full bg-rose-600 text-white py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-rose-100">
                    <Heart className="h-4 w-4" /> <span className="text-[10px] font-black uppercase tracking-widest">{t['give_offering']}</span>
                  </button>
                  <button onClick={onOpenGuide} className="w-full bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-xl">
                    <Sparkles className="h-4 w-4 text-purple-400" /> <span className="text-[10px] font-black uppercase tracking-widest">{t['spiritual_guide']}</span>
                  </button>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-50 space-y-4">
                   <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                     <span>{t['my_circle']}</span> <span className="text-slate-900">{user.circleIds?.length || 0}</span>
                   </div>
                </div>
             </div>
          </aside>

          <main className="col-span-6">{children}</main>

          <aside className="col-span-3 space-y-10">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <Sun className="h-8 w-8 text-amber-300 mb-6" />
                 <h3 className="font-black text-[10px] uppercase tracking-widest text-indigo-300 mb-4">{t['daily_inspiration']}</h3>
                 <p className="text-xl font-medium italic opacity-90 leading-tight">"La fe es el puente donde lo imposible se vuelve real."</p>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
