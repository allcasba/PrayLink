
import React, { useState } from 'react';
import { User, PaymentMethod } from '../types';
import { mockBackend } from '../services/mockBackend';
import { Button } from './Button';
import { X, CreditCard, Heart, ShieldCheck, CheckCircle, Wallet, Lock, AlertCircle } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Intentar cargar la clave desde el entorno, de lo contrario usar modo test
const STRIPE_PK = process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx';
const PAYPAL_ID = process.env.VITE_PAYPAL_CLIENT_ID || 'test';

const stripePromise = loadStripe(STRIPE_PK);

interface TithingModalProps {
  user: User;
  onClose: () => void;
}

const StripeForm = ({ amount, onSuccess, onCancel }: { amount: number, onSuccess: () => void, onCancel: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setError(error.message || 'Error al procesar la tarjeta');
      setProcessing(false);
    } else {
      // En producción aquí enviarías paymentMethod.id a tu servidor
      console.log('[Stripe Success]', paymentMethod.id);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 focus-within:border-indigo-500 transition-all">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Datos de Tarjeta Seguros</label>
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#1e293b',
              fontFamily: 'Inter, sans-serif',
              '::placeholder': { color: '#94a3b8' },
            },
            invalid: { color: '#ef4444' },
          }
        }} />
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}

      <div className="flex gap-4">
        <button type="button" onClick={onCancel} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</button>
        <Button 
          type="submit" 
          disabled={!stripe || processing} 
          isLoading={processing}
          className="flex-[2] py-5 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-100 text-xs font-black uppercase tracking-widest"
        >
          PAGAR ${amount}
        </Button>
      </div>
    </form>
  );
};

