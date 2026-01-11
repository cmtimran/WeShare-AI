import React, { useState, useEffect } from 'react';
import { ModalType } from './components/Header';
import { User } from './types';
import { Modal } from './components/Modal';
import { AuthModal } from './components/AuthModal';
import { AboutContent, HelpContent, LegalContent, PricingContent, ProfileContent } from './components/InfoModals';
import { getUserProfile, logoutUser, getCurrentUser } from './services/store';

// New Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard/Dashboard';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'upload' | 'download' | 'success' | 'dashboard'>('upload');
  const [transferId, setTransferId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);


  const checkUser = async () => {
    const user = await getCurrentUser();
    setUser(user);
    if (user && currentView === 'upload' && !window.location.hash) {
      // Optional: Auto redirect to dashboard on load if logged in?
      // setCurrentView('dashboard');
    }
  };

  // Auth Listener
  useEffect(() => {
    checkUser();
  }, []);

  // Refresh profile manually (used after upgrade)
  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      if (profile) setUser(profile);
    }
  };

  const handleTransferComplete = (id: string) => {
    setTransferId(id);
    setCurrentView('success');
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setCurrentView('upload');
  };

  // Render modal content helper
  const renderModalContent = () => {
    switch (activeModal) {
      case 'auth_login':
        return <AuthModal mode="login" onSuccess={() => { setActiveModal(null); checkUser().then(() => setCurrentView('dashboard')); }} onSwitchMode={(m) => setActiveModal(m === 'login' ? 'auth_login' : 'auth_signup')} />;
      case 'auth_signup':
        return <AuthModal mode="signup" onSuccess={() => { setActiveModal(null); checkUser().then(() => setCurrentView('dashboard')); }} onSwitchMode={(m) => setActiveModal(m === 'login' ? 'auth_login' : 'auth_signup')} />;
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
      case 'privacy':
        return <LegalContent type="privacy" />;
      case 'blog':
        return <AboutContent />; // Placeholder or create new
      case 'careers':
        return <AboutContent />; // Placeholder or create new
      case 'contact':
        return <HelpContent />; // Mapping contact to Help
      case 'profile':
        return user ? <ProfileContent user={user} /> : null;
      default:
        return null;
    }
  };

  // Check URL hash for direct download links on load
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      console.log("Current hash:", hash); // Debugging

      if (hash.startsWith('#/transfer/') || hash.startsWith('#/t/')) {
        const id = hash.split('/').pop();
        console.log("Parsed ID:", id); // Debugging
        if (id) {
          setTransferId(id);
          setCurrentView('download');
        }
      } else if (!hash.startsWith('#')) {
        // If simply root, default to upload.
        // If we are in dashboard mode, we don't want to auto-switch to upload unless hash is empty explicitly and we are not logged in?
        // Actually, let's keep it simple. Only handle explicit transfer links.
        if (hash === '' && currentView !== 'dashboard') {
          setTransferId(null);
        }
      }
    };

    // Run immediately
    handleHashChange();

    // Listen for changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []); // Removed currentView dependency to avoid loops


  const getModalTitle = () => {
    switch (activeModal) {
      case 'help': return 'Help Center';
      case 'about': return 'About WeShare AI';
      case 'pricing': return 'Pricing Plans';
      case 'terms': return 'Terms of Service';
      case 'cookies': return 'Cookie Policy';
      case 'privacy': return 'Privacy Policy';
      case 'blog': return 'Our Blog';
      case 'careers': return 'Careers';
      case 'contact': return 'Contact Us';
      case 'profile': return 'My Profile';
      default: return undefined;
    }
  };

  const getModalWidth = () => {
    if (activeModal === 'pricing') return 'max-w-4xl';
    return 'max-w-lg';
  };

  // Navigation Handler
  const handleNavigation = (section: 'dashboard' | 'features' | 'security' | 'pricing' | 'home') => {
    if (section === 'pricing') {
      setActiveModal('pricing');
      return;
    }

    if (section === 'dashboard') {
      if (user) {
        setCurrentView('dashboard');
        window.location.hash = '';
      } else {
        setActiveModal('auth_login');
      }
      return;
    }

    // For Home, Features, Security -> Switch to Upload/Home view first
    setCurrentView('upload');

    if (section === 'home') {
      window.location.hash = '';
      return;
    }

    // Allow render cycle to complete before scrolling
    setTimeout(() => {
      window.location.hash = `#${section}`;
    }, 50);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-white overflow-x-hidden selection:bg-blue-500/30 font-sans">
      <Navbar
        isLoggedIn={!!user}
        onLogin={() => setActiveModal('auth_login')}
        onLogout={handleLogout}
        onOpenPricing={() => setActiveModal('pricing')}
        onNavigate={handleNavigation}
      />

      <main>
        {currentView === 'dashboard' && user ? (
          <Dashboard user={user} onLogout={handleLogout} onRefreshProfile={refreshProfile} />
        ) : (
          <>
            <Hero
              currentView={currentView === 'dashboard' ? 'upload' : currentView}
              user={user}
              transferId={transferId}
              onTransferComplete={handleTransferComplete}
              onOpenPricing={() => setActiveModal('pricing')}
              setCurrentView={(view) => setCurrentView(view as any)}
              onBackToHome={() => {
                window.location.hash = '';
                setCurrentView('upload');
              }}
            />
            <Features />
            <Footer onOpenModal={setActiveModal} />
          </>
        )}
      </main>

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
