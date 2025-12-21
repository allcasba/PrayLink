import React, { useState, useRef, useEffect } from 'react';
import { Religion, Visibility, User, Language, SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '../types';
import { mockBackend } from '../services/mockBackend';
import { Button } from './Button';
import { Shield, Languages, Globe, Key, Camera, Upload, RotateCcw, Check, X } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  initialLanguage?: Language;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, initialLanguage = 'English' }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [religion, setReligion] = useState<Religion>(Religion.CHRISTIANITY);
  const [visibility, setVisibility] = useState<Visibility>(Visibility.PUBLIC);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  
  // Camera & Image State
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['English'];

  useEffect(() => {
    if (initialLanguage) setLanguage(initialLanguage);
  }, [initialLanguage]);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("No se pudo acceder a la cámara.");
      setShowCamera(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setAvatar(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let user: User;
      if (isRegistering) {
        user = await mockBackend.register(firstName, lastName, email, religion, visibility, language, password, avatar || undefined);
      } else {
        user = await mockBackend.login(email, password);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 sm:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-100 transform -rotate-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-8 text-4xl font-black text-slate-900 tracking-tighter">PrayLink</h2>
          <p className="text-slate-400 font-medium mt-2">{t['slogan']}</p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-2xl text-center">{error}</div>}
          
          <div className="space-y-4">
            {isRegistering && (
              <>
                {/* Avatar Capture Section */}
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="relative h-28 w-28 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                    {avatar ? (
                      <img src={avatar} className="h-full w-full object-cover" alt="Preview" />
                    ) : showCamera ? (
                      <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover scale-x-[-1]" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-300">
                        <Camera className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {!showCamera ? (
                      <>
                        <button type="button" onClick={startCamera} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                          <Camera className="h-5 w-5" />
                        </button>
                        <label className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                          <Upload className="h-5 w-5" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                        {avatar && (
                          <button type="button" onClick={() => setAvatar(null)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex space-x-2">
                        <button type="button" onClick={takePhoto} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">
                          Capturar
                        </button>
                        <button type="button" onClick={stopCamera} className="p-2 bg-red-50 text-red-600 rounded-xl">
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required placeholder={t['auth_first_name']} value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
                  <input type="text" required placeholder={t['auth_last_name']} value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
                </div>
                
                <div className="relative">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <select value={religion} onChange={(e) => setReligion(e.target.value as Religion)} className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold">
                    {Object.values(Religion).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-4">
              <input type="email" required placeholder={t['auth_email']} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
              <div className="relative">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input type="password" required placeholder={t['auth_password']} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
              </div>
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 bg-indigo-600 text-white">
            {isRegistering ? t['auth_register_title'] : t['auth_login_title']}
          </Button>
        </form>

        <div className="text-center pt-4">
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-600 transition-colors">
            {isRegistering ? t['auth_switch_to_login'] : t['auth_switch_to_register']}
          </button>
        </div>
      </div>
    </div>
  );
};