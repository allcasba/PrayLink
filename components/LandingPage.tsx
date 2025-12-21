import React from 'react';
import { Button } from './Button';
import { BookHeart, Users, Zap, Globe, Flame, Sparkles, Hand, ArrowRight, Languages } from 'lucide-react';
import { UI_TRANSLATIONS, Language, SUPPORTED_LANGUAGES } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, currentLanguage, onLanguageChange }) => {
  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS['English'];

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center group cursor-pointer">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-100">
              <Hand className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-black text-slate-900 tracking-tighter">PrayLink<span className="text-indigo-600">.net</span></span>
          </div>
          <div className="hidden md:flex space-x-10 items-center">
            <a href="#mission" className="text-slate-500 hover:text-indigo-600 font-bold text-[9px] uppercase tracking-[0.2em] transition-colors">{t['welcome']}</a>
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Languages className="h-3.5 w-3.5 text-slate-400" />
              <select 
                value={currentLanguage} 
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-transparent text-[9px] font-black uppercase outline-none border-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Button onClick={onGetStarted} className="rounded-2xl px-8 font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100">Entrar</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-5 py-2 rounded-full mb-10">
              <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.2em]">Más de 140,000 almas orando ahora</span>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black text-slate-900 tracking-tighter mb-10 leading-[0.85]">
              {t['landing_hero_title_1']} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient">{t['landing_hero_title_2']}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-500 mb-14 leading-relaxed max-w-3xl mx-auto font-medium">
              {t['landing_hero_subtitle']} <br className="hidden sm:block" />
              Porque cuando dos o más se reúnen, <span className="text-slate-900 font-bold underline decoration-indigo-300 underline-offset-4">el milagro comienza.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button onClick={onGetStarted} className="w-full sm:w-auto px-16 py-6 text-xl font-black shadow-2xl shadow-indigo-200 rounded-[2rem] transform hover:scale-105 active:scale-95 transition-all bg-indigo-600">
                {t['landing_cta_primary']}
              </Button>
              <button onClick={onGetStarted} className="w-full sm:w-auto text-lg font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center">
                {t['landing_cta_secondary']} <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-indigo-50/50 rounded-full blur-[140px] -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-50/50 rounded-full blur-[100px] -z-10"></div>
      </div>

      {/* Core Concept */}
      <div id="power" className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="inline-block bg-indigo-500/20 px-4 py-1 rounded-lg">
                <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">El Multiplicador de Fe</span>
              </div>
              <h2 className="text-5xl font-black leading-tight tracking-tighter">La Ofrenda de Luz: <br/><span className="text-indigo-400">Energía que trasciende.</span></h2>
              <p className="text-xl text-slate-400 leading-relaxed">
                En PrayLink, no cobramos por la fe, cobramos por la <span className="text-white font-bold">atención</span>. Una Ofrenda de Luz permite que tu intención sea la primera que miles de personas vean al despertar, multiplicando las probabilidades de que tu llamado sea escuchado.
              </p>
              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  { icon: <Users />, title: "Comunidad Viva", desc: "Oradores de todas las religiones unidos por un fin." },
                  { icon: <Flame />, title: "Fuego Colectivo", desc: "Cada clic de oración es una vela encendida por ti." }
                ].map((item, i) => (
                  <div key={i} className="space-y-4">
                    <div className="text-indigo-400">{item.icon}</div>
                    <h4 className="font-black uppercase text-xs tracking-widest">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[3rem] blur-2xl opacity-20 animate-pulse"></div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
                 <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 bg-red-500 rounded-full animate-ping"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emergencia de Fe</span>
                    </div>
                    <div className="bg-amber-400/20 text-amber-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-400/30">Ofrenda Oro</div>
                 </div>
                 <p className="text-3xl font-medium leading-tight mb-12">"Oración por la salud de Lucas, un bebé de 2 meses en cuidados intensivos."</p>
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300">
                      <span>Nivel de Clamor</span>
                      <span>9.4k Oraciones</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-5 p-1 border border-white/5">
                      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-1000 w-[92%]"></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="py-40 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <Hand className="h-16 w-16 text-indigo-600 mx-auto mb-10" />
          <h2 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter mb-10">Únete a la Cadena.</h2>
          <p className="text-xl text-slate-500 mb-14 max-w-2xl mx-auto">
            Sé parte de PrayLink.net y descubre cómo la fe de otros puede sostener la tuya en los momentos más oscuros.
          </p>
          <Button onClick={onGetStarted} className="px-20 py-6 text-xl font-black rounded-[2rem] shadow-2xl shadow-indigo-100 bg-indigo-600">
            EMPEZAR GRATIS
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-20 selection:bg-indigo-600 selection:text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="flex items-center justify-center mb-8">
            <Hand className="h-8 w-8 text-indigo-600 mr-3" />
            <span className="text-2xl font-black text-slate-900 tracking-tighter">PrayLink</span>
          </div>
          <div className="flex flex-wrap justify-center gap-10 text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">
            <a href="#" className="hover:text-indigo-600 transition-colors">Términos</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contacto</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Ayuda</a>
          </div>
          <p className="text-sm text-slate-400">© 2025 PrayLink.net - Multiplicando milagros a través de la unión.</p>
        </div>
      </footer>
    </div>
  );
};