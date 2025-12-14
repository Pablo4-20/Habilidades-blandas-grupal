import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './components/DashboardHome';
import PlanificacionDocente from './components/PlanificacionDocente';
import GestionUsuarios from './components/GestionUsuarios';
import GestionHabilidades from './components/GestionHabilidades';
import GestionAsignaturas from './components/GestionAsignaturas'; // Si lo creamos antes
import AsignarMaterias from './components/AsignarMaterias';
import EvaluacionDocente from './components/EvaluacionDocente'; // <--- ¡ESTA LÍNEA FALTABA!
import RoleGuard from './components/RoleGuard';
import ReportesDocente from './components/ReportesDocente';
import ReportesCoordinador from './components/ReportesCoordinador';

// --- Rutas de Protección ---
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/" replace />;
    return children;
};

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (token) return <Navigate to="/dashboard" replace />;
    return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={
            <PublicRoute>
                <Login />
            </PublicRoute>
        } />

        {/* Dashboard */}
        <Route path="/dashboard" element={
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        }>
            <Route index element={<DashboardHome />} />

            {/* ZONA DOCENTE */}
            <Route element={<RoleGuard allowedRoles={['docente']} />}>
                <Route path="planificacion" element={<PlanificacionDocente />} />
                <Route path="evaluacion" element={<EvaluacionDocente />} />
                <Route path="reportes-docente" element={<ReportesDocente />} />
            </Route>

            {/* ZONA ADMIN */}
            <Route element={<RoleGuard allowedRoles={['admin']} />}>
                <Route path="usuarios" element={<GestionUsuarios />} />
                <Route path="habilidades" element={<GestionHabilidades />} />
                <Route path="asignaturas" element={<GestionAsignaturas />} /> 
            </Route>

            {/* ZONA COORDINADOR */}
            <Route element={<RoleGuard allowedRoles={['coordinador']} />}>
                <Route path="asignaciones" element={<AsignarMaterias />} />
                <Route path="reportes" element={<ReportesCoordinador />} />
            </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;