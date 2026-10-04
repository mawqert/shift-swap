import type { User } from '@/entities/user/types';

export interface Shift {
  id: number;
  userId: number;
  startTime: string;
  endTime: string;
}

export interface ShiftWithUser extends Shift {
  user?: User;
}