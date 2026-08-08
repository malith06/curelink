import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import NearbyPharmacySearchPage from './pages/NearbyPharmacySearchPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import CustomerRegisterPage from './pages/auth/CustomerRegisterPage';
import PharmacyRegisterPage from './pages/auth/PharmacyRegisterPage';

// Dashboard Pages
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import PharmacyDashboardPage from './pages/pharmacy/PharmacyDashboardPage';

// Admin Protected Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPharmaciesPage from './pages/admin/pharmacies/AdminPharmaciesPage';
import AdminPharmacyDetailsPage from './pages/admin/pharmacies/AdminPharmacyDetailsPage';
import AdminMedicinesPage from './pages/admin/medicines/AdminMedicinesPage';
import AdminPaymentsPage from './pages/admin/payments/AdminPaymentsPage';

// Pharmacy Protected Pages
import PharmacyProfilePage from './pages/pharmacy/PharmacyProfilePage';
import PharmacyLocationPage from './pages/pharmacy/PharmacyLocationPage';
import PharmacyAvailabilityPage from './pages/pharmacy/PharmacyAvailabilityPage';
import PharmacyInboxPage from './pages/pharmacy/requests/PharmacyInboxPage';
import PharmacyRequestDetailsPage from './pages/pharmacy/requests/PharmacyRequestDetailsPage';
import PharmacyQuotationsPage from './pages/pharmacy/quotations/PharmacyQuotationsPage';
import PharmacyOrdersPage from './pages/pharmacy/orders/PharmacyOrdersPage';
import PharmacyOrderDetailsPage from './pages/pharmacy/orders/PharmacyOrderDetailsPage';

// Customer Protected Pages
import CustomerRequestsPage from './pages/customer/requests/CustomerRequestsPage';
import CreateRequestPage from './pages/customer/requests/CreateRequestPage';
import RequestDetailsPage from './pages/customer/requests/RequestDetailsPage';
import CustomerQuotationDetailsPage from './pages/customer/quotations/CustomerQuotationDetailsPage';
import CustomerOrdersPage from './pages/customer/orders/CustomerOrdersPage';
import CreateOrderPage from './pages/customer/orders/CreateOrderPage';
import PaymentSelectionPage from './pages/customer/orders/PaymentSelectionPage';
import PaymentSuccessPage from './pages/customer/orders/PaymentSuccessPage';
import PaymentCancelPage from './pages/customer/orders/PaymentCancelPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            {/* Public Routes wrapped in PublicLayout */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="/pharmacies/nearby" element={<NearbyPharmacySearchPage />} />
              <Route path="/register/customer" element={<CustomerRegisterPage />} />
              <Route path="/register/pharmacy" element={<PharmacyRegisterPage />} />
              
              {/* Customer Routes */}
              <Route 
                path="/customer/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/requests" 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerRequestsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/requests/new" 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CreateRequestPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/requests/:id" 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <RequestDetailsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/requests/:id/quotations/:quotationId" 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerQuotationDetailsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/orders" 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerOrdersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/orders/create/:quotationId" 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CreateOrderPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/orders/:orderId/payment" 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <PaymentSelectionPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/orders/:orderId/payment/success" 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/orders/:orderId/payment/cancel" 
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <PaymentCancelPage />
                  </ProtectedRoute>
                } 
              />

              {/* Pharmacy Routes */}
              <Route 
                path="/pharmacy/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['PHARMACY']}>
                    <PharmacyDashboardPage />
                  </ProtectedRoute>
                } 
              />
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
              <Route 
                path="/pharmacy/inbox" 
                element={
                  <ProtectedRoute allowedRoles={['PHARMACY']}>
                    <PharmacyInboxPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pharmacy/quotations" 
                element={
                  <ProtectedRoute allowedRoles={['PHARMACY']}>
                    <PharmacyQuotationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pharmacy/requests/:id" 
                element={
                  <ProtectedRoute allowedRoles={['PHARMACY']}>
                    <PharmacyRequestDetailsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pharmacy/orders" 
                element={
                  <ProtectedRoute allowedRoles={['PHARMACY']}>
                    <PharmacyOrdersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pharmacy/orders/:id" 
                element={
                  <ProtectedRoute allowedRoles={['PHARMACY']}>
                    <PharmacyOrderDetailsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/pharmacies" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminPharmaciesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/pharmacies/:id" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminPharmacyDetailsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/medicines" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminMedicinesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payments" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminPaymentsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
