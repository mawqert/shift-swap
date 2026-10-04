import type { Shift } from '@/entities/shift/types';
import type { User } from '@/entities/user/types';

export type SwapRequestStatus =
  | 'PENDING_COLLEAGUE'
  | 'PENDING_MANAGER'
  | 'APPROVED'
  | 'REJECTED';

export interface SwapRequest {
  id: number;
  requesterShiftId: number; 
  targetShiftId: number;    

  requesterUserId: number;
  targetUserId: number;

  status: SwapRequestStatus;
  managerId: number | null;
  createdAt: string;
}

export interface SwapRequestDetails extends SwapRequest {
  requesterUser: User;
  targetUser: User; 
  requesterShift: Shift;
  targetShift: Shift;
  manager?: User | null;
}