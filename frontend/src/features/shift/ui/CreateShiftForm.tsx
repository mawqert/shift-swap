import { useState, useEffect, useMemo } from 'react';
import { Form, Select, DatePicker, Button, message, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { User } from '@/entities/user/types';
import type { ShiftWithUser } from '@/entities/shift/types';
import { api } from '@/shared/api/api';

dayjs.extend(isBetween);

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface FormValues {
  userId: number;
  timeRange: [Dayjs, Dayjs];
}

export function CreateShiftForm() {
  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchValue, setSearchValue] = useState('');
  
  const [employees, setEmployees] = useState<User[]>([]);
  const [existingShifts, setExistingShifts] = useState<ShiftWithUser[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [usersRes, shiftsRes] = await Promise.all([
          api.get('/users'),
          api.get('/shifts')
        ]);
        
        setEmployees(usersRes.data);
        setExistingShifts(shiftsRes.data);
      } catch (error) {
        message.error('Не удалось загрузить данные для формы');
        console.error(error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const validateShiftOverlap = (_: any, value: [Dayjs, Dayjs]) => {
    if (!value || value.length !== 2) return Promise.resolve();

    const [newStart, newEnd] = value;
    const selectedUserId = form.getFieldValue('userId');

    if (!selectedUserId) return Promise.resolve(); 

    const userShifts = existingShifts.filter(shift => shift.userId === selectedUserId);

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
      startTime: values.timeRange[0].toISOString(),
      endTime: values.timeRange[1].toISOString(),
    };

    try {
      const response = await api.post('/shifts', payload); 
      
      message.success('Смена успешно создана!');
      form.resetFields(); 
      setSearchValue('');
      
      setExistingShifts(prev => [...prev, response.data]);
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Ошибка при создании смены';
      message.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOptions = useMemo(() => {
    return employees
      .filter(emp => emp.fullName.toLowerCase().includes(searchValue.toLowerCase()))
      .map(emp => ({
        value: emp.id,
        label: emp.fullName
      }));
  }, [employees, searchValue]);

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
            loading={isLoadingData}
            disabled={isLoadingData}
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
            disabled={isLoadingData}
          />
        </Form.Item>

        <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={isLoadingData}>
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