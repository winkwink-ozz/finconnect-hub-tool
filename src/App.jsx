import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MerchantIntake from './pages/MerchantIntake';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-obsidian-900 text-gray-100 font-sans">
        <Routes>
          {/* 1. PUBLIC ROUTES 
             If user hits root '/', send them to onboarding (Client friendly)
          */}
          <Route path="/" element={<Navigate to="/onboard" replace />} />
          <Route path="/onboard" element={<MerchantIntake />} />
          <Route path="/login" element={<AdminLogin />} />

          {/* 2. PROTECTED ADMIN ROUTES 
             Everything inside here requires the password
          */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Future: Route path="/admin/merchant/:id" element={<MerchantDetail />} */}
          </Route>

        </Routes>
      </div>
    </Router>
  );
};

export default App;
