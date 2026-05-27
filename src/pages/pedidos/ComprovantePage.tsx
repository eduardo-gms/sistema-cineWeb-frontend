import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComprovante } from '../../services/api';
import type { Comprovante } from '../../types';

export default function ComprovantePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comprovante, setComprovante] = useState<Comprovante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getComprovante(id)
      .then((res) => setComprovante(res.data.comprovante))
      .catch((err) => {
        setError(err.response?.data?.message || 'Erro ao carregar comprovante.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!comprovante) return;

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('CineWeb — Comprovante de Compra', pageWidth / 2, 20, { align: 'center' });

    // Linha decorativa
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 25, pageWidth - 14, 25);

    // Dados do Pedido
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    let y = 35;

    doc.setFont('helvetica', 'bold');
    doc.text('Pedido:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`#${comprovante.pedidoId}`, 50, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Data:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(comprovante.dataCompra).toLocaleString('pt-BR'), 50, y);
    y += 7;

    if (comprovante.cliente) {
      doc.setFont('helvetica', 'bold');
      doc.text('Cliente:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${comprovante.cliente.nome} (${comprovante.cliente.email})`, 50, y);
      y += 7;
    }

    // Ingressos
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ingressos', 14, y);
    y += 8;
    doc.setFontSize(10);

    comprovante.ingressos.forEach((ing, idx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. ${ing.filme}`, 14, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      const detalhes = [
        `Sala: ${ing.sala}  |  Data: ${new Date(ing.data).toLocaleDateString('pt-BR')}  |  Horário: ${ing.horario}`,
        `Poltrona: ${ing.poltrona}  |  Tipo: ${ing.tipo}  |  Valor: ${ing.valorFormatado}`,
        `Classificação: ${ing.classificacao}  |  Duração: ${ing.duracao}`,
      ];
      detalhes.forEach((line) => {
        doc.text(line, 20, y);
        y += 5;
      });
      y += 4;
    });

    // Lanches
    if (comprovante.lanches.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setDrawColor(200, 200, 200);
      doc.line(14, y, pageWidth - 14, y);
      y += 8;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Lanches & Combos', 14, y);
      y += 8;
      doc.setFontSize(10);

      comprovante.lanches.forEach((lanche) => {
        doc.setFont('helvetica', 'normal');
        doc.text(
          `• ${lanche.nome}  —  Qtd: ${lanche.quantidade}  |  ${lanche.subtotalFormatado}`,
          20,
          y,
        );
        y += 6;
      });
    }

    // Resumo
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo', 14, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ingressos Inteira: ${comprovante.resumo.qtdInteira}`, 20, y);
    y += 6;
    doc.text(`Ingressos Meia: ${comprovante.resumo.qtdMeia}`, 20, y);
    y += 6;
    doc.text(`Total Lanches: ${comprovante.resumo.totalLanches}`, 20, y);
    y += 8;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${comprovante.resumo.valorTotalFormatado}`, 20, y);

    // Rodapé
    y += 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(130, 130, 130);
    doc.text('CineWeb — Sistema de Gerenciamento de Cinema', pageWidth / 2, y, {
      align: 'center',
    });

    doc.save(`comprovante-cineweb-${comprovante.pedidoId}.pdf`);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-dark" role="status" />
        <p className="mt-2">Carregando comprovante...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
        <button className="btn btn-outline-danger btn-sm ms-3" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>
    );
  }

  if (!comprovante) return null;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        {/* Ações (não aparecem na impressão) */}
        <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-1"></i> Voltar
          </button>
          <div>
            <button className="btn btn-outline-dark me-2" onClick={handlePrint}>
              <i className="bi bi-printer me-1"></i> Imprimir
            </button>
            <button className="btn btn-dark" onClick={handleDownloadPDF}>
              <i className="bi bi-file-pdf me-1"></i> Baixar PDF
            </button>
          </div>
        </div>

        {/* Comprovante */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-dark text-white text-center py-3">
            <h4 className="mb-0">
              <i className="bi bi-receipt-cutoff me-2"></i>
              Comprovante de Compra
            </h4>
          </div>
          <div className="card-body p-4">
            {/* Dados do pedido */}
            <div className="row mb-3">
              <div className="col-sm-6">
                <small className="text-muted">Pedido</small>
                <p className="fw-bold mb-1" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  #{comprovante.pedidoId}
                </p>
              </div>
              <div className="col-sm-6 text-sm-end">
                <small className="text-muted">Data da Compra</small>
                <p className="fw-bold mb-1">
                  {new Date(comprovante.dataCompra).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {comprovante.cliente && (
              <div className="mb-3 p-2 bg-light rounded">
                <small className="text-muted">Cliente</small>
                <p className="mb-0 fw-bold">
                  {comprovante.cliente.nome} — {comprovante.cliente.email}
                </p>
              </div>
            )}

            <hr />

            {/* Ingressos */}
            <h5 className="mb-3">
              <i className="bi bi-ticket-perforated me-2"></i>
              Ingressos ({comprovante.resumo.totalIngressos})
            </h5>

            {comprovante.ingressos.map((ing, idx) => (
              <div key={ing.id} className="card mb-3 border">
                <div className="card-body py-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{ing.filme}</h6>
                      <span className="badge bg-secondary me-1">{ing.genero}</span>
                      <span className="badge bg-warning text-dark">{ing.classificacao}</span>
                    </div>
                    <span className="badge bg-dark fs-6">{ing.valorFormatado}</span>
                  </div>
                  <div className="row mt-2 text-muted small">
                    <div className="col">
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(ing.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="col">
                      <i className="bi bi-clock me-1"></i>
                      {ing.horario}
                    </div>
                    <div className="col">
                      <i className="bi bi-door-open me-1"></i>
                      {ing.sala}
                    </div>
                    <div className="col">
                      <i className="bi bi-geo-alt me-1"></i>
                      {ing.poltrona}
                    </div>
                    <div className="col">
                      <i className="bi bi-tag me-1"></i>
                      {ing.tipo}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Lanches */}
            {comprovante.lanches.length > 0 && (
              <>
                <hr />
                <h5 className="mb-3">
                  <i className="bi bi-cup-straw me-2"></i>
                  Lanches & Combos ({comprovante.resumo.totalLanches})
                </h5>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-center">Qtd</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprovante.lanches.map((lanche, idx) => (
                      <tr key={idx}>
                        <td>{lanche.nome}</td>
                        <td className="text-center">{lanche.quantidade}</td>
                        <td className="text-end">{lanche.subtotalFormatado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Resumo */}
            <hr />
            <div className="row">
              <div className="col-sm-6">
                <small className="text-muted d-block">Inteira: {comprovante.resumo.qtdInteira}</small>
                <small className="text-muted d-block">Meia: {comprovante.resumo.qtdMeia}</small>
              </div>
              <div className="col-sm-6 text-sm-end">
                <small className="text-muted">Total</small>
                <h3 className="fw-bold text-dark mb-0">{comprovante.resumo.valorTotalFormatado}</h3>
              </div>
            </div>
          </div>
          <div className="card-footer text-center text-muted small py-3">
            <i className="bi bi-film me-1"></i>
            CineWeb — Sistema de Gerenciamento de Cinema
          </div>
        </div>
      </div>
    </div>
  );
}
