# Aerocode — Sistema de Gestão de Produção de Aeronaves

Plataforma web completa para gestão do ciclo de produção de aeronaves, desenvolvida como projeto das atividades AV1, AV2 e AV3. Composta por uma **API RESTful** (Node.js + Express + Prisma) e uma **SPA** (React + Vite + Tailwind CSS v4).

---

## 📁 Estrutura do Projeto

```
aerocode-backend/          ← pasta raiz do repositório
├── aerocode_backend/      ← API REST (Node.js / Express / Prisma / MySQL)
├── aerocode_frontend/     ← Interface Web (React / Vite / Tailwind CSS v4)
├── relatorio-av3.html     ← Relatório de qualidade AV3 (abrir no navegador → Ctrl+P → PDF)
└── README.md
```

---

## 🛠️ Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | v18 LTS ou superior |
| npm | v9 ou superior |
| MySQL | 8.0 ou superior, rodando localmente na porta **3306** |

Compatível com **Windows 10+**, **Ubuntu 24.04.03 LTS+** e derivados Ubuntu.

---

## ⚙️ 1. Backend (`aerocode_backend`)

### 1.1 Instalar dependências
```bash
cd aerocode_backend
npm install
```

### 1.2 Configurar variáveis de ambiente
Copie o arquivo de exemplo e edite com suas credenciais MySQL:
```bash
cp .env.example .env
```
Abra `.env` e ajuste a `DATABASE_URL`:
```env
DATABASE_URL="mysql://SEU_USUARIO:SUA_SENHA@localhost:3306/aerocode"
JWT_SECRET="uma_chave_secreta_longa_e_aleatoria"
PORT=3000
```

### 1.3 Criar as tabelas no banco (migrations)
```bash
npx prisma migrate dev
```

### 1.4 Popular o banco com dados iniciais (seed)
Cria o usuário administrador padrão (`admin` / `admin123`):
```bash
npm run prisma:seed
```

### 1.5 Iniciar o servidor
```bash
npm run dev
```
> Servidor disponível em **http://localhost:3000**  
> Health check: http://localhost:3000/health

---

## 🖥️ 2. Frontend (`aerocode_frontend`)

Abra um **novo terminal** (mantenha o backend rodando).

### 2.1 Instalar dependências
```bash
cd aerocode_frontend
npm install
```

### 2.2 Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
> Interface disponível em **http://localhost:5173**

> O Vite está pré-configurado para redirecionar automaticamente todas as chamadas `/api/*` para `localhost:3000`.

---

## 🔑 3. Credenciais padrão

| Campo | Valor |
|---|---|
| Usuário | `admin` |
| Senha | `admin123` |
| Nível | `ADMINISTRADOR` |

---

## 📊 4. Métricas de Performance (AV3)

### Via dashboard web
1. Acesse **http://localhost:5173/metricas**
2. Clique em **"Executar Stress Test"**
3. Os gráficos de latência, processamento e tempo de resposta são gerados automaticamente para 1, 5 e 10 usuários simultâneos.

### Via terminal (Node.js puro, sem deps externas)
```bash
cd aerocode_backend
node stress-test.js
```

### Relatório AV3
Abra `relatorio-av3.html` no navegador e use **Ctrl+P → Salvar como PDF**.

---

## 🔗 Principais Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/funcionarios/login` | Autenticação JWT |
| `GET` | `/api/v1/aeronaves` | Listar aeronaves |
| `POST` | `/api/v1/aeronaves` | Criar aeronave |
| `GET` | `/api/v1/aeronaves/:id/detalhes` | Detalhes completos |
| `POST` | `/api/v1/etapas` | Criar etapa de produção |
| `PATCH` | `/api/v1/etapas/:id/iniciar` | Iniciar etapa |
| `PATCH` | `/api/v1/etapas/:id/concluir` | Concluir etapa |
| `POST` | `/api/v1/pecas` | Adicionar peça |
| `POST` | `/api/v1/testes` | Registrar teste de qualidade |
| `POST` | `/api/v1/relatorios` | Gerar relatório final |
| `GET` | `/api/v1/metrics` | Métricas de performance |

---

## 🧑‍💻 Tecnologias Utilizadas

**Backend:** Node.js · TypeScript · Express.js · Prisma ORM · MySQL · JWT · bcrypt  
**Frontend:** React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · Chart.js · Axios · React Router · React Toastify
