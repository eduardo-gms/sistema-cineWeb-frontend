import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
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
      await login(email.trim(), senha);
      navigate('/');
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Erro ao realizar login. Verifique suas credenciais.';
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
                <i className="bi bi-film me-2"></i>CineWeb
              </h3>
              <p className="text-muted">Faça login para acessar o sistema</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="login-email" className="form-label">
                  <i className="bi bi-envelope me-1"></i> E-mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label htmlFor="login-senha" className="form-label">
                  <i className="bi bi-lock me-1"></i> Senha
                </label>
                <input
                  id="login-senha"
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
                id="login-submit-btn"
                type="submit"
                className="btn btn-dark btn-lg w-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Entrar
                  </>
                )}
              </button>
            </form>

            <hr className="my-4" />
            <div className="text-center">
              <Link to="/forgot-password" className="text-decoration-none text-muted small d-block mb-2">
                <i className="bi bi-question-circle me-1"></i> Esqueceu a senha?
              </Link>
              <Link to="/register" className="text-decoration-none text-dark fw-bold small">
                Ainda não tem conta? Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
