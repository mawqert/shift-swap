import { useState } from 'react';
import { Table, Typography, Button, Space, message, Tag } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { SwapRequestDetails, SwapRequestStatus } from '@/entities/swap-request/types';

dayjs.locale('ru');

const { Title } = Typography;

export default function ManagerApprovalsPage() {
  const today = dayjs();

  const [requests, setRequests] = useState<SwapRequestDetails[]>([
    {
      id: 1,
      requesterUserId: 101,
      targetUserId: 103,
      requesterUser: { id: 101, email: 'ivanov@test.com', fullName: 'Иванов Иван', role: 'EMPLOYEE' },
      targetUser: { id: 103, email: 'sidorov@test.com', fullName: 'Сидоров Сидор', role: 'EMPLOYEE' },
      requesterShiftId: 201,
      targetShiftId: 202,
      requesterShift: { id: 201, userId: 101, startTime: today.add(1, 'day').hour(9).minute(0).format(), endTime: today.add(1, 'day').hour(21).minute(0).format() },
      targetShift: { id: 202, userId: 103, startTime: today.add(2, 'day').hour(9).minute(0).format(), endTime: today.add(2, 'day').hour(21).minute(0).format() },
      status: 'PENDING_MANAGER',
      managerId: null,
      createdAt: today.subtract(2, 'hour').format(),
    },
    {
      id: 2,
      requesterUserId: 104,
      targetUserId: 105,
      requesterUser: { id: 104, email: 'smirnov@test.com', fullName: 'Смирнов Алексей', role: 'EMPLOYEE' },
      targetUser: { id: 105, email: 'kuznetsov@test.com', fullName: 'Кузнецов Михаил', role: 'EMPLOYEE' },
      requesterShiftId: 203,
      targetShiftId: 204,
      requesterShift: { id: 203, userId: 104, startTime: today.add(7, 'day').hour(8).minute(0).format(), endTime: today.add(7, 'day').hour(20).minute(0).format() },
      targetShift: { id: 204, userId: 105, startTime: today.add(8, 'day').hour(8).minute(0).format(), endTime: today.add(8, 'day').hour(20).minute(0).format() },
      status: 'PENDING_MANAGER',
      managerId: null,
      createdAt: today.subtract(1, 'day').format(),
    }
  ]);

  const handleDecision = (id: number, decision: SwapRequestStatus) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    
    if (decision === 'APPROVED') {
      message.success('Обмен сменами успешно одобрен');
    } else {
      message.warning('Обмен сменами отклонен');
    }
  };

  const formatDate = (date: string) => dayjs(date).format('DD.MM.YY HH:mm');
  const formatShiftTime = (date: string) => dayjs(date).format('DD.MM dddd HH:mm');

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
      key: 'requesterName' 
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
      key: 'targetName' 
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
      render: (status: string) => <Tag color="blue">Ожидает менеджера</Tag>
    },
    { 
      title: 'Решение', 
      key: 'action',
      render: (_: any, record: SwapRequestDetails) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleDecision(record.id, 'APPROVED')}
          >
            Одобрить
          </Button>
          <Button 
            danger 
            size="small"
            onClick={() => handleDecision(record.id, 'REJECTED')}
          >
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
        locale={{ emptyText: 'Нет заявок, ожидающих вашего решения' }}
        scroll={{ x: 'max-content', y: 'calc(100vh - 240px)' }} 
      />
    </>
  );
}