import React from 'react';
import { ArrowLeft, Heart, Lightbulb, Target, Users, Clock, TrendingUp, Briefcase, AlertTriangle, CheckCircle, ArrowRight, Rocket, Code, Coffee, Calendar, Phone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const WhyWeBuilt: React.FC = () => {
  const navigate = useNavigate();

  const problems = [
    {
      icon: Clock,
      title: '3+ Hours Wasted Daily',
      description: 'Naukri.com has a 50-application daily limit. Manually reviewing and applying takes ~3 hours every single day. That\'s 90+ hours monthly just on applications.',
    },
    {
      icon: AlertTriangle,
      title: 'Missed Opportunities',
      description: 'While you\'re busy filling forms, others are already in interviews. Early applicants have a 3x higher callback rate — speed matters.',
    },
    {
      icon: TrendingUp,
      title: 'Application Fatigue',
      description: 'After days of repetitive form filling, motivation drops. Many talented professionals give up before finding the right opportunity.',
    },
    {
      icon: Target,
      title: 'Time Better Spent Elsewhere',
      description: 'Hours spent on applications could be used for interview prep, skill building, or actually attending HR calls when they come.',
    },
  ];

  const story = [
    {
      year: 'The Problem',
      title: 'We Experienced It Firsthand',
      content: 'As job seekers ourselves, we spent 3+ hours daily on Naukri just to hit the 50-application limit. The same forms, the same details, over and over. Meanwhile, opportunities slipped away.',
    },
    {
      year: 'The Realization',
      title: 'This Process Is Broken',
      content: 'We realized professionals were wasting 90+ hours monthly on repetitive tasks. Time that could be spent preparing for interviews, upskilling, or actually talking to HR when calls came.',
    },
    {
      year: 'The Solution',
      title: 'What If We Automated Everything?',
      content: 'We built all the techniques needed for efficient applications into one platform. You just provide basic info — skills, experience, preferences — and the app handles everything else automatically.',
    },
    {
      year: 'The Result',
      title: 'AutoJobzy Was Born',
      content: 'Today, our users save 3+ hours daily. They track monthly applications, see days of time saved, and use the built-in scheduler to manage everything while they focus on attending HR calls.',
    },
  ];

  const values = [
    {
      icon: Clock,
      title: 'Time-Saving First',
      description: 'Every feature is designed to save your time — built-in scheduler, automatic applications, monthly time tracking. You just attend HR calls.',
    },
    {
      icon: Lightbulb,
      title: 'All Techniques Built-in',
      description: 'No complex setup. All automation techniques are built into the app. You provide basic info, we handle everything else.',
    },
    {
      icon: Users,
      title: 'For All Professionals',
      description: 'Whether you\'re switching jobs, an IT expert, or from any field — AutoJobzy works for everyone who values their time.',
    },
  ];

  return (
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
            <Heart className="w-10 h-10 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">Why We Built This App</h1>
              <p className="text-gray-400 mt-1">The story behind AutoJobzy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Quote */}
      <div className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[100px]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-2xl md:text-4xl font-bold text-white leading-relaxed">
              "3 hours daily on Naukri. 90+ hours monthly.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
                We built AutoJobzy to give that time back.
              </span>"
            </p>
            <p className="mt-6 text-gray-400">— The Founding Team, AutoJobzy</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* The Problem Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-4">
              <AlertTriangle className="w-4 h-4" />
              The Problem
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Manual Applications Waste Your Time</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              For job seekers, IT professionals, and anyone switching jobs — the traditional application process steals hours you could spend on interviews.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((problem, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-dark-800/50 border border-white/10 rounded-xl p-6 hover:border-red-500/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500/10 rounded-lg flex-shrink-0">
                    <problem.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{problem.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{problem.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Story Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-full text-neon-blue text-sm font-medium mb-4">
              <Briefcase className="w-4 h-4" />
              Our Story
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">From Time Wasted to Time Saved</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              AutoJobzy was born from the frustration of spending 3+ hours daily on job portals, doing repetitive tasks that could be automated.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-blue via-neon-purple to-neon-green hidden md:block"></div>

            <div className="space-y-8">
              {story.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="relative md:pl-20"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple hidden md:block"></div>

                  <div className="bg-dark-800/50 border border-white/10 rounded-xl p-6 hover:border-neon-blue/30 transition-all">
                    <span className="text-xs font-bold text-neon-blue uppercase tracking-wider">{item.year}</span>
                    <h3 className="text-xl font-bold text-white mt-2 mb-3">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Believe Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-purple/10 border border-neon-purple/20 rounded-full text-neon-purple text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Our Values
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">What We Believe In</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              These core values guide every decision we make at AutoJobzy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-dark-800 to-dark-900 border border-white/10 rounded-xl p-8 text-center hover:border-neon-purple/30 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-neon-purple" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* The Vision Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-white/10 rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="w-8 h-8 text-neon-blue" />
              <h2 className="text-2xl font-bold text-white">Our Vision for the Future</h2>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              We envision a world where <strong className="text-white">job seekers spend zero hours on repetitive applications</strong>. Where professionals from any field — IT experts, job switchers, or anyone looking for opportunities — can focus entirely on what matters: preparing for interviews and attending HR calls.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              With all built-in techniques, a scheduler that works around your availability, and monthly tracking that shows exactly how many days you've saved — AutoJobzy handles the grind so you don't have to.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-neon-green" />
                <span className="text-gray-300">Save 3+ hours daily</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-neon-green" />
                <span className="text-gray-300">Built-in scheduler</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-neon-green" />
                <span className="text-gray-300">Track monthly time saved</span>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="bg-dark-800/50 border border-white/10 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Built by Job Seekers, for Job Seekers</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Our team experienced the 3-hour daily grind firsthand. We built all the automation techniques into one app so you can provide basic info, let the scheduler work, and just attend HR calls.
            </p>
            <p className="text-neon-blue font-medium">Bengaluru, India 🇮🇳</p>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <div className="bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Save 3+ Hours Daily?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who've already discovered a smarter way. Provide basic info, let the app work, and just attend HR calls.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <button className="px-8 py-4 bg-neon-blue text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/about">
                <button className="px-8 py-4 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors">
                  Learn More About Us
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WhyWeBuilt;
