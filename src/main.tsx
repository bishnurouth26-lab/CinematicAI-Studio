import React, { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AuthProvider } from './lib/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Apply initial system theme
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('theme-light');
}

// Core modules (loaded immediately)
import { Dashboard } from './pages/Dashboard';
import { Auth } from './pages/Auth';

// Utility to retry lazy imports
const autoRetryLazy = (componentImport: () => Promise<{ default: React.ComponentType<any> }>) => {
  return React.lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        // Return a never-resolving promise to block React from throwing during the immediate reload
        return new Promise(() => {}) as Promise<{ default: React.ComponentType<any> }>;
      }
      throw error;
    }
  });
};

// Lazy loaded feature modules for architecture scalability
const ScriptGenerator = autoRetryLazy(() => import('./pages/ScriptGenerator').then(m => ({ default: m.ScriptGenerator })));
const TrendingTopics = autoRetryLazy(() => import('./pages/TrendingTopics').then(m => ({ default: m.TrendingTopics })));
const ThumbnailGenerator = autoRetryLazy(() => import('./pages/ThumbnailGenerator').then(m => ({ default: m.ThumbnailGenerator })));
const ScenePrompts = autoRetryLazy(() => import('./pages/ScenePrompts').then(m => ({ default: m.ScenePrompts })));
const AudioGenerator = autoRetryLazy(() => import('./pages/AudioGenerator').then(m => ({ default: m.AudioGenerator })));
const SEO = autoRetryLazy(() => import('./pages/SEO').then(m => ({ default: m.SEO })));
const ShortsConverter = autoRetryLazy(() => import('./pages/Shorts').then(m => ({ default: m.ShortsConverter })));
const ResearchAssistant = autoRetryLazy(() => import('./pages/ResearchAssistant').then(m => ({ default: m.ResearchAssistant })));
const Workspace = autoRetryLazy(() => import('./pages/Workspace').then(m => ({ default: m.Workspace })));
const TimelineEditor = autoRetryLazy(() => import('./pages/TimelineEditor').then(m => ({ default: m.TimelineEditor })));
const AiSettings = autoRetryLazy(() => import('./pages/AiSettings').then(m => ({ default: m.AiSettings })));
const ExportStudio = autoRetryLazy(() => import('./pages/ExportStudio').then(m => ({ default: m.ExportStudio })));
const Automations = autoRetryLazy(() => import('./pages/Automations').then(m => ({ default: m.Automations })));
const LocalizationStudio = autoRetryLazy(() => import('./pages/LocalizationStudio').then(m => ({ default: m.LocalizationStudio })));
const MobileStudio = autoRetryLazy(() => import('./pages/MobileStudio').then(m => ({ default: m.MobileStudio })));
const AdminDashboard = autoRetryLazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const MediaLibrary = autoRetryLazy(() => import('./pages/MediaLibrary').then(m => ({ default: m.MediaLibrary })));
const Settings = autoRetryLazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

const SuspenseFallback = () => (
  <div className="flex-1 w-full flex items-center justify-center min-h-[50vh]">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border border-white/20 rounded-full animate-[spin_3s_linear_infinite]" />
      <div className="absolute inset-0 border-t border-cyan-glow rounded-full animate-[spin_1s_ease-in-out_infinite]" />
    </div>
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <ErrorBoundary>
    <Suspense fallback={<SuspenseFallback />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="automations" element={withSuspense(Automations)} />
              <Route path="localization" element={withSuspense(LocalizationStudio)} />
              <Route path="mobile-studio" element={withSuspense(MobileStudio)} />
              <Route path="admin" element={withSuspense(AdminDashboard)} />
              <Route path="workspace" element={withSuspense(Workspace)} />
              <Route path="timeline" element={withSuspense(TimelineEditor)} />
              <Route path="export" element={withSuspense(ExportStudio)} />
              <Route path="library" element={withSuspense(MediaLibrary)} />
              <Route path="ai-settings" element={withSuspense(AiSettings)} />
              <Route path="trending" element={withSuspense(TrendingTopics)} />
              <Route path="scripts" element={withSuspense(ScriptGenerator)} />
              <Route path="scenes" element={withSuspense(ScenePrompts)} />
              <Route path="thumbnails" element={withSuspense(ThumbnailGenerator)} />
              <Route path="audio" element={withSuspense(AudioGenerator)} />
              <Route path="research" element={withSuspense(ResearchAssistant)} />
              <Route path="seo" element={withSuspense(SEO)} />
              <Route path="shorts" element={withSuspense(ShortsConverter)} />
              <Route path="settings" element={withSuspense(Settings)} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
