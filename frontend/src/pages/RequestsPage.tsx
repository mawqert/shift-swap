import { useState } from 'react';
import { Table, Typography, Button, Space, Tag, message, Tabs } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { SwapRequestDetails, SwapRequestStatus } from '@/entities/swap-request/types';

dayjs.locale('ru');

const { Title } = Typography;

export default function RequestsPage() {
  const currentUserId = 101;

  const [requests, setRequests] = useState<SwapRequestDetails[]>([
    {
      id: 1,
      requesterUserId: 102,
      targetUserId: 101,
      requesterUser: { id: 102, email: 'petrov@test.com', fullName: 'Петров Петр', role: 'EMPLOYEE' },
      targetUser: { id: 101, email: 'ivanov@test.com', fullName: 'Иванов Иван', role: 'EMPLOYEE' },
      requesterShiftId: 201,
      targetShiftId: 202,
      requesterShift: { id: 201, userId: 102, startTime: '2026-11-10T09:00:00', endTime: '2026-11-10T21:00:00' },
      targetShift: { id: 202, userId: 101, startTime: '2026-11-12T09:00:00', endTime: '2026-11-12T21:00:00' },
      status: 'PENDING_COLLEAGUE',
      managerId: null,
      createdAt: '2026-11-05T10:30:00',
    },
    {
      id: 2,
      requesterUserId: 101,
      targetUserId: 103, 
      requesterUser: { id: 101, email: 'ivanov@test.com', fullName: 'Иванов Иван', role: 'EMPLOYEE' },
      targetUser: { id: 103, email: 'sidorov@test.com', fullName: 'Сидоров Сидор', role: 'EMPLOYEE' },
      requesterShiftId: 203,
      targetShiftId: 204,
      requesterShift: { id: 203, userId: 101, startTime: '2026-11-15T09:00:00', endTime: '2026-11-15T21:00:00' },
      targetShift: { id: 204, userId: 103, startTime: '2026-11-16T09:00:00', endTime: '2026-11-16T21:00:00' },
      status: 'PENDING_MANAGER',
      managerId: null,
      createdAt: '2026-11-04T15:20:00',
    }
  ]);

  const changeStatus = (id: number, newStatus: SwapRequestStatus | 'CANCELLED') => {
    if (newStatus === 'CANCELLED') {
      setRequests(prev => prev.filter(req => req.id !== id));
      message.success('Запрос отменен');
    } else {
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus as SwapRequestStatus } : req));
      message.success('Статус запроса обновлен');
    }
  };

  const formatDate = (date: string) => dayjs(date).format('DD.MM.YY HH:mm');
  const formatShiftTime = (date: string) => dayjs(date).format('DD.MM dddd HH:mm');

  const renderStatus = (status: SwapRequestStatus) => {
    const config: Record<SwapRequestStatus, { color: string, text: string }> = {
      PENDING_COLLEAGUE: { color: 'gold', text: 'Ожидает коллегу' },
      PENDING_MANAGER: { color: 'blue', text: 'Ожидает менеджера' },
      APPROVED: { color: 'green', text: 'Одобрено' },
      REJECTED: { color: 'red', text: 'Отклонено' },
    };
    return <Tag color={config[status].color}>{config[status].text}</Tag>;
  };

  const baseColumns = [
    { title: 'Дата создания', dataIndex: 'createdAt', key: 'createdAt', render: formatDate },
    { title: 'Инициатор', dataIndex: ['requesterUser', 'fullName'], key: 'requesterName' },
    { title: 'Его смена', dataIndex: ['requesterShift', 'startTime'], key: 'requesterShiftTime', render: formatShiftTime },
    { title: 'Заменяющий', dataIndex: ['targetUser', 'fullName'], key: 'targetName' },
    { title: 'Смена заменяющего', dataIndex: ['targetShift', 'startTime'], key: 'targetShiftTime', render: formatShiftTime },
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
              <Button type="primary" size="small" onClick={() => changeStatus(record.id, 'PENDING_MANAGER')}>
                Принять
              </Button>
              <Button danger size="small" onClick={() => changeStatus(record.id, 'REJECTED')}>
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
        if (record.status !== 'APPROVED' && record.status !== 'REJECTED') {
          return (
            <Button danger type="text" size="small" onClick={() => changeStatus(record.id, 'CANCELLED')}>
              Отозвать
            </Button>
          );
        }
        return <Typography.Text type="secondary">—</Typography.Text>;
      }
    }
  ];

  const incomingRequests = requests.filter(req => req.targetUserId === currentUserId);
  const outgoingRequests = requests.filter(req => req.requesterUserId === currentUserId);

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
                scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }} 
              />
            ),
          },
        ]}
      />
    </>
  );
}