import { User, UserRole } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { mockUsers } from '../api/mockData';

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [...mockUsers];

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.users.filter((u) => u.role === role);
  }

  async findByDepartment(department: string): Promise<User[]> {
    return this.users.filter((u) => u.department === department);
  }

  async save(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== id);
  }
}
