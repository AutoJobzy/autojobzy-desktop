import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  ExternalLink,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ApplicationRecord {
  id: number;
  datetime: string;
  jobTitle: string | null;
  companyName: string | null;
  location: string | null;
  experienceRequired: string | null;
  salary: string | null;
  matchScore: number;
  matchScoreTotal: number;
  matchStatus: 'Good Match' | 'Poor Match';
  applyType: 'Direct Apply' | 'External Apply' | 'No Apply Button';
  applicationStatus: 'Applied' | 'Skipped' | null;
  earlyApplicant: boolean;
  keySkillsMatch: boolean;
  locationMatch: boolean;
  experienceMatch: boolean;
  postedDate: string | null;
  companyRating: string | null;
  role: string | null;
  industryType: string | null;
  employmentType: string | null;
  roleCategory: string | null;
  keySkills: string | null;
  jobHighlights: string | null;
  companyUrl: string;
  openings: string | null;
  applicants: string | null;
}

const ApplicationHistory: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof ApplicationRecord>('datetime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterApplyType, setFilterApplyType] = useState<string>('all');
  const [filterApplicationStatus, setFilterApplicationStatus] = useState<string>('all');

  // Fetch application history on mount
  useEffect(() => {
    fetchApplicationHistory();
  }, []);

  // Filter and sort applications whenever dependencies change
  useEffect(() => {
    let filtered = [...applications];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.jobTitle?.toLowerCase().includes(query) ||
          app.companyName?.toLowerCase().includes(query) ||
          app.location?.toLowerCase().includes(query) ||
          app.keySkills?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((app) => app.matchStatus === filterStatus);
    }

    // Apply type filter
    if (filterApplyType !== 'all') {
      filtered = filtered.filter((app) => app.applyType === filterApplyType);
    }

    // Application status filter
    if (filterApplicationStatus !== 'all') {
      filtered = filtered.filter((app) => app.applicationStatus === filterApplicationStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    setFilteredApplications(filtered);
  }, [applications, searchQuery, sortField, sortDirection, filterStatus, filterApplyType, filterApplicationStatus]);

  const fetchApplicationHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/job-results?limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application history');
      }

      const data = await response.json();
      setApplications(data.records || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load application history');
      setLoading(false);
    }
  };

  const handleSort = (field: keyof ApplicationRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getMatchScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMatchStatusColor = (status: string) => {
    if (status === 'Good Match') return 'bg-green-500/10 text-green-400 border-green-500/30';
    return 'bg-red-500/10 text-red-400 border-red-500/30';
  };

  const getApplyTypeColor = (type: string) => {
    if (type === 'Direct Apply') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (type === 'External Apply') return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  const getApplicationStatusColor = (status: string | null) => {
    if (status === 'Applied') return 'bg-green-500/10 text-green-400 border-green-500/30';
    if (status === 'Skipped') return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading application history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 text-lg font-semibold mb-2">Error Loading History</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={fetchApplicationHistory}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <h1 className="text-3xl font-bold text-white">Application History</h1>
            </div>
            <p className="text-gray-400 ml-14">
              Track and analyze your job application records
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-dark-800 border border-white/10 rounded-lg">
              <p className="text-sm text-gray-400">Total Applications</p>
              <p className="text-2xl font-bold text-white">{applications.length}</p>
            </div>
            <div className="px-4 py-2 bg-dark-800 border border-green-500/20 rounded-lg">
              <p className="text-sm text-gray-400">Applied</p>
              <p className="text-2xl font-bold text-green-400">
                {applications.filter(app => app.applicationStatus === 'Applied').length}
              </p>
            </div>
            <div className="px-4 py-2 bg-dark-800 border border-orange-500/20 rounded-lg">
              <p className="text-sm text-gray-400">Skipped</p>
              <p className="text-2xl font-bold text-orange-400">
                {applications.filter(app => app.applicationStatus === 'Skipped').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by job title, company, location, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                />
              </div>
            </div>

            {/* Match Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
              >
                <option value="all">All Match Status</option>
                <option value="Good Match">Good Match</option>
                <option value="Poor Match">Poor Match</option>
              </select>
            </div>

            {/* Apply Type Filter */}
            <div>
              <select
                value={filterApplyType}
                onChange={(e) => setFilterApplyType(e.target.value)}
                className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
              >
                <option value="all">All Apply Types</option>
                <option value="Direct Apply">Direct Apply</option>
                <option value="External Apply">External Apply</option>
                <option value="No Apply Button">No Apply Button</option>
              </select>
            </div>

            {/* Application Status Filter */}
            <div>
              <select
                value={filterApplicationStatus}
                onChange={(e) => setFilterApplicationStatus(e.target.value)}
                className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
              >
                <option value="all">All Results</option>
                <option value="Applied">Applied</option>
                <option value="Skipped">Skipped</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <p>
            Showing <span className="text-white font-semibold">{filteredApplications.length}</span> of{' '}
            <span className="text-white font-semibold">{applications.length}</span> applications
          </p>
        </div>

        {/* Table */}
        <div className="bg-dark-800 border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-900 border-b border-white/10">
                <tr>
                  <th
                    className="text-left px-6 py-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('datetime')}
                  >
                    <div className="flex items-center gap-2">
                      Date Applied
                      {sortField === 'datetime' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="text-left px-6 py-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('jobTitle')}
                  >
                    <div className="flex items-center gap-2">
                      Job Title
                      {sortField === 'jobTitle' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="text-left px-6 py-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('companyName')}
                  >
                    <div className="flex items-center gap-2">
                      Company
                      {sortField === 'companyName' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Location</th>
                  <th
                    className="text-left px-6 py-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('matchScore')}
                  >
                    <div className="flex items-center gap-2">
                      Match Score
                      {sortField === 'matchScore' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        ))}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Apply Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Result</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Filter className="w-12 h-12 text-gray-600 mb-3" />
                        <p className="text-gray-400 text-lg font-semibold mb-1">No applications found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your filters or search query</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedApp(app)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {formatDate(app.datetime)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-white font-medium">{app.jobTitle || 'Unknown Position'}</p>
                          {app.earlyApplicant && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-400 mt-1">
                              <TrendingUp className="w-3 h-3" />
                              Early Applicant
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-white font-medium">{app.companyName || 'Unknown Company'}</p>
                          {app.companyRating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-gray-400">{app.companyRating}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4" />
                          {app.location || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${getMatchScoreColor(app.matchScore, app.matchScoreTotal)}`}
                                style={{ width: `${(app.matchScore / app.matchScoreTotal) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm text-white font-semibold whitespace-nowrap">
                            {app.matchScore}/{app.matchScoreTotal}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getMatchStatusColor(
                            app.matchStatus
                          )}`}
                        >
                          {app.matchStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getApplyTypeColor(
                            app.applyType
                          )}`}
                        >
                          {app.applyType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getApplicationStatusColor(
                            app.applicationStatus
                          )}`}
                        >
                          {app.applicationStatus || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApp(app);
                          }}
                          className="text-neon-blue hover:text-white transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-800 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-start justify-between p-6 border-b border-white/10">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedApp.jobTitle || 'Unknown Position'}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {selectedApp.companyName || 'Unknown Company'}
                    </div>
                    {selectedApp.companyRating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {selectedApp.companyRating}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedApp.location || 'N/A'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-dark-900 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Match Score</p>
                      <p className="text-xl font-bold text-white">
                        {selectedApp.matchScore}/{selectedApp.matchScoreTotal}
                      </p>
                    </div>
                    <div className="bg-dark-900 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMatchStatusColor(
                          selectedApp.matchStatus
                        )}`}
                      >
                        {selectedApp.matchStatus}
                      </span>
                    </div>
                    <div className="bg-dark-900 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Apply Type</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getApplyTypeColor(
                          selectedApp.applyType
                        )}`}
                      >
                        {selectedApp.applyType}
                      </span>
                    </div>
                    <div className="bg-dark-900 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Posted</p>
                      <p className="text-sm font-medium text-white">{selectedApp.postedDate || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Match Criteria */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Match Breakdown</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg ${selectedApp.earlyApplicant ? 'bg-green-500/10 border border-green-500/30' : 'bg-dark-900'
                          }`}
                      >
                        {selectedApp.earlyApplicant ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-600" />
                        )}
                        <span className="text-sm text-gray-300">Early Applicant</span>
                      </div>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg ${selectedApp.keySkillsMatch ? 'bg-green-500/10 border border-green-500/30' : 'bg-dark-900'
                          }`}
                      >
                        {selectedApp.keySkillsMatch ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-600" />
                        )}
                        <span className="text-sm text-gray-300">Skills Match</span>
                      </div>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg ${selectedApp.locationMatch ? 'bg-green-500/10 border border-green-500/30' : 'bg-dark-900'
                          }`}
                      >
                        {selectedApp.locationMatch ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-600" />
                        )}
                        <span className="text-sm text-gray-300">Location Match</span>
                      </div>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg ${selectedApp.experienceMatch ? 'bg-green-500/10 border border-green-500/30' : 'bg-dark-900'
                          }`}
                      >
                        {selectedApp.experienceMatch ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-600" />
                        )}
                        <span className="text-sm text-gray-300">Experience Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Job Information</h3>
                      <div className="space-y-3">
                        {selectedApp.experienceRequired && (
                          <div className="flex items-start gap-3">
                            <Briefcase className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Experience Required</p>
                              <p className="text-sm text-white">{selectedApp.experienceRequired}</p>
                            </div>
                          </div>
                        )}
                        {selectedApp.salary && (
                          <div className="flex items-start gap-3">
                            <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Salary</p>
                              <p className="text-sm text-white">{selectedApp.salary}</p>
                            </div>
                          </div>
                        )}
                        {selectedApp.employmentType && (
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Employment Type</p>
                              <p className="text-sm text-white">{selectedApp.employmentType}</p>
                            </div>
                          </div>
                        )}
                        {selectedApp.openings && (
                          <div className="flex items-start gap-3">
                            <Award className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Openings</p>
                              <p className="text-sm text-white">{selectedApp.openings}</p>
                            </div>
                          </div>
                        )}
                        {selectedApp.applicants && (
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Applicants</p>
                              <p className="text-sm text-white">{selectedApp.applicants}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Company & Role</h3>
                      <div className="space-y-3">
                        {selectedApp.role && (
                          <div>
                            <p className="text-xs text-gray-500">Role</p>
                            <p className="text-sm text-white">{selectedApp.role}</p>
                          </div>
                        )}
                        {selectedApp.roleCategory && (
                          <div>
                            <p className="text-xs text-gray-500">Role Category</p>
                            <p className="text-sm text-white">{selectedApp.roleCategory}</p>
                          </div>
                        )}
                        {selectedApp.industryType && (
                          <div>
                            <p className="text-xs text-gray-500">Industry Type</p>
                            <p className="text-sm text-white">{selectedApp.industryType}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Key Skills */}
                  {selectedApp.keySkills && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Key Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.keySkills.split(',').map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 rounded-full text-xs font-medium"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Highlights */}
                  {selectedApp.jobHighlights && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Job Highlights</h3>
                      <div className="bg-dark-900 rounded-lg p-4 space-y-2">
                        {selectedApp.jobHighlights.split(',').map((highlight, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-2"></div>
                            <p className="text-sm text-gray-300">{highlight.trim()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Application Details */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Application Details</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                        <span className="text-sm text-gray-400">Applied On</span>
                        <span className="text-sm text-white font-medium">{formatDate(selectedApp.datetime)}</span>
                      </div>
                      <a
                        href={selectedApp.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-neon-blue/10 border border-neon-blue/30 rounded-lg hover:bg-neon-blue/20 transition-colors group"
                      >
                        <span className="text-sm text-neon-blue">View Original Job Posting</span>
                        <ExternalLink className="w-4 h-4 text-neon-blue group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationHistory;
