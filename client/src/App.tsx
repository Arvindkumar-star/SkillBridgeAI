import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ResumesPage } from './pages/resumes/ResumesPage';
import { ResumeUploadPage } from './pages/resumes/ResumeUploadPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { NewJobPage } from './pages/jobs/NewJobPage';
import { JobDetailPage } from './pages/jobs/JobDetailPage';
import { AnalysisDetailPage } from './pages/analysis/AnalysisDetailPage';
import { RoadmapDetailPage } from './pages/roadmap/RoadmapDetailPage';
import { RoadmapsPage } from './pages/roadmap/RoadmapsPage';
import { AssessmentsPage } from './pages/assessments/AssessmentsPage';
import { AssessmentTestPage } from './pages/assessments/AssessmentTestPage';
import { SimulatorPage } from './pages/simulator/SimulatorPage';
import { ApplicationsPage } from './pages/applications/ApplicationsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { AssistantPage } from './pages/assistant/AssistantPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Workspace */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/resumes" element={<ResumesPage />} />
              <Route path="/resumes/upload" element={<ResumeUploadPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/new" element={<NewJobPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/analysis/:id" element={<AnalysisDetailPage />} />
              <Route path="/roadmaps" element={<RoadmapsPage />} />
              <Route path="/roadmaps/:id" element={<RoadmapDetailPage />} />
              <Route path="/assessments" element={<AssessmentsPage />} />
              <Route path="/assessments/:id" element={<AssessmentTestPage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
