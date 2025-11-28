import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// ❌ REMOVED: Unused imports (Link, motion, icons) because they moved to Landing.jsx
import MerchantIntake from './pages/MerchantIntake';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Profiles from './pages/admin/Profiles';
import Applications from './pages/admin/Applications';
import Landing from './pages/Landing'; // ✅ CRITICAL: Import the new file
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// ❌ DELETED: The inline "const Landing = ..." block is GONE.

// 🚀 MAIN APP ROUTER
const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-obsidian-900 text-gray-100 font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/onboard" element={<MerchantIntake />} />
          <Route path="/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profiles" element={<Profiles />} />
              <Route path="applications" element={<Applications />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
