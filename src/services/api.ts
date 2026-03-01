import axios from 'axios';
import type { Filme, Sala, LancheCombo, Sessao, Pedido } from '../types';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Filmes
export const getFilmes = () => api.get<Filme[]>('/filmes');
export const getFilmeById = (id: string | number) => api.get<Filme>(`/filmes/${id}`);
export const createFilme = (data: Omit<Filme, 'id'>) => api.post('/filmes', data);
export const updateFilme = (id: string | number, data: Omit<Filme, 'id'>) => api.put(`/filmes/${id}`, data);
export const deleteFilme = (id: string | number) => api.delete(`/filmes/${id}`);

// Salas
export const getSalas = () => api.get<Sala[]>('/salas');
export const getSalaById = (id: string | number) => api.get<Sala>(`/salas/${id}`);
export const createSala = (data: Omit<Sala, 'id'>) => api.post('/salas', data);
export const updateSala = (id: string | number, data: Omit<Sala, 'id'>) => api.put(`/salas/${id}`, data);
export const deleteSala = (id: string | number) => api.delete(`/salas/${id}`);

// Lanches & Combos
export const getLanches = () => api.get<LancheCombo[]>('/lancheCombos');
export const getLancheById = (id: string | number) => api.get<LancheCombo>(`/lancheCombos/${id}`);
export const createLanche = (data: Omit<LancheCombo, 'id'>) => api.post('/lancheCombos', data);
export const updateLanche = (id: string | number, data: Omit<LancheCombo, 'id'>) => api.put(`/lancheCombos/${id}`, data);
export const updateLancheEstoque = (id: string | number, estoque: number) => api.patch(`/lancheCombos/${id}`, { estoque });
export const deleteLanche = (id: string | number) => api.delete(`/lancheCombos/${id}`);

// Sessões
export const getSessoes = () => api.get<Sessao[]>('/sessoes?_expand=filme&_expand=sala');
export const getSessaoById = (id: string | number) => api.get<Sessao>(`/sessoes/${id}?_expand=filme&_expand=sala`);
export const createSessao = (data: Omit<Sessao, 'id'>) => api.post('/sessoes', data);
export const updateSessao = (id: string | number, data: Omit<Sessao, 'id'>) => api.put(`/sessoes/${id}`, data);
export const deleteSessao = (id: string | number) => api.delete(`/sessoes/${id}`);

// Pedidos
export const getPedidos = () => api.get<Pedido[]>('/pedidos');
export const createPedido = (data: Omit<Pedido, 'id'>) => api.post('/pedidos', data);

export default api;