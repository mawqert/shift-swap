import { useState } from 'react';
import { Form, Select, DatePicker, Button, message, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { User } from '@/entities/user/types';
import type { ShiftWithUser } from '@/entities/shift/types';

dayjs.extend(isBetween);

const { Title } = Typography;
const { RangePicker } = DatePicker;

const mockEmployees: User[] = [
  { id: 101, email: 'ivanov@test.com', fullName: 'Иванов Иван', role: 'EMPLOYEE' },
  { id: 102, email: 'petrov@test.com', fullName: 'Петров Петр', role: 'EMPLOYEE' },
  { id: 103, email: 'sidorov@test.com', fullName: 'Сидоров Сидор', role: 'EMPLOYEE' },
  { id: 104, email: 'sidelnikov@test.com', fullName: 'Сидельников Антон', role: 'EMPLOYEE' },
  { id: 105, email: 'smirnov@test.com', fullName: 'Смирнов Алексей', role: 'EMPLOYEE' },
  { id: 106, email: 'kuznetsov@test.com', fullName: 'Кузнецов Михаил', role: 'EMPLOYEE' },
  { id: 107, email: 'popov@test.com', fullName: 'Попов Дмитрий', role: 'EMPLOYEE' },
  { id: 108, email: 'vasiliev@test.com', fullName: 'Васильев Василий', role: 'EMPLOYEE' },
];

const mockExistingShifts: ShiftWithUser[] = [
  {
    id: 1,
    userId: 101,
    startTime: dayjs().add(1, 'day').hour(9).minute(0).second(0).format(),
    endTime: dayjs().add(1, 'day').hour(21).minute(0).second(0).format(),
  }
];

interface FormValues {
  userId: number;
  timeRange: [Dayjs, Dayjs];
}

export function CreateShiftForm() {
  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchValue, setSearchValue] = useState('');

  const validateShiftOverlap = (_: any, value: [Dayjs, Dayjs]) => {
    if (!value || value.length !== 2) return Promise.resolve();

    const [newStart, newEnd] = value;
    const selectedUserId = form.getFieldValue('userId');

    if (!selectedUserId) return Promise.resolve(); 

    const userShifts = mockExistingShifts.filter(shift => shift.userId === selectedUserId);

    for (const shift of userShifts) {
      const existingStart = dayjs(shift.startTime);
      const existingEnd = dayjs(shift.endTime);

      const isOverlapping = 
        newStart.isBetween(existingStart, existingEnd, null, '[)') || 
        newEnd.isBetween(existingStart, existingEnd, null, '(]') ||   
        existingStart.isBetween(newStart, newEnd, null, '[)') ||       
        existingEnd.isBetween(newStart, newEnd, null, '(]');

      if (isOverlapping) {
        return Promise.reject(new Error(`Конфликт! У пользователя уже есть смена: ${existingStart.format('DD.MM HH:mm')} - ${existingEnd.format('HH:mm')}`));
      }
    }

    return Promise.resolve();
  };

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    const payload = {
      userId: values.userId,
      startTime: values.timeRange[0].format(),
      endTime: values.timeRange[1].format(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      message.success('Смена успешно создана!');
      form.resetFields(); 
      setSearchValue('');
    }, 800);
  };

  const filteredOptions = mockEmployees
    .filter(emp => emp.fullName.toLowerCase().includes(searchValue.toLowerCase()))
    .map(emp => ({
      value: emp.id,
      label: emp.fullName
    }));

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '600px' }}>
      <Title level={3} style={{ marginTop: 0, marginBottom: '24px' }}>Назначение новой смены</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        <Form.Item
          name="userId"
          label="Сотрудник"
          rules={[{ required: true, message: 'Пожалуйста, выберите сотрудника' }]}
        >
          <Select 
            placeholder="Выберите сотрудника"
            showSearch
            listHeight={160}
            filterOption={false}
            onSearch={(value) => setSearchValue(value)}
            onBlur={() => setSearchValue('')}
            options={filteredOptions}
            onChange={() => form.validateFields(['timeRange'])} 
          />
        </Form.Item>

        <Form.Item
          name="timeRange"
          label="Дата и время смены"
          dependencies={['userId']} 
          rules={[
            { required: true, message: 'Пожалуйста, укажите время начала и окончания' },
            { validator: validateShiftOverlap } 
          ]}
        >
          <RangePicker 
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            placeholder={['Начало смены', 'Конец смены']}
          />
        </Form.Item>

        <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Создать смену
            </Button>
            <Button htmlType="button" onClick={() => {
              form.resetFields();
              setSearchValue('');
            }}>
              Сбросить
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}