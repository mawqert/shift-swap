import { useEffect, useState } from 'react';
import { Table, Typography, Tag, message } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { SwapRequestDetails, SwapRequestStatus } from '@/entities/swap-request/types';
import { api } from '@/shared/api/api';
import { useAuth } from '@/shared/api/AuthContext';

dayjs.locale('ru');

const { Title } = Typography;

const STATUS_CONFIG: Record<SwapRequestStatus, { color: string; label: string }> = {
  PENDING_COLLEAGUE: { color: 'gold', label: 'Ожидает коллегу' },
  PENDING_MANAGER: { color: 'blue', label: 'Ожидает менеджера' },
  APPROVED: { color: 'green', label: 'Одобрено' },
  REJECTED: { color: 'red', label: 'Отклонено' },
};

export default function HistoryPage() {
  const [data, setData] = useState<SwapRequestDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const endpoint = user?.role === 'MANAGER' 
          ? '/swap-requests/manager/history' 
          : '/swap-requests/my-history';
          
        const [requestsRes, usersRes, shiftsRes] = await Promise.all([
          api.get(endpoint),
          api.get('/users'),
          api.get('/shifts')
        ]);

        const usersList = usersRes.data;
        const shiftsList = shiftsRes.data;

        const enrichedData = requestsRes.data.map((req: any) => ({
          ...req,
          requesterUser: req.requesterUser || usersList.find((u: any) => u.id === req.requesterUserId),
          targetUser: req.targetUser || usersList.find((u: any) => u.id === req.targetUserId),
          requesterShift: req.requesterShift || shiftsList.find((s: any) => s.id === req.requesterShiftId),
          targetShift: req.targetShift || shiftsList.find((s: any) => s.id === req.targetShiftId),
          manager: req.manager || usersList.find((u: any) => u.id === req.managerId)
        }));

        setData(enrichedData);
      } catch (error) {
        console.error(error);
        message.error('Не удалось загрузить историю замен');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user]);

  const formatShiftTime = (date?: string) => date ? dayjs(date).format('DD.MM dddd HH:mm') : '—';
  const formatCreatedAt = (date?: string) => date ? dayjs(date).format('DD.MM.YY HH:mm') : '—';

  const columns = [
    { 
      title: 'Дата заявки', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: formatCreatedAt
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
    { 
      title: 'Итоговый статус', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: SwapRequestStatus) => (
        <Tag color={STATUS_CONFIG[status]?.color || 'default'}>
          {STATUS_CONFIG[status]?.label || status}
        </Tag>
      )
    },
    { 
      title: 'Менеджер', 
      dataIndex: ['manager', 'fullName'], 
      key: 'managerName',
      render: (name?: string) => name || '—'
    },
  ];

  return (
    <>
      <Title level={2} style={{ marginTop: 0 }}>История замен</Title>
      <Table 
        dataSource={data} 
        columns={columns} 
        pagination={false} 
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 'max-content', y: 'calc(100vh - 240px)' }} 
      />
    </>
  );
}