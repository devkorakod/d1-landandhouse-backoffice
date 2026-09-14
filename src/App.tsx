import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { PropertiesListPage } from '@/pages/PropertiesList';
import { PropertyFormPage } from '@/pages/PropertyForm';
import { ProjectsListPage } from '@/pages/ProjectsList';
import { LeadsPage } from '@/pages/Leads';
import { PromotionsPage } from '@/pages/Promotions';
import { SettingsPage } from '@/pages/Settings';
import { UsersPage } from '@/pages/Users';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesListPage />} />
        <Route path="/properties/:id" element={<PropertyFormPage />} />
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}
