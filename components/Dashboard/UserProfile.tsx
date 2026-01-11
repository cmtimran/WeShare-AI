import React, { useState } from 'react';
import { User } from '../../types';
import { updateUserPlan } from '../../services/store';

interface UserProfileProps {
    user: User;
    onRefresh: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onRefresh }) => {
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#13131f] rounded-2xl border border-white/5 p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">My Profile</h2>
                        <p className="text-gray-400">{user.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.plan === 'pro'
                            ? 'bg-gradient-to-r from-amber-200 to-yellow-400 text-black'
                            : 'bg-white/10 text-gray-300'
                        }`}>
                        {user.plan} Plan
                    </span>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Member Since</p>
                        <p className="text-white font-mono">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Account ID</p>
                        <p className="text-white font-mono text-xs truncate" title={user.uid}>{user.uid}</p>
                    </div>
                </div>
            </div>

            {user.plan !== 'pro' && (
                <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-white/20 transition-colors"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h3>
                        <p className="text-indigo-100 mb-6 max-w-md">
                            Get generic unlimited storage, 4K video previews, and permanent file retention.
                            Support the development of WeShare AI.
                        </p>
                        <button
                            onClick={handleUpgrade}
                            disabled={loading}
                            className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Upgrade Now - $9.99'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
