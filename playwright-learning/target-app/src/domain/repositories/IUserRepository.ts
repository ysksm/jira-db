import { User, UserRole } from '../entities/User';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByRole(role: UserRole): Promise<User[]>;
  findByDepartment(department: string): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
