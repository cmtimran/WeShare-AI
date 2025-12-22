import React, { useState, useEffect } from 'react';
import { UploadCard } from './components/UploadCard';
import { DownloadView } from './components/DownloadView';
import { Header, ModalType } from './components/Header';
import { User } from './types';
import { Check, Copy } from 'lucide-react';
import { Modal } from './components/Modal';
import { AuthModal } from './components/AuthModal';
import { AboutContent, HelpContent, LegalContent, PricingContent, ProfileContent } from './components/InfoModals';
import { auth } from './firebaseConfig';
import { getUserProfile, logoutUser } from './services/store';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'upload' | 'download' | 'success'>('upload');
  const [transferId, setTransferId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Modal State
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Background image logic
  const bgImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

  // Auth Listener
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore to get 'plan'
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
            setUser(profile);
        } else {
            // Fallback if profile doc creation failed or is delayed
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.email?.split('@')[0] || 'User',
                plan: 'free',
                createdAt: Date.now()
            });
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Refresh profile manually (used after upgrade)
  const refreshProfile = async () => {
      if (user) {
          const profile = await getUserProfile(user.uid);
          if (profile) setUser(profile);
      }
  };

  // Check URL hash for direct download links on load
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/transfer/')) {
        const id = hash.split('/transfer/')[1];
        if (id) {
          setTransferId(id);
          setCurrentView('download');
        }
      } else {
        setCurrentView('upload');
        setTransferId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTransferComplete = (id: string) => {
    setTransferId(id);
    setCurrentView('success');
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  const copyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#/transfer/${transferId}`;
    navigator.clipboard.writeText(link);
    // Could show a toast here
    alert("Link copied to clipboard!");
  };

  // Render modal content helper
  const renderModalContent = () => {
    switch (activeModal) {
      case 'auth_login':
        return <AuthModal mode="login" onSuccess={() => setActiveModal(null)} onSwitchMode={(m) => setActiveModal(m === 'login' ? 'auth_login' : 'auth_signup')} />;
      case 'auth_signup':
        return <AuthModal mode="signup" onSuccess={() => setActiveModal(null)} onSwitchMode={(m) => setActiveModal(m === 'login' ? 'auth_login' : 'auth_signup')} />;
      case 'help':
        return <HelpContent />;
      case 'about':
        return <AboutContent />;
      case 'pricing':
        return <PricingContent user={user} onUpgrade={refreshProfile} onLogin={() => setActiveModal('auth_login')} />;
      case 'terms':
        return <LegalContent type="terms" />;
      case 'cookies':
        return <LegalContent type="cookies" />;
      case 'profile':
        return user ? <ProfileContent user={user} /> : null;
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case 'help': return 'Help Center';
      case 'about': return 'About WeShare AI';
      case 'pricing': return 'Pricing Plans';
      case 'terms': return 'Terms of Service';
      case 'cookies': return 'Cookie Policy';
      case 'profile': return 'My Profile';
      default: return undefined;
    }
  };

  const getModalWidth = () => {
    if (activeModal === 'pricing') return 'max-w-4xl';
    return 'max-w-lg';
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      {/* Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <Header 
        user={user} 
        onLogout={handleLogout} 
        onOpenModal={setActiveModal}
      />

      <main className="relative z-10 flex-1 flex items-center justify-start px-6 md:px-16 lg:px-32">
        <div className="w-full max-w-md">
          
          {currentView === 'upload' && (
            <div className="animate-in slide-in-from-left-8 fade-in duration-500">
               <UploadCard 
                 onTransferComplete={handleTransferComplete} 
                 currentUser={user}
                 onOpenPricing={() => setActiveModal('pricing')} 
               />
            </div>
          )}

          {currentView === 'success' && (
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-center h-[500px] animate-in zoom-in-95 fade-in duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">You're done!</h2>
              <p className="text-gray-500 mb-8">
                Your transfer details have been processed. Share the link below.
              </p>
              
              <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between mb-6">
                 <span className="text-sm text-gray-600 truncate mr-2">
                   {`${window.location.origin}/#/transfer/${transferId}`}
                 </span>
                 <button onClick={copyLink} className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors">
                   <Copy className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex space-x-3 w-full">
                <button 
                  onClick={() => setCurrentView('upload')}
                  className="flex-1 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-gray-200 transition-colors"
                >
                  Send another
                </button>
              </div>
            </div>
          )}

          {currentView === 'download' && transferId && (
            <DownloadView 
              transferId={transferId} 
              onBack={() => {
                window.location.hash = '';
              }} 
            />
          )}

        </div>

        {/* Brand / Hero Text area (Right side on desktop) */}
        {currentView === 'upload' && (
          <div className="hidden lg:flex flex-1 items-center justify-end h-full pl-20 pointer-events-none">
            <div className="text-right text-white max-w-lg">
               <h1 className="text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
                 Move ideas.<br/>
                 Move forward.
               </h1>
               <p className="text-xl font-medium drop-shadow-md opacity-90">
                 Simple, safe file sharing with AI-generated context.
               </p>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 p-6 flex justify-between text-xs text-white/80 font-medium">
         <div className="flex space-x-4">
           <span>© 2024 WeShare AI</span>
           <button onClick={() => setActiveModal('cookies')} className="hover:text-white transition-colors">Cookies</button>
           <button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors">Terms</button>
         </div>
      </footer>

      {/* Global Modal */}
      <Modal 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)}
        title={getModalTitle()}
        maxWidth={getModalWidth()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};