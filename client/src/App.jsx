import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CaccoProvider } from './services/CaccoData';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

const CommandCenter       = lazy(() => import('./pages/CommandCenter'));
const SecurityOperations  = lazy(() => import('./pages/SecurityOperations'));
const SurveillanceCenter  = lazy(() => import('./pages/SurveillanceCenter'));
const IncidentManagement  = lazy(() => import('./pages/IncidentManagement'));
const InmateIntelligence  = lazy(() => import('./pages/InmateIntelligence'));
const AIAnalytics         = lazy(() => import('./pages/AIAnalytics'));
const StaffOperations     = lazy(() => import('./pages/StaffOperations'));
const RehabilitationPrograms = lazy(() => import('./pages/RehabilitationPrograms'));
const DigitalTwin         = lazy(() => import('./pages/DigitalTwin'));
const Reports             = lazy(() => import('./pages/Reports'));
const SystemAdmin         = lazy(() => import('./pages/SystemAdmin'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <CaccoProvider>
          <BrowserRouter>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/"              element={<CommandCenter />} />
                  <Route path="/security"      element={<SecurityOperations />} />
                  <Route path="/surveillance"  element={<SurveillanceCenter />} />
                  <Route path="/incidents"     element={<IncidentManagement />} />
                  <Route path="/intelligence"  element={<InmateIntelligence />} />
                  <Route path="/analytics"     element={<AIAnalytics />} />
                  <Route path="/staff"         element={<StaffOperations />} />
                  <Route path="/rehabilitation" element={<RehabilitationPrograms />} />
                  <Route path="/twin"          element={<DigitalTwin />} />
                  <Route path="/reports"       element={<Reports />} />
                  <Route path="/admin"         element={<SystemAdmin />} />
                  <Route path="*"             element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </BrowserRouter>
        </CaccoProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
