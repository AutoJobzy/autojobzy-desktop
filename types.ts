import { LucideIcon } from 'lucide-react';

export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
  comingSoon?: boolean;
  subtitle?: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface User {
  username: string;
  email: string;
  isLoggedIn: boolean;
  plan?: PricingPlan;
  config?: JobConfig;
  onboardingCompleted?: boolean;
}

export interface JobConfig {
  naukriUsername: string;
  naukriPassword?: string;
  targetRole: string;
  experience: string;
  location: string;
  keywords: string;
  currentSalary: string;
  expectedSalary: string;
  noticePeriod: string;
  resumeName?: string;
  resumeScore?: number;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  text: string;
  color: string;
}

export interface JobReport {
  id: number;
  date: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  status: 'Applied' | 'Failed' | 'External';
  platform: 'Naukri' | 'LinkedIn' | 'Indeed';
}