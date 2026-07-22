import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPlaceholderPage from './pages/LoginPlaceholderPage';
import NotFoundPage from './pages/NotFoundPage';
import CustomerRegisterPage from './pages/auth/CustomerRegisterPage';
import PharmacyRegisterPage from './pages/auth/PharmacyRegisterPage';
import PharmacyProfilePage from './pages/pharmacy/PharmacyProfilePage';
import PharmacyLocationPage from './pages/pharmacy/PharmacyLocationPage';
import PharmacyAvailabilityPage from './pages/pharmacy/PharmacyAvailabilityPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes wrapped in PublicLayout */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="login" element={<LoginPlaceholderPage />} />
          <Route path="/register/customer" element={<CustomerRegisterPage />} />
          <Route path="/register/pharmacy" element={<PharmacyRegisterPage />} />
          
          <Route 
            path="/pharmacy/profile" 
            element={
              <ProtectedRoute allowedRoles={['PHARMACY']}>
                <PharmacyProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pharmacy/location" 
            element={
              <ProtectedRoute allowedRoles={['PHARMACY']}>
                <PharmacyLocationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pharmacy/availability" 
            element={
              <ProtectedRoute allowedRoles={['PHARMACY']}>
                <PharmacyAvailabilityPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
