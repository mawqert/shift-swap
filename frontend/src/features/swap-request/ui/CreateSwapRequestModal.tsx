import { useState, useEffect } from 'react';
import { Modal, Form, Select, message, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import type { ShiftWithUser } from '@/entities/shift/types';

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

  const currentUserId = 101; 

  useEffect(() => {
    if (isOpen && targetShift) {
      setIsLoadingMyShifts(true);
      setTimeout(() => {
        const mockMyShifts: ShiftWithUser[] = [
          {
            id: 10,
            userId: 101,
            startTime: dayjs().add(3, 'day').hour(9).minute(0).second(0).format(),
            endTime: dayjs().add(3, 'day').hour(21).minute(0).second(0).format(),
          },
          {
            id: 11,
            userId: 101,
            startTime: dayjs().add(5, 'day').hour(9).minute(0).second(0).format(),
            endTime: dayjs().add(5, 'day').hour(21).minute(0).second(0).format(),
          }
        ];
        setMyShifts(mockMyShifts);
        setIsLoadingMyShifts(false);
      }, 500);
    } else {
      form.resetFields();
    }
  }, [isOpen, targetShift, form]);

  const handleSubmit = async (values: { myShiftId: number }) => {
    if (!targetShift) return;

    setIsSubmitting(true);
    
    const payload = {
      requesterShiftId: values.myShiftId,
      targetShiftId: targetShift.id
    };

    setTimeout(() => {
      setIsSubmitting(false);
      message.success('Запрос на замену успешно отправлен');
      onClose();
    }, 1000);
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