import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { ScrollToTop } from "../components/layout/scroll-to-top";
import { ProximoLandingPage } from "../pages/public/proximo-landing-page";
import { ProximoLoginPage, ProximoWorkspacePage, ProximoNewDossierPage } from "../pages/public/proximo-workspace-page";

function Protected({children}:{children:React.ReactNode}) {
  const {user,isLoading}=useAuth();
  if(isLoading)return <div className="proximo-ui min-h-screen p-8 text-white">Chargement...</div>;
  if(!user)return <Navigate to="/connexion" replace/>;
  return children;
}
export function AppRouter() {
  return <BrowserRouter>
    <ScrollToTop/>
    <Routes>
      <Route index element={<ProximoLandingPage/>}/>
      <Route path="connexion" element={<ProximoLoginPage/>}/>
      <Route path="espace" element={<Protected><ProximoWorkspacePage/></Protected>}/>
      <Route path="dossiers/nouveau" element={<Protected><ProximoNewDossierPage/></Protected>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </BrowserRouter>;
}
