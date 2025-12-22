import React from 'react';
import { User } from '../types';

export type ModalType = 'help' | 'about' | 'pricing' | 'terms' | 'cookies' | 'auth_login' | 'auth_signup' | 'profile' | null;

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onOpenModal: (type: ModalType) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenModal }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.hash = ''}>
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
           <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
           </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">WeShare AI</span>
      </div>

      <nav className="hidden md:flex items-center space-x-6">
        <button onClick={() => onOpenModal('help')} className="text-sm font-medium text-gray-600 hover:text-gray-900">Help</button>
        <button onClick={() => onOpenModal('about')} className="text-sm font-medium text-gray-600 hover:text-gray-900">About</button>
        <button onClick={() => onOpenModal('pricing')} className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</button>
        {user ? (
          <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
             <div className="flex flex-col items-end">
                <button onClick={() => onOpenModal('profile')} className="text-sm font-medium text-gray-900 hover:underline">{user.name}</button>
                {user.plan === 'pro' && <span className="text-[10px] font-bold text-green-600 tracking-wider">PRO</span>}
             </div>
             <button onClick={onLogout} className="text-sm font-medium text-red-600 hover:text-red-700">
               Sign out
             </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
            <button onClick={() => onOpenModal('auth_login')} className="text-sm font-medium text-gray-900 hover:text-gray-700">
              Log in
            </button>
            <button onClick={() => onOpenModal('auth_signup')} className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              Sign up
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};