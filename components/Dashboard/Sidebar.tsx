import React from 'react';
import { LayoutDashboard, History, User, CreditCard } from 'lucide-react';

interface SidebarProps {
    activeTab: 'overview' | 'transfers' | 'profile';
    onSwitchTab: (tab: 'overview' | 'transfers' | 'profile') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSwitchTab }) => {
    const menu = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'transfers', label: 'My Transfers', icon: History },
        { id: 'profile', label: 'Profile & Plan', icon: User },
    ];

    return (
        <div className="w-64 bg-[#13131f] border-r border-white/5 p-6 flex flex-col h-full hidden md:flex">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-8">
                Dashboard
            </h2>
            <nav className="space-y-2">
                {menu.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSwitchTab(item.id as any)}
                            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'}`} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5">
                    <h3 className="text-sm font-semibold text-white mb-1">WeShare Pro</h3>
                    <p className="text-xs text-gray-400 mb-3">Unlock 1TB storage & permanent links.</p>
                    <button className="w-full py-2 text-xs font-bold bg-white text-black rounded-lg hover:bg-gray-200 transition-colors">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
};
