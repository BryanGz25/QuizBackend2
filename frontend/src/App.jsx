import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AvisosProvider } from './components/Avisos';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ResumenPage from './pages/ResumenPage';
import MaterialesPage from './pages/MaterialesPage';
import InventariosPage from './pages/InventariosPage';
import MovimientosPage from './pages/MovimientosPage';
import AlertasPage from './pages/AlertasPage';
import TrazabilidadPage from './pages/TrazabilidadPage';
import RequisicionesPage from './pages/RequisicionesPage';
import OrdenesPage from './pages/OrdenesPage';
import AprobacionesPage from './pages/AprobacionesPage';
import ProveedoresPage from './pages/ProveedoresPage';
import ObrasPage from './pages/ObrasPage';
import ReportesPage from './pages/ReportesPage';
import ConfiguracionPage from './pages/ConfiguracionPage';

function RutaProtegida() {
  const { usuario } = useAuth();
  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AvisosProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RutaProtegida />}>
              <Route element={<Layout />}>
                <Route index element={<ResumenPage />} />
                <Route path="materiales" element={<MaterialesPage />} />
                <Route path="inventarios" element={<InventariosPage />} />
                <Route path="movimientos" element={<MovimientosPage />} />
                <Route path="alertas" element={<AlertasPage />} />
                <Route path="trazabilidad" element={<TrazabilidadPage />} />
                <Route path="requisiciones" element={<RequisicionesPage />} />
                <Route path="ordenes" element={<OrdenesPage />} />
                <Route path="aprobaciones" element={<AprobacionesPage />} />
                <Route path="proveedores" element={<ProveedoresPage />} />
                <Route path="obras" element={<ObrasPage />} />
                <Route path="reportes" element={<ReportesPage />} />
                <Route path="configuracion" element={<ConfiguracionPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AvisosProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
