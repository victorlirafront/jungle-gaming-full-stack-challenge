<img 
  style="border: 2px solid white;" 
  src="https://ik.imagekit.io/Victorliradev/randoom/header_RU18n3BAo.png?updatedAt=1760889700708" 
/>

# Task Management System - Jungle Gaming Challenge

Sistema de gestão de tarefas colaborativo com microserviços, notificações em tempo real e arquitetura event-driven.

## 📌 Início Rápido

```bash
# 1. Instalar dependências
yarn install

# 2. Subir todos os serviços
docker-compose up -d

# 3. Acessar
Frontend: http://localhost:3000
API Docs: http://localhost:3001/api/docs
```

## 📌 1. Arquitetura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────┐
│                Frontend (React)                      │
│              http://localhost:3000                   │
│  • TanStack Router + Query                           │
│  • Zustand (State)                                   │
│  • WebSocket Client                                  │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/WebSocket
┌─────────────────────▼───────────────────────────────┐
│              API Gateway (NestJS)                    │
│            http://localhost:3001                     │
│  • HTTP REST Endpoints                               │
│  • WebSocket Gateway                                 │
│  • JWT Guards                                        │
│  • Swagger/OpenAPI                                   │
└────┬──────────────┬──────────────┬──────────────────┘
     │              │              │
     │ RabbitMQ     │ RabbitMQ     │ RabbitMQ
     │ (Events)     │ (Events)     │ (Events)
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

### Estrutura do Monorepo

```
apps/
├── web/                      # Frontend React + Vite
├── api-gateway/              # Gateway HTTP + WebSocket
├── auth-service/             # Microserviço de autenticação
├── tasks-service/            # Microserviço de tarefas
└── notifications-service/    # Microserviço de notificações

packages/
├── types/                    # Types compartilhados
├── utils/                    # Utilidades compartilhadas
├── eslint-config/            # Configuração ESLint
└── tsconfig/                 # Configuração TypeScript
```

## 📌 2. Decisões Técnicas e Trade-offs

### Backend

**Microserviços com RabbitMQ**
- Desacoplamento, escalabilidade e resiliência
- Comunicação assíncrona event-driven
- Escolhido pela demonstração de arquitetura distribuída

**TypeORM com Migrations**
- Controle de versão do banco, seguro para produção
- `synchronize: true` em dev, migrations em prod
- Rollback disponível para reversão

**JWT com Refresh Tokens**
- Stateless, revogação de tokens, segurança
- Access token 15min, Refresh token 7 dias
- Refresh automático transparente no frontend

**Paginação Server-Side**
- Performance otimizada com grandes volumes
- Implementada em comentários e histórico

## 📌 Frontend

**Service Layer Pattern**
- Encapsula comunicação com API (`src/services/`)
- Separação de concerns e reutilização

**Data Mapper Pattern**
- Transforma DTOs da API para modelos frontend (`src/mappers/`)
- Desacoplamento entre backend e frontend

**Custom Hooks Pattern**
- Gerencia estado e side effects com React Query (`src/hooks/`)
- Cache automático e sincronização

**HTTP Client Pattern**
- Cliente centralizado com interceptors (`src/http/`)
- Autenticação automática e refresh token transparente

**Zustand para State Management**
- Simples, menos boilerplate, performático
- Escolhido pela simplicidade e performance

**TanStack Query (React Query)**
- Cache inteligente, sincronização, optimistic updates
- Essential para real-time e UX moderna

## 📌 3. Problemas Conhecidos e Melhorias

## 📌 4. Tempo Gasto

### Dia 1-2: Fundação
- Setup do monorepo com Turborepo
- Configuração Docker e Docker Compose
- Estrutura base dos microserviços

### Dia 3-4: Backend Core
- Auth Service completo com JWT
- Tasks Service com CRUD
- Migrations e TypeORM

### Dia 5-6: Event-Driven & Real-time
- RabbitMQ e comunicação entre serviços
- Notifications Service
- WebSocket Gateway
- API Gateway

### Dia 7-8: Frontend
- Setup React + TanStack Router
- Componentes UI com shadcn
- Integração com backend
- State management (Zustand + React Query)

### Dia 9: Features Avançadas
- Sistema de notificações real-time
- Paginação server-side
- Toast notifications
- Skeleton loaders

### Dia 10: Polimento
- Refatoração e otimizações
- Documentação (README)
- Testes finais
- Ajustes de UX

## 📌 5. Instruções Específicas

### Acessar Serviços

```bash
# Banco de dados
docker exec -it db psql -U postgres -d challenge_db

# RabbitMQ Management
http://localhost:15672
Usuário: admin
Senha: admin

# Swagger API Docs
http://localhost:3001/api/docs
```

### Comandos Úteis

```bash
# Build todos os projetos
yarn build

# Linting
yarn lint

# Ver logs
yarn docker:logs

# Rodar migrations (produção)
yarn migration:run
```

## 📌 Stack Completa

**Frontend:**
- React 18 + TypeScript
- TanStack Router + TanStack Query
- Zustand (State Management)
- Tailwind CSS + shadcn/ui
- Vite + Vitest

**Backend:**
- NestJS + TypeScript
- TypeORM + PostgreSQL
- RabbitMQ (amqplib)
- JWT (Passport + @nestjs/jwt)
- Socket.IO (WebSocket)
- Swagger/OpenAPI

**DevOps:**
- Docker + Docker Compose
- Turborepo
- Multi-stage Dockerfiles

## 📌 Funcionalidades Implementadas

- ✅ Autenticação JWT com refresh tokens
- ✅ CRUD completo de tarefas
- ✅ Atribuição de múltiplos usuários
- ✅ Sistema de comentários com paginação
- ✅ Histórico de alterações (audit log)
- ✅ Notificações em tempo real (WebSocket)
- ✅ Event-driven com RabbitMQ
- ✅ Paginação server-side
- ✅ Toast notifications
- ✅ Skeleton loaders com shimmer
- ✅ Filtros e busca
- ✅ Validação com Zod + class-validator
- ✅ Migrations para produção
- ✅ Docker entrypoints automáticos

## Licença

MIT
