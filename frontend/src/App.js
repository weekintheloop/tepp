import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Layout Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import LoadingSpinner from './components/ui/loading-spinner';

// Page Components
import LoginPage from './pages/Auth/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import AlunosPage from './pages/Alunos/AlunosPage';
import RotasPage from './pages/Rotas/RotasPage';
import EscolasPage from './pages/Escolas/EscolasPage';
import VeiculosPage from './pages/Veiculos/VeiculosPage';
import FrequenciaPage from './pages/Frequencia/FrequenciaPage';
import OcorrenciasPage from './pages/Ocorrencias/OcorrenciasPage';
import RelatoriosPage from './pages/Relatorios/RelatoriosPage';
import ConfiguracoesPage from './pages/Configuracoes/ConfiguracoesPage';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main App Layout
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/alunos" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <AlunosPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/rotas" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <RotasPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/escolas" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EscolasPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/veiculos" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <VeiculosPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/frequencia" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <FrequenciaPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/ocorrencias" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <OcorrenciasPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/relatorios" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <RelatoriosPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="/configuracoes" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ConfiguracoesPage />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;