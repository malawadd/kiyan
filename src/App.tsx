import { Toaster } from "sonner";
import { TomoProvider } from "./TomoProvider";
import { AuthProvider, useAuth } from "./WalletAuthProvider";
import { WalletSignInForm } from "./WalletSignInForm";
import { AuthenticatedApp } from "./AuthenticatedApp";
import { BrowserRouter as Router } from "react-router-dom";

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <WalletSignInForm />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <Router>
      <TomoProvider>
        <AuthProvider>
          <div className="min-h-screen nb-grid-bg">
            <AppContent />
            <Toaster />
          </div>
        </AuthProvider>
      </TomoProvider>
    </Router>
  );
}
