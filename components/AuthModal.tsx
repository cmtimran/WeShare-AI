import React, { useState } from 'react';
import { Button } from './Button';
import { loginUser, registerUser } from '../services/store';

interface AuthModalProps {
  mode: 'login' | 'signup';
  onSuccess: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ mode, onSuccess, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';

      if (msg.includes('Invalid credentials') || msg.includes('auth/invalid-credential')) {
        setError("Invalid email or password.");
      } else if (msg.includes('User already exists') || msg.includes('auth/email-already-in-use')) {
        setError("Email already in use.");
      } else if (msg.includes('weak-password')) {
        setError("Password should be at least 6 characters.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-2 text-white">{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
      <p className="text-gray-400 mb-8">{mode === 'login' ? 'Log in to manage your transfers.' : 'Join WeShare AI for enhanced features.'}</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
          <input
            type="email"
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <Button className="w-full mt-4" type="submit" isLoading={loading}>
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </Button>
      </form>

      <div className="mt-6 text-sm text-gray-400">
        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => {
            setError('');
            onSwitchMode(mode === 'login' ? 'signup' : 'login');
          }}
          className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </div>
    </div>
  );
};