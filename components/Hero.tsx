import React from 'react';
import { ArrowRight, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import TerminalDemo from './TerminalDemo';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-blue/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
              </span>
              <span className="text-xs md:text-sm font-medium text-gray-300">Save 3+ hours daily on job applications</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight tracking-tight text-white">
              Apply to Jobs on Naukri & LinkedIn <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
                Automatically.
              </span>
              <br />
              You Just Attend HR Calls.
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0">
              Naukri has a 50-application daily limit. Manual review takes ~3 hours. AutoJobzy handles it all — you just provide basic info, and we start applying while you focus on interviews.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup">
                <button className="group bg-neon-blue text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] flex items-center justify-center gap-2">
                  Get Started 🚀
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="px-8 py-4 rounded-lg font-bold text-lg text-white border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 pt-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-neon-green" /> No Credit Card</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-neon-green" /> Cancel Anytime</span>
            </div>
          </motion.div>

          {/* Visual Content (Terminal + Abstract Art) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
             {/* Decorative Elements around Terminal */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-neon-purple to-pink-500 rounded-xl opacity-20 blur-xl animate-float"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-neon-blue to-cyan-500 rounded-full opacity-20 blur-xl animate-pulse-slow"></div>

            {/* The Terminal Component */}
            <TerminalDemo />

            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-4 top-1/3 bg-dark-800 p-3 rounded-lg border border-gray-700 shadow-xl hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                   <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Match Score</div>
                  <div className="font-bold text-white">98% High</div>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
