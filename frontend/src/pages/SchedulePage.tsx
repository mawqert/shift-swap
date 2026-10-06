import { useState } from 'react';
import { Typography, Button, Space, Card, Empty } from 'antd';
import { LeftOutlined, RightOutlined, SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { ShiftWithUser } from '@/entities/shift/types';
import { CreateSwapRequestModal } from '@/features/swap-request/ui/CreateSwapRequestModal';

dayjs.locale('ru');

const { Title, Text } = Typography;

export default function SchedulePage() {
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState(today.startOf('week'));
  
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedTargetShift, setSelectedTargetShift] = useState<ShiftWithUser | null>(null);

  const currentUserId = 101;

  const mockShifts: ShiftWithUser[] = [
    { 
      id: 1, 
      userId: 101,
      user: { id: 101, email: 'ivanov@test.com', fullName: 'Иванов Иван (Вы)', role: 'EMPLOYEE' }, 
      startTime: today.hour(9).minute(0).second(0).format(),
      endTime: today.hour(21).minute(0).second(0).format()
    },
    { 
      id: 3, 
      userId: 101,
      user: { id: 101, email: 'ivanov@test.com', fullName: 'Иванов Иван (Вы)', role: 'EMPLOYEE' }, 
      startTime: today.add(2, 'day').hour(9).minute(0).second(0).format(),
      endTime: today.add(2, 'day').hour(21).minute(0).second(0).format()
    },
    { 
      id: 2, 
      userId: 102,
      user: { id: 102, email: 'petrov@test.com', fullName: 'Петров Петр', role: 'EMPLOYEE' }, 
      startTime: today.add(1, 'day').hour(9).minute(0).second(0).format(),
      endTime: today.add(1, 'day').hour(21).minute(0).second(0).format()
    }
  ];

  const prevWeek = () => setWeekStart(weekStart.subtract(1, 'week'));
  const nextWeek = () => setWeekStart(weekStart.add(1, 'week'));

  const weekDays = Array.from({ length: 7 }).map((_, i) => weekStart.add(i, 'day'));
  const selectedDateString = selectedDate.format('YYYY-MM-DD');
  
  const dailyShifts = mockShifts.filter(shift => 
    shift.startTime.startsWith(selectedDateString)
  );

  const isSelectedToday = selectedDate.isSame(today, 'day');

  const handleRequestSwap = (shift: ShiftWithUser) => {
    setSelectedTargetShift(shift);
    setIsSwapModalOpen(true);
  };

  const handleCloseSwapModal = () => {
    setIsSwapModalOpen(false);
    setTimeout(() => setSelectedTargetShift(null), 300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Title level={2} style={{ marginTop: 0 }}>Общий график дежурств</Title>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#f5f5f5',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        <Button type="text" icon={<LeftOutlined />} onClick={prevWeek} />
        
        <Space size="middle" style={{ flex: 1, justifyContent: 'center' }}>
          {weekDays.map(day => {
            const isSelected = day.isSame(selectedDate, 'day');
            const isToday = day.isSame(today, 'day');
            
            return (
              <div 
                key={day.format('DD-MM')}
                onClick={() => setSelectedDate(day)}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: isSelected ? '#1677ff' : (isToday ? '#e6f4ff' : 'transparent'),
                  color: isSelected ? '#fff' : (isToday ? '#1677ff' : 'inherit'),
                  border: isToday && !isSelected ? '1px solid #1677ff' : '1px solid transparent',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <div style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                  {isToday ? 'Сегодня' : day.format('dd')}
                </div>
                <div style={{ fontSize: '14px', fontWeight: isSelected || isToday ? 'bold' : 'normal', marginTop: '4px' }}>
                  {day.format('DD.MM')}
                </div>
              </div>
            );
          })}
        </Space>

        <Button type="text" icon={<RightOutlined />} onClick={nextWeek} />
      </div>

      <Title level={4} style={{ textTransform: 'capitalize', marginTop: 0 }}>
        {isSelectedToday ? `Сегодня — ${selectedDate.format('dddd, DD.MM.YYYY')}` : selectedDate.format('dddd, DD.MM.YYYY')}
      </Title>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
        {dailyShifts.length > 0 ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            {dailyShifts.map(shift => {
              const isMyShift = shift.userId === currentUserId;
              
              return (
                <Card 
                  key={shift.id} 
                  size="small" 
                  style={{ transition: 'box-shadow 0.2s' }}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
                        {shift.user?.fullName}
                      </Title>
                      <Text type="secondary">
                        {dayjs(shift.startTime).format('HH:mm')} – {dayjs(shift.endTime).format('HH:mm')}
                      </Text>
                    </div>
                    {!isMyShift && (
                      <Button 
                        type="default" 
                        icon={<SwapOutlined />} 
                        onClick={() => handleRequestSwap(shift)}
                      >
                        Запросить замену
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </Space>
        ) : (
          <Empty description="На этот день смен не назначено" style={{ marginTop: '40px' }} />
        )}
      </div>

      <CreateSwapRequestModal 
        isOpen={isSwapModalOpen} 
        onClose={handleCloseSwapModal} 
        targetShift={selectedTargetShift} 
      />
    </div>
  );
}