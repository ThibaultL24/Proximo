// src/app/router.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { PublicLayout } from "../components/layout/public-layout";
import { useAuth } from "../hooks/use-auth";
import { LoginPage } from "../pages/auth/login-page";
import { AdminAnalyticsPage } from "../pages/admin/admin-analytics-page";
import { AdminArticleFormPage } from "../pages/admin/admin-article-form-page";
import { AdminArticlesPage } from "../pages/admin/admin-articles-page";
import { AdminCommissionsPage } from "../pages/admin/admin-commissions-page";
import { AdminDashboardPage } from "../pages/admin/admin-dashboard-page";
import { AdminImmoArticlesPage } from "../pages/admin/admin-immo-articles-page";
import { AdminLeadsPage } from "../pages/admin/admin-leads-page";
import { AdminMerchantFormPage } from "../pages/admin/admin-merchant-form-page";
import { AdminMerchantsPage } from "../pages/admin/admin-merchants-page";
import { MerchantDashboardPage } from "../pages/merchant/merchant-dashboard-page";
import { MerchantShopPage } from "../pages/merchant/merchant-shop-page";
import { NewLeadPage } from "../pages/merchant/new-lead-page";
import { ArticlePage } from "../pages/public/article-page";
import { DirectoryPage } from "../pages/public/directory-page";
import { GazettePage } from "../pages/public/gazette-page";
import { HomePage } from "../pages/public/home-page";
import { ImmoArticlesPage } from "../pages/public/immo-articles-page";
import { MerchantProfilePage } from "../pages/public/merchant-profile-page";
import { QrMerchantPage } from "../pages/public/qr-merchant-page";

function ProtectedLayout({ role }: { role: "admin" | "merchant" }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p className="p-8 text-ink-muted">Chargement...</p>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <DashboardLayout kind={role} />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="annuaire" element={<DirectoryPage />} />
          <Route path="annuaire/:region" element={<DirectoryPage />} />
          <Route path="annuaire/:region/:department" element={<DirectoryPage />} />
          <Route path="annuaire/:region/:department/:city" element={<DirectoryPage />} />
          <Route path="annuaire/:region/:department/:city/:district" element={<DirectoryPage />} />
          <Route path="commercants/:slug" element={<MerchantProfilePage />} />
          <Route path="qr/:token" element={<QrMerchantPage />} />
          <Route path="gazette/territoire/:region/:department/:city/:district" element={<GazettePage />} />
          <Route path="gazette/territoire/:region/:department/:city" element={<GazettePage />} />
          <Route path="gazette/territoire/:region/:department" element={<GazettePage />} />
          <Route path="gazette/territoire/:region" element={<GazettePage />} />
          <Route path="gazette/immo" element={<ImmoArticlesPage />} />
          <Route path="gazette" element={<GazettePage />} />
          <Route path="gazette/:slug" element={<ArticlePage />} />
          <Route path="connexion" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedLayout role="merchant" />}>
          <Route path="espace-commercant" element={<MerchantDashboardPage />} />
          <Route path="espace-commercant/ma-fiche" element={<MerchantShopPage />} />
          <Route path="espace-commercant/leads/nouveau" element={<NewLeadPage />} />
        </Route>

        <Route element={<ProtectedLayout role="admin" />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="admin/leads" element={<AdminLeadsPage />} />
          <Route path="admin/commissions" element={<AdminCommissionsPage />} />
          <Route path="admin/commercants" element={<AdminMerchantsPage />} />
          <Route path="admin/commercants/nouveau" element={<AdminMerchantFormPage />} />
          <Route path="admin/commercants/:id/modifier" element={<AdminMerchantFormPage />} />
          <Route path="admin/articles" element={<AdminArticlesPage />} />
          <Route path="admin/articles/nouveau" element={<AdminArticleFormPage editorialScope="gazette" />} />
          <Route path="admin/articles/:id/modifier" element={<AdminArticleFormPage editorialScope="gazette" />} />
          <Route path="admin/immo" element={<AdminImmoArticlesPage />} />
          <Route path="admin/immo/nouveau" element={<AdminArticleFormPage editorialScope="immo" />} />
          <Route path="admin/immo/:id/modifier" element={<AdminArticleFormPage editorialScope="immo" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
