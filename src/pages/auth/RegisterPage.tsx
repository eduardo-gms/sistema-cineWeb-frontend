import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Cadastra
      await api.post('/auth/register', { nome, email, senha });
      // 2. Faz login automaticamente e vai para home
      await login(email, senha);
      navigate('/');
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Erro ao realizar cadastro. Tente novamente.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row justify-content-center" style={{ minHeight: '70vh', alignItems: 'center' }}>
      <div className="col-md-5 col-lg-4">
        <div className="card shadow-lg border-0">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <h3 className="fw-bold">
                <i className="bi bi-person-plus me-2"></i>Cadastro
              </h3>
              <p className="text-muted">Crie sua conta no CineWeb</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="register-nome" className="form-label">
                  <i className="bi bi-person me-1"></i> Nome Completo
                </label>
                <input
                  id="register-nome"
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label htmlFor="register-email" className="form-label">
                  <i className="bi bi-envelope me-1"></i> E-mail
                </label>
                <input
                  id="register-email"
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="register-senha" className="form-label">
                  <i className="bi bi-lock me-1"></i> Senha
                </label>
                <input
                  id="register-senha"
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-dark btn-lg w-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Cadastrar
                  </>
                )}
              </button>
            </form>

            <hr className="my-4" />
            <div className="text-center">
              <Link to="/login" className="text-decoration-none text-muted small">
                Já tem uma conta? <span className="text-dark fw-bold">Entre aqui</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
