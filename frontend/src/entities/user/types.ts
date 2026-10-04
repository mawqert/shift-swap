export type Role = 'EMPLOYEE' | 'MANAGER';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}