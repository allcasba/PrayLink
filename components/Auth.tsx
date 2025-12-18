
import React, { useState } from 'react';
import { Religion, Visibility, User, Language, SUPPORTED_LANGUAGES } from '../types';
import { mockBackend } from '../services/mockBackend';
import { Button } from './Button';
import { Shield, UserPlus, Lock, Eye, BookOpen } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const COUNTRIES = [
  "Argentina", "Chile", "Colombia", "España", "México", "Perú", "EE.UU.", "Otros"
];

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [religion, setReligion] = useState<Religion>(Religion.CHRISTIANITY);
  const [visibility, setVisibility] = useState<Visibility>(Visibility.PUBLIC);
  const [language, setLanguage] = useState<Language>('Spanish');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let user: User;
      if (isRegistering) {
        user = await mockBackend.register(
          firstName, lastName, email, religion, visibility, language,
          "1990-01-01", "México", "Prefiero no decir"
        );
      } else {
        user = await mockBackend.login(email);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-slate-200">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-black text-slate-900">FaithCircle</h2>
          <p className="text-slate-500 font-medium">Conecta con tu comunidad de fe</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-bold">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {isRegistering ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <input type="text" required placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Tu Religión</label>
                  <select value={religion} onChange={(e) => setReligion(e.target.value as Religion)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                    {Object.values(Religion).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                  <p className="text-xs font-bold text-indigo-900 uppercase">Privacidad de tu fe</p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" checked={visibility === Visibility.PUBLIC} onChange={() => setVisibility(Visibility.PUBLIC)} className="text-indigo-600" />
                      <span className="text-sm font-medium text-slate-700">Mundo (Cualquiera puede verme)</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" checked={visibility === Visibility.SAME_RELIGION} onChange={() => setVisibility(Visibility.SAME_RELIGION)} className="text-indigo-600" />
                      <span className="text-sm font-medium text-slate-700">Solo mi Círculo de Fe</span>
                    </label>
                  </div>
                </div>
              </>
            ) : null}

            <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-4 rounded-xl text-lg font-bold shadow-lg shadow-indigo-100">
            {isRegistering ? 'Crear Perfil Espiritual' : 'Entrar a mi Círculo'}
          </Button>
        </form>

        <div className="text-center pt-4">
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo aquí? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
};
