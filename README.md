# 🎬 CineWeb Frontend

Interface web do ecossistema CineWeb, construída com **React**, **Vite** e **Bootstrap 5**. Permite o gerenciamento completo do cinema: filmes, salas, sessões, lanches/combos, e emissão de comprovantes em PDF.

---

## Stack de Tecnologias

| Tecnologia | Versão | Propósito |
|---|---|---|
| **React** | 18.x | Biblioteca de UI |
| **Vite** | 5.x | Build tool e dev server |
| **TypeScript** | 5.x | Tipagem estática |
| **Bootstrap 5** | 5.3 | Estilização e componentes |
| **Bootstrap Icons** | 1.11 | Ícones |
| **Axios** | 1.7 | Requisições HTTP |
| **React Router** | 6.x | Roteamento SPA |
| **React Hook Form + Zod** | 7.x / 3.x | Validação de formulários |
| **jsPDF** | 2.5 | Geração de PDF (comprovantes) |
| **Docker** | - | Conteinerização |

---

## Arquitetura de Autenticação

O frontend implementa um fluxo de **Access Token em memória** + **Refresh Token em localStorage**:

- **Access Token**: Armazenado em variável JavaScript (nunca persiste em disco). Injetado automaticamente via interceptor Axios.
- **Refresh Token**: Armazenado em `localStorage`. Usado automaticamente quando o Access Token expira (interceptor captura 401).
- **Renovação automática**: Fila de requisições impede múltiplos refreshes simultâneos.
- **Force Logout**: Evento `cineweb:force-logout` é disparado quando o refresh falha, forçando logout em qualquer tela.

---

## Funcionalidades

- ✅ Login/Logout com JWT
- ✅ Proteção de rotas (PrivateRoute)
- ✅ Navbar dinâmica (nome do usuário + badge de perfil)
- ✅ CRUD de Filmes, Salas, Sessões, Lanches/Combos
- ✅ Emissão de comprovante de ingressos
- ✅ Download de comprovante em PDF (jsPDF)
- ✅ Impressão de comprovante (window.print)

---

## Pré-requisitos

- Node.js 20+
- npm
- Backend CineWeb rodando em `http://localhost:3000`

---

## Setup Local (sem Docker)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# VITE_API_URL=http://localhost:3000

# 3. Iniciar em modo desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

### Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:3000
```

---

## Setup Docker (Individual)

```bash
# Criar rede (se ainda não existir)
docker network create cineweb-network

# Subir frontend
docker compose up --build
```

---

## Setup Docker (Compose Unificado)

Na raiz do projeto CineWeb (`cineWeb/`):

```bash
docker compose up --build
```

---

## Rotas da Aplicação

| Rota | Componente | Protegida? |
|------|-----------|------------|
| `/` | Home | Não |
| `/login` | LoginPage | Não |
| `/filmes` | FilmesLista | Não |
| `/filmes/novo` | FilmesForm | Sim |
| `/filmes/editar/:id` | FilmesForm | Sim |
| `/salas` | SalasLista | Não |
| `/salas/novo` | SalasForm | Sim |
| `/salas/editar/:id` | SalasForm | Sim |
| `/sessoes` | SessoesManager | Não |
| `/lanches` | LancheCombosManager | Não |
| `/pedidos/:id/comprovante` | ComprovantePage | Sim |

---

## Estrutura do Projeto

```
src/
├── components/            # Componentes reutilizáveis
│   └── Navbar.tsx
├── contexts/              # Context API
│   └── AuthContext.tsx    # Estado global de autenticação
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── filmes/
│   ├── salas/
│   ├── sessoes/
│   ├── lanches/
│   └── pedidos/
│       └── ComprovantePage.tsx  # Comprovante + PDF
├── services/
│   └── api.ts             # Axios + interceptors de token
├── types/
│   └── index.ts           # Interfaces TypeScript
├── App.tsx                # Rotas + AuthProvider
└── main.tsx               # Entry point
```
