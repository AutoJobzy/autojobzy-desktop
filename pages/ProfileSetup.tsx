import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Search, User, Key, Save, UploadCloud, FileText, CheckCircle, Loader2, IndianRupee, Clock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { JobConfig } from '../types';
import { updateJobSettings, uploadResume, getJobSettings } from '../services/automationApi';

const ProfileSetup: React.FC = () => {
  const { updateConfig } = useApp();
  const navigate = useNavigate();

  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showNaukriPassword, setShowNaukriPassword] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<any>(null);

  const [formData, setFormData] = useState<JobConfig>({
    naukriUsername: '',
    naukriPassword: '',
    targetRole: 'React Developer',
    experience: '0-1 Years',
    location: 'Bangalore',
    keywords: 'Software Engineer',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: 'Immediate',
    resumeName: '',
    resumeScore: 0
  });

  // Fetch existing job settings on component mount
  useEffect(() => {
    const fetchJobSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setPageLoading(false);
          return;
        }

        const settings = await getJobSettings();

        // Map database fields to form fields
        const newFormData = {
          naukriUsername: settings.naukriEmail || '',
          naukriPassword: settings.naukriPassword || '',
          targetRole: settings.targetRole || 'React Developer',
          location: settings.location || 'Bangalore',
          experience: settings.yearsOfExperience || '0-1 Years',
          currentSalary: settings.currentCTC || '',
          expectedSalary: settings.expectedCTC || '',
          noticePeriod: settings.noticePeriod || 'Immediate',
          keywords: settings.searchKeywords || 'Software Engineer',
          resumeName: settings.resumeFileName || '',
          resumeScore: settings.resumeScore || 0
        };

        setFormData(newFormData);
        lastSavedRef.current = newFormData;
      } catch (err: any) {
        setError('Unable to load your profile settings. Please refresh the page and try again.');
      } finally {
        setPageLoading(false);
      }
    };

    fetchJobSettings();
  }, []);

  /**
   * Auto-save handler with debounce
   * Calls API whenever user updates a field
   */
  const autoSave = async (dataToSave: JobConfig) => {
    // Check if data has actually changed
    if (JSON.stringify(dataToSave) === JSON.stringify(lastSavedRef.current)) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setAutoSaveStatus('saving');

    // Debounce: wait 1 second before saving
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const payload = {
          naukriEmail: dataToSave.naukriUsername,
          naukriPassword: dataToSave.naukriPassword,
          targetRole: dataToSave.targetRole,
          location: dataToSave.location,
          yearsOfExperience: dataToSave.experience,
          currentCTC: dataToSave.currentSalary,
          expectedCTC: dataToSave.expectedSalary,
          noticePeriod: dataToSave.noticePeriod,
          searchKeywords: dataToSave.keywords,
        };

        await updateJobSettings(payload);
        lastSavedRef.current = dataToSave;
        setAutoSaveStatus('saved');

        // Clear saved status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (err: any) {
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    }, 1000); // 1 second debounce
  };

  /**
   * Handle field changes with auto-save
   */
  const handleFieldChange = (field: keyof JobConfig, value: any) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    // Trigger auto-save
    autoSave(updatedFormData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setAnalyzing(true);
      setUploadProgress(0);

      // Simulate Upload & Analysis
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      setTimeout(() => {
        setAnalyzing(false);
        const updatedData = {
          ...formData,
          resumeName: file.name,
          resumeScore: 88,
          keywords: 'React, TypeScript, Node.js, Tailwind, MongoDB'
        };
        setFormData(updatedData);
        // Auto-save after resume upload
        autoSave(updatedData);
      }, 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call backend API to save job settings
      const payload = {
        targetRole: formData.targetRole,
        location: formData.location,
        yearsOfExperience: formData.experience,
        currentCTC: formData.currentSalary,
        expectedCTC: formData.expectedSalary,
        noticePeriod: formData.noticePeriod,
        searchKeywords: formData.keywords,
      };

      await updateJobSettings(payload);

      // If resume file selected, upload it
      if (resumeFile) {
        try {
          await uploadResume(resumeFile);
          setSuccess('Profile settings and resume saved successfully!');
        } catch (resumeErr: any) {
          setSuccess('Profile settings saved, but resume upload failed. Please try uploading your resume again.');
        }
      } else {
        setSuccess('Profile settings saved successfully!');
      }

      // Update local context and navigate after a short delay
      updateConfig(formData);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-dark-900">
      <div className="max-w-3xl mx-auto bg-dark-800 border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="mb-8 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-white mb-2">Configure Automation Profile</h2>
          <p className="text-gray-400 text-sm">Setup your job preferences, salary expectations, and upload resume.</p>
        </div>

        {/* Loading State */}
        {pageLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
              <p className="text-gray-400">Loading your profile...</p>
            </div>
          </div>
        )}

        {/* Form - only show when not loading */}
        {!pageLoading && (
          <>
            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-6 bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Resume Upload Section */}
              <div className="bg-dark-900/50 p-6 rounded-xl border border-dashed border-gray-600 hover:border-neon-blue transition-colors">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <UploadCloud className="text-neon-blue" /> Upload Resume & Analyze
                </h3>

                {!formData.resumeName && !analyzing ? (
                  <div className="text-center py-6">
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer inline-flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-500 mb-3" />
                      <span className="text-neon-blue font-bold hover:underline">Click to Upload Resume</span>
                      <span className="text-xs text-gray-500 mt-2">PDF, DOCX up to 5MB</span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-dark-800 p-4 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <FileText className="text-neon-purple w-8 h-8" />
                        <div>
                          <div className="text-white font-medium text-sm">{formData.resumeName || "Parsing Resume..."}</div>
                          {analyzing && <div className="text-xs text-gray-400">AI Analyzing skills & experience...</div>}
                        </div>
                      </div>
                      {analyzing ? (
                        <span className="text-neon-blue font-bold text-sm">{uploadProgress}%</span>
                      ) : (
                        <CheckCircle className="text-green-500 w-6 h-6" />
                      )}
                    </div>

                    {!analyzing && formData.resumeName && (
                      <div className="bg-green-500/10 border border-green-500/20 p-3 rounded text-sm text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Analysis Complete! Match Score: <span className="font-bold text-white">{formData.resumeScore}/100</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column: Job Details */}
                <div className="space-y-4">
                  <h3 className="text-neon-blue text-sm font-bold uppercase tracking-wider mb-2">Job Preferences</h3>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Target Role</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input
                        required
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-neon-blue outline-none"
                        value={formData.targetRole}
                        onChange={e => handleFieldChange('targetRole', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Search Years of Experience</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-neon-blue outline-none"
                        placeholder="e.g. 3 years"
                        value={formData.experience}
                        onChange={e => handleFieldChange('experience', e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Format: "X years" (e.g., "3 years", "5 years")</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Preferred Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-neon-blue outline-none"
                        placeholder="e.g. Bangalore, Remote"
                        value={formData.location}
                        onChange={e => handleFieldChange('location', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Salary & Notice */}
                <div className="space-y-4">
                  <h3 className="text-neon-green text-sm font-bold uppercase tracking-wider mb-2">Salary & Availability</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400">Current CTC</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                          className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-9 pr-2 text-white text-sm focus:border-neon-green outline-none"
                          placeholder="e.g. 4 LPA"
                          value={formData.currentSalary}
                          onChange={e => handleFieldChange('currentSalary', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400">Expected CTC</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                          className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-9 pr-2 text-white text-sm focus:border-neon-green outline-none"
                          placeholder="e.g. 8 LPA"
                          value={formData.expectedSalary}
                          onChange={e => handleFieldChange('expectedSalary', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Notice Period / Availability</label>
                    <div className="relative">
                      <select
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 px-4 text-white text-sm focus:border-neon-green outline-none appearance-none cursor-pointer"
                        value={formData.noticePeriod}
                        onChange={e => handleFieldChange('noticePeriod', e.target.value)}
                      >
                        <option value="Immediate">Immediately Available</option>
                        <option value="15 Days">Less than 15 Days</option>
                        <option value="30 Days">1 Month</option>
                        <option value="60 Days">2 Months</option>
                        <option value="90 Days">3 Months</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-gray-300 text-sm font-bold uppercase tracking-wider">Portal Credentials (Naukri)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-neon-blue outline-none"
                      placeholder="Naukri Username/Email"
                      value={formData.naukriUsername}
                      onChange={e => handleFieldChange('naukriUsername', e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type={showNaukriPassword ? "text" : "password"}
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-10 text-white text-sm focus:border-neon-blue outline-none"
                      placeholder="Naukri Password"
                      value={formData.naukriPassword}
                      onChange={e => handleFieldChange('naukriPassword', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNaukriPassword(!showNaukriPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showNaukriPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto-save status indicator */}
              {autoSaveStatus !== 'idle' && (
                <div className={`flex items-center gap-2 text-sm p-2 rounded ${autoSaveStatus === 'saving' ? 'text-blue-400' :
                    autoSaveStatus === 'saved' ? 'text-green-400' :
                      'text-red-400'
                  }`}>
                  {autoSaveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {autoSaveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
                  {autoSaveStatus === 'error' && <AlertCircle className="w-4 h-4" />}
                  <span className="text-xs">
                    {autoSaveStatus === 'saving' ? 'Saving...' :
                      autoSaveStatus === 'saved' ? 'Saved' :
                        'Save failed'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neon-blue text-black font-bold py-4 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 mt-6 shadow-[0_0_20px_rgba(0,243,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving Profile...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save Configuration & Go to Dashboard
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
