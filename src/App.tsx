import {
  AuthProvider,
  useAuth,
} from "../components/AuthContext";
import { LoginPage } from "../components/LoginPage";
import { ResidueDashboard } from "../components/ResidueDashboard";
import { LogoLogisamb } from "../components/LogoLogisamb";
import { JSONDebugger } from "../components/JSONDebugger";
import { Toaster } from "../components/ui/sonner";

function AppContent() {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-green-900 dark:to-blue-900">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo animado */}
          <div className="animate-pulse">
            <LogoLogisamb variant="full" size="xl" />
          </div>

          {/* Indicador de carga */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-1 bg-gradient-to-r from-green-200 to-blue-200 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-foreground">
                Iniciando Portal LOGISAMB
              </p>
              <p className="text-sm text-muted-foreground">
                Sistema de Gestión Integral de Residuos
              </p>
              <p className="text-xs text-muted-foreground">
                Cargando datos del cliente...
              </p>
            </div>
          </div>

          {/* Features destacadas */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground max-w-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Gestión por Sucursales</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Reportes Integrados</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Datos Seguros</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>Control Total</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {usuario ? <ResidueDashboard /> : <LoginPage />}
      <JSONDebugger />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </AuthProvider>
  );
}