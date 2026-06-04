import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AeronaveDetails } from './pages/AeronaveDetails';
import { Equipe } from './pages/Equipe';
import { Metricas } from './pages/Metricas';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="aeronaves/:id/detalhes" element={<AeronaveDetails />} />
          <Route path="equipe" element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ENGENHEIRO']}>
              <Equipe />
            </ProtectedRoute>
          } />
          <Route path="metricas" element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ENGENHEIRO']}>
              <Metricas />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
