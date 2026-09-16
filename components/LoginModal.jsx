'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { XIcon } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function LoginModal() {
  const { showLogin, setShowLogin, signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (!showLogin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        toast.success('Logged in');
      } else {
        await signUp(email, password, name);
        toast.success('Account created — check your email if confirmation is required');
      }
    } catch (err) {
      toast.error(err.message || 'Auth failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-xl text-slate-700"
      >
        <button
          type="button"
          onClick={() => setShowLogin(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <XIcon size={22} />
        </button>

        <h2 className="text-2xl font-semibold mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {mode === 'login' ? 'Sign in to shop and checkout' : 'Join Euro GoCart'}
        </p>

        {mode === 'signup' && (
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-3 outline-none focus:border-slate-400"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-3 outline-none focus:border-slate-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-4 outline-none focus:border-slate-400"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-full py-2.5 font-medium disabled:opacity-60"
        >
          {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign up'}
        </button>

        <p className="text-sm text-center mt-4 text-slate-500">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button type="button" className="text-indigo-600 font-medium" onClick={() => setMode('signup')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="text-indigo-600 font-medium" onClick={() => setMode('login')}>
                Login
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
