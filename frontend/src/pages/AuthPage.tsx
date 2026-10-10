import { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message } from 'antd';
import { api } from '@/shared/api/api';
import { useAuth } from '@/shared/api/AuthContext';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (activeTab === 'login') {
        const response = await api.post('/users/login', values);
        login(response.data.accessToken, response.data.refreshToken, response.data.user);
        message.success('Успешный вход!');
      } else {
        await api.post('/users/register', values);
        message.success('Регистрация успешна! Теперь войдите.');
        setActiveTab('login');
      }
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Система обмена сменами</h2>
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <Tabs.TabPane tab="Вход" key="login" />
          <Tabs.TabPane tab="Регистрация" key="register" />
        </Tabs>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          {activeTab === 'register' && (
            <Form.Item label="ФИО" name="fullName" rules={[{ required: true, message: 'Введите ФИО' }]}>
              <Input placeholder="Иванов Иван" />
            </Form.Item>
          )}
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Введите корректный email' }]}>
            <Input placeholder="test@test.com" />
          </Form.Item>
          <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
            <Input.Password placeholder="********" />
          </Form.Item>
          
          <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ marginTop: 16 }}>
            {activeTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </Form>
      </Card>
    </div>
  );
}