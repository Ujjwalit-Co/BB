import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProjectDetails from './pages/ProjectDetails';
import Dashboard from './pages/Dashboard';
import SellerPortal from './pages/SellerPortal';
import UploadProject from './pages/UploadProject';
import AdminDashboard from './pages/AdminDashboard';
import GitHubCallback from './pages/GitHubCallback';
import Auth from './pages/Auth';
import Lab from './pages/Lab';
import BuyCredits from './pages/BuyCredits';
import SellerProfile from './pages/SellerProfile'; // Added import for SellerProfile
import { Toaster } from 'react-hot-toast';
import CheckoutModal from './components/CheckoutModal';

function AppContent() {
  const location = useLocation();
  const isLab = location.pathname.startsWith('/lab');

  if (isLab) {
    return (
      <Routes>
        <Route path="/lab/:id" element={<Lab />} />
        <Route path="/lab" element={<Lab />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0d0d0d] text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <main className="flex-grow selection:bg-blue-500/30 overflow-x-hidden pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/seller" element={<SellerPortal />} />
          <Route path="/seller/upload" element={<UploadProject />} />
          <Route path="/seller/github-callback" element={<GitHubCallback />} />
          <Route path="/seller/:sellerId/profile" element={<SellerProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/buy-credits" element={<BuyCredits />} />
        </Routes>
      </main>
      <Footer />
      <CheckoutModal />
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

