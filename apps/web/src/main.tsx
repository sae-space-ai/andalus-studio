import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./theme.css";
import { AuthProvider, useAuth } from "./auth";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import ModuleStatus from "./pages/ModuleStatus";
import NotFound from "./pages/NotFound";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { loading, user } = useAuth();
  const loc = useLocation();
  if (loading) return <p className="container">Cargando…</p>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

function RedirectIfAuth({ children }: { children: JSX.Element }) {
  const { loading, user } = useAuth();
  if (loading) return <p className="container">Cargando…</p>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
            <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/cinema" element={<ModuleStatus module="Andalus Cinema" phase="Fases 02–06" live={["Gestión de proyectos privados y subida de PDF con extracción real de texto (tras iniciar sesión)."]} planned={["Ingesta narrativa avanzada", "Guion y Biblia Cinematográfica", "Generación audiovisual con motores reales"]} />} />
            <Route path="/community" element={<ModuleStatus module="Andalus Community" phase="Fase 08" live={[]} planned={["Perfiles públicos optativos", "Descubrimiento de artistas", "Equipos y colaboraciones"]} />} />
            <Route path="/festivals" element={<ModuleStatus module="Andalus Festivals" phase="Fase 09" live={[]} planned={["Concursos con reglas reales", "Jurados y rúbricas", "Organizadores verificados"]} />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/projects/:id" element={<RequireAuth><ProjectDetail /></RequireAuth>} />
            <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
