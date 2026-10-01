import { useState } from 'react';
import { Typography, Button, Space, Card, Empty } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

const { Title, Text } = Typography;

export default function SchedulePage() {
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState(today.startOf('week')); 

  const mockShift = [
    { 
      id: 1, 
      user: { fullName: 'Иванов Иван' }, 
      startTime: today.format('YYYY-MM-DDTHH:mm:ss'),
      endTime: today.add(12, 'hour').format('YYYY-MM-DDTHH:mm:ss')
    }
  ];

  const prevWeek = () => setWeekStart(weekStart.subtract(1, 'week'));
  const nextWeek = () => setWeekStart(weekStart.add(1, 'week'));

  const weekDays = Array.from({ length: 7 }).map((_, i) => weekStart.add(i, 'day'));

  const selectedDateString = selectedDate.format('YYYY-MM-DD');
  const dailyShifts = mockShift.filter(shift => 
    shift.startTime.startsWith(selectedDateString)
  );

  const isSelectedToday = selectedDate.isSame(today, 'day');

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
            {dailyShifts.map(shift => (
              <Card key={shift.id} size="small">
                <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
                  {shift.user?.fullName}
                </Title>
                <Text type="secondary">
                  {dayjs(shift.startTime).format('HH:mm')} – {dayjs(shift.endTime).format('HH:mm')}
                </Text>
              </Card>
            ))}
          </Space>
        ) : (
          <Empty description="На этот день смен не назначено" style={{ marginTop: '40px' }} />
        )}
      </div>
    </div>
  );
}