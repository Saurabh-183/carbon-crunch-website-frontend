import HomePage from "./pages/HomePage";
import { Navigate, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import BookDemoPage from "./pages/BookDemoPage";
import ContactPage from "./pages/ContactPage";
import CaseStudiesPage from "./pages/CaseStudiesPage";
import IndustriesPage from "./pages/IndustriesPage";
import AboutPage from "./pages/AboutPage";
import BrsrPage from "./pages/BrsrPage";
import CarbonOsPage from "./pages/CarbonOsPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ScrollToTop from "./components/ScrollToTop";
import GHGCalculator from "./components/GHGCalculator";
import { useAuth } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import EnergyManagerDashboard from "./pages/dashboards/EnergyManagerDashboard";
import DataEntry from "./pages/energymanager/DataEntryV2";
import OfficeInformation from "./pages/energymanager/OfficeInformation";
import EnergyReports from "./pages/energymanager/EnergyReports";
import ManageEmissionFactors from "./pages/maintainer/ManageEmissionFactors";
import QueryDashboard from "./pages/helpdesk/QueryDashboard";
import BulkImport from "./pages/energymanager/BulkImport";
import AIOCR from "./pages/energymanager/AIOCR";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

export const getDashboardRoute = (role) => {
  return "/dashboard";
};

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book-demo" element={<BookDemoPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/case-studies" element={<CaseStudiesPage />} />
        <Route path="/industries" element={<IndustriesPage />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/brsr-reporting" element={<BrsrPage />} />
        <Route path="/carbon-os" element={<CarbonOsPage />} />
        <Route path="/calculator" element={<GHGCalculator />} />
        
        {/* ICAI Integration Routes */}
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <EnergyManagerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/data-entry" 
          element={
            <ProtectedRoute>
              <DataEntry />
            </ProtectedRoute>
          } 
        />
        <Route path="/energy/office-information" element={<ProtectedRoute><OfficeInformation /></ProtectedRoute>} />
        <Route path="/emission-factors" element={<ProtectedRoute><ManageEmissionFactors /></ProtectedRoute>} />
        <Route path="/energy/reports" element={<ProtectedRoute><EnergyReports /></ProtectedRoute>} />
        <Route path="/helpdesk/dashboard" element={<ProtectedRoute><QueryDashboard /></ProtectedRoute>} />
        <Route path="/energy/bulk-import" element={<ProtectedRoute><BulkImport /></ProtectedRoute>} />
        <Route path="/energy/ai-ocr" element={<ProtectedRoute><AIOCR /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
