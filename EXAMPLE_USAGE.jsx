/**
 * ======================== EXAMPLE: DASHBOARD INTEGRATION ========================
 * This shows how to integrate the automation API into your Dashboard component
 * Copy these patterns into your existing Dashboard.tsx file
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    startAutomation,
    stopAutomation,
    getAutomationLogs,
    checkCredentials,
    saveCredentials,
    uploadResume,
    getAutomationStatus,
} from '../services/automationApi.js';

/**
 * Example function to be added to your Dashboard.tsx
 */

// State variables to add
const [isRunning, setIsRunning] = useState(false);
const [logs, setLogs] = useState([]);
const [credentials, setCredentials] = useState({
    email: '',
    password: '',
});
const [showCredentialForm, setShowCredentialForm] = useState(false);
const [uploadedFile, setUploadedFile] = useState(null);
const logContainerRef = useRef(null);

// ======================== INITIALIZATION ========================

useEffect(() => {
    // Check if credentials are already saved
    const checkCreds = async () => {
        try {
            const result = await checkCredentials();
            if (!result.hasCredentials) {
                setShowCredentialForm(true);
            }
        } catch (error) {
            console.error('Error checking credentials:', error);
        }
    };

    checkCreds();
}, []);

// Auto-scroll logs
useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
}, [logs]);

// ======================== CREDENTIAL MANAGEMENT ========================

const handleSaveCredentials = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
        alert('Please enter both email and password');
        return;
    }

    try {
        const result = await saveCredentials(
            credentials.email,
            credentials.password
        );

        if (result.success) {
            alert('Credentials saved securely!');
            setShowCredentialForm(false);
            setCredentials({ email: '', password: '' });
        }
    } catch (error) {
        alert(`Error saving credentials: ${error.message}`);
    }
};

// ======================== RESUME UPLOAD ========================

const handleResumeUpload = async (file) => {
    try {
        const result = await uploadResume(file);

        if (result.success) {
            setUploadedFile(result.fileName);
            alert(`Resume uploaded: ${result.fileName}`);
        }
    } catch (error) {
        alert(`Error uploading resume: ${error.message}`);
    }
};

// ======================== AUTOMATION CONTROL ========================

const handleStartBot = async () => {
    try {
        // Check credentials first
        const credResult = await checkCredentials();
        if (!credResult.hasCredentials) {
            alert('Please save your Naukri credentials first');
            setShowCredentialForm(true);
            return;
        }

        setIsRunning(true);
        setLogs([]); // Clear previous logs

        // Start automation
        const result = await startAutomation({
            jobUrl:
                'https://www.naukri.com/dot-net-developer-jobs?k=dot%20net%20developer&experience=3&jobAge=1',
            maxPages: 5, // Start with 5, increase for production
            resumeText: null, // If you have uploaded resume text, pass it here
        });

        if (result.success) {
            // Start polling logs
            startLogPolling();

            alert(`Automation completed! Applied to ${result.jobsApplied} jobs`);
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        alert(`Error starting automation: ${error.message}`);
    } finally {
        setIsRunning(false);
    }
};

const handleStopBot = async () => {
    try {
        const result = await stopAutomation();

        if (result.success) {
            setIsRunning(false);
            setLogs(result.logs);
            alert('Automation stopped');
        }
    } catch (error) {
        alert(`Error stopping automation: ${error.message}`);
    }
};

// ======================== LOG POLLING ========================

const startLogPolling = () => {
    const interval = setInterval(async () => {
        try {
            const result = await getAutomationLogs();
            setLogs(result.logs);

            // Stop polling if automation is no longer running
            if (!result.isRunning) {
                clearInterval(interval);
                setIsRunning(false);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            clearInterval(interval);
        }
    }, 2000); // Poll every 2 seconds

    // Clean up interval on component unmount
    return () => clearInterval(interval);
};

// ======================== RENDER FUNCTIONS ========================

const renderCredentialForm = () => {
    if (!showCredentialForm) return null;

    return (
        <div className="bg-dark-800 border border-neon-blue rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-neon-blue mb-4">
                Save Naukri Credentials
            </h3>

            <form onSubmit={handleSaveCredentials}>
                <div className="mb-4">
                    <label className="block text-slate-300 mb-2">Email/Username</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-2 bg-dark-700 border border-slate-600 rounded text-white"
                        placeholder="your-email@naukri.com"
                        value={credentials.email}
                        onChange={(e) =>
                            setCredentials({ ...credentials, email: e.target.value })
                        }
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-slate-300 mb-2">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2 bg-dark-700 border border-slate-600 rounded text-white"
                        placeholder="Your password"
                        value={credentials.password}
                        onChange={(e) =>
                            setCredentials({ ...credentials, password: e.target.value })
                        }
                    />
                </div>

                <button
                    type="submit"
                    className="px-6 py-2 bg-neon-blue text-black rounded font-bold hover:bg-neon-cyan transition"
                >
                    Save Credentials Securely
                </button>
                <button
                    type="button"
                    onClick={() => setShowCredentialForm(false)}
                    className="ml-4 px-6 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition"
                >
                    Cancel
                </button>
            </form>

            <p className="text-slate-400 text-sm mt-4">
                💡 Your credentials are stored securely in your system keychain and
                never transmitted to external services.
            </p>
        </div>
    );
};

const renderResumeUpload = () => {
    return (
        <div className="bg-dark-800 border border-slate-600 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-slate-200 mb-2">Upload Resume (Optional)</h4>

            <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                        handleResumeUpload(e.target.files[0]);
                    }
                }}
                className="text-sm text-slate-400"
            />

            {uploadedFile && (
                <p className="text-neon-green text-sm mt-2">✓ {uploadedFile}</p>
            )}
        </div>
    );
};

