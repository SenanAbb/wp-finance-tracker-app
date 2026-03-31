'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestLogin, verifyOTP } from '@/lib/auth/client';

type LoginStep = 'phone' | 'otp' | 'loading' | 'error';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await requestLogin(phone);
      if (result.ok) {
        setStep('otp');
      } else {
        setError(result.error || 'Failed to request login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP(phone, otp);
      
      if (result.ok && result.accessToken && result.refreshToken) {
        // Guardar tokens en localStorage y cookies
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        
        document.cookie = `accessToken=${result.accessToken}; path=/; max-age=3600; SameSite=Strict`;
        document.cookie = `refreshToken=${result.refreshToken}; path=/; max-age=604800; SameSite=Strict`;
        
        // Redirigir al dashboard
        await router.push('/');
      } else {
        setError(result.error || 'Failed to verify OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Finance Tracker</h1>
            <p className="text-slate-600">Manage your finances with WhatsApp</p>
          </div>

          {/* Phone Input Step */}
          {step === 'phone' && (
            <form onSubmit={handleRequestLogin} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+34643326603"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Enter your phone number in E.164 format</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending OTP...' : 'Request OTP'}
              </button>
            </form>
          )}

          {/* OTP Input Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-2">
                  Verification Code
                </label>
                <p className="text-sm text-slate-600 mb-3">
                  We sent a 6-digit code to <span className="font-medium">{phone}</span>
                </p>
                <input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed text-center text-2xl tracking-widest font-mono"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                }}
                className="w-full py-2 px-4 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Back to phone number
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-sm mt-6">
          Your phone number is used to secure your account
        </p>
      </div>
    </div>
  );
}
