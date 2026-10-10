import { Layout, Menu, Typography, Button} from 'antd';
import {
  CalendarOutlined,
  SwapOutlined,
  CheckSquareOutlined,
  HistoryOutlined,
  PlusCircleOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/api/AuthContext'; 

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { key: '/schedule', icon: <CalendarOutlined />, label: 'График дежурств' },
    ...(user.role === 'EMPLOYEE' ? [
      { key: '/requests', icon: <SwapOutlined />, label: 'Мои запросы' }
    ] : []),
    ...(user.role === 'MANAGER' ? [
      { key: '/manager', icon: <CheckSquareOutlined />, label: 'Подтверждение' },
      { key: '/create-shift', icon: <PlusCircleOutlined />, label: 'Создать смену' }
    ] : []),
    { key: '/history', icon: <HistoryOutlined />, label: 'История замен' },
  ];

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider theme="light" width={250} breakpoint="md" collapsedWidth="0">
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <Title level={5} style={{ margin: 0, color: '#000000' }}>Система обмена сменами</Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}></Title>
          

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
              <div style={{ fontWeight: 600 }}>{user.fullName}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {user.role === 'MANAGER' ? 'Менеджер' : 'Сотрудник'}
              </Text>
            </div>
            <Button 
              type="text" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={logout}
            >
              Выйти
            </Button>
          </div>
        </Header>
        
        <Content style={{ margin: '16px', padding: 16, background: '#fff', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}