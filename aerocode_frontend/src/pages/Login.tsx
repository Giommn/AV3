import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import api from '../api';
import { Plane } from 'lucide-react';
import { toast } from 'react-toastify';

export const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/funcionarios/login', { usuario, senha });
      if (response.data.status === 'success') {
        login(response.data.data.token);
        toast.success('Login realizado com sucesso!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-aerospace-dark relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-aerospace-accent/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md p-8 bg-aerospace-panel/80 backdrop-blur-xl border border-aerospace-border rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-aerospace-dark border border-aerospace-border rounded-xl flex items-center justify-center mb-4">
            <Plane className="w-8 h-8 text-aerospace-accent" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wider">AEROCODE</h2>
          <p className="text-sm text-slate-400 mt-2 text-center">Sistema de Gestão de Produção Aeroespacial</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Usuário</label>
            <input 
              type="text" 
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              className="w-full px-4 py-3 bg-aerospace-dark border border-aerospace-border rounded-lg focus:outline-none focus:border-aerospace-accent focus:ring-1 focus:ring-aerospace-accent text-white transition-all"
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full px-4 py-3 bg-aerospace-dark border border-aerospace-border rounded-lg focus:outline-none focus:border-aerospace-accent focus:ring-1 focus:ring-aerospace-accent text-white transition-all"
              placeholder="Digite sua senha"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-aerospace-accent hover:bg-sky-400 text-aerospace-dark font-bold rounded-lg transition-colors flex justify-center items-center"
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};
