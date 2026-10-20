import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import AppShell from './components/AppShell.jsx';
import HomePage from './pages/HomePage.jsx';
import RegionMapPage from './pages/RegionMapPage.jsx';
import RecommendationPage from './pages/RecommendationPage.jsx';
import DataPage from './pages/DataPage.jsx';
import DetailPage from './pages/DetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppShell><HomePage /></AppShell>} />
            <Route path="/wilayah" element={<AppShell><RegionMapPage /></AppShell>} />
            <Route path="/rekomendasi" element={<AppShell><RecommendationPage /></AppShell>} />
            <Route path="/data" element={<AppShell><DataPage /></AppShell>} />
            <Route path="/detail/:id" element={<AppShell><DetailPage /></AppShell>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
