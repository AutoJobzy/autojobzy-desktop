import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import StudentSection from '../components/StudentSection';
import WhyWeBuiltSection from '../components/WhyWeBuiltSection';
import Pricing from '../components/Pricing';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AutoJobzy - AI Job Application Automation for Naukri & LinkedIn | India</title>
        <meta name="description" content="Automate job applications on Naukri & LinkedIn. AI-powered tool applies to 50+ jobs daily. Save 3+ hours. Trusted by 1000+ Indian job seekers. Get 50% OFF now!" />
        <link rel="canonical" href="https://job-automate.onrender.com/" />
      </Helmet>

      <main>
        <Hero />

        {/* Special Offer Banner */}
        <section aria-label="Special Offer" className="relative overflow-hidden bg-gradient-to-r from-neon-purple via-neon-blue to-neon-purple py-1 animate-gradient-x">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
              {/* Left Side - Offer Text */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold mb-2 animate-pulse">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  LIMITED TIME OFFER
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  🎉 Get 50% OFF on Premium Plan!
                </h3>
                <p className="text-white/90 text-sm md:text-base">
                  Unlock unlimited job applications and advanced features
                </p>
              </div>

              {/* Center - Pricing */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-white/70 text-sm mb-1">Regular Price</p>
                  <p className="text-2xl md:text-3xl font-bold text-white line-through opacity-60">
                    ₹999
                  </p>
                </div>
                <div className="text-5xl font-bold text-white">→</div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
                  <p className="text-yellow-300 text-sm font-bold mb-1">OFFER PRICE</p>
                  <p className="text-3xl md:text-4xl font-bold text-white">
                    ₹499
                  </p>
                  <p className="text-white/70 text-xs mt-1">Save ₹500!</p>
                </div>
              </div>

              {/* Right Side - CTA */}
              <div className="flex-shrink-0">
                <Link to="/signup">
                  <button className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transform flex items-center gap-2 group">
                    Buy Now
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </Link>
                <p className="text-white/80 text-xs text-center mt-2">
                  ⏰ Offer ends soon!
                </p>
              </div>
            </div>
          </div>

          {/* Animated Background Glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none"></div>
        </section>

        <section aria-label="Statistics">
          <Stats />
        </section>

        <section aria-label="How It Works">
          <HowItWorks />
        </section>

        <section aria-label="Features">
          <Features />
        </section>

        <section aria-label="Student Section">
          <StudentSection />
        </section>

        <section aria-label="Why We Built This">
          <WhyWeBuiltSection />
        </section>

        <section aria-label="Pricing">
          <Pricing />
        </section>

        {/* Final CTA Section */}
        <section aria-label="Call to Action" className="py-20 bg-gradient-to-t from-black to-dark-900 text-center px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white">
              Save 3+ Hours Daily. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue">
                Just Attend HR Calls.
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Join thousands of job seekers who provide basic info and let AutoJobzy handle the rest.
            </p>
            <div className="pt-8">
              <Link to="/signup">
                <button className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:scale-105 transform">
                  Start Saving Time Now
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Landing;
