import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { Plus, Plane, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface Aeronave {
  id: number;
  codigo: string;
  modelo: string;
  tipo: string;
  capacidade: number;
  alcance: number;
  _count?: {
    pecas: number;
    etapas: number;
    testes: number;
  };
}

export const Dashboard = () => {
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    modelo: '',
    tipo: 'COMERCIAL',
    capacidade: '',
    alcance: ''
  });

  useEffect(() => {
    fetchAeronaves();
  }, []);

  const fetchAeronaves = async () => {
    try {
      const response = await api.get('/aeronaves');
      setAeronaves(response.data.data);
    } catch (err) {
      toast.error('Erro ao carregar aeronaves');
    }
  };

  const handleAddAeronaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingModal(true);
    try {
      await api.post('/aeronaves', {
        codigo: formData.codigo,
        modelo: formData.modelo,
        tipo: formData.tipo,
        capacidade: parseInt(formData.capacidade),
        alcance: parseFloat(formData.alcance)
      });
      toast.success('Aeronave criada com sucesso!');
      setIsModalOpen(false);
      setFormData({ codigo: '', modelo: '', tipo: 'COMERCIAL', capacidade: '', alcance: '' });
      fetchAeronaves();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao criar aeronave');
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Visão geral das aeronaves em produção</p>
        </div>
        {(user?.nivelPermissao === 'ADMINISTRADOR' || user?.nivelPermissao === 'ENGENHEIRO') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-aerospace-accent hover:bg-sky-400 text-aerospace-dark font-bold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Aeronave
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aeronaves.map(a => (
          <div key={a.id} className="bg-aerospace-panel border border-aerospace-border rounded-xl p-6 hover:border-aerospace-accent/50 transition-colors cursor-pointer" onClick={() => navigate(`/aeronaves/${a.id}/detalhes`)}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-aerospace-dark flex items-center justify-center border border-aerospace-border">
                <Plane className="w-6 h-6 text-aerospace-accent" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                a.tipo === 'MILITAR' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
              }`}>
                {a.tipo}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{a.codigo}</h3>
            <p className="text-sm text-slate-400 mb-4">{a.modelo}</p>
            
            <div className="grid grid-cols-3 gap-2 border-t border-aerospace-border pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{a._count?.etapas || 0}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Etapas</p>
              </div>
              <div className="text-center border-x border-aerospace-border">
                <p className="text-2xl font-bold text-white">{a._count?.pecas || 0}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Peças</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{a._count?.testes || 0}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Testes</p>
              </div>
            </div>
          </div>
        ))}
        {aeronaves.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            Nenhuma aeronave em produção.
          </div>
        )}
      </div>

      {/* MODAL NOVA AERONAVE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-aerospace-panel border border-aerospace-border rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-full">
            <div className="flex justify-between items-center p-6 border-b border-aerospace-border">
              <h2 className="text-xl font-bold text-white">Nova Aeronave</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="aeronave-form" onSubmit={handleAddAeronaveSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Código (ex: KC-390)</label>
                  <input required type="text" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Modelo</label>
                  <input required type="text" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
                  <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent">
                    <option value="COMERCIAL">COMERCIAL</option>
                    <option value="MILITAR">MILITAR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Capacidade (assentos)</label>
                  <input required type="number" value={formData.capacidade} onChange={e => setFormData({...formData, capacidade: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Alcance (km)</label>
                  <input required type="number" step="0.1" value={formData.alcance} onChange={e => setFormData({...formData, alcance: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-aerospace-border flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} type="button" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancelar</button>
              <button type="submit" form="aeronave-form" disabled={loadingModal} className="px-4 py-2 bg-aerospace-accent hover:bg-sky-400 text-aerospace-dark font-bold rounded-lg transition-colors">
                {loadingModal ? 'Criando...' : 'Criar Aeronave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
