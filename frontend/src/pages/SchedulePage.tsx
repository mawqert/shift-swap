import { useEffect, useState } from 'react';
import { Typography, Button, Space, Card, Empty } from 'antd';
import { LeftOutlined, RightOutlined, SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { ShiftWithUser } from '@/entities/shift/types';
import type { User } from '@/entities/user/types';
import { CreateSwapRequestModal } from '@/features/swap-request/ui/CreateSwapRequestModal';
import { api } from '@/shared/api/api';

dayjs.locale('ru');

const { Title, Text } = Typography;

export default function SchedulePage() {
  const [shifts, setShifts] = useState<ShiftWithUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [usersList, setUsersList] = useState<User[]>([]);
  
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState(today.startOf('week'));
  
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedTargetShift, setSelectedTargetShift] = useState<ShiftWithUser | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await api.get('/users/me');
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Ошибка получения юзера', error);
      }
    };
    
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsersList(response.data);
      } catch (error) {
        console.error('Ошибка получения списка юзеров', error);
      }
    };
    
    const fetchShifts = async () => {
      try {
        const response = await api.get('/shifts');
        setShifts(response.data);
      } catch (error) {
         console.error('Ошибка получения смен', error);
      }
    };

    fetchMe();
    fetchUsers();
    fetchShifts();
  }, []);

  const currentUserId = currentUser?.id;
  const isManager = currentUser?.role === 'MANAGER';

  const prevWeek = () => setWeekStart(weekStart.subtract(1, 'week'));
  const nextWeek = () => setWeekStart(weekStart.add(1, 'week'));

  const weekDays = Array.from({ length: 7 }).map((_, i) => weekStart.add(i, 'day'));
  const selectedDateString = selectedDate.format('YYYY-MM-DD');
  
  const dailyShifts = shifts.filter(shift => 
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
              
              const shiftOwner = shift.user || usersList.find(u => u.id === shift.userId);
              
              let employeeName = shiftOwner?.fullName || (shiftOwner as any)?.full_name;

              if (!employeeName && isMyShift) {
                employeeName = currentUser?.fullName;
              }

              employeeName = employeeName || `Сотрудник (ID: ${shift.userId})`;

              const displayName = isMyShift ? `${employeeName} (Вы)` : employeeName;
              
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
                        {displayName}
                      </Title>
                      <Text type="secondary">
                        {dayjs(shift.startTime).format('HH:mm')} – {dayjs(shift.endTime).format('HH:mm')}
                      </Text>
                    </div>
                    
                    {!isMyShift && !isManager && (
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