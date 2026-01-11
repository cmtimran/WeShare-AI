import React, { useState } from 'react';
import { User } from '../../types';
import { Sidebar } from './Sidebar';
import { TransferList } from './TransferList';
import { UserProfile } from './UserProfile';

interface DashboardProps {
    user: User;
    onLogout: () => void;
    onRefreshProfile: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onRefreshProfile }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'transfers' | 'profile'>('overview');

    return (
        <div className="flex h-[calc(100vh-80px)] pt-20"> {/* Offset for Fixed Navbar */}
            <Sidebar activeTab={activeTab} onSwitchTab={setActiveTab} />

            <div className="flex-1 overflow-y-auto bg-[#0a0a0f] p-8">
                <div className="max-w-5xl mx-auto">
                    <header className="mb-8 flex items-center justify-between md:hidden">
                        {/* Mobile Header Logic could go here */}
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    </header>

                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <h1 className="text-3xl font-bold text-white">Welcome back, {user.name || 'User'}</h1>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Summary Cards */}
                                <div className="bg-[#13131f] p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-gray-400 text-sm font-medium">Total Transfers</h3>
                                    <p className="text-3xl font-bold text-white mt-2">--</p>
                                    {/* We could fetch stats here too */}
                                </div>
                                <div className="bg-[#13131f] p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-gray-400 text-sm font-medium">Data Shared</h3>
                                    <p className="text-3xl font-bold text-white mt-2">--</p>
                                </div>
                                <div className="bg-[#13131f] p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-gray-400 text-sm font-medium">Current Plan</h3>
                                    <p className="text-3xl font-bold text-indigo-400 mt-2 uppercase">{user.plan}</p>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-white mt-12 mb-4">Recent Activity</h2>
                            <TransferList />
                        </div>
                    )}

                    {activeTab === 'transfers' && (
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-6">My Transfers</h1>
                            <TransferList />
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <UserProfile user={user} onRefresh={onRefreshProfile} />
                    )}
                </div>
            </div>
        </div>
    );
};
