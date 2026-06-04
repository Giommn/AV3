# Aerocode Backend

Backend do sistema de gestão de produção de aeronaves da **Aerocode**, desenvolvido em **TypeScript**, **Prisma ORM** e **MySQL**.

---

## Requisitos

- Node.js 18+
- MySQL 8.0+
- npm ou yarn

---

## Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/aerocode"
JWT_SECRET="seu-segredo-jwt-super-secreto"
JWT_EXPIRES_IN="8h"
PORT=3000
NODE_ENV=development
RELATORIOS_DIR="./relatorios"
```

### 3. Criar o banco de dados no MySQL

```sql
CREATE DATABASE aerocode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Executar as migrations

```bash
npm run prisma:migrate
```

### 5. Popular o banco com dados iniciais (seed)

```bash
npm run prisma:seed
```

Isso criará o usuário administrador padrão:
- **Usuário:** `admin`
- **Senha:** `admin123`

> ⚠️ Troque a senha padrão em produção!

### 6. Iniciar o servidor

**Desenvolvimento (hot reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

---

## Endpoints da API

Base URL: `http://localhost:3000/api/v1`

### Autenticação

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/funcionarios/login` | Login (retorna JWT) | Público |

O token JWT deve ser enviado no header de todas as requisições autenticadas:
```
Authorization: Bearer <token>
```

---

### Funcionários

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | `/funcionarios/me` | Perfil do usuário logado | Qualquer |
| GET | `/funcionarios` | Listar todos | Admin / Engenheiro |
| GET | `/funcionarios/:id` | Buscar por ID | Qualquer |
| POST | `/funcionarios` | Criar funcionário | Admin |
| PATCH | `/funcionarios/:id` | Atualizar dados | Próprio / Admin |
| PATCH | `/funcionarios/:id/senha` | Alterar senha | Próprio |
| DELETE | `/funcionarios/:id` | Desativar (soft delete) | Admin |

**Login — Body:**
```json
{
  "usuario": "admin",
  "senha": "admin123"
}
```

**Criar funcionário — Body:**
```json
{
  "nome": "João Silva",
  "telefone": "(12) 98765-4321",
  "endereco": "Rua das Aeronaves, 100 - São José dos Campos, SP",
  "usuario": "joao.silva",
  "senha": "senha123",
  "nivelPermissao": "ENGENHEIRO"
}
```
> `nivelPermissao`: `ADMINISTRADOR`, `ENGENHEIRO` ou `OPERADOR`

---

### Aeronaves

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | `/aeronaves` | Listar todas | Qualquer |
| GET | `/aeronaves/:id` | Buscar por ID | Qualquer |
| GET | `/aeronaves/:id/detalhes` | Detalhes completos (peças, etapas, testes) | Qualquer |
| POST | `/aeronaves` | Cadastrar aeronave | Admin / Engenheiro |
| PATCH | `/aeronaves/:id` | Atualizar | Admin / Engenheiro |
| DELETE | `/aeronaves/:id` | Remover | Admin |

**Cadastrar aeronave — Body:**
```json
{
  "codigo": "EMB-E195-001",
  "modelo": "Embraer E195-E2",
  "tipo": "COMERCIAL",
  "capacidade": 146,
  "alcance": 4800
}
```
> `tipo`: `COMERCIAL` ou `MILITAR`

---

### Peças

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | `/pecas/aeronave/:aeronaveId` | Listar por aeronave | Qualquer |
| GET | `/pecas/:id` | Buscar por ID | Qualquer |
| POST | `/pecas` | Cadastrar peça | Admin / Engenheiro |
| PATCH | `/pecas/:id` | Atualizar | Admin / Engenheiro |
| PATCH | `/pecas/:id/status` | Atualizar apenas o status | Qualquer |
| DELETE | `/pecas/:id` | Remover | Admin |

**Cadastrar peça — Body:**
```json
{
  "nome": "Motor GE9X",
  "tipo": "IMPORTADA",
  "fornecedor": "General Electric",
  "status": "EM_PRODUCAO",
  "aeronaveId": 1
}
```
> `tipo`: `NACIONAL` ou `IMPORTADA`  
> `status`: `EM_PRODUCAO`, `EM_TRANSPORTE` ou `PRONTA`

**Atualizar status — Body:**
```json
{ "status": "PRONTA" }
```

---

### Etapas de Produção

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | `/etapas/aeronave/:aeronaveId` | Listar por aeronave | Qualquer |
| GET | `/etapas/:id` | Buscar por ID | Qualquer |
| GET | `/etapas/:id/funcionarios` | Listar funcionários da etapa | Qualquer |
| POST | `/etapas` | Criar etapa | Admin / Engenheiro |
| PATCH | `/etapas/:id` | Atualizar | Admin / Engenheiro |
| PATCH | `/etapas/:id/iniciar` | Iniciar etapa (PENDENTE → ANDAMENTO) | Admin / Engenheiro |
| PATCH | `/etapas/:id/concluir` | Concluir etapa (ANDAMENTO → CONCLUIDA) | Admin / Engenheiro |
| POST | `/etapas/:id/funcionarios` | Associar funcionário | Admin / Engenheiro |
| DELETE | `/etapas/:id/funcionarios/:funcionarioId` | Desassociar funcionário | Admin / Engenheiro |
| DELETE | `/etapas/:id` | Remover | Admin |

**Criar etapa — Body:**
```json
{
  "nome": "Montagem da Fuselagem",
  "prazo": "2025-06-30",
  "ordem": 1,
  "aeronaveId": 1
}
```

> **Regra de negócio:** Uma etapa só pode ser iniciada se a etapa de `ordem` anterior já estiver **CONCLUIDA**. Isso garante a sequência lógica do processo produtivo.

**Associar funcionário — Body:**
```json
{ "funcionarioId": 2 }
```

---

### Testes

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | `/testes/aeronave/:aeronaveId` | Listar por aeronave | Qualquer |
| GET | `/testes/:id` | Buscar por ID | Qualquer |
| POST | `/testes` | Registrar teste | Admin / Engenheiro |
| PATCH | `/testes/:id` | Atualizar | Admin / Engenheiro |
| DELETE | `/testes/:id` | Remover | Admin |

**Registrar teste — Body:**
```json
{
  "tipo": "HIDRAULICO",
  "resultado": "APROVADO",
  "observacao": "Sistema hidráulico dentro dos parâmetros normais.",
  "aeronaveId": 1
}
```
> `tipo`: `ELETRICO`, `HIDRAULICO` ou `AERODINAMICO`  
> `resultado`: `APROVADO` ou `REPROVADO`

---

### Relatórios

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | `/relatorios/:id` | Buscar relatório por ID | Qualquer |
| GET | `/relatorios/aeronave/:aeronaveId` | Buscar relatório da aeronave | Qualquer |
| POST | `/relatorios` | Gerar relatório final | Admin / Engenheiro |
| PUT | `/relatorios/regenerar` | Regenerar relatório (sobrescreve) | Admin |

**Gerar relatório — Body:**
```json
{
  "aeronaveId": 1,
  "nomeCliente": "LATAM Airlines Brasil",
  "dataEntrega": "2025-12-01"
}
```

> **Regra de negócio:** O relatório só pode ser gerado quando **todas as etapas** de produção da aeronave estiverem com status `CONCLUIDA`. O arquivo `.txt` é salvo no diretório configurado em `RELATORIOS_DIR`.

---

## Estrutura do Projeto

```
aerocode/
├── prisma/
│   ├── schema.prisma       # Schema do banco com todos os modelos e enums
│   └── seed.ts             # Dados iniciais (admin padrão)
├── src/
│   ├── middlewares/
│   │   ├── auth.middleware.ts   # Autenticação JWT + autorização por nível
│   │   └── error.middleware.ts  # Handler global de erros
│   ├── modules/
│   │   ├── aeronave/       # CRUD de aeronaves
│   │   ├── etapa/          # Etapas de produção com controle sequencial
│   │   ├── funcionario/    # Funcionários + autenticação
│   │   ├── peca/           # Peças das aeronaves
│   │   ├── relatorio/      # Geração de relatórios em arquivo .txt
│   │   └── teste/          # Testes elétricos, hidráulicos e aerodinâmicos
│   ├── utils/
│   │   ├── errors.ts       # Classes de erro customizadas
│   │   ├── jwt.ts          # Assinatura e verificação JWT
│   │   └── prisma.ts       # Singleton do Prisma Client
│   ├── app.ts              # Configuração do Express
│   └── server.ts           # Entry point
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

---

## Regras de Negócio Implementadas

1. **Código único por aeronave** — não há duplicidade no campo `codigo`.
2. **Usuário único por funcionário** — campo `usuario` é único no banco.
3. **Tipo e status via enumeração** — impossível registrar valores inválidos.
4. **Sequência obrigatória de etapas** — uma etapa só pode ser iniciada se a de `ordem - 1` estiver `CONCLUIDA`.
5. **Transição de status das etapas** — `PENDENTE → ANDAMENTO → CONCLUIDA` (sem pular etapas).
6. **Associação sem duplicidade** — um funcionário não pode ser associado duas vezes à mesma etapa.
7. **Relatório exige todas etapas concluídas** — garante que a aeronave está pronta para entrega.
8. **Relatório salvo em arquivo .txt** — conteúdo persistido em disco e no banco de dados.
9. **Soft delete de funcionários** — registros são desativados para preservar histórico de produção.
10. **Níveis de permissão** — `ADMINISTRADOR` > `ENGENHEIRO` > `OPERADOR` com restrições por rota.