export const TithingModal: React.FC<TithingModalProps> = ({ user, onClose }) => {
  const [step, setStep] = useState<'amount' | 'method' | 'success'>('amount');
  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('10');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handlePaymentSuccess = async () => {
    await mockBackend.processTithe(user.id, amount, selectedMethod || PaymentMethod.PAYPAL);
    setStep('success');
  };

  return (
    <PayPalScriptProvider options={{ "clientId": PAYPAL_ID, currency: "USD", intent: "capture" }}>
      <Elements stripe={stripePromise}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden relative border border-slate-100">
            
            {/* Header */}
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-5">
                <div className="bg-rose-500 p-4 rounded-2xl shadow-xl shadow-rose-200">
                  <Heart className="h-6 w-6 text-white fill-current" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tighter leading-none mb-1">Ofrenda de Luz</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Multiplicando la Esperanza</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-300">
                <X className="h-7 w-7" />
              </button>
            </div>

            {/* Contenido Dinámico */}
            <div className="p-10">
              {step === 'amount' && (
                <div className="space-y-10 animate-fade-in">
                  <div className="text-center">
                    <p className="text-slate-500 font-medium mb-10 text-lg">¿Qué monto deseas sembrar?</p>
                    <div className="grid grid-cols-2 gap-5 mb-10">
                      {[10, 50, 100, 500].map((val) => (
                        <button
                          key={val}
                          onClick={() => { setAmount(val); setCustomAmount(val.toString()); }}
                          className={`p-8 rounded-[2.5rem] border-4 transition-all transform active:scale-95 ${
                            amount === val 
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xl shadow-indigo-100/50' 
                              : 'border-slate-50 hover:border-slate-100 text-slate-300'
                          }`}
                        >
                          <span className="text-3xl font-black">${val}</span>
                        </button>
                      ))}
                    </div>
                    <div className="relative group">
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-200 font-black text-3xl group-focus-within:text-indigo-500 transition-colors">$</span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setAmount(Number(e.target.value)); }}
                        placeholder="Otro monto"
                        className="w-full pl-16 pr-8 py-7 rounded-[2rem] border-4 border-slate-50 focus:border-indigo-600 outline-none text-3xl font-black text-slate-800 transition-all placeholder:text-slate-100"
                      />
                    </div>
                  </div>
                  <Button onClick={() => setStep('method')} disabled={amount <= 0} className="w-full py-7 text-[11px] font-black uppercase tracking-[0.4em] rounded-[1.8rem] shadow-2xl shadow-indigo-100 bg-indigo-600">
                    CONTINUAR AL ALTAR
                  </Button>
                </div>
              )}

              {step === 'method' && (
                <div className="space-y-10 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.4em]">Pasarela de Pago</h4>
                    <button onClick={() => setStep('amount')} className="text-[10px] font-black text-indigo-600 underline uppercase tracking-widest">Monto: ${amount}</button>
                  </div>

                  {!selectedMethod ? (
                    <div className="grid gap-5">
                      <button 
                        onClick={() => setSelectedMethod(PaymentMethod.CREDIT_CARD)}
                        className="flex items-center p-8 rounded-[2.5rem] border-4 border-slate-50 hover:border-indigo-200 bg-white transition-all group shadow-sm hover:shadow-xl"
                      >
                        <div className="bg-indigo-50 p-5 rounded-2xl mr-8 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <CreditCard className="h-8 w-8" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-1">Tarjeta Bancaria</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Stripe Secure Pay</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => setSelectedMethod(PaymentMethod.PAYPAL)}
                        className="flex items-center p-8 rounded-[2.5rem] border-4 border-slate-50 hover:border-blue-200 bg-white transition-all group shadow-sm hover:shadow-xl"
                      >
                        <div className="bg-blue-50 p-5 rounded-2xl mr-8 group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-600">
                          <Wallet className="h-8 w-8" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-1">PayPal / Wallet</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Donación en un clic</p>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      {selectedMethod === PaymentMethod.CREDIT_CARD ? (
                        <StripeForm 
                          amount={amount} 
                          onSuccess={handlePaymentSuccess} 
                          onCancel={() => setSelectedMethod(null)} 
                        />
                      ) : (
                        <div className="space-y-10">
                          <PayPalButtons 
                            style={{ layout: "vertical", shape: "pill", label: "donate", color: "blue" }}
                            createOrder={(data, actions) => {
                              return actions.order.create({
                                intent: "CAPTURE",
                                purchase_units: [{
                                  amount: { currency_code: "USD", value: amount.toString() },
                                  description: "Ofrenda de Luz PrayLink"
                                }],
                              });
                            }}
                            onApprove={async (data, actions) => {
                              if (actions.order) {
                                await actions.order.capture();
                                handlePaymentSuccess();
                              }
                            }}
                          />
                          <button onClick={() => setSelectedMethod(null)} className="w-full text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors">Volver a Selección</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                  <div className="h-32 w-32 bg-emerald-100 rounded-full flex items-center justify-center mb-12 shadow-2xl shadow-emerald-50 border-8 border-white">
                    <CheckCircle className="h-16 w-16 text-emerald-600" />
                  </div>
                  <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-none">¡Recibido!</h3>
                  <p className="text-slate-500 mb-14 text-xl leading-relaxed max-w-xs mx-auto">
                    Tu ofrenda de <strong className="text-slate-900 underline decoration-indigo-300 decoration-4 underline-offset-8">${amount.toFixed(2)}</strong> ha sido registrada en el libro de la vida.
                  </p>
                  <Button onClick={onClose} className="w-full py-7 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-emerald-100 bg-emerald-600">
                    GLORIA A DIOS
                  </Button>
                </div>
              )}
            </div>

            {/* Footer Security */}
            {step !== 'success' && (
              <div className="bg-slate-50 p-10 flex flex-col items-center border-t border-slate-100 space-y-4">
                <div className="flex items-center space-x-3">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Encriptación 256-bit AES</p>
                </div>
                <div className="flex space-x-8 opacity-40 grayscale hover:grayscale-0 transition-all cursor-default scale-110">
                  <ShieldCheck className="h-6 w-6" />
                  <CreditCard className="h-6 w-6" />
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Elements>
    </PayPalScriptProvider>
  );
};
