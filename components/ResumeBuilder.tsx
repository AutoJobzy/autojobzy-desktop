import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Download, Plus, Trash2, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, XCircle, Loader2, User, Briefcase,
  GraduationCap, Code2, Award, FileText, Zap, X, Sparkles,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
const INPUT =
  'w-full bg-dark-900 border border-gray-700 rounded-lg py-2 px-3 text-white text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all placeholder:text-gray-600';

// ── TYPES ──────────────────────────────────────────────────────────────────────
type View = 'categories' | 'templates' | 'builder';

interface Category {
  id: string; name: string; emoji: string; description: string;
  gradient: string; keywords: string[];
}
interface TemplateStyle {
  id: string; name: string; description: string;
  primary: string; accent: string; layout: 'single' | 'sidebar';
}
interface WorkExp {
  id: string; company: string; role: string;
  startDate: string; endDate: string; current: boolean; bullets: string[];
}
interface Edu {
  id: string; school: string; degree: string; field: string; year: string;
}
interface ResumeData {
  fullName: string; email: string; phone: string; location: string;
  linkedin: string; targetRole: string; summary: string;
  experiences: WorkExp[]; education: Edu[];
  skills: string[]; certifications: string[];
}
interface ATSIssue { type: 'error' | 'warning' | 'ok'; section: string; message: string; }

// ── DATA ───────────────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  { id: 'software', name: 'Software Engineering', emoji: '💻', description: 'Full Stack, Backend, Frontend, Mobile', gradient: 'from-blue-500 to-cyan-600', keywords: ['react', 'node', 'python', 'api', 'sql', 'git', 'docker', 'javascript', 'typescript', 'agile', 'rest', 'microservices'] },
  { id: 'data', name: 'Data Science & AI', emoji: '🤖', description: 'ML, Analytics, Data Engineering', gradient: 'from-violet-500 to-purple-600', keywords: ['machine learning', 'python', 'tensorflow', 'analytics', 'sql', 'pandas', 'deep learning', 'statistics', 'tableau', 'data pipeline'] },
  { id: 'product', name: 'Product Management', emoji: '📱', description: 'Product Strategy, Roadmap, Growth', gradient: 'from-orange-500 to-red-600', keywords: ['roadmap', 'stakeholder', 'kpi', 'agile', 'user research', 'okr', 'sprint', 'backlog', 'mvp', 'metrics'] },
  { id: 'marketing', name: 'Marketing & Growth', emoji: '📢', description: 'Digital Marketing, SEO, Brand', gradient: 'from-green-500 to-emerald-600', keywords: ['seo', 'campaign', 'analytics', 'conversion', 'brand', 'content marketing', 'social media', 'email marketing', 'roi', 'lead generation'] },
  { id: 'finance', name: 'Finance & Accounting', emoji: '💰', description: 'Financial Analysis, Accounting, Banking', gradient: 'from-yellow-500 to-amber-600', keywords: ['financial modeling', 'excel', 'budgeting', 'forecasting', 'audit', 'balance sheet', 'p&l', 'valuation', 'gaap', 'reporting'] },
  { id: 'hr', name: 'Human Resources', emoji: '👥', description: 'Recruitment, L&D, HR Operations', gradient: 'from-pink-500 to-rose-600', keywords: ['recruitment', 'talent acquisition', 'hris', 'onboarding', 'performance management', 'employee relations', 'payroll', 'compliance', 'diversity', 'culture'] },
  { id: 'sales', name: 'Sales & Business Dev', emoji: '📈', description: 'B2B Sales, Account Management, CRM', gradient: 'from-indigo-500 to-blue-600', keywords: ['revenue', 'pipeline', 'crm', 'b2b', 'quota', 'account management', 'negotiation', 'salesforce', 'lead generation', 'closing'] },
  { id: 'design', name: 'Design & UX', emoji: '🎨', description: 'UI/UX, Product Design, Branding', gradient: 'from-fuchsia-500 to-purple-600', keywords: ['figma', 'ux', 'wireframe', 'user research', 'prototyping', 'design system', 'adobe', 'usability', 'interaction design', 'accessibility'] },
  { id: 'devops', name: 'DevOps & Cloud', emoji: '☁️', description: 'AWS, GCP, CI/CD, Infrastructure', gradient: 'from-sky-500 to-blue-600', keywords: ['aws', 'docker', 'kubernetes', 'ci/cd', 'terraform', 'jenkins', 'monitoring', 'linux', 'automation', 'reliability'] },
  { id: 'project', name: 'Project Management', emoji: '📋', description: 'PMP, Agile, Scrum, Delivery', gradient: 'from-teal-500 to-green-600', keywords: ['agile', 'scrum', 'risk management', 'stakeholder', 'budget', 'timeline', 'delivery', 'pmp', 'jira', 'resource planning'] },
  { id: 'customer', name: 'Customer Success', emoji: '⭐', description: 'SaaS, Onboarding, Retention', gradient: 'from-amber-500 to-orange-600', keywords: ['nps', 'retention', 'onboarding', 'saas', 'churn', 'upsell', 'qbr', 'adoption', 'customer health', 'success plan'] },
  { id: 'operations', name: 'Operations', emoji: '⚙️', description: 'Process Improvement, Supply Chain', gradient: 'from-slate-500 to-gray-600', keywords: ['process improvement', 'efficiency', 'supply chain', 'lean', 'six sigma', 'workflow', 'logistics', 'vendor management', 'kpi', 'cost reduction'] },
  { id: 'java', name: 'Java Full Stack Developer', emoji: '☕', description: 'Spring Boot, Microservices, React/Angular', gradient: 'from-orange-600 to-red-700', keywords: ['java', 'spring boot', 'microservices', 'react', 'angular', 'rest api', 'hibernate', 'maven', 'sql', 'docker', 'aws', 'junit'] },
  { id: 'dotnet', name: '.NET Full Stack Developer', emoji: '🔷', description: 'C#, ASP.NET Core, Azure, React', gradient: 'from-blue-600 to-indigo-700', keywords: ['c#', 'asp.net core', '.net', 'azure', 'react', 'sql server', 'entity framework', 'microservices', 'rest api', 'docker', 'visual studio', 'linq'] },
  { id: 'mern', name: 'MERN Stack Developer', emoji: '🌿', description: 'MongoDB, Express, React, Node.js', gradient: 'from-green-600 to-teal-700', keywords: ['mongodb', 'express', 'react', 'node.js', 'javascript', 'typescript', 'rest api', 'graphql', 'redux', 'docker', 'aws', 'git'] },
  { id: 'mobile', name: 'Mobile App Developer', emoji: '📲', description: 'React Native, Flutter, iOS/Android', gradient: 'from-purple-600 to-pink-700', keywords: ['react native', 'flutter', 'ios', 'android', 'dart', 'swift', 'kotlin', 'firebase', 'rest api', 'redux', 'app store', 'ci/cd'] },
];

const TEMPLATES: TemplateStyle[] = [
  { id: 't1', name: 'Classic Professional', description: 'Timeless for corporate roles', primary: '#1a365d', accent: '#2b6cb0', layout: 'single' },
  { id: 't2', name: 'Modern Minimal', description: 'Clean, whitespace-focused', primary: '#111827', accent: '#6366f1', layout: 'single' },
  { id: 't3', name: 'Tech Forward', description: 'Perfect for software & tech', primary: '#0f172a', accent: '#06b6d4', layout: 'sidebar' },
  { id: 't4', name: 'Creative Pro', description: 'Bold for creative professionals', primary: '#312e81', accent: '#8b5cf6', layout: 'sidebar' },
  { id: 't5', name: 'Executive Elite', description: 'Formal for senior leadership', primary: '#1c1917', accent: '#d97706', layout: 'single' },
  { id: 't6', name: 'Startup Vibe', description: 'Fresh for startup culture', primary: '#064e3b', accent: '#10b981', layout: 'sidebar' },
  { id: 't7', name: 'Academic Scholar', description: 'Structured for research roles', primary: '#1e3a5f', accent: '#dc2626', layout: 'single' },
  { id: 't8', name: 'ATS Champion', description: 'Maximum ATS compatibility', primary: '#111827', accent: '#374151', layout: 'single' },
  { id: 't9', name: 'Bold Leader', description: 'Strong typography for leaders', primary: '#7c2d12', accent: '#ea580c', layout: 'single' },
  { id: 't10', name: 'Digital Native', description: 'Fresh design for digital roles', primary: '#0c4a6e', accent: '#0284c7', layout: 'sidebar' },
];

