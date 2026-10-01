import { Table, Typography } from 'antd';

const { Title } = Typography;

export default function RequestsPage() {
  const columns = [
    { title: 'Дата создания', dataIndex: 'createdAt', key: 'createdAt' },
    { title: 'Инициатор', dataIndex: ['requesterShift', 'user', 'fullName'], key: 'requesterName' },
    { title: 'Его смена', dataIndex: ['requesterShift', 'startTime'], key: 'requesterShiftTime' },
    { title: 'Заменяющий', dataIndex: ['targetShift', 'user', 'fullName'], key: 'targetName' },
    { title: 'Смена заменяющего', dataIndex: ['targetShift', 'startTime'], key: 'targetShiftTime' },
    { title: 'Статус', dataIndex: 'status', key: 'status' },
    { title: 'Действия', key: 'action' },
  ];

  return (
    <>
      <Title level={2} style={{ marginTop: 0 }}>Мои запросы на обмен</Title>
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