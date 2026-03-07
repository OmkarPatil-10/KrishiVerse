import { useState, useEffect } from 'react';
import { Sprout } from 'lucide-react';

const SplashScreen = ({ onFinish }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fade-out at 1.6s, finish at 2s
        const fadeTimer = setTimeout(() => setFadeOut(true), 1600);
        const finishTimer = setTimeout(() => onFinish(), 2000);
        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(finishTimer);
        };
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-400 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
            style={{
                background: 'linear-gradient(135deg, #065f46 0%, #16a34a 50%, #22c55e 100%)',
            }}
        >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white/10"
                        style={{
                            width: `${60 + i * 40}px`,
                            height: `${60 + i * 40}px`,
                            left: `${10 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animation: `splashFloat ${3 + i * 0.5}s ease-in-out infinite alternate`,
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
            </div>

            {/* Center content */}
            <div className="relative text-center">
                {/* Logo with pulse ring */}
                <div className="relative inline-flex items-center justify-center mb-6">
                    {/* Pulse rings */}
                    <div
                        className="absolute w-28 h-28 rounded-full border-2 border-white/20"
                        style={{ animation: 'splashPulse 1.5s ease-out infinite' }}
                    />
                    <div
                        className="absolute w-36 h-36 rounded-full border border-white/10"
                        style={{ animation: 'splashPulse 1.5s ease-out infinite 0.3s' }}
                    />

                    {/* Icon container */}
                    <div
                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                        style={{ animation: 'splashBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    >
                        <Sprout className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                </div>

                {/* App name */}
                <h1
                    className="text-4xl md:text-5xl font-extrabold text-white tracking-wide mb-2"
                    style={{ animation: 'splashSlideUp 0.5s ease-out 0.3s both' }}
                >
                    KrishiVerse
                </h1>

                {/* Tagline */}
                <p
                    className="text-emerald-100 text-sm md:text-base font-medium tracking-widest uppercase"
                    style={{ animation: 'splashSlideUp 0.5s ease-out 0.5s both' }}
                >
                    AI-Powered Smart Farming
                </p>

                {/* Loading bar */}
                <div
                    className="mt-8 mx-auto w-48 h-1 bg-white/20 rounded-full overflow-hidden"
                    style={{ animation: 'splashSlideUp 0.5s ease-out 0.7s both' }}
                >
                    <div
                        className="h-full bg-white rounded-full"
                        style={{ animation: 'splashLoadBar 1.6s ease-in-out forwards' }}
                    />
                </div>
            </div>

            {/* Inline keyframe styles */}
            <style>{`
        @keyframes splashBounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes splashSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashPulse {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes splashFloat {
          from { transform: translateY(0) scale(1); }
          to   { transform: translateY(-20px) scale(1.1); }
        }
        @keyframes splashLoadBar {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
        </div>
    );
};

export default SplashScreen;
