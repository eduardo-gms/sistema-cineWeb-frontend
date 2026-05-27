import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-film me-1"></i> CineWeb
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/filmes">Filmes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/salas">Salas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sessoes">Sessões</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/lanches">Lanches & Combos</Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <>
                <span className="text-light me-3 small">
                  <i className="bi bi-person-circle me-1"></i>
                  {user?.nome}
                  <span className="badge bg-secondary ms-2">{user?.perfil}</span>
                </span>
                <button
                  id="navbar-logout-btn"
                  className="btn btn-outline-light btn-sm"
                  onClick={logout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Sair
                </button>
              </>
            ) : (
              <Link id="navbar-login-btn" className="btn btn-outline-light btn-sm" to="/login">
                <i className="bi bi-box-arrow-in-right me-1"></i> Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;