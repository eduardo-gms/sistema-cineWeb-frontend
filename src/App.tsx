import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import FilmesLista from './pages/filmes/FilmesLista';
import FilmesForm from './pages/filmes/FilmesForm';
import SalasLista from './pages/salas/SalasLista';
import SalasForm from './pages/salas/SalasForm';
import SessoesManager from './pages/sessoes/SessoesManager';
import LancheCombosManager from './pages/lanches/LancheComboManager';
import LoginPage from './pages/auth/LoginPage';
import ComprovantePage from './pages/pedidos/ComprovantePage';

// Componente de rota protegida
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-dark" role="status" />
        <p className="mt-2">Carregando...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={
            <div className="text-center mt-5">
              <h1>Bem-vindo ao CineWeb</h1>
              <p className="lead">Utilize o menu acima para gerenciar o cinema.</p>
            </div>
          } />

          {/* Autenticação */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas públicas */}
          <Route path="/filmes" element={<FilmesLista />} />
          <Route path="/salas" element={<SalasLista />} />
          <Route path="/sessoes" element={<SessoesManager />} />
          <Route path="/lanches" element={<LancheCombosManager />} />

          {/* Rotas protegidas (requerem autenticação) */}
          <Route path="/filmes/novo" element={
            <PrivateRoute><FilmesForm /></PrivateRoute>
          } />
          <Route path="/filmes/editar/:id" element={
            <PrivateRoute><FilmesForm /></PrivateRoute>
          } />
          <Route path="/salas/novo" element={
            <PrivateRoute><SalasForm /></PrivateRoute>
          } />
          <Route path="/salas/editar/:id" element={
            <PrivateRoute><SalasForm /></PrivateRoute>
          } />

          {/* Comprovante */}
          <Route path="/pedidos/:id/comprovante" element={
            <PrivateRoute><ComprovantePage /></PrivateRoute>
          } />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;