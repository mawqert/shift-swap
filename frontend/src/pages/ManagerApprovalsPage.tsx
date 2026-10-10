import { useEffect, useState } from 'react';
import { Table, Typography, Button, Space, message, Tag } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { SwapRequestDetails } from '@/entities/swap-request/types';
import { api } from '@/shared/api/api';

dayjs.locale('ru');

const { Title } = Typography;

export default function ManagerApprovalsPage() {
  const [requests, setRequests] = useState<SwapRequestDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveRequests = async () => {
    setIsLoading(true);
    try {
      const [requestsRes, usersRes, shiftsRes] = await Promise.all([
        api.get('/swap-requests/manager/active'),
        api.get('/users'),
        api.get('/shifts')
      ]);

      const users = usersRes.data;
      const shifts = shiftsRes.data;

      const enrichedRequests = requestsRes.data.map((req: any) => ({
        ...req,
        requesterUser: req.requesterUser || users.find((u: any) => u.id === req.requesterUserId),
        targetUser: req.targetUser || users.find((u: any) => u.id === req.targetUserId),
        requesterShift: req.requesterShift || shifts.find((s: any) => s.id === req.requesterShiftId),
        targetShift: req.targetShift || shifts.find((s: any) => s.id === req.targetShiftId),
      }));

      setRequests(enrichedRequests);
    } catch (error) {
      console.error(error);
      message.error('Не удалось загрузить заявки');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRequests();
  }, []);

  const handleDecision = async (id: number, accept: boolean) => {
    try {
      await api.post(`/swap-requests/${id}/resolve`, { accept });
      message.success(accept ? 'Обмен сменами успешно одобрен' : 'Обмен сменами отклонен');
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Ошибка при обработке запроса';
      message.error(errorMsg);
    }
  };

  const formatDate = (date?: string) => date ? dayjs(date).format('DD.MM.YY HH:mm') : '—';
  const formatShiftTime = (date?: string) => date ? dayjs(date).format('DD.MM dddd HH:mm') : '—';

  const columns = [
    { 
      title: 'Дата заявки', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: formatDate
    },
    { 
      title: 'Инициатор', 
      dataIndex: ['requesterUser', 'fullName'], 
      key: 'requesterName',
      render: (name?: string) => name || 'Неизвестно'
    },
    { 
      title: 'Смена инициатора', 
      dataIndex: ['requesterShift', 'startTime'], 
      key: 'requesterShiftTime',
      render: formatShiftTime
    },
    { 
      title: 'Заменяющий (Согласен)', 
      dataIndex: ['targetUser', 'fullName'], 
      key: 'targetName',
      render: (name?: string) => name || 'Неизвестно'
    },
    { 
      title: 'Смена заменяющего', 
      dataIndex: ['targetShift', 'startTime'], 
      key: 'targetShiftTime',
      render: formatShiftTime
    },
    { 
      title: 'Статус', 
      dataIndex: 'status', 
      key: 'status',
      render: () => <Tag color="blue">Ожидает менеджера</Tag>
    },
    { 
      title: 'Решение', 
      key: 'action',
      render: (_: any, record: SwapRequestDetails) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleDecision(record.id, true)}>
            Одобрить
          </Button>
          <Button danger size="small" onClick={() => handleDecision(record.id, false)}>
            Отклонить
          </Button>
        </Space>
      )
    },
  ];

  return (
    <>
      <Title level={2} style={{ marginTop: 0 }}>Панель подтверждения</Title>
      <Table 
        dataSource={requests} 
        columns={columns} 
        pagination={false} 
        rowKey="id"
        loading={isLoading}
        locale={{ emptyText: 'Нет заявок, ожидающих вашего решения' }}
        scroll={{ x: 'max-content', y: 'calc(100vh - 240px)' }} 
      />
    </>
  );
}