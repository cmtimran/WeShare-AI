import React from 'react';
import { Brain, Lock, Zap, Shield, Share2, Smartphone } from 'lucide-react';

export const Features: React.FC = () => {
    return (
        <section id="features" className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-6 md:px-12">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for the <span className="text-blue-400">future</span>.</h2>
                    <p className="text-white/60 text-lg">
                        WeShare AI isn't just another file transfer tool. It's a smart workspace that understands your content.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Feature 1 */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Brain className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">AI Context</h3>
                        <p className="text-white/60 leading-relaxed">
                            Our Gemini-powered engine analyzes your uploads to generate smart summaries and context automatically.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Lock className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">End-to-End Encryption</h3>
                        <p className="text-white/60 leading-relaxed">
                            Your files are encrypted in transit and at rest. Set passwords and expiration dates for total control.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
                        <p className="text-white/60 leading-relaxed">
                            Global CDN ensures your files are delivered from the edge, minimizing latency for recipients anywhere.
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
};
