import React, { useState } from 'react';
import { User, PaymentMethod } from '../types';
import { mockBackend } from '../services/mockBackend';
import { Button } from './Button';
import { X, CreditCard, Smartphone, Bitcoin, Heart, ShieldCheck, CheckCircle, Wallet, QrCode } from 'lucide-react';

interface TithingModalProps {
  user: User;
  onClose: () => void;
}

export const TithingModal: React.FC<TithingModalProps> = ({ user, onClose }) => {
  const [step, setStep] = useState<'amount' | 'method' | 'processing' | 'success'>('amount');
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [cryptoType, setCryptoType] = useState<'BTC' | 'ETH' | 'USDT'>('BTC');

  const presetAmounts = [10, 50, 100, 500];

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setAmount(parseFloat(e.target.value) || 0);
  };

  const handlePresetClick = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleContinue = () => {
    if (amount > 0) setStep('method');
  };

  const handlePayment = async () => {
    if (!method) return;
    setStep('processing');
    try {
      await mockBackend.processTithe(user.id, amount, method);
      setStep('success');
    } catch (e) {
      console.error(e);
      // Handle error visually if needed
      setStep('amount');
    }
  };

  const renderMethodIcon = (m: PaymentMethod) => {
    switch (m) {
      case PaymentMethod.CREDIT_CARD: return <CreditCard className="h-6 w-6" />;
      case PaymentMethod.PAYPAL: return <Wallet className="h-6 w-6" />;
      case PaymentMethod.CRYPTO: return <Bitcoin className="h-6 w-6" />;
      case PaymentMethod.APPLE_PAY: return <Smartphone className="h-6 w-6" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-fade-in">
        
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-rose-500 fill-current" />
            <h3 className="font-bold text-slate-800">Give Offering / Tithe</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {step === 'amount' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-slate-600 mb-4">Select an amount to give</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {presetAmounts.map((val) => (
                    <button
                      key={val}
                      onClick={() => handlePresetClick(val)}
                      className={`p-4 rounded-xl border text-lg font-bold transition-all ${
                        amount === val 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100' 
                          : 'border-slate-200 hover:border-indigo-200 text-slate-700'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Other Amount"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium"
                  />
                </div>
              </div>
              <Button onClick={handleContinue} disabled={amount <= 0} className="w-full py-3 text-lg">
                Continue
              </Button>
            </div>
          )}

          {step === 'method' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                 <h4 className="font-bold text-slate-700">Payment Method</h4>
                 <button onClick={() => setStep('amount')} className="text-sm text-indigo-600 hover:underline">Change Amount (${amount})</button>
              </div>

              <div className="space-y-3">
                {Object.values(PaymentMethod).map((m) => (
                  <div key={m}>
                    <button
                      onClick={() => setMethod(m)}
                      className={`w-full flex items-center p-4 rounded-xl border transition-all ${
                        method === m
                          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-200'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-full mr-4 ${method === m ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                        {renderMethodIcon(m)}
                      </div>
                      <span className="font-medium text-slate-800">{m}</span>
                      {method === m && <CheckCircle className="ml-auto h-5 w-5 text-indigo-600" />}
                    </button>

                    {/* Conditional Rendering for Method Details */}
                    {method === m && m === PaymentMethod.CREDIT_CARD && (
                      <div className="mt-2 ml-2 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
                        <input type="text" placeholder="Card Number" className="w-full mb-2 px-3 py-2 border rounded text-sm" />
                        <div className="flex gap-2">
                          <input type="text" placeholder="MM/YY" className="w-1/2 px-3 py-2 border rounded text-sm" />
                          <input type="text" placeholder="CVC" className="w-1/2 px-3 py-2 border rounded text-sm" />
                        </div>
                      </div>
                    )}

                    {method === m && m === PaymentMethod.CRYPTO && (
                      <div className="mt-2 ml-2 p-4 bg-slate-900 rounded-lg border border-slate-800 animate-fade-in text-white">
                        <div className="flex gap-2 mb-4">
                           {['BTC', 'ETH', 'USDT'].map(c => (
                             <button 
                                key={c}
                                onClick={(e) => { e.stopPropagation(); setCryptoType(c as any); }}
                                className={`px-3 py-1 text-xs rounded-full ${cryptoType === c ? 'bg-indigo-600' : 'bg-slate-700'}`}
                             >
                               {c}
                             </button>
                           ))}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="bg-white p-2 rounded">
                            <QrCode className="h-16 w-16 text-black" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs text-slate-400 mb-1">Send {cryptoType} to:</p>
                            <p className="text-xs font-mono bg-slate-800 p-2 rounded truncate">
                              0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={handlePayment} disabled={!method} className="w-full py-3 text-lg bg-emerald-600 hover:bg-emerald-700">
                Complete Donation
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-6"></div>
              <h3 className="text-xl font-bold text-slate-800">Processing...</h3>
              <p className="text-slate-500">Securely transferring your gift.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Thank You!</h3>
              <p className="text-slate-600 mb-6">
                Your tithe of <strong>${amount.toFixed(2)}</strong> via {method} has been received.
                <br/>
                "God loves a cheerful giver." (2 Cor 9:7)
              </p>
              <Button onClick={onClose} className="w-full">
                Return to Feed
              </Button>
            </div>
          )}

        </div>
        
        {/* Footer Security Note */}
        {(step === 'amount' || step === 'method') && (
          <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400 flex items-center justify-center">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Secure SSL Encrypted Transaction
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
