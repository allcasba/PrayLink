
import React, { useState, useEffect } from 'react';
import { User, PaymentMethod, Tithe } from '../types';
import { mockBackend } from '../services/mockBackend';
import { Button } from './Button';
import { X, Heart, ShieldCheck, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Inicialización de Stripe con tu clave real
const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface TithingModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
  initialAmount?: number;
}

// Componente interno para manejar el formulario de Stripe
const StripePaymentForm = ({ amount, onPaymentSuccess, onPaymentError, isProcessing, setIsProcessing }: any) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    // 1. En una app real, aquí llamarías a tu backend (Edge Function de Supabase o API)
    // para crear un PaymentIntent y obtener el client_secret.
    // const response = await fetch('/api/create-payment-intent', { method: 'POST', body: JSON.stringify({ amount }) });
    // const { clientSecret } = await response.json();

    // Simulamos la respuesta del backend para el flujo de UI
    const cardElement = elements.getElement(CardElement);

    if (cardElement) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        onPaymentError(error.message);
        setIsProcessing(false);
      } else {
        // En producción aquí usarías stripe.confirmCardPayment(clientSecret, ...)
        console.log('[PaymentMethod]', paymentMethod);
        // Simulamos éxito del proceso de confirmación
        setTimeout(() => {
          onPaymentSuccess(PaymentMethod.CREDIT_CARD, amount);
        }, 1500);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4 ml-2">Datos de Tarjeta (Stripe Secure)</label>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1e293b',
                  '::placeholder': { color: '#cbd5e1' },
                  fontFamily: 'Inter, sans-serif',
                },
                invalid: { color: '#ef4444' },
              },
            }}
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        isLoading={isProcessing}
        className="w-full py-5 rounded-full bg-slate-900 text-white font-black uppercase text-[11px] tracking-widest shadow-2xl"
      >
        Confirmar Ofrenda de ${amount}
      </Button>
    </form>
  );
};

export const TithingModal: React.FC<TithingModalProps> = ({ user, onClose, onSuccess, initialAmount }) => {
  const [amount, setAmount] = useState<string>(initialAmount?.toString() || '10');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<Tithe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStripe, setShowStripe] = useState(false);

  const PAYPAL_CLIENT_ID = process.env.VITE_PAYPAL_CLIENT_ID || "test";

  const handleSuccess = async (method: PaymentMethod, paidAmount: number) => {
    setIsProcessing(true);
    try {
      const tithe = await mockBackend.processTithe(user.id, paidAmount, method);
      setPaymentSuccess(tithe);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err) {
      setError("Error al registrar la ofrenda.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-white w-full max-w-md rounded-[3rem] p-12 text-center shadow-2xl">
          <div className="bg-emerald-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Ofrenda Confirmada</h3>
          <p className="text-slate-500 text-lg leading-relaxed mb-8">Gracias por tu generosidad. Tu luz ha sido multiplicada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 p-2 z-10 transition-colors">
          <X className="h-7 w-7" />
        </button>

        <div className="p-10 sm:p-14">
          <div className="text-center mb-10">
            <div className="bg-rose-50 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-rose-500 fill-current" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Siembra tu Fe</h2>
          </div>

          <div className="space-y-8">
            {!initialAmount && !showStripe && (
              <div className="grid grid-cols-3 gap-4">
                {['10', '25', '50'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-5 rounded-2xl font-black text-lg border-2 transition-all ${amount === val ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            )}

            {error && <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-2xl">{error}</div>}

            {!showStripe ? (
              <div className="space-y-6">
                <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD" }}>
                  <PayPalButtons
                    style={{ layout: "vertical", shape: "pill" }}
                    // Fix: Added currency_code: "USD" to the amount object to fix the type mismatch error on line 174.
                    createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { currency_code: "USD", value: amount } }] })}
                    onApprove={async (data, actions) => {
                      const details = await actions.order?.capture();
                      if (details) handleSuccess(PaymentMethod.PAYPAL, parseFloat(amount));
                    }}
                  />
                </PayPalScriptProvider>

                <div className="relative py-4 flex items-center">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black uppercase text-slate-300">o usa tu tarjeta</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <button 
                  onClick={() => setShowStripe(true)}
                  className="w-full flex items-center justify-center space-x-4 py-5 rounded-full bg-slate-100 text-slate-600 font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Pago con Tarjeta Real</span>
                </button>
              </div>
            ) : (
              <div className="animate-slide-up">
                <Elements stripe={stripePromise}>
                  <StripePaymentForm 
                    amount={amount} 
                    onPaymentSuccess={handleSuccess} 
                    onPaymentError={setError}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </Elements>
                <button onClick={() => setShowStripe(false)} className="w-full mt-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Volver</button>
              </div>
            )}

            <div className="pt-8 border-t border-slate-50 flex items-center justify-center space-x-3 text-slate-400 opacity-60">
              <Lock className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Transacción Cifrada de Extremo a Extremo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
