import { Table, Typography } from 'antd';

const { Title } = Typography;

export default function HistoryPage() {
  const columns = [
    { title: 'Дата заявки', dataIndex: 'createdAt', key: 'createdAt' },
    { title: 'Инициатор', dataIndex: ['requesterShift', 'user', 'fullName'], key: 'requesterName' },
    { title: 'Заменяющий', dataIndex: ['targetShift', 'user', 'fullName'], key: 'targetName' },
    { title: 'Итоговый статус', dataIndex: 'status', key: 'status' },
    { title: 'Менеджер', dataIndex: ['manager', 'fullName'], key: 'managerName' },
  ];

  return (
    <>
      <Title level={2} style={{ marginTop: 0 }}>История замен</Title>
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