import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader, Copy, Trash2 } from 'lucide-react';

interface ApiResponse {
    endpoint: string;
    method: string;
    status: number;
    statusText: string;
    data: any;
    timestamp: string;
    error?: string;
}

const APITester: React.FC = () => {
    const [email, setEmail] = useState('testuser@example.com');
    const [password, setPassword] = useState('Test@123456');
    const [token, setToken] = useState('');
    const [responses, setResponses] = useState<ApiResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

    const addResponse = (response: ApiResponse) => {
        setResponses((prev) => [response, ...prev]);
    };

    const clearResponses = () => {
        setResponses([]);
    };

    // 1. SIGNUP API
    const testSignup = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    firstName: 'Test',
                    lastName: 'User',
                }),
            });
            const data = await response.json();

            if (data.token) {
                setToken(data.token);
            }

            addResponse({
                endpoint: '/auth/signup',
                method: 'POST',
                status: response.status,
                statusText: response.statusText,
                data,
                timestamp: new Date().toLocaleTimeString(),
            });
        } catch (error: any) {
            addResponse({
                endpoint: '/auth/signup',
                method: 'POST',
                status: 0,
                statusText: 'Error',
                data: null,
                timestamp: new Date().toLocaleTimeString(),
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // 2. LOGIN API
    const testLogin = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (data.token) {
                setToken(data.token);
            }

            addResponse({
                endpoint: '/auth/login',
                method: 'POST',
                status: response.status,
                statusText: response.statusText,
                data,
                timestamp: new Date().toLocaleTimeString(),
            });
        } catch (error: any) {
            addResponse({
                endpoint: '/auth/login',
                method: 'POST',
                status: 0,
                statusText: 'Error',
                data: null,
                timestamp: new Date().toLocaleTimeString(),
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // 3. GET PROFILE API
    const testGetProfile = async () => {
        if (!token) {
            alert('Please login first to get profile');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            addResponse({
                endpoint: '/auth/profile',
                method: 'GET',
                status: response.status,
                statusText: response.statusText,
                data,
                timestamp: new Date().toLocaleTimeString(),
            });
        } catch (error: any) {
            addResponse({
                endpoint: '/auth/profile',
                method: 'GET',
                status: 0,
                statusText: 'Error',
                data: null,
                timestamp: new Date().toLocaleTimeString(),
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // 4. GET JOB SETTINGS API
    const testGetJobSettings = async () => {
        if (!token) {
            alert('Please login first');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/job-settings`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            addResponse({
                endpoint: '/job-settings',
                method: 'GET',
                status: response.status,
                statusText: response.statusText,
                data,
                timestamp: new Date().toLocaleTimeString(),
            });
        } catch (error: any) {
            addResponse({
                endpoint: '/job-settings',
                method: 'GET',
                status: 0,
                statusText: 'Error',
                data: null,
                timestamp: new Date().toLocaleTimeString(),
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // 5. SAVE JOB SETTINGS API
    const testSaveJobSettings = async () => {
        if (!token) {
            alert('Please login first');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/job-settings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    naukriEmail: 'naukri@example.com',
                    naukriPassword: 'naukri@pass',
                    targetRole: 'Software Developer',
                    location: 'Bangalore',
                    currentCTC: 500000,
                    expectedCTC: 800000,
                    noticePeriod: 30,
                    searchKeywords: 'JavaScript, React, Node.js',
                    yearsOfExperience: 5,
                }),
            });
            const data = await response.json();

            addResponse({
                endpoint: '/job-settings',
                method: 'POST',
                status: response.status,
                statusText: response.statusText,
                data,
                timestamp: new Date().toLocaleTimeString(),
            });
        } catch (error: any) {
            addResponse({
                endpoint: '/job-settings',
                method: 'POST',
                status: 0,
                statusText: 'Error',
                data: null,
                timestamp: new Date().toLocaleTimeString(),
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // 6. GET ANSWERS DATA API
    const testGetAnswersData = async () => {
        if (!token) {
            alert('Please login first');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/job-settings/answers-data`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            addResponse({
                endpoint: '/job-settings/answers-data',
                method: 'GET',
                status: response.status,
                statusText: response.statusText,
                data,
                timestamp: new Date().toLocaleTimeString(),
            });
        } catch (error: any) {
            addResponse({
                endpoint: '/job-settings/answers-data',
                method: 'GET',
                status: 0,
                statusText: 'Error',
                data: null,
                timestamp: new Date().toLocaleTimeString(),
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // 7. START AUTOMATION API
    const testStartAutomation = async () => {
        if (!token) {
            alert('Please login first');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/automation/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    naukriEmail: 'your_naukri_email@example.com',
                    naukriPassword: 'your_naukri_password',
                }),
            });
            const data = await response.json();

            addResponse({
                endpoint: '/automation/start',
                method: 'POST',
                status: response.status,
                statusText: response.statusText,
                data,
                timestamp: new Date().toLocaleTimeString(),
            });
        } catch (error: any) {
            addResponse({
                endpoint: '/automation/start',
                method: 'POST',
                status: 0,
                statusText: 'Error',
                data: null,
                timestamp: new Date().toLocaleTimeString(),
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // 8. STOP AUTOMATION API
    const testStopAutomation = async () => {
        if (!token) {
            alert('Please login first');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/automation/stop`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            addResponse({
                endpoint: '/automation/stop',
                method: 'POST',
                status: response.status,
                statusText: response.statusText,
                data,
                timestamp: new Date().toLocaleTimeString(),
            });
        } catch (error: any) {
            addResponse({
                endpoint: '/automation/stop',
                method: 'POST',
                status: 0,
                statusText: 'Error',
                data: null,
                timestamp: new Date().toLocaleTimeString(),
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // 9. GET AUTOMATION LOGS API
    const testGetLogs = async () => {
        if (!token) {
            alert('Please login first');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/automation/logs`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            addResponse({
                endpoint: '/automation/logs',
                method: 'GET',
                status: response.status,
                statusText: response.statusText,
                data,
                timestamp: new Date().toLocaleTimeString(),
            });
        } catch (error: any) {
            addResponse({
                endpoint: '/automation/logs',
                method: 'GET',
                status: 0,
                statusText: 'Error',
                data: null,
                timestamp: new Date().toLocaleTimeString(),
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // 10. GET AUTOMATION STATUS API
    const testGetStatus = async () => {
        if (!token) {
            alert('Please login first');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/automation/status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            addResponse({
                endpoint: '/automation/status',
                method: 'GET',
                status: response.status,
                statusText: response.statusText,
                data,
                timestamp: new Date().toLocaleTimeString(),
            });
        } catch (error: any) {
            addResponse({
                endpoint: '/automation/status',
                method: 'GET',
                status: 0,
                statusText: 'Error',
                data: null,
                timestamp: new Date().toLocaleTimeString(),
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // 11. CLEAR LOGS API
    const testClearLogs = async () => {
        if (!token) {
            alert('Please login first');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/automation/clear-logs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            addResponse({
                endpoint: '/automation/clear-logs',
                method: 'POST',
                status: response.status,
                statusText: response.statusText,
                data,
                timestamp: new Date().toLocaleTimeString(),
            });
        } catch (error: any) {
            addResponse({
                endpoint: '/automation/clear-logs',
                method: 'POST',
                status: 0,
                statusText: 'Error',
                data: null,
                timestamp: new Date().toLocaleTimeString(),
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // RUN ALL TESTS
    const runAllTests = async () => {
        setLoading(true);
        try {
            await testSignup();
            await new Promise((r) => setTimeout(r, 500));
            await testLogin();
            await new Promise((r) => setTimeout(r, 500));
            await testGetProfile();
            await new Promise((r) => setTimeout(r, 500));
            await testSaveJobSettings();
            await new Promise((r) => setTimeout(r, 500));
            await testGetJobSettings();
            await new Promise((r) => setTimeout(r, 500));
            await testGetAnswersData();
            await new Promise((r) => setTimeout(r, 500));
            await testGetStatus();
            await new Promise((r) => setTimeout(r, 500));
            await testGetLogs();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">API Tester</h1>

                {/* Input Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Login Credentials</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {token && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700">
                                <strong>Token:</strong> {token.substring(0, 50)}...
                            </p>
                        </div>
                    )}
                </div>

                {/* Button Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">API Endpoints</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <button
                            onClick={testSignup}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '+'} Signup
                        </button>
                        <button
                            onClick={testLogin}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '✓'} Login
                        </button>
                        <button
                            onClick={testGetProfile}
                            disabled={loading || !token}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '📋'} Get Profile
                        </button>
                        <button
                            onClick={testSaveJobSettings}
                            disabled={loading || !token}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '💾'} Save Settings
                        </button>
                        <button
                            onClick={testGetJobSettings}
                            disabled={loading || !token}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '🔍'} Get Settings
                        </button>
                        <button
                            onClick={testGetAnswersData}
                            disabled={loading || !token}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '📝'} Get Answers
                        </button>
                        <button
                            onClick={testStartAutomation}
                            disabled={loading || !token}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '▶'} Start Bot
                        </button>
                        <button
                            onClick={testStopAutomation}
                            disabled={loading || !token}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '⏹'} Stop Bot
                        </button>
                        <button
                            onClick={testGetStatus}
                            disabled={loading || !token}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '⚙'} Status
                        </button>
                        <button
                            onClick={testGetLogs}
                            disabled={loading || !token}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '📜'} Get Logs
                        </button>
                        <button
                            onClick={testClearLogs}
                            disabled={loading || !token}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '🗑'} Clear Logs
                        </button>
                        <button
                            onClick={runAllTests}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-bold"
                        >
                            {loading ? <Loader className="inline mr-2 h-4 w-4 animate-spin" /> : '▶'} Run All Tests
                        </button>
                    </div>
                    <button
                        onClick={clearResponses}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" /> Clear All Responses
                    </button>
                </div>

                {/* Responses Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        API Responses ({responses.length})
                    </h2>
                    {responses.length === 0 ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                            <p className="text-blue-700">Click any button to test the API endpoints</p>
                        </div>
                    ) : (
                        responses.map((response, index) => (
                            <div
                                key={index}
                                className={`border-l-4 rounded-lg p-4 ${response.status === 200 || response.status === 201
                                    ? 'bg-green-50 border-green-400'
                                    : 'bg-red-50 border-red-400'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {response.status === 200 || response.status === 201 ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-red-600" />
                                            )}
                                            <span className="font-semibold text-gray-800">
                                                {response.method} {response.endpoint}
                                            </span>
                                            <span
                                                className={`text-sm px-2 py-1 rounded ${response.status === 200 || response.status === 201
                                                    ? 'bg-green-200 text-green-800'
                                                    : 'bg-red-200 text-red-800'
                                                    }`}
                                            >
                                                {response.status} {response.statusText}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">{response.timestamp}</p>
                                        <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-auto max-h-96">
                                            {response.error ? (
                                                <pre className="text-red-400">{response.error}</pre>
                                            ) : (
                                                <pre>{JSON.stringify(response.data, null, 2)}</pre>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
                                            alert('Copied to clipboard!');
                                        }}
                                        className="ml-4 p-2 hover:bg-gray-200 rounded"
                                    >
                                        <Copy className="h-4 w-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default APITester;
