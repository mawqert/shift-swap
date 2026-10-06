import { useEffect, useState } from 'react';
import { Table, Typography, Tag, message } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { SwapRequestDetails, SwapRequestStatus } from '@/entities/swap-request/types';
import type { User } from '@/entities/user/types';

dayjs.locale('ru');

const { Title } = Typography;

const MOCK_CURRENT_USER: User = {
  id: 101,
  email: 'ivanov@test.com',
  fullName: 'Иванов Иван',
  role: 'MANAGER',
};

const MOCK_DATA: SwapRequestDetails[] = [
  {
    id: 1,
    requesterShiftId: 201,
    targetShiftId: 202,
    requesterUserId: 102,
    targetUserId: 101,
    status: 'APPROVED',
    managerId: 105,
    createdAt: '2026-11-05T10:30:00',
    requesterUser: { id: 102, email: 'petrov@test.com', fullName: 'Петров Петр', role: 'EMPLOYEE' },
    targetUser: { id: 101, email: 'ivanov@test.com', fullName: 'Иванов Иван', role: 'EMPLOYEE' },
    requesterShift: { id: 201, userId: 102, startTime: '2026-11-10T09:00:00', endTime: '2026-11-10T21:00:00' },
    targetShift: { id: 202, userId: 101, startTime: '2026-11-12T09:00:00', endTime: '2026-11-12T21:00:00' },
    manager: { id: 105, email: 'boss@test.com', fullName: 'Смирнова Анна', role: 'MANAGER' },
  },
  {
    id: 2,
    requesterShiftId: 203,
    targetShiftId: 204,
    requesterUserId: 103,
    targetUserId: 104,
    status: 'REJECTED',
    managerId: 105,
    createdAt: '2026-11-06T14:20:00',
    requesterUser: { id: 103, email: 'sidorov@test.com', fullName: 'Сидоров Сидор', role: 'EMPLOYEE' },
    targetUser: { id: 104, email: 'smirnov@test.com', fullName: 'Смирнов Алексей', role: 'EMPLOYEE' },
    requesterShift: { id: 203, userId: 103, startTime: '2026-11-15T09:00:00', endTime: '2026-11-15T21:00:00' },
    targetShift: { id: 204, userId: 104, startTime: '2026-11-16T09:00:00', endTime: '2026-11-16T21:00:00' },
    manager: { id: 105, email: 'boss@test.com', fullName: 'Смирнова Анна', role: 'MANAGER' },
  },
];

const STATUS_CONFIG: Record<SwapRequestStatus, { color: string; label: string }> = {
  PENDING_COLLEAGUE: { color: 'gold', label: 'Ожидает коллегу' },
  PENDING_MANAGER: { color: 'blue', label: 'Ожидает менеджера' },
  APPROVED: { color: 'green', label: 'Одобрено' },
  REJECTED: { color: 'red', label: 'Отклонено' },
};

export default function HistoryPage() {
  const [data, setData] = useState<SwapRequestDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = () => {
      setIsLoading(true);
      
      setTimeout(() => {
        try {
          const result = MOCK_DATA.filter((request) => {
            if (MOCK_CURRENT_USER.role === 'MANAGER') return true;
            return (
              request.requesterUserId === MOCK_CURRENT_USER.id ||
              request.targetUserId === MOCK_CURRENT_USER.id
            );
          });
          
          setData(result);
        } catch (error) {
          message.error('Не удалось загрузить историю замен');
        } finally {
          setIsLoading(false);
        }
      }, 600);
    };

    fetchHistory();
  }, []);

  const formatShiftTime = (date: string) => dayjs(date).format('DD.MM dddd HH:mm');

  const columns = [
    { 
      title: 'Дата заявки', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (dateStr: string) => dayjs(dateStr).format('DD.MM.YY HH:mm')
    },
    { 
      title: 'Инициатор', 
      dataIndex: ['requesterUser', 'fullName'], 
      key: 'requesterName' 
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
      key: 'targetName' 
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
        <Tag color={STATUS_CONFIG[status].color}>
          {STATUS_CONFIG[status].label}
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