// ── DEFAULT ATS-FRIENDLY DATA PER CATEGORY ────────────────────────────────────
function getDefaultData(cat: Category): ResumeData {
  const defaults: Record<string, Partial<ResumeData>> = {
    software: {
      targetRole: 'Senior Software Engineer',
      summary: 'Results-driven Software Engineer with 4+ years of experience building scalable web applications and REST APIs. Proven expertise in React, Node.js, and Python. Delivered microservices architecture reducing system latency by 35%. Passionate about clean code, agile practices, and continuous delivery.',
      experiences: [
        { id: uid(), company: 'TechCorp Solutions', role: 'Software Engineer', startDate: 'Jan 2022', endDate: '', current: true,
          bullets: ['Developed and maintained 10+ REST APIs using Node.js and Express, improving response time by 35%', 'Built reusable React components reducing frontend development time by 25% across 3 product teams', 'Implemented CI/CD pipelines using Docker and Jenkins, cutting deployment time from 2 hours to 15 minutes', 'Collaborated in agile sprints, consistently delivering features on time with 98% test coverage'] },
        { id: uid(), company: 'Infosys Limited', role: 'Associate Software Engineer', startDate: 'Jul 2020', endDate: 'Dec 2021', current: false,
          bullets: ['Designed and developed microservices using Python and FastAPI, serving 50,000+ daily active users', 'Optimized SQL database queries reducing page load time by 40% for critical reports', 'Integrated third-party APIs (payment gateway, SMS) into production applications with 99.9% uptime'] },
      ],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'REST API', 'SQL', 'Docker', 'Git', 'Agile', 'Microservices', 'AWS'],
      certifications: ['AWS Certified Developer – Associate', 'MongoDB Certified Developer'],
    },
    data: {
      targetRole: 'Senior Data Scientist',
      summary: 'Analytical Data Scientist with 4+ years of experience building machine learning models and data pipelines. Proficient in Python, TensorFlow, and SQL. Delivered predictive models improving business revenue by 20%. Skilled in translating complex data into actionable insights for stakeholders.',
      experiences: [
        { id: uid(), company: 'Analytics Ventures', role: 'Data Scientist', startDate: 'Mar 2022', endDate: '', current: true,
          bullets: ['Built machine learning classification models using TensorFlow achieving 94% accuracy on customer churn prediction', 'Developed automated data pipelines using Python and Pandas processing 5M+ records daily', 'Created interactive Tableau dashboards reducing reporting time by 60% for business stakeholders', 'Performed statistical analysis and A/B testing increasing campaign conversion rates by 18%'] },
        { id: uid(), company: 'DataMinds Pvt Ltd', role: 'Data Analyst', startDate: 'Jun 2020', endDate: 'Feb 2022', current: false,
          bullets: ['Designed and optimized SQL queries to extract, transform, and load data from 8 different source systems', 'Built deep learning NLP models using Python to classify customer support tickets with 91% precision', 'Delivered weekly analytics reports to leadership enabling data-driven decisions across 3 business units'] },
      ],
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas', 'NumPy', 'Tableau', 'Deep Learning', 'Statistics', 'Data Pipeline', 'Scikit-learn', 'Power BI'],
      certifications: ['Google Professional Data Engineer', 'Coursera Deep Learning Specialization'],
    },
    product: {
      targetRole: 'Senior Product Manager',
      summary: 'Strategic Product Manager with 4+ years of experience driving product roadmap from ideation to launch. Expert in agile, OKR frameworks, and user research. Launched 3 products achieving 200K+ users in 6 months. Skilled in aligning stakeholders and translating customer insights into measurable business outcomes.',
      experiences: [
        { id: uid(), company: 'GrowthTech Inc', role: 'Product Manager', startDate: 'Feb 2022', endDate: '', current: true,
          bullets: ['Defined product roadmap and KPIs for B2B SaaS platform, increasing MRR by 45% in 12 months', 'Led agile sprints with cross-functional teams of 15+, delivering MVP 2 weeks ahead of schedule', 'Conducted 50+ user research interviews, identifying 3 core pain points that drove Q2 backlog prioritization', 'Implemented OKR framework across product team, improving quarterly goal achievement rate from 60% to 88%'] },
        { id: uid(), company: 'StartupHub Solutions', role: 'Associate Product Manager', startDate: 'Aug 2020', endDate: 'Jan 2022', current: false,
          bullets: ['Managed end-to-end launch of mobile app feature reaching 80,000 active users within 3 months of launch', 'Analyzed metrics and user feedback to iterate on MVP, reducing churn rate by 22%', 'Collaborated with engineering and design to define 40+ user stories in Jira for two product sprints'] },
      ],
      skills: ['Product Roadmap', 'Agile', 'Scrum', 'User Research', 'OKR', 'KPI', 'Jira', 'Backlog Management', 'MVP', 'Stakeholder Management', 'A/B Testing', 'Metrics Analysis'],
      certifications: ['Product Management Certification – Product School', 'Certified Scrum Product Owner (CSPO)'],
    },
    marketing: {
      targetRole: 'Digital Marketing Manager',
      summary: 'Results-oriented Digital Marketing Manager with 4+ years of experience driving brand growth through SEO, paid campaigns, and content marketing. Increased organic traffic by 120% and ROI by 40% across multiple B2B clients. Skilled in analytics, lead generation, and conversion rate optimization.',
      experiences: [
        { id: uid(), company: 'BrandBoost Agency', role: 'Digital Marketing Manager', startDate: 'Jan 2022', endDate: '', current: true,
          bullets: ['Led SEO strategy for 5 B2B clients, growing combined organic traffic by 120% in 8 months', 'Managed ₹50L annual paid advertising budget across Google Ads and Meta, achieving 40% ROI improvement', 'Launched email marketing campaigns with 28% open rate, generating 500+ qualified leads per month', 'Built and optimized conversion funnels increasing lead-to-customer conversion rate by 18%'] },
        { id: uid(), company: 'DigitalEdge Pvt Ltd', role: 'Marketing Executive', startDate: 'May 2020', endDate: 'Dec 2021', current: false,
          bullets: ['Created and distributed content marketing pieces (blogs, social media) growing brand followers by 60%', 'Analysed campaign analytics using Google Analytics and Tableau, presenting insights to senior leadership weekly', 'Executed social media campaigns across Instagram, LinkedIn, achieving 35% engagement rate improvement'] },
      ],
      skills: ['SEO', 'Google Ads', 'Content Marketing', 'Social Media', 'Email Marketing', 'Google Analytics', 'Lead Generation', 'Campaign Management', 'Conversion Rate Optimization', 'ROI Analysis', 'HubSpot', 'Brand Strategy'],
      certifications: ['Google Ads Certified', 'HubSpot Inbound Marketing Certification'],
    },
    finance: {
      targetRole: 'Senior Financial Analyst',
      summary: 'Detail-oriented Financial Analyst with 4+ years of experience in financial modeling, budgeting, and reporting. Proficient in Excel, SAP, and Power BI. Delivered cost reduction initiatives saving ₹2Cr annually. Strong expertise in P&L management, forecasting, and audit compliance.',
      experiences: [
        { id: uid(), company: 'CapitalEdge Finance', role: 'Senior Financial Analyst', startDate: 'Feb 2022', endDate: '', current: true,
          bullets: ['Built comprehensive financial models and valuation reports supporting ₹50Cr M&A decisions', 'Managed annual budgeting process for 6 business units, improving forecast accuracy from 78% to 94%', 'Developed P&L and balance sheet dashboards in Power BI reducing monthly close cycle from 10 days to 5 days', 'Led cost reduction initiative identifying ₹2Cr in savings through vendor renegotiation and process optimization'] },
        { id: uid(), company: 'Deloitte India', role: 'Financial Analyst', startDate: 'Jun 2020', endDate: 'Jan 2022', current: false,
          bullets: ['Prepared GAAP-compliant financial statements and audit reports for 15+ corporate clients annually', 'Conducted variance analysis on actuals vs forecast, presenting findings to CFO and senior leadership', 'Streamlined Excel-based reporting process using macros, saving 8 hours per month in manual effort'] },
      ],
      skills: ['Financial Modeling', 'Excel', 'Budgeting', 'Forecasting', 'P&L Management', 'Balance Sheet', 'SAP', 'Power BI', 'Valuation', 'GAAP', 'Audit', 'Reporting'],
      certifications: ['CFA Level 1', 'Certified Management Accountant (CMA)'],
    },
    hr: {
      targetRole: 'HR Manager',
      summary: 'Dynamic HR Manager with 4+ years of experience in talent acquisition, employee relations, and HR operations. Successfully hired 150+ professionals across tech and non-tech roles. Expert in HRIS, compliance, and performance management. Reduced attrition by 25% through culture and engagement initiatives.',
      experiences: [
        { id: uid(), company: 'TalentFirst HR', role: 'HR Manager', startDate: 'Mar 2022', endDate: '', current: true,
          bullets: ['Led end-to-end recruitment for 80+ positions annually, reducing average time-to-hire from 45 to 28 days', 'Designed and implemented onboarding program increasing 90-day retention rate by 30%', 'Managed performance management cycle for 200+ employees, driving 85% completion rate for annual reviews', 'Reduced employee attrition by 25% through targeted engagement surveys and culture improvement initiatives'] },
        { id: uid(), company: 'PeopleFirst Solutions', role: 'HR Executive', startDate: 'Aug 2020', endDate: 'Feb 2022', current: false,
          bullets: ['Managed payroll processing for 300+ employees ensuring 100% compliance with statutory requirements', 'Implemented HRIS (Darwinbox) for 400+ employees, reducing HR administrative workload by 40%', 'Conducted employee relations investigations resolving 15+ grievance cases maintaining workplace harmony'] },
      ],
      skills: ['Talent Acquisition', 'Recruitment', 'HRIS', 'Onboarding', 'Performance Management', 'Employee Relations', 'Payroll', 'Compliance', 'Darwinbox', 'HR Operations', 'Diversity & Inclusion', 'Culture Building'],
      certifications: ['SHRM Certified Professional (SHRM-CP)', 'LinkedIn Recruiter Certification'],
    },
    sales: {
      targetRole: 'Senior Sales Manager',
      summary: 'High-performing Sales Manager with 4+ years of experience in B2B sales and account management. Consistently exceeded quota by 130%+ across all quarters. Expert in CRM, pipeline management, and enterprise deal closing. Generated ₹5Cr+ in new business revenue in FY2023.',
      experiences: [
        { id: uid(), company: 'Enterprise SalesForce', role: 'Senior Sales Manager', startDate: 'Jan 2022', endDate: '', current: true,
          bullets: ['Generated ₹5Cr+ in new B2B revenue by acquiring 25 enterprise accounts through consultative selling', 'Managed and grew a 15-member sales team, achieving 130% of annual quota for 2 consecutive years', 'Built and maintained CRM pipeline of 100+ accounts using Salesforce, improving forecast accuracy to 92%', 'Led negotiation and closed 3 landmark deals worth ₹1Cr+ each through strategic account management'] },
        { id: uid(), company: 'GrowthSales Pvt Ltd', role: 'Sales Executive', startDate: 'Jun 2020', endDate: 'Dec 2021', current: false,
          bullets: ['Achieved 125% of quarterly sales quota through cold calling, LinkedIn outreach, and referral networking', 'Managed 40+ active accounts ensuring 95% renewal rate through proactive relationship management', 'Collaborated with marketing on lead generation campaigns resulting in 200+ qualified leads per quarter'] },
      ],
      skills: ['B2B Sales', 'CRM', 'Salesforce', 'Account Management', 'Pipeline Management', 'Lead Generation', 'Negotiation', 'Revenue Growth', 'Quota Achievement', 'Enterprise Sales', 'Cold Calling', 'Closing'],
      certifications: ['Salesforce Certified Sales Cloud Consultant', 'HubSpot Sales Certification'],
    },
    design: {
      targetRole: 'Senior UX/UI Designer',
      summary: 'Creative UX/UI Designer with 4+ years of experience delivering user-centric digital products. Proficient in Figma, Adobe XD, and design systems. Increased user engagement by 40% through research-driven redesign. Expert in wireframing, prototyping, usability testing, and accessibility standards.',
      experiences: [
        { id: uid(), company: 'DesignCraft Studio', role: 'Senior UX Designer', startDate: 'Feb 2022', endDate: '', current: true,
          bullets: ['Led end-to-end UX design for mobile app serving 500K+ users, increasing engagement by 40% post-launch', 'Built and maintained comprehensive design system with 200+ components, reducing design-to-dev handoff by 50%', 'Conducted 30+ usability tests and user research interviews, translating findings into actionable design improvements', 'Designed accessible interfaces following WCAG 2.1 AA standards across web and mobile products'] },
        { id: uid(), company: 'PixelEdge Agency', role: 'UI/UX Designer', startDate: 'Jul 2020', endDate: 'Jan 2022', current: false,
          bullets: ['Created wireframes and interactive prototypes in Figma for 10+ client projects from discovery to delivery', 'Redesigned e-commerce checkout flow reducing cart abandonment rate by 28% through UX best practices', 'Collaborated with developers to ensure pixel-perfect implementation of design specs in Agile sprints'] },
      ],
      skills: ['Figma', 'Adobe XD', 'UX Design', 'Wireframing', 'Prototyping', 'User Research', 'Design System', 'Usability Testing', 'Accessibility', 'Interaction Design', 'Adobe Illustrator', 'Sketch'],
      certifications: ['Google UX Design Certificate', 'Interaction Design Foundation Certification'],
    },
    devops: {
      targetRole: 'Senior DevOps Engineer',
      summary: 'Experienced DevOps Engineer with 4+ years of expertise in cloud infrastructure, CI/CD automation, and site reliability. Proficient in AWS, Kubernetes, Docker, and Terraform. Reduced deployment time by 70% and improved system uptime to 99.9%. Passionate about automation, monitoring, and scalable infrastructure.',
      experiences: [
        { id: uid(), company: 'CloudNative Systems', role: 'Senior DevOps Engineer', startDate: 'Jan 2022', endDate: '', current: true,
          bullets: ['Architected and managed AWS infrastructure (EC2, EKS, RDS, S3) supporting 1M+ daily API requests', 'Built CI/CD pipelines using Jenkins and GitHub Actions, reducing deployment time from 2 hours to 18 minutes', 'Implemented Kubernetes cluster orchestration for 50+ microservices ensuring 99.9% uptime SLA', 'Automated infrastructure provisioning with Terraform reducing manual setup effort by 80%'] },
        { id: uid(), company: 'Infra Solutions Ltd', role: 'DevOps Engineer', startDate: 'Aug 2020', endDate: 'Dec 2021', current: false,
          bullets: ['Containerized 20+ legacy applications using Docker, enabling consistent environments across dev, staging, and production', 'Set up centralized monitoring and alerting using Prometheus and Grafana, reducing MTTR by 55%', 'Collaborated with development teams to improve Linux server configurations and automate repetitive operational tasks'] },
      ],
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Jenkins', 'Linux', 'Monitoring', 'Automation', 'GitHub Actions', 'Prometheus', 'Reliability Engineering'],
      certifications: ['AWS Certified Solutions Architect – Associate', 'Certified Kubernetes Administrator (CKA)'],
    },
    project: {
      targetRole: 'Senior Project Manager',
      summary: 'Certified Project Manager with 4+ years of experience delivering complex IT and business transformation projects. Expert in Agile, Scrum, and PMP methodologies. Successfully managed projects worth ₹10Cr+ with on-time delivery rate of 95%. Skilled in risk management, stakeholder engagement, and cross-functional team leadership.',
      experiences: [
        { id: uid(), company: 'ProjectPro Consulting', role: 'Senior Project Manager', startDate: 'Feb 2022', endDate: '', current: true,
          bullets: ['Managed portfolio of 5 concurrent IT projects worth ₹10Cr+, achieving 95% on-time delivery rate', 'Led cross-functional Agile teams of 20+ across engineering, design, and business analysis functions', 'Implemented risk management framework identifying and mitigating 12 critical risks saving ₹1.5Cr in potential losses', 'Managed stakeholder communication and executive reporting for C-suite, maintaining 98% stakeholder satisfaction score'] },
        { id: uid(), company: 'TechDeliver Pvt Ltd', role: 'Project Manager', startDate: 'Jun 2020', endDate: 'Jan 2022', current: false,
          bullets: ['Delivered ERP implementation project for 500-user organization 3 weeks ahead of schedule using Scrum framework', 'Created detailed project plans, WBS, and resource allocation schedules using MS Project and Jira', 'Resolved scope creep issues on 3 projects by implementing formal change control process, saving ₹80L in budget overruns'] },
      ],
      skills: ['Agile', 'Scrum', 'PMP', 'Risk Management', 'Stakeholder Management', 'Jira', 'Budget Management', 'MS Project', 'Resource Planning', 'Timeline Management', 'Cross-functional Leadership', 'Delivery'],
      certifications: ['PMP – Project Management Professional', 'Certified Scrum Master (CSM)'],
    },
    customer: {
      targetRole: 'Customer Success Manager',
      summary: 'Customer-focused Customer Success Manager with 4+ years of experience in SaaS onboarding, retention, and growth. Maintained 95%+ NPS and reduced churn by 30%. Expert in QBRs, success planning, and upsell strategies. Managed a portfolio of 50+ enterprise accounts with ₹8Cr ARR.',
      experiences: [
        { id: uid(), company: 'SaaSGrowth Platform', role: 'Senior Customer Success Manager', startDate: 'Mar 2022', endDate: '', current: true,
          bullets: ['Managed 50+ enterprise accounts with ₹8Cr ARR, maintaining 95%+ NPS score and 92% renewal rate', 'Reduced customer churn by 30% through proactive health monitoring and targeted engagement programs', 'Drove ₹2Cr in upsell and expansion revenue by identifying growth opportunities during QBR sessions', 'Designed and delivered onboarding program reducing time-to-value from 45 days to 18 days for new customers'] },
        { id: uid(), company: 'CloudSaaS Solutions', role: 'Customer Success Executive', startDate: 'Jun 2020', endDate: 'Feb 2022', current: false,
          bullets: ['Onboarded 30+ new enterprise customers achieving 90-day adoption rate of 85%', 'Monitored customer health scores using Gainsight, proactively engaging at-risk accounts to prevent churn', 'Coordinated with product and engineering teams to resolve 100+ customer escalations with 98% satisfaction rate'] },
      ],
      skills: ['NPS', 'Customer Retention', 'Onboarding', 'SaaS', 'Churn Reduction', 'Upsell', 'QBR', 'Customer Health', 'Gainsight', 'Salesforce', 'Success Planning', 'Adoption'],
      certifications: ['Gainsight Certified Customer Success Manager', 'HubSpot Customer Success Certification'],
    },
    operations: {
      targetRole: 'Operations Manager',
      summary: 'Results-driven Operations Manager with 4+ years of experience in process improvement, supply chain, and operational excellence. Implemented Lean and Six Sigma practices reducing operational costs by ₹3Cr annually. Expert in workflow optimization, vendor management, and cross-functional team leadership.',
      experiences: [
        { id: uid(), company: 'OperateFirst Industries', role: 'Operations Manager', startDate: 'Jan 2022', endDate: '', current: true,
          bullets: ['Led process improvement initiatives using Lean Six Sigma, reducing operational costs by ₹3Cr annually', 'Managed vendor relationships with 20+ suppliers, renegotiating contracts saving ₹1.2Cr in procurement costs', 'Optimized supply chain workflows reducing order fulfillment time by 35% and improving delivery accuracy to 99%', 'Built cross-functional operations team of 25, implementing KPI dashboards increasing efficiency metrics by 40%'] },
        { id: uid(), company: 'LogiTech Solutions', role: 'Operations Executive', startDate: 'Jul 2020', endDate: 'Dec 2021', current: false,
          bullets: ['Streamlined logistics workflows reducing warehouse processing time by 30% through automation and SOPs', 'Managed daily operations for a 100-member team ensuring 100% compliance with safety and quality standards', 'Analysed operational KPIs and prepared monthly reports for senior management enabling data-driven decisions'] },
      ],
      skills: ['Process Improvement', 'Lean', 'Six Sigma', 'Supply Chain', 'Operations Management', 'Vendor Management', 'KPI Management', 'Workflow Optimization', 'Logistics', 'Cost Reduction', 'Cross-functional Leadership', 'Efficiency'],
      certifications: ['Lean Six Sigma Green Belt', 'Certified Supply Chain Professional (CSCP)'],
    },
  };

  const extraDefaults: Record<string, Partial<ResumeData>> = {
    java: {
      targetRole: 'Java Full Stack Developer',
      summary: 'Skilled Java Full Stack Developer with 4+ years of experience building enterprise-grade applications using Spring Boot, Microservices, and React. Delivered REST APIs handling 100K+ daily requests with 99.9% uptime. Strong expertise in Hibernate, Maven, Docker, and AWS. Passionate about clean architecture and test-driven development.',
      experiences: [
        { id: uid(), company: 'EnterpriseApps India', role: 'Java Full Stack Developer', startDate: 'Jan 2022', endDate: '', current: true,
          bullets: ['Developed microservices-based backend using Spring Boot and REST APIs, serving 500K+ daily active users', 'Built dynamic React frontend with Redux state management reducing page load time by 40%', 'Implemented Hibernate ORM with MySQL, optimizing complex queries and reducing database response time by 35%', 'Containerized 12 Spring Boot microservices using Docker and deployed on AWS ECS with auto-scaling'] },
        { id: uid(), company: 'TechSolutions Pvt Ltd', role: 'Junior Java Developer', startDate: 'Jul 2020', endDate: 'Dec 2021', current: false,
          bullets: ['Developed RESTful APIs using Spring Boot and Maven for e-commerce platform processing 10K+ daily orders', 'Created Angular frontend modules consuming backend REST APIs, improving user experience by 25%', 'Wrote JUnit and Mockito test cases achieving 85% code coverage across all backend services'] },
      ],
      skills: ['Java', 'Spring Boot', 'Spring MVC', 'Microservices', 'Hibernate', 'JPA', 'React', 'Angular', 'REST API', 'Maven', 'MySQL', 'PostgreSQL', 'Docker', 'AWS', 'JUnit', 'Git', 'Agile', 'Jenkins'],
      certifications: ['Oracle Certified Professional: Java SE Developer', 'AWS Certified Developer – Associate'],
    },
    dotnet: {
      targetRole: '.NET Full Stack Developer',
      summary: 'Proficient .NET Full Stack Developer with 4+ years of experience building enterprise applications using C#, ASP.NET Core, and React. Developed cloud-native solutions on Microsoft Azure with 99.9% uptime. Expert in Entity Framework, SQL Server, and microservices architecture. Passionate about SOLID principles and clean code.',
      experiences: [
        { id: uid(), company: 'Microsoft Partner Solutions', role: '.NET Full Stack Developer', startDate: 'Feb 2022', endDate: '', current: true,
          bullets: ['Built enterprise web application using ASP.NET Core Web API and React, serving 200K+ daily users on Azure', 'Implemented Entity Framework Core with SQL Server, reducing data access layer development time by 45%', 'Designed and deployed microservices on Azure Kubernetes Service (AKS) with Docker containerization', 'Developed LINQ-optimized database queries improving report generation performance by 50%'] },
        { id: uid(), company: 'Infosys BPM', role: 'Junior .NET Developer', startDate: 'Jun 2020', endDate: 'Jan 2022', current: false,
          bullets: ['Developed C# ASP.NET Core REST APIs for insurance management system with 99.5% uptime SLA', 'Integrated Azure Service Bus for async messaging between 8 microservices reducing system coupling', 'Built responsive React frontend consuming .NET APIs with TypeScript, improving code maintainability by 30%'] },
      ],
      skills: ['C#', 'ASP.NET Core', '.NET 8', 'Entity Framework Core', 'LINQ', 'SQL Server', 'Azure', 'React', 'TypeScript', 'Microservices', 'REST API', 'Docker', 'Azure DevOps', 'Visual Studio', 'NUnit', 'Git'],
      certifications: ['Microsoft Certified: Azure Developer Associate (AZ-204)', 'Microsoft Certified: .NET Fundamentals'],
    },
    mern: {
      targetRole: 'MERN Stack Developer',
      summary: 'Full Stack MERN Developer with 4+ years of experience building scalable web applications. Proficient in MongoDB, Express.js, React, and Node.js. Delivered GraphQL APIs and real-time features serving 300K+ users. Expert in Redux, TypeScript, Docker, and AWS deployment.',
      experiences: [
        { id: uid(), company: 'WebScale Startups', role: 'MERN Stack Developer', startDate: 'Feb 2022', endDate: '', current: true,
          bullets: ['Built full-stack MERN application with GraphQL API serving 300K+ monthly active users on AWS', 'Developed React frontend with Redux Toolkit, reducing state management bugs by 60%', 'Optimized MongoDB aggregation pipelines reducing query response time from 800ms to 120ms', 'Implemented real-time features using Socket.io for live notifications serving 50K+ concurrent users'] },
        { id: uid(), company: 'CodeCraft Solutions', role: 'Full Stack Developer', startDate: 'Jul 2020', endDate: 'Jan 2022', current: false,
          bullets: ['Developed 15+ REST APIs with Node.js and Express.js supporting an e-commerce platform with 10K+ orders/day', 'Migrated legacy jQuery frontend to React with TypeScript, improving maintainability and reducing bugs by 45%', 'Set up CI/CD pipeline with GitHub Actions and Docker reducing deployment time by 65%'] },
      ],
      skills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'JavaScript', 'TypeScript', 'REST API', 'GraphQL', 'Redux', 'Socket.io', 'Docker', 'AWS', 'JWT', 'Git', 'Agile', 'Webpack'],
      certifications: ['MongoDB Certified Developer', 'AWS Certified Developer – Associate'],
    },
    mobile: {
      targetRole: 'Senior Mobile App Developer',
      summary: 'Experienced Mobile App Developer with 4+ years building high-performance iOS and Android apps. Expert in React Native and Flutter with 5+ apps published on App Store and Play Store (1M+ downloads). Skilled in Firebase, REST APIs, Redux, and CI/CD pipelines for mobile. Passionate about smooth UX and performance optimization.',
      experiences: [
        { id: uid(), company: 'MobileFirst Technologies', role: 'Senior Mobile Developer', startDate: 'Mar 2022', endDate: '', current: true,
          bullets: ['Developed cross-platform React Native app with 500K+ downloads achieving 4.8★ App Store rating', 'Built Flutter e-commerce app integrating Razorpay and Firebase, processing ₹2Cr+ monthly transactions', 'Optimized app performance reducing startup time by 45% and achieving 60fps smooth animations', 'Set up Fastlane CI/CD pipelines automating App Store and Play Store releases, saving 5 hours per week'] },
        { id: uid(), company: 'AppVenture Studio', role: 'Mobile Developer', startDate: 'Jun 2020', endDate: 'Feb 2022', current: false,
          bullets: ['Developed 4 React Native apps from scratch, delivering all projects on time with 5-star client ratings', 'Integrated Firebase Analytics, Push Notifications, and Crashlytics across 6 production mobile applications', 'Implemented Redux for state management reducing component re-renders by 40% in high-traffic screens'] },
      ],
      skills: ['React Native', 'Flutter', 'Dart', 'iOS', 'Android', 'JavaScript', 'TypeScript', 'Firebase', 'Redux', 'REST API', 'Swift', 'Kotlin', 'App Store Optimization', 'Fastlane', 'Git'],
      certifications: ['Google Associate Android Developer', 'Meta React Native Certification'],
    },
  };

  const d = { ...extraDefaults[cat.id], ...defaults[cat.id] } || {};
  return {
    fullName: 'Your Name',
    email: 'your.email@gmail.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    linkedin: 'linkedin.com/in/yourprofile',
    targetRole: d.targetRole || cat.name,
    summary: d.summary || `Experienced ${cat.name} professional with 4+ years of proven expertise. Skilled in ${cat.keywords.slice(0, 4).join(', ')}. Consistently delivered measurable results and contributed to business growth.`,
    experiences: d.experiences || [],
    education: [
      { id: uid(), school: 'University of Mumbai', degree: 'B.Tech', field: 'Computer Science', year: '2020' },
    ],
    skills: d.skills || cat.keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    certifications: d.certifications || [],
  };
}

