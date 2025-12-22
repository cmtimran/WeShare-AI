import React, { useEffect, useState } from 'react';
import { Download, File as FileIcon, ArrowLeft, CheckCircle, FileText, Image, Music, Video, FileArchive, FileCode } from 'lucide-react';
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

  useEffect(() => {
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
    fetchTransfer();
  }, [transferId]);

  const renderFileIcon = (file: { name: string; type: string }, className = "w-5 h-5") => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const type = file.type.toLowerCase();
    
    if (type.includes('image') || ['jpg','jpeg','png','gif','webp','svg'].includes(ext)) 
        return <Image className={`${className} text-purple-600`} />;
    if (type.includes('pdf') || ext === 'pdf') 
        return <FileText className={`${className} text-red-500`} />;
    if (type.includes('word') || type.includes('document') || ['doc','docx','txt','rtf'].includes(ext)) 
        return <FileText className={`${className} text-blue-600`} />;
    if (type.includes('sheet') || type.includes('excel') || ['xls','xlsx','csv'].includes(ext)) 
        return <FileText className={`${className} text-green-600`} />;
    if (type.includes('video') || ['mp4','mov','avi','mkv'].includes(ext)) 
        return <Video className={`${className} text-red-600`} />;
    if (type.includes('audio') || ['mp3','wav','ogg'].includes(ext)) 
        return <Music className={`${className} text-amber-500`} />;
    if (type.includes('zip') || type.includes('compressed') || ['zip','rar','7z','tar','gz'].includes(ext)) 
        return <FileArchive className={`${className} text-orange-600`} />;
    if (type.includes('text/') || type.includes('json') || type.includes('javascript') || type.includes('html') || ['js','ts','tsx','jsx','html','css','json'].includes(ext)) 
        return <FileCode className={`${className} text-cyan-600`} />;
    
    return <FileIcon className={`${className} text-gray-500`} />;
  };

  if (loading) {
    return (
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center text-center h-[500px]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-800">Retrieving files...</h2>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center text-center h-[500px]">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
          <FileIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Transfer not found</h2>
        <p className="text-gray-500 mb-8">This transfer may have expired or does not exist.</p>
        <Button onClick={onBack} variant="secondary">Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-blue-600 p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Ready when you are</h2>
          <p className="text-blue-100 text-sm">Transfer expires in {transfer.settings.expiresIn.replace('-', ' ')}</p>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">From</p>
          <p className="font-medium text-gray-800">{transfer.senderEmail}</p>
        </div>

        {transfer.message && (
          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Message</p>
            <p className="text-gray-700 italic">"{transfer.message}"</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Files ({transfer.files.length})</h3>
          <span className="text-xs text-gray-500">{formatBytes(transfer.totalSize)} total</span>
        </div>

        <ul className="space-y-3">
          {transfer.files.map((file) => (
            <li key={file.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
               <div className="flex items-center min-w-0">
                 <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3 text-gray-600 flex-shrink-0 overflow-hidden">
                    {file.type.startsWith('image/') && file.previewUrl ? (
                      <img src={file.previewUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      renderFileIcon(file, "w-5 h-5")
                    )}
                 </div>
                 <div className="min-w-0">
                   <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                   <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                 </div>
               </div>
               <a 
                 href={file.data /* Base64 string */} 
                 download={file.name}
                 className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                 title="Download"
               >
                 <Download className="w-4 h-4" />
               </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 border-t border-gray-100 flex gap-4">
        <Button onClick={() => alert("This checks all items in a real app!")} className="flex-1">
          Download all
        </Button>
      </div>
    </div>
  );
};