import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MerchantIntake from './pages/MerchantIntake';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout'; // The new wrapper
import Dashboard from './pages/admin/Dashboard';
import Profiles from './pages/admin/Profiles';
import Applications from './pages/admin/Applications';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-obsidian-900 text-gray-100 font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/onboard" replace />} />
          <Route path="/onboard" element={<MerchantIntake />} />
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
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
