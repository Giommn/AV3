import { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { Plane, Users, LogOut, LayoutDashboard, Activity } from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = (path: string) => 
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      location.pathname === path 
        ? 'bg-aerospace-accent/20 text-aerospace-accent' 
        : 'hover:bg-aerospace-border/50 text-slate-300'
    }`;

  return (
    <div className="flex h-screen bg-aerospace-dark overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-aerospace-panel border-r border-aerospace-border flex flex-col">
        <div className="p-6 flex items-center justify-center border-b border-aerospace-border">
          <Plane className="w-8 h-8 text-aerospace-accent mr-2" />
          <h1 className="text-xl font-bold tracking-wider text-white">AEROCODE</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/" className={navItemClass('/')}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          
          {user?.nivelPermissao !== 'OPERADOR' && (
            <Link to="/equipe" className={navItemClass('/equipe')}>
              <Users className="w-5 h-5" />
              <span>Gestão de Equipe</span>
            </Link>
          )}

          {user?.nivelPermissao !== 'OPERADOR' && (
            <Link to="/metricas" className={navItemClass('/metricas')}>
              <Activity className="w-5 h-5" />
              <span>Métricas AV3</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-aerospace-border">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-slate-200">{user?.usuario}</p>
            <p className="text-xs text-slate-400">{user?.nivelPermissao}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
