import React, { useEffect, useState } from 'react';
import { getHistory, formatBytes } from '../../services/store';
import { Copy, ExternalLink, Calendar, File } from 'lucide-react';

export const TransferList: React.FC = () => {
    const [transfers, setTransfers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getHistory();
            setTransfers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading history...</div>;

    return (
        <div className="bg-[#13131f] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Recent Transfers</h3>
                <span className="text-sm text-gray-400">{transfers.length} items</span>
            </div>

            {transfers.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <File className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-white font-medium mb-1">No transfers yet</h4>
                    <p className="text-gray-400 text-sm">Upload your first file to see it here.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Size</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transfers.map((t) => (
                                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center mr-3 text-blue-400">
                                                <File className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-white truncate max-w-[200px]">{t.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm font-mono">{formatBytes(t.totalSize || t.size || 0)}</td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        <div className="flex items-center">
                                            <Calendar className="w-3 h-3 mr-2 opacity-50" />
                                            {new Date(t.date || t.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => copyLink(t.url)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                title="Copy Link"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <a
                                                href={t.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                                                title="Open"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
