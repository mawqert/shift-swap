import { useState, useEffect } from 'react';
import { Modal, Form, Select, message, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import type { ShiftWithUser } from '@/entities/shift/types';
import { api } from '@/shared/api/api';

const { Text } = Typography;

interface CreateSwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetShift: ShiftWithUser | null; 
}

export function CreateSwapRequestModal({ isOpen, onClose, targetShift }: CreateSwapRequestModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMyShifts, setIsLoadingMyShifts] = useState(false);
  const [myShifts, setMyShifts] = useState<ShiftWithUser[]>([]);

  useEffect(() => {
    const fetchMyShifts = async () => {
      setIsLoadingMyShifts(true);
      try {
        const userRes = await api.get('/users/me');
        const currentUserId = userRes.data.id;

        const shiftsRes = await api.get('/shifts/user/' + currentUserId);
        
        setMyShifts(shiftsRes.data);
      } catch (error: any) {
        console.error(error);
        message.error('Не удалось загрузить ваши смены');
      } finally {
        setIsLoadingMyShifts(false);
      }
    };

    if (isOpen && targetShift) {
      fetchMyShifts();
    } else {
      form.resetFields();
      setMyShifts([]);
    }
  }, [isOpen, targetShift, form]);

  const handleSubmit = async (values: { myShiftId: number }) => {
    if (!targetShift) return;

    setIsSubmitting(true);
    
    const payload = {
      requesterShiftId: values.myShiftId,
      targetShiftId: targetShift.id
    };

    try {
      await api.post('/swap-requests', payload); 
      
      message.success('Запрос на замену успешно отправлен');
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Ошибка при отправке запроса';
      message.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Запрос на замену смены"
      open={isOpen}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isSubmitting}
      okText="Отправить запрос"
      cancelText="Отмена"
      destroyOnClose
    >
      {targetShift && (
        <div style={{ marginBottom: 24, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
          <Text strong>Желаемая смена коллеги:</Text>
          <div style={{ marginTop: 8 }}>
            <Text>{targetShift.user?.fullName}</Text>
            <br />
            <Text type="secondary">
              {dayjs(targetShift.startTime).format('DD.MM.YYYY HH:mm')} — {dayjs(targetShift.endTime).format('HH:mm')}
            </Text>
          </div>
        </div>
      )}

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        <Form.Item
          name="myShiftId"
          label="Выберите вашу смену для обмена"
          rules={[{ required: true, message: 'Пожалуйста, выберите свою смену' }]}
        >
          <Select 
            placeholder="Выберите смену"
            loading={isLoadingMyShifts}
            disabled={isLoadingMyShifts || myShifts.length === 0}
            notFoundContent={isLoadingMyShifts ? <Spin size="small" /> : "У вас нет доступных смен для обмена"}
            options={myShifts.map(shift => ({
              value: shift.id,
              label: `${dayjs(shift.startTime).format('DD.MM.YYYY')} (${dayjs(shift.startTime).format('HH:mm')} - ${dayjs(shift.endTime).format('HH:mm')})`
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}