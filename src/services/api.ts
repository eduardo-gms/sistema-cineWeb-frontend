import axios from 'axios';
import type { Filme, Sala, LancheCombo, Sessao, Pedido, Genero, AuthResponse, TokenRefreshResponse, Comprovante } from '../types';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (
        window.location.hostname.includes('github.dev') 
        ? `https://${window.location.hostname.replace('5173', '3000')}`
        : 'http://localhost:3000'
    ),
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }
});

// ========================
// Gerenciamento de Tokens em Memória
// ========================
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

// ========================
// Interceptor de Request — Injeta Access Token
// ========================
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ========================
// Interceptor de Response — Renovação Automática de Token
// ========================
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Se 401 e não é uma tentativa de refresh/login (evita loop infinito)
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/refresh')
        ) {
            if (isRefreshing) {
                // Enfileira requisições enquanto o refresh está em andamento
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('cineweb_refresh_token');
            if (!refreshToken) {
                isRefreshing = false;
                // Dispara evento de logout para o AuthContext capturar
                window.dispatchEvent(new Event('cineweb:force-logout'));
                return Promise.reject(error);
            }

            try {
                const response = await axios.post<TokenRefreshResponse>(
                    `${api.defaults.baseURL}/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
                setAccessToken(newAccessToken);
                localStorage.setItem('cineweb_refresh_token', newRefreshToken);

                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                setAccessToken(null);
                localStorage.removeItem('cineweb_refresh_token');
                window.dispatchEvent(new Event('cineweb:force-logout'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ========================
// API de Autenticação
// ========================
export const loginUser = (email: string, senha: string) =>
    api.post<AuthResponse>('/auth/login', { email, senha });

export const registerUser = (nome: string, email: string, senha: string) =>
    api.post<AuthResponse>('/auth/register', { nome, email, senha });

export const logoutUser = () => api.post('/auth/logout');

export const getMe = () => api.get('/auth/me');

// ========================
// API de Comprovante
// ========================
export const getComprovante = (pedidoId: string) =>
    api.get<{ comprovante: Comprovante }>(`/pedidos/${pedidoId}/comprovante`);

export const getMeusPedidos = () => api.get<Pedido[]>('/pedidos/meus');

// ========================
// Gêneros
// ========================
export const getGeneros = () => api.get<Genero[]>('/generos');

// Filmes
export const getFilmes = () => api.get<Filme[]>('/filmes');
export const getFilmeById = (id: string | number) => api.get<Filme>(`/filmes/${id}`);
export const createFilme = (data: Omit<Filme, 'id' | 'genero'>) => api.post('/filmes', data);
export const updateFilme = (id: string | number, data: Omit<Filme, 'id' | 'genero'>) => api.put(`/filmes/${id}`, data);
export const deleteFilme = (id: string | number) => api.delete(`/filmes/${id}`);

// Salas
export const getSalas = () => api.get<Sala[]>('/salas');
export const getSalaById = (id: string | number) => api.get<Sala>(`/salas/${id}`);
export const createSala = (data: Omit<Sala, 'id'>) => api.post('/salas', data);
export const updateSala = (id: string | number, data: Omit<Sala, 'id'>) => api.put(`/salas/${id}`, data);
export const deleteSala = (id: string | number) => api.delete(`/salas/${id}`);

// Lanches & Combos
export const getLanches = () => api.get<LancheCombo[]>('/lanche-combos');
export const getLancheById = (id: string | number) => api.get<LancheCombo>(`/lanche-combos/${id}`);
export const createLanche = (data: Omit<LancheCombo, 'id'>) => api.post('/lanche-combos', data);
export const updateLanche = (id: string | number, data: Omit<LancheCombo, 'id'>) => api.put(`/lanche-combos/${id}`, data);
export const updateLancheEstoque = (id: string | number, estoque: number) => api.patch(`/lanche-combos/${id}`, { estoque });
export const deleteLanche = (id: string | number) => api.delete(`/lanche-combos/${id}`);

// Sessões
export const getSessoes = () => api.get<Sessao[]>('/sessoes');
export const getSessaoById = (id: string | number) => api.get<Sessao>(`/sessoes/${id}`);
export const createSessao = (data: Omit<Sessao, 'id' | 'filme' | 'sala'>) => api.post('/sessoes', data);
export const updateSessao = (id: string | number, data: Omit<Sessao, 'id' | 'filme' | 'sala'>) => api.put(`/sessoes/${id}`, data);
export const deleteSessao = (id: string | number) => api.delete(`/sessoes/${id}`);

// Pedidos
export const getPedidos = () => api.get<Pedido[]>('/pedidos');
export const createPedido = (data: Omit<Pedido, 'id'>) => api.post('/pedidos', data);

export default api;
