import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { Chart, registerables } from 'chart.js';
import { Activity, Cpu, Wifi, RefreshCw, Play, Trash2 } from 'lucide-react';

Chart.register(...registerables);

interface MetricSummary {
  concurrentUsers: number;
  requests: number;
  latency: { avg: number; min: number; max: number };
  processing: { avg: number; min: number; max: number };
  response: { avg: number; min: number; max: number };
}

interface MetricsData {
  total: number;
  summary: MetricSummary[];
}

const SCENARIO_COLORS: Record<number, { border: string; bg: string }> = {
  1:  { border: 'rgb(56, 189, 248)',   bg: 'rgba(56, 189, 248, 0.2)' },
  5:  { border: 'rgb(168, 85, 247)',   bg: 'rgba(168, 85, 247, 0.2)' },
  10: { border: 'rgb(251, 146, 60)',   bg: 'rgba(251, 146, 60, 0.2)' },
};

export const Metricas = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const latencyRef  = useRef<HTMLCanvasElement>(null);
  const procRef     = useRef<HTMLCanvasElement>(null);
  const responseRef = useRef<HTMLCanvasElement>(null);

  const latencyChart  = useRef<Chart | null>(null);
  const procChart     = useRef<Chart | null>(null);
  const responseChart = useRef<Chart | null>(null);

  const addLog = (msg: string) =>
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/metrics');
      setMetrics(res.data.data);
    } catch {
      toast.error('Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  // ─── Build / update charts ────────────────────────────────────────────────────
  useEffect(() => {
    if (!metrics) return;

    const summaries = metrics.summary;
    const labels = summaries.map(s => `${s.concurrentUsers} usuário${s.concurrentUsers > 1 ? 's' : ''}`);

    const buildDataset = (key: 'latency' | 'processing' | 'response', sub: 'avg' | 'min' | 'max', label: string) =>
      summaries.map((_, i) => {
        const col = Object.values(SCENARIO_COLORS)[i] ?? SCENARIO_COLORS[1];
        return {
          label: `${label} (${labels[i]})`,
          data: [summaries[i][key][sub]],
          backgroundColor: col.bg,
          borderColor: col.border,
          borderWidth: 2,
          borderRadius: 6,
        };
      });

    const chartOptions: any = {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} ms` } },
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
        y: {
          ticks: { color: '#94a3b8', callback: (v: number) => `${v} ms` },
          grid: { color: '#1e293b' },
          beginAtZero: true,
        },
      },
    };

    const makeBarData = (key: 'latency' | 'processing' | 'response') => ({
      labels: summaries.map(s => `${s.concurrentUsers}u`),
      datasets: [
        {
          label: 'Mínimo',
          data: summaries.map(s => s[key].min),
          backgroundColor: 'rgba(56, 189, 248, 0.3)',
          borderColor: 'rgb(56, 189, 248)',
          borderWidth: 2,
          borderRadius: 4,
        },
        {
          label: 'Médio',
          data: summaries.map(s => s[key].avg),
          backgroundColor: 'rgba(168, 85, 247, 0.3)',
          borderColor: 'rgb(168, 85, 247)',
          borderWidth: 2,
          borderRadius: 4,
        },
        {
          label: 'Máximo',
          data: summaries.map(s => s[key].max),
          backgroundColor: 'rgba(251, 146, 60, 0.3)',
          borderColor: 'rgb(251, 146, 60)',
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    });

    const destroyAndCreate = (
      ref: React.RefObject<HTMLCanvasElement>,
      chartRef: React.MutableRefObject<Chart | null>,
      key: 'latency' | 'processing' | 'response'
    ) => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!ref.current) return;
      const ctx = ref.current.getContext('2d');
      if (!ctx) return;
      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: makeBarData(key),
        options: { ...chartOptions, plugins: { ...chartOptions.plugins, legend: { labels: { color: '#94a3b8' } } } },
      });
    };

    destroyAndCreate(latencyRef, latencyChart, 'latency');
    destroyAndCreate(procRef, procChart, 'processing');
    destroyAndCreate(responseRef, responseChart, 'response');

    return () => {
      latencyChart.current?.destroy();
      procChart.current?.destroy();
      responseChart.current?.destroy();
    };
  }, [metrics]);

  // ─── In-browser stress test ───────────────────────────────────────────────────
  const runStressTest = async () => {
    setRunning(true);
    setLog([]);
    addLog('Iniciando stress test...');

    try {
      // Clear old metrics
      await api.delete('/metrics');
      addLog('Métricas anteriores apagadas.');

      for (const concurrentUsers of [1, 5, 10]) {
        addLog(`▶ Cenário: ${concurrentUsers} usuário(s) simultâneo(s)...`);
        const REQUESTS_PER_USER = 5;

        const userTasks = Array.from({ length: concurrentUsers }, async () => {
          for (let i = 0; i < REQUESTS_PER_USER; i++) {
            await api.get('/aeronaves', {
              headers: { 'X-Concurrent-Users': String(concurrentUsers) },
            });
          }
        });

        const start = Date.now();
        await Promise.all(userTasks);
        const elapsed = Date.now() - start;

        addLog(`  ✔ ${concurrentUsers * REQUESTS_PER_USER} requisições concluídas em ${elapsed}ms`);
        await new Promise(r => setTimeout(r, 400));
      }

      addLog('✅ Teste concluído! Carregando resultados...');
      await fetchMetrics();
    } catch (err) {
      addLog('❌ Erro durante o teste.');
      toast.error('Erro ao executar stress test');
    } finally {
      setRunning(false);
    }
  };

  const handleClearMetrics = async () => {
    try {
      await api.delete('/metrics');
      setMetrics(null);
      toast.success('Métricas apagadas!');
      addLog('Métricas apagadas manualmente.');
    } catch {
      toast.error('Erro ao apagar métricas');
    }
  };

  const StatCard = ({ label, value, unit = 'ms', icon: Icon, color }: any) => (
    <div className="bg-aerospace-panel border border-aerospace-border rounded-xl p-5 flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white">{value ?? '—'}<span className="text-sm text-slate-400 ml-1">{unit}</span></p>
      </div>
    </div>
  );

  const bestSummary = metrics?.summary?.find(s => s.concurrentUsers === 1);
  const worstSummary = metrics?.summary?.find(s => s.concurrentUsers === 10) ?? metrics?.summary?.[metrics.summary.length - 1];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Métricas de Performance</h1>
          <p className="text-slate-400 mt-1">Latência · Tempo de Processamento · Tempo de Resposta — AV3</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-aerospace-panel border border-aerospace-border hover:border-aerospace-accent text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={handleClearMetrics}
            className="flex items-center px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar
          </button>
          <button
            onClick={runStressTest}
            disabled={running}
            className="flex items-center px-5 py-2 bg-aerospace-accent hover:bg-sky-400 text-aerospace-dark font-bold rounded-lg transition-colors disabled:opacity-60"
          >
            <Play className={`w-4 h-4 mr-2 ${running ? 'animate-pulse' : ''}`} />
            {running ? 'Executando...' : 'Executar Stress Test'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {metrics && metrics.total > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total de Requisições" value={metrics.total} unit="" icon={Activity} color="bg-sky-500/10 text-sky-400" />
          <StatCard label="Resp. Média (1u)" value={bestSummary?.response.avg} icon={Wifi} color="bg-emerald-500/10 text-emerald-400" />
          <StatCard label="Resp. Média (10u)" value={worstSummary?.response.avg} icon={Cpu} color="bg-orange-500/10 text-orange-400" />
          <StatCard label="Proc. Máx (10u)" value={worstSummary?.processing.max} icon={Cpu} color="bg-purple-500/10 text-purple-400" />
        </div>
      )}

      {/* Charts */}
      {!metrics || metrics.total === 0 ? (
        <div className="bg-aerospace-panel border border-dashed border-aerospace-border rounded-xl p-16 text-center">
          <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400 mb-2">Nenhuma métrica coletada ainda</h3>
          <p className="text-slate-500 mb-6">Clique em <strong className="text-aerospace-accent">Executar Stress Test</strong> para simular 1, 5 e 10 usuários simultâneos e gerar os gráficos da AV3.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-aerospace-panel border border-aerospace-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-sky-400" /> Latência
            </h2>
            <p className="text-xs text-slate-500 mb-4">Tempo de transmissão na rede (ms)</p>
            <canvas ref={latencyRef} />
          </div>
          <div className="bg-aerospace-panel border border-aerospace-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-purple-400" /> Tempo de Processamento
            </h2>
            <p className="text-xs text-slate-500 mb-4">Trabalho do servidor para responder (ms)</p>
            <canvas ref={procRef} />
          </div>
          <div className="bg-aerospace-panel border border-aerospace-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-400" /> Tempo de Resposta
            </h2>
            <p className="text-xs text-slate-500 mb-4">Experiência total percebida pelo usuário (ms)</p>
            <canvas ref={responseRef} />
          </div>
        </div>
      )}

      {/* Data Table */}
      {metrics && metrics.summary.length > 0 && (
        <div className="bg-aerospace-panel border border-aerospace-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-aerospace-border">
            <h2 className="text-lg font-bold text-white">Tabela de Resultados</h2>
            <p className="text-xs text-slate-400 mt-1">Resumo estatístico por número de usuários simultâneos — unidade: milissegundos (ms)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead className="bg-aerospace-dark text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Usuários</th>
                  <th className="px-6 py-3 text-left">Requisições</th>
                  <th className="px-6 py-3 text-center" colSpan={3}>Latência (ms)</th>
                  <th className="px-6 py-3 text-center" colSpan={3}>Processamento (ms)</th>
                  <th className="px-6 py-3 text-center" colSpan={3}>Resposta (ms)</th>
                </tr>
                <tr className="text-slate-600 text-xs">
                  <th colSpan={2}></th>
                  <th className="px-4 py-2">Min</th><th className="px-4 py-2">Avg</th><th className="px-4 py-2">Max</th>
                  <th className="px-4 py-2">Min</th><th className="px-4 py-2">Avg</th><th className="px-4 py-2">Max</th>
                  <th className="px-4 py-2">Min</th><th className="px-4 py-2">Avg</th><th className="px-4 py-2">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aerospace-border">
                {metrics.summary.map(s => (
                  <tr key={s.concurrentUsers} className="hover:bg-aerospace-border/20">
                    <td className="px-6 py-4 font-bold text-white">{s.concurrentUsers}u</td>
                    <td className="px-6 py-4 text-slate-400">{s.requests}</td>
                    <td className="px-4 py-4 text-center text-sky-400">{s.latency.min}</td>
                    <td className="px-4 py-4 text-center font-bold text-sky-300">{s.latency.avg}</td>
                    <td className="px-4 py-4 text-center text-sky-400">{s.latency.max}</td>
                    <td className="px-4 py-4 text-center text-purple-400">{s.processing.min}</td>
                    <td className="px-4 py-4 text-center font-bold text-purple-300">{s.processing.avg}</td>
                    <td className="px-4 py-4 text-center text-purple-400">{s.processing.max}</td>
                    <td className="px-4 py-4 text-center text-orange-400">{s.response.min}</td>
                    <td className="px-4 py-4 text-center font-bold text-orange-300">{s.response.avg}</td>
                    <td className="px-4 py-4 text-center text-orange-400">{s.response.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live log */}
      {log.length > 0 && (
        <div className="bg-black/60 border border-aerospace-border rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">Log do Teste</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto font-mono">
            {log.map((l, i) => (
              <p key={i} className={`text-xs ${l.includes('❌') ? 'text-red-400' : l.includes('✅') || l.includes('✔') ? 'text-emerald-400' : 'text-slate-400'}`}>{l}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
