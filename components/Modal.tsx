import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={`relative bg-[#0f0f16] border border-white/10 text-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 custom-scrollbar`}>
        <div className="sticky top-0 right-0 z-10 flex justify-end p-4 pointer-events-none">
          <button onClick={onClose} className="pointer-events-auto p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm shadow-sm border border-white/5">
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>
        <div className="px-8 pb-8 pt-2">
          {title && <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  );
};