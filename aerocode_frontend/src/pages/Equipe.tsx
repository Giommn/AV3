import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { toast } from 'react-toastify';
import { UserMinus, UserPlus, Plus, X } from 'lucide-react';

interface Funcionario {
  id: number;
  nome: string;
  usuario: string;
  telefone: string;
  nivelPermissao: string;
  ativo: boolean;
}

export const Equipe = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const { user } = useContext(AuthContext);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    usuario: '',
    senha: '',
    nivelPermissao: 'OPERADOR'
  });

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      const response = await api.get('/funcionarios');
      setFuncionarios(response.data.data);
    } catch (err) {
      toast.error('Erro ao carregar equipe');
    }
  };

  const handleToggleAtivo = async (id: number, ativo: boolean) => {
    if (user?.nivelPermissao !== 'ADMINISTRADOR') return;
    try {
      if(ativo) {
        await api.delete(`/funcionarios/${id}`);
      } else {
        await api.patch(`/funcionarios/${id}`, { ativo: true });
      }
      toast.success(ativo ? 'Funcionário desativado' : 'Funcionário ativado');
      fetchFuncionarios();
    } catch (err) {
      toast.error('Erro ao atualizar funcionário');
    }
  };

  const handleAddFuncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingModal(true);
    try {
      await api.post('/funcionarios', formData);
      toast.success('Funcionário cadastrado com sucesso!');
      setIsModalOpen(false);
      setFormData({ nome: '', telefone: '', endereco: '', usuario: '', senha: '', nivelPermissao: 'OPERADOR' });
      fetchFuncionarios();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao cadastrar funcionário');
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Equipe</h1>
          <p className="text-slate-400 mt-1">Gerencie os acessos e perfis do sistema</p>
        </div>
        {user?.nivelPermissao === 'ADMINISTRADOR' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-aerospace-accent hover:bg-sky-400 text-aerospace-dark font-bold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Funcionário
          </button>
        )}
      </div>

      <div className="bg-aerospace-panel border border-aerospace-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-aerospace-dark text-slate-400 uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">Nome</th>
              <th className="px-6 py-4 font-semibold">Usuário</th>
              <th className="px-6 py-4 font-semibold">Nível</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              {user?.nivelPermissao === 'ADMINISTRADOR' && <th className="px-6 py-4 font-semibold text-right">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-aerospace-border">
            {funcionarios.map(f => (
              <tr key={f.id} className="hover:bg-aerospace-border/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{f.nome}</td>
                <td className="px-6 py-4">{f.usuario}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${f.nivelPermissao === 'ADMINISTRADOR' ? 'bg-purple-500/10 text-purple-400' : f.nivelPermissao === 'ENGENHEIRO' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {f.nivelPermissao}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {f.ativo ? (
                    <span className="text-emerald-400 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>Ativo</span>
                  ) : (
                    <span className="text-red-400 flex items-center"><span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>Inativo</span>
                  )}
                </td>
                {user?.nivelPermissao === 'ADMINISTRADOR' && (
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleAtivo(f.id, f.ativo)}
                      className={`p-2 rounded-lg transition-colors ${f.ativo ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-emerald-500/20 text-emerald-400'}`}
                    >
                      {f.ativo ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL NOVO FUNCIONÁRIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-aerospace-panel border border-aerospace-border rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-full">
            <div className="flex justify-between items-center p-6 border-b border-aerospace-border">
              <h2 className="text-xl font-bold text-white">Novo Funcionário</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="func-form" onSubmit={handleAddFuncSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo</label>
                  <input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Telefone</label>
                  <input required type="text" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Endereço</label>
                  <input required type="text" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Usuário de Login</label>
                  <input required type="text" value={formData.usuario} onChange={e => setFormData({...formData, usuario: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
                  <input required type="password" value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nível de Permissão</label>
                  <select value={formData.nivelPermissao} onChange={e => setFormData({...formData, nivelPermissao: e.target.value})} className="w-full px-4 py-2 bg-aerospace-dark border border-aerospace-border rounded-lg text-white focus:outline-none focus:border-aerospace-accent">
                    <option value="OPERADOR">OPERADOR</option>
                    <option value="ENGENHEIRO">ENGENHEIRO</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-aerospace-border flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} type="button" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancelar</button>
              <button type="submit" form="func-form" disabled={loadingModal} className="px-4 py-2 bg-aerospace-accent hover:bg-sky-400 text-aerospace-dark font-bold rounded-lg transition-colors">
                {loadingModal ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
