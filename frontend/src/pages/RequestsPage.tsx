import { useEffect, useState } from 'react';
import { Table, Typography, Button, Space, Tag, message, Tabs } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { SwapRequestDetails, SwapRequestStatus } from '@/entities/swap-request/types';
import { api } from '@/shared/api/api';

dayjs.locale('ru');

const { Title } = Typography;

export default function RequestsPage() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [requests, setRequests] = useState<SwapRequestDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const userRes = await api.get('/users/me');
      const userId = userRes.data.id;
      setCurrentUserId(userId);

      const [requestsRes, usersRes, shiftsRes] = await Promise.all([
        api.get('/swap-requests/my-history'),
        api.get('/users'),
        api.get('/shifts')
      ]);

      const usersList = usersRes.data;
      const shiftsList = shiftsRes.data;

      const enrichedRequests = requestsRes.data.map((req: any) => ({
        ...req,
        requesterUser: req.requesterUser || usersList.find((u: any) => u.id === req.requesterUserId),
        targetUser: req.targetUser || usersList.find((u: any) => u.id === req.targetUserId),
        requesterShift: req.requesterShift || shiftsList.find((s: any) => s.id === req.requesterShiftId),
        targetShift: req.targetShift || shiftsList.find((s: any) => s.id === req.targetShiftId),
      }));

      const activeRequests = enrichedRequests.filter((req: SwapRequestDetails) => 
        req.status === 'PENDING_COLLEAGUE' || req.status === 'PENDING_MANAGER'
      );

      setRequests(activeRequests);
    } catch (error) {
      console.error(error);
      message.error('Не удалось загрузить ваши запросы');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id: number, action: 'ACCEPT' | 'REJECT' | 'CANCEL') => {
    try {
      if (action === 'CANCEL') {
        await api.delete(`/swap-requests/${id}`);
        message.success('Запрос отменен');
      } else {
        const isAccept = action === 'ACCEPT';
        await api.post(`/swap-requests/${id}/respond`, { accept: isAccept });
        message.success(isAccept ? 'Вы согласились на замену' : 'Вы отклонили замену');
      }

      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Ошибка при обработке запроса';
      message.error(errorMsg);
    }
  };

  const formatDate = (date?: string) => date ? dayjs(date).format('DD.MM.YY HH:mm') : '—';
  const formatShiftTime = (date?: string) => date ? dayjs(date).format('DD.MM dddd HH:mm') : '—';

  const renderStatus = (status: SwapRequestStatus) => {
    const config: Record<SwapRequestStatus, { color: string, text: string }> = {
      PENDING_COLLEAGUE: { color: 'gold', text: 'Ожидает коллегу' },
      PENDING_MANAGER: { color: 'blue', text: 'Ожидает менеджера' },
      APPROVED: { color: 'green', text: 'Одобрено' },
      REJECTED: { color: 'red', text: 'Отклонено' },
    };
    return <Tag color={config[status]?.color || 'default'}>{config[status]?.text || status}</Tag>;
  };

  const baseColumns = [
    { title: 'Дата создания', dataIndex: 'createdAt', key: 'createdAt', render: formatDate },
    { 
      title: 'Инициатор', 
      dataIndex: ['requesterUser', 'fullName'], 
      key: 'requesterName',
      render: (name?: string) => name || 'Неизвестно'
    },
    { 
      title: 'Его смена', 
      dataIndex: ['requesterShift', 'startTime'], 
      key: 'requesterShiftTime', 
      render: formatShiftTime 
    },
    { 
      title: 'Заменяющий', 
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
    { title: 'Статус', dataIndex: 'status', key: 'status', render: renderStatus },
  ];

  const incomingColumns = [
    ...baseColumns,
    {
      title: 'Действия',
      key: 'action',
      render: (_: any, record: SwapRequestDetails) => {
        if (record.status === 'PENDING_COLLEAGUE') {
          return (
            <Space>
              <Button type="primary" size="small" onClick={() => handleAction(record.id, 'ACCEPT')}>
                Принять
              </Button>
              <Button danger size="small" onClick={() => handleAction(record.id, 'REJECT')}>
                Отклонить
              </Button>
            </Space>
          );
        }
        return <Typography.Text type="secondary">—</Typography.Text>;
      }
    }
  ];

  const outgoingColumns = [
    ...baseColumns,
    {
      title: 'Действия',
      key: 'action',
      render: (_: any, record: SwapRequestDetails) => {
        if (record.status === 'PENDING_COLLEAGUE' || record.status === 'PENDING_MANAGER') {
          return (
            <Button danger type="text" size="small" onClick={() => handleAction(record.id, 'CANCEL')}>
              Отозвать
            </Button>
          );
        }
        return <Typography.Text type="secondary">—</Typography.Text>;
      }
    }
  ];

  const incomingRequests = currentUserId 
    ? requests.filter(req => req.targetUserId === currentUserId) 
    : [];
    
  const outgoingRequests = currentUserId 
    ? requests.filter(req => req.requesterUserId === currentUserId) 
    : [];

  return (
    <>
      <Title level={2} style={{ marginTop: 0 }}>Мои запросы на обмен</Title>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: 'Входящие',
            children: (
              <Table 
                dataSource={incomingRequests} 
                columns={incomingColumns} 
                pagination={false} 
                rowKey="id"
                loading={isLoading}
                locale={{ emptyText: 'Нет активных входящих запросов' }}
                scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }} 
              />
            ),
          },
          {
            key: '2',
            label: 'Исходящие',
            children: (
              <Table 
                dataSource={outgoingRequests} 
                columns={outgoingColumns} 
                pagination={false} 
                rowKey="id"
                loading={isLoading}
                locale={{ emptyText: 'Нет активных исходящих запросов' }}
                scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }} 
              />
            ),
          },
        ]}
      />
    </>
  );
}