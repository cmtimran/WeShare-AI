import React from 'react';
import { UploadCard } from './UploadCard';
import { DownloadView } from './DownloadView';
import { User } from '../types';
import { Check, Copy, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

interface HeroProps {
    currentView: 'upload' | 'download' | 'success';
    user: User | null;
    transferId: string | null;
    onTransferComplete: (id: string) => void;
    onOpenPricing: () => void;
    setCurrentView: (view: 'upload' | 'download' | 'success') => void;
    onBackToHome: () => void;
}

export const Hero: React.FC<HeroProps> = ({
    currentView,
    user,
    transferId,
    onTransferComplete,
    onOpenPricing,
    setCurrentView,
    onBackToHome
}) => {

    const copyLink = () => {
        const link = `${window.location.origin}/#/transfer/${transferId}`;
        navigator.clipboard.writeText(link);
        alert("Link copied!");
    };

    return (
        <section className="relative pt-32 pb-20 px-6 md:px-12 lg:px-24 min-h-screen flex items-center">

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
            </div>

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                {/* Left Column: Text */}
                <div className="max-w-2xl animate-in slide-in-from-left-8 fade-in duration-700">
                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-6 w-fit">
                        <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-xs font-medium text-green-200">V2.0 is live</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                        Share files at the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">speed of thought.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-blue-100/80 mb-8 leading-relaxed max-w-lg">
                        Experience the future of file sharing. AI-generated summaries, military-grade encryption, and zero friction.
                    </p>

                    <div className="flex flex-wrap gap-6 text-sm font-medium text-white/60">
                        <div className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-blue-400" /> Secure by default</div>
                        <div className="flex items-center"><Zap className="w-5 h-5 mr-2 text-yellow-400" /> Blazing fast</div>
                        <div className="flex items-center"><Globe className="w-5 h-5 mr-2 text-purple-400" /> Global CDN</div>
                    </div>
                </div>

                {/* Right Column: Interactive Card */}
                <div className="flex flex-col items-center lg:items-end w-full">

                    {currentView === 'upload' && (
                        <div className="relative animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 w-full max-w-sm">
                            {/* Glow effect behind card */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[2rem] blur opacity-30 animate-pulse"></div>
                            <UploadCard
                                onTransferComplete={onTransferComplete}
                                currentUser={user}
                                onOpenPricing={onOpenPricing}
                            />
                        </div>
                    )}

                    {currentView === 'success' && (
                        <div className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-[2rem] shadow-2xl p-8 flex flex-col items-center justify-center text-center h-[450px] animate-in zoom-in-95 fade-in duration-300 relative">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Transfer Sent!</h2>
                            <p className="text-gray-500 mb-8 text-sm">
                                We've securely processed your files.
                            </p>

                            <div className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between mb-6 shadow-sm">
                                <span className="text-xs text-gray-600 truncate mr-2 font-mono">
                                    {`${window.location.host}/#/t/${transferId?.substring(0, 6)}...`}
                                </span>
                                <button onClick={copyLink} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                onClick={() => setCurrentView('upload')}
                                className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Send another file
                            </button>
                        </div>
                    )}

                    {currentView === 'download' && transferId && (
                        <div className="w-full max-w-sm animate-in slide-in-from-right-8 fade-in">
                            <DownloadView
                                transferId={transferId}
                                onBack={onBackToHome}
                            />
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
};
