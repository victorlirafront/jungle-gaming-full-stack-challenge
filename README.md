<img 
  style="border: 2px solid white;" 
  src="https://media.licdn.com/dms/image/v2/D4D3DAQG5Ki_OPFVs7w/image-scale_191_1128/B4DZjnZJl5GgAg-/0/1756228787622/junglegaming_cover?e=1761447600&v=beta&t=MWv4E6s9aYFxjBuC6X-o2JnuUxcqBz226mMrjHkjZA8" 
/>

# Task Management System - Jungle Gaming Challenge

## Início Rápido

### Pré-requisitos

- Node.js >= 18.0.0
- Docker e Docker Compose
- Yarn

### Instalação e Execução

```bash
# 1. Clonar o repositório
git clone <repository-url>
cd jungle-gaming-full-stack-challenge

# 2. Instalar dependências
yarn install

# 3. Subir containers (Banco de dados + RabbitMQ + Serviços)
docker-compose up -d

# 4. Acessar a aplicação
# Frontend: http://localhost:3000
# API Gateway: http://localhost:3001
# Swagger Docs: http://localhost:3001/api
# RabbitMQ Admin: http://localhost:15672 (admin/admin)
```

### Parar a Aplicação

```bash
docker-compose down
```

### Logs

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api-gateway
```

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│            http://localhost:3000                     │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/WebSocket
┌─────────────────────▼───────────────────────────────┐
│              API Gateway (NestJS)                    │
│            http://localhost:3001                     │
│  • HTTP Endpoints                                    │
│  • WebSocket Gateway                                 │
│  • JWT Guards                                        │
└────┬──────────────┬──────────────┬──────────────────┘
     │              │              │
     │ RabbitMQ     │ RabbitMQ     │ RabbitMQ
     │              │              │
┌────▼────┐   ┌────▼────┐   ┌────▼─────────┐
│  Auth   │   │  Tasks  │   │Notifications │
│ Service │   │ Service │   │   Service    │
│  :3002  │   │  :3003  │   │    :3004     │
└────┬────┘   └────┬────┘   └──────┬───────┘
     │              │                │
     └──────────────┴────────────────┘
                    │
            ┌───────▼────────┐
            │   PostgreSQL   │
            │     :5432      │
            └────────────────┘
```

## Funcionalidades

### Autenticação
- Registro de usuários
- Login com email/username
- JWT com access token (15 min) e refresh token (7 dias)
- Proteção de rotas

### Tarefas
- CRUD completo de tarefas
- Atribuição de múltiplos usuários
- Campos: título, descrição, prioridade, status, prazo
- Filtros por status e prioridade
- Busca por texto
- Paginação (9 tarefas por página)
- Edição apenas pelo criador

### Comentários
- Adicionar comentários em tarefas
- Listagem com paginação (5 por página)
- Exibição de autor e data

### Histórico
- Audit log de todas as alterações
- Rastreamento de ações (CREATED, UPDATED, DELETED, COMMENTED)
- Paginação (10 por página)

### Notificações em Tempo Real
- WebSocket para atualizações instantâneas
- Notificações quando:
  - Usuário é atribuído a uma tarefa
  - Tarefa atribuída é atualizada
  - Status de tarefa atribuída muda
  - Novo comentário em tarefa que participa
- Sistema de notificações com contador não lido
- Sincronização automática da UI

### UI/UX
- Toast notifications para feedback de ações
- Skeleton loaders com shimmer effect
- Design responsivo
- Tema moderno com Tailwind CSS

## Desenvolvimento

### Acessar Banco de Dados

```bash
docker exec -it db psql -U postgres -d challenge_db
```

### Acessar RabbitMQ Management

```
URL: http://localhost:15672
Usuário: admin
Senha: admin
```

## Decisões Técnicas

### Backend

#### Microserviços
Separação em serviços independentes para escalabilidade e manutenibilidade:
- **Auth Service**: Isolamento de lógica de autenticação e segurança
- **Tasks Service**: Domínio de tarefas, comentários e histórico
- **Notifications Service**: Gerenciamento de notificações e eventos

#### Event-Driven Architecture
RabbitMQ para comunicação assíncrona entre serviços, permitindo:
- Desacoplamento entre serviços
- Processamento assíncrono
- Escalabilidade horizontal
- Resiliência (retry automático)

#### Real-time com WebSocket
Socket.IO para notificações instantâneas sem polling, melhorando UX e reduzindo carga no servidor.

#### Paginação Server-Side
Implementada em comentários e histórico para performance com grandes volumes de dados.

### Frontend

#### Service Layer Pattern
Encapsula lógica de comunicação com API (`src/services/`)
- `AuthService`, `TasksService`, `WebSocketService`

#### Data Mapper Pattern
Transforma dados da API para formato do frontend (`src/mappers/`)
- Separação entre DTOs da API e modelos do frontend

#### Custom Hooks Pattern
Gerencia estado e side effects com React Query (`src/hooks/`)
- `useTasks`, `useUsers`, `useNotificationSync`

#### HTTP Client Pattern
Cliente HTTP reutilizável com interceptors e tratamento de erros (`src/http/`)
- Autenticação automática via interceptors
- Refresh token automático

### Monorepo com Turborepo
Compartilhamento de código (types, utils) e builds otimizados em cache.


## Licença

MIT
