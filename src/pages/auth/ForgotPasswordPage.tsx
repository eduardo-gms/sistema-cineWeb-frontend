import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(res.data.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao tentar recuperar a senha.';
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
                <i className="bi bi-shield-lock me-2"></i>Recuperar Senha
              </h3>
              <p className="text-muted">Enviaremos instruções para o seu e-mail</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success d-flex align-items-center" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                <span>{success}</span>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="forgot-email" className="form-label">
                    <i className="bi bi-envelope me-1"></i> Seu E-mail
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
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
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Enviar Link
                    </>
                  )}
                </button>
              </form>
            )}

            <hr className="my-4" />
            <div className="text-center">
              <Link to="/login" className="text-decoration-none text-muted small">
                <i className="bi bi-arrow-left me-1"></i> Voltar para o Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
