<img 
  style="border: 2px solid white;" 
  src="https://ik.imagekit.io/Victorliradev/randoom/header_RU18n3BAo.png?updatedAt=1760889700708" 
/>

# Task Management System - Jungle Gaming Challenge

Sistema de gestão de tarefas colaborativo com microserviços, notificações em tempo real e arquitetura event-driven.

## ✅ Status do Projeto

**Última atualização:** 25/10/2025  


## 📌 Início Rápido

**Pré-requisitos:** 
- Node version: 22.17.1
- Docker
- Yarn

```bash
# 1. Clonar o repositório
git clone https://github.com/victorlirafront/jungle-gaming-full-stack-challenge.git
cd jungle-gaming-full-stack-challenge

# ( Certifique se de que o Docker Desktop esta rodando )
# 2. Setup automático (instala dependências + build packages + sobe serviços) 

yarn start

# 3. Acessar a aplicação
# Frontend: http://localhost:3000
# API Gateway: http://localhost:3001
# Swagger Docs: http://localhost:3001/api/docs
# RabbitMQ Admin: http://localhost:15672 (admin/admin)
```

### Verificar se todos os serviços estão rodando:
```bash
docker-compose ps
```

### Health Checks:
- **API Gateway:** http://localhost:3001/health
- **Auth Service:** http://localhost:3002/health
- **Tasks Service:** http://localhost:3003/health
- **Notifications Service:** http://localhost:3004/health


## 🎯 Destaques Técnicos

- **Arquitetura Microserviços:** Event-driven com RabbitMQ, escalável e resiliente
- **Real-time:** WebSocket autenticado com notificações instantâneas
- **Patterns Avançados:** Service Layer, Data Mapper, Custom Hooks, HTTP Client
- **Type-Safety:** TypeScript end-to-end com types compartilhados no monorepo
- **Developer Experience:** Hot reload, Swagger docs, health checks, migrations automáticas
- **Qualidade:** CI/CD, testes unitários, validação em todas camadas
- **Segurança:** JWT + Refresh Tokens, rate limiting, hash bcrypt, guards NestJS

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

## 📌 2. Decisões Técnicas

### Backend

**Microserviços com RabbitMQ**
- Desacoplamento total entre serviços permite deploy e escalabilidade independente
- Event-driven architecture facilita adicionar novos consumidores sem modificar produtores
- Escolhido para demonstrar capacidade de lidar com sistemas complexos desde o início

**TypeORM com Migrations**
- Migrations versionadas garantem consistência entre ambientes (dev/staging/prod)
- Rollback automático em caso de falhas
- Scripts de entrypoint executam migrations automaticamente no container

**JWT com Refresh Tokens**
- Refresh token com rotação previne ataques de replay
- Refresh automático transparente mantém sessão ativa sem interrupções
- Blacklist de tokens revogados implementada no auth-service

**Paginação Server-Side**
- Offset/limit com contagem total para performance em grandes datasets
- Implementada em tarefas, comentários e histórico
- Evita carregar dados desnecessários no cliente

### Frontend

**Service Layer Pattern**
- Encapsula toda comunicação com API em `src/services/`
- Facilita testes mockando apenas o service layer
- Mudanças na API requerem alterações apenas nos services

**Data Mapper Pattern**
- DTOs da API transformados em modelos tipados do frontend em `src/mappers/`
- Backend pode mudar estrutura sem impactar componentes React
- Adaptação de nomenclatura (backend usa snake_case em alguns lugares)

**Custom Hooks Pattern**
- Hooks especializados em `src/hooks/` encapsulam lógica de negócio
- React Query integrado para cache e sincronização automática
- Invalidação inteligente de cache após mutações

**HTTP Client Pattern**
- Axios centralizado com interceptors em `src/http/`
- Refresh token automático e transparente em requests 401
- Headers de autenticação injetados automaticamente

**Zustand para State Management**
- Performance superior com selective subscriptions
- Escolhido pela simplicidade sem sacrificar funcionalidade

**TanStack Query (React Query)**
- Cache inteligente reduz requests desnecessários
- Sincronização background mantém dados atualizados
- Optimistic updates para feedback instantâneo
- Essencial para aplicação real-time moderna

## 📌 3. Problemas Conhecidos e Melhorias

**Segurança:**
- Tokens em localStorage (migrar para cookies HTTP-Only com `Secure` e `SameSite=Strict`)
- Implementar CSRF tokens para proteção adicional
- Rate limiting apenas em auth (expandir para outros endpoints críticos)


**Testes:**
- E2E tests com Playwright para fluxos críticos
- Testes de integração para comunicação RabbitMQ
- Testes de carga para identificar gargalos

**Env:**
- Mover dados sensíveis para um arquivo .env

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

### Dia 10: Extras + Refatoração
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

## 📌 Diferenciais Implementados

**Continuous Integration com Github Actions**
- Pipeline automatizado: lint → build → test → type-check
- Garante qualidade do código antes de merge
- Feedback rápido em PRs

**Página de Perfil do Usuário**
- Visualização e edição de dados pessoais
- Validação de dados com react-hook-form + zod

**Reset de Senha**
- Token temporário com expiração
- Validação de senha forte

**Testes Unitários Completos**
- Cobertura em Auth, Tasks e Notifications services
- Guards, Services e Controllers testados
- Garante confiabilidade em refatorações

**Health Checks**
- Endpoints `/health` em todos os serviços
- Validação de conexão com DB e RabbitMQ
- Facilita monitoramento e debugging

**Rate Limiting**
- Proteção contra brute force em endpoints de auth

**WebSocket com Autenticação JWT**
- Conexão WS autenticada e segura
- Namespaces isolados por usuário
- Notificações apenas para usuários autorizados

## Licença

MIT
