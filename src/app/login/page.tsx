'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        name: isRegister ? name : undefined,
        action: isRegister ? 'register' : 'login',
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === 'CredentialsSignin'
          ? (isRegister ? 'Registration failed. Email may already be in use.' : 'Invalid email or password.')
          : result.error
        );
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 bg-white border border-[#E2DACB] rounded-lg text-[#1A1714] text-sm placeholder-[#8C8577]/50 focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]/40 transition-all";

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-6">
      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-7 h-7 rounded bg-[#1A1714] flex items-center justify-center">
            <span className="text-[#FDFBF7] text-[11px] font-bold tracking-tight">RD</span>
          </div>
          <span className="font-semibold text-lg text-[#1A1714] tracking-tight">Reel Delivery</span>
        </Link>

        {/* Card */}
        <div className="bg-white border border-[#E2DACB] rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-[#1A1714] mb-1 text-center">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-[#8C8577] mb-8 text-center" style={{ fontFamily: 'Georgia, serif' }}>
            {isRegister ? 'Start managing your film deliverables' : 'Sign in to your dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-[#8C8577] mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Michael Jefferson"
                  className={inputClass}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#8C8577] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8C8577] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-[#C0392B]/5 border border-[#C0392B]/15 rounded-lg p-3">
                <p className="text-[#C0392B] text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#1A1714] text-[#FDFBF7] font-medium rounded-lg text-sm hover:bg-[#2A2720] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading
                ? (isRegister ? 'Creating account...' : 'Signing in...')
                : (isRegister ? 'Create account' : 'Sign in')
              }
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E2DACB] text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-xs text-[#8C8577] hover:text-[#1A1714] transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#8C8577]/50 mt-6" style={{ fontFamily: 'Georgia, serif' }}>
          Free during beta. No credit card required.
        </p>
      </div>
    </div>
  );
}
