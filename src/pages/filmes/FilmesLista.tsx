import { useEffect, useState } from 'react';
import { getFilmes, deleteFilme } from '../../services/api';
import type { Filme } from '../../types';
import { Link } from 'react-router-dom';

const FilmesLista = () => {
  const [filmes, setFilmes] = useState<Filme[]>([]);

  const carregarFilmes = async () => {
    const response = await getFilmes();
    setFilmes(response.data);
  };

  useEffect(() => { carregarFilmes(); }, []);

  const deletarFilme = async (id: string) => {
    if (confirm("Tem certeza?")) {
      await deleteFilme(id);
      carregarFilmes();
    }
  };

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
                <h6 className="card-subtitle mb-2 text-muted">{filme.genero} | {filme.duracao} min</h6>
                <p className="card-text small">
                  <strong>Elenco:</strong> {filme.elenco}
                </p>
                <p className="card-text">{filme.sinopse}</p>
                <p className="card-text"><small className="text-muted">
                  Exibição: {new Date(filme.dataInicioExibicao).toLocaleDateString()} até {new Date(filme.dataFinalExibicao).toLocaleDateString()}
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
      </div>
    </div>
  );
};

export default FilmesLista;