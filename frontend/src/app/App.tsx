import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AppLayout from '@/shared/ui/AppLayout';
import SchedulePage from '@/pages/SchedulePage';
import RequestsPage from '@/pages/RequestsPage';
import AuthPage from '@/pages/AuthPage';
import ManagerApprovalsPage from '@/pages/ManagerApprovalsPage';
import HistoryPage from '@/pages/HistoryPage';
import CreateShiftPage from '@/pages/CreateShiftPage';
import { AuthProvider } from '@/shared/api/AuthContext';

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/schedule" replace />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="manager" element={<ManagerApprovalsPage />} />
            <Route path="create-shift" element={<CreateShiftPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
}