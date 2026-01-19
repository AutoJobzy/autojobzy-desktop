import React from 'react';
import { Cpu, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-black border-t border-gray-200 dark:border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
               <Cpu className="h-6 w-6 text-neon-blue" />
               <span className="font-heading font-bold text-xl text-gray-900 dark:text-white">AutoJobzy</span>
            </div>
            <p className="text-gray-600 dark:text-gray-500 text-sm leading-relaxed">
              Automating the bridge between talent and opportunity. Built for the next generation of tech leaders.
            </p>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-500">
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById('features');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-neon-blue transition-colors"
                >
                  Features
                </button>
              </li>
              <li><Link to="/pricing" className="hover:text-neon-blue transition-colors">Pricing</Link></li>
              <li><Link to="/signup" className="hover:text-neon-blue transition-colors">Live Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-500">
              <li><Link to="/about" className="hover:text-neon-blue transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-neon-blue transition-colors">Contact</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-neon-blue transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-neon-blue transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-neon-blue transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="text-gray-900 dark:text-white font-bold mb-4">Connect</h4>
             <div className="flex space-x-4">
                {/* Replace # with actual social media URLs when available */}
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  title="Twitter (coming soon)"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  title="GitHub (coming soon)"
                >
                  <Github className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  title="LinkedIn (coming soon)"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-600 text-sm">© 2024 AutoJobzy Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-500">
            <span>Made for Students 👨‍🎓👩‍🎓</span>
            <span className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full"></span>
            <span>Bengaluru, India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
