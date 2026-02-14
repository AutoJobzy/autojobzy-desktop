import React, { useEffect, useRef, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChromeInstallProgress from './components/ChromeInstallProgress';
import Auth from './pages/Auth';
import Plans from './pages/Plans';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import APITester from './pages/APITester';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import Contact from './pages/Contact';
import AboutUs from './pages/AboutUs';
import WhyWeBuilt from './pages/WhyWeBuilt';
import ApplicationHistory from './pages/ApplicationHistory';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminInstitutes from './pages/SuperAdminInstitutes';
import SuperAdminInstituteDetails from './pages/SuperAdminInstituteDetails';
import SuperAdminPackages from './pages/SuperAdminPackages';
import SuperAdminIndividualUsers from './pages/SuperAdminIndividualUsers';
import SuperAdminUsers from './pages/SuperAdminUsers';
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute';
import InstituteSignup from './pages/InstituteSignup';
import InstitutePending from './pages/InstitutePending';
import InstituteAdminLogin from './pages/InstituteAdminLogin';
import InstituteAdminDashboard from './pages/InstituteAdminDashboard';
import InstituteStudentManagement from './pages/InstituteStudentManagement';
import InstituteAdminProtectedRoute from './components/InstituteAdminProtectedRoute';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Protected Route Component - redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  if (!user.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Auth Route Component - redirects to dashboard if already logged in
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  if (user.isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, logout } = useApp();
  const location = useLocation();
  const previousPath = useRef<string | null>(null);
  const [showChromeInstall, setShowChromeInstall] = useState(false);

  // Check if running in Electron
  const isElectron = window.electron && window.electron.isElectron;

  // Listen for Chrome installation progress (Electron only)
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    // Listen for Chrome install progress events
    const cleanup = window.electronAPI.onChromeInstallProgress((progress: { message: string; percent: number }) => {
      // Show modal when Chrome installation starts
      if (progress.percent > 0 && progress.percent < 100) {
        setShowChromeInstall(true);
      }
      // Hide modal when installation completes
      if (progress.percent === 100) {
        setTimeout(() => setShowChromeInstall(false), 2000);
      }
    });

    return cleanup;
  }, [isElectron]);

  // Define protected and public routes
  const protectedRoutes = ['/dashboard', '/plans', '/setup', '/history', '/institute-admin'];
  const publicRoutes = ['/', '/login', '/signup', '/pricing', '/privacy-policy', '/terms', '/refund-policy', '/contact', '/about', '/why-we-built', '/api-tester'];

  // Monitor navigation and automatically logout when leaving Dashboard to public routes
  useEffect(() => {
    const currentPath = location.pathname;

    // Check if user is logged in and navigating from protected route to public route
    if (previousPath.current && user.isLoggedIn) {
      const wasOnProtectedRoute = protectedRoutes.some(route => previousPath.current?.startsWith(route));
      const isGoingToPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));

      if (wasOnProtectedRoute && isGoingToPublicRoute) {
        // Automatically logout when navigating from Dashboard to main website
        logout();
      }
    }

    // Update previous path for next navigation
    previousPath.current = currentPath;
  }, [location.pathname, user.isLoggedIn, logout]);

  // Check if current route is admin, superadmin, or institute-admin route
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/institute-admin');

  return (
    <div className="bg-gray-50 dark:bg-dark-900 min-h-screen text-gray-900 dark:text-slate-200 font-sans selection:bg-neon-blue selection:text-black flex flex-col transition-colors duration-200">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthRoute><Auth type="login" /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Auth type="signup" /></AuthRoute>} />
          <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><ApplicationHistory /></ProtectedRoute>} />
          <Route path="/api-tester" element={<APITester />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/why-we-built" element={<WhyWeBuilt />} />

          {/* Institute Routes */}
          <Route path="/institute-signup" element={<InstituteSignup />} />
          <Route path="/institute-pending" element={<InstitutePending />} />

          {/* Institute Admin Routes */}
          <Route path="/institute-admin/login" element={<InstituteAdminLogin />} />
          <Route path="/institute-admin" element={<InstituteAdminProtectedRoute><InstituteAdminDashboard /></InstituteAdminProtectedRoute>} />
          <Route path="/institute-admin/students" element={<InstituteAdminProtectedRoute><InstituteStudentManagement /></InstituteAdminProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />

          {/* Super Admin Routes */}
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/superadmin/dashboard" element={<SuperAdminProtectedRoute><SuperAdminDashboard /></SuperAdminProtectedRoute>} />
          <Route path="/superadmin/institutes/:id" element={<SuperAdminProtectedRoute><SuperAdminInstituteDetails /></SuperAdminProtectedRoute>} />
          <Route path="/superadmin/institutes" element={<SuperAdminProtectedRoute><SuperAdminInstitutes /></SuperAdminProtectedRoute>} />
          <Route path="/superadmin/packages" element={<SuperAdminProtectedRoute><SuperAdminPackages /></SuperAdminProtectedRoute>} />
          <Route path="/superadmin/individual-users" element={<SuperAdminProtectedRoute><SuperAdminIndividualUsers /></SuperAdminProtectedRoute>} />
          <Route path="/superadmin/users" element={<SuperAdminProtectedRoute><SuperAdminUsers /></SuperAdminProtectedRoute>} />
        </Routes>
      </main>
      {!user.isLoggedIn && !isAdminRoute && !isElectron && <Footer />}

      {/* Chrome Installation Progress Modal (Electron only) */}
      {isElectron && (
        <ChromeInstallProgress
          isOpen={showChromeInstall}
          onClose={() => setShowChromeInstall(false)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
        </AppProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;