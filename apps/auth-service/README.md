# Auth Service

Microserviço de autenticação responsável por gerenciar o cadastro, login e refresh de tokens JWT.

## 🎯 Responsabilidades

- Registro de novos usuários com validação
- Autenticação via email/username e senha
- Geração e validação de tokens JWT (access e refresh)
- Gerenciamento de refresh tokens com revogação
- Hash de senhas com bcrypt
- Validação de usuários para outros serviços

## 🔐 Segurança

### Tokens JWT

- **Access Token**: 15 minutos de validade
- **Refresh Token**: 7 dias de validade
- Refresh tokens são armazenados no banco de dados
- Suporte a revogação de tokens
- Limpeza automática de tokens expirados

### Hash de Senhas

- Utiliza bcrypt com salt rounds padrão (10)
- Senhas nunca são armazenadas em texto plano
- Validação de força de senha no registro

## 📡 Comunicação

Este serviço se comunica via **RabbitMQ** através dos seguintes comandos:

### Comandos Disponíveis

#### `register`
Registra um novo usuário no sistema.

**Payload:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "Password123"
}
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### `login`
Autentica um usuário existente.

**Payload:**
```json
{
  "emailOrUsername": "user@example.com",
  "password": "Password123"
}
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### `refresh`
Renova o access token usando um refresh token válido.

**Payload:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### `validate-user`
Valida se um usuário existe e está ativo.

**Payload:**
```json
"user-uuid"
```

**Resposta:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "isActive": true
}
```

#### `revoke-token`
Revoga um refresh token específico.

**Payload:**
```json
"refresh-token-string"
```

**Resposta:**
```json
{
  "success": true
}
```

## 🗄️ Banco de Dados

### Entidades

#### User
- `id`: UUID (PK)
- `email`: String único (100 chars)
- `username`: String único (50 chars)
- `password`: String hash (255 chars)
- `isActive`: Boolean
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

#### RefreshToken
- `id`: UUID (PK)
- `token`: String (500 chars)
- `userId`: UUID (FK)
- `expiresAt`: Timestamp
- `revoked`: Boolean
- `createdAt`: Timestamp

### Migrations

Execute as migrations com:

```bash
npm run migration:run
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Application
NODE_ENV=development
PORT=3002

# Database
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=challenge_db

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672
```

## 📝 Validações

### Registro
- **Email**: Deve ser um email válido
- **Username**: 
  - 3-50 caracteres
  - Apenas letras, números, underscores e hífens
- **Password**: 
  - Mínimo 8 caracteres
  - Deve conter pelo menos uma letra maiúscula
  - Deve conter pelo menos uma letra minúscula
  - Deve conter pelo menos um número

### Login
- Email ou username e senha são obrigatórios

## 🚀 Desenvolvimento

### Iniciar o serviço

```bash
npm run dev
```

### Executar testes

```bash
npm test
```

### Build

```bash
npm run build
```

## 📚 Estratégias Passport

### JwtStrategy
- Valida access tokens
- Extrai o token do header Authorization
- Verifica a assinatura e expiração
- Retorna os dados do usuário

### JwtRefreshStrategy
- Valida refresh tokens
- Usa secret diferente do access token
- Permite renovação segura de tokens

## 🛡️ Guards

### JwtAuthGuard
Protege rotas que requerem autenticação com access token.

### JwtRefreshGuard
Protege rotas de refresh que requerem refresh token válido.

## 🔄 Fluxo de Autenticação

1. Usuário se registra ou faz login
2. Serviço gera access token (15min) e refresh token (7dias)
3. Refresh token é armazenado no banco de dados
4. Cliente usa access token para requisições autenticadas
5. Quando access token expira, cliente usa refresh token
6. Serviço valida refresh token e gera novos tokens
7. Refresh token antigo é revogado e novo é criado

## 🧹 Manutenção

### Limpeza de Tokens Expirados

O serviço fornece um método para limpar tokens expirados:

```typescript
await authService.cleanExpiredTokens();
```

Recomenda-se executar periodicamente via cron job.

