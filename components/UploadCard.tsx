import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, File as FileIcon, Settings, Wand2, Lock, Sparkles, Loader2, ArrowLeft, Mail, Link as LinkIcon, Calendar, Shield, User as UserIcon, FileText, Image, Music, Video, FileArchive, FileCode } from 'lucide-react';
import { UploadedFile, TransferData, TransferSettings, User } from '../types';
import { Button } from './Button';
import { generateSmartMessage } from '../services/geminiService';
import { saveTransfer, formatBytes, fileToBase64 } from '../services/store';

interface UploadCardProps {
  onTransferComplete: (id: string) => void;
  currentUser: User | null;
  onOpenPricing: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onTransferComplete, currentUser, onOpenPricing }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [message, setMessage] = useState('');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || '');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [mode, setMode] = useState<'email' | 'link'>('email');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [settings, setSettings] = useState<TransferSettings>({ expiresIn: '7-days', passwordProtected: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setSenderEmail(currentUser.email);
    }
  }, [currentUser]);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = async (newFiles: File[]) => {
    // Process files (convert to base64 for Firestore storage - demo only)
    const processedFiles: UploadedFile[] = [];
    
    for (const file of newFiles) {
        // Strict limit: 750KB to allow for Base64 overhead within 1MB Firestore limit
        if (file.size > 750000) { 
            alert(`File ${file.name} is too large for this demo (limit 750KB).`);
            continue;
        }

        const base64Data = await fileToBase64(file);
        
        processedFiles.push({
            id: Math.random().toString(36).substring(7),
            name: file.name,
            size: file.size,
            type: file.type,
            data: base64Data,
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        });
    }

    setFiles(prev => [...prev, ...processedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const getFilesForGemini = () => {
    return files.map(f => ({
       ...f,
       file: new File([], f.name, { type: f.type }) 
    }));
  };

  const handleSmartMessage = async () => {
    if (files.length === 0) return;
    setIsGeneratingMessage(true);
    const generated = await generateSmartMessage(getFilesForGemini() as any, currentUser?.name || 'Me');
    setMessage(generated);
    setIsGeneratingMessage(false);
  };

  const handlePreCheck = () => {
    if (files.length === 0) return;
    if (mode === 'email' && (!senderEmail || !recipientEmail)) return;
    
    setShowConfirmation(true);
  };

  const executeTransfer = async () => {
    const totalSize = files.reduce((acc, curr) => acc + curr.size, 0);
    // Firestore limit is 1MB. Base64 increases size by ~33%. 
    // 750KB * 1.33 = ~1MB.
    const MAX_SAFE_SIZE = 750000;
    
    if (totalSize > MAX_SAFE_SIZE) {
        alert(`Total transfer size (${formatBytes(totalSize)}) exceeds the safe limit of ~750KB for this demo (Firestore 1MB doc limit). Please remove some files.`);
        return;
    }

    setShowConfirmation(false);
    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev; 
        return Math.min(prev + Math.random() * 15, 90);
      });
    }, 400);

    try {
        const transferData: TransferData = {
          files,
          message,
          senderEmail,
          recipientEmail: mode === 'email' ? recipientEmail : undefined,
          settings,
          createdAt: Date.now(),
          totalSize
        };

        // Wrap saveTransfer in a timeout to prevent infinite "stuck" state
        const uploadPromise = saveTransfer(transferData);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request timed out")), 15000)
        );

        const transferId = await Promise.race([uploadPromise, timeoutPromise]) as string;
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTimeout(() => {
          onTransferComplete(transferId);
        }, 600);
        
    } catch (e: any) {
        clearInterval(progressInterval);
        console.error("Upload failed", e);
        
        let errorMessage = "Upload failed. ";
        
        if (e.message.includes("timed out")) {
            errorMessage += "The server took too long to respond. Please check your internet connection.";
        } else if (e.code === 'permission-denied') {
            errorMessage += "Permission denied. Please check your Firebase rules.";
        } else if (e.code === 'invalid-argument' || e.toString().includes('large')) {
            errorMessage += "Data too large for the database.";
        } else {
            errorMessage += "Please ensure your 'firebaseConfig.ts' is updated with valid keys.";
        }

        alert(errorMessage);
        setIsUploading(false);
        setUploadProgress(0);
    }
  };

  const totalSize = files.reduce((acc, curr) => acc + curr.size, 0);
  const isPro = currentUser?.plan === 'pro';

  return (
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] transition-all duration-300 relative">
      
      {/* Confirmation Overlay */}
      {showConfirmation && !isUploading && (
        <div className="absolute inset-0 bg-white z-30 p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="flex items-center mb-6">
             <button 
                onClick={() => setShowConfirmation(false)} 
                className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
             >
               <ArrowLeft className="w-5 h-5 text-gray-600" />
             </button>
             <h3 className="text-xl font-bold text-gray-800">Review Transfer</h3>
           </div>
           
           <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
             
             {/* SENDER & RECIPIENT */}
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
               {/* Sender */}
               <div className="flex items-start">
                  <div className="p-2 bg-gray-200 rounded-lg mr-3">
                    <UserIcon className="w-5 h-5 text-gray-600"/>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">From</p>
                    <p className="text-sm font-medium text-gray-900">{senderEmail || 'Anonymous'}</p>
                  </div>
               </div>
               
               {/* Recipient */}
               {mode === 'email' && (
                 <div className="flex items-start pt-3 border-t border-gray-200 mt-2">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Mail className="w-5 h-5 text-blue-600"/>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">To</p>
                      <p className="text-sm font-medium text-gray-900">{recipientEmail}</p>
                    </div>
                 </div>
               )}
               
               {/* Link Mode Indicator */}
               {mode === 'link' && (
                 <div className="flex items-start pt-3 border-t border-gray-200 mt-2">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <LinkIcon className="w-5 h-5 text-blue-600"/>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Method</p>
                      <p className="text-sm font-medium text-gray-900">Generate Shareable Link</p>
                    </div>
                 </div>
               )}
             </div>

             {/* FILES */}
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
               <div className="flex items-start">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <FileIcon className="w-5 h-5 text-purple-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Content</p>
                        <span className="text-xs font-medium text-gray-500">{formatBytes(totalSize)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-2">{files.length} File{files.length !== 1 && 's'}</p>
                    
                    {/* File List Preview */}
                    <div className="bg-white rounded-lg border border-gray-200 p-2 max-h-32 overflow-y-auto custom-scrollbar">
                        <ul className="text-xs text-gray-600 space-y-1">
                            {files.map((f, i) => (
                                <li key={f.id} className="flex items-center">
                                    <div className="mr-2 flex-shrink-0">
                                      {f.type.startsWith('image/') ? (
                                        <div className="w-4 h-4 rounded bg-gray-200 overflow-hidden">
                                            <img src={f.data} alt="" className="w-full h-full object-cover" />
                                        </div>
                                      ) : (
                                        renderFileIcon(f, "w-4 h-4")
                                      )}
                                    </div>
                                    <span className="truncate">{f.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                  </div>
               </div>
             </div>

             {/* SETTINGS */}
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                   <div className="flex items-center mb-1">
                     <Calendar className="w-3 h-3 text-gray-500 mr-1" />
                     <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Expires</p>
                   </div>
                   <p className="text-sm font-medium text-gray-900">{settings.expiresIn === 'never' ? 'Never' : settings.expiresIn.replace('-', ' ')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                   <div className="flex items-center mb-1">
                     <Shield className="w-3 h-3 text-gray-500 mr-1" />
                     <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Security</p>
                   </div>
                   <p className="text-sm font-medium text-gray-900">{settings.passwordProtected ? 'Password On' : 'Standard'}</p>
                </div>
             </div>

             {message && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Message</p>
                    <p className="text-sm text-gray-600 italic leading-relaxed">"{message}"</p>
                </div>
             )}
           </div>

           <div className="mt-auto pt-4 border-t border-gray-100">
             <Button onClick={executeTransfer} className="w-full">
               Confirm & Transfer
             </Button>
           </div>
        </div>
      )}

      {/* Settings Overlay */}
      {settingsOpen && !isUploading && !showConfirmation && (
        <div className="absolute inset-0 bg-white z-20 p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Transfer Settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-600" />
              </button>
           </div>
           
           <div className="space-y-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Delete after</label>
               <div className="grid grid-cols-3 gap-2">
                 {(['1-day', '7-days', 'never'] as const).map((opt) => {
                   const locked = opt === 'never' && !isPro;
                   return (
                    <button
                        key={opt}
                        onClick={() => !locked && setSettings(s => ({ ...s, expiresIn: opt }))}
                        className={`relative py-2 text-sm rounded-lg border flex items-center justify-center
                            ${settings.expiresIn === opt ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}
                            ${locked ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {opt === 'never' ? 'Never' : opt.replace('-', ' ')}
                        {locked && <Lock className="w-3 h-3 ml-1" />}
                    </button>
                   );
                 })}
               </div>
               {!isPro && (
                 <button onClick={onOpenPricing} className="text-xs text-blue-600 mt-2 hover:underline flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" /> Upgrade to Pro to keep files forever.
                 </button>
               )}
             </div>

             <div>
               <label className="flex items-center justify-between cursor-pointer">
                 <span className="text-sm font-medium text-gray-700">Password protection</span>
                 <div 
                   onClick={() => setSettings(s => ({ ...s, passwordProtected: !s.passwordProtected }))}
                   className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${settings.passwordProtected ? 'bg-blue-600' : 'bg-gray-200'}`}
                 >
                   <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${settings.passwordProtected ? 'translate-x-5' : ''}`}></div>
                 </div>
               </label>
               {settings.passwordProtected && (
                 <p className="text-xs text-gray-500 mt-2">A generic password will be generated for this demo.</p>
               )}
             </div>
           </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        {files.length === 0 ? (
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="h-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center p-6 hover:border-blue-400 transition-colors group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Upload files</h3>
            <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
            <p className="text-xs text-orange-400 mt-2">(Max 750KB per file for demo)</p>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">{files.length} files selected ({formatBytes(totalSize)})</span>
                {!isUploading && (
                  <button onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-600 hover:underline flex items-center">
                    <Upload className="w-3 h-3 mr-1" /> Add more
                  </button>
                )}
             </div>
             
             <ul className="space-y-2 max-h-40 overflow-y-auto">
               {files.map(file => (
                 <li key={file.id} className="flex items-center p-2 bg-gray-50 rounded-lg group">
                   <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                     {file.type.startsWith('image/') && file.previewUrl ? (
                       <img src={file.previewUrl} alt="" className="w-full h-full object-cover" />
                     ) : (
                       renderFileIcon(file, "w-4 h-4")
                     )}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                     <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                   </div>
                   {!isUploading && (
                    <button onClick={() => removeFile(file.id)} className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                   )}
                 </li>
               ))}
             </ul>

             <div className="pt-4 border-t border-gray-100 space-y-4">
               
               <div className="flex space-x-4 mb-4">
                  <button 
                    onClick={() => !isUploading && setMode('email')}
                    disabled={isUploading}
                    className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${mode === 'email' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    Send email
                  </button>
                  <button 
                    onClick={() => !isUploading && setMode('link')}
                    disabled={isUploading}
                    className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${mode === 'link' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    Get link
                  </button>
               </div>

               {mode === 'email' && (
                 <>
                  <input 
                    type="email" 
                    placeholder="Email to"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    disabled={isUploading}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-70"
                  />
                  <input 
                    type="email" 
                    placeholder="Your email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    disabled={isUploading}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-70"
                  />
                 </>
               )}

               <div className="relative">
                 <textarea 
                   placeholder="Message"
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   disabled={isUploading}
                   className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm min-h-[80px] resize-none disabled:opacity-70"
                 />
                 <button 
                   onClick={handleSmartMessage}
                   disabled={isGeneratingMessage || isUploading}
                   className="absolute bottom-2 right-2 p-1.5 bg-white shadow-sm border border-gray-200 rounded-md hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-all text-gray-400 disabled:opacity-50"
                   title="Generate with Gemini AI"
                 >
                    {isGeneratingMessage ? <Wand2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                 </button>
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
         {isUploading ? (
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-700">Transferring...</span>
                <span className="font-bold text-blue-600">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-center text-gray-500">Sending your files securely</p>
            </div>
         ) : (
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSettingsOpen(true)}
                className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <Button 
                onClick={handlePreCheck} 
                disabled={files.length === 0 || (mode === 'email' && !recipientEmail)}
                className="w-40"
              >
                {mode === 'email' ? 'Transfer' : 'Get a link'}
              </Button>
            </div>
         )}
      </div>

      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </div>
  );
};