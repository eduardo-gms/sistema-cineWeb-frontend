import { useEffect, useState } from 'react';
import { getSalas, deleteSala } from '../../services/api';
import { type Sala } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SalasLista = () => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const carregarSalas = async () => {
    try {
      setLoading(true);
      const response = await getSalas();
      setSalas(response.data);
    } catch (error) {
      console.error("Erro ao carregar salas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarSalas(); }, []);

  const requireAuth = (callback: () => void) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    callback();
  };

  const deletarSala = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta sala?")) {
      try {
        await deleteSala(id);
        carregarSalas(); // Atualiza a lista
      } catch (error) {
        alert("Erro ao excluir sala.");
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciamento de Salas</h2>
        {isAuthenticated ? (
          <Link to="/salas/novo" className="btn btn-success">
            <i className="bi bi-plus-circle me-2"></i>Nova Sala
          </Link>
        ) : (
          <button onClick={() => navigate('/login')} className="btn btn-success">
            <i className="bi bi-plus-circle me-2"></i>Nova Sala
          </button>
        )}
      </div>

      {salas.length === 0 ? (
        <div className="alert alert-info">Nenhuma sala cadastrada.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>Número da Sala</th>
                <th>Capacidade</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {salas.map(sala => (
                <tr key={sala.id}>
                  <td className="align-middle fw-bold">Sala {sala.numero}</td>
                  <td className="align-middle">{sala.capacidade} lugares</td>
                  <td className="text-end">
                    {isAuthenticated ? (
                      <Link to={`/salas/editar/${sala.id}`} className="btn btn-warning btn-sm me-2" title="Editar Sala">
                        <i className="bi bi-pencil"></i> Editar
                      </Link>
                    ) : (
                      <button onClick={() => navigate('/login')} className="btn btn-warning btn-sm me-2" title="Editar Sala">
                        <i className="bi bi-pencil"></i> Editar
                      </button>
                    )}
                    <button
                      onClick={() => requireAuth(() => deletarSala(sala.id))}
                      className="btn btn-danger btn-sm"
                      title="Excluir Sala"
                    >
                      <i className="bi bi-trash"></i> Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalasLista;