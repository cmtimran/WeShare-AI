import React, { useState } from 'react';
import { User } from '../../types';
import { updateUserPlan, updateUserPassword, updateUserSettings } from '../../services/store';
import { Settings, Lock, Bell, Clock, ChevronRight } from 'lucide-react';

interface UserProfileProps {
    user: User;
    onRefresh: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onRefresh }) => {
    const [loading, setLoading] = useState(false);

    // Password State
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [passMsg, setPassMsg] = useState('');

    // Settings State
    const [emailNotif, setEmailNotif] = useState(user.settings?.emailNotifications ?? true);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            await updateUserPlan(user.uid, 'pro');
            onRefresh();
            alert("Upgraded to Pro!");
        } catch (e) {
            alert("Upgrade failed");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassMsg('Updating...');
        try {
            await updateUserPassword(user.uid, oldPass, newPass);
            setPassMsg('Password changed successfully!');
            setOldPass('');
            setNewPass('');
        } catch (err: any) {
            setPassMsg(err.message || "Failed to update password");
        }
    };

    const handleToggleNotif = async () => {
        const newState = !emailNotif;
        setEmailNotif(newState);
        try {
            await updateUserSettings(user.uid, { emailNotifications: newState });
            onRefresh(); // To sync user state
        } catch (e) {
            setEmailNotif(!newState); // Revert
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header Card */}
            <div className="bg-[#13131f] rounded-2xl border border-white/5 p-8 relative overflow-hidden">
                <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{user.email.split('@')[0]}</h2>
                            <p className="text-gray-400 font-mono text-sm">{user.email}</p>
                        </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${user.plan === 'pro'
                            ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                            : 'bg-white/5 text-gray-400 border-white/10'
                        }`}>
                        {user.plan} Account
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Settings Column */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-gray-400" /> Account Settings
                    </h3>

                    <div className="bg-[#13131f] rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5">
                        {/* Email Notif */}
                        <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center">
                                <Bell className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-white font-medium text-sm">Email Notifications</p>
                                    <p className="text-gray-500 text-xs">Receive updates on transfers</p>
                                </div>
                            </div>
                            <button
                                onClick={handleToggleNotif}
                                className={`w-10 h-6 rounded-full p-1 transition-colors ${emailNotif ? 'bg-blue-600' : 'bg-gray-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailNotif ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Default Expiry (Mock) */}
                        <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-not-allowed opacity-50">
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-white font-medium text-sm">Default Expiry</p>
                                    <p className="text-gray-500 text-xs">7 Days (Standard)</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </div>
                    </div>

                    {/* Upgrade Banner */}
                    {user.plan !== 'pro' && (
                        <div className="bg-gradient-to-r from-indigo-900/50 to-blue-900/50 border border-indigo-500/30 rounded-xl p-6">
                            <h4 className="font-bold text-white mb-2">Upgrade to Pro</h4>
                            <p className="text-sm text-indigo-200 mb-4">Unlock 1TB storage and permanent links.</p>
                            <button
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="w-full py-2 bg-white text-indigo-900 font-bold rounded-lg text-sm hover:bg-indigo-50 transition-colors"
                            >
                                {loading ? 'Processing...' : 'Upgrade Now'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Security Column */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-gray-400" /> Security
                    </h3>

                    <div className="bg-[#13131f] rounded-xl border border-white/5 p-6">
                        <h4 className="text-white font-medium mb-4">Change Password</h4>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-500 font-bold mb-1.5">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={oldPass}
                                    onChange={e => setOldPass(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-gray-500 font-bold mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newPass}
                                    onChange={e => setNewPass(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {passMsg && (
                                <p className={`text-xs ${passMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                                    {passMsg}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg text-sm border border-white/10 transition-colors"
                            >
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};
