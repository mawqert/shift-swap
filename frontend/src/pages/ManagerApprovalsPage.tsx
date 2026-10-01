import { Table, Typography } from 'antd';

const { Title } = Typography;

export default function ManagerApprovalsPage() {
  const columns = [
    { title: 'Дата заявки', dataIndex: 'createdAt', key: 'createdAt' },
    { title: 'Инициатор', dataIndex: ['requesterShift', 'user', 'fullName'], key: 'requesterName' },
    { title: 'Смена инициатора', dataIndex: ['requesterShift', 'startTime'], key: 'requesterShiftTime' },
    { title: 'Заменяющий (Согласен)', dataIndex: ['targetShift', 'user', 'fullName'], key: 'targetName' },
    { title: 'Смена заменяющего', dataIndex: ['targetShift', 'startTime'], key: 'targetShiftTime' },
    { title: 'Статус', dataIndex: 'status', key: 'status' },
    { title: 'Решение', key: 'action' },
  ];

  return (
    <>
      <Title level={2} style={{ marginTop: 0 }}>Панель подтверждения</Title>
      <Table 
        dataSource={[]} 
        columns={columns} 
        pagination={false} 
        rowKey="id"
        scroll={{ x: 'max-content', y: 'calc(100vh - 240px)' }} 
      />
    </>
  );
}