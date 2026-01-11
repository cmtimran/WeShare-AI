import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { User } from '../types';
import { Button } from './Button';
import { updateUserPlan } from '../services/store';

export const HelpContent = () => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-lg text-white mb-2">How long are files stored?</h3>
      <p className="text-gray-400 leading-relaxed">By default, transfers are available for 7 days. You can change this to 1 day or store them indefinitely if you create a Pro account.</p>
    </div>
    <div>
      <h3 className="font-semibold text-lg text-white mb-2">Is it secure?</h3>
      <p className="text-gray-400 leading-relaxed">Yes. We use TLS encryption for all transfers. You can also add password protection to any transfer for an extra layer of security.</p>
    </div>
    <div>
      <h3 className="font-semibold text-lg text-white mb-2">How does the AI feature work?</h3>
      <p className="text-gray-400 leading-relaxed">We use Google Gemini to analyze your file names and images (if applicable) to auto-generate a professional message context for your recipient, saving you time.</p>
    </div>
  </div>
);

export const AboutContent = () => (
  <div className="space-y-6">
    <p className="text-lg text-gray-400 leading-relaxed">
      <span className="font-bold text-white">WeShare AI</span> is a next-generation file sharing platform designed to make digital delivery effortless and intelligent.
    </p>
    <p className="text-gray-400 leading-relaxed">
      Born from the idea that file transfer shouldn't just be about moving bytes, but about conveying context. We integrate advanced AI to bridge the gap between "Here's a file" and "Here's what this file is about".
    </p>
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
      <h4 className="font-semibold text-white mb-4">Our Stack</h4>
      <ul className="grid grid-cols-2 gap-2 text-sm text-gray-400">
        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>React & TypeScript</li>
        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Tailwind CSS</li>
        <li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>Google Gemini API</li>
        <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Firebase</li>
      </ul>
    </div>
  </div>
);

interface PricingContentProps {
  user: User | null;
  onUpgrade: () => void;
  onLogin: () => void;
}

export const PricingContent: React.FC<PricingContentProps> = ({ user, onUpgrade, onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    // Simulate payment processing
    setTimeout(async () => {
      await updateUserPlan(user.uid, 'pro');
      setLoading(false);
      onUpgrade(); // Refresh user state
    }, 1500);
  };

  const isPro = user?.plan === 'pro';

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Free Plan */}
        <div className={`p-6 rounded-2xl border ${!isPro ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
          <h3 className="text-xl font-bold mb-2 text-white">Free</h3>
          <p className="text-3xl font-bold mb-6 text-white">$0<span className="text-sm font-normal text-gray-500">/mo</span></p>
          <ul className="space-y-3 mb-6">
            {['2 GB transfer size', 'Files stored for 7 days', 'Basic AI summaries', 'Email support'].map(i => (
              <li key={i} className="flex items-center text-sm text-gray-400">
                <Check className="w-4 h-4 text-green-500 mr-3" /> {i}
              </li>
            ))}
          </ul>
          {!isPro && user && (
            <button className="w-full py-2 bg-white/10 text-white/50 rounded-lg text-sm font-medium cursor-default">Current Plan</button>
          )}
        </div>

        {/* Pro Plan */}
        <div className={`p-6 rounded-2xl border relative overflow-hidden ${isPro ? 'border-green-500/50 bg-green-500/10' : 'border-blue-500/50 bg-gradient-to-br from-blue-900/40 to-purple-900/40'}`}>
          {!isPro && <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>}
          {isPro && <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center"><Star className="w-3 h-3 mr-1" /> ACTIVE</div>}

          <h3 className="text-xl font-bold mb-2 text-white">Pro</h3>
          <p className="text-3xl font-bold mb-6 text-white">$10<span className="text-sm font-normal text-gray-400">/mo</span></p>
          <ul className="space-y-3 mb-6">
            {['200 GB transfer size', 'Permanent storage', 'Advanced AI analysis', 'Custom branding', 'Password protection'].map(i => (
              <li key={i} className="flex items-center text-sm text-gray-300">
                <Check className="w-4 h-4 text-blue-400 mr-3" /> {i}
              </li>
            ))}
          </ul>

          {user ? (
            isPro ? (
              <button className="w-full py-2 bg-green-600/20 text-green-400 border border-green-600/50 rounded-lg text-sm font-medium cursor-default">Plan Active</button>
            ) : (
              <Button
                onClick={handleUpgrade}
                isLoading={loading}
                className="w-full py-2 text-sm !bg-blue-600 hover:!bg-blue-500 border-none"
              >
                Upgrade Now
              </Button>
            )
          ) : (
            <button
              onClick={onLogin}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center border border-white/5"
            >
              Log in to upgrade
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProfileContent: React.FC<{ user: User }> = ({ user }) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/10 shadow-lg">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{user.email}</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${user.plan === 'pro' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/70 border border-white/10'}`}>
          {user.plan === 'pro' ? 'PRO PLAN' : 'FREE PLAN'}
        </span>
      </div>
    </div>

    <div className="border-t border-white/10 pt-4">
      <h4 className="font-semibold mb-2 text-white">Account Details</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Member since</p>
          <p className="font-medium text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-500">User ID</p>
          <p className="font-medium font-mono text-xs truncate text-gray-300" title={user.uid}>{user.uid}</p>
        </div>
      </div>
    </div>
  </div>
);

export const LegalContent = ({ type }: { type: 'terms' | 'cookies' | 'privacy' }) => (
  <div className="space-y-4 text-sm text-gray-400">
    <p>Last updated: {new Date().toLocaleDateString()}</p>
    <p>
      {type === 'terms'
        ? "By using WeShare AI, you agree to these Terms. Please read them carefully. We provide this service 'as is' without warranties of any kind."
        : type === 'cookies'
          ? "We use cookies to improve your experience. By using our site, you agree to our use of cookies for analytics and personalization."
          : "Your privacy is important to us. We only collect data necessary to provide and improve our services. We do not sell your personal data."}
    </p>
    <h4 className="font-bold text-gray-200 mt-4">1. General</h4>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

    <h4 className="font-bold text-gray-200 mt-4">2. Usage</h4>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

    <p className="italic text-gray-600 mt-4 border-t border-white/10 pt-4">
      (This is a demonstration application. No real legal terms apply other than standard open source licenses for the code provided.)
    </p>
  </div>
);