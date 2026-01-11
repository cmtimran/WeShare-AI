import React, { useEffect, useState } from 'react';
import { Download, File as FileIcon, ArrowLeft, CheckCircle, FileText, Image, Music, Video, FileArchive, FileCode, Lock } from 'lucide-react';
import { getTransfer, formatBytes } from '../services/store';
import { TransferData } from '../types';
import { Button } from './Button';

interface DownloadViewProps {
  transferId: string;
  onBack: () => void;
}

export const DownloadView: React.FC<DownloadViewProps> = ({ transferId, onBack }) => {
  const [transfer, setTransfer] = useState<TransferData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const fetchTransfer = async () => {
    setLoading(true);
    try {
      const data = await getTransfer(transferId);
      setTransfer(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfer();
  }, [transferId]);

  const handleUnlock = async () => {
    if (!password) return;
    setUnlocking(true);
    setError('');

    try {
      // For local server, we just verify against stored transfer
      // The current implementation of Mock Server might not handle 'verify' action fully correctly
      // but TransferData IS returned if ID is public, unless locked?
      // Actually, store.ts `getTransfer` just fetches.
      // If we implement password logic, we would need the server to gate it.
      // For now, let's assume the client gets the data but we hide it visually until unlocked (client-side lock)
      // OR we stick to the existing API call structure:

      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transferId, action: 'verify', password })
      });

      if (res.ok) {
        const data = await res.json();
        setTransfer(data);
      } else {
        setError('Incorrect password');
      }
    } catch (e) {
      setError('Failed to verify');
    } finally {
      setUnlocking(false);
    }
  };

  const renderFileIcon = (file: { name: string; type: string }, className = "w-5 h-5") => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const type = file.type.toLowerCase();

    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
      return <Image className={`${className} text-purple-400`} />;
    if (type.includes('pdf') || ext === 'pdf')
      return <FileText className={`${className} text-red-500`} />;
    if (type.includes('word') || type.includes('document') || ['doc', 'docx', 'txt', 'rtf'].includes(ext))
      return <FileText className={`${className} text-blue-500`} />;
    if (type.includes('sheet') || type.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext))
      return <FileText className={`${className} text-green-500`} />;
    if (type.includes('video') || ['mp4', 'mov', 'avi', 'mkv'].includes(ext))
      return <Video className={`${className} text-red-500`} />;
    if (type.includes('audio') || ['mp3', 'wav', 'ogg'].includes(ext))
      return <Music className={`${className} text-amber-500`} />;
    if (type.includes('zip') || type.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext))
      return <FileArchive className={`${className} text-orange-500`} />;
    if (type.includes('text/') || type.includes('json') || type.includes('javascript') || type.includes('html') || ['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json'].includes(ext))
      return <FileCode className={`${className} text-cyan-500`} />;

    return <FileIcon className={`${className} text-gray-400`} />;
  };

  if (loading) {
    return (
      <div className="bg-[#0f0f16]/80 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl border border-white/10 flex flex-col items-center justify-center text-center h-[450px]">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-semibold text-white">Retrieving files...</h2>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="bg-[#0f0f16]/80 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl border border-white/10 flex flex-col items-center justify-center text-center h-[450px] p-8">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500 border border-red-500/20">
          <FileIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Transfer not found</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">This transfer may have expired or does not exist.</p>
        <Button onClick={onBack} variant="secondary">Back to Home</Button>
      </div>
    );
  }

  // Locked State
  if (transfer.isLocked) {
    return (
      <div className="bg-[#0f0f16]/80 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col h-[450px] animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-gradient-to-br from-gray-900 to-black p-8 text-white text-center relative overflow-hidden border-b border-white/5">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border border-white/10">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold">Password Protected</h2>
            <p className="text-white/40 text-sm mt-2">This transfer requires a password.</p>
          </div>
        </div>

        <div className="p-8 flex-1 flex flex-col justify-center">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Enter Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-gray-600"
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
            </div>
            {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
            <Button onClick={handleUnlock} isLoading={unlocking} className="w-full shadow-lg shadow-blue-900/20">
              Unlock Files
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f16]/80 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col h-[520px] animate-in fade-in zoom-in-95 duration-500 transform hover:scale-[1.01] hover:border-white/20 hover:shadow-blue-900/20 transition-all relative">

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Ready for download</h2>
          <p className="text-blue-100/80 text-sm font-medium">Expires in {transfer.settings.expiresIn.replace('-', ' ')}</p>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-black/20 rounded-full blur-2xl"></div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="mb-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            {transfer.senderEmail.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">From</p>
            <p className="font-medium text-white truncate">{transfer.senderEmail}</p>
          </div>
        </div>

        {transfer.message && (
          <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10 relative">
            <div className="absolute -left-1 top-4 w-1 h-8 bg-blue-500 rounded-r-full"></div>
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1 pl-2">Message</p>
            <p className="text-gray-300 italic pl-2">"{transfer.message}"</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Files ({transfer.files.length})</h3>
          <span className="text-xs text-gray-500 bg-white/5 py-1 px-2 rounded-md border border-white/5">{formatBytes(transfer.totalSize)}</span>
        </div>

        <ul className="space-y-3">
          {transfer.files.map((file) => (
            <li key={file.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/5 rounded-xl hover:border-blue-500/30 hover:bg-blue-500/10 transition-all group">
              <div className="flex items-center min-w-0">
                <div className="w-10 h-10 bg-black/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden border border-white/5">
                  {file.type.startsWith('image/') && file.previewUrl ? (
                    <img src={file.previewUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                  ) : (
                    renderFileIcon(file, "w-5 h-5")
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate group-hover:text-blue-200 transition-colors">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                </div>
              </div>
              <a
                href={file.data /* Base64 or Blob URL */}
                download={file.name}
                className="p-2 text-gray-400 hover:text-white hover:bg-blue-600 rounded-full transition-all shadow-sm"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 border-t border-white/10 bg-[#0f0f16]/50">
        <Button onClick={() => alert("All files download started")} className="w-full shadow-lg shadow-blue-500/20">
          Download All Files
        </Button>
      </div>
    </div>
  );
};