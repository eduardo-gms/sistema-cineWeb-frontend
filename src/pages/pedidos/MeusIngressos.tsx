import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMeusPedidos } from '../../services/api';
import type { Pedido } from '../../types';

export default function MeusIngressos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const res = await getMeusPedidos();
      setPedidos(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar seus ingressos.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-dark" role="status" />
        <p className="mt-2">Carregando seus ingressos...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-ticket-perforated me-2"></i>Meus Ingressos
      </h2>

      {pedidos.length === 0 ? (
        <div className="alert alert-info text-center">
          Você ainda não comprou ingressos. <br />
          <Link to="/sessoes" className="btn btn-outline-dark mt-3">Ver Sessões Disponíveis</Link>
        </div>
      ) : (
        <div className="row">
          {pedidos.map(pedido => {
            const ingressosCount = pedido.ingressos?.length || 0;
            const lanchesCount = pedido.lanches?.reduce((acc, curr) => acc + curr.quantidade, 0) || 0;

            return (
              <div key={pedido.id} className="col-md-6 mb-4">
                <div className="card shadow-sm h-100 border-0">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title mb-0">
                        Pedido #{String(pedido.id).substring(0, 8)}
                      </h5>
                      <span className="badge bg-dark">
                        {new Date(pedido.criadoEm || '').toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-muted mb-2">
                      <i className="bi bi-person me-1"></i> Usuário: {pedido.usuario?.nome}
                    </p>

                    <div className="mb-3">
                      <span className="badge bg-secondary me-2">
                        {ingressosCount} Ingresso(s)
                      </span>
                      <span className="badge bg-secondary">
                        {lanchesCount} Lanche(s)
                      </span>
                    </div>

                    <p className="fw-bold mb-0">
                      Total Pago: R$ {pedido.valorTotal?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="card-footer bg-white border-0 text-end">
                    <Link
                      to={`/pedidos/${pedido.id}/comprovante`}
                      className="btn btn-dark"
                    >
                      <i className="bi bi-receipt me-2"></i> Ver Comprovante
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
