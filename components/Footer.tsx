import React from 'react';
import { Cloud, Twitter, Github, Linkedin, Heart } from 'lucide-react';
import { ModalType } from './Header';

interface FooterProps {
    onOpenModal: (type: ModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
    return (
        <footer className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/10 pt-16 pb-8 text-white">
            <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Cloud className="w-6 h-6 text-blue-400" />
                        <span className="text-xl font-bold tracking-tight">WeShare AI</span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">
                        The smartest way to share files. AI-powered context, enterprise-grade security, and lightning-fast global delivery.
                    </p>
                    <div className="flex space-x-4 pt-2">
                        <a href="#" className="text-white/40 hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-white/40 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="#" className="text-white/40 hover:text-blue-600 transition-colors"><Linkedin className="w-5 h-5" /></a>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-white/90">Product</h4>
                    <ul className="space-y-2 text-sm text-white/60">
                        <li><button onClick={() => window.location.hash = '#features'} className="hover:text-white transition-colors">Features</button></li>
                        <li><button onClick={() => window.location.hash = '#features'} className="hover:text-white transition-colors">Security</button></li>
                        <li><button onClick={() => onOpenModal('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                        <li><button onClick={() => onOpenModal('auth_signup')} className="hover:text-white transition-colors">Early Access</button></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-white/90">Company</h4>
                    <ul className="space-y-2 text-sm text-white/60">
                        <li><button onClick={() => onOpenModal('about')} className="hover:text-white transition-colors">About Us</button></li>
                        <li><button onClick={() => onOpenModal('careers')} className="hover:text-white transition-colors">Careers</button></li>
                        <li><button onClick={() => onOpenModal('blog')} className="hover:text-white transition-colors">Blog</button></li>
                        <li><button onClick={() => onOpenModal('contact')} className="hover:text-white transition-colors">Contact</button></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-white/90">Legal</h4>
                    <ul className="space-y-2 text-sm text-white/60">
                        <li><button onClick={() => onOpenModal('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                        <li><button onClick={() => onOpenModal('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
                        <li><button onClick={() => onOpenModal('cookies')} className="hover:text-white transition-colors">Cookie Policy</button></li>
                    </ul>
                </div>

            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
                <p>© 2024 WeShare AI. All rights reserved.</p>
            </div>
        </footer>
    );
};
