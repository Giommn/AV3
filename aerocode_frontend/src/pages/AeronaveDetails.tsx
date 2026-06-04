import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { toast } from 'react-toastify';
import { CheckCircle, Clock, AlertTriangle, Play, Check, ShieldCheck, Download, Plus, X } from 'lucide-react';

export const AeronaveDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [aeronave, setAeronave] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [formData, setFormData] = useState({ nomeCliente: '', dataEntrega: '' });

  const [isEtapaModalOpen, setIsEtapaModalOpen] = useState(false);
  const [loadingEtapaModal, setLoadingEtapaModal] = useState(false);
  const [etapaFormData, setEtapaFormData] = useState({ nome: '', prazo: '', ordem: '' });
  const [isPecaModalOpen, setIsPecaModalOpen] = useState(false);
  const [loadingPecaModal, setLoadingPecaModal] = useState(false);
  const [pecaFormData, setPecaFormData] = useState({ nome: '', tipo: 'NACIONAL', fornecedor: '' });

  const [isTesteModalOpen, setIsTesteModalOpen] = useState(false);
  const [loadingTesteModal, setLoadingTesteModal] = useState(false);
  const [testeFormData, setTesteFormData] = useState({ tipo: 'ELETRICO', resultado: 'APROVADO', observacao: '' });

  useEffect(() => {
    fetchDetalhes();
  }, [id]);

  const fetchDetalhes = async () => {
    try {
      const response = await api.get(`/aeronaves/${id}/detalhes`);
      setAeronave(response.data.data);
    } catch (err) {
      toast.error('Erro ao carregar detalhes da aeronave');
    } finally {
      setLoading(false);
    }
  };

  const isEngOrAdmin = user?.nivelPermissao === 'ENGENHEIRO' || user?.nivelPermissao === 'ADMINISTRADOR';

  const handleIniciarEtapa = async (etapaId: number) => {
    try {
      await api.patch(`/etapas/${etapaId}/iniciar`);
      toast.success('Etapa iniciada!');
      fetchDetalhes();
    } catch (err) { toast.error('Erro ao iniciar etapa'); }
  };

  const handleConcluirEtapa = async (etapaId: number) => {
    try {
      await api.patch(`/etapas/${etapaId}/concluir`);
      toast.success('Etapa concluída!');
      fetchDetalhes();
    } catch (err) { toast.error('Erro ao concluir etapa'); }
  };

  const handleMudarStatusPeca = async (pecaId: number, novoStatus: string) => {
    try {
      await api.patch(`/pecas/${pecaId}/status`, { status: novoStatus });
      toast.success('Status da peça atualizado');
      fetchDetalhes();
    } catch (err) { toast.error('Erro ao atualizar status'); }
  };

  const handleGerarRelatorioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingModal(true);
    try {
      await api.post(`/relatorios`, {
        aeronaveId: Number(id),
        nomeCliente: formData.nomeCliente,
        dataEntrega: new Date(formData.dataEntrega).toISOString()
      });
      toast.success('Relatório gerado com sucesso!');
      setIsModalOpen(false);
      setFormData({ nomeCliente: '', dataEntrega: '' });
      fetchDetalhes();
    } catch (err: any) {
      if (err.response?.status === 422) {
        toast.error('Existem etapas pendentes!');
      } else {
        toast.error(err.response?.data?.message || 'Erro ao gerar relatório');
      }
    } finally {
      setLoadingModal(false);
    }
  };

  const handleAddEtapaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEtapaModal(true);
    try {
      await api.post(`/etapas`, {
        aeronaveId: Number(id),
        nome: etapaFormData.nome,
        ordem: Number(etapaFormData.ordem),
        prazo: new Date(etapaFormData.prazo).toISOString()
      });
      toast.success('Etapa adicionada com sucesso!');
      setIsEtapaModalOpen(false);
      setEtapaFormData({ nome: '', prazo: '', ordem: '' });
      fetchDetalhes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao adicionar etapa');
    } finally {
      setLoadingEtapaModal(false);
    }
  };

  const handleAddPecaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPecaModal(true);
    try {
      await api.post(`/pecas`, {
        aeronaveId: Number(id),
        nome: pecaFormData.nome,
        tipo: pecaFormData.tipo,
        fornecedor: pecaFormData.fornecedor
      });
      toast.success('Peça adicionada com sucesso!');
      setIsPecaModalOpen(false);
      setPecaFormData({ nome: '', tipo: 'NACIONAL', fornecedor: '' });
      fetchDetalhes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao adicionar peça');
    } finally {
      setLoadingPecaModal(false);
    }
  };

  const handleAddTesteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingTesteModal(true);
    try {
      await api.post(`/testes`, {
        aeronaveId: Number(id),
        tipo: testeFormData.tipo,
        resultado: testeFormData.resultado,
        observacao: testeFormData.observacao
      });
      toast.success('Teste registrado com sucesso!');
      setIsTesteModalOpen(false);
      setTesteFormData({ tipo: '', resultado: 'APROVADO', observacao: '' });
      fetchDetalhes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao registrar teste');
    } finally {
      setLoadingTesteModal(false);
    }
  };

  if (loading) return <div className="text-white p-8">Carregando painel...</div>;
  if (!aeronave) return <div className="text-white p-8">Aeronave não encontrada.</div>;

  const etapasIncompletas = aeronave.etapas.filter((e: any) => e.status !== 'CONCLUIDA');
  const todasEtapasConcluidas = aeronave.etapas.length > 0 && etapasIncompletas.length === 0;

  return (
    <div className="space-y-8 relative">
      {/* HEADER */}
      <div className="bg-aerospace-panel border border-aerospace-border p-6 rounded-xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-widest">{aeronave.codigo}</h1>
          <p className="text-slate-400">{aeronave.modelo} - Tipo: {aeronave.tipo}</p>
        </div>
        <div className="flex space-x-4">
          <div className="text-center px-4 py-2 bg-aerospace-dark rounded-lg border border-aerospace-border">
            <p className="text-xs text-slate-500 uppercase">Progresso</p>
            <p className="text-xl font-bold text-white">
              {aeronave.etapas.filter((e:any) => e.status === 'CONCLUIDA').length} / {aeronave.etapas.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ETAPAS TIMELINE */}
        <div className="bg-aerospace-panel border border-aerospace-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center"><Clock className="mr-2 w-5 h-5 text-aerospace-accent"/> Cronograma de Etapas</h2>
            {isEngOrAdmin && <button onClick={() => setIsEtapaModalOpen(true)} className="text-aerospace-accent hover:text-sky-400 text-sm flex items-center"><Plus className="w-4 h-4 mr-1"/>Nova Etapa</button>}
          </div>
          <div className="space-y-4">
            {aeronave.etapas.map((etapa: any) => (
              <div key={etapa.id} className="p-4 bg-aerospace-dark border border-aerospace-border rounded-lg relative overflow-hidden">
                {etapa.status === 'ANDAMENTO' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 animate-pulse"></div>}
                {etapa.status === 'CONCLUIDA' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
                {etapa.status === 'PENDENTE' && <div className="absolute top-0 left-0 w-1 h-full bg-slate-600"></div>}
                
                <div className="flex justify-between items-start ml-2">
                  <div>
                    <h3 className="text-white font-bold">{etapa.ordem}. {etapa.nome}</h3>
                    <p className="text-xs text-slate-400 mt-1">Prazo: {new Date(etapa.prazo).toLocaleDateString()}</p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${etapa.status === 'CONCLUIDA' ? 'bg-emerald-500/20 text-emerald-400' : etapa.status === 'ANDAMENTO' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
                      {etapa.status}
                    </span>
                  </div>
                  {isEngOrAdmin && (
                    <div className="flex space-x-2">
                      {etapa.status === 'PENDENTE' && (
                        <button onClick={() => handleIniciarEtapa(etapa.id)} className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg" title="Iniciar">
                          <Play className="w-4 h-4"/>
                        </button>
                      )}
                      {etapa.status === 'ANDAMENTO' && (
                        <button onClick={() => handleConcluirEtapa(etapa.id)} className="p-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg" title="Concluir">
                          <Check className="w-4 h-4"/>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {aeronave.etapas.length === 0 && <p className="text-slate-500 text-sm">Nenhuma etapa cadastrada.</p>}
          </div>
        </div>

        <div className="space-y-8">
          {/* PEÇAS */}
          <div className="bg-aerospace-panel border border-aerospace-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Inventário de Peças</h2>
              {isEngOrAdmin && <button onClick={() => setIsPecaModalOpen(true)} className="text-aerospace-accent hover:text-sky-400 text-sm flex items-center"><Plus className="w-4 h-4 mr-1"/>Nova Peça</button>}
            </div>
            <div className="space-y-3">
              {aeronave.pecas.map((peca: any) => (
                <div key={peca.id} className="flex justify-between items-center p-3 bg-aerospace-dark rounded-lg border border-aerospace-border">
                  <div>
                    <p className="text-white font-medium text-sm">{peca.nome} <span className="text-xs text-slate-500 ml-1">({peca.tipo})</span></p>
                    <p className="text-xs text-slate-500">{peca.fornecedor}</p>
                  </div>
                  <select 
                    value={peca.status}
                    onChange={(e) => handleMudarStatusPeca(peca.id, e.target.value)}
                    className="bg-aerospace-panel text-xs text-slate-300 border border-aerospace-border rounded p-1 outline-none focus:border-aerospace-accent"
                  >
                    <option value="EM_PRODUCAO">Em Produção</option>
                    <option value="EM_TRANSPORTE">Em Transporte</option>
                    <option value="PRONTA">Pronta</option>
                  </select>
                </div>
              ))}
              {aeronave.pecas.length === 0 && <p className="text-slate-500 text-sm">Nenhuma peça registrada.</p>}
            </div>
          </div>

          {/* TESTES */}
          <div className="bg-aerospace-panel border border-aerospace-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-aerospace-accent"/> Controle de Qualidade</h2>
              {isEngOrAdmin && <button onClick={() => setIsTesteModalOpen(true)} className="text-aerospace-accent hover:text-sky-400 text-sm flex items-center"><Plus className="w-4 h-4 mr-1"/>Novo Teste</button>}
            </div>
            <div className="space-y-3">
              {aeronave.testes.map((teste: any) => (
                <div key={teste.id} className={`p-3 rounded-lg border ${teste.resultado === 'APROVADO' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex justify-between">
                    <p className="font-bold text-sm text-white">{teste.tipo}</p>
                    <span className={`text-xs font-bold ${teste.resultado === 'APROVADO' ? 'text-emerald-400' : 'text-red-400'}`}>{teste.resultado}</span>
                  </div>
                  {teste.observacao && <p className="text-xs mt-2 text-slate-400">{teste.observacao}</p>}
                </div>
              ))}
              {aeronave.testes.length === 0 && <p className="text-slate-500 text-sm">Nenhum teste de qualidade registrado.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* RELATÓRIO FINAL */}
      <div className="bg-aerospace-panel border border-aerospace-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Certificado e Relatório de Entrega</h2>
        
        {!todasEtapasConcluidas && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-bold mb-1">Relatório Bloqueado</p>
              {aeronave.etapas.length === 0 ? (
                <p className="text-sm text-red-400/80 mb-2">Não é possível gerar o relatório pois nenhuma etapa foi cadastrada.</p>
              ) : (
                <>
                  <p className="text-sm text-red-400/80 mb-2">Conclua as seguintes etapas para gerar o relatório:</p>
                  <ul className="list-disc pl-5 text-sm text-red-400/80">
                    {etapasIncompletas.map((e:any) => <li key={e.id}>{e.nome}</li>)}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        {todasEtapasConcluidas && !aeronave.relatorio && isEngOrAdmin && (
          <div className="p-6 border border-dashed border-aerospace-border rounded-lg text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Aeronave Pronta para Entrega!</h3>
            <p className="text-slate-400 mb-6">Todas as etapas foram concluídas. Você já pode gerar o relatório final.</p>
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-aerospace-accent text-aerospace-dark font-bold rounded-lg hover:bg-sky-400 transition-colors">
              Gerar Relatório Final
            </button>
          </div>
        )}

        {aeronave.relatorio && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-emerald-400 font-bold flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> Relatório Gerado</p>
              <button className="flex items-center px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600">
                <Download className="w-4 h-4 mr-2" /> Baixar .txt
              </button>
            </div>
            <div className="p-4 bg-black/50 border border-slate-800 rounded-lg overflow-x-auto">
              <pre className="monospace-report text-xs text-green-400 whitespace-pre-wrap">
                {aeronave.relatorio.conteudo}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* MODAL NOVA ETAPA */}
      {isEtapaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-aerospace-panel border border-aerospace-border rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-full">
            <div className="flex justify-between items-center p-6 border-b border-aerospace-border">
              <h2 className="text-xl font-bold text-white">Nova Etapa</h2>
              <button onClick={() => setIsEtapaModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="etapa-form" onSubmit={handleAddEtapaSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Etapa</label>
                  <input required type="text" value={etapaFormData.nome} onChange={e => setEtapaFormData({...etapaFormData, nome: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" placeholder="Ex: Montagem das Asas" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Ordem (Sequência)</label>
                  <input required type="number" min="1" value={etapaFormData.ordem} onChange={e => setEtapaFormData({...etapaFormData, ordem: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Prazo de Conclusão</label>
                  <input required type="date" value={etapaFormData.prazo} onChange={e => setEtapaFormData({...etapaFormData, prazo: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-aerospace-border flex justify-end space-x-3">
              <button onClick={() => setIsEtapaModalOpen(false)} type="button" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancelar</button>
              <button type="submit" form="etapa-form" disabled={loadingEtapaModal} className="px-4 py-2 bg-aerospace-accent hover:bg-sky-400 text-aerospace-dark font-bold rounded-lg transition-colors">
                {loadingEtapaModal ? 'Adicionando...' : 'Adicionar Etapa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVA PEÇA */}
      {isPecaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-aerospace-panel border border-aerospace-border rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-full">
            <div className="flex justify-between items-center p-6 border-b border-aerospace-border">
              <h2 className="text-xl font-bold text-white">Nova Peça</h2>
              <button onClick={() => setIsPecaModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="peca-form" onSubmit={handleAddPecaSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Peça</label>
                  <input required type="text" value={pecaFormData.nome} onChange={e => setPecaFormData({...pecaFormData, nome: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" placeholder="Ex: Turbina Pratt & Whitney" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Peça</label>
                  <select value={pecaFormData.tipo} onChange={e => setPecaFormData({...pecaFormData, tipo: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent">
                    <option value="NACIONAL">NACIONAL</option>
                    <option value="IMPORTADA">IMPORTADA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Fornecedor</label>
                  <input required type="text" value={pecaFormData.fornecedor} onChange={e => setPecaFormData({...pecaFormData, fornecedor: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" placeholder="Ex: Embraer" />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-aerospace-border flex justify-end space-x-3">
              <button onClick={() => setIsPecaModalOpen(false)} type="button" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancelar</button>
              <button type="submit" form="peca-form" disabled={loadingPecaModal} className="px-4 py-2 bg-aerospace-accent hover:bg-sky-400 text-aerospace-dark font-bold rounded-lg transition-colors">
                {loadingPecaModal ? 'Adicionando...' : 'Adicionar Peça'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO TESTE */}
      {isTesteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-aerospace-panel border border-aerospace-border rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-full">
            <div className="flex justify-between items-center p-6 border-b border-aerospace-border">
              <h2 className="text-xl font-bold text-white">Novo Teste de Qualidade</h2>
              <button onClick={() => setIsTesteModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="teste-form" onSubmit={handleAddTesteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tipo do Teste</label>
                  <select value={testeFormData.tipo} onChange={e => setTesteFormData({...testeFormData, tipo: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent">
                    <option value="ELETRICO">ELÉTRICO</option>
                    <option value="HIDRAULICO">HIDRÁULICO</option>
                    <option value="AERODINAMICO">AERODINÂMICO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Resultado</label>
                  <select value={testeFormData.resultado} onChange={e => setTesteFormData({...testeFormData, resultado: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent">
                    <option value="APROVADO">APROVADO</option>
                    <option value="REPROVADO">REPROVADO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Observação (Opcional)</label>
                  <textarea value={testeFormData.observacao} onChange={e => setTesteFormData({...testeFormData, observacao: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" rows={3} placeholder="Detalhes adicionais..."></textarea>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-aerospace-border flex justify-end space-x-3">
              <button onClick={() => setIsTesteModalOpen(false)} type="button" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancelar</button>
              <button type="submit" form="teste-form" disabled={loadingTesteModal} className="px-4 py-2 bg-aerospace-accent hover:bg-sky-400 text-aerospace-dark font-bold rounded-lg transition-colors">
                {loadingTesteModal ? 'Registrando...' : 'Registrar Teste'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GERAR RELATORIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-aerospace-panel border border-aerospace-border rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-full">
            <div className="flex justify-between items-center p-6 border-b border-aerospace-border">
              <h2 className="text-xl font-bold text-white">Gerar Relatório Final</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="relatorio-form" onSubmit={handleGerarRelatorioSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Cliente</label>
                  <input required type="text" value={formData.nomeCliente} onChange={e => setFormData({...formData, nomeCliente: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" placeholder="Ex: Latam Airlines Group" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Data de Entrega</label>
                  <input required type="date" value={formData.dataEntrega} onChange={e => setFormData({...formData, dataEntrega: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-aerospace-border flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} type="button" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancelar</button>
              <button type="submit" form="relatorio-form" disabled={loadingModal} className="px-4 py-2 bg-aerospace-accent hover:bg-sky-400 text-aerospace-dark font-bold rounded-lg transition-colors">
                {loadingModal ? 'Gerando...' : 'Gerar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
