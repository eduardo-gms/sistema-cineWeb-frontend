import { useEffect, useState } from 'react';
import { getFilmes, deleteFilme } from '../../services/api';
import type { Filme } from '../../types';
import { Link } from 'react-router-dom';

const FilmesLista = () => {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregarFilmes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getFilmes();
      setFilmes(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar filmes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarFilmes(); }, []);

  const deletarFilme = async (id: string) => {
    if (confirm("Tem certeza?")) {
      try {
        await deleteFilme(id);
        carregarFilmes();
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir o filme.");
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Filmes em Cartaz</h2>
        <Link to="/filmes/novo" className="btn btn-success"><i className="bi bi-plus-circle"></i> Novo Filme</Link>
      </div>
      <div className="row">
        {filmes.map(filme => (
          <div key={filme.id} className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{filme.titulo}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{filme.genero?.nome || filme.generoId} | {filme.duracao} min</h6>
                <p className="card-text small">
                  <strong>Elenco:</strong> {filme.elenco} <br/>
                  <strong>Classificação:</strong> {filme.classificacaoEtaria}
                </p>
                <p className="card-text">{filme.sinopse}</p>
                <p className="card-text"><small className="text-muted">
                  Exibição: {new Date(filme.dataInicioExibicao).toLocaleDateString()} até {new Date(filme.dataFimExibicao).toLocaleDateString()}
                </small></p>
                <Link to={`/filmes/editar/${filme.id}`} className="btn btn-warning btn-sm me-2">
                  <i className="bi bi-pencil"></i> Editar
                </Link>
                <button onClick={() => deletarFilme(filme.id)} className="btn btn-danger btn-sm">
                  <i className="bi bi-trash"></i> Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
        {filmes.length === 0 && <div className="col-12"><div className="alert alert-info">Nenhum filme cadastrado.</div></div>}
      </div>
    </div>
  );
};

export default FilmesLista;