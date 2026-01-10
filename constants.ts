import {
  Bot,
  Target,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  Zap,
  Search,
  MousePointerClick,
  Rocket,
  Calendar,
  Phone
} from 'lucide-react';
import { Feature, PricingPlan, Step } from './types';

export const FEATURES: Feature[] = [
  {
    id: 1,
    title: "All-in-One Automation",
    description: "Built-in techniques handle everything — form filling, resume uploads, and application submissions across Naukri, LinkedIn, and more.",
    icon: Bot
  },
  {
    id: 2,
    title: "Smart Match Score",
    description: "AI analyzes job descriptions and applies only when your profile matches with >80% accuracy — no wasted applications.",
    icon: Target
  },
  {
    id: 3,
    title: "Save 3+ Hours Daily",
    description: "Naukri's 50-application daily limit takes ~3 hours manually. Our app does it automatically while you prepare for interviews.",
    icon: Clock
  },
  {
    id: 4,
    title: "Built-in Scheduler",
    description: "Schedule applications around your availability. The app applies automatically — you just attend HR calls when they come.",
    icon: Calendar
  },
  {
    id: 5,
    title: "Monthly Time Tracker",
    description: "Track your monthly applications and see exactly how many days' worth of time you've saved. Real ROI, visible results.",
    icon: FileSpreadsheet
  },
  {
    id: 6,
    title: "Minimal Setup Required",
    description: "Just provide basic info — skills, experience, preferences. The app handles the rest and starts applying within minutes.",
    icon: Zap
  }
];

export const STEPS: Step[] = [
  {
    id: 1,
    title: "Provide Basic Info",
    description: "Enter your skills, experience level, and job preferences. That's all we need to get started.",
    icon: Search
  },
  {
    id: 2,
    title: "We Find & Apply",
    description: "Our AI scans job portals 24/7, matches your profile, and automatically submits applications for you.",
    icon: Bot
  },
  {
    id: 3,
    title: "Schedule Your Time",
    description: "Set when you want applications sent. The scheduler works around your availability automatically.",
    icon: Calendar
  },
  {
    id: 4,
    title: "Just Attend HR Calls",
    description: "Focus on what matters — preparing for interviews and attending HR calls. We handle the application grind.",
    icon: Phone
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Starter Plan',
    price: '₹299',
    duration: '1 Month',
    features: [
      'Unlimited Job Applications',
      'Basic Match Score Algorithm',
      'Daily Excel Report',
      'Standard Support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Automation Plan',
    price: '₹499',
    duration: '2 Months',
    isPopular: true,
    features: [
      'Unlimited Job Applications',
      'Advanced Match Score Algorithm',
      'Advanced Keyword Matching',
      'Daily Excel Report',
      '24/7 Priority Support'
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced Automation',
    price: '₹999',
    duration: 'Coming Soon',
    comingSoon: true,
    subtitle: 'For serious job seekers who want unfair advantage',
    features: [
      '✔ Everything in Pro Automation',
      '✔ Interview Prep Automation',
      '✔ HR Outreach on Autopilot',
      '✔ Email + Profile Auto Updates',
      '✔ Deep Automation Insights (Locked)',
      '🔒 Advanced Controls (Unlock on Upgrade)'
    ]
  }
];