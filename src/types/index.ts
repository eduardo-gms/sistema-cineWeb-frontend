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

// ========================
// Autenticação
// ========================

export interface Usuario {
    id: string;
    nome: string;
    email: string;
    perfil: 'ADMIN' | 'CUSTOMER';
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: Usuario;
}

export interface TokenRefreshResponse {
    accessToken: string;
    refreshToken: string;
}

// ========================
// Comprovante
// ========================

export interface ComprovanteIngresso {
    id: string;
    filme: string;
    genero?: string;
    classificacao: string;
    duracao: string;
    sala: string;
    data: string;
    horario: string;
    poltrona: string;
    tipo: string;
    valor: number;
    valorFormatado: string;
    qrCodeData: string;
}

export interface ComprovanteLanche {
    nome: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
    subtotalFormatado: string;
}

export interface ComprovanteResumo {
    qtdInteira: number;
    qtdMeia: number;
    totalIngressos: number;
    totalLanches: number;
    valorTotal: number;
    valorTotalFormatado: string;
}

export interface Comprovante {
    pedidoId: string;
    dataCompra: string;
    cliente: { nome: string; email: string } | null;
    ingressos: ComprovanteIngresso[];
    lanches: ComprovanteLanche[];
    resumo: ComprovanteResumo;
}