// ── ATS SCORING ────────────────────────────────────────────────────────────────
function calcATS(resume: ResumeData, cat: Category): { score: number; issues: ATSIssue[] } {
  const issues: ATSIssue[] = [];
  let score = 0;

  // Contact (15 pts)
  let c = 0;
  if (resume.fullName.trim()) c += 4;
  if (resume.email.trim()) c += 4;
  if (resume.phone.trim()) c += 4;
  if (resume.location.trim()) c += 3;
  score += c;
  if (!resume.phone.trim()) issues.push({ type: 'error', section: 'Contact', message: 'Add your phone number — recruiters need it!' });
  if (!resume.location.trim()) issues.push({ type: 'warning', section: 'Contact', message: 'Add your city/location for local matches' });
  if (!resume.linkedin.trim()) issues.push({ type: 'warning', section: 'Contact', message: 'Add LinkedIn URL to boost credibility' });
  if (c === 15) issues.push({ type: 'ok', section: 'Contact', message: 'Contact info complete ✓' });

  // Summary (20 pts)
  let s = 0;
  const sLen = resume.summary.trim().length;
  if (sLen > 50) s += 8;
  if (sLen > 150) s += 7;
  const kwInSum = cat.keywords.filter(k => resume.summary.toLowerCase().includes(k));
  if (kwInSum.length >= 2) s += 5;
  score += s;
  if (sLen === 0) issues.push({ type: 'error', section: 'Summary', message: 'Add a professional summary — first thing recruiters read!' });
  else if (sLen < 150) issues.push({ type: 'warning', section: 'Summary', message: `Summary too short (${sLen} chars). Aim for 150+ characters` });
  if (kwInSum.length < 2) issues.push({ type: 'warning', section: 'Summary', message: `Include role keywords: ${cat.keywords.slice(0, 3).join(', ')}` });
  if (s === 20) issues.push({ type: 'ok', section: 'Summary', message: 'Professional summary is strong ✓' });

  // Experience (25 pts)
  let e = 0;
  if (resume.experiences.length > 0) {
    e += 10;
    const withBullets = resume.experiences.filter(ex => ex.bullets.filter(b => b.trim()).length >= 3);
    if (withBullets.length > 0) e += 10;
    const verbs = ['developed', 'led', 'managed', 'built', 'improved', 'increased', 'designed', 'created', 'implemented', 'achieved', 'delivered', 'launched', 'reduced', 'grew', 'optimized', 'streamlined', 'spearheaded'];
    const hasVerbs = resume.experiences.some(ex => ex.bullets.some(b => verbs.some(v => b.toLowerCase().includes(v))));
    if (hasVerbs) e += 5;
  }
  score += e;
  if (resume.experiences.length === 0) issues.push({ type: 'error', section: 'Experience', message: 'Add at least one work experience' });
  else if (!resume.experiences.some(ex => ex.bullets.filter(b => b.trim()).length >= 3)) issues.push({ type: 'error', section: 'Experience', message: 'Add 3+ bullet points per job for higher ATS score' });
  else if (e < 25) issues.push({ type: 'warning', section: 'Experience', message: 'Start bullets with action verbs: Led, Built, Delivered...' });
  if (e === 25) issues.push({ type: 'ok', section: 'Experience', message: 'Work experience is well-documented ✓' });

  // Education (15 pts)
  let ed = 0;
  if (resume.education.length > 0) {
    ed += 10;
    if (resume.education.filter(edu => edu.school.trim() && edu.degree.trim()).length > 0) ed += 5;
  }
  score += ed;
  if (resume.education.length === 0) issues.push({ type: 'error', section: 'Education', message: 'Add your education details' });
  if (ed === 15) issues.push({ type: 'ok', section: 'Education', message: 'Education section complete ✓' });

  // Skills (15 pts)
  let sk = 0;
  if (resume.skills.length >= 5) sk += 8;
  else if (resume.skills.length > 0) sk += 3;
  if (resume.skills.length >= 10) sk += 7;
  else if (resume.skills.length >= 5) sk += 4;
  score += sk;
  if (resume.skills.length < 5) issues.push({ type: 'error', section: 'Skills', message: `Add at least 5 skills (you have ${resume.skills.length})` });
  else if (resume.skills.length < 10) issues.push({ type: 'warning', section: 'Skills', message: `Add ${10 - resume.skills.length} more skills to reach 90+` });
  if (sk === 15) issues.push({ type: 'ok', section: 'Skills', message: '10+ skills listed — excellent! ✓' });

  // Keyword coverage (10 pts)
  const full = [resume.summary, resume.experiences.flatMap(ex => ex.bullets).join(' '), resume.skills.join(' ')].join(' ').toLowerCase();
  const matched = cat.keywords.filter(k => full.includes(k));
  const kwPts = Math.round((matched.length / cat.keywords.length) * 10);
  score += kwPts;
  if (kwPts < 7) {
    const missing = cat.keywords.filter(k => !full.includes(k)).slice(0, 4);
    issues.push({ type: 'warning', section: 'Keywords', message: `Include missing keywords: ${missing.join(', ')}` });
  }

  return { score: Math.min(100, score), issues };
}

