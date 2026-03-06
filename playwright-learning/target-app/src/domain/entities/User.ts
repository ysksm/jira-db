import { Email } from '../valueObjects/Email';
import { UserId } from '../valueObjects/UserId';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: UserId;
  name: string;
  email: Email;
  role: UserRole;
  department: string;
  isActive: boolean;
  createdAt: Date;
}
