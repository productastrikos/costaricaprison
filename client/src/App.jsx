/* ════════════════════════════════════════════════════════════════════
   CACCO Command Platform — Application root
   React Router v6 · CaccoProvider · all 11 routes
   ════════════════════════════════════════════════════════════════════ */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CaccoProvider } from './services/CaccoData';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
/* ── Page imports ───────────────────────────────────────────────────── */
import CommandCenter from './pages/CommandCenter';
import SecurityOperations from './pages/SecurityOperations';
import SurveillanceCenter from './pages/SurveillanceCenter';
import InmateIntelligence from './pages/InmateIntelligence';
import StaffOperations from './pages/StaffOperations';
import RehabilitationPrograms from './pages/RehabilitationPrograms';
import IncidentManagement from './pages/IncidentManagement';
import AIAnalytics from './pages/AIAnalytics';
import DigitalTwin from './pages/DigitalTwin';
import Reports from './pages/Reports';
import SystemAdmin from './pages/SystemAdmin';
export default function App() {
    return (<LanguageProvider>
      <CaccoProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Command */}
            <Route path="/" element={<CommandCenter />}/>
            {/* Operations */}
            <Route path="/security" element={<SecurityOperations />}/>
            <Route path="/surveillance" element={<SurveillanceCenter />}/>
            <Route path="/incidents" element={<IncidentManagement />}/>
            {/* Intelligence */}
            <Route path="/intelligence" element={<InmateIntelligence />}/>
            <Route path="/analytics" element={<AIAnalytics />}/>
            {/* Facility */}
            <Route path="/staff" element={<StaffOperations />}/>
            <Route path="/rehabilitation" element={<RehabilitationPrograms />}/>
            <Route path="/twin" element={<DigitalTwin />}/>
            {/* Governance */}
            <Route path="/reports" element={<Reports />}/>
            <Route path="/admin" element={<SystemAdmin />}/>
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </Routes>
        </Layout>
      </BrowserRouter>
    </CaccoProvider>
    </LanguageProvider>);
}
