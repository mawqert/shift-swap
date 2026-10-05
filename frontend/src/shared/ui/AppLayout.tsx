import { Layout, Menu, Typography } from 'antd';
import {
  CalendarOutlined,
  SwapOutlined,
  CheckSquareOutlined,
  HistoryOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/schedule', icon: <CalendarOutlined />, label: 'График дежурств' },
    { key: '/requests', icon: <SwapOutlined />, label: 'Мои запросы' },
    { key: '/manager', icon: <CheckSquareOutlined />, label: 'Подтверждение менеджером' },
    { key: '/create-shift', icon: <PlusCircleOutlined />, label: 'Создать смену' },
    { key: '/history', icon: <HistoryOutlined />, label: 'История замен' },
  ];

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider theme="light" width={250} breakpoint="md" collapsedWidth="0">
        <div style={{ height: '64px' }} />
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0 }}>Система обмена сменами</Title>
        </Header>
        <Content style={{ 
          margin: '16px', 
          padding: 16, 
          background: '#fff', 
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden' 
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}