function uid() { return Math.random().toString(36).substring(2, 9); }

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function ResumeBuilder() {
  const [view, setView] = useState<View>('categories');
  const [cat, setCat] = useState<Category | null>(null);
  const [tmpl, setTmpl] = useState<TemplateStyle | null>(null);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({
    contact: true, summary: true, experience: true,
    education: true, skills: true, certs: false,
  });
  const [resume, setResume] = useState<ResumeData>({
    fullName: '', email: '', phone: '', location: '', linkedin: '',
    targetRole: '', summary: '', experiences: [], education: [],
    skills: [], certifications: [],
  });
  const [atsScore, setAtsScore] = useState(0);
  const [atsIssues, setAtsIssues] = useState<ATSIssue[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === 'builder' && cat) {
      // Start with ATS-friendly default data for this category
      setResume(getDefaultData(cat));
      // Then override with user's real profile
      loadProfile();
    }
  }, [view]);

  useEffect(() => {
    if (cat && view === 'builder') {
      const { score, issues } = calcATS(resume, cat);
      setAtsScore(score);
      setAtsIssues(issues);
    }
  }, [resume, cat, view]);

  async function loadProfile() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const h = { 'Authorization': `Bearer ${token}` };
      const [sRes, skRes] = await Promise.all([
        fetch(`${API_BASE}/job-settings`, { headers: h }),
        fetch(`${API_BASE}/skills`, { headers: h }),
      ]);
      const settings = sRes.ok ? await sRes.json() : {};
      const rawSkills = skRes.ok ? await skRes.json() : [];
      const userSkills: string[] = (Array.isArray(rawSkills) ? rawSkills : [])
        .map((s: any) => (s.skill_name || s.display_name || '').trim()).filter(Boolean);

      // Override defaults with real user data (keep sample content for empty fields)
      setResume(prev => {
        const realName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || settings.fullName || '';
        const realEmail = user.email || settings.naukriEmail || '';
        const realLocation = settings.location || settings.preferredLocation || '';
        const realRole = settings.targetRole || '';
        // Merge user skills with default skills (user skills take priority, keep category defaults too)
        const mergedSkills = userSkills.length > 0
          ? [...new Set([...userSkills, ...prev.skills])].slice(0, 16)
          : prev.skills;
        return {
          ...prev,
          fullName: realName || prev.fullName,
          email: realEmail || prev.email,
          location: realLocation || prev.location,
          targetRole: realRole || prev.targetRole,
          skills: mergedSkills,
        };
      });
    } catch (_) { /* silent — keep defaults */ }
    setLoading(false);
  }

  function upd(field: keyof ResumeData, value: any) {
    setResume(p => ({ ...p, [field]: value }));
  }
  function updExp(id: string, field: string, value: any) {
    upd('experiences', resume.experiences.map(e => e.id === id ? { ...e, [field]: value } : e));
  }
  function updBullet(expId: string, i: number, val: string) {
    upd('experiences', resume.experiences.map(e => {
      if (e.id !== expId) return e;
      const b = [...e.bullets]; b[i] = val; return { ...e, bullets: b };
    }));
  }
  function addExp() {
    upd('experiences', [...resume.experiences, { id: uid(), company: '', role: '', startDate: '', endDate: '', current: false, bullets: ['', '', ''] }]);
  }
  function removeExp(id: string) { upd('experiences', resume.experiences.filter(e => e.id !== id)); }
  function addBullet(id: string) { upd('experiences', resume.experiences.map(e => e.id === id ? { ...e, bullets: [...e.bullets, ''] } : e)); }
  function removeBullet(expId: string, i: number) { upd('experiences', resume.experiences.map(e => e.id === expId ? { ...e, bullets: e.bullets.filter((_, idx) => idx !== i) } : e)); }
  function updEdu(id: string, field: string, val: string) { upd('education', resume.education.map(e => e.id === id ? { ...e, [field]: val } : e)); }
  function addEdu() { upd('education', [...resume.education, { id: uid(), school: '', degree: '', field: '', year: '' }]); }
  function removeEdu(id: string) { upd('education', resume.education.filter(e => e.id !== id)); }
  function addSkill(s: string) {
    const sk = s.trim();
    if (sk && !resume.skills.includes(sk)) upd('skills', [...resume.skills, sk]);
    setSkillInput('');
  }
  function removeSkill(s: string) { upd('skills', resume.skills.filter(x => x !== s)); }
  function onSkillKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); }
    if (e.key === 'Backspace' && !skillInput && resume.skills.length > 0) removeSkill(resume.skills[resume.skills.length - 1]);
  }
  function toggle(k: string) { setOpen(p => ({ ...p, [k]: !p[k] })); }

  async function generateWithAI(type: 'summary' | 'bullets', expId?: string) {
    const key = type === 'summary' ? 'summary' : `exp-${expId}`;
    setAiGenerating(key);
    try {
      const token = localStorage.getItem('token');
      const prompt = type === 'summary'
        ? `Write a professional resume summary for a ${resume.targetRole || cat?.name} with the following skills: ${resume.skills.slice(0, 8).join(', ')}.
           The summary should be 2-3 sentences (150-200 characters), ATS-optimized, include years of experience if known, mention key skills, and end with a strong value proposition.
           Return ONLY the summary text, no labels or extra content.`
        : `Write 4 strong ATS-optimized bullet points for a ${resume.targetRole || cat?.name} position.
           Use action verbs (Led, Developed, Implemented, Optimized), include quantified achievements (%, numbers, ₹), and incorporate these skills: ${resume.skills.slice(0, 5).join(', ')}.
           Format: one bullet per line, no bullet symbols. Return ONLY the 4 lines.`;

      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: prompt, systemPrompt: 'You are an expert resume writer specializing in ATS-optimized resumes for Indian job market. Be concise and impactful.' }),
      });

      if (res.ok) {
        const data = await res.json();
        const text: string = data.reply || '';
        if (type === 'summary') {
          upd('summary', text.trim());
        } else if (expId) {
          const lines = text.split('\n').map((l: string) => l.replace(/^[-•*]\s*/, '').trim()).filter((l: string) => l.length > 10).slice(0, 4);
          upd('experiences', resume.experiences.map(e => e.id === expId ? { ...e, bullets: lines.length > 0 ? lines : e.bullets } : e));
        }
      }
    } catch (_) { /* silent */ }
    setAiGenerating(null);
  }

  async function handleDownload() {
    const el = previewRef.current;
    if (!el) return;

    const printStyles = `
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; background: white; }
      @page { margin: 8mm; size: A4 portrait; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; }
      }
    `;
    const html = `<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>${resume.fullName || 'Resume'}</title>
      <style>${printStyles}</style>
    </head><body>${el.innerHTML}</body></html>`;

    const suggestedName = `${resume.fullName || 'Resume'}_Resume.pdf`;

    // Electron: use native printToPDF via IPC (proper file save dialog + colors)
    const electronAPI = (window as any).electronAPI || (window as any).electron;
    if (electronAPI?.printResumePDF) {
      const result = await electronAPI.printResumePDF(html, suggestedName);
      if (!result.success && result.reason !== 'canceled') {
        console.error('[PDF] Print failed:', result.reason);
        // fallback to iframe print
        iframePrint(html);
      }
      return;
    }

    // Browser fallback: iframe print
    iframePrint(html);
  }

  function iframePrint(html: string) {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open(); doc.write(html); doc.close();
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => { try { document.body.removeChild(iframe); } catch (_) {} }, 2000);
    }, 500);
  }

  function section(key: string, title: string, icon: React.ReactNode, content: React.ReactNode) {
    return (
      <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
        <button onClick={() => toggle(key)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2 text-white text-sm font-medium">
            <span className="text-neon-blue">{icon}</span>{title}
          </div>
          {open[key] ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>
        {open[key] && <div className="px-4 pb-4">{content}</div>}
      </div>
    );
  }

  // ── VIEW 1: CATEGORIES ──────────────────────────────────────────────────────
  if (view === 'categories') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Resume Builder</h1>
          <p className="text-gray-400 text-sm mt-1">Select your job domain — we'll generate an ATS-optimized resume targeting 90+ score, pre-filled with your profile data.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => { setCat(c); setView('templates'); }}
              className="bg-dark-800 border border-white/10 rounded-xl p-5 text-left hover:border-neon-blue/50 hover:bg-white/5 transition-all group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-2xl mb-3`}>{c.emoji}</div>
              <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-neon-blue transition-colors">{c.name}</h3>
              <p className="text-gray-500 text-xs">{c.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── VIEW 2: TEMPLATES ───────────────────────────────────────────────────────
  if (view === 'templates') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('categories')} className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{cat?.emoji} {cat?.name}</h1>
            <p className="text-gray-400 text-xs">All templates target 90+ ATS score. Pick your style.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => { setTmpl(t); setView('builder'); }}
              className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden hover:border-neon-blue/50 transition-all group text-left">
              {/* Mini preview */}
              <div className="h-28 p-3 bg-gray-100 relative">
                <div style={{ background: t.primary, height: 18, borderRadius: 2, marginBottom: 5 }} />
                {t.layout === 'single' ? (
                  <div className="flex flex-col gap-1.5">
                    {[75, 90, 85, 65, 80].map((w, i) => (
                      <div key={i} style={{ height: 3, width: `${w}%`, background: i === 0 ? t.accent : '#cbd5e1', borderRadius: 2 }} />
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1.5" style={{ width: '35%' }}>
                      {[80, 70, 75, 60].map((w, i) => (
                        <div key={i} style={{ height: 3, width: `${w}%`, background: t.accent, borderRadius: 2 }} />
                      ))}
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      {[85, 90, 70, 80, 60].map((w, i) => (
                        <div key={i} style={{ height: 3, width: `${w}%`, background: '#cbd5e1', borderRadius: 2 }} />
                      ))}
                    </div>
                  </div>
                )}
                <span className="absolute top-1.5 right-1.5 text-white text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: t.accent }}>ATS ✓</span>
              </div>
              <div className="p-3">
                <p className="text-white text-xs font-semibold group-hover:text-neon-blue transition-colors">{t.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{t.description}</p>
                <p className="text-gray-600 text-xs mt-1 capitalize">{t.layout === 'sidebar' ? '2-col sidebar' : 'Single column'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── VIEW 3: BUILDER ─────────────────────────────────────────────────────────
  const scoreColor = atsScore >= 90 ? 'text-green-400' : atsScore >= 70 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = atsScore >= 90 ? 'bg-green-500' : atsScore >= 70 ? 'bg-yellow-500' : 'bg-red-500';
  const errors = atsIssues.filter(i => i.type !== 'ok');
  const oks = atsIssues.filter(i => i.type === 'ok');

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('templates')} className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-gray-600">|</span>
          <span className="text-white font-medium text-sm">{cat?.emoji} {cat?.name}</span>
          <span className="text-gray-600 text-sm">— {tmpl?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {loading && <span className="text-xs text-gray-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading your profile...</span>}
          <button onClick={handleDownload}
            className="bg-neon-blue text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white transition-colors">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* 2-column: Form | Preview+Score */}
      <div className="grid grid-cols-2 gap-5 flex-1 min-h-0">

        {/* ── LEFT: Form ── */}
        <div className="overflow-y-auto space-y-3 pr-1">

          {/* Contact */}
          {section('contact', 'Contact Info', <User className="w-4 h-4" />,
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Full Name *</label>
                <input className={INPUT} placeholder="Rahul Sharma" value={resume.fullName} onChange={e => upd('fullName', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email *</label>
                <input className={INPUT} type="email" placeholder="rahul@email.com" value={resume.email} onChange={e => upd('email', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Phone *</label>
                <input className={INPUT} type="tel" placeholder="+91 98765 43210" value={resume.phone} onChange={e => upd('phone', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Location *</label>
                <input className={INPUT} placeholder="Bangalore, India" value={resume.location} onChange={e => upd('location', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">LinkedIn</label>
                <input className={INPUT} placeholder="linkedin.com/in/rahulsharma" value={resume.linkedin} onChange={e => upd('linkedin', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Target Role</label>
                <input className={INPUT} placeholder="Senior Software Engineer" value={resume.targetRole} onChange={e => upd('targetRole', e.target.value)} />
              </div>
            </div>
          )}

          {/* Summary */}
          {section('summary', 'Professional Summary', <FileText className="w-4 h-4" />,
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">Summary * (150+ chars for 90+ score)</label>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${resume.summary.length >= 150 ? 'text-green-400' : 'text-gray-500'}`}>{resume.summary.length} chars</span>
                  <button
                    onClick={() => generateWithAI('summary')}
                    disabled={aiGenerating === 'summary'}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/40 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiGenerating === 'summary'
                      ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                      : <><Sparkles className="w-3 h-3" /> Generate with AI</>
                    }
                  </button>
                </div>
              </div>
              <textarea className={`${INPUT} resize-none`} rows={4}
                placeholder={`Results-driven ${cat?.name || 'professional'} with X+ years of experience. Proven track record of delivering high-impact results. Skilled in ${cat?.keywords.slice(0, 3).join(', ')}.`}
                value={resume.summary} onChange={e => upd('summary', e.target.value)} />
              <p className="text-xs text-gray-500 mt-1.5">
                💡 Mention: years of experience · key skills ({cat?.keywords.slice(0, 3).join(', ')}) · one major achievement
              </p>
            </div>
          )}

          {/* Experience */}
          {section('experience', 'Work Experience', <Briefcase className="w-4 h-4" />,
            <div className="space-y-3">
              {resume.experiences.map((exp, idx) => (
                <div key={exp.id} className="bg-dark-900/60 border border-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Job #{idx + 1}</span>
                    <button onClick={() => removeExp(exp.id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Company *</label>
                      <input className={INPUT} placeholder="Infosys" value={exp.company} onChange={e => updExp(exp.id, 'company', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Role *</label>
                      <input className={INPUT} placeholder="Software Engineer" value={exp.role} onChange={e => updExp(exp.id, 'role', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                      <input className={INPUT} placeholder="Jan 2022" value={exp.startDate} onChange={e => updExp(exp.id, 'startDate', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                      <input className={INPUT} placeholder="Dec 2024" value={exp.current ? 'Present' : exp.endDate} onChange={e => updExp(exp.id, 'endDate', e.target.value)} disabled={exp.current} />
                      <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                        <input type="checkbox" checked={exp.current} onChange={e => updExp(exp.id, 'current', e.target.checked)} className="w-3 h-3 accent-cyan-400" />
                        <span className="text-xs text-gray-500">Currently working here</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-500">Bullet Points * (min 3 — start with action verbs)</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => generateWithAI('bullets', exp.id)}
                          disabled={aiGenerating === `exp-${exp.id}`}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/40 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {aiGenerating === `exp-${exp.id}`
                            ? <><Loader2 className="w-3 h-3 animate-spin" /> AI...</>
                            : <><Sparkles className="w-3 h-3" /> AI Bullets</>
                          }
                        </button>
                        <button onClick={() => addBullet(exp.id)} className="text-xs text-neon-blue hover:text-white flex items-center gap-1 transition-colors">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    </div>
                    {exp.bullets.map((b, bi) => (
                      <div key={bi} className="flex gap-2 mb-1.5 items-center">
                        <span className="text-gray-500 text-xs">•</span>
                        <input className={`${INPUT} flex-1 text-xs py-1.5`}
                          placeholder="e.g., Developed REST APIs reducing response time by 40%"
                          value={b} onChange={e => updBullet(exp.id, bi, e.target.value)} />
                        {exp.bullets.length > 1 && (
                          <button onClick={() => removeBullet(exp.id, bi)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={addExp}
                className="w-full border border-dashed border-gray-700 hover:border-neon-blue/50 text-gray-400 hover:text-neon-blue py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all">
                <Plus className="w-4 h-4" /> Add Work Experience
              </button>
            </div>
          )}

          {/* Education */}
          {section('education', 'Education', <GraduationCap className="w-4 h-4" />,
            <div className="space-y-3">
              {resume.education.map((edu, idx) => (
                <div key={edu.id} className="bg-dark-900/60 border border-white/5 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Education #{idx + 1}</span>
                    <button onClick={() => removeEdu(edu.id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                  <input className={INPUT} placeholder="University / College Name" value={edu.school} onChange={e => updEdu(edu.id, 'school', e.target.value)} />
                  <div className="grid grid-cols-3 gap-2">
                    <input className={INPUT} placeholder="B.Tech / MBA" value={edu.degree} onChange={e => updEdu(edu.id, 'degree', e.target.value)} />
                    <input className={INPUT} placeholder="Computer Science" value={edu.field} onChange={e => updEdu(edu.id, 'field', e.target.value)} />
                    <input className={INPUT} placeholder="2022" value={edu.year} onChange={e => updEdu(edu.id, 'year', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addEdu}
                className="w-full border border-dashed border-gray-700 hover:border-neon-blue/50 text-gray-400 hover:text-neon-blue py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all">
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>
          )}

          {/* Skills */}
          {section('skills', 'Skills', <Code2 className="w-4 h-4" />,
            <div>
              <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-dark-900 border border-gray-700 rounded-lg mb-2">
                {resume.skills.map(sk => (
                  <span key={sk} className="inline-flex items-center gap-1 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs px-2 py-1 rounded-md">
                    {sk}
                    <button onClick={() => removeSkill(sk)} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <input
                  className="flex-1 min-w-[140px] bg-transparent text-white text-xs outline-none placeholder:text-gray-600"
                  placeholder={resume.skills.length === 0 ? 'Type a skill and press Enter...' : 'Add more...'}
                  value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={onSkillKey} onBlur={() => skillInput.trim() && addSkill(skillInput)} />
              </div>
              {cat && (
                <p className="text-xs text-gray-500">
                  💡 Suggested:{' '}
                  {cat.keywords.filter(k => !resume.skills.some(s => s.toLowerCase() === k)).slice(0, 6).map(k => (
                    <button key={k} onClick={() => addSkill(k)} className="underline text-neon-blue/70 hover:text-neon-blue ml-1.5 capitalize">{k}</button>
                  ))}
                </p>
              )}
            </div>
          )}

          {/* Certifications */}
          {section('certs', 'Certifications (Optional)', <Award className="w-4 h-4" />,
            <div className="space-y-2">
              {resume.certifications.map((cert, i) => (
                <div key={i} className="flex gap-2">
                  <input className={`${INPUT} flex-1 text-xs py-1.5`} value={cert}
                    placeholder="e.g., AWS Certified Solutions Architect"
                    onChange={e => { const c = [...resume.certifications]; c[i] = e.target.value; upd('certifications', c); }} />
                  <button onClick={() => upd('certifications', resume.certifications.filter((_, ci) => ci !== i))}
                    className="text-red-400 hover:text-red-300 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => upd('certifications', [...resume.certifications, ''])}
                className="text-sm text-gray-400 hover:text-neon-blue flex items-center gap-1 transition-colors">
                <Plus className="w-3 h-3" /> Add Certification
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: ATS Score + Preview ── */}
        <div className="flex flex-col gap-4 min-h-0">

          {/* ATS Score Card */}
          <div className="bg-dark-800 border border-white/10 rounded-xl p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-neon-blue" />
                <span className="text-white font-semibold text-sm">ATS Score</span>
              </div>
              <span className={`text-3xl font-bold ${scoreColor}`}>{atsScore}<span className="text-base text-gray-500 font-normal">/100</span></span>
            </div>
            <div className="w-full h-2 bg-dark-900 rounded-full overflow-hidden mb-2">
              <div className={`h-full ${scoreBg} rounded-full transition-all duration-500`} style={{ width: `${atsScore}%` }} />
            </div>
            <p className="text-xs text-gray-400 mb-3">
              {atsScore >= 90 ? '🎉 Excellent! 90+ score — ATS ready to apply!' : atsScore >= 70 ? '⚡ Good! Fix issues below to hit 90+' : '📝 Fill all sections to reach 90+ score'}
            </p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {errors.map((issue, i) => (
                <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${issue.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  {issue.type === 'error' ? <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                  <span><span className="font-medium">[{issue.section}]</span> {issue.message}</span>
                </div>
              ))}
              {oks.map((issue, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle className="w-3 h-3 flex-shrink-0" /><span>{issue.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Preview */}
          <div className="flex-1 bg-dark-800 border border-white/10 rounded-xl overflow-hidden flex flex-col min-h-0">
            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Live Preview</span>
              <span className="text-xs text-gray-600">{tmpl?.name}</span>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <div className="bg-white rounded shadow-xl" style={{ transformOrigin: 'top left', zoom: 0.52 }} ref={previewRef}>
                <ResumePreview resume={resume} tmpl={tmpl} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RESUME PREVIEW COMPONENT ───────────────────────────────────────────────────
function ResumePreview({ resume, tmpl }: { resume: ResumeData; tmpl: TemplateStyle | null }) {
  const p = tmpl?.primary || '#1a365d';
  const a = tmpl?.accent || '#2b6cb0';
  const isSidebar = tmpl?.layout === 'sidebar';
  const name = resume.fullName || 'Your Name';
  const role = resume.targetRole || 'Your Target Role';

  if (isSidebar) {
    return (
      <div style={{ display: 'flex', fontFamily: 'Arial, sans-serif', minHeight: 1100 }}>
        {/* Sidebar */}
        <div style={{ width: '35%', background: p, color: 'white', padding: '32px 20px', flexShrink: 0 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px 0', lineHeight: 1.2 }}>{name}</h1>
            <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>{role}</p>
          </div>
          <SideSection title="Contact" accent={a}>
            {resume.email && <p style={{ fontSize: 11, marginBottom: 4, wordBreak: 'break-all' }}>{resume.email}</p>}
            {resume.phone && <p style={{ fontSize: 11, marginBottom: 4 }}>{resume.phone}</p>}
            {resume.location && <p style={{ fontSize: 11, marginBottom: 4 }}>{resume.location}</p>}
            {resume.linkedin && <p style={{ fontSize: 10, opacity: 0.7, wordBreak: 'break-all' }}>{resume.linkedin}</p>}
          </SideSection>
          {resume.skills.length > 0 && (
            <SideSection title="Skills" accent={a}>
              {resume.skills.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: a, flexShrink: 0 }} />
                  <span style={{ fontSize: 11 }}>{s}</span>
                </div>
              ))}
            </SideSection>
          )}
          {resume.education.length > 0 && (
            <SideSection title="Education" accent={a}>
              {resume.education.map(edu => (
                <div key={edu.id} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 2px 0' }}>{edu.degree}</p>
                  {edu.field && <p style={{ fontSize: 11, opacity: 0.8, margin: '0 0 2px 0' }}>{edu.field}</p>}
                  <p style={{ fontSize: 11, opacity: 0.7, margin: '0 0 2px 0' }}>{edu.school}</p>
                  <p style={{ fontSize: 10, opacity: 0.6, margin: 0 }}>{edu.year}</p>
                </div>
              ))}
            </SideSection>
          )}
          {resume.certifications.filter(c => c.trim()).length > 0 && (
            <SideSection title="Certifications" accent={a}>
              {resume.certifications.filter(c => c.trim()).map((cert, i) => (
                <p key={i} style={{ fontSize: 11, marginBottom: 4 }}>• {cert}</p>
              ))}
            </SideSection>
          )}
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: '32px 28px', background: 'white', color: '#222' }}>
          {resume.summary && <MainSection title="Professional Summary" primary={p} accent={a}>
            <p style={{ fontSize: 12, lineHeight: 1.7, color: '#444', margin: 0 }}>{resume.summary}</p>
          </MainSection>}
          {resume.experiences.length > 0 && <MainSection title="Experience" primary={p} accent={a}>
            {resume.experiences.map(exp => <ExpEntry key={exp.id} exp={exp} accent={a} />)}
          </MainSection>}
        </div>
      </div>
    );
  }

  // Single column
  return (
    <div style={{ padding: '40px 44px', fontFamily: 'Arial, sans-serif', color: '#222', background: 'white', minHeight: 1100 }}>
      <div style={{ borderBottom: `3px solid ${a}`, paddingBottom: 16, marginBottom: 22 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: p, margin: '0 0 4px 0' }}>{name}</h1>
        <p style={{ fontSize: 14, color: a, fontWeight: 600, margin: '0 0 8px 0' }}>{role}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 20px', fontSize: 12, color: '#555' }}>
          {resume.email && <span>{resume.email}</span>}
          {resume.phone && <span>{resume.phone}</span>}
          {resume.location && <span>{resume.location}</span>}
          {resume.linkedin && <span>{resume.linkedin}</span>}
        </div>
      </div>
      {resume.summary && <MainSection title="Professional Summary" primary={p} accent={a}>
        <p style={{ fontSize: 12, lineHeight: 1.75, color: '#444', margin: 0 }}>{resume.summary}</p>
      </MainSection>}
      {resume.experiences.length > 0 && <MainSection title="Work Experience" primary={p} accent={a}>
        {resume.experiences.map(exp => <ExpEntry key={exp.id} exp={exp} accent={a} />)}
      </MainSection>}
      {(resume.education.length > 0 || resume.skills.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 6 }}>
          {resume.education.length > 0 && (
            <div>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: `1px solid ${a}40`, paddingBottom: 4, marginBottom: 10 }}>Education</h2>
              {resume.education.map(edu => (
                <div key={edu.id} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 2px 0' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                  <p style={{ fontSize: 11, color: '#555', margin: '0 0 2px 0' }}>{edu.school}</p>
                  <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{edu.year}</p>
                </div>
              ))}
            </div>
          )}
          {resume.skills.length > 0 && (
            <div>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: p, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: `1px solid ${a}40`, paddingBottom: 4, marginBottom: 10 }}>Skills</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {resume.skills.map(s => (
                  <span key={s} style={{ fontSize: 10, padding: '2px 9px', borderRadius: 3, background: `${a}15`, color: p, border: `1px solid ${a}30` }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {resume.certifications.filter(c => c.trim()).length > 0 && (
        <MainSection title="Certifications" primary={p} accent={a}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px' }}>
            {resume.certifications.filter(c => c.trim()).map((cert, i) => (
              <span key={i} style={{ fontSize: 11.5, color: '#333' }}>• {cert}</span>
            ))}
          </div>
        </MainSection>
      )}
    </div>
  );
}

function SideSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: accent, textTransform: 'uppercase', marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
  );
}

function MainSection({ title, primary, accent, children }: { title: string; primary: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: `2px solid ${accent}`, paddingBottom: 5, marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  );
}

function ExpEntry({ exp, accent }: { exp: WorkExp; accent: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{exp.role || 'Role Title'}</span>
          <span style={{ fontSize: 12, color: accent, fontWeight: 600, marginLeft: 8 }}>@ {exp.company || 'Company'}</span>
        </div>
        {(exp.startDate || exp.endDate) && (
          <span style={{ fontSize: 11, color: '#888', flexShrink: 0, marginLeft: 8 }}>
            {exp.startDate}{exp.startDate ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}
          </span>
        )}
      </div>
      <ul style={{ paddingLeft: 16, margin: 0 }}>
        {exp.bullets.filter(b => b.trim()).map((b, i) => (
          <li key={i} style={{ fontSize: 11.5, color: '#444', lineHeight: 1.65, marginBottom: 2 }}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
