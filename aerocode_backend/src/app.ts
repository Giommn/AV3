import express from 'express';
import { errorHandler } from './middlewares/error.middleware';
import { metricsMiddleware } from './middlewares/metrics.middleware';

// Rotas dos módulos
import aeronaveRoutes from './modules/aeronave/aeronave.routes';
import pecaRoutes from './modules/peca/peca.routes';
import etapaRoutes from './modules/etapa/etapa.routes';
import funcionarioRoutes from './modules/funcionario/funcionario.routes';
import testeRoutes from './modules/teste/teste.routes';
import relatorioRoutes from './modules/relatorio/relatorio.routes';
import metricsRoutes from './modules/metrics/metrics.routes';

const app = express();

// ─── Middlewares globais ───────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Coleta de métricas em todas as rotas da API ───────────────────────────────
app.use('/api/v1', metricsMiddleware);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Aerocode Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Rotas da API ─────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/funcionarios`, funcionarioRoutes);
app.use(`${API_PREFIX}/aeronaves`, aeronaveRoutes);
app.use(`${API_PREFIX}/pecas`, pecaRoutes);
app.use(`${API_PREFIX}/etapas`, etapaRoutes);
app.use(`${API_PREFIX}/testes`, testeRoutes);
app.use(`${API_PREFIX}/relatorios`, relatorioRoutes);
app.use(`${API_PREFIX}/metrics`, metricsRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Rota não encontrada.' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
