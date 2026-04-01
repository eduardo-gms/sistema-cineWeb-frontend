export interface Genero {
    id: string;
    nome: string;
}

export interface Filme {
    id: string;
    titulo: string;
    duracao: number;
    sinopse: string;
    elenco: string;
    generoId: string;
    classificacaoEtaria: string;
    dataInicioExibicao: string;
    dataFimExibicao: string;
    status: string;
    genero?: Genero;
}

export interface Sala {
    id: string;
    numero: number;
    capacidade: number;
}

export interface Sessao {
    id: string;
    filmeId: string;
    salaId: string;
    data: string;
    horario: string;
    valorIngresso: number;
    filme?: Filme;
    sala?: Sala;
}

export interface LancheCombo {
    id: string;
    nome: string;
    descricao: string;
    valorUnitario: number;
    estoque: number;
}

export interface IngressoItem {
    sessaoId: string;
    tipo: 'Inteira' | 'Meia';
    poltrona: string;
}

export interface LancheItem {
    lancheComboId: string;
    quantidade: number;
}

export interface Pedido {
    id?: string;
    valorTotal?: number;
    qtdInteira?: number;
    qtdMeia?: number;
    dataHora?: string;
    ingressos?: IngressoItem[];
    lanches?: LancheItem[];
}

// Interfaces auxiliares para manipulação de Front-end (ex: Carrinho)
export interface LancheComboCarrinho extends LancheCombo {
    quantidade: number;
    subTotal: number;
}

export interface IngressoCarrinho extends IngressoItem {
    valorUnitario: number;
    fila: number;
    numero: number;
}