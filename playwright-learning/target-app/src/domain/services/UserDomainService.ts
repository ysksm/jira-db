import { User } from '../entities/User';

export class UserDomainService {
  canDeleteUser(user: User, currentUserRole: string): boolean {
    if (currentUserRole !== 'admin') return false;
    if (user.role === 'admin') return false;
    return true;
  }

  canChangeRole(user: User, currentUserRole: string): boolean {
    return currentUserRole === 'admin';
  }
}
