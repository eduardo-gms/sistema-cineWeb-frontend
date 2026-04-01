import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    getFilmes,
    getSalas,
    getSessoes,
    getPedidos,
    getLanches,
    createSessao,
    updateSessao,
    deleteSessao,
    createPedido
} from '../../services/api';
import {
    type Filme,
    type Sala,
    type Sessao,
    type Pedido,
    type IngressoItem,
    type LancheCombo,
    type IngressoCarrinho,
    type LancheComboCarrinho
} from '../../types';

const sessaoSchema = z.object({
    filmeId: z.string().min(1, "Selecione um filme"),
    salaId: z.string().min(1, "Selecione uma sala"),
    data: z.string().min(1, "A data é obrigatória"),
    horario: z.string().min(1, "O horário é obrigatório"),
    valorIngresso: z.coerce.number().min(1, "O valor deve ser maior que zero")
});

type SessaoSchema = z.infer<typeof sessaoSchema>;

const SessoesManager = () => {
    // Dados Gerais
    const [filmes, setFilmes] = useState<Filme[]>([]);
    const [salas, setSalas] = useState<Sala[]>([]);
    const [sessoes, setSessoes] = useState<Sessao[]>([]);
    const [pedidosRealizados, setPedidosRealizados] = useState<Pedido[]>([]);

    const [lanchesDisponiveis, setLanchesDisponiveis] = useState<LancheCombo[]>([]);
    const [editingSessaoId, setEditingSessaoId] = useState<string | null>(null);

    // Carrinho / Pedido Atual
    const [sessaoSelecionada, setSessaoSelecionada] = useState<Sessao | null>(null);
    const [ingressosCarrinho, setIngressosCarrinho] = useState<IngressoCarrinho[]>([]);
    const [lanchesCarrinho, setLanchesCarrinho] = useState<LancheComboCarrinho[]>([]);

    const [selectedLancheId, setSelectedLancheId] = useState("");
    const [qtdeLanche, setQtdeLanche] = useState(1);

    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<SessaoSchema>({
        resolver: zodResolver(sessaoSchema)
    });

    const loadData = async () => {
        try {
            const [f, s, sess, ped, lanchesResp] = await Promise.all([
                getFilmes(),
                getSalas(),
                getSessoes(),
                getPedidos(),
                getLanches()
            ]);
            setFilmes(f.data);
            setSalas(s.data);
            setSessoes(sess.data);
            setPedidosRealizados(ped.data);
            setLanchesDisponiveis(lanchesResp.data);
        } catch (error) {
            console.error("Erro ao carregar dados", error);
        }
    };

    useEffect(() => { loadData(); }, []);

    const removerSessao = async (id: string) => {
        if (confirm("Deseja cancelar esta sessão?")) {
            await deleteSessao(id);
            loadData();
        }
    };

    const onSubmit = async (data: SessaoSchema) => {
        const filmeSelecionado = filmes.find(f => String(f.id) === String(data.filmeId));

        if (filmeSelecionado) {
            // Conversões corretas com o timezone garantindo a meia noite da data Fim
            const dataSessao = new Date(`${data.data}T00:00:00`);
            const inicioFilme = new Date(filmeSelecionado.dataInicioExibicao);
            inicioFilme.setHours(0,0,0,0);
            
            const fimFilme = new Date(filmeSelecionado.dataFimExibicao);
            fimFilme.setHours(23, 59, 59);

            if (dataSessao < inicioFilme || dataSessao > fimFilme) {
                setError("data", {
                    type: "manual",
                    message: `A sessão deve ocorrer entre ${new Date(inicioFilme).toLocaleDateString()} e ${new Date(fimFilme).toLocaleDateString()}`
                });
                return;
            }
        }

        const payload = {
            filmeId: data.filmeId,
            salaId: data.salaId,
            data: new Date(`${data.data}T00:00:00.000Z`).toISOString(), // ISO 8601 UTC
            horario: data.horario,
            valorIngresso: data.valorIngresso
        };

        if (editingSessaoId) {
            await updateSessao(editingSessaoId, payload);
            alert("Sessão atualizada!");
            setEditingSessaoId(null);
        } else {
            await createSessao(payload);
            alert("Sessão agendada!");
        }
        reset();
        loadData();
    };

    const handleEditSessao = (sessao: Sessao) => {
        setEditingSessaoId(sessao.id!);
        reset({
            filmeId: String(sessao.filmeId),
            salaId: String(sessao.salaId),
            data: sessao.data.split('T')[0],
            horario: sessao.horario,
            valorIngresso: sessao.valorIngresso
        });
    };

    const cancelEditSessao = () => {
        setEditingSessaoId(null);
        reset({ filmeId: "", salaId: "", data: "", horario: "", valorIngresso: 20 });
    };

    const getAssentosOcupados = (sessaoId: string) => {
        const ocupados: string[] = [];
        pedidosRealizados.forEach(p => {
            (p.ingressos || []).forEach((item: IngressoItem) => {
                if (item.sessaoId === sessaoId) {
                    ocupados.push(item.poltrona);
                }
            });
        });
        return ocupados;
    };

    const calcularCapacidadeRestante = (sessao: Sessao) => {
        if (!sessao.sala) return 0;
        const totalOcupado = getAssentosOcupados(sessao.id).length;
        return sessao.sala.capacidade - totalOcupado;
    };

    const toggleAssento = (fila: number, numero: number) => {
        if (!sessaoSelecionada) return;

        const jaNoCarrinho = ingressosCarrinho.find(i => i.fila === fila && i.numero === numero);

        if (jaNoCarrinho) {
            setIngressosCarrinho(prev => prev.filter(i => !(i.fila === fila && i.numero === numero)));
        } else {
            const novoIngresso: IngressoCarrinho = {
                sessaoId: sessaoSelecionada.id,
                tipo: 'Inteira',
                poltrona: `${fila}-${numero}`,
                fila,
                numero,
                valorUnitario: sessaoSelecionada.valorIngresso
            };
            setIngressosCarrinho(prev => [...prev, novoIngresso]);
        }
    };

    const handleTipoChange = (index: number, novoTipo: 'Inteira' | 'Meia') => {
        if (!sessaoSelecionada) return;
        const novoValor = novoTipo === 'Inteira' ? sessaoSelecionada.valorIngresso : sessaoSelecionada.valorIngresso / 2;
        setIngressosCarrinho(prev => prev.map((old, ix) => ix === index ? { ...old, tipo: novoTipo, valorUnitario: novoValor } : old));
    }

    const adicionarLancheSelecionado = () => {
        if (!selectedLancheId) {
            alert("Selecione um lanche da lista.");
            return;
        }
        if (qtdeLanche <= 0) {
            alert("A quantidade deve ser maior que 0.");
            return;
        }

        const lancheOriginal = lanchesDisponiveis.find(l => String(l.id) === String(selectedLancheId));

        if (!lancheOriginal) {
            alert("Lanche não encontrado.");
            return;
        }

        const jaNoCarrinho = lanchesCarrinho
            .filter(l => String(l.id) === String(lancheOriginal.id))
            .reduce((acc, curr) => acc + curr.quantidade, 0);

        if ((jaNoCarrinho + qtdeLanche) > lancheOriginal.estoque) {
            alert(`Estoque insuficiente! Disponível: ${lancheOriginal.estoque}. No carrinho: ${jaNoCarrinho}. Tentando adicionar: ${qtdeLanche}.`);
            return;
        }

        const itemExistenteIndex = lanchesCarrinho.findIndex(l => String(l.id) === String(lancheOriginal.id));

        if (itemExistenteIndex >= 0) {
            const novoCarrinho = [...lanchesCarrinho];
            novoCarrinho[itemExistenteIndex].quantidade += qtdeLanche;
            novoCarrinho[itemExistenteIndex].subTotal = novoCarrinho[itemExistenteIndex].quantidade * novoCarrinho[itemExistenteIndex].valorUnitario;
            setLanchesCarrinho(novoCarrinho);
        } else {
            const lancheParaCarrinho: LancheComboCarrinho = {
                ...lancheOriginal,
                quantidade: qtdeLanche,
                subTotal: lancheOriginal.valorUnitario * qtdeLanche
            };
            setLanchesCarrinho(prev => [...prev, lancheParaCarrinho]);
        }

        setSelectedLancheId("");
        setQtdeLanche(1);
    };

    const removerLancheDoCarrinho = (index: number) => {
        setLanchesCarrinho(prev => prev.filter((_, i) => i !== index));
    };

    const totalIngressosValor = ingressosCarrinho.reduce((acc, i) => acc + i.valorUnitario, 0);
    const totalLanchesValor = lanchesCarrinho.reduce((acc, l) => acc + l.subTotal, 0);
    const totalGeral = totalIngressosValor + totalLanchesValor;

    const finalizarVenda = async () => {
        if (ingressosCarrinho.length === 0 && lanchesCarrinho.length === 0) return;

        const qtInteira = ingressosCarrinho.filter(i => i.tipo === 'Inteira').length;
        const qtMeia = ingressosCarrinho.filter(i => i.tipo === 'Meia').length;

        const pedido: Omit<Pedido, 'id'> = {
            qtdInteira: qtInteira,
            qtdMeia: qtMeia,
            ingressos: ingressosCarrinho.map(i => ({
                sessaoId: i.sessaoId,
                poltrona: i.poltrona,
                tipo: i.tipo
            })),
            lanches: lanchesCarrinho.map(l => ({
                lancheComboId: l.id,
                quantidade: l.quantidade
            }))
        };

        try {
            await createPedido(pedido);

            alert("Venda realizada com sucesso!");
            setSessaoSelecionada(null);
            setIngressosCarrinho([]);
            setLanchesCarrinho([]);

            loadData();

        } catch (error: any) {
            console.error(error);
            alert("Erro ao processar a venda. Veja o console ou informe o administrador.");
        }
    };

    return (
        <div className="row">
            <div className="col-md-4 mb-4">
                <div className="card p-3 shadow-sm bg-light">
                    <h5>Agendar Sessão</h5>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-2">
                            <label>Filme</label>
                            <select {...register('filmeId')} className="form-select">
                                <option value="">Selecione...</option>
                                {filmes.map(f => <option key={f.id} value={f.id}>{f.titulo}</option>)}
                            </select>
                            <div className="text-danger small">{errors.filmeId?.message}</div>
                        </div>
                        <div className="mb-2">
                            <label>Sala</label>
                            <select {...register('salaId')} className="form-select">
                                <option value="">Selecione...</option>
                                {salas.map(s => <option key={s.id} value={s.id}>Sala {s.numero}</option>)}
                            </select>
                            <div className="text-danger small">{errors.salaId?.message}</div>
                        </div>
                        <div className="row">
                            <div className="col-6 mb-2">
                                <label>Data</label>
                                <input type="date" {...register('data')} className="form-control" />
                                <div className="text-danger small">{errors.data?.message}</div>
                            </div>
                            <div className="col-6 mb-2">
                                <label>Horário</label>
                                <input type="time" {...register('horario')} className="form-control" />
                                <div className="text-danger small">{errors.horario?.message}</div>
                            </div>
                        </div>
                        <div className="mb-2">
                            <label>Valor Ingresso Inteira (R$)</label>
                            <input type="number" step="0.01" {...register('valorIngresso')} className="form-control" placeholder="20.00" />
                            <div className="text-danger small">{errors.valorIngresso?.message}</div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <button type="submit" className="btn btn-primary w-100">
                                {editingSessaoId ? 'Atualizar' : 'Agendar'}
                            </button>
                            {editingSessaoId && (
                                <button type="button" className="btn btn-secondary w-100" onClick={cancelEditSessao}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <div className="col-md-8">
                <h4>Sessões</h4>
                <table className="table table-hover border">
                    <thead className="table-light">
                        <tr>
                            <th>Filme</th>
                            <th>Sala / Capacidade</th>
                            <th>Data/Hora e Preço</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessoes.map(s => (
                            <tr key={s.id}>
                                <td>{s.filme?.titulo}</td>
                                <td>
                                    Sala {s.sala?.numero} <br />
                                    <small className={calcularCapacidadeRestante(s) === 0 ? "text-danger" : "text-success"}>
                                        {calcularCapacidadeRestante(s)} lugares livres
                                    </small>
                                </td>
                                <td>
                                    {new Date(s.data).toLocaleDateString()} às {s.horario} <br/>
                                    <small>R$ {s.valorIngresso?.toFixed(2) || '0.00'}</small>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-success me-2" onClick={() => {
                                        setSessaoSelecionada(s);
                                        setIngressosCarrinho([]);
                                        setLanchesCarrinho([]);
                                    }} title="Vender Ingressos">
                                        <i className="bi bi-cart"></i>
                                    </button>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditSessao(s)} title="Editar Sessão">
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => removerSessao(s.id)} title="Remover Sessão">
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {sessaoSelecionada && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Novo Pedido: {sessaoSelecionada.filme?.titulo}</h5>
                                <button type="button" className="btn-close" onClick={() => setSessaoSelecionada(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-5 border-end">
                                        <h6 className="text-center">Selecione as Poltronas</h6>
                                        <div className="d-flex flex-wrap justify-content-center gap-2 mt-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {sessaoSelecionada.sala && Array.from({ length: sessaoSelecionada.sala.capacidade }).map((_, i) => {
                                                const fila = Math.floor(i / 10) + 1;
                                                const numero = (i % 10) + 1;
                                                const ocupado = getAssentosOcupados(sessaoSelecionada.id).includes(`${fila}-${numero}`);
                                                const selecionado = ingressosCarrinho.some(item => item.fila === fila && item.numero === numero);

                                                return (
                                                    <button
                                                        key={i}
                                                        disabled={ocupado}
                                                        onClick={() => toggleAssento(fila, numero)}
                                                        className={`btn btn-sm ${ocupado ? 'btn-secondary' : selecionado ? 'btn-success' : 'btn-outline-primary'}`}
                                                        style={{ width: '40px' }}
                                                        title={`Fila ${fila} - Assento ${numero}`}
                                                    >
                                                        {ocupado ? 'X' : numero}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <div className="mt-3 small text-center text-muted">
                                            (Frente da Tela)
                                        </div>
                                    </div>

                                    <div className="col-md-7">
                                        <h6 className="border-bottom pb-2">Ingressos Selecionados</h6>
                                        <ul className="list-group mb-3 small" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            {ingressosCarrinho.map((item, idx) => (
                                                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <span>Fila {item.fila} - Assento {item.numero}</span>
                                                    <div>
                                                        <select
                                                            className="form-select form-select-sm d-inline-block w-auto me-2"
                                                            value={item.tipo}
                                                            onChange={(e) => handleTipoChange(idx, e.target.value as 'Inteira' | 'Meia')}
                                                        >
                                                            <option value="Inteira">Inteira (R$ {sessaoSelecionada.valorIngresso.toFixed(2)})</option>
                                                            <option value="Meia">Meia (R$ {(sessaoSelecionada.valorIngresso / 2).toFixed(2)})</option>
                                                        </select>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => toggleAssento(item.fila, item.numero)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                            {ingressosCarrinho.length === 0 && <li className="list-group-item text-muted">Nenhuma poltrona selecionada</li>}
                                        </ul>

                                        <h6 className="border-bottom pb-2 mt-4">Adicionar Lanches / Combos</h6>
                                        <div className="input-group mb-3">
                                            <select
                                                className="form-select"
                                                value={selectedLancheId}
                                                onChange={e => setSelectedLancheId(e.target.value)}
                                            >
                                                <option value="">Selecione um item...</option>
                                                {lanchesDisponiveis.map(l => (
                                                    <option key={l.id} value={l.id} disabled={l.estoque <= 0}>
                                                        {l.nome} - R$ {l.valorUnitario.toFixed(2)} {l.estoque <= 0 ? '(Esgotado)' : `(Disp: ${l.estoque})`}
                                                    </option>
                                                ))}
                                            </select>

                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Qtd"
                                                style={{ maxWidth: '80px' }}
                                                value={qtdeLanche}
                                                min={1}
                                                onChange={e => setQtdeLanche(Number(e.target.value))}
                                            />

                                            <button className="btn btn-warning" onClick={adicionarLancheSelecionado}>
                                                <i className="bi bi-plus-lg"></i>
                                            </button>
                                        </div>

                                        <ul className="list-group mb-3 small">
                                            {lanchesCarrinho.map((lanche, idx) => (
                                                <li key={idx} className="list-group-item d-flex justify-content-between">
                                                    <span>{lanche.quantidade}x {lanche.nome}</span>
                                                    <span>
                                                        R$ {lanche.subTotal.toFixed(2)}
                                                        <button className="btn btn-sm text-danger ms-2" onClick={() => removerLancheDoCarrinho(idx)}><i className="bi bi-x-circle"></i></button>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="alert alert-success d-flex justify-content-between align-items-center mt-3">
                                            <h4 className="mb-0">Total: R$ {totalGeral.toFixed(2)}</h4>
                                            <button className="btn btn-dark btn-lg" onClick={finalizarVenda}>Finalizar Venda</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessoesManager;