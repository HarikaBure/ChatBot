// src/components/Main.jsx
import React, { useState } from 'react';
import { Bot, UserCircle2 } from 'lucide-react';
import {Link} from 'react-router-dom'

function Main() {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleInitialClick = () => {
    setIsAnimating(true);
  };

  return (
    <div className="relative z-10 w-full max-w-6xl mt-16  "
    // style={{
      //   backgroundImage: ` url('/wmremove-transformed.jpeg')`,
      //   backgroundSize: 'cover',
      //   backgroundPosition: 'center',
      //   backgroundRepeat: 'no-repeat',
      // }}
      >
      <div className="flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 text-left">
          <h2 className="text-2xl text-teal-400 font-semibold mb-4">Welcome to</h2>
          <div className="relative mb-6">
            <div className="flex items-start text-8xl font-bold text-white overflow-hidden">
              <span className={`transition-all duration-[2000ms] ease-in-out ${isAnimating ? '-translate-x-[300px] opacity-0' : ''}`}>
                AU
              </span>
              <span className={`transition-all duration-[2000ms] ease-in-out ${isAnimating ? 'translate-x-[300px] opacity-0' : ''}`}>
                RA
              </span>
            </div>
          </div>
          <p className="text-white/90 text-xl mb-8 max-w-xl">
            Your emotion-aware AI companion that understands how you feel and curates perfect movie recommendations.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Emotional Intelligence</h3>
                <p className="text-white/70">Advanced AI that understands your emotions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <UserCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Personalized Experience</h3>
                <p className="text-white/70">Tailored recommendations for your mood</p>
              </div>
            </div>
          </div>
        <Link to='/login'>
        <button
            onClick={handleInitialClick}
            className="mt-8 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-xl"
          >
            Begin Your Journey
          </button>
        
        </Link>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <Bot className="w-32 h-32 text-white mb-4" />
              <div className="mt-6 space-y-2">
                <div className="h-2 w-30 bg-teal-400 rounded-full"></div>
                <div className="h-2 w-20 bg-teal-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