const renderControls = () => {
    return (
        <div className="flex gap-4 mb-6">
            <button
                onClick={handleStartBot}
                disabled={isRunning}
                className="px-8 py-3 bg-neon-green text-black font-bold rounded-lg hover:bg-neon-cyan disabled:opacity-50 transition"
            >
                {isRunning ? '⏳ Running...' : '▶ Start Bot'}
            </button>

            <button
                onClick={handleStopBot}
                disabled={!isRunning}
                className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
            >
                ⏹ Stop Bot
            </button>

            <button
                onClick={() => setShowCredentialForm(!showCredentialForm)}
                className="px-8 py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-700 transition"
            >
                🔑 Credentials
            </button>
        </div>
    );
};

const renderLogs = () => {
    return (
        <div className="bg-dark-800 border border-slate-600 rounded-lg p-4">
            <h3 className="text-lg font-bold text-slate-200 mb-4">
                Live Logs ({logs.length})
            </h3>

            <div
                ref={logContainerRef}
                className="bg-dark-900 rounded p-4 h-96 overflow-y-auto font-mono text-sm"
            >
                {logs.length === 0 ? (
                    <p className="text-slate-500">Logs will appear here...</p>
                ) : (
                    logs.map((log, index) => (
                        <div
                            key={index}
                            className={`py-1 ${log.type === 'success'
                                    ? 'text-neon-green'
                                    : log.type === 'error'
                                        ? 'text-red-400'
                                        : log.type === 'warning'
                                            ? 'text-yellow-400'
                                            : 'text-slate-400'
                                }`}
                        >
                            <span className="text-slate-600">[{log.timestamp}]</span>{' '}
                            {log.message}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ======================== MAIN RENDER ========================

return (
    <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-neon-blue mb-8">🤖 Job Automation</h1>

        {/* Credentials Form */}
        {renderCredentialForm()}

        {/* Resume Upload */}
        {renderResumeUpload()}

        {/* Control Buttons */}
        {renderControls()}

        {/* Logs */}
        {renderLogs()}

        {/* Footer */}
        <div className="mt-8 p-4 bg-dark-800 rounded text-slate-400 text-sm">
            <p>
                ℹ️ The bot will automatically login, search jobs, apply, and answer
                interview questions using AI.
            </p>
            <p className="mt-2">
                📊 Monitor progress in the logs above. This may take several minutes
                depending on number of pages.
            </p>
        </div>
    </div>
);

/**
 * ======================== INTEGRATION TIPS ========================
 *
 * 1. Copy the imports at the top into your Dashboard.tsx
 *
 * 2. Copy all the state variables (useState hooks)
 *
 * 3. Copy the useEffect hooks for initialization and auto-scroll
 *
 * 4. Copy all the handler functions (handleStartBot, handleStopBot, etc)
 *
 * 5. Copy the render functions into your component's return statement
 *
 * 6. Adjust styling classes if you use different CSS framework
 *
 * 7. Customize the jobUrl in handleStartBot based on your preferences
 *
 * 8. Test thoroughly before deploying to production
 *
 * ======================== CUSTOMIZATION ========================
 *
 * Change job search URL:
 * https://www.naukri.com/[job-title]-jobs?...parameters...
 *
 * Adjust polling interval (currently 2000ms):
 * setInterval(..., 2000)  // Change 2000 to desired milliseconds
 *
 * Increase/decrease max pages:
 * maxPages: 5  // Change 5 to desired number
 *
 * Add resume text to automation:
 * resumeText: resumeFileContent  // Pass file content here
 */
