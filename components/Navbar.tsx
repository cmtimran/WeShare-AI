import React from 'react';
import { Cloud, Menu, User } from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
    onOpenPricing: () => void;
    onLogin: () => void;
    isLoggedIn: boolean;
    onLogout: () => void;
    onNavigate: (section: 'dashboard' | 'features' | 'security' | 'pricing' | 'home') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    onOpenPricing,
    onLogin,
    isLoggedIn,
    onLogout,
    onNavigate
}) => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-black/20 border-b border-white/10 transition-all duration-300">
            <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => onNavigate('home')}
            >
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <Cloud className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">WeShare AI</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
                {isLoggedIn && (
                    <button onClick={() => onNavigate('dashboard')} className="text-sm font-medium text-white/70 hover:text-white transition-colors">Dashboard</button>
                )}
                <button onClick={() => onNavigate('features')} className="text-sm font-medium text-white/70 hover:text-white transition-colors">Features</button>
                <button onClick={() => onNavigate('security')} className="text-sm font-medium text-white/70 hover:text-white transition-colors">Security</button>
                <button onClick={onOpenPricing} className="text-sm font-medium text-white/70 hover:text-white transition-colors">Pricing</button>

                <div className="h-5 w-px bg-white/20 mx-2"></div>

                {isLoggedIn ? (
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <Button variant="secondary" onClick={onLogout} className="!py-2 !px-4 !text-sm">Log out</Button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-4">
                        <button onClick={onLogin} className="text-sm font-medium text-white hover:text-white/80 transition-colors">Log in</button>
                        <Button variant="primary" onClick={onLogin} className="!py-2 !px-5 !text-sm !rounded-full shadow-lg shadow-blue-900/20">Sign up</Button>
                    </div>
                )}
            </div>

            <div className="md:hidden">
                <button className="p-2 text-white/80 hover:bg-white/10 rounded-lg transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
};
