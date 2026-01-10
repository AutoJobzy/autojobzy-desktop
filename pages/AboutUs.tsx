import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Target, Eye, Cpu, Users, MapPin, Zap, FileSpreadsheet, Clock, Brain, CheckCircle, Briefcase, Rocket, Calendar, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Brain, title: 'All Built-in Techniques', description: 'Complete automation system handles form filling, resume uploads, and application submissions automatically' },
    { icon: Clock, title: 'Save 3+ Hours Daily', description: 'Naukri\'s 50-application limit takes ~3 hours manually. Our app does it while you focus on interviews' },
    { icon: Calendar, title: 'Built-in Scheduler', description: 'Schedule applications around your availability. The app works automatically while you attend HR calls' },
    { icon: FileSpreadsheet, title: 'Monthly Time Tracker', description: 'Track your applications and see exactly how many days worth of time you\'ve saved each month' },
    { icon: Zap, title: 'Minimal Setup Required', description: 'Just provide basic info — skills, experience, preferences. We handle everything else automatically' },
  ];

  const targetAudience = [
    { icon: Briefcase, title: 'Job Switchers', description: 'Professionals looking to switch jobs without spending hours on applications' },
    { icon: Cpu, title: 'IT Professionals', description: 'Tech experts who want to focus on interviews, not repetitive form filling' },
    { icon: Rocket, title: 'All Professionals', description: 'Job seekers from any field who value their time and want automated applications' },
  ];

  return (
    <>
      <Helmet>
        <title>About AutoJobzy - AI Job Search Automation Platform</title>
        <meta name="description" content="Learn about AutoJobzy - India's leading job application automation platform. Save 3+ hours daily with AI-powered automation for Naukri & LinkedIn job applications." />
        <link rel="canonical" href="https://job-automate.onrender.com/about" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Cpu className="w-10 h-10 text-neon-blue animate-pulse" />
            <div>
              <h1 className="text-3xl font-bold text-white">About AutoJobzy</h1>
              <p className="text-gray-400 mt-1">Automating the bridge between talent and opportunity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[100px]"></div>

        <div className="max-w-5xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-full text-neon-blue text-sm font-medium mb-6">
              <Clock className="w-4 h-4" />
              Save 3+ Hours Daily
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              You Provide Info. <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">We Handle Applications.</span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              AutoJobzy is built for job seekers, IT professionals, and anyone looking to switch jobs. Naukri's 50-application daily limit takes ~3 hours of manual work. Our app automates everything — you just provide basic info and attend HR calls.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Company Overview */}
        <section className="mb-16">
          <div className="bg-dark-800/50 border border-white/10 rounded-2xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-neon-blue/10 rounded-xl">
                <Cpu className="w-6 h-6 text-neon-blue" />
              </div>
              <h2 className="text-2xl font-bold text-white">Company Overview</h2>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              AutoJobzy is an AI-powered job application automation platform designed for anyone looking for jobs — whether you're switching careers, an IT professional, or a job seeker from any field. We understand that manually applying on Naukri.com with its 50-application daily limit takes approximately 3 hours of your valuable time every day.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Our platform has all built-in techniques for efficient job applications. You just provide basic information — your skills, experience, and preferences — and we handle everything else. The app automatically scans job portals, matches your profile, and submits applications while you focus on preparing for interviews and attending HR calls.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mission */}
            <div className="bg-gradient-to-br from-neon-blue/5 to-transparent border border-neon-blue/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-neon-blue/10 rounded-xl">
                  <Target className="w-6 h-6 text-neon-blue" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                To eliminate the 3+ hours daily grind of manual job applications. Our goal is simple — you provide basic info, we handle the applications automatically. You focus on what matters: preparing for interviews and attending HR calls when they come.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-neon-purple/5 to-transparent border border-neon-purple/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-neon-purple/10 rounded-xl">
                  <Eye className="w-6 h-6 text-neon-purple" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                To become the go-to job automation platform for all professionals. We envision a future where job seekers spend zero hours on repetitive applications. Track your monthly applications, see days of time saved, and let the built-in scheduler handle everything while you attend HR calls.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">Key Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powerful automation tools designed to maximize your job search efficiency
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-dark-800/50 border border-white/10 rounded-xl p-6 hover:border-neon-blue/30 transition-all group"
              >
                <div className="p-3 bg-white/5 rounded-lg w-fit mb-4 group-hover:bg-neon-blue/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-gray-400 group-hover:text-neon-blue transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Target Audience */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">Who We Serve</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built for job seekers from every field who value their time
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {targetAudience.map((audience, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-dark-800 to-dark-900 border border-white/10 rounded-xl p-8 text-center hover:border-neon-blue/30 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                  <audience.icon className="w-8 h-8 text-neon-blue" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{audience.title}</h3>
                <p className="text-gray-400">{audience.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-white/10 rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Why Choose AutoJobzy?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Save 3+ hours daily on manual applications',
                'Track monthly applications & days of time saved',
                'Built-in scheduler works around your availability',
                'All automation techniques built-in — minimal setup',
                'You just provide basic info & attend HR calls',
                'Perfect for job switchers & professionals from any field',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location & Contact */}
        <section>
          <div className="bg-dark-800/50 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Our Location</h2>
            <p className="text-xl text-gray-300 mb-4">Bengaluru, India</p>
            <p className="text-gray-400 mb-6">The Silicon Valley of India — home to thousands of tech companies and startups</p>

            <div className="pt-6 border-t border-white/10">
              <p className="text-gray-400 mb-4">Have questions? We'd love to hear from you!</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:support@autojobzy.com"
                  className="px-6 py-3 bg-neon-blue text-black font-bold rounded-lg hover:bg-white transition-colors"
                >
                  Contact Us
                </a>
                <button
                  onClick={() => navigate('/contact')}
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors"
                >
                  Visit Contact Page
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tagline Footer */}
        <div className="mt-16 text-center">
          <p className="text-xl text-gray-400 italic">
            "You provide basic info. We handle applications automatically.<br />
            <span className="text-neon-blue">You just attend HR calls.</span>"
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default AboutUs;
