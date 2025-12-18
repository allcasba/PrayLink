
import React, { useState } from 'react';
import { User, Religion } from '../types';
import { generateDailyWisdom } from '../services/geminiService';
import { Button } from './Button';
import { LogOut, Sun, Users, Menu, X, Globe, Crown, Sparkles, Heart, Zap, Hand } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  onOpenGuide: () => void;
  onOpenTithe: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, onOpenGuide, onOpenTithe, children }) => {
  const [wisdom, setWisdom] = useState<string | null>(null);
  const [loadingWisdom, setLoadingWisdom] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetWisdom = async () => {
    setLoadingWisdom(true);
    const text = await generateDailyWisdom(user.religion, user.language);
    setWisdom(text);
    setLoadingWisdom(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-600 selection:text-white">
      {/* Navbar Minimalista */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 group">
                <Hand className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="ml-4 text-2xl font-black text-slate-900 tracking-tighter hidden sm:block">PrayLink</span>
              {user.isPremium && (
                <span className="ml-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center tracking-widest uppercase shadow-md">
                  <Crown className="h-3 w-3 mr-1" /> SERAFÍN
                </span>
              )}
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-3 px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                 <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-xl object-cover shadow-sm"/>
                 <div className="text-left">
                   <p className="text-[11px] font-black text-slate-800 leading-none mb-1">{user.firstName}</p>
                   <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{user.religion}</p>
                 </div>
              </div>
              <button onClick={onLogout} className="p-3 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-500 hover:text-slate-700 p-2"
              >
                {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-10 space-y-10 animate-fade-in">
            <div className="flex items-center space-x-5">
               <img src={user.avatarUrl} alt="" className="h-16 w-16 rounded-2xl shadow-xl"/>
               <div>
                 <div className="font-black text-2xl tracking-tighter">{user.name}</div>
                 <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{user.religion}</div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <button onClick={onOpenTithe} className="flex flex-col items-center justify-center p-6 bg-rose-50 text-rose-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest border border-rose-100 shadow-sm">
                 <Heart className="h-8 w-8 mb-3" /> Ofrenda
              </button>
              <button onClick={onOpenGuide} className="flex flex-col items-center justify-center p-6 bg-indigo-50 text-indigo-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest border border-indigo-100 shadow-sm">
                 <Sparkles className="h-8 w-8 mb-3" /> Guía IA
              </button>
            </div>
            <Button variant="outline" className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border-red-100 text-red-500" onClick={onLogout}>
              Cerrar Sesión
            </Button>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Sidebar Izquierda */}
          <div className="hidden lg:block lg:col-span-3">
             <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-10 sticky top-32 overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600"></div>
                <div className="relative inline-block mb-8">
                  <img src={user.avatarUrl} alt="" className="h-32 w-32 rounded-[2.5rem] mx-auto shadow-2xl object-cover border-8 border-white ring-1 ring-slate-100"/>
                  {user.isPremium && <div className="absolute -top-4 -right-4 bg-amber-400 p-2.5 rounded-2xl shadow-xl border-4 border-white"><Crown className="h-6 w-6 text-white" fill="currentColor" /></div>}
                </div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tighter mb-2">{user.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-10">{user.religion}</p>
                
                <div className="space-y-4 mb-10">
                  <button 
                    onClick={onOpenTithe}
                    className="w-full bg-rose-600 text-white py-5 rounded-2xl flex items-center justify-center space-x-3 hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 active:scale-95"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Dar Ofrenda</span>
                  </button>

                  <button 
                    onClick={onOpenGuide}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl flex items-center justify-center space-x-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                  >
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Guía Espiritual</span>
                  </button>
                </div>

                <div className="pt-8 border-t border-slate-50 space-y-5">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Círculo de Fe</span>
                     <span className="text-slate-900">1.2k Almas</span>
                   </div>
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Milagros Vistos</span>
                     <span className="text-indigo-600">142</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Área Principal */}
          <main className="lg:col-span-6">
            {children}
          </main>

          {/* Sidebar Derecha */}
          <div className="lg:col-span-3 space-y-10">
            {/* AI Widget */}
            <div className="bg-slate-900 rounded-[3rem] shadow-2xl p-10 text-white sticky top-32 relative overflow-hidden group border border-white/5">
               <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-600/30 rounded-full blur-[100px]"></div>
               <div className="relative z-10">
                 <div className="flex items-center space-x-4 mb-8">
                   <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                    <Sun className="h-6 w-6 text-amber-300" />
                   </div>
                   <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-indigo-300">Reflexión PrayLink</h3>
                 </div>
                 
                 <div className="min-h-[140px] flex items-center">
                   {loadingWisdom ? (
                     <div className="flex space-x-3">
                        <div className="h-3 w-3 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="h-3 w-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="h-3 w-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                     </div>
                   ) : wisdom ? (
                     <p className="text-2xl font-medium italic leading-tight text-white/95">"{wisdom}"</p>
                   ) : (
                     <p className="text-lg text-slate-400 font-medium leading-relaxed">Pide una palabra de sabiduría para iluminar tu camino hoy.</p>
                   )}
                 </div>

                 <Button 
                   className="w-full mt-10 bg-white text-slate-900 hover:bg-slate-50 border-none rounded-[1.5rem] py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95"
                   onClick={handleGetWisdom}
                   isLoading={loadingWisdom}
                 >
                   {wisdom ? 'PEDIR OTRA' : 'RECIBIR PALABRA'}
                 </Button>
               </div>
            </div>

            {/* Live Feed */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
              <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-400 mb-8 flex items-center">
                <Zap className="h-4 w-4 mr-3 text-amber-500 fill-current" />
                Velas Encendidas
              </h3>
              <div className="space-y-8">
                {[
                  { name: "Maria L.", text: "Agradecida por el milagro de mi salud.", time: "Hace 5m" },
                  { name: "Carlos V.", text: "PrayLink cambió mi perspectiva.", time: "Hace 14m" },
                  { name: "Esther K.", text: "Siento la paz de este círculo.", time: "Hace 22m" }
                ].map((t, i) => (
                  <div key={i} className="group cursor-default">
                    <p className="text-[11px] font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{t.name}</p>
                    <p className="text-sm text-slate-500 leading-snug line-clamp-2 italic">"{t.text}"</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase mt-2 tracking-widest">{t.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
