'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ArrowRight, ArrowLeft, Home, ShieldCheck, User, Lock, Mail, Eye, EyeOff, Sparkles } from 'lucide-react';

const demoFamilies = [
  { id: 'sharma', name: 'Sharma Family', color: 'bg-blue-400', icon: '🏠', city: 'Noida' },
  { id: 'patel', name: 'Patel Family', color: 'bg-emerald-400', icon: '🏡', city: 'Ahmedabad' },
  { id: 'kumar', name: 'Kumar Family', color: 'bg-amber-400', icon: '🏢', city: 'Patna' },
  { id: 'singh', name: 'Singh Family', color: 'bg-purple-400', icon: '🏰', city: 'Amritsar' },
  { id: 'verma', name: 'Verma Family', color: 'bg-rose-400', icon: '🏘️', city: 'Indore' },
];

type AuthMode = 'demo' | 'login' | 'signup';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('demo');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    language: 'en'
  });

  const handleDemoLogin = async (username: string) => {
    setLoading(username);
    setError(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password: 'REMOVED_DEMO_PASSWORD' }),
      });

      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('household_id', data.household_id);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('login');
    setError(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: loginForm.email, password: loginForm.password }),
      });

      if (!response.ok) throw new Error('Invalid credentials');
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('household_id', data.household_id);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(null);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading('signup');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const createRes = await fetch(`${API_URL}/api/v1/households`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name,
          username: signupForm.email.split('@')[0],
          password: signupForm.password,
          primary_language: signupForm.language,
        }),
      });

      if (!createRes.ok) throw new Error('Signup failed');

      const loginRes = await fetch(`${API_URL}/api/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: signupForm.email.split('@')[0], password: signupForm.password }),
      });

      if (!loginRes.ok) throw new Error('Login after signup failed');
      const data = await loginRes.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('household_id', data.household_id);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6fd] dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-14 h-14 bg-blue-400 rounded-2xl flex items-center justify-center shadow-[6px_6px_12px_rgba(96,165,250,0.4)]">
              <Activity className="text-white" size={28} strokeWidth={3} />
            </div>
            <span className="text-3xl font-black tracking-tight">WellSync</span>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'demo' && (
            <motion.div
              key="demo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-2xl font-black mb-2 text-center">Demo Families</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-center">
                Click a family to explore with pre-seeded health records
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {demoFamilies.map((family, idx) => (
                  <motion.button
                    key={family.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleDemoLogin(family.id)}
                    disabled={!!loading}
                    className="group relative flex flex-col items-center p-6 rounded-3xl bg-[#f3f6fd] dark:bg-slate-800 shadow-[6px_6px_12px_rgba(0,0,0,0.05),-6px_-6px_12px_rgba(255,255,255,0.8)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                  >
                    <div className={`w-14 h-14 ${family.color} rounded-2xl flex items-center justify-center mb-4 text-2xl`}>
                      {family.icon}
                    </div>
                    <h3 className="font-bold text-sm">{family.name}</h3>
                    <p className="text-xs text-slate-400">{family.city}</p>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => setMode('login')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-colors"
                >
                  <User size={18} /> Login
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-colors"
                >
                  <Sparkles size={18} /> Sign Up
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-black mb-6 text-center">Welcome Back</h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Email or Username</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading === 'login'}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading === 'login' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Login <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => { setMode('signup'); setError(null); }}
                    className="text-blue-500 font-bold hover:underline"
                  >
                    Don&apos;t have an account? Sign up
                  </button>
                </div>
              </div>

              <button
                onClick={() => { setMode('demo'); setError(null); }}
                className="w-full mt-4 py-3 text-slate-500 font-bold flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> Back to Demo
              </button>
            </motion.div>
          )}

          {mode === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-black mb-6 text-center">Create Account</h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Family Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g., Sharma Family"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Preferred Language</label>
                    <select
                      value={signupForm.language}
                      onChange={(e) => setSignupForm({ ...signupForm, language: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="mr">Marathi</option>
                      <option value="gu">Gujarati</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="At least 6 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Re-enter password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading === 'signup'}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading === 'signup' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Create Account <Sparkles size={18} /></>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => { setMode('login'); setError(null); }}
                    className="text-emerald-500 font-bold hover:underline"
                  >
                    Already have an account? Login
                  </button>
                </div>
              </div>

              <button
                onClick={() => { setMode('demo'); setError(null); }}
                className="w-full mt-4 py-3 text-slate-500 font-bold flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold hover:text-blue-500 transition-colors"
          >
            <Home size={18} /> Back to Landing
          </button>
        </div>
      </div>
      
      <div className="fixed bottom-6 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-full shadow-lg border border-white/50 dark:border-slate-700/50">
        <ShieldCheck className="text-emerald-500" size={16} />
        <span className="text-xs font-bold text-slate-500">Secure JWT Auth</span>
      </div>
    </div>
  );
}
